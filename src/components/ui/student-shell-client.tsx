"use client";

import React from "react";
import Link from "next/link";
import { FluidNav } from "@/components/ui/fluid-nav";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import type { AuthenticatedUser } from "@/lib/auth";

const STUDENT_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Notes", href: "/dashboard/notes", icon: "menu_book" },
  { label: "Quizzes", href: "/dashboard/quizzes", icon: "timer" },
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
  return (
    <div className="min-h-screen text-[#e2e8f0] relative">
      {/* Liquid Glass Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-[#07080f]/75 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1px] shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full rounded-[11px] bg-[#0c0e1a]/80 backdrop-blur-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-sky-200 text-[18px] sm:text-[20px]">
                    neurology
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-['Space_Grotesk'] text-base sm:text-lg text-white font-bold tracking-tight leading-none">
                  Synapse<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">Med</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-['Space_Grotesk'] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                  Student Portal
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

      {/* Main Content Viewport */}
      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-20 md:pb-12 max-w-7xl mx-auto relative z-10">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav items={STUDENT_NAV_ITEMS} />
    </div>
  );
}
