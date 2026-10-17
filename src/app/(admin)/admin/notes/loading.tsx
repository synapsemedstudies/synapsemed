import React from "react";
import { GlassCard } from "@/components/ui/glass";

export default function AdminNotesLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-white/10 rounded-xl" />
        <div className="h-4 w-96 bg-white/5 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 flex flex-col gap-4">
          <GlassCard className="p-5 space-y-4">
            <div className="h-5 w-40 bg-white/10 rounded" />
            <div className="h-10 w-full bg-white/5 rounded-xl" />
            <div className="h-10 w-full bg-white/10 rounded-xl" />
          </GlassCard>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4">
          <GlassCard className="p-5 space-y-4 min-h-[360px]">
            <div className="h-5 w-48 bg-white/10 rounded" />
            <div className="h-10 w-full bg-white/5 rounded-xl" />
            <div className="h-28 w-full bg-white/[0.03] border border-white/5 rounded-xl" />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
