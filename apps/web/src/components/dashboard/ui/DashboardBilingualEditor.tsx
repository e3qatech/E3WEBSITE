"use client";

import React, { useState, useEffect } from "react";
import { Globe, Columns2, AlignLeft, AlignRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type LanguageEditMode = "both" | "en" | "ar";

export interface DashboardLanguageSwitchProps {
  mode: LanguageEditMode;
  onModeChange: (mode: LanguageEditMode) => void;
  className?: string;
}

export function DashboardLanguageSwitch({
  mode,
  onModeChange,
  className,
}: DashboardLanguageSwitchProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center p-1 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] shadow-sm",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onModeChange("both")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
          mode === "both"
            ? "bg-[var(--color-primary)] text-white shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
        )}
        title="Side-by-Side bilingual editing"
      >
        <Columns2 className="w-3.5 h-3.5" />
        <span>Both (EN + AR)</span>
      </button>

      <button
        type="button"
        onClick={() => onModeChange("en")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
          mode === "en"
            ? "bg-[var(--color-primary)] text-white shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
        )}
        title="English only (LTR)"
      >
        <AlignLeft className="w-3.5 h-3.5" />
        <span>English</span>
      </button>

      <button
        type="button"
        onClick={() => onModeChange("ar")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
          mode === "ar"
            ? "bg-[var(--color-primary)] text-white shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
        )}
        title="Arabic only (RTL)"
      >
        <AlignRight className="w-3.5 h-3.5" />
        <span>العربية</span>
      </button>
    </div>
  );
}

export interface DashboardBilingualFieldProps {
  label: string;
  description?: string;
  valueEn: string;
  valueAr: string;
  onChangeEn: (val: string) => void;
  onChangeAr: (val: string) => void;
  placeholderEn?: string;
  placeholderAr?: string;
  required?: boolean;
  type?: "text" | "textarea";
  rows?: number;
  mode?: LanguageEditMode;
  className?: string;
}

export function DashboardBilingualField({
  label,
  description,
  valueEn,
  valueAr,
  onChangeEn,
  onChangeAr,
  placeholderEn = "Enter English text...",
  placeholderAr = "أدخل النص باللغة العربية...",
  required = false,
  type = "text",
  rows = 3,
  mode = "both",
  className,
}: DashboardBilingualFieldProps) {
  const showEn = mode === "both" || mode === "en";
  const showAr = mode === "both" || mode === "ar";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      </div>
      {description && (
        <p className="text-xs text-[var(--text-tertiary)]">{description}</p>
      )}

      <div
        className={cn(
          "grid gap-4",
          mode === "both" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
        )}
      >
        {/* English Field */}
        {showEn && (
          <div className="relative">
            <span className="absolute start-3 top-3 text-[10px] font-mono font-black uppercase text-[var(--text-tertiary)] bg-[var(--surface-active)] px-1.5 py-0.5 rounded border border-[var(--border-level-1)] pointer-events-none z-10">
              EN
            </span>
            {type === "textarea" ? (
              <textarea
                dir="ltr"
                rows={rows}
                value={valueEn || ""}
                onChange={(e) => onChangeEn(e.target.value)}
                placeholder={placeholderEn}
                required={required}
                className="w-full ps-12 pe-4 py-2.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all resize-y"
              />
            ) : (
              <input
                type="text"
                dir="ltr"
                value={valueEn || ""}
                onChange={(e) => onChangeEn(e.target.value)}
                placeholder={placeholderEn}
                required={required}
                className="w-full ps-12 pe-4 h-10 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
              />
            )}
          </div>
        )}

        {/* Arabic Field */}
        {showAr && (
          <div className="relative">
            <span className="absolute end-3 top-3 text-[10px] font-mono font-black uppercase text-[var(--text-tertiary)] bg-[var(--surface-active)] px-1.5 py-0.5 rounded border border-[var(--border-level-1)] pointer-events-none z-10">
              AR
            </span>
            {type === "textarea" ? (
              <textarea
                dir="rtl"
                rows={rows}
                value={valueAr || ""}
                onChange={(e) => onChangeAr(e.target.value)}
                placeholder={placeholderAr}
                required={required}
                className="w-full pe-12 ps-4 py-2.5 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all resize-y font-sans"
              />
            ) : (
              <input
                type="text"
                dir="rtl"
                value={valueAr || ""}
                onChange={(e) => onChangeAr(e.target.value)}
                placeholder={placeholderAr}
                required={required}
                className="w-full pe-12 ps-4 h-10 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all font-sans"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
