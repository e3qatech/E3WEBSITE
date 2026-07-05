import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const AdminTextarea = React.forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  (
    { 
      className, 
      label, 
      error, 
      hint, 
      fullWidth = true, 
      id,
      disabled,
      ...props 
    }, 
    ref
  ) => {
    const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    
    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full", className)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
            {label}
            {props.required && <span className="text-error ms-1">*</span>}
          </label>
        )}
        
        <textarea
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border bg-bg-level-2 px-3 py-2 text-[13px] text-text-primary transition-all placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-error focus-visible:ring-error focus-visible:border-error" : "border-border-default"
          )}
          {...props}
        />
        
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

AdminTextarea.displayName = "AdminTextarea";
