"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { SafePublicTeamMember } from "@/lib/team/team-resolver";
import { resolveDepartmentAura } from "@/lib/team/department-aura";
import { cn } from "@/lib/utils";

interface CinematicPortraitWallHeroProps {
  featuredMembers: SafePublicTeamMember[];
  locale?: string;
  eyebrowEn?: string;
  eyebrowAr?: string;
  fixedHeadlineEn?: string;
  fixedHeadlineAr?: string;
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
}

export function CinematicPortraitWallHero({
  featuredMembers,
  locale = "en",
  eyebrowEn = "THE TALENT BEHIND THE EXPERIENCES",
  eyebrowAr = "فريق العمل وصناع التجارب الاستثنائية",
  fixedHeadlineEn = "Meet the Minds Shaping",
  fixedHeadlineAr = "نخبة العقول الهندسية التي تصنع",
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
}: CinematicPortraitWallHeroProps) {
  const isAr = locale === "ar";
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  // Rotating Kinetic Words
  const words = isAr ? rotatingWordsAr : rotatingWordsEn;
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || !words || words.length <= 1) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, animationSpeed);
    return () => clearInterval(interval);
  }, [words, animationSpeed, shouldReduceMotion]);

  // Subtle group mouse parallax
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x: x * 8, y: y * 6 });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // Scroll Parallax for subtle depth
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const stripOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.85]);
  const stripScale = useTransform(scrollYProgress, [0, 1], [1, 0.98]);

  // 5–7 published team members for the strip
  const wallMembers = featuredMembers.slice(0, 7);
  const defaultPrimaryUrl = primaryCtaUrl || `/${locale}/careers`;

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      dir={isAr ? "rtl" : "ltr"}
      data-testid="cinematic-portrait-wall-hero"
      aria-label={isAr ? "دليل فريق العمل الرئيسي" : "Team Directory Hero"}
      className="relative min-h-[70svh] lg:min-h-[78svh] w-full bg-[#090c13] text-white flex flex-col items-center justify-center pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* ============================================================ */}
      {/* 1. ATMOSPHERIC GRAPHITE BACKDROP & AMBIENT AURA              */}
      {/* ============================================================ */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Subtle film grain */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Top Radial Glow Fields */}
        <div
          className="absolute -top-32 start-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-3xl opacity-20 pointer-events-none"
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
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full mb-8 sm:mb-12">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-wider text-cyan-400 uppercase mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{isAr ? eyebrowAr : eyebrowEn}</span>
        </div>

        {/* Kinetic Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-3xl">
          {isAr ? fixedHeadlineAr : fixedHeadlineEn}{" "}
          <span className="inline-block relative min-h-[1.2em]">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? {} : { opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300"
              >
                {words[wordIndex] || words[0]}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>

        {/* Description Paragraph */}
        <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
          {isAr ? descriptionAr : descriptionEn}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
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

      {/* ============================================================ */}
      {/* 3. UNDERNEATH HORIZONTAL STRIP OF 5-7 EQUAL 3:4 PORTRAITS    */}
      {/* ============================================================ */}
      <motion.div
        data-testid="portrait-wall-container"
        style={
          shouldReduceMotion
            ? {}
            : {
                x: mouseOffset.x,
                y: mouseOffset.y,
                opacity: stripOpacity,
                scale: stripScale,
              }
        }
        className="relative z-10 w-full max-w-6xl mx-auto"
      >
        {/* Horizontal Strip: Mobile scroll-snap / Desktop clean grid flex */}
        <div className="flex items-center justify-start md:justify-center gap-3 sm:gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 sm:px-2 py-2 w-full">
          {wallMembers.map((member, index) => {
            const aura = resolveDepartmentAura(member.department, member.departmentKey);
            const initials = member.initials || "E3";
            const profileImg =
              member.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nameEn || member.name)}&background=0D1117&color=38BDF8&size=512`;

            return (
              <motion.div
                key={member.id || member.slug}
                data-testid={`portrait-panel-${member.slug}`}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : index * 0.07 }}
                className="group relative aspect-[3/4] w-28 sm:w-36 md:w-44 lg:w-48 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-xl transition-all duration-300 hover:border-cyan-400/50 hover:scale-[1.03] snap-center cursor-pointer"
              >
                {/* 3:4 Portrait Image (Muted grayscale initially, reveals vibrant color on hover) */}
                <img
                  src={profileImg}
                  alt={isAr ? (member.nameAr || member.name) : member.name}
                  className="w-full h-full object-cover object-top filter grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0D1117&color=38BDF8&size=512`;
                  }}
                />

                {/* Restrained Department Colored Accent Line at top */}
                <div
                  className="absolute top-0 inset-x-0 h-1 z-10 transition-opacity"
                  style={{ backgroundColor: aura.primaryColor }}
                />

                {/* Initial state: Clean portrait. Hover state: Reveals Name & Designation with dark gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-3.5 text-start pointer-events-none">
                  <span className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-sm">
                    {isAr ? (member.nameAr || member.name) : (member.nameEn || member.name)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-300 truncate mt-0.5 font-medium">
                    {isAr ? (member.designationAr || member.designation) : member.designation}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
