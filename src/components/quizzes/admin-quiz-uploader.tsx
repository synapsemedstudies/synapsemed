"use client";

import React, { useState } from "react";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import * as XLSX from "xlsx";
import {
  validateQuizRows,
  type QuizRow,
  type RowValidationError,
} from "@/lib/validators/quiz";
import { createQuizFromExcel } from "@/actions/quizzes";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function AdminQuizUploader() {
  const [quizTitle, setQuizTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [batchId, setBatchId] = useState("batch-2025");
  const [parsedRows, setParsedRows] = useState<QuizRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<RowValidationError[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Parse dropped or selected .xlsx file
  const handleFile = async (file: File) => {
    setFileName(file.name);
    setPublishResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: "",
      });

      if (rawRows.length === 0) {
        setValidationErrors([
          {
            rowNumber: 1,
            field: "workbook",
            message: "Spreadsheet is empty. No question rows found.",
          },
        ]);
        setParsedRows([]);
        return;
      }

      const { validRows, errors } = validateQuizRows(rawRows);
      setParsedRows(validRows);
      setValidationErrors(errors);

      if (!quizTitle) {
        // Auto-fill title from file name
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setQuizTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    } catch {
      setValidationErrors([
        {
          rowNumber: 0,
          field: "file",
          message: "Failed to parse .xlsx file. Please ensure it is a valid Excel workbook.",
        },
      ]);
      setParsedRows([]);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // Submit to Server Action
  const handlePublish = async () => {
    if (!quizTitle.trim() || parsedRows.length === 0 || validationErrors.length > 0) {
      return;
    }

    setIsPublishing(true);
    setPublishResult(null);

    const res = await createQuizFromExcel({
      title: quizTitle.trim(),
      durationMinutes,
      batchId,
      isPublished: true,
      rows: parsedRows,
    });

    setIsPublishing(false);

    if (res.success) {
      setPublishResult({
        success: true,
        message: `Quiz "${quizTitle}" published successfully with ${res.totalQuestions} questions!`,
      });
      setParsedRows([]);
      setFileName(null);
      setQuizTitle("");
    } else {
      setPublishResult({
        success: false,
        message: res.error || "Failed to publish quiz to database",
      });
    }
  };

  const isValidForPublish =
    parsedRows.length > 0 && validationErrors.length === 0 && quizTitle.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action Bar with Template Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Space_Grotesk'] text-lg font-bold text-white">
            Excel-to-Quiz Ingestion Pipeline
          </h2>
          <p className="text-slate-400 text-xs">
            Client-side SheetJS validation &amp; single-transaction Drizzle database ingestion.
          </p>
        </div>

        <a
          href="/api/download-template"
          download="sample_quiz_upload_template.xlsx"
          className="px-4 py-2 rounded-xl liquid-glass-subtle hover:border-white/20 text-white text-xs font-['Space_Grotesk'] font-semibold flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px] text-emerald-400">
            download
          </span>
          <span>Download Sample .xlsx Template</span>
        </a>
      </div>

      {/* Success / Error Notification */}
      {publishResult && (
        <div
          className={cn(
            "p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3",
            publishResult.success
              ? "bg-emerald-500/15 border border-emerald-400/30 text-emerald-300"
              : "bg-rose-500/15 border border-rose-400/30 text-rose-300"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">
              {publishResult.success ? "task_alt" : "error"}
            </span>
            <span>{publishResult.message}</span>
          </div>

          {publishResult.success && (
            <Link
              href="/dashboard/quizzes"
              className="px-3 py-1 rounded-lg bg-emerald-400/20 text-emerald-200 text-xs font-semibold hover:bg-emerald-400/30 transition-colors"
            >
              View in Quiz Center &rarr;
            </Link>
          )}
        </div>
      )}

      {/* Upload Zone & Form Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Drag & Drop Dropzone */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <GlassCard
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="p-8 border-2 border-dashed border-white/20 hover:border-indigo-400/60 transition-all text-center relative group"
          >
            <input
              type="file"
              accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={onFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-3 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[32px]">
                  upload_file
                </span>
              </div>

              <h3 className="font-['Space_Grotesk'] text-base font-bold text-white mb-1">
                {fileName ? fileName : "Drag and drop your .xlsx quiz spreadsheet"}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                SheetJS will instantly inspect columns: Question Text, Options A–D, Correct Answer, Marks, and Chapter Slug.
              </p>

              <button
                type="button"
                className="px-4 py-2 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold pointer-events-none"
              >
                Browse Excel File
              </button>
            </div>
          </GlassCard>

          {/* Error Banner if invalid rows found */}
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider text-rose-200">
                <span className="material-symbols-outlined text-[18px]">
                  report_problem
                </span>
                <span>
                  Validation Errors Found ({validationErrors.length} Issue{validationErrors.length > 1 ? "s" : ""})
                </span>
              </div>
              <p className="text-[11px] text-rose-300">
                Fix these errors in your spreadsheet before publishing:
              </p>
              <div className="max-h-40 overflow-y-auto flex flex-col gap-1 pr-1 mt-1">
                {validationErrors.map((err, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-black/40 border border-rose-500/20 text-xs flex items-center justify-between"
                  >
                    <span className="font-mono text-rose-300 font-semibold">
                      Row {err.rowNumber} [{err.field}]
                    </span>
                    <span className="text-slate-300 text-[11px]">{err.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Quiz Settings & Publish Action */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <GlassCard className="p-6">
            <h3 className="font-['Space_Grotesk'] text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-[18px]">
                settings
              </span>
              <span>Quiz Parameters</span>
            </h3>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g. Cardiovascular Murmurs & Pharmacology"
                  className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/70"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-xs focus:outline-none focus:border-indigo-400/70"
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Space_Grotesk'] font-semibold text-slate-300 mb-1">
                    Student Batch
                  </label>
                  <input
                    type="text"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-xs font-mono focus:outline-none focus:border-indigo-400/70"
                  />
                </div>
              </div>

              {/* Status summary pill */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs mt-1">
                <span className="text-slate-400">Parsed Questions:</span>
                <span
                  className={cn(
                    "font-['Space_Grotesk'] font-bold px-2 py-0.5 rounded-full text-xs",
                    parsedRows.length > 0 && validationErrors.length === 0
                      ? "bg-emerald-400/20 text-emerald-300"
                      : "bg-white/10 text-slate-400"
                  )}
                >
                  {parsedRows.length} Questions
                </span>
              </div>

              <button
                type="button"
                disabled={!isValidForPublish || isPublishing}
                onClick={handlePublish}
                className={cn(
                  "mt-3 w-full h-11 rounded-xl text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                  isValidForPublish
                    ? "liquid-btn-primary text-white cursor-pointer hover:brightness-110 shadow-[0_4px_20px_rgba(99,102,241,0.4)]"
                    : "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
                )}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isPublishing ? "hourglass_top" : "publish"}
                </span>
                <span>{isPublishing ? "Publishing Transaction..." : "Publish Quiz to Cohort"}</span>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Live Preview Table mounted inside ReadingSurface with 60 FPS GPU rule */}
      {parsedRows.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] text-base font-bold text-white">
                Live SpreadSheet Preview
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                {parsedRows.length} Valid Rows
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Zero backdrop-blur on rows (60 FPS scrolling)
            </span>
          </div>

          <ReadingSurface className="p-0 overflow-hidden bg-slate-950/90">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 font-['Space_Grotesk'] uppercase text-[10px] tracking-wider">
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3 min-w-[280px]">Question Text</th>
                    <th className="p-3 min-w-[140px]">Option A</th>
                    <th className="p-3 min-w-[140px]">Option B</th>
                    <th className="p-3 min-w-[140px]">Option C</th>
                    <th className="p-3 min-w-[140px]">Option D</th>
                    <th className="p-3 w-16 text-center">Correct</th>
                    <th className="p-3 w-16 text-center">Marks</th>
                    <th className="p-3 min-w-[140px]">Chapter Slug</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {parsedRows.map((row) => (
                    <tr
                      key={row.question_number}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-3 font-mono text-center font-bold text-slate-400">
                        {row.question_number}
                      </td>
                      <td className="p-3 font-medium text-slate-100 max-w-sm">
                        {row.question_text}
                      </td>
                      <td className="p-3 text-slate-400">{row.option_a}</td>
                      <td className="p-3 text-slate-400">{row.option_b}</td>
                      <td className="p-3 text-slate-400">{row.option_c}</td>
                      <td className="p-3 text-slate-400">{row.option_d}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                          {row.correct_option}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-center">
                        +{row.marks} / -{row.negative_marks}
                      </td>
                      <td className="p-3 font-mono text-indigo-300 text-[11px]">
                        {row.chapter_slug || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReadingSurface>
        </GlassCard>
      )}
    </div>
  );
}
