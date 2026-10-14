import React from "react";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import { requireAdmin } from "@/lib/auth";

export default async function AdminNotesPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-white tracking-tight">
          Notes Library Manager
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage medical subjects, chapters, and presigned Cloudflare R2 PDF uploads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <GlassCard className="p-5">
            <h2 className="font-['Space_Grotesk'] text-base font-bold text-white mb-3">
              Subjects &amp; Chapters
            </h2>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300">
              CRUD interface for Subjects &amp; Chapters will be wired in Slice 2.
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-7">
          <ReadingSurface className="p-6">
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-100 mb-2">
              Cloudflare R2 Direct Uploader
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Upload PDF notes directly from browser to R2 via 15-minute presigned PUT URLs.
            </p>
            <div className="border border-dashed border-slate-700 rounded-xl p-8 text-center text-xs text-slate-400">
              Presigned R2 Dropzone (Slice 2)
            </div>
          </ReadingSurface>
        </div>
      </div>
    </div>
  );
}
