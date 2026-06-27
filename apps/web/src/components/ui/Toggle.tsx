"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ToggleProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  name?: string;
  value?: string;
}

const sizeStyles = {
  sm: { track: "w-8 h-4", thumb: "w-3 h-3", offset: "translate-x-4", rtlOffset: "-translate-x-4" },
  md: { track: "w-11 h-6", thumb: "w-5 h-5", offset: "translate-x-5", rtlOffset: "-translate-x-5" },
  lg: { track: "w-14 h-8", thumb: "w-7 h-7", offset: "translate-x-6", rtlOffset: "-translate-x-6" },
};

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      checked: controlledChecked,
      defaultChecked = false,
      onChange,
      size = "md",
      disabled = false,
      name,
      value,
      ...props
    },
    ref
  ) => {
    const isControlled = controlledChecked !== undefined;
    const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);
    
    const checked = isControlled ? controlledChecked : uncontrolledChecked;
    const layoutId = React.useId();

    const handleClick = () => {
      if (disabled) return;
      const newValue = !checked;
      if (!isControlled) {
        setUncontrolledChecked(newValue);
      }
      onChange?.(newValue);
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        ref={ref}
        className={cn(
          "relative flex shrink-0 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-level-1)] cursor-pointer px-[2px]",
          sizeStyles[size].track,
          checked ? "bg-[var(--color-accent)] border border-transparent" : "bg-[var(--surface-hover)] border border-[var(--border-level-2)]",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300",
            sizeStyles[size].thumb,
            checked ? sizeStyles[size].offset : "translate-x-0",
            checked ? "rtl:" + sizeStyles[size].rtlOffset : "rtl:translate-x-0"
          )}
        >
          {/* Framer motion layout spring for the inner circle */}
          <motion.div
            layout
            layoutId={layoutId}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-full h-full rounded-full bg-white"
          />
        </div>

        {/* Hidden input for form submission */}
        {name && (
          <input
            type="checkbox"
            name={name}
            value={value}
            checked={checked}
            readOnly
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          />
        )}
      </button>
    );
  }
);

Toggle.displayName = "Toggle";
