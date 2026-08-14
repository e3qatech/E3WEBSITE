"use client";

import React from "react";
import { ShieldX, Home, LogIn } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface DashboardAccessDeniedProps {
  title?: string;
  message?: string;
  requiredRole?: string;
  requiredPermission?: string;
  className?: string;
}

export function DashboardAccessDenied({
  title = "Access Restricted",
  message = "Your current account does not have sufficient permissions to view or manage this administrative module.",
  requiredRole,
  requiredPermission,
  className,
}: DashboardAccessDeniedProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 sm:p-12 text-center max-w-lg mx-auto my-12 space-y-5 shadow-sm",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
        <ShieldX className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
          403 Forbidden
        </span>
        <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">{title}</h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{message}</p>
      </div>

      {(requiredRole || requiredPermission) && (
        <div className="p-3 bg-[var(--surface-default)] rounded-xl border border-[var(--border-level-1)] text-xs text-[var(--text-tertiary)] max-w-xs mx-auto text-start">
          {requiredRole && (
            <div>
              <span className="font-semibold text-[var(--text-secondary)]">Required Role:</span>{" "}
              <code className="text-purple-400 font-mono font-bold">{requiredRole}</code>
            </div>
          )}
          {requiredPermission && (
            <div className="mt-1">
              <span className="font-semibold text-[var(--text-secondary)]">Required Capability:</span>{" "}
              <code className="text-pink-400 font-mono font-bold">{requiredPermission}</code>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
        <Link
          href="/login/admin"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-level-1)] text-xs font-bold transition-all"
        >
          <LogIn className="w-4 h-4" />
          <span>Switch Account</span>
        </Link>
      </div>
    </div>
  );
}
