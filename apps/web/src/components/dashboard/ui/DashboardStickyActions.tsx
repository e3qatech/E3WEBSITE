"use client";

import React from "react";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminButton } from "./AdminButton";

import { useLocale } from "@/components/layout/LocaleProvider";

export interface DashboardStickyActionsProps {
  onSave?: () => void;
  onDiscard?: () => void;
  isSaving?: boolean;
  isUnsaved?: boolean;
  saveLabel?: string;
  discardLabel?: string;
  statusMessage?: string;
  secondaryActions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function DashboardStickyActions({
  onSave,
  onDiscard,
  isSaving = false,
  isUnsaved = false,
  saveLabel,
  discardLabel,
  statusMessage,
  secondaryActions,
  children,
  className,
}: DashboardStickyActionsProps) {
  let locale: "en" | "ar" = "en";
  try {
    const localeCtx = useLocale();
    if (localeCtx) locale = (localeCtx.locale as "en" | "ar") || "en";
  } catch {
    // Fallback
  }
  const isAr = locale === "ar";

  const resolvedSaveLabel = saveLabel || (isAr ? "حفظ جميع التغييرات" : "Save All Changes");
  const resolvedDiscardLabel = discardLabel || (isAr ? "إلغاء التغييرات" : "Discard Changes");

  return (
    <div
      className={cn(
        "fixed bottom-0 inset-x-0 z-40 bg-[var(--surface-default)]/95 backdrop-blur-xl border-t border-[var(--border-level-1)] p-3 sm:p-4 shadow-2xl transition-all",
        className
      )}
    >
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left side status */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
          {isUnsaved ? (
            <span className="flex items-center gap-1.5 text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>{isAr ? "لديك تغييرات غير محفوظة" : "You have unsaved changes"}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? "تم حفظ جميع التغييرات في قاعدة البيانات" : "All changes saved to database"}</span>
            </span>
          )}
          {statusMessage && (
            <span className="hidden md:inline text-[var(--text-tertiary)]">• {statusMessage}</span>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-end">
          {secondaryActions}

          {onDiscard && isUnsaved && (
            <AdminButton
              variant="ghost"
              size="md"
              onClick={onDiscard}
              disabled={isSaving}
              className="text-xs"
            >
              {resolvedDiscardLabel}
            </AdminButton>
          )}

          {onSave && (
            <AdminButton
              variant="primary"
              size="md"
              onClick={onSave}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
              className="h-10 sm:h-11 px-5 rounded-xl font-bold shadow-lg shadow-purple-950/30"
            >
              {resolvedSaveLabel}
            </AdminButton>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
