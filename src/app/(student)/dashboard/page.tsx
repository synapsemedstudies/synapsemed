import React from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass";
import { requireStudent } from "@/lib/auth";
import { db } from "@/db";
import { notes, quizzes } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export default async function StudentDashboardPage() {
  const student = await requireStudent();

  let notesCount = 0;
  let quizCount = 0;

  try {
    const [[nc], [qc]] = await Promise.all([
      db.select({ val: count() }).from(notes),
      db
        .select({ val: count() })
        .from(quizzes)
        .where(eq(quizzes.isPublished, true)),
    ]);
    notesCount = nc?.val || 0;
    quizCount = qc?.val || 0;
  } catch (err) {
    console.error("Error fetching student metrics:", err);
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome, {student.fullName}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Student ID &bull; Roll: <span className="text-slate-300 font-mono">{student.rollNumber || "Student"}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/quizzes"
            className="px-4 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
          >
            <span className="material-symbols-outlined text-[18px]">timer</span>
            <span>Take a Quiz</span>
          </Link>
          <Link
            href="/dashboard/notes"
            className="px-4 py-2.5 rounded-xl liquid-glass-card hover:border-white/20 text-white text-xs font-['Space_Grotesk'] font-semibold active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>Browse Notes</span>
          </Link>
        </div>
      </div>

      {/* Core Academic Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hub 1: Notes Library */}
        <GlassCard className="p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-300 group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                <span className="material-symbols-outlined text-[26px]">library_books</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-['Space_Grotesk'] font-bold">
                {notesCount} Notes
              </span>
            </div>
            <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors">
              Medical Notes Library
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Access clinical summaries, high-yield subject outlines, and study notes organized by chapter.
            </p>
          </div>
          <Link
            href="/dashboard/notes"
            className="mt-6 w-full py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_16px_rgba(99,102,241,0.3)]"
          >
            <span>Open Notes Library</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </GlassCard>

        {/* Hub 2: Timed Quizzes */}
        <GlassCard className="p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-300 group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                <span className="material-symbols-outlined text-[26px]">timer</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-['Space_Grotesk'] font-bold">
                {quizCount} Available
              </span>
            </div>
            <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-2 group-hover:text-sky-200 transition-colors">
              Timed Exam Quizzes
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Test your clinical diagnostic skills with timed MCQ quizzes. Features auto-save, instant score breakdown, and answer keys.
            </p>
          </div>
          <Link
            href="/dashboard/quizzes"
            className="mt-6 w-full py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-sky-200 text-xs font-['Space_Grotesk'] font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <span>View Active Quizzes</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}
