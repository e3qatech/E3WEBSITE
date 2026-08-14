"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface DashboardFormGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}

export function DashboardFormGrid({
  columns = 2,
  children,
  className,
  ...props
}: DashboardFormGridProps) {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={cn("grid gap-4 sm:gap-5", colClass, className)} {...props}>
      {children}
    </div>
  );
}

export interface DashboardFormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: 1 | 2 | 3 | 4 | "full";
  children: React.ReactNode;
  className?: string;
}

export function DashboardFormField({
  span = 1,
  children,
  className,
  ...props
}: DashboardFormFieldProps) {
  const spanClass = {
    1: "col-span-1",
    2: "col-span-1 md:col-span-2",
    3: "col-span-1 md:col-span-3",
    4: "col-span-1 md:col-span-4",
    full: "col-span-full",
  }[span];

  return (
    <div className={cn(spanClass, className)} {...props}>
      {children}
    </div>
  );
}
