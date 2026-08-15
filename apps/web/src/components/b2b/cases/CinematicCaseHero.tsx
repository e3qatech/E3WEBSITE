"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Trophy, Sparkles, Building2, Layers, Calendar, ArrowLeft } from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";

interface CinematicCaseHeroProps {
  locale?: string;
  title: string;
  clientName?: string | null;
  category?: string | null;
  year?: number | null;
  heroMediaType?: string | null;
  heroImageUrl?: string | null;
  thumbnailMediaType?: string | null;
  thumbnailUrl?: string | null;
  clientLogoUrl?: string | null;
  isFeatured?: boolean;
  attraction?: {
    id: string;
    slug?: string | null;
    nameEn?: string | null;
    nameAr?: string | null;
  } | null;
}

export function CinematicCaseHero({
  locale = "en",
  title,
  clientName,
  category,
  year,
  heroMediaType = "IMAGE",
  heroImageUrl,
  thumbnailMediaType = "IMAGE",
  thumbnailUrl,
  clientLogoUrl,
  isFeatured = false,
  attraction,
}: CinematicCaseHeroProps) {
  const isAr = locale === "ar";
  const shouldReduceMotion = useReducedMotion();

  const mediaSource = heroImageUrl || thumbnailUrl;
  const mediaType = heroImageUrl ? (heroMediaType || "IMAGE") : (thumbnailMediaType || "IMAGE");

  const attractionName = isAr
    ? attraction?.nameAr || attraction?.nameEn
    : attraction?.nameEn;

  return (
    <section
      data-testid="cinematic-case-hero"
      aria-label={isAr ? "مقدمة دراسة الحالة" : "Case Study Hero"}
      dir={isAr ? "rtl" : "ltr"}
      className="relative min-h-[85vh] lg:min-h-[92vh] w-full flex flex-col justify-end pt-28 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-12 overflow-hidden bg-[#080b12] text-white"
    >
      {/* Background Media with Parallax & Multi-layer Scrim */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {mediaSource ? (
          <motion.div
            initial={shouldReduceMotion ? {} : { scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            className="w-full h-full"
          >
            <UniversalMediaRenderer
              type={mediaType as any}
              src={mediaSource}
              className="w-full h-full object-cover filter brightness-[0.55] contrast-[1.1]"
            />
          </motion.div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0c1220] via-[#080b12] to-[#04060a]" />
        )}

        {/* Cinematic readability gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b12] via-[#080b12]/75 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b12]/90 via-[#080b12]/50 to-transparent rtl:bg-gradient-to-l pointer-events-none" />
      </div>

      {/* Main Hero Foreground Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Back Button & Top Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-6 sm:mb-8">
          <Link
            href={`/${locale}/b2b/cases`}
            data-testid="hero-back-link"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono font-bold text-slate-200 hover:text-white backdrop-blur-md transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
            <span>{isAr ? "جميع المشاريع ودراسات الحالة" : "All Case Studies"}</span>
          </Link>

          {isFeatured && (
            <span
              data-testid="hero-featured-badge"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{isAr ? "مشروع مميز" : "Featured Case Study"}</span>
            </span>
          )}

          {attraction && (
            <Link
              href={`/${locale}/b2c/attractions/${attraction.slug || attraction.id}`}
              data-testid="hero-linked-attraction-badge"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold uppercase tracking-wider backdrop-blur-md hover:bg-emerald-500/30 transition-colors"
            >
              <Trophy className="w-3 h-3 text-emerald-400" />
              <span>{isAr ? `مشروع ضمن ${attractionName}` : `Live at ${attractionName}`}</span>
            </Link>
          )}
        </div>

        {/* Title and Client Logo Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
          <div className="max-w-4xl">
            {/* Single H1 as mandated */}
            <motion.h1
              data-testid="case-study-title"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] drop-shadow-2xl font-syne"
            >
              {title}
            </motion.h1>

            {/* Sub-strip of key metadata */}
            <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-300 font-medium">
              {clientName && (
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{clientName}</span>
                </div>
              )}
              {category && (
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{category}</span>
                </div>
              )}
              {year && (
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{year}</span>
                </div>
              )}
            </div>
          </div>

          {/* Client Logo Banner */}
          {clientLogoUrl && (
            <div
              data-testid="hero-client-logo"
              className="shrink-0 bg-white/5 border border-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl hidden md:flex items-center justify-center max-w-[200px]"
            >
              <img
                src={clientLogoUrl}
                alt={clientName ? `${clientName} Logo` : "Client Logo"}
                className="max-h-12 w-auto object-contain filter brightness-110"
              />
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="mt-10 sm:mt-14 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <Link
            href="#overview"
            className="inline-flex items-center gap-2 font-mono uppercase tracking-widest text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>{isAr ? "استكشف تفاصيل المشروع ↓" : "Explore Case Narrative ↓"}</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </Link>
          <span className="font-mono text-[11px] text-slate-500 hidden sm:inline-block">
            E3 ATELIER ENGINEERING
          </span>
        </div>
      </div>
    </section>
  );
}
