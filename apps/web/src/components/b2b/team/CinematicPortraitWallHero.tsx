"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { SafePublicTeamMember } from "@/lib/team/team-resolver";
import { parseTwoLineHeadline } from "@/components/b2c/hero/E3LivingHero";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { cn } from "@/lib/utils";

interface CinematicPortraitWallHeroProps {
  featuredMembers?: SafePublicTeamMember[];
  locale?: string;
  eyebrowEn?: string;
  eyebrowAr?: string;
  fixedHeadlineEn?: string;
  fixedHeadlineAr?: string;
  headlineTemplateEn?: string;
  headlineTemplateAr?: string;
  rotatingWordsEn?: string[];
  rotatingWordsAr?: string[];
  descriptionEn?: string;
  descriptionAr?: string;
  primaryCtaLabelEn?: string;
  primaryCtaLabelAr?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabelEn?: string;
  secondaryCtaLabelAr?: string;
  secondaryCtaUrl?: string;
  animationSpeed?: number;
  media?: any;
  heroMedia?: any;
}

export function CinematicPortraitWallHero({
  locale = "en",
  eyebrowEn = "PEOPLE OF E3",
  eyebrowAr = "فريق عمل إي ثري",
  fixedHeadlineEn = "THE PEOPLE BEHIND EVERY E3 EXPERIENCE",
  fixedHeadlineAr = "العقول والشخصيات وراء كل تجربة تصنعها إي ثري",
  headlineTemplateEn,
  headlineTemplateAr,
  descriptionEn = "From the first sketch to the final guest, our strategists, designers, producers, technicians and operators build every moment together.",
  descriptionAr = "من المخطط الأول حتى آخر زائر، يبتكر خبراؤنا ومصممونا ومنتجونا وتقنيونا كل لحظة وتفصيل بتناغم متكامل.",
  primaryCtaLabelEn = "Meet the Teams",
  primaryCtaLabelAr = "تعرف على الفرق",
  primaryCtaUrl = "#how-e3-works",
  secondaryCtaLabelEn = "Join E3",
  secondaryCtaLabelAr = "انضم إلى إي ثري",
  secondaryCtaUrl,
  media,
  heroMedia,
}: CinematicPortraitWallHeroProps) {
  const isAr = locale === "ar";

  // 1. Resolve raw headline string
  const rawHeadline = isAr
    ? (headlineTemplateAr || fixedHeadlineAr || "العقول والشخصيات وراء كل تجربة تصنعها إي ثري")
    : (headlineTemplateEn || fixedHeadlineEn || "THE PEOPLE BEHIND EVERY E3 EXPERIENCE");

  const hasExplicitTemplate = rawHeadline.includes("{{animated}}") || rawHeadline.includes("\n");

  // 2. Parse into clean lines if template or multi-line
  const parsedHeadline = useMemo(() => {
    if (!hasExplicitTemplate) return null;
    return parseTwoLineHeadline(rawHeadline);
  }, [rawHeadline, hasExplicitTemplate]);

  const defaultSecondaryUrl = secondaryCtaUrl || `/${locale}/b2b/careers`;
  const activeMedia = heroMedia || media;

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      data-testid="cinematic-portrait-wall-hero"
      aria-label={isAr ? "دليل فريق العمل الرئيسي" : "Team Directory Hero"}
      className="relative min-h-[52svh] lg:min-h-[58svh] w-full bg-[#080b12] text-white flex flex-col items-center justify-center pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* ============================================================ */}
      {/* 1. ATMOSPHERIC BACKDROP & MEDIA RENDERER                     */}
      {/* ============================================================ */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {activeMedia && activeMedia.mediaUrl ? (
          <div className="absolute inset-0 w-full h-full">
            <UniversalMediaRenderer
              type={(activeMedia.mediaType as any) || "IMAGE"}
              src={activeMedia.mediaUrl}
              poster={activeMedia.posterUrl}
              autoPlay
              loop
              muted
              className="w-full h-full object-cover scale-105 filter blur-[1px] brightness-[0.4] transition-all duration-1000"
            />
            {/* Cinematic Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#080b12]/90 via-[#080b12]/75 to-[#080b12]" />
          </div>
        ) : null}

        {/* Subtle film grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Top Radial Glow Fields */}
        <div
          className="absolute -top-32 start-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.4) 0%, rgba(99,102,241,0.2) 50%, transparent 75%)",
          }}
        />
        <div
          className="absolute -bottom-24 inset-x-0 h-40 bg-gradient-to-t from-[#080b12] to-transparent pointer-events-none"
        />
      </div>

      {/* ============================================================ */}
      {/* 2. CENTERED CONTENT HERO (Eyebrow, Headline, Desc, CTAs)      */}
      {/* ============================================================ */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase mb-5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{isAr ? eyebrowAr : eyebrowEn}</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-3xl font-syne">
          {parsedHeadline ? (
            <div className="flex flex-col items-center justify-center gap-1 sm:gap-2">
              {/* Line 1 */}
              <span>{parsedHeadline.line1.text}</span>
              {/* Line 2 */}
              {parsedHeadline.line2.text && <span>{parsedHeadline.line2.text}</span>}
            </div>
          ) : (
            <span>{rawHeadline}</span>
          )}
        </h1>

        {/* Description Paragraph */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
          {isAr ? descriptionAr : descriptionEn}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <a
            href={primaryCtaUrl}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Users className="w-4 h-4" />
            <span>{isAr ? primaryCtaLabelAr : primaryCtaLabelEn}</span>
          </a>
          <Link
            href={defaultSecondaryUrl}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{isAr ? secondaryCtaLabelAr : secondaryCtaLabelEn}</span>
            <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
          </Link>
        </div>
      </div>
    </section>
  );
}
