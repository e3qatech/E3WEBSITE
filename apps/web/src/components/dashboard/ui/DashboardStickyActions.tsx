"use client";

import React from "react";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminButton } from "./AdminButton";

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
  saveLabel = "Save All Changes",
  discardLabel = "Discard Changes",
  statusMessage,
  secondaryActions,
  children,
  className,
}: DashboardStickyActionsProps) {
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
              <span>You have unsaved changes</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>All changes saved to database</span>
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
              {discardLabel}
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
              {saveLabel}
            </AdminButton>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
