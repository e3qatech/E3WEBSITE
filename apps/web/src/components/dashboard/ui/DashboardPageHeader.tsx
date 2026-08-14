"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardBreadcrumbs, BreadcrumbItem } from "./DashboardBreadcrumbs";
import { AdminButton } from "./AdminButton";
import { useLocale } from "@/components/layout/LocaleProvider";
import { localizeHref } from "@/lib/url-helper";

export interface DashboardPageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  badge?: {
    label: string;
    variant?: "default" | "success" | "warning" | "error" | "purple" | "cyan" | "indigo" | "amber" | "info";
  };
  previewUrl?: string;
  previewLabel?: string;
  isUnsaved?: boolean;
  lastSavedAt?: string | Date;
  secondaryAction?: React.ReactNode;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    variant?: "primary" | "secondary" | "danger" | "success";
  };
  children?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}

export function DashboardPageHeader({
  title,
  description,
  breadcrumbs,
  badge,
  previewUrl,
  previewLabel = "Preview Public Page",
  isUnsaved,
  lastSavedAt,
  secondaryAction,
  primaryAction,
  children,
  sticky = false,
  className,
}: DashboardPageHeaderProps) {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const localizedPreviewUrl = previewUrl ? localizeHref(previewUrl, locale) : undefined;
  const displayPreviewLabel = previewLabel === "Preview Public Page" && isAr ? "معاينة الصفحة العامة" : previewLabel;

  const badgeColors = {
    default: "bg-[var(--surface-active)] text-[var(--text-secondary)] border-[var(--border-level-1)]",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    error: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    info: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  }[badge?.variant || "default"];

  const formattedSavedTime = lastSavedAt
    ? typeof lastSavedAt === "string"
      ? lastSavedAt
      : lastSavedAt.toLocaleTimeString(isAr ? "ar-QA" : "en-US")
    : null;

  return (
    <header
      className={cn(
        "rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-5 md:p-6 shadow-sm transition-all mb-6",
        sticky && "sticky top-0 z-30 backdrop-blur-xl bg-[var(--surface-default)]/95 shadow-md",
        className
      )}
    >
      {/* Top row: Breadcrumbs & Status Indicator */}
      <div className="flex items-center justify-between gap-4 mb-3 border-b border-[var(--border-level-1)]/60 pb-3">
        {breadcrumbs ? (
          <DashboardBreadcrumbs items={breadcrumbs} />
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3 text-xs shrink-0 font-medium">
          {isUnsaved && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{isAr ? "تغييرات غير محفوظة" : "Unsaved changes"}</span>
            </span>
          )}

          {lastSavedAt && !isUnsaved && (
            <span className="hidden sm:flex items-center gap-1.5 text-[var(--text-tertiary)] text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{isAr ? `تم الحفظ ${formattedSavedTime}` : `Saved ${formattedSavedTime}`}</span>
            </span>
          )}
        </div>
      </div>

      {/* Middle/Main row: Title, Description, & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {title}
            </h1>

            {badge && (
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border",
                  badgeColors
                )}
              >
                {badge.label}
              </span>
            )}
          </div>

          {description && (
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 self-start lg:self-center">
          {localizedPreviewUrl && (
            <Link
              href={localizedPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-level-1)] border border-[var(--border-level-1)] hover:border-[var(--color-primary)] transition-all shadow-sm cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>{displayPreviewLabel}</span>
            </Link>
          )}

          {secondaryAction}

          {primaryAction && (
            primaryAction.href ? (
              <Link href={localizeHref(primaryAction.href, locale)}>
                <AdminButton
                  variant={primaryAction.variant || "primary"}
                  isLoading={primaryAction.isLoading}
                  disabled={primaryAction.disabled}
                  leftIcon={primaryAction.icon}
                  className="h-10 sm:h-11 px-5 rounded-xl font-bold shadow-md shadow-purple-950/20 cursor-pointer"
                >
                  {primaryAction.label}
                </AdminButton>
              </Link>
            ) : (
              <AdminButton
                variant={primaryAction.variant || "primary"}
                onClick={primaryAction.onClick}
                isLoading={primaryAction.isLoading}
                disabled={primaryAction.disabled}
                leftIcon={primaryAction.icon}
                className="h-10 sm:h-11 px-5 rounded-xl font-bold shadow-md shadow-purple-950/20"
              >
                {primaryAction.label}
              </AdminButton>
            )
          )}

          {children}
        </div>
      </div>
    </header>
  );
}
