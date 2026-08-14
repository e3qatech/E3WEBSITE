"use client";

import React, { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Check, AlertCircle, ChevronDown, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EditorSectionItem {
  id: string;
  label: string;
  labelAr?: string;
  icon?: React.ReactNode;
  isUnsaved?: boolean;
  hasError?: boolean;
  badge?: string | number;
  count?: number;
}

export interface DashboardSectionNavigatorProps {
  sections: EditorSectionItem[];
  activeSectionId: string;
  onSectionChange: (sectionId: string) => void;
  isSticky?: boolean;
  className?: string;
}

export function DashboardSectionNavigator({
  sections,
  activeSectionId,
  onSectionChange,
  isSticky = true,
  className,
}: DashboardSectionNavigatorProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);

  const currentIndex = sections.findIndex((s) => s.id === activeSectionId);
  const activeSection = sections[currentIndex] || sections[0];

  // URL Hash synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && sections.some((s) => s.id === hash)) {
        onSectionChange(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [sections, onSectionChange]);

  // Update hash when active section changes
  const handleSelectSection = (sectionId: string) => {
    onSectionChange(sectionId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${sectionId}`);
    }
    setDropdownOpen(false);

    // Scroll active tab into view horizontally
    const tabEl = document.getElementById(`section-tab-${sectionId}`);
    if (tabEl && tabsContainerRef.current) {
      tabEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleSelectSection(sections[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < sections.length - 1) {
      handleSelectSection(sections[currentIndex + 1].id);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] shadow-sm transition-all z-20 mb-6",
        isSticky && "sticky top-4 backdrop-blur-xl bg-[var(--surface-default)]/95",
        className
      )}
    >
      {/* Desktop & Tablet Navigation */}
      <div className="hidden md:flex items-center justify-between p-2 gap-2">
        {/* Horizontal Tabs Scroll Area */}
        <div
          ref={tabsContainerRef}
          className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 px-1 min-w-0 flex-1"
        >
          {sections.map((section, index) => {
            const isActive = section.id === activeSectionId;
            return (
              <button
                key={section.id}
                id={`section-tab-${section.id}`}
                onClick={() => handleSelectSection(section.id)}
                type="button"
                className={cn(
                  "relative flex items-center gap-2 h-10 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none cursor-pointer shrink-0 border",
                  isActive
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md shadow-purple-950/30"
                    : "bg-[var(--bg-level-1)] text-[var(--text-secondary)] border-[var(--border-level-1)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] hover:border-[var(--color-primary)]/40"
                )}
              >
                {/* Index / Icon */}
                <span
                  className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-mono font-bold shrink-0",
                    isActive ? "bg-white/20 text-white" : "bg-[var(--surface-active)] text-[var(--text-tertiary)]"
                  )}
                >
                  {section.icon ? section.icon : index + 1}
                </span>

                <span className="truncate">{section.label}</span>

                {/* Unsaved indicator dot */}
                {section.isUnsaved && (
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      isActive ? "bg-white animate-pulse" : "bg-amber-400"
                    )}
                    title="Section contains unsaved edits"
                  />
                )}

                {/* Validation Error badge */}
                {section.hasError && (
                  <span title="Section contains validation errors" className="shrink-0 flex items-center">
                    <AlertCircle className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-rose-400")} />
                  </span>
                )}

                {/* Optional count badge */}
                {section.badge !== undefined && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0",
                      isActive ? "bg-white/20 text-white" : "bg-[var(--surface-active)] text-[var(--text-tertiary)]"
                    )}
                  >
                    {section.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dropdown Quick Selector & Step Controls */}
        <div className="flex items-center gap-1.5 shrink-0 ps-2 border-s border-[var(--border-level-1)]">
          {/* Quick Section Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              type="button"
              className="flex items-center gap-1.5 h-9 px-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-level-1)] border border-[var(--border-level-1)] hover:border-[var(--color-primary)] transition-all cursor-pointer"
              title="Jump to section"
            >
              <ListFilter className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span className="hidden lg:inline">Jump to</span>
              <ChevronDown className="w-3 h-3 text-[var(--text-tertiary)]" />
            </button>

            {dropdownOpen && (
              <div className="absolute end-0 top-full mt-2 w-64 rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 max-h-80 overflow-y-auto custom-scrollbar">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] border-b border-[var(--border-level-1)] mb-1">
                  All Sections ({sections.length})
                </div>
                {sections.map((section, idx) => {
                  const isCur = section.id === activeSectionId;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSelectSection(section.id)}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-xs transition-colors cursor-pointer text-start",
                        isCur
                          ? "bg-[var(--surface-selected)] text-[var(--color-primary)] font-bold"
                          : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] text-[var(--text-tertiary)] shrink-0">#{idx + 1}</span>
                        <span className="truncate">{section.label}</span>
                      </span>
                      {isCur && <Check className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Previous / Next buttons */}
          <button
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            type="button"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-level-1)] border border-[var(--border-level-1)] hover:border-[var(--color-primary)] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            title="Previous Section"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= sections.length - 1}
            type="button"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-level-1)] border border-[var(--border-level-1)] hover:border-[var(--color-primary)] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            title="Next Section"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Mobile View Navigation: Current Section Name + Prev/Next Selector */}
      <div className="flex md:hidden items-center justify-between p-3 gap-2">
        <div className="relative flex-1 min-w-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            type="button"
            className="flex items-center justify-between w-full h-10 px-3.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-xs font-bold text-[var(--text-primary)] text-start truncate"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-5 h-5 rounded-md bg-[var(--color-primary)] text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                {currentIndex + 1}
              </span>
              <span className="truncate">{activeSection?.label || "Select Section"}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] shrink-0 ms-2" />
          </button>

          {dropdownOpen && (
            <div className="absolute start-0 end-0 top-full mt-2 rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 max-h-72 overflow-y-auto">
              {sections.map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => handleSelectSection(section.id)}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-start",
                    section.id === activeSectionId
                      ? "bg-[var(--surface-selected)] text-[var(--color-primary)] font-bold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                  )}
                >
                  <span className="truncate">
                    #{idx + 1} {section.label}
                  </span>
                  {section.id === activeSectionId && <Check className="w-4 h-4 text-[var(--color-primary)] shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            type="button"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-[var(--text-secondary)] disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= sections.length - 1}
            type="button"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-[var(--text-secondary)] disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
