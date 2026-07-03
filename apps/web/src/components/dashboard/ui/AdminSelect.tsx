import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(
  (
    { 
      className, 
      label, 
      error, 
      hint, 
      fullWidth = true, 
      id,
      disabled,
      children,
      ...props 
    }, 
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    
    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full", className)}>
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-text-secondary">
            {label}
            {props.required && <span className="text-error ms-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full appearance-none rounded-md border bg-surface-default px-3 py-2 pe-10 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-error focus-visible:ring-error" : "border-border-default"
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-text-tertiary">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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

AdminSelect.displayName = "AdminSelect";
