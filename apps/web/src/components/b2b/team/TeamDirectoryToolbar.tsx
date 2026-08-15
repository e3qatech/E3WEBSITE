"use client";

import React from "react";
import { Search, X, ChevronDown, RotateCcw } from "lucide-react";

interface DepartmentOption {
  key: string;
  nameEn: string;
  nameAr: string;
  count: number;
}

interface TeamDirectoryToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDepartment: string;
  onSelectDepartment: (deptKey: string) => void;
  departments: DepartmentOption[];
  totalMembersCount: number;
  filteredCount: number;
  locale?: string;
}

export function TeamDirectoryToolbar({
  searchQuery,
  onSearchChange,
  selectedDepartment,
  onSelectDepartment,
  departments,
  totalMembersCount,
  filteredCount,
  locale = "en",
}: TeamDirectoryToolbarProps) {
  const isAr = locale === "ar";
  const isFiltered = searchQuery.trim().length > 0 || selectedDepartment !== "all";

  const handleReset = () => {
    onSearchChange("");
    onSelectDepartment("all");
  };

  return (
    <div
      id="team-directory"
      data-testid="team-directory-toolbar"
      dir={isAr ? "rtl" : "ltr"}
      className="sticky top-16 md:top-20 z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 mb-8"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[var(--surface-default)]/90 backdrop-blur-xl border border-[var(--border-level-1)] shadow-xl">
        
        {/* Left / Start: Search Input */}
        <div className="relative flex-1 group">
          <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--color-primary)] transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isAr
                ? "ابحث في الفريق بالاسم، المسمى، أو التخصص..."
                : "Search roster by name, role, or specialty..."
            }
            data-testid="team-search-input"
            className="w-full bg-[var(--bg-level-2)] border border-[var(--border-level-1)] rounded-xl py-2 ps-9 pe-9 text-xs sm:text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder:text-[var(--text-tertiary)] shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              data-testid="clear-team-search"
              className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              aria-label={isAr ? "مسح البحث" : "Clear search"}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right / End: Department Select Dropdown & Reset */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Department Select */}
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={(e) => onSelectDepartment(e.target.value)}
              data-testid="team-department-select"
              aria-label={isAr ? "تصفية حسب القسم" : "Filter by department"}
              className="appearance-none bg-[var(--bg-level-2)] hover:bg-[var(--surface-hover)] border border-[var(--border-level-1)] rounded-xl py-2 ps-3.5 pe-9 text-xs sm:text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-all cursor-pointer shadow-sm"
            >
              <option value="all">
                {isAr ? `جميع الأقسام (${totalMembersCount})` : `All Departments (${totalMembersCount})`}
              </option>
              {departments.map((dept) => (
                <option key={dept.key} value={dept.key}>
                  {isAr ? dept.nameAr : dept.nameEn} ({dept.count})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
          </div>

          {/* Reset Filters CTA (if active) */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              data-testid="reset-team-filters"
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors cursor-pointer"
              title={isAr ? "إعادة تعيين الفلاتر" : "Reset filters"}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? "إعادة ضبط" : "Reset"}</span>
            </button>
          )}

          {/* Result Count Badge */}
          <span className="text-xs font-mono font-bold text-[var(--text-tertiary)] px-2">
            {filteredCount} {isAr ? "عضو" : "members"}
          </span>
        </div>
      </div>
    </div>
  );
}
