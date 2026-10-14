import React from "react";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import { requireAdmin } from "@/lib/auth";

export default async function AdminNewQuizPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-white tracking-tight">
          Excel Quiz Ingestion Engine
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload SheetJS-compatible .xlsx spreadsheet with transactional validation.
        </p>
      </div>

      <GlassCard className="p-8 text-center border-dashed border-white/20">
        <span className="material-symbols-outlined text-[48px] text-indigo-400 mb-3">
          upload_file
        </span>
        <h3 className="font-['Space_Grotesk'] text-base font-bold text-white mb-1">
          Drag and drop quiz Excel (.xlsx) file
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
          SheetJS parser will validate questions, options, and chapter slugs client-side before committing to the database.
        </p>
        <button
          type="button"
          className="px-4 py-2 rounded-xl liquid-btn-primary text-white text-xs font-semibold"
        >
          Download Sample .xlsx Template
        </button>
      </GlassCard>
    </div>
  );
}
