"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, FileText, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { localizeHref } from "@/lib/url-helper";
import { ServiceCmsPayload, isApprovedClaim } from "@/lib/services/canonical-services";
import { getServiceFrameworkLabels } from "@/lib/services/service-labels";
import { cn } from "@/lib/utils";

interface ServiceHeroProps {
  serviceRecord: any;
  cmsPayload: ServiceCmsPayload;
  locale: string;
  hasCaseStudies?: boolean;
  onOpenBriefBuilder?: () => void;
}

export function ServiceHero({
  serviceRecord,
  cmsPayload,
  locale,
  hasCaseStudies = true,
  onOpenBriefBuilder,
}: ServiceHeroProps) {
  const isAr = locale === "ar";
  const labels = getServiceFrameworkLabels(locale);
  const title = isAr ? serviceRecord.titleAr || serviceRecord.titleEn : serviceRecord.titleEn;
  const category = isAr ? serviceRecord.category || labels.enterpriseCapability : serviceRecord.category || labels.enterpriseCapability;
  const heroOutcome = isAr ? cmsPayload.heroOutcomeAr || serviceRecord.taglineAr : cmsPayload.heroOutcomeEn || serviceRecord.taglineEn;
  const supportingStatement = isAr ? cmsPayload.supportingStatementAr || serviceRecord.contentAr : cmsPayload.supportingStatementEn || serviceRecord.contentEn;

  const presentation = cmsPayload.presentation || {};
  const composition = presentation.heroComposition || "fullscreen-cinematic";
  const accent = presentation.accentColor || "emerald";

  // Sourced media: strictly this service's media (desktop / mobile fallback)
  const heroMedia = serviceRecord.heroMediaUrl || cmsPayload.heroDesktopMediaUrl || serviceRecord.thumbnail || undefined;
  const heroPoster = cmsPayload.heroVideoPosterUrl || undefined;

  // Strict Claim Governance Filter: requires status === 'APPROVED' with evidence and not expired
  const approvedProofPoints = (cmsPayload.verifiedProofPoints || []).filter(isApprovedClaim);

  // Accent styles mapping
  const accentClasses = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    violet: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    crimson: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    gold: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  }[accent] || "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

  const btnAccentClass = {
    emerald: "bg-emerald-500 hover:bg-emerald-400 text-zinc-950",
    amber: "bg-amber-500 hover:bg-amber-400 text-zinc-950",
    cyan: "bg-cyan-500 hover:bg-cyan-400 text-zinc-950",
    violet: "bg-purple-500 hover:bg-purple-400 text-white",
    crimson: "bg-rose-500 hover:bg-rose-400 text-white",
    orange: "bg-orange-500 hover:bg-orange-400 text-zinc-950",
    gold: "bg-yellow-500 hover:bg-yellow-400 text-zinc-950",
  }[accent] || "bg-emerald-500 hover:bg-emerald-400 text-zinc-950";

  return (
    <section
      id="overview-section"
      className={cn(
        "relative flex items-center pt-28 pb-16 overflow-hidden border-b border-[var(--border-level-1)] bg-[var(--bg-level-1)] transition-colors",
        composition === "split-media" ? "min-h-[80vh]" : "min-h-[75vh]"
      )}
    >
      {/* Background Media Layer (Full-Bleed or Subtle Typographic Gradient) */}
      {composition !== "split-media" && (
        <div className="absolute inset-0 z-0">
          {heroMedia ? (
            <UniversalMediaRenderer
              type={serviceRecord.heroMediaType || (cmsPayload.heroVideoUrl ? "VIDEO" : "IMAGE")}
              src={heroMedia}
              poster={heroPoster}
              alt={title}
              className="w-full h-full object-cover opacity-75 dark:opacity-65 scale-105 transition-transform duration-1000 filter brightness-[0.75] contrast-[1.05]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-950/30 via-[var(--surface-default)] to-[var(--bg-level-1)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent rtl:bg-gradient-to-l rtl:from-black/90 rtl:via-black/60 rtl:to-transparent" />
        </div>
      )}

      <div className="container relative z-10 mx-auto px-4 md:px-8">
        {/* Breadcrumb Hierarchy */}
        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-300 mb-6">
          <Link
            href={localizeHref("/b2b", locale)}
            className="hover:text-white transition-colors"
          >
            {isAr ? "قطاع الأعمال" : "Enterprise"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 opacity-50" />
          <Link
            href={localizeHref("/b2b/services", locale)}
            className="hover:text-white transition-colors"
          >
            {isAr ? "الخدمات والقدرات" : "Services & Capabilities"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 opacity-50" />
          <span className="text-emerald-400 font-bold">{category}</span>
        </nav>

        {composition === "split-media" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              {/* Category Pill */}
              <div className={cn("inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider mb-4", accentClasses)}>
                <Sparkles className="w-3.5 h-3.5" />
                {category}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-syne text-[var(--text-primary)] tracking-tight leading-[1.1] mb-5">
                {title}
              </h1>

              {/* Outcome */}
              {heroOutcome && (
                <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4 leading-snug">
                  {heroOutcome}
                </p>
              )}

              {/* Supporting Statement */}
              {supportingStatement && (
                <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-8 font-medium">
                  {supportingStatement}
                </p>
              )}

              {/* Dual Action CTAs */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button
                  type="button"
                  onClick={onOpenBriefBuilder}
                  className={cn(
                    "inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full font-bold text-sm tracking-wide shadow-lg transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-emerald-400",
                    btnAccentClass
                  )}
                >
                  <FileText className="w-4 h-4" />
                  {labels.buildProjectBrief}
                </button>

                {hasCaseStudies && (
                  <a
                    href="#case-studies-section"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--surface-default)] hover:bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-[var(--text-primary)] font-semibold text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                  >
                    <span>{labels.viewRelevantWork}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180 text-emerald-500" />
                  </a>
                )}
              </div>
            </div>

            {/* Split Media Column */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[var(--surface-raised)] border border-[var(--border-level-2)] shadow-2xl">
                {heroMedia ? (
                  <UniversalMediaRenderer
                    type={serviceRecord.heroMediaType || (cmsPayload.heroVideoUrl ? "VIDEO" : "IMAGE")}
                    src={heroMedia}
                    poster={heroPoster}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-emerald-950/20 via-[var(--surface-default)] to-[var(--bg-level-1)]">
                    <Sparkles className="w-12 h-12 text-emerald-500/40 mb-3" />
                    <span className="text-sm font-bold text-[var(--text-secondary)]">{title}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={cn("max-w-4xl", composition === "centered" && "mx-auto text-center")}>
            {/* Category Pill */}
            <div className={cn("inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md", accentClasses)}>
              <Sparkles className="w-3.5 h-3.5" />
              {category}
            </div>

            {/* Primary Service Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-syne text-white tracking-tight leading-[1.1] mb-5 drop-shadow-2xl">
              {title}
            </h1>

            {/* Outcome-Led Statement */}
            {heroOutcome && (
              <p className="text-xl sm:text-2xl font-bold text-emerald-400 mb-4 leading-snug drop-shadow-md">
                {heroOutcome}
              </p>
            )}

            {/* Supporting Narrative */}
            {supportingStatement && (
              <p className="text-base sm:text-lg text-zinc-200 leading-relaxed max-w-3xl mb-8 font-medium drop-shadow-md">
                {supportingStatement}
              </p>
            )}

            {/* Dual Action CTAs */}
            <div className={cn("flex flex-wrap items-center gap-4 mb-12", composition === "centered" && "justify-center")}>
              <button
                type="button"
                onClick={onOpenBriefBuilder}
                className={cn(
                  "inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full font-bold text-sm tracking-wide shadow-lg transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-emerald-400",
                  btnAccentClass
                )}
              >
                <FileText className="w-4 h-4" />
                {labels.buildProjectBrief}
              </button>

              {hasCaseStudies && (
                <a
                  href="#case-studies-section"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 hover:border-white/40 font-semibold text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                >
                  <span>{labels.viewRelevantWork}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180 text-emerald-400" />
                </a>
              )}
            </div>

            {/* Verified Proof Points Strip */}
            {approvedProofPoints.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/15">
                {approvedProofPoints.map((point, i) => (
                  <div
                    key={point.id || i}
                    className="flex flex-col p-4 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-md shadow-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-black font-syne text-white tracking-tight">
                        {point.value}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {labels.verified}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-zinc-300">
                      {isAr ? point.labelAr : point.labelEn}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
