"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/layout/LocaleProvider";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface DashboardBreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function DashboardBreadcrumbs({ items, className }: DashboardBreadcrumbsProps) {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  // If items provided, normalize them (deduplicating dashboard if repeated)
  const normalizedItems: BreadcrumbItem[] = items && items.length > 0
    ? items.filter((item, idx) => {
        if (idx > 0 && item.label.toLowerCase() === items[idx - 1].label.toLowerCase()) {
          return false;
        }
        return true;
      })
    : [];

  return (
    <nav
      aria-label="Breadcrumbs"
      className={cn(
        "flex items-center gap-1.5 text-xs font-semibold text-[var(--text-tertiary)] tracking-wide overflow-x-auto scrollbar-none",
        className
      )}
    >
      <Link
        href={`/${locale || "en"}/dashboard`}
        className="flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{isAr ? "لوحة التحكم" : "Dashboard"}</span>
      </Link>

      {normalizedItems.map((crumb, idx) => {
        const isLast = idx === normalizedItems.length - 1;
        return (
          <React.Fragment key={`${crumb.label}-${idx}`}>
            <ChevronRight className="w-3 h-3 text-[var(--text-disabled)] shrink-0 rtl:rotate-180" />
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="hover:text-[var(--color-primary)] transition-colors truncate max-w-[150px] sm:max-w-[200px]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate max-w-[180px] sm:max-w-[280px]",
                  isLast ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-secondary)]"
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
