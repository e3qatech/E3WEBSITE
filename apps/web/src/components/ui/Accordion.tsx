"use client";

/*
  Storybook Usage:
  <Accordion type="single" collapsible>
    <AccordionItem value="item-1">
      <AccordionTrigger>Is it accessible?</AccordionTrigger>
      <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
    </AccordionItem>
  </Accordion>
*/

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type AccordionContextValue = {
  value: string[];
  onItemChange: (itemValue: string) => void;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

export interface AccordionProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: any) => void;
  className?: string;
  children: React.ReactNode;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      type = "single",
      collapsible = false,
      value,
      defaultValue,
      onValueChange,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<string[]>(() => {
      if (value !== undefined) return Array.isArray(value) ? value : [value];
      if (defaultValue !== undefined) return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      return [];
    });

    const activeValues = value !== undefined ? (Array.isArray(value) ? value : [value]) : internalValue;

    const handleItemChange = React.useCallback(
      (itemValue: string) => {
        let newValues = [...activeValues];
        
        if (type === "single") {
          if (activeValues.includes(itemValue)) {
            newValues = collapsible ? [] : activeValues;
          } else {
            newValues = [itemValue];
          }
        } else {
          if (activeValues.includes(itemValue)) {
            newValues = activeValues.filter((v) => v !== itemValue);
          } else {
            newValues = [...activeValues, itemValue];
          }
        }

        if (value === undefined) {
          setInternalValue(newValues);
        }
        
        if (onValueChange) {
          onValueChange(type === "single" ? newValues[0] || "" : newValues);
        }
      },
      [activeValues, collapsible, type, value, onValueChange]
    );

    return (
      <AccordionContext.Provider value={{ value: activeValues, onItemChange: handleItemChange }}>
        <div ref={ref} className={cn("flex flex-col w-full", className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = "Accordion";

type AccordionItemContextValue = {
  value: string;
  isOpen: boolean;
  triggerId: string;
  contentId: string;
};

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, disabled, children, ...props }, ref) => {
    const context = React.useContext(AccordionContext);
    if (!context) throw new Error("AccordionItem must be used within Accordion");

    const isOpen = context.value.includes(value);
    const triggerId = React.useId();
    const contentId = React.useId();

    return (
      <AccordionItemContext.Provider value={{ value, isOpen, triggerId, contentId }}>
        <div
          ref={ref}
          className={cn(
            "border-b border-[var(--border-level-2)] overflow-hidden",
            disabled && "opacity-50 pointer-events-none",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const rootContext = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);

  if (!rootContext || !itemContext) {
    throw new Error("AccordionTrigger must be used within AccordionItem");
  }

  return (
    <button
      ref={ref}
      id={itemContext.triggerId}
      aria-expanded={itemContext.isOpen}
      aria-controls={itemContext.contentId}
      onClick={() => rootContext.onItemChange(itemContext.value)}
      className={cn(
        "flex flex-1 w-full items-center justify-between py-4 font-medium transition-all text-[var(--text-primary)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-md",
        className
      )}
      {...props}
    >
      {children}
      <motion.div
        animate={{ rotate: itemContext.isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="shrink-0 ms-2 text-[var(--text-tertiary)]"
      >
        <ChevronDown size={18} />
      </motion.div>
    </button>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const itemContext = React.useContext(AccordionItemContext);
  
  if (!itemContext) {
    throw new Error("AccordionContent must be used within AccordionItem");
  }

  return (
    <AnimatePresence initial={false}>
      {itemContext.isOpen && (
        <motion.div
          id={itemContext.contentId}
          role="region"
          aria-labelledby={itemContext.triggerId}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div ref={ref} className={cn("pb-4 pt-0 text-[var(--text-secondary)]", className)} {...props}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
AccordionContent.displayName = "AccordionContent";
