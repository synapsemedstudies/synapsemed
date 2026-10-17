import React from "react";
import { GlassCard } from "@/components/ui/glass";

export default function AdminNewQuizLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-white/10 rounded-xl" />
        <div className="h-4 w-96 bg-white/5 rounded-lg" />
      </div>

      {/* Dropzone Card Skeleton */}
      <GlassCard className="p-8 sm:p-12 flex flex-col items-center justify-center min-h-[380px] text-center border-dashed border-2 border-white/20">
        <div className="w-16 h-16 rounded-3xl bg-white/10 mb-4" />
        <div className="h-6 w-60 bg-white/10 rounded-lg mb-3" />
        <div className="h-4 w-80 bg-white/5 rounded mb-6" />
        <div className="h-10 w-48 bg-white/10 rounded-xl" />
      </GlassCard>
    </div>
  );
}
