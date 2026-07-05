import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  (
    { 
      className, 
      label, 
      error, 
      hint, 
      leftIcon, 
      rightIcon, 
      fullWidth = true, 
      id,
      disabled,
      ...props 
    }, 
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    
    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full", className)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
            {label}
            {props.required && <span className="text-error ms-1">*</span>}
          </label>
        )}
        
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 text-text-tertiary pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full rounded-md border bg-bg-level-2 px-3 py-2 text-[13px] text-text-primary transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-error focus-visible:ring-error focus-visible:border-error" : "border-border-default",
              leftIcon && "ps-10",
              rightIcon && "pe-10"
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-3 text-text-tertiary">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-error mt-0.5">{error}</p>
        )}
        
        {hint && !error && (
          <p className="text-sm text-text-tertiary mt-0.5">{hint}</p>
        )}
      </div>
    );
  }
);

AdminInput.displayName = "AdminInput";
