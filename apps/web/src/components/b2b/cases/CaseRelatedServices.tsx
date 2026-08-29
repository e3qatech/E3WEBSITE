"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Wrench, FileText } from "lucide-react";
import { getCanonicalService } from "@/lib/services/canonical-services";
import { CASE_STUDY_LABELS } from "@/lib/case-studies/case-labels";
import { localizeHref } from "@/lib/url-helper";

interface CaseRelatedServicesProps {
  serviceSlugs: string[];
  locale: string;
  onOpenBriefWithService?: (slug: string) => void;
}

export function CaseRelatedServices({
  serviceSlugs,
  locale,
  onOpenBriefWithService,
}: CaseRelatedServicesProps) {
  const isAr = locale === "ar";
  const labels = CASE_STUDY_LABELS.detail;

  if (!serviceSlugs || serviceSlugs.length === 0) {
    return null;
  }

  const validServices = serviceSlugs
    .map((slug) => getCanonicalService(slug))
    .filter(Boolean);

  if (validServices.length === 0) {
    return null;
  }

  return (
    <section
      id="related-services-section"
      className="py-20 bg-[var(--bg-level-1)] border-b border-[var(--border-level-1)] transition-colors"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Wrench className="w-3.5 h-3.5" />
            <span>{labels.relatedServicesTitle[isAr ? "ar" : "en"]}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight mb-3">
            {isAr ? "القدرات التخصصية المطبقة في هذا المشروع" : "Specialised Capabilities Applied in this Landmark"}
          </h2>
          <p className="text-base text-[var(--text-secondary)]">
            {labels.relatedServicesSubtitle[isAr ? "ar" : "en"]}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validServices.map((service: any) => {
            const title = isAr ? service.titleAr : service.titleEn;
            const category = isAr ? service.categoryAr : service.categoryEn;
            const tagline = isAr ? service.taglineAr : service.taglineEn;

            return (
              <div
                key={service.slug}
                className="group flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-emerald-500/50 transition-all shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-widest">
                      {category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed mb-6">
                    {tagline}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border-level-2)]/60 flex items-center justify-between gap-2">
                  <Link
                    href={localizeHref(`/b2b/services/${service.slug}`, locale)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>{isAr ? "استعراض التخصص" : "Explore Discipline"}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>

                  {onOpenBriefWithService && (
                    <button
                      onClick={() => onOpenBriefWithService(service.slug)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-raised)] hover:bg-emerald-500/10 text-xs font-bold text-[var(--text-primary)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isAr ? "إدراج في الموجز" : "Include in Brief"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
