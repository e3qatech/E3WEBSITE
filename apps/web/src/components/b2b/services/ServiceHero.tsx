"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, FileText, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { localizeHref } from "@/lib/url-helper";
import { CanonicalService } from "@/lib/services/canonical-services";

interface ServiceHeroProps {
  service: CanonicalService;
  locale: string;
  onOpenBriefBuilder?: () => void;
}

export function ServiceHero({ service, locale, onOpenBriefBuilder }: ServiceHeroProps) {
  const isAr = locale === "ar";
  const title = isAr ? service.titleAr : service.titleEn;
  const category = isAr ? service.categoryAr : service.categoryEn;
  const heroOutcome = isAr ? service.heroOutcomeAr : service.heroOutcomeEn;
  const supportingStatement = isAr ? service.supportingStatementAr : service.supportingStatementEn;

  const primaryCtaLabel = isAr
    ? (service.ctaPrimaryTextAr || "بناء موجز مشروعك المخصص")
    : (service.ctaPrimaryTextEn || "Build Your Project Brief");

  const secondaryCtaLabel = isAr
    ? (service.ctaSecondaryTextAr || "استعراض المشاريع ذات الصلة")
    : (service.ctaSecondaryTextEn || "View Relevant Work");

  const secondaryCtaUrl = service.ctaSecondaryUrl || "#case-studies-section";

  // Filter out any unverified proof points
  const verifiedPoints = (service.verifiedProofPoints || []).filter(
    (p) => p && p.isVerified !== false
  );

  return (
    <section className="relative min-h-[75vh] flex items-center pt-28 pb-16 overflow-hidden border-b border-[var(--border-level-1)] bg-[var(--bg-level-1)]">
      {/* Background Media Layer with Adaptive Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        {service.heroMediaUrl ? (
          <UniversalMediaRenderer
            type={service.heroMediaType || "IMAGE"}
            src={service.heroMediaUrl}
            alt={title}
            className="w-full h-full object-cover opacity-25 dark:opacity-20 scale-105 transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-950/20 via-[var(--surface-default)] to-[var(--bg-level-1)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-[var(--bg-level-1)]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-level-1)] via-[var(--bg-level-1)]/70 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-8">
        {/* Breadcrumb Hierarchy */}
        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)] mb-6">
          <Link
            href={localizeHref("/b2b", locale)}
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            {isAr ? "قطاع الأعمال" : "Enterprise"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 opacity-50" />
          <Link
            href={localizeHref("/b2b/services", locale)}
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            {isAr ? "الخدمات والقدرات" : "Services & Capabilities"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 opacity-50" />
          <span className="text-emerald-500 font-bold">{category}</span>
        </nav>

        <div className="max-w-4xl">
          {/* Category Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            {category}
          </div>

          {/* Primary Service Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] tracking-tight leading-[1.1] mb-5">
            {title}
          </h1>

          {/* Outcome-Led Statement */}
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-4 leading-snug">
            {heroOutcome}
          </p>

          {/* Supporting Narrative */}
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mb-8">
            {supportingStatement}
          </p>

          {/* Dual Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            {service.ctaPrimaryUrl ? (
              <Link
                href={localizeHref(service.ctaPrimaryUrl, locale)}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-700/20 hover:shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
              >
                <FileText className="w-4 h-4" />
                {primaryCtaLabel}
              </Link>
            ) : (
              <button
                onClick={onOpenBriefBuilder}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-700/20 hover:shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
              >
                <FileText className="w-4 h-4" />
                {primaryCtaLabel}
              </button>
            )}

            {secondaryCtaUrl.startsWith("#") ? (
              <a
                href={secondaryCtaUrl}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--surface-default)] hover:bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-[var(--text-primary)] font-semibold text-sm transition-all"
              >
                {secondaryCtaLabel}
                <ArrowRight className="w-4 h-4 rtl:rotate-180 text-emerald-500" />
              </a>
            ) : (
              <Link
                href={localizeHref(secondaryCtaUrl, locale)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--surface-default)] hover:bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-[var(--text-primary)] font-semibold text-sm transition-all"
              >
                {secondaryCtaLabel}
                <ArrowRight className="w-4 h-4 rtl:rotate-180 text-emerald-500" />
              </Link>
            )}
          </div>

          {/* Verified Proof Points Strip (Strict CMS Verification - unverified suppressed) */}
          {verifiedPoints.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[var(--border-level-1)]/60">
              {verifiedPoints.map((point, i) => (
                <div
                  key={i}
                  className="flex flex-col p-4 rounded-xl bg-[var(--surface-default)]/60 border border-[var(--border-level-2)]/60 backdrop-blur-sm shadow-xs"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                      {point.value}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      {isAr ? "معتمد" : "Verified"}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
                    {isAr ? point.labelAr : point.labelEn}
                  </span>
                  {point.sourceEn && (
                    <span className="text-[10px] text-[var(--text-tertiary)] mt-1 line-clamp-1">
                      {isAr ? point.sourceAr || point.sourceEn : point.sourceEn}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
