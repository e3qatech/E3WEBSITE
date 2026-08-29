"use client";

import React from "react";
import Link from "next/link";
import { Clock, Maximize2, MapPin, CheckCircle2, ShieldCheck, ArrowRight, Layers } from "lucide-react";
import { CaseStudyScopeTimelinePayload } from "@/lib/case-studies/case-adapters";
import { CASE_STUDY_LABELS } from "@/lib/case-studies/case-labels";
import { getCanonicalService } from "@/lib/services/canonical-services";
import { localizeHref } from "@/lib/url-helper";

interface CaseScopeTimelineProps {
  scope: CaseStudyScopeTimelinePayload;
  locale: string;
  onOpenBriefWithDiscipline?: (slug: string) => void;
}

export function CaseScopeTimeline({
  scope,
  locale,
  onOpenBriefWithDiscipline,
}: CaseScopeTimelineProps) {
  const isAr = locale === "ar";
  const labels = CASE_STUDY_LABELS.detail;

  const duration = isAr ? scope.durationAr || scope.durationEn : scope.durationEn;
  const scale = isAr ? scope.scaleAr || scope.scaleEn : scope.scaleEn;
  const location = isAr ? scope.locationAr || scope.locationEn : scope.locationEn;
  const deliverables = isAr ? scope.deliverablesAr || scope.deliverablesEn || [] : scope.deliverablesEn || [];
  const disciplines = scope.disciplines || [];

  const hasContent = duration || scale || location || deliverables.length > 0 || disciplines.length > 0;
  if (!hasContent) return null;

  return (
    <section
      id="scope-timeline-section"
      className="py-20 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] transition-colors"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>{labels.scopeTitle[isAr ? "ar" : "en"]}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-3">
            {isAr ? "المواصفات الفنية ونطاق التسليم المباشر" : "Turnkey Scope, Scale & Phased Delivery"}
          </h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            {labels.scopeSubtitle[isAr ? "ar" : "en"]}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Key Specs Card */}
          <div className="lg:col-span-1 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div className="space-y-6">
              <h3 className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                {isAr ? "محددات المشروع" : "Project Dimensions"}
              </h3>

              {duration && (
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase text-[var(--text-tertiary)] block">
                      {labels.durationLabel[isAr ? "ar" : "en"]}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                      {duration}
                    </span>
                  </div>
                </div>
              )}

              {scale && (
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase text-[var(--text-tertiary)] block">
                      {labels.scaleLabel[isAr ? "ar" : "en"]}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                      {scale}
                    </span>
                  </div>
                </div>
              )}

              {location && (
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase text-[var(--text-tertiary)] block">
                      {isAr ? "الموقع في قطر" : "Location"}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                      {location}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-[var(--border-level-2)]/60 flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{isAr ? "تنفيذ مباشر ومطابق للمعايير الوطنية" : "100% Turnkey Delivery by E3"}</span>
            </div>
          </div>

          {/* Deliverables Checklist */}
          <div className="lg:col-span-2 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  {labels.deliverablesLabel[isAr ? "ar" : "en"]}
                </h3>
                <span className="text-xs font-mono font-bold text-[var(--text-tertiary)]">
                  {deliverables.length} {isAr ? "مخرجات معتمدة" : "Verified Deliverables"}
                </span>
              </div>

              {deliverables.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)]/60 text-sm font-medium text-[var(--text-primary)]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[var(--surface-raised)] text-xs text-[var(--text-secondary)]">
                  {isAr ? "نطاق عمل متكامل شامل التصميم، الإنتاج والتشغيل." : "End-to-end scope covering concept modeling, spatial engineering, and live operations."}
                </div>
              )}
            </div>

            {/* Disciplines Sub-bar */}
            {disciplines.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[var(--border-level-2)]/60">
                <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider block mb-3">
                  {isAr ? "التخصصات المرتبطة بهذا المشروع:" : "Applied Disciplines:"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {disciplines.map((slug) => {
                    const canonical = getCanonicalService(slug);
                    const name = isAr
                      ? canonical?.titleAr || slug
                      : canonical?.titleEn || slug;

                    return (
                      <div key={slug} className="inline-flex items-center gap-2">
                        <Link
                          href={localizeHref(`/b2b/services/${slug}`, locale)}
                          className="px-3 py-1.5 rounded-lg bg-[var(--surface-raised)] hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-primary)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                        >
                          {name}
                        </Link>
                        {onOpenBriefWithDiscipline && (
                          <button
                            onClick={() => onOpenBriefWithDiscipline(slug)}
                            title={labels.includeInBriefCta[isAr ? "ar" : "en"]}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
