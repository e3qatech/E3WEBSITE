"use client";

import React, { useState } from "react";
import { AlertTriangle, RotateCcw, ChevronDown, ChevronUp, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminButton } from "./AdminButton";

export interface DashboardErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string | null;
  onRetry?: () => void;
  showHomeLink?: boolean;
  className?: string;
}

export function DashboardErrorState({
  title = "Failed to load dashboard module",
  message = "An error occurred while loading this section. Please try again or verify system connectivity.",
  error,
  onRetry,
  showHomeLink = true,
  className,
}: DashboardErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);

  const errorString = error instanceof Error ? error.message : typeof error === "string" ? error : null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 sm:p-10 text-center max-w-xl mx-auto my-8 space-y-4 shadow-sm",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">{title}</h3>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{message}</p>
      </div>

      {errorString && (
        <div className="text-start">
          <button
            onClick={() => setShowDetails(!showDetails)}
            type="button"
            className="flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:underline mx-auto cursor-pointer"
          >
            <span>{showDetails ? "Hide Error Details" : "View Technical Details"}</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDetails && (
            <pre className="mt-2 p-3 bg-black/40 border border-rose-500/20 rounded-xl text-[11px] font-mono text-rose-300 overflow-x-auto max-h-40 custom-scrollbar">
              {errorString}
            </pre>
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-3 pt-2">
        {onRetry && (
          <AdminButton
            variant="primary"
            onClick={onRetry}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs h-9 px-4"
          >
            Retry Request
          </AdminButton>
        )}

        {showHomeLink && (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-default)] border border-[var(--border-level-1)] transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard Overview</span>
          </Link>
        )}
      </div>
    </div>
  );
}
