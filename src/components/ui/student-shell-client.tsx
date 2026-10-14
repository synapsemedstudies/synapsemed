"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FluidNav } from "@/components/ui/fluid-nav";
import { InteractiveSidebarNav } from "@/components/ui/interactive-cards";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import type { AuthenticatedUser } from "@/lib/auth";

const STUDENT_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Notes", href: "/dashboard/notes", icon: "menu_book" },
  { label: "Quizzes", href: "/dashboard/quizzes", icon: "timer" },
  { label: "Mistakes", href: "/dashboard/mistakes", icon: "edit_note" },
];

interface StudentShellClientProps {
  student: AuthenticatedUser;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}

export function StudentShellClient({
  student,
  logoutAction,
  children,
}: StudentShellClientProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen text-[#e2e8f0] relative">
      {/* Liquid Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-[#07080f]/75 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Logo & Mobile Menu Trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl liquid-glass-subtle text-slate-300 hover:text-white"
              title="Open Medical Systems"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>

            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1px] shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full rounded-[11px] bg-[#0c0e1a]/80 backdrop-blur-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-sky-200 text-[18px] sm:text-[21px]">
                    neurology
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-['Space_Grotesk'] text-base sm:text-lg text-white font-bold tracking-tight leading-none">
                  Synapse<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">Med</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-['Space_Grotesk'] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                  College Notes Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Fluid Nav */}
          <div className="hidden md:block">
            <FluidNav items={STUDENT_NAV_ITEMS} />
          </div>

          {/* Profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1 rounded-full liquid-glass-subtle">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center shadow-[0_0_12px_rgba(129,140,248,0.5)]">
                <span className="material-symbols-outlined text-white text-[14px] sm:text-[16px]">
                  person
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
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
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full liquid-glass-subtle flex items-center justify-center text-slate-400 hover:text-rose-400 transition-all duration-200 active:scale-90"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[17px] sm:text-[19px]">logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 bg-[#07080f]/45 backdrop-blur-2xl z-30 flex-col p-4 border-r border-white/[0.07] shadow-[4px_0_30px_rgba(0,0,0,0.5)]">
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

      {/* Mobile Slideover Drawer for Medical Systems */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-[#07080f]/95 backdrop-blur-2xl p-4 flex flex-col border-r border-white/10 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-white">
                Medical Systems
              </span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <InteractiveSidebarNav />
          </div>
        </div>
      )}

      {/* Main Content Viewport: responsive pl-0 on mobile, lg:pl-64 on desktop */}
      <div className="pl-0 lg:pl-64 relative z-10 pt-16 pb-16 md:pb-0">
        {children}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav items={STUDENT_NAV_ITEMS} />
    </div>
  );
}
