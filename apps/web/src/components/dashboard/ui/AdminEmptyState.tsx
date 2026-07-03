import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AdminButton, type AdminButtonProps } from "./AdminButton";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AdminEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: AdminButtonProps["variant"];
    icon?: React.ReactNode;
  };
}

export function AdminEmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 min-h-[300px] border border-dashed border-border-default rounded-xl bg-surface-hover/50",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-active text-text-tertiary">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="max-w-sm text-sm text-text-secondary mb-6">
          {description}
        </p>
      )}
      {action && (
        <AdminButton 
          variant={action.variant || "primary"} 
          onClick={action.onClick}
          leftIcon={action.icon}
        >
          {action.label}
        </AdminButton>
      )}
    </div>
  );
}
