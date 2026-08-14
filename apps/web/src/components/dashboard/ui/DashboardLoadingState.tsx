"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminSkeleton } from "./AdminSkeleton";

export interface DashboardLoadingStateProps {
  title?: string;
  description?: string;
  type?: "skeleton" | "spinner" | "cards" | "table";
  timeoutMs?: number;
  onTimeout?: () => void;
  className?: string;
}

export function DashboardLoadingState({
  title = "Loading dashboard content...",
  description = "Please wait while records are fetched and synchronized.",
  type = "skeleton",
  timeoutMs = 12000,
  onTimeout,
  className,
}: DashboardLoadingStateProps) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
      if (onTimeout) onTimeout();
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [timeoutMs, onTimeout]);

  if (timedOut) {
    return (
      <div className={cn("p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[var(--border-level-1)] bg-[var(--surface-default)] space-y-4 max-w-lg mx-auto my-8", className)}>
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
          <RefreshCw className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">Loading is taking longer than expected</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">The request may have timed out or the network is slow. You can retry the request.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          type="button"
          className="px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Page</span>
        </button>
      </div>
    );
  }

  if (type === "spinner") {
    return (
      <div className={cn("flex flex-col items-center justify-center p-12 space-y-4 text-center min-h-[260px]", className)}>
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
          <Sparkles className="w-4 h-4 text-[var(--color-primary)] absolute animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[var(--text-primary)]">{title}</h4>
          <p className="text-xs text-[var(--text-secondary)] max-w-xs">{description}</p>
        </div>
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="h-24 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] p-4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-36 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] animate-pulse" />
          <div className="h-36 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] animate-pulse" />
          <div className="h-36 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 w-full animate-pulse", className)}>
      {/* Header Skeleton */}
      <div className="rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <AdminSkeleton variant="text" width="220px" height="24px" />
            <AdminSkeleton variant="text" width="340px" height="14px" />
          </div>
          <AdminSkeleton variant="rectangular" width="120px" height="40px" />
        </div>
      </div>

      {/* Content Skeletons */}
      <div className="rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-6 space-y-4">
        <AdminSkeleton variant="text" width="180px" height="18px" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminSkeleton variant="rectangular" height="44px" />
          <AdminSkeleton variant="rectangular" height="44px" />
        </div>
        <AdminSkeleton variant="rectangular" height="100px" />
      </div>
    </div>
  );
}
