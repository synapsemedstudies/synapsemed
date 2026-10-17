import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen text-[#e2e8f0] relative selection:bg-indigo-500/30 selection:text-white">
      {/* Liquid Glass Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-[#07080f]/75 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1px] shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full rounded-[11px] bg-[#0c0e1a]/80 backdrop-blur-md flex items-center justify-center">
                <span className="material-symbols-outlined text-sky-200 text-[20px]">
                  neurology
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] text-lg font-bold text-white tracking-tight leading-none">
                Synapse<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">Med</span>
              </span>
              <span className="text-[9px] font-['Space_Grotesk'] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                Medical Learning Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href={user.role === "admin" ? "/admin" : "/dashboard"}
                className="px-4 py-2 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
              >
                <span>Go to {user.role === "admin" ? "Admin Console" : "Dashboard"}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl liquid-glass-subtle hover:bg-white/10 text-white text-xs font-['Space_Grotesk'] font-semibold transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
                >
                  Join as Student
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-card border border-indigo-400/30 text-indigo-200 text-xs font-['Space_Grotesk'] font-semibold mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Spring 2026 Medical Cohort System Live</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-['Space_Grotesk'] text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          Master Clinical Medicine.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400">
            Faster. Sharper. Retained.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
          The unified medical study portal designed for medical students and educators. 
          Structured clinical notes and timed exam simulations with instant grading and zero lag.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl liquid-btn-primary text-white font-['Space_Grotesk'] font-semibold text-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(99,102,241,0.45)]"
          >
            <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            <span>Create Student Account</span>
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl liquid-glass-card hover:bg-white/10 text-white font-['Space_Grotesk'] font-semibold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">login</span>
            <span>Faculty &amp; Student Sign In</span>
          </Link>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl w-full">
          <div className="p-3 rounded-xl liquid-glass-subtle text-center">
            <span className="block font-['Space_Grotesk'] text-lg font-bold text-white">15-Min</span>
            <span className="text-[11px] text-slate-400">Timed Quizzes</span>
          </div>
          <div className="p-3 rounded-xl liquid-glass-subtle text-center">
            <span className="block font-['Space_Grotesk'] text-lg font-bold text-sky-300">0$ Egress</span>
            <span className="text-[11px] text-slate-400">PDF Storage</span>
          </div>
          <div className="p-3 rounded-xl liquid-glass-subtle text-center">
            <span className="block font-['Space_Grotesk'] text-lg font-bold text-purple-300">Auto-Save</span>
            <span className="text-[11px] text-slate-400">Exam Protection</span>
          </div>
          <div className="p-3 rounded-xl liquid-glass-subtle text-center">
            <span className="block font-['Space_Grotesk'] text-lg font-bold text-emerald-300">Edge RBAC</span>
            <span className="text-[11px] text-slate-400">Strict Separation</span>
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-white">
            Built for Serious Medical Education
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Everything medical students need to excel in clinical exams without bloated interfaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card 1: Notes Library */}
          <GlassCard className="p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                <span className="material-symbols-outlined text-[26px]">library_books</span>
              </div>
              <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-2">
                Structured Notes Library
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Hierarchical clinical syllabus organized by Subject &rarr; Chapter. Notes are delivered with private, short-lived presigned URLs for rapid, distraction-free study.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.08]">
              <span className="text-[11px] font-mono text-indigo-300">Direct S3 / R2 streaming</span>
            </div>
          </GlassCard>

          {/* Card 2: Timed Quizzes */}
          <GlassCard className="p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                <span className="material-symbols-outlined text-[26px]">timer</span>
              </div>
              <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white mb-2">
                Timed Quiz Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Exam-grade runner with client-side auto-save. If your browser closes or network drops, your answers and timer remain preserved upon reconnecting.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.08]">
              <span className="text-[11px] font-mono text-sky-300">Instant transactional grading</span>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Security Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <ReadingSurface className="p-6 sm:p-8 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">shield</span>
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">
                Institutional Role-Based Access Control (RBAC)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Strict separation between students and faculty accounts enforced at the Next.js edge and PostgreSQL Row-Level Security (RLS).
              </p>
            </div>
          </div>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold shrink-0 hover:brightness-110 transition-all"
          >
            Get Started Now
          </Link>
        </ReadingSurface>
      </section>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-white/[0.08] text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} SynapseMed College Learning Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}
