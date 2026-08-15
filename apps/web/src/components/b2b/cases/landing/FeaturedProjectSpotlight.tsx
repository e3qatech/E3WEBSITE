"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Building2, Calendar, Trophy, Layers } from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";

export interface FeaturedProjectSpotlightProps {
  config: {
    enabled?: boolean;
    eyebrowEn?: string;
    eyebrowAr?: string;
    titleEn?: string;
    titleAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
    cardCtaEn?: string;
    cardCtaAr?: string;
    viewAllCtaEn?: string;
    viewAllCtaAr?: string;
    viewAllLink?: string;
  };
  featuredProject: any | null;
  locale: string;
}

export function FeaturedProjectSpotlight({
  config,
  featuredProject,
  locale,
}: FeaturedProjectSpotlightProps) {
  const isAr = locale === "ar";
  if (config?.enabled === false || !featuredProject) return null;

  const eyebrow = isAr
    ? config.eyebrowAr || "المشروع البارز"
    : config.eyebrowEn || "FEATURED SPOTLIGHT";
  const sectionTitle = isAr
    ? config.titleAr || "إنجاز استثنائي بارز"
    : config.titleEn || "Landmark Experience Spotlight";

  const projectTitle = isAr
    ? featuredProject.titleAr || featuredProject.titleEn
    : featuredProject.titleEn;
  const clientName = featuredProject.clientName;
  const category = featuredProject.category;
  const year = featuredProject.year;

  const mediaUrl =
    featuredProject.heroImageUrl || featuredProject.thumbnailUrl || "";
  const mediaType =
    featuredProject.heroMediaType ||
    featuredProject.thumbnailMediaType ||
    "IMAGE";

  const challenge = isAr
    ? featuredProject.challengeAr || featuredProject.challengeEn
    : featuredProject.challengeEn;
  const solution = isAr
    ? featuredProject.solutionAr || featuredProject.solutionEn
    : featuredProject.solutionEn;
  const result = isAr
    ? featuredProject.resultAr || featuredProject.resultEn
    : featuredProject.resultEn;

  // Extract up to 3 impact metrics
  const metrics: any[] = Array.isArray(featuredProject.metrics)
    ? featuredProject.metrics.slice(0, 3)
    : [];

  const cardCta = isAr
    ? config.cardCtaAr || "استكشف تفاصيل دراسة الحالة"
    : config.cardCtaEn || "Explore Case Study";

  return (
    <section className="py-24 bg-zinc-950 border-b border-zinc-900 relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-1/2 start-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{eyebrow}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black font-syne text-zinc-100 tracking-tight">
              {sectionTitle}
            </h2>
          </div>

          <a
            href={config.viewAllLink || "#archive"}
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-mono text-xs font-bold uppercase tracking-widest group transition-colors"
          >
            <span>
              {isAr
                ? config.viewAllCtaAr || "استعراض كافة المشاريع"
                : config.viewAllCtaEn || "Explore All Work"}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
          </a>
        </div>

        {/* Featured Card Showcase */}
        <div className="rounded-3xl bg-zinc-900/50 border border-zinc-800/90 overflow-hidden backdrop-blur-xl shadow-2xl transition-all duration-500 hover:border-emerald-500/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Media Column (7 Cols on desktop) */}
            <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-[520px] bg-zinc-950 overflow-hidden group">
              {mediaUrl ? (
                <UniversalMediaRenderer
                  type={mediaType as any}
                  src={mediaUrl}
                  alt={projectTitle}
                  className="w-full h-full object-cover filter brightness-[0.8] group-hover:brightness-[0.95] group-hover:scale-105 transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center">
                  <Trophy className="w-16 h-16 text-zinc-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-zinc-950/90 hidden lg:block pointer-events-none" />

              {/* Floating Pill on Media */}
              <div className="absolute top-6 start-6 z-10 flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{isAr ? "مشروع مميز" : "LANDMARK HIGHLIGHT"}</span>
                </span>
              </div>
            </div>

            {/* Content Column (5 Cols on desktop) */}
            <div className="lg:col-span-5 p-8 md:p-10 lg:p-12 flex flex-col justify-between relative z-10">
              <div>
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {clientName && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 bg-zinc-950/80 px-3 py-1 rounded-full border border-zinc-800">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{clientName}</span>
                    </div>
                  )}
                  {category && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{category}</span>
                    </div>
                  )}
                  {year && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 bg-zinc-950/80 px-3 py-1 rounded-full border border-zinc-800">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{year}</span>
                    </div>
                  )}
                </div>

                {/* Project Title */}
                <h3 className="text-2xl md:text-4xl font-black font-syne text-zinc-100 tracking-tight mb-4 leading-tight">
                  {projectTitle}
                </h3>

                {/* Challenge / Solution Narrative Preview */}
                {(challenge || solution || result) && (
                  <div className="space-y-3 mb-8 text-zinc-300 text-sm md:text-base leading-relaxed">
                    {challenge && (
                      <p className="line-clamp-2 text-zinc-400">
                        <strong className="text-zinc-200 font-mono text-xs uppercase tracking-wider block mb-1">
                          {isAr ? "التحدي التشغيلي:" : "The Challenge:"}
                        </strong>
                        {challenge}
                      </p>
                    )}
                    {solution && (
                      <p className="line-clamp-2 text-zinc-300">
                        <strong className="text-emerald-400 font-mono text-xs uppercase tracking-wider block mb-1">
                          {isAr ? "الحل الهندسي والتنفيذي:" : "The Execution:"}
                        </strong>
                        {solution}
                      </p>
                    )}
                  </div>
                )}

                {/* Impact Metrics Chips */}
                {metrics.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 pt-4 border-t border-zinc-800/80">
                    {metrics.map((m: any, idx: number) => {
                      const val = m.valueEn || m.value || m.val || "";
                      const label = isAr
                        ? m.labelAr || m.labelEn || m.label || ""
                        : m.labelEn || m.label || "";
                      if (!val && !label) return null;
                      return (
                        <div
                          key={idx}
                          className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3.5 text-center"
                        >
                          <div className="text-xl md:text-2xl font-black font-syne text-emerald-400 mb-1">
                            {m.prefix || ""}{val}{m.suffix || ""}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider line-clamp-1">
                            {label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Call to Action Button */}
              <div className="pt-6 border-t border-zinc-800">
                <Link
                  href={`/${locale}/b2b/cases/${featuredProject.slug}`}
                  className="w-full py-4 px-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-syne font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center justify-center gap-3 group/btn"
                >
                  <span>{cardCta}</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 rtl:-scale-x-100 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
