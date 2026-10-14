"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import type { Quiz, QuizQuestion } from "@/db/schema";
import { submitQuizAttempt } from "@/actions/attempts";
import { cn } from "@/lib/utils";

interface QuizRunnerProps {
  quiz: Quiz;
  questions: QuizQuestion[];
}

export function QuizRunner({ quiz, questions }: QuizRunnerProps) {
  const router = useRouter();

  // Storage key
  const storageKey = `synapsemed_quiz_${quiz.id}_state`;

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [timeLeft, setTimeLeft] = useState(quiz.durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paletteDrawerOpen, setPaletteDrawerOpen] = useState(false);

  // Restore state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (typeof parsed.timeLeft === "number" && parsed.timeLeft > 0) {
          setTimeLeft(parsed.timeLeft);
        }
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Persist state to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ answers, timeLeft })
      );
    } catch {
      // ignore
    }
  }, [answers, timeLeft, storageKey]);

  // Submit attempt callback
  const handleFinalSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const timeTaken = quiz.durationMinutes * 60 - timeLeft;

    const res = await submitQuizAttempt({
      quizId: quiz.id,
      timeTakenSeconds: Math.max(1, timeTaken),
      answers,
    });

    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }

    if (res.success) {
      router.push(`/dashboard/quizzes/${quiz.id}/result`);
    } else {
      alert(res.error || "Failed to submit quiz");
      setIsSubmitting(false);
    }
  }, [isSubmitting, quiz.durationMinutes, quiz.id, timeLeft, answers, storageKey, router]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleFinalSubmit]);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder
      .toString()
      .padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex];
  const isTimeCritical = timeLeft < 120; // under 2 minutes
  const answeredCount = Object.keys(answers).length;

  const handleSelectOption = (option: "A" | "B" | "C" | "D") => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const clearCurrentAnswer = () => {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6 relative max-w-5xl mx-auto pb-16">
      {/* Floating Liquid Glass Countdown Timer Pill & Test Stats Bar */}
      <div className="sticky top-18 z-30 flex items-center justify-between gap-3 p-3 rounded-2xl liquid-glass-card shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="font-['Space_Grotesk'] font-bold text-sm text-white truncate">
            {quiz.title}
          </span>
          <span className="hidden sm:inline text-xs text-slate-400 font-mono">
            ({answeredCount}/{questions.length} answered)
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Moving Parts: Floating Countdown Timer Pill */}
          <div
            className={cn(
              "px-3.5 py-1.5 rounded-full flex items-center gap-2 font-mono text-xs font-bold transition-all duration-300",
              isTimeCritical
                ? "bg-rose-500/25 border border-rose-400/50 text-rose-200 animate-pulse shadow-[0_0_16px_rgba(244,63,94,0.4)]"
                : "liquid-pill-active text-sky-200"
            )}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isTimeCritical ? "timer_off" : "timer"}
            </span>
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            type="button"
            onClick={() => setPaletteDrawerOpen(true)}
            className="lg:hidden p-2 rounded-xl liquid-glass-subtle text-slate-300 hover:text-white"
            title="Question Palette"
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-1.5 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Main 2-Column Quiz Runner Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8-col: Active Question Card & Options */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {currentQuestion ? (
            <GlassCard className="p-5 sm:p-7 flex flex-col gap-6">
              {/* Question Header & Marks Info */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full liquid-pill-active text-indigo-200 text-xs font-mono font-bold">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  {currentQuestion.chapterSlug && (
                    <span className="hidden sm:inline text-[11px] font-mono text-slate-400">
                      [{currentQuestion.chapterSlug}]
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">+{currentQuestion.marks}</span>
                  <span>/</span>
                  <span className="text-rose-400 font-bold">-{currentQuestion.negativeMarks}</span>
                </div>
              </div>

              {/* Question Stem in High-Contrast ReadingSurface */}
              <ReadingSurface className="p-5 text-sm sm:text-base leading-relaxed text-slate-100 bg-slate-950/90 font-medium">
                {currentQuestion.questionText}
              </ReadingSurface>

              {/* Options A, B, C, D */}
              <div className="flex flex-col gap-3">
                {(["A", "B", "C", "D"] as const).map((optKey) => {
                  const optText =
                    optKey === "A"
                      ? currentQuestion.optionA
                      : optKey === "B"
                      ? currentQuestion.optionB
                      : optKey === "C"
                      ? currentQuestion.optionC
                      : currentQuestion.optionD;

                  const isSelected = answers[currentQuestion.id] === optKey;

                  return (
                    <button
                      key={optKey}
                      type="button"
                      onClick={() => handleSelectOption(optKey)}
                      className={cn(
                        "w-full p-4 rounded-xl text-left text-xs sm:text-sm font-medium transition-all duration-200 flex items-start gap-3.5 group select-none min-h-[52px]",
                        isSelected
                          ? "liquid-pill-active text-white border-indigo-400/60 shadow-[0_0_20px_rgba(99,102,241,0.3)] translate-x-1"
                          : "bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-slate-200 hover:text-white"
                      )}
                    >
                      <span
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors",
                          isSelected
                            ? "bg-indigo-400 text-slate-950"
                            : "bg-white/10 text-slate-300 group-hover:bg-white/20"
                        )}
                      >
                        {optKey}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{optText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Navigation Buttons */}
              <div className="pt-4 mt-2 border-t border-white/[0.08] flex items-center justify-between">
                <button
                  type="button"
                  onClick={clearCurrentAnswer}
                  disabled={!answers[currentQuestion.id]}
                  className="text-xs text-slate-400 hover:text-rose-300 disabled:opacity-40 transition-colors"
                >
                  Clear Selection
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    className="px-3.5 py-2 rounded-xl liquid-glass-subtle text-slate-300 hover:text-white disabled:opacity-30 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    disabled={currentIndex === questions.length - 1}
                    onClick={() =>
                      setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
                    }
                    className="px-4 py-2 rounded-xl liquid-btn-primary text-white disabled:opacity-30 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <span>Next</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          ) : (
            <ReadingSurface className="p-8 text-center text-slate-400">
              No questions found for this quiz.
            </ReadingSurface>
          )}
        </div>

        {/* Right 4-col: Question Palette Grid (Desktop) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
              <span className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-slate-300">
                Question Palette
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full liquid-badge text-sky-300">
                {questions.length} Items
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[q.id];

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "h-10 rounded-xl font-mono text-xs font-bold transition-all duration-200 flex items-center justify-center",
                      isCurrent && "border-2 border-sky-400 text-sky-200 scale-105",
                      isAnswered
                        ? "bg-emerald-500/25 border border-emerald-400/40 text-emerald-200"
                        : "bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]"
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-around text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full border border-sky-400" />
                <span>Current</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span>Unvisited</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Mobile Question Palette Drawer */}
      {paletteDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setPaletteDrawerOpen(false)}
          />
          <div className="relative mt-auto w-full max-h-[70vh] bg-[#0c0e1a]/95 backdrop-blur-2xl p-5 rounded-t-3xl border-t border-white/15 z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <span className="font-['Space_Grotesk'] text-sm font-bold text-white">
                Question Palette ({answeredCount}/{questions.length} answered)
              </span>
              <button
                type="button"
                onClick={() => setPaletteDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2.5 mb-6">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[q.id];

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setPaletteDrawerOpen(false);
                    }}
                    className={cn(
                      "h-11 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center",
                      isCurrent && "border-2 border-sky-400 text-sky-200",
                      isAnswered
                        ? "bg-emerald-500/25 border border-emerald-400/40 text-emerald-200"
                        : "bg-white/[0.04] border border-white/[0.08] text-slate-400"
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmation Before Submit */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <GlassCard className="p-6 max-w-md w-full border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-sky-300">
              <span className="material-symbols-outlined text-[26px]">help_outline</span>
              <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">
                Submit Quiz Attempt?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              You have answered <strong className="text-white">{answeredCount}</strong> of{" "}
              <strong className="text-white">{questions.length}</strong> questions. Unanswered questions will receive 0 marks.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl liquid-glass-subtle text-slate-300 text-xs font-semibold hover:text-white"
              >
                Continue Test
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowConfirmModal(false);
                  handleFinalSubmit();
                }}
                className="px-5 py-2 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider"
              >
                {isSubmitting ? "Grading..." : "Confirm & Submit"}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
