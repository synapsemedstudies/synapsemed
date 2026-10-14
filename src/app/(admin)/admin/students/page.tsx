import React from "react";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import { requireAdmin } from "@/lib/auth";

export default async function AdminStudentsPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-white tracking-tight">
            Student Roster &amp; Cohort Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Bulk provision up to 1,000 medical students and export test score reports.
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-['Space_Grotesk'] font-semibold flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">group_add</span>
          <span>Bulk Import (.xlsx)</span>
        </button>
      </div>

      <GlassCard className="p-6">
        <h3 className="font-['Space_Grotesk'] text-base font-bold text-white mb-4">
          Current Enrolled Roster
        </h3>
        <ReadingSurface className="p-6 text-center text-xs text-slate-400 bg-slate-900/90">
          Student roster table with zero-blur row optimization (Slice 5)
        </ReadingSurface>
      </GlassCard>
    </div>
  );
}
