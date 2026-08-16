"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { LivingHeroHeadline } from "@/components/b2b/shared/LivingHeroHeadline";

export interface CaseStudiesHeroProps {
  hero: {
    enabled?: boolean;
    eyebrowEn?: string;
    eyebrowAr?: string;
    titleEn?: string;
    titleAr?: string;
    fixedHeadlineEn?: string;
    fixedHeadlineAr?: string;
    headlineTemplateEn?: string;
    headlineTemplateAr?: string;
    rotatingWordsEn?: string[];
    rotatingWordsAr?: string[];
    enableRotatingWords?: boolean;
    animationSpeed?: number;
    subtitleEn?: string;
    subtitleAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
    media?: {
      mediaType?: string;
      mediaUrl?: string;
      posterUrl?: string;
    };
    mediaType?: string;
    mediaUrl?: string;
    backgroundImage?: string;
    mobileMediaUrl?: string;
    posterImage?: string;
    overlayStrength?: number;
    primaryCtaEn?: string;
    primaryCtaAr?: string;
    primaryLink?: string;
    secondaryCtaEn?: string;
    secondaryCtaAr?: string;
    secondaryLink?: string;
  };
  totalDeliveredCount: number;
  locale: string;
}

export function CaseStudiesHero({ hero, totalDeliveredCount, locale }: CaseStudiesHeroProps) {
  const isAr = locale === "ar";
  if (hero?.enabled === false) return null;

  const eyebrow = isAr ? hero.eyebrowAr || "سجل الإنجازات" : hero.eyebrowEn || "The Vault";
  const title = isAr
    ? hero.titleAr || "الأفكار تصنع الإمكانات. والنتائج تثبتها."
    : hero.titleEn || "Ideas Are Powerful. Results Make Them Real.";
  const subtitle = isAr
    ? hero.subtitleAr || "اكتشف التجارب والوجهات والفعاليات الاستثنائية التي حولتها إي ثري من أفكار طموحة إلى إنجازات ذات أثر ملموس."
    : hero.subtitleEn || "Explore the experiences, destinations and landmark events E3 has transformed from ambitious ideas into measurable impact.";
  const description = isAr ? hero.descriptionAr : hero.descriptionEn;

  const primaryCta = isAr ? hero.primaryCtaAr || "استكشف أعمالنا" : hero.primaryCtaEn || "Explore Our Work";
  const primaryHref = hero.primaryLink || "#archive";

  const secondaryCta = isAr ? hero.secondaryCtaAr || "ابدأ مشروعك" : hero.secondaryCtaEn || "Start a Project";
  const rawSecondaryLink = hero.secondaryLink || "/b2b/contact";
  const secondaryHref = rawSecondaryLink.startsWith("http")
    ? rawSecondaryLink
    : rawSecondaryLink.startsWith(`/${locale}`)
    ? rawSecondaryLink
    : `/${locale}${rawSecondaryLink.startsWith("/") ? "" : "/"}${rawSecondaryLink}`;

  const overlayOpacity = Math.min(1, Math.max(0.2, (hero.overlayStrength ?? 70) / 100));

  const heroMediaUrl = (
    hero.media?.mediaUrl ||
    hero.mediaUrl ||
    (hero as any).backgroundImage ||
    "/hero-bg.png"
  ).replace("/hero-b2b.jpg", "/hero-bg.png");

  const heroMediaType = ((hero.media?.mediaType || hero.mediaType || "IMAGE") as any);
  const heroPoster = (hero.media?.posterUrl || hero.posterImage || "").replace("/hero-b2b.jpg", "/hero-bg.png");
  const heroMobileMediaUrl = (hero.mobileMediaUrl || "").replace("/hero-b2b.jpg", "/hero-bg.png");

  return (
    <section className="relative min-h-[82vh] flex items-center justify-center overflow-hidden border-b border-zinc-900/80 pt-32 pb-20 bg-zinc-950">
      {/* Background Media Container */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Desktop Media */}
        <div className={heroMobileMediaUrl ? "hidden md:block w-full h-full" : "w-full h-full"}>
          <UniversalMediaRenderer
            type={heroMediaType}
            src={heroMediaUrl}
            poster={heroPoster || undefined}
            alt={title}
            className="w-full h-full object-cover filter brightness-[0.55] contrast-[1.1] scale-105"
          />
        </div>

        {/* Mobile Media */}
        {heroMobileMediaUrl && (
          <div className="md:hidden w-full h-full">
            <UniversalMediaRenderer
              type={heroMediaType}
              src={heroMobileMediaUrl}
              poster={heroPoster || undefined}
              alt={title}
              className="w-full h-full object-cover filter brightness-[0.55] contrast-[1.1] scale-105"
            />
          </div>
        )}

        {/* Atmospheric Overlays */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/40"
          style={{ opacity: overlayOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent rtl:bg-gradient-to-l" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-60" />
      </div>

      {/* Hero Foreground Content */}
      <div className="container relative z-10 mx-auto px-4 md:px-8">
        <div className="max-w-5xl">
          {/* Live Metric Counter Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <Trophy className="w-3.5 h-3.5" />
            <span>{eyebrow}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {totalDeliveredCount} {isAr ? "مشروعاً موثقاً" : "Delivered Landmarks"}
            </span>
          </div>

          <div className="mb-6">
            <LivingHeroHeadline
              headlineTemplateEn={hero.headlineTemplateEn || hero.fixedHeadlineEn || hero.titleEn || "Ideas Are Powerful. Results Make Them {{animated}}"}
              headlineTemplateAr={hero.headlineTemplateAr || hero.fixedHeadlineAr || hero.titleAr || "الأفكار تصنع الإمكانات. والنتائج تجعلها {{animated}}"}
              rotatingWordsEn={hero.rotatingWordsEn}
              rotatingWordsAr={hero.rotatingWordsAr}
              enableRotatingWords={hero.enableRotatingWords !== false}
              animationSpeed={hero.animationSpeed || 2800}
              locale={locale}
              align={isAr ? "start" : "start"}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.75rem] font-black font-syne text-zinc-100 tracking-tight leading-[1.08] drop-shadow-2xl"
              gradientClass="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500"
            />
          </div>

          <p className="text-xl md:text-2xl text-zinc-300 font-medium max-w-3xl leading-relaxed mb-4">
            {subtitle}
          </p>

          {description && (
            <p className="text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed mb-8">
              {description}
            </p>
          )}

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href={primaryHref}
              className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-syne font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] inline-flex items-center gap-2.5 group cursor-pointer"
            >
              <span>{primaryCta}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
            </a>

            {secondaryHref.startsWith("http") ? (
              <a
                href={secondaryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 font-syne font-bold text-sm uppercase tracking-widest transition-all duration-300 backdrop-blur-md"
              >
                {secondaryCta}
              </a>
            ) : (
              <Link
                href={secondaryHref}
                className="px-8 py-4 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 font-syne font-bold text-sm uppercase tracking-widest transition-all duration-300 backdrop-blur-md"
              >
                {secondaryCta}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
