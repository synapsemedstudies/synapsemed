import React from "react";
import { GlassCard } from "@/components/ui/glass";

export default function AdminStudentsLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-60 bg-white/10 rounded-xl" />
          <div className="h-4 w-80 bg-white/5 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-white/5 rounded-xl" />
          <div className="h-10 w-36 bg-white/10 rounded-xl" />
        </div>
      </div>

      {/* Roster Table Card Skeleton */}
      <GlassCard className="p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="h-9 w-64 bg-white/5 rounded-xl" />
          <div className="h-6 w-32 bg-white/5 rounded-full" />
        </div>

        {/* Table Rows Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              className="h-12 w-full rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between px-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <div className="space-y-1">
                  <div className="h-3.5 w-32 bg-white/10 rounded" />
                  <div className="h-2.5 w-48 bg-white/5 rounded" />
                </div>
              </div>
              <div className="h-4 w-20 bg-white/5 rounded" />
              <div className="h-4 w-16 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
