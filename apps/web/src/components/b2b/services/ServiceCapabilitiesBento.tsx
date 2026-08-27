"use client";

import React from "react";
import { Layers, CheckCircle2, Building, Tag } from "lucide-react";
import { CapabilityBentoItem } from "@/lib/services/canonical-services";
import { cn } from "@/lib/utils";

interface ServiceCapabilitiesBentoProps {
  capabilities: CapabilityBentoItem[];
  locale: string;
}

export function ServiceCapabilitiesBento({ capabilities, locale }: ServiceCapabilitiesBentoProps) {
  const isAr = locale === "ar";

  if (!capabilities || capabilities.length === 0) return null;

  return (
    <section className="py-20 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            {isAr ? "مصفوفة القدرات والحلول" : "Capabilities Matrix"}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-3">
            {isAr ? "القدرات التخصصية ونطاق التنفيذ" : "Specialized Capabilities & Technical Scope"}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {isAr
              ? "حلول متكاملة تغطي كافة متطلبات التخطيط والتنفيذ والتشغيل وفق أعلى المعايير العالمية."
              : "Every capability is engineered to deliver predictable, high-impact outcomes across spatial, creative, and operational domains."}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap) => {
            const isWide = cap.colSpan === 2;
            const deliverables = isAr ? cap.deliverablesAr : cap.deliverablesEn;
            const suitableFor = isAr ? cap.suitableForAr : cap.suitableForEn;
            const tag = isAr ? cap.tagAr || cap.tagEn : cap.tagEn;

            return (
              <div
                key={cap.id}
                className={cn(
                  "p-6 sm:p-8 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all group",
                  isWide && "md:col-span-2 lg:col-span-2 bg-gradient-to-br from-[var(--surface-default)] via-[var(--surface-default)] to-emerald-950/10"
                )}
              >
                <div>
                  {tag && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-4">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </div>
                  )}

                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {isAr ? cap.titleAr : cap.titleEn}
                  </h3>

                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-6">
                    {isAr ? cap.descriptionAr : cap.descriptionEn}
                  </p>

                  {/* Typical Deliverables */}
                  {deliverables && deliverables.length > 0 && (
                    <div className="mb-6 pt-4 border-t border-[var(--border-level-2)]/60">
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-tertiary)] block mb-3">
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
                      {isAr ? "ملائم لـ:" : "Suitable for:"}
                    </span>
                    {suitableFor.map((fmt, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 rounded-md bg-[var(--surface-raised)] text-[11px] font-semibold text-[var(--text-secondary)]"
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
