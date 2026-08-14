"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface DashboardSectionCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}

export function DashboardSectionCard({
  title,
  description,
  icon,
  badge,
  headerAction,
  children,
  noPadding = false,
  className,
  ...props
}: DashboardSectionCardProps) {
  const hasHeader = title || description || icon || badge || headerAction;

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] shadow-sm transition-all overflow-hidden",
        className
      )}
      {...props}
    >
      {hasHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-level-1)] px-5 py-4 sm:px-6 bg-[var(--bg-level-1)]/40">
          <div className="flex items-start sm:items-center gap-3">
            {icon && (
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-500/10 text-[var(--color-primary)] border border-purple-500/20 shrink-0">
                {icon}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {title && (
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight">
                    {title}
                  </h3>
                )}
                {badge}
              </div>
              {description && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 max-w-2xl leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {headerAction && (
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              {headerAction}
            </div>
          )}
        </div>
      )}

      <div className={cn(!noPadding && "p-5 sm:p-6 space-y-5")}>
        {children}
      </div>
    </div>
  );
}
