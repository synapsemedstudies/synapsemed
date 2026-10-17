import React from "react";
import { GlassCard } from "@/components/ui/glass";

export default function AdminDashboardLoading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-white/10 rounded-xl" />
          <div className="h-4 w-80 bg-white/5 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-36 bg-white/10 rounded-xl" />
          <div className="h-10 w-32 bg-white/5 rounded-xl" />
        </div>
      </div>

      {/* 3 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <GlassCard key={i} className="p-5 flex flex-col justify-between min-h-[130px]">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-28 bg-white/10 rounded" />
              <div className="w-6 h-6 rounded-lg bg-white/10" />
            </div>
            <div>
              <div className="h-8 w-16 bg-white/15 rounded-lg mb-2" />
              <div className="h-3 w-32 bg-white/5 rounded" />
            </div>
          </GlassCard>
        ))}
      </div>

      {/* 2 Functional Tools Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <GlassCard className="p-6 space-y-4">
            <div className="h-5 w-48 bg-white/10 rounded mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3 min-h-[140px]">
                <div className="h-5 w-32 bg-white/10 rounded" />
                <div className="h-3 w-full bg-white/5 rounded" />
                <div className="h-3 w-4/5 bg-white/5 rounded" />
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3 min-h-[140px]">
                <div className="h-5 w-36 bg-white/10 rounded" />
                <div className="h-3 w-full bg-white/5 rounded" />
                <div className="h-3 w-3/4 bg-white/5 rounded" />
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <GlassCard className="p-5 space-y-3">
            <div className="h-5 w-32 bg-white/10 rounded" />
            <div className="h-3 w-full bg-white/5 rounded" />
            <div className="h-10 w-full bg-white/10 rounded-xl mt-4" />
          </GlassCard>
          <GlassCard className="p-5 space-y-3">
            <div className="h-5 w-32 bg-white/10 rounded" />
            <div className="h-3 w-full bg-white/5 rounded" />
            <div className="h-10 w-full bg-white/10 rounded-xl mt-4" />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
