import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AdminButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
export type AdminButtonSize = "sm" | "md" | "lg" | "icon";

export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  (
    { 
      className, 
      variant = "primary", 
      size = "md", 
      isLoading = false, 
      leftIcon, 
      rightIcon, 
      fullWidth = false,
      children, 
      disabled, 
      ...props 
    }, 
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-level-1 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants: Record<AdminButtonVariant, string> = {
      primary: "bg-accent text-white hover:bg-accent/90 shadow-sm",
      secondary: "bg-surface-active text-text-primary hover:bg-surface-hover border border-border-default",
      outline: "border border-border-strong text-text-primary hover:bg-surface-active hover:border-accent hover:text-accent transition-all",
      ghost: "text-text-secondary hover:text-text-primary hover:bg-surface-active",
      danger: "bg-error text-white hover:bg-error/90 shadow-sm",
      success: "bg-success text-white hover:bg-success/90 shadow-sm",
    };

    const sizes: Record<AdminButtonSize, string> = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-2",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], fullWidth && "w-full", className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ms-1 me-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

AdminButton.displayName = "AdminButton";
