"use client";

import React, { useState } from "react";
import { InteractiveQuizBuilder } from "@/components/quizzes/interactive-quiz-builder";
import { AdminQuizUploader } from "@/components/quizzes/admin-quiz-uploader";
import type { SubjectWithChapters } from "@/actions/notes";
import { cn } from "@/lib/utils";

interface QuizCreatorHubProps {
  subjectsTree: SubjectWithChapters[];
}

export function QuizCreatorHub({ subjectsTree }: QuizCreatorHubProps) {
  const [activeTab, setActiveTab] = useState<"form" | "excel">("form");

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl liquid-glass-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400 text-[20px]">
              post_add
            </span>
            <h1 className="font-['Space_Grotesk'] text-lg font-bold text-white tracking-tight">
              Create &amp; Publish Quizzes
            </h1>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            Choose your preferred authoring workflow: interactive Google Forms builder or bulk Excel import.
          </p>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-['Space_Grotesk'] font-bold flex items-center gap-2 transition-all",
              activeTab === "form"
                ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                : "text-slate-400 hover:text-white"
            )}
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            <span>Interactive Form</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("excel")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-['Space_Grotesk'] font-bold flex items-center gap-2 transition-all",
              activeTab === "excel"
                ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                : "text-slate-400 hover:text-white"
            )}
          >
            <span className="material-symbols-outlined text-[16px]">table_view</span>
            <span>Excel Spreadsheet</span>
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === "form" ? (
        <InteractiveQuizBuilder subjectsTree={subjectsTree} />
      ) : (
        <AdminQuizUploader />
      )}
    </div>
  );
}
