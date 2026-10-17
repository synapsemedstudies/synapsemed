"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface MobileNavItem {
  label: string;
  href: string;
  icon: string;
}

interface MobileBottomNavProps {
  items: MobileNavItem[];
}

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [optimisticHref, setOptimisticHref] = React.useState<string | null>(null);
  const effectivePath = optimisticHref || pathname;

  React.useEffect(() => {
    setOptimisticHref(null);
  }, [pathname]);

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 z-50 bg-[#07080f]/85 backdrop-blur-2xl border-t border-white/[0.1] px-2 flex items-center justify-around shadow-[0_-4px_24px_rgba(0,0,0,0.6)]"
    >
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
            onClick={() => setOptimisticHref(item.href)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200",
              isActive
                ? "text-sky-300 font-semibold scale-105"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <div
              className={cn(
                "w-9 h-7 rounded-full flex items-center justify-center transition-all",
                isActive && "liquid-pill-active"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
            </div>
            <span className="text-[10px] font-['Space_Grotesk'] tracking-tight mt-0.5 truncate max-w-[70px]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
