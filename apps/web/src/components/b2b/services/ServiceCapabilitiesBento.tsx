"use client";

import React from "react";
import { Layers, CheckCircle2, Building, Tag, Plus } from "lucide-react";
import { CapabilityBentoItem, ServicePresentationOptions } from "@/lib/services/canonical-services";
import { getServiceFrameworkLabels } from "@/lib/services/service-labels";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { cn } from "@/lib/utils";

interface ServiceCapabilitiesBentoProps {
  capabilities: CapabilityBentoItem[];
  presentation?: ServicePresentationOptions;
  locale: string;
  onOpenBriefWithCapability?: (capability: CapabilityBentoItem) => void;
}

export function ServiceCapabilitiesBento({
  capabilities,
  presentation,
  locale,
  onOpenBriefWithCapability,
}: ServiceCapabilitiesBentoProps) {
  const isAr = locale === "ar";
  const labels = getServiceFrameworkLabels(locale);

  if (!capabilities || capabilities.length === 0) return null;

  const layout = presentation?.capabilityLayout || "bento-grid";
  const accent = presentation?.accentColor || "emerald";

  const accentBadge = {
    emerald: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    cyan: "text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    violet: "text-purple-700 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
    crimson: "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
    orange: "text-orange-700 dark:text-orange-400 bg-orange-500/10 border-orange-500/20",
    gold: "text-yellow-700 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  }[accent] || "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";

  return (
    <section id="capabilities-section" className="py-24 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-14">
          <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border", accentBadge)}>
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? "مصفوفة القدرات والحلول" : "Capabilities Matrix"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight mb-4">
            {isAr ? "القدرات التخصصية ونطاق التنفيذ" : "Specialized Capabilities & Technical Scope"}
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-medium">
            {isAr
              ? "حلول هندسية وإنتاجية متكاملة تغطي كافة متطلبات التخطيط والتنفيذ والتشغيل وفق أعلى المعايير العالمية."
              : "Every capability is engineered to deliver predictable, high-impact outcomes across spatial, creative, and operational domains."}
          </p>
        </div>

        {/* Dynamic Layout: Bento Grid / Asymmetric / Feature List */}
        <div
          className={cn(
            layout === "feature-list"
              ? "space-y-6"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          )}
        >
          {capabilities.map((cap, idx) => {
            const isWide = layout === "bento-grid" && (cap.colSpan === 2 || (idx === 0 && capabilities.length > 2));
            const deliverables = isAr ? cap.deliverablesAr : cap.deliverablesEn;
            const suitableFor = isAr ? cap.suitableForAr : cap.suitableForEn;
            const tag = isAr ? cap.tagAr || cap.tagEn : cap.tagEn;

            return (
              <div
                key={cap.id || idx}
                className={cn(
                  "p-6 sm:p-8 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 group overflow-hidden",
                  isWide && "md:col-span-2 lg:col-span-2 bg-gradient-to-br from-[var(--surface-default)] via-[var(--surface-default)] to-emerald-950/10",
                  layout === "feature-list" && "md:flex-row items-center gap-8"
                )}
              >
                <div className={cn(layout === "feature-list" && "flex-1")}>
                  {cap.mediaUrl && (
                    <div className="mb-6 rounded-2xl overflow-hidden aspect-[16/9] bg-[var(--surface-raised)] border border-[var(--border-level-2)]">
                      <UniversalMediaRenderer
                        type="IMAGE"
                        src={cap.mediaUrl}
                        alt={isAr ? cap.titleAr : cap.titleEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-4">
                    {tag && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </div>
                    )}

                    {onOpenBriefWithCapability && (
                      <button
                        type="button"
                        onClick={() => onOpenBriefWithCapability(cap)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors cursor-pointer"
                        title={labels.includeInBrief}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{labels.includeInBrief}</span>
                      </button>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold font-syne text-[var(--text-primary)] mb-3 group-hover:text-emerald-500 transition-colors">
                    {isAr ? cap.titleAr : cap.titleEn}
                  </h3>

                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-6 font-medium">
                    {isAr ? cap.descriptionAr : cap.descriptionEn}
                  </p>

                  {/* Key Deliverables */}
                  {deliverables && deliverables.length > 0 && (
                    <div className="mb-6 pt-4 border-t border-[var(--border-level-2)]/60">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--text-tertiary)] block mb-3">
                        {isAr ? "أبرز المخرجات التنفيذية:" : "Key Deliverables:"}
                      </span>
                      <ul className="space-y-2">
                        {deliverables.map((del, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{del}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Suitable Venues & Formats */}
                {suitableFor && suitableFor.length > 0 && (
                  <div className="pt-4 border-t border-[var(--border-level-2)]/60 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>{isAr ? "ملائم لـ:" : "Suitable for:"}</span>
                    </span>
                    {suitableFor.map((fmt, j) => (
                      <span
                        key={j}
                        className="px-2.5 py-1 rounded-lg bg-[var(--surface-raised)] text-[11px] font-semibold text-[var(--text-secondary)] border border-[var(--border-level-2)]"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
