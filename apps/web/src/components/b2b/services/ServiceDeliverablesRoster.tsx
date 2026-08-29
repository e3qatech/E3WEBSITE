"use client";

import React, { useState } from "react";
import { ClipboardList, CheckCircle2, ChevronDown, ChevronUp, Layers, ListFilter } from "lucide-react";
import { DeliverableCategory, DeliverablesLayoutVariant } from "@/lib/services/canonical-services";
import { getServiceFrameworkLabels } from "@/lib/services/service-labels";
import { cn } from "@/lib/utils";

interface ServiceDeliverablesRosterProps {
  categories: DeliverableCategory[];
  layoutVariant?: DeliverablesLayoutVariant;
  locale: string;
  titleEn?: string;
  titleAr?: string;
  subtitleEn?: string;
  subtitleAr?: string;
}

export function ServiceDeliverablesRoster({
  categories = [],
  layoutVariant = "roster",
  locale,
  titleEn,
  titleAr,
  subtitleEn,
  subtitleAr,
}: ServiceDeliverablesRosterProps) {
  const isAr = locale === "ar";
  const labels = getServiceFrameworkLabels(locale);

  // Accordion open states (keyed by category ID)
  const [openAccordionIds, setOpenAccordionIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((cat, idx) => {
      // First category open by default
      initial[cat.id || String(idx)] = idx === 0;
    });
    return initial;
  });

  // Active tab state for tabbed layout
  const [activeTabId, setActiveTabId] = useState<string>(
    categories[0]?.id || "0"
  );

  if (!categories || categories.length === 0) return null;

  const toggleAccordion = (catId: string) => {
    setOpenAccordionIds((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    categories.forEach((cat, idx) => {
      allOpen[cat.id || String(idx)] = true;
    });
    setOpenAccordionIds(allOpen);
  };

  const collapseAll = () => {
    const allClosed: Record<string, boolean> = {};
    categories.forEach((cat, idx) => {
      allClosed[cat.id || String(idx)] = false;
    });
    setOpenAccordionIds(allClosed);
  };

  const isAllExpanded = categories.every((cat, idx) => openAccordionIds[cat.id || String(idx)]);

  return (
    <section id="deliverables-section" className="py-24 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{isAr ? "المخرجات والوثائق الرسمية" : "Scope Clarity"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-3">
              {isAr ? titleAr || labels.deliverablesHeading : titleEn || labels.deliverablesHeading}
            </h2>
            <p className="text-base text-[var(--text-secondary)] font-medium">
              {isAr ? subtitleAr || labels.deliverablesSubheading : subtitleEn || labels.deliverablesSubheading}
            </p>
          </div>

          {/* Accordion Expand/Collapse Controls */}
          {layoutVariant === "accordion" && categories.length > 1 && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={isAllExpanded ? collapseAll : expandAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--surface-default)] hover:bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>{isAllExpanded ? labels.collapseAll : labels.expandAll}</span>
              </button>
            </div>
          )}
        </div>

        {/* 1. ACCORDION PROGRESSIVE DISCLOSURE VARIANT */}
        {layoutVariant === "accordion" ? (
          <div className="max-w-4xl mx-auto space-y-4">
            {categories.map((cat, idx) => {
              const catKey = cat.id || String(idx);
              const isOpen = !!openAccordionIds[catKey];
              const items = isAr ? cat.itemsAr : cat.itemsEn;
              const title = isAr ? cat.titleAr : cat.titleEn;

              return (
                <div
                  key={catKey}
                  className="rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(catKey)}
                    aria-expanded={isOpen}
                    aria-controls={`deliverable-panel-${catKey}`}
                    className="w-full flex items-center justify-between p-6 text-start hover:bg-[var(--surface-raised)] transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                        {title}
                      </h3>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--surface-raised)] text-[var(--text-secondary)]">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={`deliverable-panel-${catKey}`}
                      role="region"
                      className="p-6 pt-0 border-t border-[var(--border-level-2)]/50"
                    >
                      <ul className="grid sm:grid-cols-2 gap-3.5 pt-4">
                        {items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)]/60">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : layoutVariant === "grouped-tabs" ? (
          /* 2. GROUPED TABS VARIANT */
          <div className="max-w-4xl mx-auto">
            {/* Tab Buttons */}
            <div
              role="tablist"
              aria-label={isAr ? "تبويبات المخرجات" : "Deliverable Categories"}
              className="flex gap-2 overflow-x-auto pb-4 mb-8 border-b border-[var(--border-level-2)] no-scrollbar"
            >
              {categories.map((cat, idx) => {
                const catKey = cat.id || String(idx);
                const isActive = activeTabId === catKey;
                const title = isAr ? cat.titleAr : cat.titleEn;

                return (
                  <button
                    key={catKey}
                    role="tab"
                    id={`deliverables-tab-${catKey}`}
                    aria-selected={isActive}
                    aria-controls={`deliverables-tabpanel-${catKey}`}
                    onClick={() => setActiveTabId(catKey)}
                    className={cn(
                      "px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2",
                      isActive
                        ? "bg-emerald-500 text-zinc-950 shadow-md"
                        : "bg-[var(--surface-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] border border-[var(--border-level-2)]"
                    )}
                  >
                    <Layers className="w-4 h-4" />
                    <span>{title}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab Panel */}
            {categories.map((cat, idx) => {
              const catKey = cat.id || String(idx);
              if (activeTabId !== catKey) return null;
              const items = isAr ? cat.itemsAr : cat.itemsEn;
              const title = isAr ? cat.titleAr : cat.titleEn;

              return (
                <div
                  key={catKey}
                  role="tabpanel"
                  id={`deliverables-tabpanel-${catKey}`}
                  aria-labelledby={`deliverables-tab-${catKey}`}
                  className="p-8 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-sm"
                >
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 pb-4 border-b border-[var(--border-level-2)]">
                    {title}
                  </h3>
                  <ul className="grid sm:grid-cols-2 gap-4">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3.5 p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)]/60">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          /* 3. DEFAULT ROSTER CARDS VARIANT */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const items = isAr ? cat.itemsAr : cat.itemsEn;
              return (
                <div
                  key={cat.id}
                  className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-6 pb-3 border-b border-[var(--border-level-2)]">
                      {isAr ? cat.titleAr : cat.titleEn}
                    </h3>

                    <ul className="space-y-3.5">
                      {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                          <span className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-snug">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
