"use client";

import * as React from "react";
import { motion, type HTMLMotionProps, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = 
  | "primary" 
  | "secondary" 
  | "ghost" 
  | "outline" 
  | "danger" 
  | "gradient";

export type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "size" | "children"> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-accent)] text-[var(--bg-level-1)] hover:brightness-110 border border-transparent",
  secondary: "bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]",
  ghost: "bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-transparent",
  outline: "bg-transparent border border-[var(--border-level-3)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]",
  danger: "bg-[#ef4444] text-[#fafafa] hover:brightness-110 border border-transparent",
  gradient: "text-white bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] hover:opacity-90 border border-transparent",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",     /* padding-inline: 0.75rem */
  md: "h-10 px-5 text-base",  /* padding-inline: 1.25rem */
  lg: "h-12 px-7 text-lg",    /* padding-inline: 1.75rem */
  xl: "h-14 px-9 text-xl font-medium", /* padding-inline: 2.25rem */
};

const springTransition = { type: "spring", stiffness: 400, damping: 15 } as const;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Component = asChild ? motion.div : motion.button;
    const isDisabled = disabled || isLoading;

    return (
      <Component
        ref={ref as any}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        transition={springTransition}
        className={cn(
          "relative inline-flex items-center justify-center rounded-sg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-level-1)] overflow-hidden",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          isDisabled && "opacity-60 cursor-not-allowed",
          className
        )}
        disabled={isDisabled}
        {...(props as any)}
      >
        <span className="flex items-center justify-center gap-2 relative z-10">
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ width: 0, opacity: 0, scale: 0.5, marginInlineEnd: 0 }}
                animate={{ width: "auto", opacity: 1, scale: 1, marginInlineEnd: 8 }}
                exit={{ width: 0, opacity: 0, scale: 0.5, marginInlineEnd: 0 }}
                transition={springTransition}
                className="flex items-center justify-center"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>
          {!isLoading && iconLeft}
          {children}
          {!isLoading && iconRight}
        </span>
      </Component>
    );
  }
);

Button.displayName = "Button";
