import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { FluidNav } from "@/components/ui/fluid-nav";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "space_dashboard" },
  { label: "Notes", href: "/admin/notes", icon: "menu_book" },
  { label: "Excel Quiz", href: "/admin/quizzes/new", icon: "upload_file" },
  { label: "Students", href: "/admin/students", icon: "group" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen text-[#e2e8f0] relative">
      {/* Liquid Glass Admin Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-[#07080f]/75 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Logo with Admin Badge */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-indigo-500 to-sky-400 p-[1px] shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full rounded-[11px] bg-[#0c0e1a]/80 backdrop-blur-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-rose-300 text-[18px] sm:text-[20px]">
                    admin_panel_settings
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-['Space_Grotesk'] text-base sm:text-lg text-white font-bold tracking-tight leading-none">
                    Synapse<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-300">Med</span>
                  </span>
                  <span className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[9px] sm:text-[10px] font-['Space_Grotesk'] font-bold uppercase tracking-wider">
                    Admin
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-['Space_Grotesk'] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                  Faculty &amp; Exam Console
                </span>
              </div>
            </Link>
          </div>

          {/* Dynamic Moving Admin Navigation Pills (Desktop) */}
          <div className="hidden md:block">
            <FluidNav items={ADMIN_NAV_ITEMS} />
          </div>

          {/* Admin Profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1 rounded-full liquid-glass-subtle">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                <span className="material-symbols-outlined text-white text-[14px] sm:text-[16px]">
                  security
                </span>
              </div>
              <span className="hidden sm:inline text-xs text-slate-200 font-semibold font-['Space_Grotesk']">
                {admin.fullName}
              </span>
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

      {/* Main Admin Viewport with bottom padding for mobile bar */}
      <div className="pt-20 px-4 sm:px-8 md:px-12 pb-20 md:pb-16 max-w-7xl mx-auto relative z-10">
        {children}
      </div>

      {/* Admin Mobile Bottom Navigation */}
      <MobileBottomNav items={ADMIN_NAV_ITEMS} />
    </div>
  );
}
