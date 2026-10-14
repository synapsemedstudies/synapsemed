import React from "react";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import { requireStudent } from "@/lib/auth";

export default async function MistakesPage() {
  await requireStudent();

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-8 pb-20">
      <div className="flex flex-col w-full max-w-7xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-white">
            Mistake Notebook
          </h1>
          <button
            type="button"
            className="px-4 py-2 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Practice My Mistakes (10 Questions)</span>
          </button>
        </div>
        <p className="text-slate-400 text-sm mb-6">
          Every missed question is indexed here with concept explanations until mastered.
        </p>

        <ReadingSurface className="p-6">
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[40px] text-emerald-400 mb-2">
              task_alt
            </span>
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-100">
              No Unresolved Mistakes
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Complete quiz attempts to automatically capture and review clinical questions you miss.
            </p>
          </div>
        </ReadingSurface>
      </div>
    </main>
  );
}
