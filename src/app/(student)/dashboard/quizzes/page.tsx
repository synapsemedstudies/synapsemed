import React from "react";
import { GlassCard } from "@/components/ui/glass";
import { requireStudent } from "@/lib/auth";

export default async function QuizzesPage() {
  await requireStudent();

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-8 pb-20">
      <div className="flex flex-col w-full max-w-7xl mx-auto pt-8">
        <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-white mb-2">
          Quiz Center
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Timed clinical tests with automated grading and Mistake Notebook synchronization.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full liquid-pill-active text-[11px] font-semibold text-indigo-200">
                  Cardiology
                </span>
                <span className="text-xs text-slate-400">15 mins</span>
              </div>
              <h3 className="font-['Space_Grotesk'] font-bold text-lg text-white mb-2">
                Cardiovascular Diagnostics &amp; Murmurs
              </h3>
              <p className="text-xs text-slate-300">
                25 High-yield clinical scenario questions with negative marking.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-xs text-slate-400">Status: Ready</span>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-xl liquid-btn-primary text-white text-xs font-semibold"
              >
                Start Quiz
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
