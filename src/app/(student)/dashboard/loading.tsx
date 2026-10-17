import React from "react";
import { GlassCard } from "@/components/ui/glass";

export default function StudentDashboardLoading() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-white/10 rounded-xl" />
          <div className="h-4 w-40 bg-white/5 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-white/10 rounded-xl" />
          <div className="h-10 w-32 bg-white/5 rounded-xl" />
        </div>
      </div>

      {/* 2 Modules Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 sm:p-8 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10" />
              <div className="h-6 w-20 rounded-full bg-white/5" />
            </div>
            <div className="h-6 w-48 bg-white/10 rounded-lg mb-3" />
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-white/5 rounded" />
              <div className="h-3.5 w-4/5 bg-white/5 rounded" />
            </div>
          </div>
          <div className="mt-8 h-10 w-full rounded-xl bg-white/10" />
        </GlassCard>

        <GlassCard className="p-6 sm:p-8 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10" />
              <div className="h-6 w-24 rounded-full bg-white/5" />
            </div>
            <div className="h-6 w-44 bg-white/10 rounded-lg mb-3" />
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-white/5 rounded" />
              <div className="h-3.5 w-3/4 bg-white/5 rounded" />
            </div>
          </div>
          <div className="mt-8 h-10 w-full rounded-xl bg-white/10" />
        </GlassCard>
      </div>
    </div>
  );
}
