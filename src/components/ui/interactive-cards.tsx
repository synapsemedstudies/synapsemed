"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  initialBookmarked?: boolean;
  className?: string;
}

export function InteractiveBookmarkButton({
  initialBookmarked = false,
  className,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isBouncing, setIsBouncing] = useState(false);

  const toggle = () => {
    setIsBouncing(true);
    setBookmarked((prev) => !prev);
    setTimeout(() => setIsBouncing(false), 300);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={bookmarked ? "Saved to Bookmarks" : "Save Bookmark"}
      className={cn(
        "p-1.5 rounded-lg transition-all duration-200 select-none",
        bookmarked
          ? "text-sky-300 bg-sky-400/15 border border-sky-400/30 shadow-[0_0_12px_rgba(56,189,248,0.3)]"
          : "text-slate-400 hover:text-white hover:bg-white/[0.08]",
        isBouncing && "scale-125 transition-transform duration-150",
        className
      )}
    >
      <span className="material-symbols-outlined text-[20px] transition-transform">
        {bookmarked ? "bookmark_added" : "bookmark_add"}
      </span>
    </button>
  );
}

interface MedicalModule {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const MEDICAL_MODULES: MedicalModule[] = [
  { id: "cardio", name: "Cardiovascular", icon: "cardiology", count: 38 },
  { id: "pulmo", name: "Pulmonology", icon: "air", count: 29 },
  { id: "nephro", name: "Nephrology", icon: "water_drop", count: 24 },
  { id: "neuro", name: "Neurology", icon: "psychology", count: 41 },
  { id: "infect", name: "Infectious Disease", icon: "coronavirus", count: 33 },
  { id: "pharm", name: "Pharmacology", icon: "pill", count: 52 },
  { id: "surg", name: "Surgery", icon: "medical_services", count: 19 },
  { id: "patho", name: "Pathology", icon: "biotech", count: 46 },
];

export function InteractiveSidebarNav() {
  const [selectedModule, setSelectedModule] = useState("cardio");

  return (
    <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
      {MEDICAL_MODULES.map((mod) => {
        const isSelected = selectedModule === mod.id;

        return (
          <button
            key={mod.id}
            type="button"
            onClick={() => setSelectedModule(mod.id)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group text-left",
              isSelected
                ? "liquid-pill-active text-white shadow-[0_4px_16px_rgba(99,102,241,0.25)] translate-x-1"
                : "text-slate-300 hover:text-white hover:bg-white/[0.05] hover:translate-x-0.5"
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "material-symbols-outlined text-[20px] transition-colors",
                  isSelected
                    ? "text-sky-300"
                    : "text-slate-400 group-hover:text-sky-300"
                )}
              >
                {mod.icon}
              </span>
              <span
                className={cn(
                  isSelected
                    ? "font-['Space_Grotesk'] font-semibold text-white"
                    : "font-normal"
                )}
              >
                {mod.name}
              </span>
            </div>
            <span
              className={cn(
                "text-[11px] font-['Space_Grotesk'] font-bold px-2 py-0.5 rounded-full transition-all",
                isSelected
                  ? "bg-indigo-400/25 border border-indigo-300/30 text-sky-200"
                  : "text-slate-500 group-hover:text-slate-300"
              )}
            >
              {mod.count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
