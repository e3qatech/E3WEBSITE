"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  as?: "input" | "textarea";
}

export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      icon,
      clearable,
      onClear,
      as = "input",
      disabled,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      type = "text",
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    // Check if the input is filled to keep the label floating
    const isFilled = React.useMemo(() => {
      if (value !== undefined && value !== null && value !== "") return true;
      if (defaultValue !== undefined && defaultValue !== null && defaultValue !== "") return true;
      return false;
    }, [value, defaultValue]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const showClearButton = clearable && isFilled && !disabled;
    const Component = as as any;
    const isFloating = isFocused || isFilled;

    return (
      <div className={cn("relative flex flex-col w-full", className)}>
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute start-3 rtl:end-3 rtl:start-auto text-[var(--text-tertiary)] z-10 pointer-events-none transition-colors duration-200">
              {icon}
            </div>
          )}
          
          <Component
            ref={ref}
            type={as === "input" ? type : undefined}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              "w-full bg-[var(--surface-active)] text-[var(--text-primary)] rounded-sg transition-all duration-200 outline-none border border-transparent",
              as === "textarea" ? "py-4 min-h-[120px] resize-y" : "h-14",
              label ? "pt-5 pb-1" : "py-3",
              icon ? "ps-10 rtl:pe-10 rtl:ps-4" : "px-4",
              showClearButton ? "pe-10 rtl:ps-10 rtl:pe-4" : "",
              "focus:bg-[var(--surface-default)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]",
              error && "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]",
              disabled && "opacity-50 cursor-not-allowed bg-[var(--bg-level-2)]"
            )}
            {...props}
          />

          {label && (
            <motion.label
              initial={false}
              animate={{
                y: isFloating ? (as === "textarea" ? -14 : -10) : 0,
                scale: isFloating ? 0.8 : 1,
                color: error 
                  ? "var(--color-error)" 
                  : isFocused 
                    ? "var(--color-primary)" 
                    : "var(--text-tertiary)",
              }}
              className={cn(
                "absolute pointer-events-none origin-[0_0] transition-colors duration-200",
                icon ? "start-10 rtl:end-10 rtl:start-auto" : "start-4 rtl:end-4 rtl:start-auto",
                as === "textarea" ? "top-4" : "top-[15px]"
              )}
            >
              {label}
            </motion.label>
          )}

          <AnimatePresence>
            {showClearButton && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={onClear}
                className="absolute end-3 rtl:start-3 rtl:end-auto p-1 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                aria-label="Clear input"
              >
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>

          {error && !showClearButton && (
            <div className="absolute end-3 rtl:start-3 rtl:end-auto text-[var(--color-error)] pointer-events-none">
              <AlertCircle size={18} />
            </div>
          )}
        </div>

        <AnimatePresence>
          {(error || helperText) && (
            <motion.p
              initial={{ opacity: 0, y: -5, x: 0 }}
              animate={
                error 
                  ? { opacity: 1, y: 0, x: [-2, 2, -2, 2, 0] } 
                  : { opacity: 1, y: 0, x: 0 }
              }
              transition={
                error 
                  ? { type: "spring", stiffness: 500, damping: 10, mass: 0.5 } 
                  : { duration: 0.2 }
              }
              exit={{ opacity: 0, y: -5 }}
              className={cn(
                "text-sm mt-1.5 px-1",
                error ? "text-[var(--color-error)]" : "text-[var(--text-secondary)]"
              )}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = "Input";
