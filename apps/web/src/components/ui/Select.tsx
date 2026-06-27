"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type Option = {
  label: string;
  value: string;
};

export interface SelectProps {
  options: Option[];
  value?: string | string[];
  onChange?: (value: any) => void;
  multiple?: boolean;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  name?: string;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      multiple = false,
      placeholder = "Select an option",
      searchable = false,
      disabled = false,
      className,
      label,
      error,
      name,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listboxRef = React.useRef<HTMLUListElement>(null);

    const filteredOptions = React.useMemo(() => {
      if (!search) return options;
      return options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      );
    }, [options, search]);

    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const current = Array.isArray(value) ? value : [];
        const newValue = current.includes(optionValue)
          ? current.filter((v) => v !== optionValue)
          : [...current, optionValue];
        onChange?.(newValue);
      } else {
        onChange?.(optionValue);
        setIsOpen(false);
      }
      setSearch("");
    };

    const removeOption = (e: React.MouseEvent, optionValue: string) => {
      e.stopPropagation();
      if (multiple && Array.isArray(value)) {
        onChange?.(value.filter((v) => v !== optionValue));
      }
    };

    // Click outside to close
    React.useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case "Enter":
        case " ":
          if (!isOpen) {
            setIsOpen(true);
            e.preventDefault();
          } else if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
            handleSelect(filteredOptions[focusedIndex].value);
            e.preventDefault();
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) setIsOpen(true);
          else setFocusedIndex((prev) => (prev + 1) % filteredOptions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!isOpen) setIsOpen(true);
          else setFocusedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
          break;
      }
    };

    // Scroll to focused item
    React.useEffect(() => {
      if (isOpen && focusedIndex >= 0 && listboxRef.current) {
        const item = listboxRef.current.children[focusedIndex] as HTMLElement;
        if (item) {
          item.scrollIntoView({ block: "nearest" });
        }
      }
    }, [focusedIndex, isOpen]);

    const isSelected = (val: string) => {
      if (multiple && Array.isArray(value)) return value.includes(val);
      return value === val;
    };

    const getDisplayValue = () => {
      if (multiple && Array.isArray(value)) {
        if (value.length === 0) return <span className="text-[var(--text-tertiary)]">{placeholder}</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((v) => {
              const opt = options.find((o) => o.value === v);
              return (
                <span
                  key={v}
                  className="flex items-center gap-1 bg-[var(--surface-active)] text-[var(--text-primary)] text-sm px-2 py-0.5 rounded-md"
                >
                  {opt?.label || v}
                  <button
                    onClick={(e) => removeOption(e, v)}
                    className="hover:text-[var(--color-error)] focus:outline-none"
                    aria-label={`Remove ${opt?.label}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              );
            })}
          </div>
        );
      }
      
      const opt = options.find((o) => o.value === value);
      return opt ? (
        <span className="text-[var(--text-primary)] truncate block">{opt.label}</span>
      ) : (
        <span className="text-[var(--text-tertiary)]">{placeholder}</span>
      );
    };

    return (
      <div className={cn("relative w-full flex flex-col", className)} ref={containerRef}>
        {label && (
          <label className="text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        
        <div
          ref={ref}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="select-listbox"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "relative flex items-center justify-between w-full min-h-[56px] px-4 py-3 bg-[var(--surface-active)] rounded-sg border transition-all duration-200 cursor-pointer outline-none",
            isOpen ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)] bg-[var(--surface-default)]" : "border-transparent",
            error && "border-[var(--color-error)]",
            disabled && "opacity-50 cursor-not-allowed bg-[var(--bg-level-2)]"
          )}
        >
          <div className="flex-1 overflow-hidden pe-4 rtl:pe-0 rtl:ps-4">
            {getDisplayValue()}
          </div>
          
          <div className="text-[var(--text-tertiary)] shrink-0">
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={20} />
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-[calc(100%+8px)] start-0 w-full z-50 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-sg shadow-lg overflow-hidden flex flex-col"
            >
              {searchable && (
                <div className="p-2 border-b border-[var(--border-level-1)] relative">
                  <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={16} />
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === "Escape") {
                        handleKeyDown(e);
                      }
                    }}
                    placeholder="Search..."
                    className="w-full bg-[var(--surface-active)] rounded-md ps-9 rtl:pe-9 rtl:ps-3 pe-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--text-primary)]"
                    autoFocus
                  />
                </div>
              )}
              
              <ul
                ref={listboxRef}
                role="listbox"
                id="select-listbox"
                aria-multiselectable={multiple}
                className="max-h-60 overflow-y-auto p-1"
              >
                {filteredOptions.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-[var(--text-tertiary)] text-center">
                    No options found
                  </li>
                ) : (
                  filteredOptions.map((option, index) => {
                    const selected = isSelected(option.value);
                    const focused = index === focusedIndex;
                    
                    return (
                      <li
                        key={option.value}
                        role="option"
                        aria-selected={selected}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(option.value);
                        }}
                        onMouseEnter={() => setFocusedIndex(index)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-md text-sm cursor-pointer transition-colors",
                          selected ? "text-[var(--color-primary)] font-medium bg-[var(--surface-selected)]" : "text-[var(--text-primary)]",
                          focused && !selected && "bg-[var(--surface-hover)]",
                          focused && selected && "bg-[var(--surface-selected)] brightness-95"
                        )}
                      >
                        <span className="truncate">{option.label}</span>
                        {selected && <Check size={16} className="text-[var(--color-primary)] shrink-0" />}
                      </li>
                    );
                  })
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm mt-1.5 px-1 text-[var(--color-error)]"
          >
            {error}
          </motion.p>
        )}
        {name && (
          <input 
            type="hidden" 
            name={name} 
            value={Array.isArray(value) ? value.join(',') : (value || '')} 
          />
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
