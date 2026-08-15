"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { PRESENTATION_GROUPS, SafePublicTeamMember } from "@/lib/team/team-resolver";

interface DepartmentNavigatorProps {
  members: SafePublicTeamMember[];
  activeGroupKey: string;
  onSelectGroup: (key: string) => void;
  locale?: string;
}

export function DepartmentNavigator({
  members,
  activeGroupKey,
  onSelectGroup,
  locale = "en",
}: DepartmentNavigatorProps) {
  const isAr = locale === "ar";
  const railRef = useRef<HTMLDivElement>(null);

  // Compute counts dynamically for each presentation group
  const groupCounts = new Map<string, number>();
  groupCounts.set("all", members.length);

  members.forEach((m) => {
    const key = m.presentationGroupKey || "events-production";
    groupCounts.set(key, (groupCounts.get(key) || 0) + 1);
  });

  const tabs = [
    {
      key: "all",
      label: isAr ? "جميع القادة والمبدعين" : "All Masterminds",
      shortLabel: isAr ? "الكل" : "All",
      count: groupCounts.get("all") || 0,
    },
    ...PRESENTATION_GROUPS.map((g) => ({
      key: g.key,
      label: isAr ? g.labelAr : g.labelEn,
      shortLabel: isAr ? g.labelAr : g.labelEn,
      count: groupCounts.get(g.key) || 0,
    })),
  ];

  // Keyboard navigation across filter buttons
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = tabs.findIndex((t) => t.key === activeGroupKey);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === "ArrowRight") {
      nextIndex = isAr ? Math.max(0, currentIndex - 1) : Math.min(tabs.length - 1, currentIndex + 1);
    } else if (e.key === "ArrowLeft") {
      nextIndex = isAr ? Math.min(tabs.length - 1, currentIndex + 1) : Math.max(0, currentIndex - 1);
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== currentIndex) {
      e.preventDefault();
      onSelectGroup(tabs[nextIndex].key);
    }
  };

  // Scroll active tab into view smoothly on mobile
  useEffect(() => {
    if (!railRef.current) return;
    const activeButton = railRef.current.querySelector(`[data-tab-key="${activeGroupKey}"]`) as HTMLElement;
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeGroupKey]);

  return (
    <nav
      id="department-navigator"
      aria-label={isAr ? "أقسام فريق العمل" : "Team Departments"}
      className="sticky top-16 md:top-20 z-30 w-full py-3 bg-[var(--surface-default)]/85 dark:bg-slate-950/85 backdrop-blur-xl border-y border-[var(--border-level-2)] shadow-sm transition-colors"
      dir={isAr ? "rtl" : "ltr"}
      data-testid="department-navigator"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={railRef}
          className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth"
        >
          {tabs.map((tab) => {
            const isActive = activeGroupKey === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                data-tab-key={tab.key}
                data-testid={`dept-tab-${tab.key}`}
                onClick={() => onSelectGroup(tab.key)}
                className={`relative shrink-0 flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full text-xs md:text-sm font-bold tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  isActive
                    ? "text-white shadow-lg shadow-violet-600/20 scale-[1.02]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] bg-[var(--bg-level-1)] border border-[var(--border-level-1)]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Animated active pill background */}
                {isActive && (
                  <motion.div
                    layoutId="active-dept-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <span className="relative z-10 whitespace-nowrap">{tab.label}</span>

                {/* Count Badge */}
                <span
                  className={`relative z-10 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-black transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[var(--surface-default)] text-[var(--text-tertiary)] border border-[var(--border-level-1)]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
