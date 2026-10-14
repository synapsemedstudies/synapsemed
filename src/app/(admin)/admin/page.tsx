import React from "react";
import Link from "next/link";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-white tracking-tight">
            Faculty Admin Console
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage medical notes, ingest Excel quizzes, and monitor cohort test analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/quizzes/new"
            className="px-4 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Import Excel Quiz</span>
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

      {/* Bento KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-['Space_Grotesk'] font-semibold uppercase tracking-wider">
              Enrolled Students
            </span>
            <span className="material-symbols-outlined text-indigo-400 text-[22px]">
              group
            </span>
          </div>
          <div>
            <div className="font-['Space_Grotesk'] text-3xl font-bold text-white">842</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              <span>84.2% cohort capacity</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-['Space_Grotesk'] font-semibold uppercase tracking-wider">
              Notes in Library
            </span>
            <span className="material-symbols-outlined text-sky-400 text-[22px]">
              library_books
            </span>
          </div>
          <div>
            <div className="font-['Space_Grotesk'] text-3xl font-bold text-white">247</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Cloudflare R2 Presigned Storage
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-['Space_Grotesk'] font-semibold uppercase tracking-wider">
              Published Quizzes
            </span>
            <span className="material-symbols-outlined text-purple-400 text-[22px]">
              quiz
            </span>
          </div>
          <div>
            <div className="font-['Space_Grotesk'] text-3xl font-bold text-white">34</div>
            <div className="text-[11px] text-indigo-300 mt-1">
              SheetJS &amp; Zod Verified
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-['Space_Grotesk'] font-semibold uppercase tracking-wider">
              Avg Test Score
            </span>
            <span className="material-symbols-outlined text-amber-400 text-[22px]">
              trending_up
            </span>
          </div>
          <div>
            <div className="font-['Space_Grotesk'] text-3xl font-bold text-white">78.4%</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>1,420 completed attempts</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Admin Panels: Modules & Recent Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8-col: Management shortcuts & Pipeline Status */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
              <h2 className="font-['Space_Grotesk'] text-base font-bold text-white">
                Core Academic Pipelines
              </h2>
              <span className="text-xs font-mono text-slate-400">Next.js App Router</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl liquid-glass-subtle flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-indigo-300 mb-1.5">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                    <span className="font-['Space_Grotesk'] font-semibold text-sm">
                      Structured Notes Tree
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Organize hierarchy (Batch &rarr; Subject &rarr; Chapter &rarr; Note). Presigned Cloudflare R2 uploads with 15-minute expiration.
                  </p>
                </div>
                <Link
                  href="/admin/notes"
                  className="text-xs font-['Space_Grotesk'] font-semibold text-indigo-300 hover:text-white flex items-center gap-1 self-start"
                >
                  <span>Open Notes Console</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>

              <div className="p-4 rounded-xl liquid-glass-subtle flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sky-300 mb-1.5">
                    <span className="material-symbols-outlined text-[20px]">table_view</span>
                    <span className="font-['Space_Grotesk'] font-semibold text-sm">
                      Excel Quiz Ingestion
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload `.xlsx` quizzes with instant browser row-validation and single-transaction Drizzle insertions.
                  </p>
                </div>
                <Link
                  href="/admin/quizzes/new"
                  className="text-xs font-['Space_Grotesk'] font-semibold text-sky-300 hover:text-white flex items-center gap-1 self-start"
                >
                  <span>Open Excel Ingestor</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </GlassCard>

          {/* High-Contrast Audit Table */}
          <GlassCard className="p-6">
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-white mb-4">
              System RBAC &amp; Integrity Audit
            </h3>
            <ReadingSurface className="p-4 bg-slate-900/90 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-2 border-r border-white/10 last:border-0">
                  <div className="text-slate-400 text-[11px]">Middleware Layer</div>
                  <div className="font-bold text-emerald-400 mt-1">Active Guard</div>
                </div>
                <div className="p-2 border-r border-white/10 last:border-0">
                  <div className="text-slate-400 text-[11px]">Server Actions</div>
                  <div className="font-bold text-emerald-400 mt-1">requireAdmin()</div>
                </div>
                <div className="p-2 border-r border-white/10 last:border-0">
                  <div className="text-slate-400 text-[11px]">Glass GPU Cap</div>
                  <div className="font-bold text-emerald-400 mt-1">&le; 3 Blurs / VP</div>
                </div>
                <div className="p-2">
                  <div className="text-slate-400 text-[11px]">Target Capacity</div>
                  <div className="font-bold text-sky-400 mt-1">1,000 Students</div>
                </div>
              </div>
            </ReadingSurface>
          </GlassCard>
        </div>

        {/* Right 4-col: Live Storage & Roster Quick Overview */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <GlassCard className="p-5">
            <h3 className="font-['Space_Grotesk'] text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-[18px]">
                cloud_done
              </span>
              <span>Cloudflare R2 Storage</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Direct client presigned uploads bypass server memory limits. $0 egress fees with short-lived 15-minute access URLs.
            </p>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-slate-300">
              Bucket: student-notes-portal
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-['Space_Grotesk'] text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-[18px]">
                badge
              </span>
              <span>Student Roster</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Bulk account provisioning from institution spreadsheets and gradebook exports.
            </p>
            <Link
              href="/admin/students"
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-['Space_Grotesk'] font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <span>View Roster</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
