import React from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass";
import { db } from "@/db";
import { users, notes, quizzes } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export default async function AdminDashboardPage() {
  // Fetch real database metrics
  let studentCount = 0;
  let notesCount = 0;
  let quizCount = 0;

  try {
    const [[sc], [nc], [qc]] = await Promise.all([
      db
        .select({ val: count() })
        .from(users)
        .where(eq(users.role, "student")),
      db.select({ val: count() }).from(notes),
      db.select({ val: count() }).from(quizzes),
    ]);
    studentCount = sc?.val || 0;
    notesCount = nc?.val || 0;
    quizCount = qc?.val || 0;
  } catch (err) {
    console.error("Error fetching admin metrics:", err);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Faculty Admin Console
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Manage medical notes, ingest Excel quizzes, and monitor enrolled students.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/quizzes/new"
            className="px-4 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
          >
            <span className="material-symbols-outlined text-[18px]">assignment</span>
            <span>Create / Import Quiz</span>
          </Link>
          <Link
            href="/admin/notes"
            className="px-4 py-2.5 rounded-xl liquid-glass-card hover:border-white/20 text-white text-xs font-['Space_Grotesk'] font-semibold active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">post_add</span>
            <span>Upload Notes</span>
          </Link>
        </div>
      </div>

      {/* Real Functional Stat Cards (No Fake Metrics or Capacity Up-Arrows) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-['Space_Grotesk'] font-semibold uppercase tracking-wider">
              Enrolled Students
            </span>
            <span className="material-symbols-outlined text-indigo-400 text-[22px]">
              group
            </span>
          </div>
          <div>
            <div className="font-['Space_Grotesk'] text-3xl font-bold text-white">
              {studentCount}
            </div>
            <Link
              href="/admin/students"
              className="text-[11px] text-indigo-300 hover:text-white mt-2 inline-flex items-center gap-1 font-medium transition-colors"
            >
              <span>Manage Student Roster</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-['Space_Grotesk'] font-semibold uppercase tracking-wider">
              Notes in Library
            </span>
            <span className="material-symbols-outlined text-sky-400 text-[22px]">
              library_books
            </span>
          </div>
          <div>
            <div className="font-['Space_Grotesk'] text-3xl font-bold text-white">
              {notesCount}
            </div>
            <Link
              href="/admin/notes"
              className="text-[11px] text-sky-300 hover:text-white mt-2 inline-flex items-center gap-1 font-medium transition-colors"
            >
              <span>Open Notes Manager</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-['Space_Grotesk'] font-semibold uppercase tracking-wider">
              Published Quizzes
            </span>
            <span className="material-symbols-outlined text-purple-400 text-[22px]">
              quiz
            </span>
          </div>
          <div>
            <div className="font-['Space_Grotesk'] text-3xl font-bold text-white">
              {quizCount}
            </div>
            <Link
              href="/admin/quizzes/new"
              className="text-[11px] text-purple-300 hover:text-white mt-2 inline-flex items-center gap-1 font-medium transition-colors"
            >
              <span>Create / Ingest Quizzes</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* Real Functional Management Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8-col: Functional Tools */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <GlassCard className="p-6">
            <h2 className="font-['Space_Grotesk'] text-base font-bold text-white mb-4 pb-3 border-b border-white/[0.08]">
              Academic Console Tools
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl liquid-glass-subtle flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-indigo-300 mb-1.5">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                    <span className="font-['Space_Grotesk'] font-semibold text-sm">
                      Syllabus &amp; Notes
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload medical lecture notes and PDFs organized by Subject and Chapter with private presigned download URLs.
                  </p>
                </div>
                <Link
                  href="/admin/notes"
                  className="text-xs font-['Space_Grotesk'] font-semibold text-indigo-300 hover:text-white flex items-center gap-1 self-start transition-colors"
                >
                  <span>Upload &amp; Manage Notes</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>

              <div className="p-4 rounded-xl liquid-glass-subtle flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sky-300 mb-1.5">
                    <span className="material-symbols-outlined text-[20px]">assignment</span>
                    <span className="font-['Space_Grotesk'] font-semibold text-sm">
                      Quiz Authoring &amp; Ingestion
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Create interactive quizzes with Google Forms-style question builder, or bulk import directly from `.xlsx` files with instant Zod validation.
                  </p>
                </div>
                <Link
                  href="/admin/quizzes/new"
                  className="text-xs font-['Space_Grotesk'] font-semibold text-sky-300 hover:text-white flex items-center gap-1 self-start transition-colors"
                >
                  <span>Open Quiz Builder</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right 4-col: Cohort Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <GlassCard className="p-5">
            <h3 className="font-['Space_Grotesk'] text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-[18px]">
                badge
              </span>
              <span>Student Roster</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              View all registered students or bulk import student cohorts via spreadsheet.
            </p>
            <Link
              href="/admin/students"
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-['Space_Grotesk'] font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <span>Open Student Roster</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-['Space_Grotesk'] text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">
                download
              </span>
              <span>Quiz Template</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Download the standard Excel quiz upload template pre-formatted with all required columns.
            </p>
            <a
              href="/api/download-template"
              className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-200 text-xs font-['Space_Grotesk'] font-semibold transition-all flex items-center justify-center gap-1.5"
              download
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Download .xlsx Template</span>
            </a>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
