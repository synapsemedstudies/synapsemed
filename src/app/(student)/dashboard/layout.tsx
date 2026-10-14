import React from "react";
import Link from "next/link";
import { requireStudent } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { FluidNav } from "@/components/ui/fluid-nav";
import { InteractiveSidebarNav } from "@/components/ui/interactive-cards";

const STUDENT_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Notes Library", href: "/dashboard/notes", icon: "menu_book" },
  { label: "Quiz Center", href: "/dashboard/quizzes", icon: "timer" },
  { label: "Mistake Notebook", href: "/dashboard/mistakes", icon: "edit_note" },
];

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
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1px] shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-transform duration-300 group-hover:scale-105">
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

          {/* Dynamic Moving Parts: Smoothly Sliding Fluid Nav */}
          <div className="hidden md:block">
            <FluidNav items={STUDENT_NAV_ITEMS} />
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full liquid-glass-subtle transition-all duration-200 hover:border-white/20">
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
                className="w-9 h-9 rounded-full liquid-glass-subtle flex items-center justify-center text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all duration-200 active:scale-90"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[19px]">logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Left Sidebar (Medical Systems with animated indicator) */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#07080f]/45 backdrop-blur-2xl z-40 flex flex-col p-4 border-r border-white/[0.07] shadow-[4px_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[11px] font-['Space_Grotesk'] font-bold text-slate-400 uppercase tracking-widest">
            Medical Systems
          </span>
          <span className="text-[10px] font-['Space_Grotesk'] font-semibold px-2 py-0.5 rounded-full liquid-badge text-sky-300">
            8 Modules
          </span>
        </div>

        <InteractiveSidebarNav />

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
