"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminButton } from "./AdminButton";

export interface RepeaterItemBase {
  id: string | number;
  titleEn?: string;
  titleAr?: string;
  label?: string;
  badge?: string;
  subtitle?: string;
  thumbnailUrl?: string;
}

export interface DashboardRepeaterEditorProps<T extends RepeaterItemBase> {
  title?: string;
  description?: string;
  items: T[];
  onItemsChange: (items: T[]) => void;
  onAddItem: () => void;
  renderItemContent: (item: T, index: number, isExpanded: boolean) => React.ReactNode;
  addLabel?: string;
  emptyLabel?: string;
  defaultExpandedIndex?: number;
  allowReordering?: boolean;
  className?: string;
}

export function DashboardRepeaterEditor<T extends RepeaterItemBase>({
  title,
  description,
  items = [],
  onItemsChange,
  onAddItem,
  renderItemContent,
  addLabel = "Add New Item",
  emptyLabel = "No items created yet. Click Add to create one.",
  defaultExpandedIndex = 0,
  allowReordering = true,
  className,
}: DashboardRepeaterEditorProps<T>) {
  const [expandedIds, setExpandedIds] = useState<Record<string | number, boolean>>(() => {
    if (items.length > 0 && defaultExpandedIndex >= 0 && items[defaultExpandedIndex]) {
      return { [items[defaultExpandedIndex].id]: true };
    }
    return {};
  });

  const toggleExpand = (id: string | number) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleMove = (index: number, direction: "up" | "down" | "top" | "bottom") => {
    const copy = [...items];
    if (direction === "up" && index > 0) {
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
    } else if (direction === "down" && index < copy.length - 1) {
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
    } else if (direction === "top" && index > 0) {
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
    } else if (direction === "bottom" && index < copy.length - 1) {
      const [item] = copy.splice(index, 1);
      copy.push(item);
    }
    onItemsChange(copy);
  };

  const handleDelete = (index: number, label?: string) => {
    const name = label || items[index]?.titleEn || `Item #${index + 1}`;
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    const copy = items.filter((_, i) => i !== index);
    onItemsChange(copy);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Bar */}
      {(title || description) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-level-1)] pb-3">
          <div>
            {title && (
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--color-primary)]" />
                <span>{title}</span>
              </h3>
            )}
            {description && (
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>
            )}
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 self-start sm:self-auto shrink-0">
            {items.length} {items.length === 1 ? "Item" : "Items"}
          </span>
        </div>
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[var(--border-level-1)] rounded-2xl bg-[var(--surface-default)] space-y-3">
          <Layers className="w-8 h-8 text-[var(--text-tertiary)] mx-auto opacity-50" />
          <p className="text-xs text-[var(--text-secondary)]">{emptyLabel}</p>
          <AdminButton
            variant="outline"
            size="sm"
            onClick={onAddItem}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            {addLabel}
          </AdminButton>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const isExpanded = !!expandedIds[item.id];
            const isFirst = index === 0;
            const isLast = index === items.length - 1;
            const itemLabel =
              item.titleEn ||
              item.label ||
              (item.titleAr ? `Arabic: ${item.titleAr}` : `Item #${index + 1}`);

            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl border transition-all overflow-hidden bg-[var(--surface-default)]",
                  isExpanded
                    ? "border-[var(--color-primary)]/50 shadow-md"
                    : "border-[var(--border-level-1)] hover:border-[var(--border-level-2)]"
                )}
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="flex items-center justify-between gap-3 p-3.5 sm:px-4 cursor-pointer select-none bg-[var(--bg-level-1)]/50 hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Index or Thumbnail */}
                    {item.thumbnailUrl ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-[var(--border-level-1)] shrink-0">
                        <img
                          src={item.thumbnailUrl}
                          alt={itemLabel}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--surface-active)] text-[var(--text-secondary)] font-mono font-bold text-xs shrink-0">
                        #{index + 1}
                      </div>
                    )}

                    {/* Title & Preview */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                          {itemLabel}
                        </h4>
                        {item.titleAr && (
                          <span
                            className="text-xs text-[var(--text-tertiary)] font-sans hidden sm:inline"
                            dir="rtl"
                          >
                            ({item.titleAr})
                          </span>
                        )}
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-[var(--text-tertiary)] truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Chevron */}
                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {allowReordering && (
                      <div className="flex items-center bg-[var(--surface-default)] rounded-xl border border-[var(--border-level-1)] p-0.5 gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMove(index, "up")}
                          disabled={isFirst}
                          className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--color-primary)] disabled:opacity-20 transition-all cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, "down")}
                          disabled={isLast}
                          className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--color-primary)] disabled:opacity-20 transition-all cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(index, itemLabel)}
                      className="p-1.5 rounded-xl text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all cursor-pointer ms-1"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Form Content */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-[var(--border-level-1)] bg-[var(--surface-default)] space-y-4 animate-in fade-in-50 duration-200">
                    {renderItemContent(item, index, isExpanded)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Button */}
      <AdminButton
        variant="outline"
        onClick={onAddItem}
        fullWidth
        leftIcon={<Plus className="w-4 h-4" />}
        className="border-dashed h-11 rounded-2xl font-bold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        {addLabel}
      </AdminButton>
    </div>
  );
}
