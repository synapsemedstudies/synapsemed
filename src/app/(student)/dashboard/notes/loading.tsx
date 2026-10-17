import React from "react";
import { GlassCard, ReadingSurface } from "@/components/ui/glass";

export default function NotesLoading() {
  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-8 pb-20 animate-pulse">
      <div className="flex flex-col w-full max-w-7xl mx-auto pt-6 sm:pt-8">
        {/* Header Skeleton */}
        <div className="mb-6 space-y-2">
          <div className="h-8 w-60 bg-white/10 rounded-xl" />
          <div className="h-4 w-72 bg-white/5 rounded-lg" />
        </div>

        {/* Top Controls Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-32 bg-white/5 rounded-xl" />
            <div className="h-3 w-40 bg-white/5 rounded-full" />
          </div>
          <div className="h-9 w-full sm:w-72 bg-white/5 rounded-xl" />
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Tree Skeleton */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <GlassCard className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="h-4 w-32 bg-white/10 rounded" />
                <div className="h-4 w-16 bg-white/5 rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="h-8 w-full bg-white/[0.07] rounded-lg" />
                <div className="ml-4 space-y-2">
                  <div className="h-7 w-5/6 bg-white/[0.04] rounded-lg" />
                  <div className="h-7 w-4/6 bg-white/[0.04] rounded-lg" />
                </div>
                <div className="h-8 w-full bg-white/[0.07] rounded-lg" />
                <div className="ml-4 space-y-2">
                  <div className="h-7 w-3/4 bg-white/[0.04] rounded-lg" />
                </div>
                <div className="h-8 w-full bg-white/[0.07] rounded-lg" />
              </div>
            </GlassCard>
          </div>

          {/* Right Reading Canvas Skeleton */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <ReadingSurface className="p-8 sm:p-12 min-h-[480px] flex flex-col items-center justify-center text-center bg-slate-950/80 rounded-2xl border border-white/10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 mb-4" />
              <div className="h-6 w-56 bg-white/10 rounded-lg mb-3" />
              <div className="h-4 w-72 bg-white/5 rounded mb-2" />
              <div className="h-4 w-60 bg-white/5 rounded mb-6" />
              <div className="flex gap-2">
                <div className="h-7 w-28 bg-white/5 rounded-full" />
                <div className="h-7 w-32 bg-white/5 rounded-full" />
              </div>
            </ReadingSurface>
          </div>
        </div>
      </div>
    </main>
  );
}
