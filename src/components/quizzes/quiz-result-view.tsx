"use client";

import React from "react";
import Link from "next/link";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import type { Quiz, QuizQuestion, QuizAttempt } from "@/db/schema";
import { cn } from "@/lib/utils";

interface QuizResultViewProps {
  quiz: Quiz;
  questions: QuizQuestion[];
  attempt: QuizAttempt;
  answers: Record<string, string>;
}

export function QuizResultView({
  quiz,
  questions,
  attempt,
  answers,
}: QuizResultViewProps) {
  const scoreNum = parseFloat(attempt.score) || 0;
  const totalNum = parseFloat(attempt.totalMarks) || 1;
  const percentage = Math.round((scoreNum / totalNum) * 100);

  const correctAnswersCount = questions.filter(
    (q) => answers[q.id] === q.correctOption
  ).length;

  const incorrectAnswersCount = questions.filter(
    (q) => answers[q.id] && answers[q.id] !== q.correctOption
  ).length;

  const unansweredCount = questions.length - (correctAnswersCount + incorrectAnswersCount);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-20">
      {/* Header & Retake buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-sky-300">
            Official Exam Scorecard
          </span>
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white mt-1">
            {quiz.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/quizzes/${quiz.id}/take`}
            className="px-4 py-2 rounded-xl liquid-glass-subtle hover:border-white/20 text-white text-xs font-['Space_Grotesk'] font-semibold flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Retake Quiz</span>
          </Link>

          <Link
            href="/dashboard/mistakes"
            className="px-4 py-2 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">history_edu</span>
            <span>Mistake Notebook</span>
          </Link>
        </div>
      </div>

      {/* KPI Score Overview Bento Cards with animated score highlight */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400">Total Score</span>
          <div className="mt-2">
            <span className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white">
              {scoreNum}
            </span>
            <span className="text-xs text-slate-400 font-mono"> / {totalNum}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400">Accuracy Rate</span>
          <div className="mt-2">
            <span
              className={cn(
                "font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold",
                percentage >= 70 ? "text-emerald-400" : "text-amber-400"
              )}
            >
              {percentage}%
            </span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400">Correct / Missed</span>
          <div className="mt-2 text-xs font-mono flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-base">+{correctAnswersCount}</span>
            <span className="text-slate-500">/</span>
            <span className="text-rose-400 font-bold text-base">-{incorrectAnswersCount}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400">Time Taken</span>
          <div className="mt-2 font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-sky-200">
            {Math.floor(attempt.timeTakenSeconds / 60)}m {attempt.timeTakenSeconds % 60}s
          </div>
        </GlassCard>
      </div>

      {/* Step-by-Step Question Review & Concept Note Deep Links */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <h2 className="font-['Space_Grotesk'] text-lg font-bold text-white">
            Question Explanations &amp; Diagnostic Review
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {questions.length} Questions Evaluated
          </span>
        </div>

        {questions.map((q, idx) => {
          const studentChoice = answers[q.id];
          const isCorrect = studentChoice === q.correctOption;
          const isSkipped = !studentChoice;

          return (
            <GlassCard
              key={q.id}
              className={cn(
                "p-5 sm:p-6 transition-all duration-200",
                isCorrect
                  ? "border-emerald-500/25"
                  : isSkipped
                  ? "border-slate-500/20"
                  : "border-rose-500/30"
              )}
            >
              {/* Question Number & Status Badge */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-white font-mono text-xs font-bold">
                    Q{idx + 1}
                  </span>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold",
                      isCorrect
                        ? "bg-emerald-500/20 text-emerald-300"
                        : isSkipped
                        ? "bg-slate-500/20 text-slate-300"
                        : "bg-rose-500/20 text-rose-300"
                    )}
                  >
                    {isCorrect ? "Correct (+4)" : isSkipped ? "Unanswered (0)" : "Incorrect (-1)"}
                  </span>
                </div>

                {/* Concept Deep Link Button if chapter_slug exists */}
                {q.chapterSlug && (
                  <Link
                    href={`/dashboard/notes?chapter=${encodeURIComponent(q.chapterSlug)}`}
                    className="px-3 py-1.5 rounded-xl liquid-pill-active text-sky-200 hover:text-white text-xs font-['Space_Grotesk'] font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                  >
                    <span className="material-symbols-outlined text-[15px]">menu_book</span>
                    <span>Review Concept Note</span>
                  </Link>
                )}
              </div>

              {/* Question Stem */}
              <p className="text-sm sm:text-base font-medium text-white leading-relaxed mb-4">
                {q.questionText}
              </p>

              {/* Options Breakdown */}
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

                  const isSelected = studentChoice === optKey;
                  const isAnswer = q.correctOption === optKey;

                  return (
                    <div
                      key={optKey}
                      className={cn(
                        "p-3 rounded-xl text-xs flex items-center gap-2.5 transition-all",
                        isAnswer
                          ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 font-medium"
                          : isSelected
                          ? "bg-rose-500/20 border border-rose-400/40 text-rose-100"
                          : "bg-white/[0.02] border border-white/[0.05] text-slate-400"
                      )}
                    >
                      <span
                        className={cn(
                          "w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[11px]",
                          isAnswer
                            ? "bg-emerald-400 text-slate-950"
                            : isSelected
                            ? "bg-rose-400 text-slate-950"
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

              {/* Clinical Explanation Surface */}
              {q.explanation && (
                <ReadingSurface className="p-4 bg-slate-950/90 border-slate-700/60 text-xs text-slate-200">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-['Space_Grotesk'] font-bold text-[11px] uppercase tracking-wider mb-1">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    <span>Clinical Rationale</span>
                  </div>
                  <p className="leading-relaxed text-slate-300">{q.explanation}</p>
                </ReadingSurface>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
