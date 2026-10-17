import React from "react";
import { GlassCard } from "@/components/ui/glass";

export default function QuizzesLoading() {
  return (
    <main className="w-full min-h-[calc(100vh-4rem)] px-4 sm:px-8 pb-20 animate-pulse">
      <div className="flex flex-col w-full max-w-7xl mx-auto pt-6 sm:pt-8">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <div className="h-8 w-56 bg-white/10 rounded-xl" />
          <div className="h-4 w-72 bg-white/5 rounded-lg" />
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <GlassCard key={i} className="p-6 flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-5 w-20 rounded-full bg-white/10" />
                  <div className="h-4 w-16 rounded bg-white/5" />
                </div>
                <div className="h-6 w-5/6 bg-white/10 rounded-lg mb-3" />
                <div className="space-y-2 mb-4">
                  <div className="h-3.5 w-full bg-white/5 rounded" />
                  <div className="h-3.5 w-2/3 bg-white/5 rounded" />
                </div>
              </div>
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <div className="h-4 w-24 bg-white/5 rounded" />
                <div className="h-8 w-24 bg-white/10 rounded-xl" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </main>
  );
}
