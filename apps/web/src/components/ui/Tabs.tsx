"use client";

/*
  Storybook Usage:
  <Tabs defaultValue="tab1">
    <TabsList>
      <TabsTrigger value="tab1">Account</TabsTrigger>
      <TabsTrigger value="tab2">Password</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">Account settings here.</TabsContent>
    <TabsContent value="tab2">Password settings here.</TabsContent>
  </Tabs>
*/

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  activeTab: string;
  setActiveTab: (val: string) => void;
  orientation: "horizontal" | "vertical";
  id: string;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (val: string) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
  children: React.ReactNode;
}

export const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  orientation = "horizontal",
  className,
  children,
}: TabsProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const activeTab = value !== undefined ? value : internalValue;
  const id = React.useId();

  const setActiveTab = React.useCallback(
    (val: string) => {
      if (value === undefined) setInternalValue(val);
      onValueChange?.(val);
    },
    [value, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, orientation, id }}>
      <div
        className={cn(
          "flex w-full",
          orientation === "horizontal" ? "flex-col" : "flex-row gap-4",
          className
        )}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsList must be used within a Tabs component");

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={context.orientation}
        className={cn(
          "flex items-center p-1 bg-[var(--surface-active)] rounded-sg",
          context.orientation === "horizontal"
            ? "flex-row overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            : "flex-col w-48 shrink-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, children, disabled, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within a Tabs component");

  const isActive = context.activeTab === value;

  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={isActive}
      aria-controls={`${context.id}-panel-${value}`}
      id={`${context.id}-tab-${value}`}
      disabled={disabled}
      onClick={() => context.setActiveTab(value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          context.setActiveTab(value);
        }
      }}
      className={cn(
        "relative flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] whitespace-nowrap snap-center z-10",
        context.orientation === "horizontal" ? "flex-1" : "w-full justify-start",
        isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {isActive && (
        <motion.div
          layoutId={`${context.id}-active-tab`}
          className="absolute inset-0 bg-[var(--surface-default)] rounded-md shadow-sm border border-[var(--border-level-2)] -z-10"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      {children}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within a Tabs component");

  const isActive = context.activeTab === value;

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          ref={ref}
          role="tabpanel"
          id={`${context.id}-panel-${value}`}
          aria-labelledby={`${context.id}-tab-${value}`}
          tabIndex={0}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-sg",
            context.orientation === "horizontal" ? "mt-4" : "",
            className
          )}
          {...(props as any)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
TabsContent.displayName = "TabsContent";
