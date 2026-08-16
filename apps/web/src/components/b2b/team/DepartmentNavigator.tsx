"use client";

import React, { useMemo } from "react";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import { SafePublicTeamMember } from "@/lib/team/team-resolver";
import { cn } from "@/lib/utils";

interface DepartmentNavigatorProps {
  members: SafePublicTeamMember[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDepartment: string;
  onSelectDepartment: (dept: string) => void;
  filteredCount: number;
  locale?: string;
}

export function DepartmentNavigator({
  members,
  searchQuery,
  onSearchChange,
  selectedDepartment,
  onSelectDepartment,
  filteredCount,
  locale = "en",
}: DepartmentNavigatorProps) {
  const isAr = locale === "ar";

  // Derive unique departments and their member counts
  const departmentOptions = useMemo(() => {
    const deptMap = new Map<string, { label: string; count: number }>();

    members.forEach((m) => {
      const deptName = (m.department || (isAr ? "عام" : "General")).trim();
      if (!deptName) return;

      const existing = deptMap.get(deptName);
      if (existing) {
        existing.count += 1;
      } else {
        deptMap.set(deptName, {
          label: deptName,
          count: 1,
        });
      }
    });

    return Array.from(deptMap.entries())
      .map(([key, data]) => ({
        key,
        label: data.label,
        count: data.count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [members, isAr]);

  const hasActiveFilters = Boolean(searchQuery.trim() || (selectedDepartment && selectedDepartment !== "all"));

  const handleReset = () => {
    onSearchChange("");
    onSelectDepartment("all");
  };

  return (
    <nav
      id="department-navigator"
      aria-label={isAr ? "بحث وتصفية فريق العمل" : "Search & Filter Team"}
      className="sticky top-16 md:top-20 z-30 w-full py-3 bg-[var(--surface-default)]/90 backdrop-blur-xl border-y border-[var(--border-level-2)] shadow-sm transition-colors"
      dir={isAr ? "rtl" : "ltr"}
      data-testid="department-navigator"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 md:gap-4">
          
          {/* ========================================================== */}
          {/* 1. COMPACT SEARCH BAR                                      */}
          {/* ========================================================== */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-[var(--color-primary)]">
              <Search className="w-4 h-4 opacity-80" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={
                isAr
                  ? "ابحث بالاسم، المسمى الوظيفي، أو التخصص..."
                  : "Search by name, role, or skill..."
              }
              data-testid="team-search-input"
              className={cn(
                "w-full ps-10 pe-10 py-2.5 rounded-full text-xs sm:text-sm font-medium",
                "bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-[var(--text-primary)]",
                "placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500",
                "transition-all shadow-inner"
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                data-testid="clear-search-btn"
                className="absolute inset-y-0 end-0 pe-3 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                aria-label={isAr ? "مسح البحث" : "Clear search"}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ========================================================== */}
          {/* 2. DEPARTMENT DROPDOWN & RESET CTA                         */}
          {/* ========================================================== */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Department Select Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                <Filter className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => onSelectDepartment(e.target.value)}
                data-testid="department-select-dropdown"
                className={cn(
                  "ps-9 pe-8 py-2.5 rounded-full text-xs sm:text-sm font-semibold cursor-pointer appearance-none",
                  "bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-[var(--text-primary)]",
                  "focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500",
                  "transition-all shadow-sm w-full sm:w-auto min-w-[170px]"
                )}
                aria-label={isAr ? "اختر القسم" : "Select Department"}
              >
                <option value="all" className="bg-[var(--surface-default)] text-[var(--text-primary)]">
                  {isAr ? `جميع الأقسام (${members.length})` : `All Departments (${members.length})`}
                </option>
                {departmentOptions.map((dept) => (
                  <option
                    key={dept.key}
                    value={dept.key}
                    className="bg-[var(--surface-default)] text-[var(--text-primary)]"
                  >
                    {dept.label} ({dept.count})
                  </option>
                ))}
              </select>
              {/* Dropdown Chevron */}
              <div className="absolute inset-y-0 end-0 pe-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Reset Filters Button (Appears only when search or filter is active) */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                data-testid="reset-filters-btn"
                className="px-3.5 py-2.5 rounded-full bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                title={isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAr ? "إعادة ضبط" : "Reset"}</span>
              </button>
            )}

            {/* Results Count Badge */}
            <div className="hidden lg:flex items-center text-xs font-bold font-mono px-3.5 py-2 rounded-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-tertiary)] shrink-0 shadow-inner">
              <span>
                {filteredCount} {isAr ? "عضو معتمد" : "specialists"}
              </span>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
