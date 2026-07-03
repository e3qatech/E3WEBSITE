import React from "react"
import { cn } from "@/lib/utils"

export interface AdminPageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  action?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  action,
  className
}: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8", className)}>
      <div className="space-y-1.5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-medium text-text-tertiary mb-2">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {crumb.href && !isLast ? (
                    <a href={crumb.href} className="hover:text-text-primary transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className={isLast ? "text-text-secondary" : ""}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <span>/</span>}
                </React.Fragment>
              )
            })}
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-text-secondary max-w-2xl">
            {description}
          </p>
        )}
      </div>
      
      {action && (
        <div className="flex items-center gap-3 shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}
