"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AdminFormLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export function AdminFormLayout({
  children,
  sidebar,
  className,
  ...props
}: AdminFormLayoutProps) {
  return (
    <div 
      className={cn(
        "flex flex-col md:flex-row gap-6 md:gap-8 max-w-[1600px] mx-auto animate-fade-in-up",
        className
      )}
      {...props}
    >
      {/* Sidebar Nav (optional) */}
      {sidebar && (
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          {sidebar}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 space-y-8">
        {children}
      </div>
    </div>
  )
}
