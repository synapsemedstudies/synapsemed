import React from "react";

export default function Loading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      <p className="text-xs font-['Space_Grotesk'] text-slate-400">
        Loading PYQ Management Console...
      </p>
    </div>
  );
}
