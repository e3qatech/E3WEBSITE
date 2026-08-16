"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
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
  eyebrowEn = "THE TALENT BEHIND THE EXPERIENCES",
  eyebrowAr = "فريق العمل وصناع التجارب الاستثنائية",
  fixedHeadlineEn = "Meet the Minds Shaping",
  fixedHeadlineAr = "نخبة العقول الهندسية التي تصنع",
  headlineTemplateEn,
  headlineTemplateAr,
  rotatingWordsEn = ["Extraordinary Moments", "Iconic Activations", "Sensory Spectacles", "Global Pavilions", "Cultural Landmarks"],
  rotatingWordsAr = ["اللحظات الاستثنائية", "الفعاليات الكبرى", "العروض البصرية", "الأجنحة العالمية", "المعالم الثقافية"],
  descriptionEn = "A multidisciplinary collective of spatial designers, AV engineers, project directors, and event architects orchestrating Qatar's most ambitious live experiences.",
  descriptionAr = "فريق متكامل من مهندسي المساحات، خبراء التقنيات السمعية والبصرية، ومديري المشاريع الذين يقودون أضخم الفعاليات والتجارب الحية في قطر.",
  primaryCtaLabelEn = "Join the Atelier",
  primaryCtaLabelAr = "انضم إلى الفريق",
  primaryCtaUrl,
  secondaryCtaLabelEn = "Explore Directory ↓",
  secondaryCtaLabelAr = "استكشف الدليل ↓",
  secondaryCtaUrl = "#team-directory",
  animationSpeed = 3000,
  media,
  heroMedia,
}: CinematicPortraitWallHeroProps) {
  const isAr = locale === "ar";
  const shouldReduceMotion = useReducedMotion();

  // 1. Resolve raw headline string
  const rawHeadline = isAr
    ? (headlineTemplateAr || fixedHeadlineAr || "نخبة العقول الهندسية التي تصنع")
    : (headlineTemplateEn || fixedHeadlineEn || "Meet the Minds Shaping");

  const hasExplicitTemplate = rawHeadline.includes("{{animated}}") || rawHeadline.includes("\n");

  // 2. Parse into clean lines if template or multi-line
  const parsedHeadline = useMemo(() => {
    if (!hasExplicitTemplate) return null;
    return parseTwoLineHeadline(rawHeadline);
  }, [rawHeadline, hasExplicitTemplate]);

  // 3. Rotating Kinetic Words
  const words = isAr
    ? (Array.isArray(rotatingWordsAr) && rotatingWordsAr.length > 0 ? rotatingWordsAr : ["اللحظات الاستثنائية", "الفعاليات الكبرى", "العروض البصرية"])
    : (Array.isArray(rotatingWordsEn) && rotatingWordsEn.length > 0 ? rotatingWordsEn : ["Extraordinary Moments", "Iconic Activations", "Sensory Spectacles"]);

  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || !words || words.length <= 1) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, animationSpeed);
    return () => clearInterval(interval);
  }, [words, animationSpeed, shouldReduceMotion]);

  const defaultPrimaryUrl = primaryCtaUrl || `/${locale}/careers`;
  const activeMedia = heroMedia || media;
  const currentWord = words[wordIndex] || words[0] || "";

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      data-testid="cinematic-portrait-wall-hero"
      aria-label={isAr ? "دليل فريق العمل الرئيسي" : "Team Directory Hero"}
      className="relative min-h-[52svh] lg:min-h-[62svh] w-full bg-[#090c13] text-white flex flex-col items-center justify-center pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* ============================================================ */}
      {/* 1. ATMOSPHERIC GRAPHITE BACKDROP & MEDIA RENDERER             */}
      {/* ============================================================ */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Active Hero Atmospheric Backdrop Media */}
        {activeMedia && activeMedia.mediaUrl ? (
          <div className="absolute inset-0 w-full h-full">
            <UniversalMediaRenderer
              type={(activeMedia.mediaType as any) || "IMAGE"}
              src={activeMedia.mediaUrl}
              poster={activeMedia.posterUrl}
              autoPlay
              loop
              muted
              className="w-full h-full object-cover scale-105 filter blur-[1px] brightness-[0.45] transition-all duration-1000"
            />
            {/* Cinematic Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#090c13]/90 via-[#090c13]/70 to-[#090c13]" />
          </div>
        ) : null}

        {/* Subtle film grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Top Radial Glow Fields */}
        <div
          className="absolute -top-32 start-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.45) 0%, rgba(99,102,241,0.25) 50%, transparent 75%)",
          }}
        />
        <div
          className="absolute -bottom-24 inset-x-0 h-40 bg-gradient-to-t from-[#090c13] to-transparent pointer-events-none"
        />
      </div>

      {/* ============================================================ */}
      {/* 2. CENTERED CONTENT HERO (Eyebrow, Headline, Desc, CTAs)      */}
      {/* ============================================================ */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-wider text-cyan-400 uppercase mb-5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{isAr ? eyebrowAr : eyebrowEn}</span>
        </div>

        {/* Kinetic Two-Line or Inline Headline with Safe Token Interpolation */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.18] max-w-3xl">
          {parsedHeadline ? (
            <div className="flex flex-col items-center justify-center gap-1 sm:gap-2">
              {/* Line 1 */}
              {parsedHeadline.line1.hasToken ? (
                <span className="inline-flex items-baseline flex-wrap justify-center gap-x-2.5">
                  {parsedHeadline.line1.prefix && <span>{parsedHeadline.line1.prefix}</span>}
                  <span className="inline-block relative min-h-[1.2em]">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={wordIndex}
                        initial={shouldReduceMotion ? {} : { opacity: 0, y: 14, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? {} : { opacity: 0, y: -14, filter: "blur(6px)" }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300"
                      >
                        {currentWord}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  {parsedHeadline.line1.suffix && <span>{parsedHeadline.line1.suffix}</span>}
                </span>
              ) : (
                <span>{parsedHeadline.line1.text}</span>
              )}

              {/* Line 2 */}
              {parsedHeadline.line2.hasToken ? (
                <span className="inline-flex items-baseline flex-wrap justify-center gap-x-2.5">
                  {parsedHeadline.line2.prefix && <span>{parsedHeadline.line2.prefix}</span>}
                  <span className="inline-block relative min-h-[1.2em]">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={wordIndex}
                        initial={shouldReduceMotion ? {} : { opacity: 0, y: 14, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? {} : { opacity: 0, y: -14, filter: "blur(6px)" }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300"
                      >
                        {currentWord}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  {parsedHeadline.line2.suffix && <span>{parsedHeadline.line2.suffix}</span>}
                </span>
              ) : parsedHeadline.line2.text ? (
                <span>{parsedHeadline.line2.text}</span>
              ) : null}
            </div>
          ) : (
            <span className="inline-flex items-baseline flex-wrap justify-center gap-x-2.5">
              <span>{rawHeadline}</span>
              <span className="inline-block relative min-h-[1.2em]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={shouldReduceMotion ? {} : { opacity: 0, y: 14, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={shouldReduceMotion ? {} : { opacity: 0, y: -14, filter: "blur(6px)" }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300"
                  >
                    {currentWord}
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          )}
        </h1>

        {/* Description Paragraph */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
          {isAr ? descriptionAr : descriptionEn}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href={defaultPrimaryUrl}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{isAr ? primaryCtaLabelAr : primaryCtaLabelEn}</span>
            <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
          </Link>
          <Link
            href={secondaryCtaUrl}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{isAr ? secondaryCtaLabelAr : secondaryCtaLabelEn}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
