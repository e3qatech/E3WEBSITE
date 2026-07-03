import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AdminSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "text";
  width?: string | number;
  height?: string | number;
}

export function AdminSkeleton({
  className,
  variant = "text",
  width,
  height,
  ...props
}: AdminSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer bg-surface-active",
        variant === "text" && "h-4 w-full rounded-md",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-lg",
        className
      )}
      style={{
        width: width ?? (variant === "text" ? "100%" : undefined),
        height: height ?? (variant === "text" ? undefined : "100%"),
      }}
      {...props}
    />
  );
}
