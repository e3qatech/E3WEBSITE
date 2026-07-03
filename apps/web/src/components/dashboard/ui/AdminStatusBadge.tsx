import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AdminStatusVariant = "success" | "warning" | "error" | "info" | "neutral";
export type AdminStatusSize = "sm" | "md";

export interface AdminStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: AdminStatusVariant;
  size?: AdminStatusSize;
  dot?: boolean;
}

export const AdminStatusBadge = React.forwardRef<HTMLSpanElement, AdminStatusBadgeProps>(
  (
    { 
      className, 
      variant = "neutral", 
      size = "md", 
      dot = true,
      children, 
      ...props 
    }, 
    ref
  ) => {
    
    const variants: Record<AdminStatusVariant, { badge: string, dot: string }> = {
      success: {
        badge: "bg-success/10 text-success border border-success/20",
        dot: "bg-success"
      },
      warning: {
        badge: "bg-warning/10 text-warning border border-warning/20",
        dot: "bg-warning"
      },
      error: {
        badge: "bg-error/10 text-error border border-error/20",
        dot: "bg-error"
      },
      info: {
        badge: "bg-info/10 text-info border border-info/20",
        dot: "bg-info"
      },
      neutral: {
        badge: "bg-surface-active text-text-secondary border border-border-default",
        dot: "bg-text-tertiary"
      }
    };

    const sizes: Record<AdminStatusSize, string> = {
      sm: "px-2 py-0.5 text-[11px] gap-1.5 rounded-sm",
      md: "px-2.5 py-0.5 text-xs gap-2 rounded-md",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          variants[variant].badge,
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span className={cn("rounded-full", variants[variant].dot, size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2")} />
        )}
        {children}
      </span>
    );
  }
);

AdminStatusBadge.displayName = "AdminStatusBadge";
