"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavTabItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
}

export interface FluidNavProps {
  items: NavTabItem[];
  className?: string;
}

export function FluidNav({ items, className }: FluidNavProps) {
  const pathname = usePathname();
  const [optimisticHref, setOptimisticHref] = useState<string | null>(null);
  const effectivePath = optimisticHref || pathname;
  const containerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // Reset optimistic state whenever the actual pathname changes
  useEffect(() => {
    setOptimisticHref(null);
  }, [pathname]);

  const updatePill = useCallback(() => {
    if (!containerRef.current) return;

    // Find the item matching current effective path best
    let activeIndex = items.findIndex((item) => item.href === effectivePath);
    if (activeIndex === -1) {
      activeIndex = items.findIndex(
        (item) =>
          item.href !== "/dashboard" &&
          item.href !== "/admin" &&
          effectivePath.startsWith(item.href)
      );
    }
    if (activeIndex === -1) {
      // Default fallback to first matching base path
      if (effectivePath.startsWith("/admin")) {
        activeIndex = items.findIndex((item) => item.href === "/admin");
      } else {
        activeIndex = items.findIndex((item) => item.href === "/dashboard");
      }
    }

    if (activeIndex !== -1) {
      const links = containerRef.current.querySelectorAll<HTMLAnchorElement>("a[data-nav-item]");
      const activeLink = links[activeIndex];
      if (activeLink) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        setPillStyle({
          left: linkRect.left - containerRect.left,
          width: linkRect.width,
          opacity: 1,
        });
        return;
      }
    }

    setPillStyle((prev) => ({ ...prev, opacity: 0 }));
  }, [items, effectivePath]);

  useEffect(() => {
    updatePill();
    window.addEventListener("resize", updatePill);
    return () => window.removeEventListener("resize", updatePill);
  }, [updatePill]);

  return (
    <nav
      ref={containerRef}
      className={cn(
        "relative flex items-center p-1 rounded-full liquid-glass-subtle overflow-hidden select-none",
        className
      )}
    >
      {/* Smoothly Sliding Fluid Pill Indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-full liquid-pill-active pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_20px_rgba(99,102,241,0.4)]"
        style={{
          transform: `translateX(${pillStyle.left}px)`,
          width: `${pillStyle.width}px`,
          opacity: pillStyle.opacity,
        }}
      />

      {items.map((item) => {
        const isActive =
          effectivePath === item.href ||
          (item.href !== "/dashboard" &&
            item.href !== "/admin" &&
            effectivePath.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            data-nav-item="true"
            onClick={() => setOptimisticHref(item.href)}
            className={cn(
              "relative z-10 px-4 py-1.5 text-xs font-['Space_Grotesk'] font-semibold rounded-full transition-colors duration-200 flex items-center gap-1.5",
              isActive
                ? "text-white"
                : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            {item.icon && (
              <span className="material-symbols-outlined text-[15px]">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
