"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import type { MistakeWithQuestion } from "@/actions/mistakes";
import { toggleMistakeResolved, submitMistakePractice } from "@/actions/mistakes";
import { cn } from "@/lib/utils";

interface MistakeNotebookViewProps {
  initialMistakes: MistakeWithQuestion[];
}

export function MistakeNotebookView({ initialMistakes }: MistakeNotebookViewProps) {
  const [mistakes, setMistakes] = useState<MistakeWithQuestion[]>(initialMistakes);
  const [filterMode, setFilterMode] = useState<"unresolved" | "all" | "resolved">("unresolved");
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const [practiceResult, setPracticeResult] = useState<{
    correctCount: number;
    total: number;
  } | null>(null);

  const unresolvedMistakes = useMemo(
    () => mistakes.filter((m) => !m.resolved),
    [mistakes]
  );

  const displayedMistakes = useMemo(() => {
    if (filterMode === "unresolved") return mistakes.filter((m) => !m.resolved);
    if (filterMode === "resolved") return mistakes.filter((m) => m.resolved);
    return mistakes;
  }, [mistakes, filterMode]);

  // Handle single toggle
  const handleToggle = async (mistakeId: string, currentResolved: boolean) => {
    const nextResolved = !currentResolved;
    setMistakes((prev) =>
      prev.map((m) => (m.id === mistakeId ? { ...m, resolved: nextResolved } : m))
    );
    await toggleMistakeResolved(mistakeId, nextResolved);
  };

  // Launch practice drill (up to 10 questions)
  const practiceQuestions = useMemo(
    () => unresolvedMistakes.slice(0, 10).map((m) => m.question),
    [unresolvedMistakes]
  );

  const handlePracticeSubmit = async () => {
    if (Object.keys(practiceAnswers).length === 0) return;

    setPracticeSubmitted(true);
    const res = await submitMistakePractice(practiceAnswers);

    if (res.success) {
      setPracticeResult({
        correctCount: res.correctCount || 0,
        total: practiceQuestions.length,
      });

      // Update local mistakes state to mark resolved questions
      setMistakes((prev) =>
        prev.map((m) => {
          if (practiceAnswers[m.questionId] === m.question.correctOption) {
            return { ...m, resolved: true };
          }
          return m;
        })
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-20">
      {/* Header & Practice Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Personal Mistake Notebook
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Questions answered incorrectly during quizzes are indexed here until mastered.
          </p>
        </div>

        <button
          type="button"
          disabled={unresolvedMistakes.length === 0}
          onClick={() => {
            setPracticeAnswers({});
            setPracticeSubmitted(false);
            setPracticeResult(null);
            setPracticeModalOpen(true);
          }}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto transition-all duration-200",
            unresolvedMistakes.length > 0
              ? "liquid-btn-primary text-white cursor-pointer hover:brightness-110 shadow-[0_4px_20px_rgba(99,102,241,0.4)]"
              : "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
          )}
        >
          <span className="material-symbols-outlined text-[18px]">
            replay
          </span>
          <span>Practice My Mistakes ({unresolvedMistakes.length})</span>
        </button>
      </div>

      {/* KPI Stats & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl liquid-glass-subtle self-start">
          <button
            type="button"
            onClick={() => setFilterMode("unresolved")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-['Space_Grotesk'] font-semibold transition-all",
              filterMode === "unresolved"
                ? "liquid-pill-active text-white"
                : "text-slate-400 hover:text-white"
            )}
          >
            Unresolved ({unresolvedMistakes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-['Space_Grotesk'] font-semibold transition-all",
              filterMode === "all"
                ? "liquid-pill-active text-white"
                : "text-slate-400 hover:text-white"
            )}
          >
            All Mistakes ({mistakes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("resolved")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-['Space_Grotesk'] font-semibold transition-all",
              filterMode === "resolved"
                ? "liquid-pill-active text-white"
                : "text-slate-400 hover:text-white"
            )}
          >
            Mastered ({mistakes.length - unresolvedMistakes.length})
          </button>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Auto-synchronized with Quiz grading engine
        </span>
      </div>

      {/* Mistake Items Feed */}
      {displayedMistakes.length > 0 ? (
        <div className="flex flex-col gap-4">
          {displayedMistakes.map((item) => {
            const q = item.question;

            return (
              <GlassCard
                key={item.id}
                className={cn(
                  "p-5 sm:p-6 transition-all duration-200",
                  item.resolved
                    ? "border-emerald-500/20 bg-white/[0.02]"
                    : "border-rose-500/25 hover:border-rose-400/40"
                )}
              >
                {/* Item Topbar */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08] gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-mono font-bold shrink-0",
                        item.resolved
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      )}
                    >
                      {item.resolved ? "Resolved" : "Needs Review"}
                    </span>
                    <span className="text-xs text-slate-400 truncate">
                      From: {item.quizTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Concept Deep Link to Notes Library */}
                    {item.chapterSlug && (
                      <Link
                        href={`/dashboard/notes?chapter=${encodeURIComponent(item.chapterSlug)}`}
                        className="px-2.5 py-1 rounded-lg liquid-pill-active text-sky-200 hover:text-white text-[11px] font-['Space_Grotesk'] font-semibold flex items-center gap-1 transition-all"
                      >
                        <span className="material-symbols-outlined text-[14px]">menu_book</span>
                        <span className="hidden sm:inline">Review Chapter</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggle(item.id, item.resolved)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-['Space_Grotesk'] font-semibold transition-all flex items-center gap-1",
                        item.resolved
                          ? "bg-white/10 text-slate-300 hover:text-white"
                          : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                      )}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {item.resolved ? "undo" : "check"}
                      </span>
                      <span>{item.resolved ? "Reopen" : "Mark Mastered"}</span>
                    </button>
                  </div>
                </div>

                {/* Question Stem in High-Contrast Surface */}
                <ReadingSurface className="p-4 mb-4 text-xs sm:text-sm font-medium text-slate-100 bg-slate-950/90 leading-relaxed">
                  {q.questionText}
                </ReadingSurface>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {(["A", "B", "C", "D"] as const).map((optKey) => {
                    const optText =
                      optKey === "A"
                        ? q.optionA
                        : optKey === "B"
                        ? q.optionB
                        : optKey === "C"
                        ? q.optionC
                        : q.optionD;

                    const isCorrect = q.correctOption === optKey;

                    return (
                      <div
                        key={optKey}
                        className={cn(
                          "p-2.5 rounded-xl text-xs flex items-center gap-2.5",
                          isCorrect
                            ? "bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 font-medium"
                            : "bg-white/[0.02] border border-white/[0.05] text-slate-400"
                        )}
                      >
                        <span
                          className={cn(
                            "w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[11px]",
                            isCorrect
                              ? "bg-emerald-400 text-slate-950"
                              : "bg-white/10 text-slate-400"
                          )}
                        >
                          {optKey}
                        </span>
                        <span className="truncate">{optText}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Clinical Explanation */}
                {q.explanation && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300">
                    <strong className="text-indigo-300 font-semibold block mb-0.5">
                      Clinical Rationale:
                    </strong>
                    {q.explanation}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <ReadingSurface className="p-12 text-center text-slate-400 bg-slate-900/60">
          <span className="material-symbols-outlined text-[44px] text-emerald-400 mb-2">
            task_alt
          </span>
          <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-100">
            {filterMode === "unresolved"
              ? "All Caught Up! Zero Unresolved Mistakes."
              : "No mistake items match the selected filter."}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Take timed quizzes in the Quiz Center to automatically capture questions you miss.
          </p>
        </ReadingSurface>
      )}

      {/* Practice My Mistakes Interactive Modal */}
      {practiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#0c0e1a]/95 backdrop-blur-2xl p-6 rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-[24px]">
                  psychology
                </span>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">
                  Practice My Mistakes ({practiceQuestions.length} Questions)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPracticeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Questions Scrollable Area */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-1">
              {practiceResult && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 flex items-center justify-between text-xs font-semibold">
                  <span>
                    Practice Complete! {practiceResult.correctCount} of {practiceResult.total} questions answered correctly and marked resolved in your notebook!
                  </span>
                  <button
                    type="button"
                    onClick={() => setPracticeModalOpen(false)}
                    className="px-3 py-1 rounded-lg bg-emerald-400 text-slate-950 font-bold"
                  >
                    Close
                  </button>
                </div>
              )}

              {practiceQuestions.map((q, idx) => {
                const selectedOpt = practiceAnswers[q.id];
                const isGraded = practiceSubmitted;
                const isCorrect = selectedOpt === q.correctOption;

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 font-bold">Question {idx + 1}</span>
                      {isGraded && (
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full font-bold",
                            isCorrect ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                          )}
                        >
                          {isCorrect ? "Correct (+4)" : "Incorrect"}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-white">{q.questionText}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(["A", "B", "C", "D"] as const).map((optKey) => {
                        const optText =
                          optKey === "A"
                            ? q.optionA
                            : optKey === "B"
                            ? q.optionB
                            : optKey === "C"
                            ? q.optionC
                            : q.optionD;

                        const isSelected = selectedOpt === optKey;

                        return (
                          <button
                            key={optKey}
                            type="button"
                            disabled={isGraded}
                            onClick={() =>
                              setPracticeAnswers((prev) => ({
                                ...prev,
                                [q.id]: optKey,
                              }))
                            }
                            className={cn(
                              "p-2.5 rounded-xl text-xs text-left flex items-center gap-2.5 transition-all",
                              isSelected
                                ? "liquid-pill-active text-white border-indigo-400"
                                : "bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-slate-300"
                            )}
                          >
                            <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-mono font-bold text-[10px]">
                              {optKey}
                            </span>
                            <span className="truncate">{optText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                {Object.keys(practiceAnswers).length}/{practiceQuestions.length} Answered
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPracticeModalOpen(false)}
                  className="px-4 py-2 rounded-xl liquid-glass-subtle text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>

                {!practiceSubmitted && (
                  <button
                    type="button"
                    onClick={handlePracticeSubmit}
                    disabled={Object.keys(practiceAnswers).length === 0}
                    className="px-4 py-2 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider"
                  >
                    Grade &amp; Resolve Mistakes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
