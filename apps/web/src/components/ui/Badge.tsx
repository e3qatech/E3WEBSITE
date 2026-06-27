"use client";

/*
  Storybook Usage:
  <Badge variant="success" size="md" dot>
    Active User
  </Badge>
  <Badge variant="gradient" removable onRemove={() => console.log('removed')}>
    Premium
  </Badge>
*/

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "gradient";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--surface-active)] text-[var(--text-primary)] border-[var(--border-level-2)]",
  success: "bg-[#22C55E15] text-[var(--color-success)] border-[#22C55E30]",
  warning: "bg-[#F59E0B15] text-[var(--color-warning)] border-[#F59E0B30]",
  error: "bg-[#EF444415] text-[var(--color-error)] border-[#EF444430]",
  info: "bg-[#3B82F615] text-[var(--color-info)] border-[#3B82F630]",
  gradient: "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white border-transparent",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-[var(--text-tertiary)]",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  error: "bg-[var(--color-error)]",
  info: "bg-[var(--color-info)]",
  gradient: "bg-white",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-2.5 py-1 gap-1.5",
  lg: "text-base px-3 py-1.5 gap-2",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      dot = false,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(true);

    const handleRemove = (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsVisible(false);
      setTimeout(() => {
        onRemove?.();
      }, 200); // Wait for exit animation
    };

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.span
            ref={ref}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "inline-flex items-center justify-center rounded-full border font-medium transition-colors",
              variantStyles[variant],
              sizeStyles[size],
              className
            )}
            {...(props as any)}
          >
            {dot && (
              <span
                className={cn(
                  "rounded-full shrink-0",
                  dotColors[variant],
                  size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2 h-2" : "w-2.5 h-2.5"
                )}
                aria-hidden="true"
              />
            )}
            
            <span>{children}</span>
            
            {removable && (
              <button
                type="button"
                onClick={handleRemove}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleRemove(e);
                }}
                className={cn(
                  "shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 hover:brightness-90 transition-all",
                  variant === "gradient" ? "focus:ring-white text-white/80 hover:text-white" : "focus:ring-[var(--color-primary)] opacity-70 hover:opacity-100"
                )}
                aria-label="Remove badge"
              >
                <X size={size === "sm" ? 12 : size === "md" ? 14 : 16} />
              </button>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    );
  }
);
Badge.displayName = "Badge";
