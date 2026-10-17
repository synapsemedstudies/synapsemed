"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import { createInteractiveQuiz } from "@/actions/quizzes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { SubjectWithChapters } from "@/actions/notes";

export interface QuestionDraft {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D" | "";
  marks: number;
  negative_marks: number;
  chapter_slug: string;
  explanation: string;
}

interface InteractiveQuizBuilderProps {
  subjectsTree?: SubjectWithChapters[];
}

const STORAGE_KEY = "synapsemed_quiz_builder_draft";

export function InteractiveQuizBuilder({ subjectsTree = [] }: InteractiveQuizBuilderProps) {
  // Global Quiz Settings
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [batchId, setBatchId] = useState("batch-2025");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");

  // Default scoring applied to new questions
  const [defaultMarks, setDefaultMarks] = useState(4);
  const [defaultNegativeMarks, setDefaultNegativeMarks] = useState(1);

  // List of Questions
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: "q-1",
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "",
      marks: 4,
      negative_marks: 1,
      chapter_slug: "",
      explanation: "",
    },
  ]);

  // Submission state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    message: string;
    quizId?: string;
  } | null>(null);

  // Draft save status
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Available chapters for selected subject
  const availableChapters = useMemo(() => {
    if (!selectedSubjectId) return [];
    const sub = subjectsTree.find((s) => s.id === selectedSubjectId);
    return sub ? sub.chapters : [];
  }, [selectedSubjectId, subjectsTree]);

  // Restore draft on initial client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.durationMinutes) setDurationMinutes(parsed.durationMinutes);
        if (parsed.batchId) setBatchId(parsed.batchId);
        if (parsed.selectedSubjectId) setSelectedSubjectId(parsed.selectedSubjectId);
        if (parsed.selectedChapterId) setSelectedChapterId(parsed.selectedChapterId);
        if (parsed.defaultMarks) setDefaultMarks(parsed.defaultMarks);
        if (parsed.defaultNegativeMarks) setDefaultNegativeMarks(parsed.defaultNegativeMarks);
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          setQuestions(parsed.questions);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save draft whenever form values change
  useEffect(() => {
    try {
      const draft = {
        title,
        durationMinutes,
        batchId,
        selectedSubjectId,
        selectedChapterId,
        defaultMarks,
        defaultNegativeMarks,
        questions,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch {
      // ignore storage quota error
    }
  }, [title, durationMinutes, batchId, selectedSubjectId, selectedChapterId, defaultMarks, defaultNegativeMarks, questions]);

  const clearDraft = () => {
    if (confirm("Reset the entire quiz form? This will clear all typed questions.")) {
      localStorage.removeItem(STORAGE_KEY);
      setTitle("");
      setDurationMinutes(15);
      setSelectedSubjectId("");
      setSelectedChapterId("");
      setQuestions([
        {
          id: `q-${Date.now()}`,
          question_text: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_option: "",
          marks: defaultMarks,
          negative_marks: defaultNegativeMarks,
          chapter_slug: "",
          explanation: "",
        },
      ]);
      setPublishResult(null);
    }
  };

  // Add Question
  const handleAddQuestion = useCallback(() => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "",
        marks: defaultMarks,
        negative_marks: defaultNegativeMarks,
        chapter_slug: "",
        explanation: "",
      },
    ]);
  }, [defaultMarks, defaultNegativeMarks]);

  // Duplicate Question
  const handleDuplicateQuestion = (index: number) => {
    setQuestions((prev) => {
      const target = prev[index];
      const copy: QuestionDraft = {
        ...target,
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      const updated = [...prev];
      updated.splice(index + 1, 0, copy);
      return updated;
    });
  };

  // Remove Question
  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert("A quiz must have at least one question.");
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // Move Question Up/Down
  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === questions.length - 1)) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    setQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Update specific question field
  const updateQuestion = (index: number, field: keyof QuestionDraft, value: unknown) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Apply default marks to all questions
  const applyDefaultsToAll = () => {
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        marks: defaultMarks,
        negative_marks: defaultNegativeMarks,
      }))
    );
  };

  // Validation checks
  const validationSummary = useMemo(() => {
    const issues: { index: number; reason: string }[] = [];

    if (!title.trim()) {
      issues.push({ index: -1, reason: "Quiz title is missing" });
    }

    questions.forEach((q, idx) => {
      const qNum = idx + 1;
      if (!q.question_text.trim()) {
        issues.push({ index: idx, reason: `Q${qNum}: Question stem cannot be empty` });
      }
      if (!q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
        issues.push({ index: idx, reason: `Q${qNum}: All 4 options (A, B, C, D) must have text` });
      }
      if (!q.correct_option) {
        issues.push({ index: idx, reason: `Q${qNum}: No correct option (A, B, C, or D) selected` });
      }
      if (q.marks <= 0) {
        issues.push({ index: idx, reason: `Q${qNum}: Positive marks must be greater than 0` });
      }
      if (q.negative_marks < 0) {
        issues.push({ index: idx, reason: `Q${qNum}: Negative marks cannot be negative` });
      }
    });

    const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

    return {
      isValid: issues.length === 0,
      issues,
      totalMarks,
    };
  }, [title, questions]);

  // Publish Form
  const handlePublish = async () => {
    if (!validationSummary.isValid) {
      alert(`Please resolve form validation issues:\n• ${validationSummary.issues.map((i) => i.reason).join("\n• ")}`);
      return;
    }

    setIsPublishing(true);
    setPublishResult(null);

    // Resolve chapter slug if chapter is selected from dropdown
    let resolvedChapterSlug: string | null = null;
    if (selectedChapterId) {
      const ch = availableChapters.find((c) => c.id === selectedChapterId);
      if (ch) resolvedChapterSlug = ch.slug;
    }

    const payload = {
      title: title.trim(),
      duration_minutes: durationMinutes,
      batch_id: batchId,
      subject_id: selectedSubjectId || null,
      chapter_id: selectedChapterId || null,
      is_published: true,
      questions: questions.map((q) => ({
        id: q.id,
        question_text: q.question_text.trim(),
        option_a: q.option_a.trim(),
        option_b: q.option_b.trim(),
        option_c: q.option_c.trim(),
        option_d: q.option_d.trim(),
        correct_option: q.correct_option as "A" | "B" | "C" | "D",
        marks: Number(q.marks) || 4,
        negative_marks: Number(q.negative_marks) || 1,
        chapter_slug: q.chapter_slug?.trim() || resolvedChapterSlug || null,
        explanation: q.explanation?.trim() || null,
      })),
    };

    const res = await createInteractiveQuiz(payload);
    setIsPublishing(false);

    if (res.success) {
      setPublishResult({
        success: true,
        message: `Quiz "${title}" published with ${res.totalQuestions} questions!`,
        quizId: res.quizId,
      });
      localStorage.removeItem(STORAGE_KEY);
    } else {
      setPublishResult({
        success: false,
        message: res.error || "Failed to publish quiz",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Top Banner Notice / Success */}
      {publishResult && (
        <div
          className={cn(
            "p-4 rounded-2xl text-xs font-medium flex items-center justify-between gap-4 transition-all shadow-lg",
            publishResult.success
              ? "bg-emerald-500/15 border border-emerald-400/30 text-emerald-300"
              : "bg-rose-500/15 border border-rose-400/30 text-rose-300"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px]">
              {publishResult.success ? "task_alt" : "error"}
            </span>
            <div>
              <div className="font-['Space_Grotesk'] font-bold text-sm">
                {publishResult.success ? "Quiz Successfully Created & Published!" : "Publishing Error"}
              </div>
              <div className="text-slate-300 text-xs mt-0.5">{publishResult.message}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {publishResult.success && (
              <Link
                href="/dashboard/quizzes"
                className="px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 font-['Space_Grotesk'] font-bold text-xs hover:bg-emerald-300 transition-colors flex items-center gap-1.5"
              >
                <span>Student Quiz Center</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            )}
            <button
              onClick={() => setPublishResult(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Header Settings Card (Google Forms Style Header) */}
      <GlassCard className="p-6 sm:p-8 relative overflow-hidden border-indigo-500/20">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-[22px]">
                dynamic_form
              </span>
              <h2 className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-white tracking-tight">
                Interactive Quiz Creator
              </h2>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Google Forms-style interactive question editor with immediate validation &amp; student mistake tagging.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {lastSaved && (
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Draft saved ({lastSaved})
              </span>
            )}
            <button
              type="button"
              onClick={clearDraft}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 text-slate-400 text-[11px] font-['Space_Grotesk'] font-semibold transition-all"
            >
              Reset Form
            </button>
          </div>
        </div>

        {/* Quiz Meta Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Quiz Title */}
          <div className="md:col-span-12">
            <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Quiz Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cardiovascular Murmurs & Diagnostic Maneuvers Assessment"
              className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/[0.12] text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/80 focus:bg-white/[0.06] transition-all"
            />
          </div>

          {/* Duration & Presets */}
          <div className="md:col-span-6 flex flex-col gap-2">
            <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 uppercase tracking-wider">
              Time Limit (Minutes)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="360"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                className="w-24 h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.12] text-white text-xs font-mono font-bold focus:outline-none focus:border-indigo-400/80 text-center"
              />
              <div className="flex items-center gap-1.5">
                {[10, 15, 20, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-['Space_Grotesk'] font-semibold transition-all",
                      durationMinutes === mins
                        ? "bg-indigo-500/30 text-indigo-200 border border-indigo-400/40"
                        : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                    )}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Batch Selector */}
          <div className="md:col-span-6 flex flex-col gap-2">
            <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 uppercase tracking-wider">
              Assigned Cohort Batch
            </label>
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="batch-2025"
              className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.12] text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/80"
            />
          </div>

          {/* Subject & Chapter Link (Optional) */}
          {subjectsTree.length > 0 && (
            <>
              <div className="md:col-span-6 flex flex-col gap-1.5">
                <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 uppercase tracking-wider">
                  Link to Subject <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedChapterId("");
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-[#0c0e1a] border border-white/[0.12] text-white text-xs focus:outline-none focus:border-indigo-400/80"
                >
                  <option value="">— General / Multi-Subject —</option>
                  {subjectsTree.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-6 flex flex-col gap-1.5">
                <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 uppercase tracking-wider">
                  Link to Chapter <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <select
                  disabled={!selectedSubjectId}
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#0c0e1a] border border-white/[0.12] text-white text-xs focus:outline-none focus:border-indigo-400/80 disabled:opacity-40"
                >
                  <option value="">— Select Chapter —</option>
                  {availableChapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.title} ({ch.slug})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Global Default Scoring Scheme */}
          <div className="md:col-span-12 p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="text-xs font-['Space_Grotesk'] font-bold text-slate-300 uppercase tracking-wider">
                Default Question Scoring:
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-medium">Correct:</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={defaultMarks}
                    onChange={(e) => setDefaultMarks(Number(e.target.value))}
                    className="w-16 h-8 px-2 rounded-lg bg-black/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold text-center"
                  />
                  <span className="text-xs text-slate-500">marks</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-medium">Penalty:</span>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={defaultNegativeMarks}
                    onChange={(e) => setDefaultNegativeMarks(Number(e.target.value))}
                    className="w-16 h-8 px-2 rounded-lg bg-black/40 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold text-center"
                  />
                  <span className="text-xs text-slate-500">marks</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={applyDefaultsToAll}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-['Space_Grotesk'] font-semibold transition-all self-start sm:self-auto"
            >
              Apply to All Questions
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Dynamic Question Cards List (Google Forms Style) */}
      <div className="flex flex-col gap-6">
        {questions.map((q, index) => {
          const qNum = index + 1;
          const isStemEmpty = !q.question_text.trim();
          const isCorrectMissing = !q.correct_option;

          return (
            <div
              key={q.id}
              className="p-6 rounded-2xl bg-slate-900/85 border border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all hover:border-white/20 relative group"
            >
              {/* Question Top Card Action Bar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-['Space_Grotesk'] font-bold text-xs shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                    #{qNum}
                  </div>
                  <div>
                    <span className="text-xs font-['Space_Grotesk'] font-bold text-white uppercase tracking-wider">
                      Question {qNum}
                    </span>
                    {q.correct_option ? (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono font-bold">
                        Ans: Option {q.correct_option}
                      </span>
                    ) : (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-mono">
                        Select Correct Answer
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions: Move, Duplicate, Delete */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveQuestion(index, "up")}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                    title="Move Question Up"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>
                  <button
                    type="button"
                    disabled={index === questions.length - 1}
                    onClick={() => handleMoveQuestion(index, "down")}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                    title="Move Question Down"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateQuestion(index)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-indigo-300"
                    title="Duplicate Question"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                  <button
                    type="button"
                    disabled={questions.length <= 1}
                    onClick={() => handleDeleteQuestion(index)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 disabled:opacity-20 disabled:hover:bg-transparent"
                    title="Delete Question"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              {/* Question Textarea (Stem) */}
              <div className="mb-5">
                <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 mb-1.5">
                  Question Stem / Prompt <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={q.question_text}
                  onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                  placeholder="Enter the question text or clinical vignette here..."
                  className={cn(
                    "w-full p-3.5 rounded-xl bg-white/[0.04] border text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:bg-white/[0.06] transition-all resize-y",
                    isStemEmpty && !publishResult
                      ? "border-white/[0.12] focus:border-indigo-400"
                      : "border-white/[0.12] focus:border-indigo-400"
                  )}
                />
              </div>

              {/* Options A, B, C, D Grid (Google Forms Style with Click-to-Mark-Correct) */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-['Space_Grotesk'] font-semibold text-slate-300">
                    Multiple Choice Options <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Click radio button to mark correct answer
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(["A", "B", "C", "D"] as const).map((optKey) => {
                    const fieldKey = `option_${optKey.toLowerCase()}` as "option_a" | "option_b" | "option_c" | "option_d";
                    const isSelected = q.correct_option === optKey;
                    const optVal = q[fieldKey];

                    return (
                      <div
                        key={optKey}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-xl border transition-all",
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.15)]"
                            : "bg-white/[0.02] border-white/[0.08] hover:border-white/20"
                        )}
                      >
                        {/* Radio selector for Correct Answer */}
                        <button
                          type="button"
                          onClick={() => updateQuestion(index, "correct_option", optKey)}
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-['Space_Grotesk'] font-bold text-xs transition-all",
                            isSelected
                              ? "bg-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                              : "bg-white/10 text-slate-300 hover:bg-white/20"
                          )}
                          title={`Mark Option ${optKey} as Correct`}
                        >
                          {isSelected ? (
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          ) : (
                            optKey
                          )}
                        </button>

                        {/* Input text for Option */}
                        <input
                          type="text"
                          value={optVal}
                          onChange={(e) => updateQuestion(index, fieldKey, e.target.value)}
                          placeholder={`Option ${optKey} text...`}
                          className="w-full h-8 px-2.5 rounded-lg bg-transparent text-white text-xs placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Collapsible Details: Explanation, Slug & Scoring overrides */}
              <div className="pt-4 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Positive & Negative Marks */}
                <div className="md:col-span-4 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-['Space_Grotesk'] font-bold uppercase text-slate-400 mb-1">
                      + Marks
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={q.marks}
                      onChange={(e) => updateQuestion(index, "marks", Number(e.target.value))}
                      className="w-full h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-emerald-300 font-mono font-bold text-xs focus:outline-none focus:border-indigo-400 text-center"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-['Space_Grotesk'] font-bold uppercase text-slate-400 mb-1">
                      - Penalty
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={q.negative_marks}
                      onChange={(e) => updateQuestion(index, "negative_marks", Number(e.target.value))}
                      className="w-full h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-rose-300 font-mono font-bold text-xs focus:outline-none focus:border-indigo-400 text-center"
                    />
                  </div>
                </div>

                {/* Chapter Slug / Note deep link */}
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-['Space_Grotesk'] font-bold uppercase text-slate-400 mb-1">
                    Chapter Slug <span className="text-slate-500 font-normal lowercase">(for mistake notes)</span>
                  </label>
                  <input
                    type="text"
                    value={q.chapter_slug}
                    onChange={(e) => updateQuestion(index, "chapter_slug", e.target.value)}
                    placeholder="e.g. cardio-ch01-valvular"
                    className="w-full h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-indigo-300 font-mono text-[11px] focus:outline-none focus:border-indigo-400"
                  />
                </div>

                {/* Clinical Explanation / Rationale */}
                <div className="md:col-span-5">
                  <label className="block text-[10px] font-['Space_Grotesk'] font-bold uppercase text-slate-400 mb-1">
                    Answer Explanation / Rationale
                  </label>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => updateQuestion(index, "explanation", e.target.value)}
                    placeholder="Clinical rationale shown upon grading..."
                    className="w-full h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-slate-300 text-xs focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating / Sticky Bottom Toolbar (Google Forms Action Bar) */}
      <div className="sticky bottom-4 z-30">
        <div className="p-4 rounded-2xl bg-[#090b14]/90 backdrop-blur-xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Summary Metrics */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-4 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_16px_rgba(99,102,241,0.4)]"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Add Question</span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-white/10 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.06] text-slate-300 font-semibold">
                {questions.length} Question{questions.length > 1 ? "s" : ""}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-semibold">
                {validationSummary.totalMarks} Total Marks
              </span>
              <span className="hidden sm:inline px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 font-semibold">
                {durationMinutes} Mins
              </span>
            </div>
          </div>

          {/* Right: Validation Status & Publish Button */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {!validationSummary.isValid && (
              <span className="text-[11px] text-amber-300 font-mono hidden md:inline">
                {validationSummary.issues.length} incomplete field{validationSummary.issues.length > 1 ? "s" : ""}
              </span>
            )}

            <button
              type="button"
              disabled={!validationSummary.isValid || isPublishing}
              onClick={handlePublish}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                validationSummary.isValid
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 active:scale-95 shadow-[0_4px_20px_rgba(52,211,153,0.35)] cursor-pointer"
                  : "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
              )}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isPublishing ? "hourglass_top" : "publish"}
              </span>
              <span>{isPublishing ? "Publishing Transaction..." : "Publish Quiz to Cohort"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
