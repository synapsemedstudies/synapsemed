import React from "react";
import Link from "next/link";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import { InteractiveBookmarkButton } from "@/components/ui/interactive-cards";

export default function StudentDashboardPage() {
  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-8 pb-20">
      <div className="flex flex-col w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="pt-8 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-['Space_Grotesk'] text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-[0_2px_12px_rgba(255,255,255,0.1)]">
              Medical College Notes
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 font-normal max-w-2xl">
              Peer-reviewed clinical summaries, core diagnostic frameworks, and pharmacotherapy guidelines.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-badge">
              <span className="material-symbols-outlined text-indigo-300 text-[17px]">
                verified
              </span>
              <span className="text-xs font-medium text-slate-200">
                Stanford Medicine Review
              </span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full liquid-glass-card text-sky-300 font-['Space_Grotesk'] font-semibold text-xs border border-sky-400/25">
              Spring 2025 Edition
            </div>
          </div>
        </div>

        {/* Liquid Search & Filter Bar */}
        <GlassCard className="p-2.5 mb-8 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search medical notes, conditions, pharmacological agents, clinical criteria..."
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.07] text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-indigo-400/60 focus:bg-white/[0.06] transition-all"
            />
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <select className="h-11 px-4 rounded-xl bg-[#0e1122] border border-white/[0.07] text-slate-200 font-['Space_Grotesk'] text-xs font-semibold focus:outline-none focus:border-indigo-400/60 cursor-pointer">
              <option>Cardiovascular System</option>
              <option>All Specialties</option>
              <option>Pulmonology</option>
              <option>Nephrology</option>
              <option>Neurology</option>
              <option>Infectious Disease</option>
            </select>
            <select className="h-11 px-4 rounded-xl bg-[#0e1122] border border-white/[0.07] text-slate-200 font-['Space_Grotesk'] text-xs font-semibold focus:outline-none focus:border-indigo-400/60 cursor-pointer">
              <option>Highest Yield</option>
              <option>Recently Updated</option>
              <option>Shortest Read</option>
            </select>
          </div>
        </GlassCard>

        {/* 2-Column Content Layout (Topics/Pearl + Notes Feed) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column Left (Topics Sub-nav & Clinical Pearl) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Cardiology Topics List Card */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.07]">
                <h2 className="font-['Space_Grotesk'] font-bold text-base text-white tracking-tight">
                  Cardiology Topics
                </h2>
                <span className="text-xs font-['Space_Grotesk'] font-semibold text-sky-300 px-2 py-0.5 rounded-full liquid-badge">
                  38 Notes
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center justify-between p-3 rounded-xl liquid-pill-active text-white font-medium cursor-pointer transition-all hover:translate-x-1">
                  <span className="font-['Space_Grotesk'] text-xs font-semibold text-white tracking-wide">
                    Valvular Heart Disease
                  </span>
                  <span className="text-[11px] font-['Space_Grotesk'] font-bold text-sky-200 bg-sky-400/20 border border-sky-300/30 px-2 py-0.5 rounded-full">
                    9
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer hover:translate-x-1">
                  <span className="text-xs font-normal">Heart Failure &amp; GDMT</span>
                  <span className="text-xs text-slate-500 font-medium">11</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer hover:translate-x-1">
                  <span className="text-xs font-normal">Arrhythmias &amp; Conduction</span>
                  <span className="text-xs text-slate-500 font-medium">12</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer hover:translate-x-1">
                  <span className="text-xs font-normal">Congenital Heart Defects</span>
                  <span className="text-xs text-slate-500 font-medium">6</span>
                </div>
              </div>
            </GlassCard>

            {/* Clinical Pearl Card with animated orb */}
            <GlassCard className="relative overflow-hidden p-5 group">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 group-hover:scale-125 transition-all duration-500" />
              <div className="flex items-center gap-2 mb-2 text-purple-300">
                <span className="material-symbols-outlined text-[19px] animate-pulse">lightbulb</span>
                <span className="font-['Space_Grotesk'] text-[11px] font-bold uppercase tracking-wider">
                  Clinical Pearl
                </span>
              </div>
              <h4 className="font-['Space_Grotesk'] font-bold text-base text-white">
                Drug-Induced Long QT
              </h4>
              <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                <strong className="text-white font-semibold">Mnemonic &apos;ABCDE&apos;:</strong> AntiArrhythmics, AntiBiotics, AntiC-ychotics, AntiDepressants, AntiEmetics. Management: IV Magnesium Sulfate.
              </p>
            </GlassCard>
          </div>

          {/* Column Right (High-Yield Note Cards) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Note Card 1 */}
            <GlassCard className="p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7),0_0_24px_rgba(129,140,248,0.18)] group">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full liquid-pill-active text-indigo-200 font-['Space_Grotesk'] text-[11px] font-semibold">
                    Microbiology &amp; Cardiology
                  </span>
                  <span className="text-slate-600 text-xs">•</span>
                  <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">
                      schedule
                    </span>{" "}
                    14 min read
                  </span>
                </div>
                <InteractiveBookmarkButton />
              </div>

              <h3 className="font-['Space_Grotesk'] font-bold text-xl text-white group-hover:text-indigo-200 transition-colors leading-snug">
                Infective Endocarditis: Modified Duke Criteria &amp; Empiric Regimens
              </h3>

              <ReadingSurface className="my-3 p-3.5 text-xs text-slate-200 bg-slate-900/80 border-slate-700/50 leading-relaxed">
                Diagnostic criteria breakdown (Definite: 2 Major or 1 Major + 3 Minor criteria). Typical pathogens: S. viridans (dental), S. aureus (IV drug use - tricuspid valve), and Enterococcus. Native vs prosthetic valve empiric coverage.
              </ReadingSurface>

              <div className="mt-4 pt-3.5 border-t border-white/[0.07] flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-indigo-400 text-[16px]">
                    verified
                  </span>
                  Prof. E. Thorne • Stanford Inpatient Medicine
                </span>
                <Link
                  href="/dashboard/notes"
                  className="px-4 py-2 rounded-xl liquid-btn-primary text-white font-['Space_Grotesk'] text-xs font-semibold flex items-center gap-1.5 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                >
                  <span>View Note</span>
                  <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </GlassCard>

            {/* Note Card 2 */}
            <GlassCard className="p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7),0_0_24px_rgba(129,140,248,0.18)] group">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/35 text-purple-200 font-['Space_Grotesk'] text-[11px] font-semibold">
                    Cardiovascular GDMT
                  </span>
                  <span className="text-slate-600 text-xs">•</span>
                  <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">
                      schedule
                    </span>{" "}
                    18 min read
                  </span>
                </div>
                <InteractiveBookmarkButton />
              </div>

              <h3 className="font-['Space_Grotesk'] font-bold text-xl text-white group-hover:text-indigo-200 transition-colors leading-snug">
                Heart Failure with Reduced Ejection Fraction (HFrEF): The 4 GDMT Pillars
              </h3>

              <ReadingSurface className="my-3 p-3.5 text-xs text-slate-200 bg-slate-900/80 border-slate-700/50 leading-relaxed">
                Comprehensive sequencing of mortality-reducing pharmacotherapy: ARNI/ACEi, evidence-based Beta-Blockers (Carvedilol, Metoprolol Succinate, Bisoprolol), Mineralocorticoid Receptor Antagonists, and SGLT2 inhibitors with renal monitoring parameters.
              </ReadingSurface>

              <div className="mt-4 pt-3.5 border-t border-white/[0.07] flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-indigo-400 text-[16px]">
                    verified
                  </span>
                  ACC/AHA 2024 Guideline Consensus
                </span>
                <Link
                  href="/dashboard/notes"
                  className="px-4 py-2 rounded-xl liquid-btn-primary text-white font-['Space_Grotesk'] text-xs font-semibold flex items-center gap-1.5 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                >
                  <span>View Note</span>
                  <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </GlassCard>

            {/* Note Card 3 */}
            <GlassCard className="p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7),0_0_24px_rgba(129,140,248,0.18)] group">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/35 text-sky-200 font-['Space_Grotesk'] text-[11px] font-semibold">
                    Clinical Skills &amp; Auscultation
                  </span>
                  <span className="text-slate-600 text-xs">•</span>
                  <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">
                      schedule
                    </span>{" "}
                    12 min read
                  </span>
                </div>
                <InteractiveBookmarkButton />
              </div>

              <h3 className="font-['Space_Grotesk'] font-bold text-xl text-white group-hover:text-indigo-200 transition-colors leading-snug">
                Aortic Stenosis vs Mitral Regurgitation: Auscultation &amp; Hemodynamics
              </h3>

              <ReadingSurface className="my-3 p-3.5 text-xs text-slate-200 bg-slate-900/80 border-slate-700/50 leading-relaxed">
                Physical exam differentiation: Crescendo-decrescendo radiation to carotids with pulsus parvus et tardus versus holosystolic radiation to the axilla. Response to dynamic bedside maneuvers including Squatting, Handgrip, and Valsalva.
              </ReadingSurface>

              <div className="mt-4 pt-3.5 border-t border-white/[0.07] flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-indigo-400 text-[16px]">
                    verified
                  </span>
                  Academic Hospital Clerkship Committee
                </span>
                <Link
                  href="/dashboard/notes"
                  className="px-4 py-2 rounded-xl liquid-btn-primary text-white font-['Space_Grotesk'] text-xs font-semibold flex items-center gap-1.5 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                >
                  <span>View Note</span>
                  <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}
