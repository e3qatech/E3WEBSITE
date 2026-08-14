"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface DashboardPageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * "focused": max-w-5xl (optimal for long form editors & CMS pages)
   * "wide": max-w-7xl (for data tables, kanban boards, operations)
   * "full": max-w-none w-full
   */
  variant?: "focused" | "wide" | "full";
  className?: string;
  noPadding?: boolean;
}

export function DashboardPageShell({
  children,
  variant = "focused",
  className,
  noPadding = false,
  ...props
}: DashboardPageShellProps) {
  const maxWidthClass = {
    focused: "max-w-5xl",
    wide: "max-w-7xl",
    full: "w-full max-w-none",
  }[variant];

  return (
    <div
      className={cn(
        "mx-auto w-full transition-all duration-300 space-y-6 pb-24 animate-in fade-in-50",
        maxWidthClass,
        !noPadding && "p-4 sm:p-6 md:p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
