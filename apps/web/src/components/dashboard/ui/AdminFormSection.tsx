"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AdminFormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  children: React.ReactNode
}

export function AdminFormSection({
  title,
  description,
  children,
  className,
  ...props
}: AdminFormSectionProps) {
  return (
    <div 
      className={cn(
        "bg-surface-default rounded-2xl border border-border-default p-6 md:p-8 shadow-sm flex flex-col space-y-6",
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="border-b border-border-default pb-4">
          {title && (
            <h2 className="text-lg font-black text-text-primary">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-text-secondary mt-1">{description}</p>
          )}
        </div>
      )}
      
      <div className="flex flex-col space-y-6">
        {children}
      </div>
    </div>
  )
}

export function AdminFormGrid({
  children,
  className,
  columns = 2,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { columns?: 1 | 2 | 3 | 4 }) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns]

  return (
    <div 
      className={cn("grid gap-6", gridCols, className)}
      {...props}
    >
      {children}
    </div>
  )
}
