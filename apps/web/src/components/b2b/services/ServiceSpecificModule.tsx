"use client";

import React, { useState } from "react";
import {
  Sliders,
  CheckCircle2,
  ArrowRight,
  Info,
} from "lucide-react";
import { ServiceSpecificModuleConfig, isApprovedClaim } from "@/lib/services/canonical-services";
import { cn } from "@/lib/utils";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";

interface ServiceSpecificModuleProps {
  moduleConfig?: ServiceSpecificModuleConfig | null;
  locale: string;
}

export function ServiceSpecificModule({ moduleConfig, locale }: ServiceSpecificModuleProps) {
  const isAr = locale === "ar";

  // State management for user-driven exploration across CMS-configured options
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);


  if (!moduleConfig) return null;

  const title = isAr ? moduleConfig.titleAr || moduleConfig.titleEn : moduleConfig.titleEn;
  const subtitle = isAr ? moduleConfig.subtitleAr || moduleConfig.subtitleEn : moduleConfig.subtitleEn;
  const disclaimer = isAr ? moduleConfig.disclaimerAr || moduleConfig.disclaimerEn : moduleConfig.disclaimerEn;

  const options = Array.isArray(moduleConfig.options) ? moduleConfig.options : [];
  const sections = Array.isArray(moduleConfig.sections) ? moduleConfig.sections : [];

  // Suppress section if no CMS content or options exist
  if (!title && options.length === 0 && sections.length === 0) {
    return null;
  }

  const activeOption = options[selectedOptionIndex] || options[0];
  const activeSection = sections[selectedSectionIndex] || sections[0];

  return (
    <section id="specialist-section" className="py-24 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        {/* Module Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>{isAr ? "أداة التخطيط والاستكشاف التفاعلي" : "Interactive Planning Module"}</span>
          </div>
          {title && (
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-3">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-base text-[var(--text-secondary)] leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* 1. Primary Interactive Options / Tiers Grid */}
        {options.length > 0 && (
          <div className="space-y-8 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {options.map((option, idx) => {
                const label = isAr ? option.labelAr || option.labelEn : option.labelEn;
                const tag = isAr ? option.tagAr || option.tagEn : option.tagEn;
                const isSelected = selectedOptionIndex === idx;

                return (
                  <button
                    key={option.id || idx}
                    type="button"
                    onClick={() => setSelectedOptionIndex(idx)}
                    className={cn(
                      "p-4 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between",
                      isSelected
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/20 ring-2 ring-emerald-500/30"
                        : "bg-[var(--surface-default)] border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-500/40"
                    )}
                  >
                    <div>
                      {tag && (
                        <span
                          className={cn(
                            "text-[10px] font-mono font-bold uppercase tracking-wider block mb-1.5",
                            isSelected ? "text-emerald-200" : "text-emerald-700 dark:text-emerald-400"
                          )}
                        >
                          {tag}
                        </span>
                      )}
                      <h3 className="text-sm font-bold leading-snug">{label}</h3>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] font-semibold opacity-90">
                      <span>{isAr ? "استكشاف الخيار" : "Explore Option"}</span>
                      <ArrowRight className={cn("w-3.5 h-3.5 rtl:rotate-180 transition-transform", isSelected && "translate-x-1 rtl:-translate-x-1")} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Option Detail Card */}
            {activeOption && (
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="max-w-2xl">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-2">
                      {isAr ? activeOption.tagAr || activeOption.tagEn : activeOption.tagEn || (isAr ? "التفاصيل المعتمدة" : "Planning Guidance")}
                    </span>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                      {isAr ? activeOption.labelAr || activeOption.labelEn : activeOption.labelEn}
                    </h3>
                    {(activeOption.descriptionEn || activeOption.descriptionAr) && (
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                        {isAr ? activeOption.descriptionAr || activeOption.descriptionEn : activeOption.descriptionEn}
                      </p>
                    )}
                  </div>

                  {activeOption.mediaUrl && (
                    <div className="w-full md:w-64 h-40 rounded-2xl overflow-hidden shrink-0 border border-[var(--border-level-2)]">
                      <UniversalMediaRenderer
                        type="IMAGE"
                        src={activeOption.mediaUrl}
                        alt={isAr ? activeOption.labelAr : activeOption.labelEn}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Structured Specifications Matrix */}
                {Array.isArray(activeOption.specs) && activeOption.specs.length > 0 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[var(--border-level-2)]">
                    {activeOption.specs.map((spec, sIdx) => {
                      const specLabel = isAr ? spec.labelAr || spec.labelEn : spec.labelEn;
                      const specValue = isAr ? spec.valueAr || spec.valueEn : spec.valueEn;

                      return (
                        <div
                          key={sIdx}
                          className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)]"
                        >
                          <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-tertiary)] block mb-1">
                            {specLabel}
                          </span>
                          <span className="text-sm font-bold text-[var(--text-primary)] font-mono">
                            {specValue}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Deliverables / Checklist Items */}
                {Array.isArray(activeOption.outputsEn) && activeOption.outputsEn.length > 0 && (
                  <div className="pt-4 border-t border-[var(--border-level-2)]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] block mb-3">
                      {isAr ? "المخرجات والاشتراطات الاسترشادية:" : "Indicative Deliverables & Clearances:"}
                    </span>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {(isAr ? activeOption.outputsAr || activeOption.outputsEn : activeOption.outputsEn).map((output, oIdx) => (
                        <div key={oIdx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{output}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approved Claim Reference Badge */}
                {activeOption.claim && isApprovedClaim(activeOption.claim) && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">
                        {isAr ? activeOption.claim.titleAr || activeOption.claim.titleEn : activeOption.claim.titleEn}
                      </span>
                    </div>
                    {activeOption.claim.evidence && (
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                        {isAr ? "المرجع: " : "Ref: "}{activeOption.claim.evidence}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Structured Sections / Stages Walkthrough */}
        {sections.length > 0 && (
          <div className="space-y-6 mb-8">
            <div className="flex flex-wrap gap-2">
              {sections.map((section, sIdx) => {
                const sTitle = isAr ? section.titleAr || section.titleEn : section.titleEn;
                const isSelected = selectedSectionIndex === sIdx;

                return (
                  <button
                    key={section.id || sIdx}
                    type="button"
                    onClick={() => setSelectedSectionIndex(sIdx)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                      isSelected
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {sTitle}
                  </button>
                );
              })}
            </div>

            {activeSection && Array.isArray(activeSection.items) && activeSection.items.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {activeSection.items.map((item, iIdx) => {
                  const iLabel = isAr ? item.labelAr || item.labelEn : item.labelEn;
                  const iDesc = isAr ? item.descriptionAr || item.descriptionEn : item.descriptionEn;
                  const iTag = isAr ? item.tagAr || item.tagEn : item.tagEn;

                  return (
                    <div
                      key={item.id || iIdx}
                      className="p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] flex flex-col justify-between"
                    >
                      <div>
                        {iTag && (
                          <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400 block mb-2">
                            {iTag}
                          </span>
                        )}
                        <h4 className="text-base font-bold text-[var(--text-primary)] mb-2">{iLabel}</h4>
                        {iDesc && (
                          <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed mb-3">
                            {iDesc}
                          </p>
                        )}
                      </div>

                      {Array.isArray(item.outputsEn) && item.outputsEn.length > 0 && (
                        <div className="space-y-1.5 pt-3 border-t border-[var(--border-level-2)]">
                          {(isAr ? item.outputsAr || item.outputsEn : item.outputsEn).map((out, oI) => (
                            <div key={oI} className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{out}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. Indicative Planning Disclaimer */}
        {disclaimer && (
          <div className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] flex items-start gap-3 text-xs text-[var(--text-secondary)] font-medium">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-[var(--text-primary)] block mb-0.5">
                {isAr ? "إشعار تخطيطي استرشادي:" : "Indicative Planning Disclaimer:"}
              </span>
              <span>{disclaimer}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
