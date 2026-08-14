"use client";

import React from "react";
import { Search, Grid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DashboardToolbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filterControls?: React.ReactNode;
  viewMode?: "grid" | "table" | "list";
  onViewModeChange?: (mode: "grid" | "table" | "list") => void;
  totalCount?: number;
  filteredCount?: number;
  countLabel?: string;
  actionButton?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function DashboardToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search records...",
  filterControls,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
  countLabel = "items",
  actionButton,
  children,
  className,
}: DashboardToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] shadow-sm",
        className
      )}
    >
      {/* Left side: Search & Filters */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
        {onSearchChange && (
          <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full ps-9 pe-3.5 h-10 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
            />
          </div>
        )}

        {filterControls}

        {totalCount !== undefined && (
          <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-lg bg-[var(--bg-level-1)] text-[11px] font-mono font-bold text-[var(--text-tertiary)] border border-[var(--border-level-1)]">
            {filteredCount !== undefined && filteredCount !== totalCount
              ? `${filteredCount} of ${totalCount} ${countLabel}`
              : `${totalCount} ${countLabel}`}
          </span>
        )}
      </div>

      {/* Right side: View mode & Action button */}
      <div className="flex items-center gap-2.5 shrink-0 justify-end">
        {viewMode && onViewModeChange && (
          <div className="flex items-center p-1 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)]">
            <button
              onClick={() => onViewModeChange("table")}
              type="button"
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-[var(--surface-default)] text-[var(--color-primary)] shadow-sm font-bold"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              )}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              type="button"
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-[var(--surface-default)] text-[var(--color-primary)] shadow-sm font-bold"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              )}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        )}

        {actionButton}
        {children}
      </div>
    </div>
  );
}
