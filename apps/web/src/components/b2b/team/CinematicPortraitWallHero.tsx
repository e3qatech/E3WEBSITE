"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
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
  eyebrowEn = "THE MASTERMINDS — E3 LEADERSHIP",
  eyebrowAr = "العقول المدبرة — قيادة وفريق عمل إي ثري",
  fixedHeadlineEn = "MEET THE PEOPLE WHO BUILD",
  fixedHeadlineAr = "تعرّف على الأشخاص الذين يصنعون",
  rotatingWordsEn = ["EXPERIENCES", "DESTINATIONS", "MOMENTS", "THE IMPOSSIBLE"],
  rotatingWordsAr = ["التجارب", "الوجهات", "اللحظات", "المستحيل"],
  descriptionEn = "Meet the engineers, creatives, and tacticians who make the impossible happen every day.",
  descriptionAr = "تعرف على المهندسين والمبدعين والمخططين الذين يجعلون المستحيل ممكناً كل يوم.",
  primaryCtaLabelEn = "Join Our Team",
  primaryCtaLabelAr = "انضم لفريقنا",
  primaryCtaUrl,
  secondaryCtaLabelEn = "Explore Directory",
  secondaryCtaLabelAr = "استكشف دليل الفريق",
  secondaryCtaUrl = "#team-directory",
  animationSpeed = 2800,
}: CinematicPortraitWallHeroProps) {
  const isAr = locale === "ar";
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);

  // Active wall members (5 to 7 members)
  const wallMembers = featuredMembers.length >= 5 ? featuredMembers.slice(0, 7) : featuredMembers;

  // Kinetic Rotating Word
  const words = isAr ? rotatingWordsAr : rotatingWordsEn;
  const validWords = Array.isArray(words) && words.length > 0 ? words : ["EXPERIENCES"];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || validWords.length <= 1) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % validWords.length);
    }, animationSpeed);
    return () => clearInterval(interval);
  }, [validWords.length, animationSpeed, shouldReduceMotion]);

  // Subtle 4–8px Unified Wall Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 120 };
  const wallX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);
  const wallY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-6, 6]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Scroll Separation & Scale: Wall subtly scales and separates on downward scroll
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const wallScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const defaultPrimaryUrl = primaryCtaUrl || `/${locale}/careers`;

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      dir={isAr ? "rtl" : "ltr"}
      data-testid="cinematic-portrait-wall-hero"
      aria-label={isAr ? "دليل فريق العمل الرئيسي" : "Cinematic Portrait Wall Hero"}
      className="relative min-h-[82svh] lg:min-h-[88svh] w-full bg-[#090c13] text-white overflow-hidden flex flex-col justify-between pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8"
    >
      {/* ============================================================ */}
      {/* 1. ATMOSPHERIC BACKDROP & LIGHT AURA                          */}
      {/* ============================================================ */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Subtle noise grain */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Ambient Top Light Fields */}
        <div
          className="absolute -top-32 start-1/4 w-[600px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.5) 0%, rgba(139,92,246,0.3) 50%, transparent 75%)",
          }}
        />
        <div
          className="absolute top-1/2 end-10 w-[500px] h-[450px] rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(59,130,246,0.25) 50%, transparent 75%)",
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* 2. CINEMATIC OVERLAPPING 3:4 PORTRAIT WALL                   */}
      {/* ============================================================ */}
      <motion.div
        ref={wallRef}
        data-testid="portrait-wall-container"
        style={
          shouldReduceMotion
            ? {}
            : {
                x: wallX,
                y: wallY,
                scale: wallScale,
              }
        }
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden"
      >
        <div
          className={cn(
            "relative flex items-center justify-center w-full max-w-7xl px-4 sm:px-6",
            "-space-x-8 sm:-space-x-12 md:-space-x-16 lg:-space-x-20 rtl:space-x-reverse",
            "opacity-60 hover:opacity-100 transition-opacity duration-700"
          )}
        >
          {wallMembers.map((member, index) => {
            const aura = resolveDepartmentAura(member.department, member.departmentKey);
            const total = wallMembers.length;
            const mid = (total - 1) / 2;
            const offsetFromCenter = index - mid;
            
            // Asymmetric stagger elevations for dynamic editorial depth
            const translateY = Math.abs(offsetFromCenter) * 16 - 8;
            const rotation = offsetFromCenter * 1.5;

            return (
              <motion.div
                key={member.id || member.slug}
                data-testid={`portrait-panel-${member.slug}`}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: shouldReduceMotion ? 0 : index * 0.08 }}
                style={
                  shouldReduceMotion
                    ? {}
                    : {
                        marginTop: `${translateY}px`,
                        rotate: `${rotation}deg`,
                      }
                }
                className={cn(
                  "group/panel relative shrink-0 w-[140px] sm:w-[190px] md:w-[230px] lg:w-[260px] aspect-[3/4]",
                  "rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10",
                  "bg-zinc-950 pointer-events-auto transition-all duration-500",
                  "hover:scale-[1.06] hover:z-30 hover:border-cyan-400/50 hover:shadow-cyan-500/20 cursor-pointer"
                )}
              >
                <Link
                  href={`/${locale}/b2b/team/${member.slug}`}
                  className="absolute inset-0 z-20"
                  aria-label={`${member.name} - ${member.designation}`}
                >
                  <span className="sr-only">{member.name}</span>
                </Link>

                {/* 3:4 Portrait Image with Muted-to-Color Reveal */}
                {member.profileImage ? (
                  <img
                    src={member.profileImage}
                    alt={member.name}
                    loading={index < 3 ? "eager" : "lazy"}
                    className="w-full h-full object-cover object-top grayscale-[0.5] brightness-90 group-hover/panel:grayscale-0 group-hover/panel:brightness-105 group-hover/panel:scale-105 transition-all duration-700 ease-out"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center p-4 text-white text-center"
                    style={{
                      background: `linear-gradient(135deg, ${aura.primaryColor}22 0%, #090c13 100%)`,
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-black mb-2"
                      style={{
                        borderColor: `${aura.primaryColor}60`,
                        color: aura.primaryColor,
                      }}
                    >
                      {member.initials}
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      {member.department}
                    </span>
                  </div>
                )}

                {/* Bottom Scrim with Name & Designation (Revealed on hover) */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col justify-end opacity-90 group-hover/panel:opacity-100 transition-opacity">
                  <span
                    className="text-[10px] font-mono font-bold uppercase tracking-wider truncate mb-0.5"
                    style={{ color: aura.primaryColor }}
                  >
                    {member.department}
                  </span>
                  <h3 className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight truncate">
                    {member.name}
                  </h3>
                  <p className="text-[11px] text-slate-300 truncate hidden sm:block">
                    {member.designation}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* 3. OVERLAID EDITORIAL HEADLINE & CTAS (CONTROLLED SCRIM)     */}
      {/* ============================================================ */}
      <div className="relative z-20 w-full max-w-7xl mx-auto my-auto flex flex-col items-start text-start pointer-events-none">
        
        {/* Controlled readable background scrim for typography */}
        <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-slate-950/75 backdrop-blur-xl border border-white/10 shadow-2xl max-w-2xl pointer-events-auto">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{isAr ? eyebrowAr : eyebrowEn}</span>
          </div>

          {/* Headline with kinetic rotating word reveal */}
          <h1
            data-testid="portrait-wall-hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] mb-4"
          >
            <span className="block">{isAr ? fixedHeadlineAr : fixedHeadlineEn}</span>
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 min-h-[1.2em]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={validWords[wordIndex]}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? {} : { opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="inline-block"
                >
                  {validWords[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed mb-6 max-w-lg">
            {isAr ? descriptionAr : descriptionEn}
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={defaultPrimaryUrl}
              data-testid="hero-primary-cta"
              className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-cyan-500/20 flex items-center gap-2"
            >
              <span>{isAr ? primaryCtaLabelAr : primaryCtaLabelEn}</span>
              <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
            </Link>

            <a
              href={secondaryCtaUrl}
              data-testid="hero-secondary-cta"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
            >
              <span>{isAr ? secondaryCtaLabelAr : secondaryCtaLabelEn}</span>
            </a>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. BOTTOM TRANSITION TO SPOTLIGHT                            */}
      {/* ============================================================ */}
      <div className="relative z-20 w-full max-w-7xl mx-auto flex items-center justify-between text-xs font-mono text-slate-400 pt-6 border-t border-white/10">
        <span>{isAr ? "دليل النخبة والهندسة الإبداعية" : "Engineering & Creative Roster"}</span>
        <span className="text-cyan-400 font-bold">{wallMembers.length} Masterminds Active</span>
      </div>
    </section>
  );
}
