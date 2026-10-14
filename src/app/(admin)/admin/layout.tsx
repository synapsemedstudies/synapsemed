import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen text-[#e2e8f0] relative">
      {/* Liquid Glass Admin Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-[#07080f]/60 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="h-16 w-full px-6 flex items-center justify-between gap-6">
          {/* Logo with Admin Badge */}
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-indigo-500 to-sky-400 p-[1px] shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                <div className="w-full h-full rounded-[11px] bg-[#0c0e1a]/80 backdrop-blur-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-rose-300 text-[20px]">
                    admin_panel_settings
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-['Space_Grotesk'] text-lg text-white font-bold tracking-tight leading-none">
                    Synapse<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-300">Med</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-['Space_Grotesk'] font-bold uppercase tracking-wider">
                    Admin
                  </span>
                </div>
                <span className="text-[10px] font-['Space_Grotesk'] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                  Faculty &amp; Exam Console
                </span>
              </div>
            </Link>
          </div>

          {/* Admin Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full liquid-glass-subtle">
            <Link
              href="/admin"
              className="px-4 py-1.5 liquid-pill-active text-white text-xs font-['Space_Grotesk'] font-semibold rounded-full transition-all"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/notes"
              className="px-4 py-1.5 text-xs font-['Space_Grotesk'] font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-full transition-all"
            >
              Notes Library
            </Link>
            <Link
              href="/admin/quizzes/new"
              className="px-4 py-1.5 text-xs font-['Space_Grotesk'] font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-full transition-all"
            >
              Excel Quiz Importer
            </Link>
            <Link
              href="/admin/students"
              className="px-4 py-1.5 text-xs font-['Space_Grotesk'] font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-full transition-all"
            >
              Student Roster
            </Link>
          </nav>

          {/* Admin Profile & Logout */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full liquid-glass-subtle">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                <span className="material-symbols-outlined text-white text-[16px]">
                  security
                </span>
              </div>
              <span className="text-xs text-slate-200 font-semibold font-['Space_Grotesk']">
                {admin.fullName}
              </span>
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

      {/* Main Admin Viewport */}
      <div className="pt-20 px-6 md:px-12 pb-16 max-w-7xl mx-auto relative z-10">
        {children}
      </div>
    </div>
  );
}
