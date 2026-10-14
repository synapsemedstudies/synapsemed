import React from "react";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";
import { requireStudent } from "@/lib/auth";

export default async function NotesPage() {
  await requireStudent();

  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-8 pb-20">
      <div className="flex flex-col w-full max-w-7xl mx-auto pt-8">
        <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-white mb-2">
          Structured Notes Library
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Access high-yield medical study notes organized by subject and chapter.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4">
            <GlassCard className="p-5">
              <h2 className="font-['Space_Grotesk'] font-bold text-base text-white mb-3">
                Cardiovascular Chapters
              </h2>
              <div className="flex flex-col gap-2 text-sm">
                <div className="p-3 rounded-xl liquid-pill-active text-white text-xs font-semibold">
                  Chapter 1: Valvular Heart Disease
                </div>
                <div className="p-3 rounded-xl text-slate-300 text-xs">
                  Chapter 2: Heart Failure &amp; GDMT
                </div>
                <div className="p-3 rounded-xl text-slate-300 text-xs">
                  Chapter 3: Arrhythmias &amp; Conduction
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-8">
            <ReadingSurface className="p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[48px] text-slate-400 mb-2">
                menu_book
              </span>
              <h3 className="font-['Space_Grotesk'] font-bold text-lg text-slate-100">
                Watermarked Medical PDF Viewer
              </h3>
              <p className="text-slate-400 text-xs max-w-md mt-1">
                Cloudflare R2 Presigned Document Viewer with dynamic anti-leak watermark will mount here in Slice 2.
              </p>
            </ReadingSurface>
          </div>
        </div>
      </div>
    </main>
  );
}
