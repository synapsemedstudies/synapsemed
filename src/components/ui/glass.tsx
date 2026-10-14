import React from "react";
import { cn } from "@/lib/utils";

/**
 * Ambient Canvas Backdrop
 * Fixed mesh/aurora radial gradients with blurred fluid light orbs for translucent glass refraction.
 */
export function AmbientBackdrop(): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <div className="absolute -top-40 -left-40 w-[640px] h-[640px] bg-gradient-to-br from-indigo-600/25 via-purple-600/15 to-transparent rounded-full blur-[130px]" />
      <div className="absolute top-[20%] right-[-10%] w-[700px] h-[700px] bg-gradient-to-bl from-sky-500/15 via-indigo-500/15 to-transparent rounded-full blur-[150px]" />
      <div className="absolute bottom-[-15%] left-[20%] w-[680px] h-[680px] bg-gradient-to-tr from-violet-600/20 via-fuchsia-600/10 to-transparent rounded-full blur-[160px]" />
      <div className="absolute top-[45%] left-[45%] w-[450px] h-[450px] bg-gradient-to-r from-cyan-500/10 to-indigo-600/10 rounded-full blur-[140px]" />
    </div>
  );
}

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  variant?: "default" | "subtle" | "active";
}

/**
 * Liquid Glass Chrome & Cards
 * Frosted backdrop-blur-xl with specular inner border and refractive depth.
 * Applied to floating navbars, collapsible sidebars, KPI cards, timer pills, and dropzones.
 */
export function GlassCard({
  children,
  className,
  variant = "default",
  ...props
}: GlassCardProps): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-200",
        variant === "default" &&
          "backdrop-blur-xl bg-white/10 dark:bg-slate-900/45 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_32px_rgba(0,0,0,0.25)]",
        variant === "subtle" &&
          "backdrop-blur-xl bg-white/[0.04] dark:bg-slate-900/30 border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_20px_rgba(0,0,0,0.3)]",
        variant === "active" &&
          "backdrop-blur-xl bg-indigo-500/20 border border-indigo-300/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_0_20px_rgba(99,102,241,0.3)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ReadingSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

/**
 * High-Contrast Reading & Testing Surface
 * Crisp, high-contrast matte surface ensuring WCAG >= 4.5:1 text readability.
 * Used for PDF note canvases, quiz question stems, answer options, and score explanations.
 * Contains ZERO backdrop-blur on inner elements to avoid eye fatigue and maintain 60 FPS.
 */
export function ReadingSurface({
  children,
  className,
  ...props
}: ReadingSurfaceProps): JSX.Element {
  return (
    <div
      className={cn(
        "bg-white/95 dark:bg-slate-950/90 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
