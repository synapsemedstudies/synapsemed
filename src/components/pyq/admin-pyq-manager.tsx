"use client";

import React, { useState } from "react";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import { FormattedContent } from "@/components/ui/formatted-content";
import type { SubjectWithPYQChapters, CreatePYQInput } from "@/actions/pyq";
import {
  createSubject,
  createChapter,
  createPYQQuestion,
  deletePYQQuestion,
  getChapterPYQs,
  importPYQsBulk,
} from "@/actions/pyq";
import type { PYQQuestion } from "@/db/schema";
import * as XLSX from "xlsx";

interface AdminPYQManagerProps {
  initialTree: SubjectWithPYQChapters[];
}

export function AdminPYQManager({ initialTree }: AdminPYQManagerProps) {
  const [tree, setTree] = useState<SubjectWithPYQChapters[]>(initialTree);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialTree[0]?.id || ""
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    initialTree[0]?.chapters[0]?.id || ""
  );

  // Active view: manual create vs bulk import
  const [activeTab, setActiveTab] = useState<"create" | "import">("create");

  // Chapter questions state
  const [questions, setQuestions] = useState<PYQQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Manual Question Form
  const [questionType, setQuestionType] = useState<"laq" | "saq" | "case">("laq");
  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState<number>(10);
  const [repeatYears, setRepeatYears] = useState("2024, 2022, 2019");
  const [examName, setExamName] = useState("University Exam");
  const [modelAnswer, setModelAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Subject & Chapter Form
  const [newSubjectTitle, setNewSubjectTitle] = useState("");
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterSlug, setNewChapterSlug] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Excel Bulk Import state
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<CreatePYQInput[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Load questions when selectedChapterId changes
  const loadQuestions = React.useCallback(async (chapId: string) => {
    if (!chapId) return;
    setLoadingQuestions(true);
    try {
      const data = await getChapterPYQs(chapId);
      setQuestions(data);
    } catch (err) {
      console.error("Failed to load questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  React.useEffect(() => {
    if (selectedChapterId) {
      loadQuestions(selectedChapterId);
    }
  }, [selectedChapterId, loadQuestions]);

  const activeSubject = tree.find((s) => s.id === selectedSubjectId);
  const activeChapter = activeSubject?.chapters.find((c) => c.id === selectedChapterId);

  // Handle Question Type Change - automatically adjust default marks
  const handleTypeChange = (type: "laq" | "saq" | "case") => {
    setQuestionType(type);
    if (type === "laq") setMarks(10);
    else if (type === "saq") setMarks(5);
    else if (type === "case") setMarks(10);
  };

  // Submit single question
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !selectedChapterId) {
      setStatusMessage({ type: "error", text: "Please select a Subject and Chapter first." });
      return;
    }
    if (!questionText.trim() || !modelAnswer.trim()) {
      setStatusMessage({ type: "error", text: "Question text and Model answer are required." });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await createPYQQuestion({
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId,
      questionType,
      questionText: questionText.trim(),
      marks,
      repeatYears: repeatYears.trim(),
      examName: examName.trim(),
      modelAnswer: modelAnswer.trim(),
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setStatusMessage({ type: "success", text: "PYQ question created successfully!" });
      setQuestionText("");
      setModelAnswer("");
      // Add to local state
      setQuestions((prev) => [res.data!, ...prev]);
      // Update count in tree
      setTree((prev) =>
        prev.map((s) =>
          s.id === selectedSubjectId
            ? {
                ...s,
                chapters: s.chapters.map((c) =>
                  c.id === selectedChapterId ? { ...c, pyqCount: c.pyqCount + 1 } : c
                ),
              }
            : s
        )
      );
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to create question." });
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    const res = await deletePYQQuestion(questionId);
    if (res.success) {
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setTree((prev) =>
        prev.map((s) =>
          s.id === selectedSubjectId
            ? {
                ...s,
                chapters: s.chapters.map((c) =>
                  c.id === selectedChapterId
                    ? { ...c, pyqCount: Math.max(0, c.pyqCount - 1) }
                    : c
                ),
              }
            : s
        )
      );
    } else {
      alert(res.error || "Failed to delete question");
    }
  };

  // Create Subject
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectTitle.trim()) return;

    const res = await createSubject(newSubjectTitle);
    if (res.success && res.data) {
      setTree((prev) => [...prev, { ...res.data!, chapters: [] }]);
      setSelectedSubjectId(res.data.id);
      setNewSubjectTitle("");
      setStatusMessage({ type: "success", text: `Subject "${res.data.title}" added!` });
    }
  };

  // Create Chapter
  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !newChapterTitle.trim() || !newChapterSlug.trim()) return;

    const res = await createChapter(selectedSubjectId, newChapterTitle, newChapterSlug);
    if (res.success && res.data) {
      const newCh = { ...res.data, pyqCount: 0 };
      setTree((prev) =>
        prev.map((s) =>
          s.id === selectedSubjectId
            ? { ...s, chapters: [...s.chapters, newCh] }
            : s
        )
      );
      setSelectedChapterId(res.data.id);
      setNewChapterTitle("");
      setNewChapterSlug("");
      setStatusMessage({ type: "success", text: `Chapter "${res.data.title}" added!` });
    }
  };

  // Handle Excel File Parsing
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);
    setParseErrors([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

        if (rawJson.length === 0) {
          setParseErrors(["Spreadsheet has no rows"]);
          return;
        }

        const valid: CreatePYQInput[] = [];
        const errs: string[] = [];

        rawJson.forEach((row, idx) => {
          const rowNum = idx + 2;
          const qText = String(row["question_text"] || row["question"] || "").trim();
          const ans = String(row["model_answer"] || row["answer"] || "").trim();
          let type = String(row["question_type"] || row["type"] || "saq").toLowerCase().trim();
          if (type !== "laq" && type !== "saq" && type !== "case") {
            type = "saq";
          }
          const m = Number(row["marks"]) || (type === "laq" ? 10 : 5);
          const years = String(row["repeat_years"] || row["years"] || "").trim();
          const exam = String(row["exam_name"] || row["exam"] || "University Exam").trim();

          if (!qText) {
            errs.push(`Row ${rowNum}: Missing question text`);
          } else if (!ans) {
            errs.push(`Row ${rowNum}: Missing model answer`);
          } else {
            valid.push({
              subjectId: selectedSubjectId,
              chapterId: selectedChapterId,
              questionType: type as "laq" | "saq" | "case",
              questionText: qText,
              marks: m,
              repeatYears: years,
              examName: exam,
              modelAnswer: ans,
            });
          }
        });

        setParsedRows(valid);
        setParseErrors(errs);
      } catch (err) {
        setParseErrors(["Could not parse Excel spreadsheet. Make sure it is valid .xlsx"]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Submit Excel Batch
  const handleBatchImport = async () => {
    if (parsedRows.length === 0 || !selectedChapterId) return;

    setIsImporting(true);
    const res = await importPYQsBulk(parsedRows);
    setIsImporting(false);

    if (res.success) {
      setStatusMessage({
        type: "success",
        text: `Successfully imported ${res.insertedCount} questions!`,
      });
      setExcelFile(null);
      setParsedRows([]);
      loadQuestions(selectedChapterId);
      setActiveTab("create");
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to import rows." });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`px-4 py-3 rounded-xl border text-sm font-['Space_Grotesk'] flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs uppercase hover:underline opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Syllabus Hierarchy (Subjects & Chapters) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <GlassCard className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-['Space_Grotesk'] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-[18px]">
                  account_tree
                </span>
                <span>Syllabus Structure</span>
              </h2>
            </div>

            {/* Subject Selector */}
            <div>
              <label className="text-[11px] font-['Space_Grotesk'] font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                Select Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  const subId = e.target.value;
                  setSelectedSubjectId(subId);
                  const sub = tree.find((s) => s.id === subId);
                  if (sub && sub.chapters.length > 0) {
                    setSelectedChapterId(sub.chapters[0].id);
                  } else {
                    setSelectedChapterId("");
                  }
                }}
                className="w-full bg-[#0c0e1a]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              >
                {tree.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.title} ({s.chapters.reduce((acc, c) => acc + c.pyqCount, 0)} questions)
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter List */}
            <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
              <label className="text-[11px] font-['Space_Grotesk'] font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                Chapters in Subject
              </label>
              {activeSubject?.chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between ${
                    selectedChapterId === ch.id
                      ? "liquid-btn-primary text-white font-semibold"
                      : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-white/5"
                  }`}
                >
                  <span className="truncate pr-2">{ch.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 shrink-0">
                    {ch.pyqCount}
                  </span>
                </button>
              ))}

              {(!activeSubject || activeSubject.chapters.length === 0) && (
                <p className="text-xs text-slate-500 italic p-2">No chapters created yet.</p>
              )}
            </div>

            {/* Quick Add Subject / Chapter Toggles */}
            <div className="border-t border-white/10 pt-3 flex flex-col gap-3">
              {/* Add Chapter Form */}
              <form onSubmit={handleCreateChapter} className="flex flex-col gap-2">
                <span className="text-[10px] font-['Space_Grotesk'] font-semibold text-slate-400 uppercase tracking-wider">
                  + Add Chapter to Current Subject
                </span>
                <input
                  type="text"
                  placeholder="Chapter Title (e.g. Inguinal Canal)"
                  value={newChapterTitle}
                  onChange={(e) => {
                    setNewChapterTitle(e.target.value);
                    if (!newChapterSlug) {
                      setNewChapterSlug(
                        e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                      );
                    }
                  }}
                  className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="slug (e.g. inguinal-canal)"
                    value={newChapterSlug}
                    onChange={(e) => setNewChapterSlug(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 flex-1 focus:outline-none focus:border-indigo-400 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg liquid-glass-card hover:bg-white/15 text-xs font-semibold text-white transition-all shrink-0"
                  >
                    Add
                  </button>
                </div>
              </form>

              {/* Add Subject Form */}
              <form onSubmit={handleCreateSubject} className="flex flex-col gap-2 border-t border-white/5 pt-2">
                <span className="text-[10px] font-['Space_Grotesk'] font-semibold text-slate-400 uppercase tracking-wider">
                  + Add New Subject
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Subject Title (e.g. Microbiology)"
                    value={newSubjectTitle}
                    onChange={(e) => setNewSubjectTitle(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 flex-1 focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg liquid-glass-card hover:bg-white/15 text-xs font-semibold text-white transition-all shrink-0"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Question Creator & Excel Ingestion */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <GlassCard className="p-6 flex flex-col gap-5">
            {/* Tab Selector */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-['Space_Grotesk'] font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-400 text-[20px]">
                    post_add
                  </span>
                  <span>
                    Manage PYQs &bull;{" "}
                    <span className="text-indigo-300">{activeChapter?.title || "Select Chapter"}</span>
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add past university exam questions with structured model answers.
                </p>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl liquid-glass-subtle">
                <button
                  type="button"
                  onClick={() => setActiveTab("create")}
                  className={`px-3 py-1 rounded-lg text-xs font-['Space_Grotesk'] font-semibold transition-all ${
                    activeTab === "create"
                      ? "liquid-pill-active text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Manual Form
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("import")}
                  className={`px-3 py-1 rounded-lg text-xs font-['Space_Grotesk'] font-semibold transition-all ${
                    activeTab === "import"
                      ? "liquid-pill-active text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Excel Bulk Upload
                </button>
              </div>
            </div>

            {/* TAB 1: Manual Question Form */}
            {activeTab === "create" && (
              <form onSubmit={handleCreateQuestion} className="flex flex-col gap-4">
                {/* Row 1: Question Type, Marks, Exam Name */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-['Space_Grotesk'] font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                      Question Type
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTypeChange("laq")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          questionType === "laq"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white/5 hover:bg-white/10 text-slate-300"
                        }`}
                      >
                        LAQ (Essay)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTypeChange("saq")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          questionType === "saq"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white/5 hover:bg-white/10 text-slate-300"
                        }`}
                      >
                        SAQ (Note)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTypeChange("case")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          questionType === "case"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white/5 hover:bg-white/10 text-slate-300"
                        }`}
                      >
                        Case
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-['Space_Grotesk'] font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                      Marks Allocation
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={25}
                      value={marks}
                      onChange={(e) => setMarks(Number(e.target.value))}
                      className="w-full bg-[#0c0e1a]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-['Space_Grotesk'] font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                      Repeat Years / Exam Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2024, 2022, 2019"
                      value={repeatYears}
                      onChange={(e) => setRepeatYears(e.target.value)}
                      className="w-full bg-[#0c0e1a]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
                    />
                  </div>
                </div>

                {/* Row 2: Question Text */}
                <div>
                  <label className="text-[11px] font-['Space_Grotesk'] font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                    Question Stem (Exact university question text)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Describe the Brachial Plexus under: Formation, Cords, and Branches. Discuss clinical features of Erb's Palsy."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full bg-[#0c0e1a]/80 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 leading-relaxed"
                  />
                </div>

                {/* Row 3: Model Answer */}
                <div>
                  <label className="text-[11px] font-['Space_Grotesk'] font-semibold text-slate-300 uppercase tracking-wider mb-1 block">
                    Structured Model Answer (Markdown supported with bold headings and bullets)
                  </label>
                  <textarea
                    rows={8}
                    placeholder="### 1. Introduction & Formation&#10;Formed by anterior rami of C5-T1...&#10;&#10;### 2. Clinical Features&#10;* Waiter's tip hand&#10;* Pronated forearm"
                    value={modelAnswer}
                    onChange={(e) => setModelAnswer(e.target.value)}
                    className="w-full bg-[#0c0e1a]/80 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-400 leading-relaxed"
                  />
                </div>

                {/* Submit button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-[0_4px_16px_rgba(99,102,241,0.35)] disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_task</span>
                    <span>{isSubmitting ? "Saving Question..." : "Save PYQ Question"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Excel Bulk Upload */}
            {activeTab === "import" && (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-xl border border-dashed border-white/20 bg-white/[0.02] flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-indigo-400 text-[32px] mb-2">
                    upload_file
                  </span>
                  <p className="text-xs text-white font-medium mb-1">
                    Select an Excel (.xlsx) file with university questions
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-md mb-4">
                    Columns: <code>question_text</code>, <code>model_answer</code>,{" "}
                    <code>question_type</code> (laq/saq/case), <code>marks</code>, <code>repeat_years</code>.
                  </p>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleExcelUpload}
                    className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Errors display */}
                {parseErrors.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    <p className="font-bold mb-1">Validation Errors:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {parseErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Parsed Rows Preview */}
                {parsedRows.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-300 font-semibold">
                        Ready to import {parsedRows.length} questions into{" "}
                        {activeChapter?.title}
                      </span>
                      <button
                        type="button"
                        onClick={handleBatchImport}
                        disabled={isImporting}
                        className="px-4 py-2 rounded-xl liquid-btn-primary text-white text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        {isImporting ? "Importing..." : "Confirm & Import All"}
                      </button>
                    </div>

                    <div className="max-h-56 overflow-y-auto rounded-xl border border-white/10">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white/5 border-b border-white/10 text-slate-300 font-mono">
                          <tr>
                            <th className="p-2">Type</th>
                            <th className="p-2">Marks</th>
                            <th className="p-2">Years</th>
                            <th className="p-2">Question</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {parsedRows.slice(0, 10).map((r, i) => (
                            <tr key={i} className="hover:bg-white/[0.02]">
                              <td className="p-2 uppercase font-mono text-[10px]">{r.questionType}</td>
                              <td className="p-2">{r.marks}M</td>
                              <td className="p-2 font-mono text-[10px]">{r.repeatYears}</td>
                              <td className="p-2 truncate max-w-xs">{r.questionText}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCard>

          {/* Section: Existing Questions in Chapter */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-['Space_Grotesk'] font-bold text-white uppercase tracking-wider">
                Existing Questions ({questions.length})
              </h3>
              {loadingQuestions && <span className="text-xs text-indigo-300 animate-pulse">Loading...</span>}
            </div>

            {questions.length === 0 && !loadingQuestions && (
              <GlassCard className="p-6 text-center text-slate-400 text-xs">
                No PYQ questions added for this chapter yet. Use the form above to add the first question!
              </GlassCard>
            )}

            <div className="flex flex-col gap-3">
              {questions.map((q) => (
                <ReadingSurface key={q.id} className="p-4 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-['Space_Grotesk'] font-bold uppercase ${
                          q.questionType === "laq"
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : q.questionType === "case"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                        }`}
                      >
                        {q.questionType === "laq"
                          ? "Long Essay (LAQ)"
                          : q.questionType === "case"
                          ? "Clinical Case"
                          : "Short Note (SAQ)"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-bold text-slate-200">
                        {q.marks} Marks
                      </span>
                      {q.repeatYears && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-sky-300 font-['Space_Grotesk']">
                          <span className="material-symbols-outlined text-[12px] text-sky-400">history</span>
                          <span>Exam: {q.repeatYears}</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                      title="Delete question"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>

                  <div className="text-xs font-semibold text-white leading-relaxed">
                    <FormattedContent content={q.questionText} />
                  </div>

                  <details className="mt-1 group">
                    <summary className="text-[11px] font-semibold text-indigo-400 cursor-pointer select-none hover:underline inline-flex items-center gap-1">
                      <span>View Model Answer</span>
                    </summary>
                    <div className="mt-2.5 pt-2.5 border-t border-white/10 text-xs bg-black/20 p-3 rounded-lg">
                      <FormattedContent content={q.modelAnswer} />
                    </div>
                  </details>
                </ReadingSurface>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
