import React from "react";
import Link from "next/link";
import { requireStudent } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = await requireStudent();

  return (
    <div className="min-h-screen text-[#e2e8f0] relative">
      {/* Liquid Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-[#07080f]/55 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="h-16 w-full px-6 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-6 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1px] shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                <div className="w-full h-full rounded-[11px] bg-[#0c0e1a]/80 backdrop-blur-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-sky-200 text-[21px]">
                    neurology
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-['Space_Grotesk'] text-lg text-white font-bold tracking-tight leading-none">
                  Synapse<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">Med</span>
                </span>
                <span className="text-[10px] font-['Space_Grotesk'] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                  College Notes Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation tabs with fluid pill indicator */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full liquid-glass-subtle">
            <Link
              href="/dashboard"
              className="px-4 py-1.5 liquid-pill-active text-white text-xs font-['Space_Grotesk'] font-semibold rounded-full transition-all"
            >
              Medical Notes
            </Link>
            <Link
              href="/dashboard/quizzes"
              className="px-4 py-1.5 text-xs font-['Space_Grotesk'] font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-full transition-all"
            >
              Quiz Center
            </Link>
            <Link
              href="/dashboard/mistakes"
              className="px-4 py-1.5 text-xs font-['Space_Grotesk'] font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-full transition-all"
            >
              Mistake Notebook
            </Link>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full liquid-glass-subtle">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-[0_0_12px_rgba(129,140,248,0.5)]">
                <span className="material-symbols-outlined text-white text-[16px]">
                  person
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs text-slate-200 font-semibold font-['Space_Grotesk']">
                  {student.fullName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {student.rollNumber || "Student"}
                </span>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="w-9 h-9 rounded-full liquid-glass-subtle flex items-center justify-center text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[19px]">logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Left Sidebar (Medical Systems) */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#07080f]/45 backdrop-blur-2xl z-40 flex flex-col p-4 border-r border-white/[0.07] shadow-[4px_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[11px] font-['Space_Grotesk'] font-bold text-slate-400 uppercase tracking-widest">
            Medical Systems
          </span>
          <span className="text-[10px] font-['Space_Grotesk'] font-semibold px-2 py-0.5 rounded-full liquid-badge text-sky-300">
            8 Modules
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl liquid-pill-active text-white font-medium text-sm transition-all shadow-[0_4px_16px_rgba(99,102,241,0.2)]"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-sky-300">
                cardiology
              </span>
              <span className="font-['Space_Grotesk'] font-semibold text-white">
                Cardiovascular
              </span>
            </div>
            <span className="text-[11px] font-['Space_Grotesk'] font-bold px-2 py-0.5 rounded-full bg-indigo-400/25 border border-indigo-300/30 text-sky-200">
              38
            </span>
          </Link>

          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-slate-400">
                air
              </span>
              <span className="text-sm font-normal">Pulmonology</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">29</span>
          </div>

          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-slate-400">
                water_drop
              </span>
              <span className="text-sm font-normal">Nephrology</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">24</span>
          </div>

          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-slate-400">
                psychology
              </span>
              <span className="text-sm font-normal">Neurology</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">41</span>
          </div>

          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-slate-400">
                coronavirus
              </span>
              <span className="text-sm font-normal">Infectious Disease</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">33</span>
          </div>

          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-slate-400">
                pill
              </span>
              <span className="text-sm font-normal">Pharmacology</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">52</span>
          </div>

          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-slate-400">
                medical_services
              </span>
              <span className="text-sm font-normal">Surgery</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">19</span>
          </div>

          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-slate-400">
                biotech
              </span>
              <span className="text-sm font-normal">Pathology</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">46</span>
          </div>
        </nav>

        <div className="pt-3 border-t border-white/[0.08] flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 text-xs">
            <span className="font-['Space_Grotesk']">Batch</span>
            <span className="font-mono text-indigo-300 font-bold">{student.batchId || "MBBS 2025"}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="pl-64 relative z-10 pt-16">
        {children}
      </div>
    </div>
  );
}
