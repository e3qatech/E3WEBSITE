"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { SafePublicTeamMember } from "@/lib/team/team-resolver";
import { useCapabilityTier } from "@/lib/motion/capability-context";

interface HumanConstellationHeroProps {
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

export function HumanConstellationHero({
  featuredMembers,
  locale = "en",
  eyebrowEn = "E3 MASTERMINDS & LEADERSHIP",
  eyebrowAr = "قيادة وفريق عمل إي ثري",
  fixedHeadlineEn = "MEET THE PEOPLE WHO BUILD",
  fixedHeadlineAr = "تعرّف على الأشخاص الذين يصنعون",
  rotatingWordsEn = ["EXPERIENCES", "DESTINATIONS", "MOMENTS", "THE IMPOSSIBLE"],
  rotatingWordsAr = ["التجارب", "الوجهات", "اللحظات", "المستحيل"],
  descriptionEn = "Meet the engineers, creatives, and tacticians who make the impossible happen every day.",
  descriptionAr = "تعرف على المهندسين والمبدعين والمخططين الذين يجعلون المستحيل ممكناً كل يوم.",
  primaryCtaLabelEn = "Join Our Team",
  primaryCtaLabelAr = "انضم لفريقنا",
  primaryCtaUrl = `/${locale}/careers`,
  secondaryCtaLabelEn = "Explore Departments",
  secondaryCtaLabelAr = "استكشف الأقسام",
  secondaryCtaUrl = "#department-navigator",
  animationSpeed = 2800,
}: HumanConstellationHeroProps) {
  const isAr = locale === "ar";
  const shouldReduceMotion = useReducedMotion();
  const tier = useCapabilityTier();
  const isLowTier = tier === "minimal" || Boolean(shouldReduceMotion);

  // Active word rotation
  const words = isAr ? rotatingWordsAr : rotatingWordsEn;
  const validWords = Array.isArray(words) && words.length > 0 ? words : ["EXPERIENCES"];
  const [wordIndex, setWordIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isLowTier || isPaused || validWords.length <= 1) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % validWords.length);
    }, animationSpeed);
    return () => clearInterval(interval);
  }, [validWords.length, animationSpeed, isLowTier, isPaused]);

  // Pointer Parallax (restrained)
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLowTier || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // 5 Constellation Nodes (desktop) / 3 (mobile)
  // Depth levels: 0 = background, 1 = midground, 2 = foreground
  const constellationMembers = featuredMembers.slice(0, 5);

  const nodePositions = [
    // Node 0: Foreground Right / Top
    {
      top: "12%",
      left: isAr ? "10%" : "78%",
      depth: 2,
      scale: 1.1,
      size: "w-20 h-20 md:w-28 md:h-28",
      orbitClass: "animate-orbit-slow",
      ringColor: "from-violet-500 to-cyan-400",
    },
    // Node 1: Foreground Left / Mid
    {
      top: "52%",
      left: isAr ? "80%" : "8%",
      depth: 2,
      scale: 1.05,
      size: "w-24 h-24 md:w-32 md:h-32",
      orbitClass: "animate-orbit-medium",
      ringColor: "from-cyan-400 to-emerald-400",
    },
    // Node 2: Midground Center-Right
    {
      top: "68%",
      left: isAr ? "20%" : "74%",
      depth: 1,
      scale: 0.95,
      size: "w-16 h-16 md:w-24 md:h-24",
      orbitClass: "animate-orbit-reverse",
      ringColor: "from-purple-500 to-pink-500",
    },
    // Node 3: Background Top-Center
    {
      top: "18%",
      left: isAr ? "68%" : "26%",
      depth: 0,
      scale: 0.85,
      size: "w-14 h-14 md:w-20 md:h-20",
      orbitClass: "animate-orbit-slow",
      ringColor: "from-emerald-400 to-teal-500",
    },
    // Node 4: Midground Bottom-Left
    {
      top: "76%",
      left: isAr ? "52%" : "42%",
      depth: 1,
      scale: 0.9,
      size: "w-14 h-14 md:w-22 md:h-22",
      orbitClass: "animate-orbit-medium",
      ringColor: "from-violet-400 to-purple-600",
    },
  ];

  const [activeNodeIndex, setActiveNodeIndex] = useState<number | null>(null);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-testid="human-constellation-hero"
      className="relative w-full min-h-[82svh] md:min-h-[88svh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[var(--surface-default)] via-[var(--bg-level-1)] to-[var(--surface-default)] select-none pt-24 pb-16"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Background Ambience: Radial Aura + Orbit Lines + Subtle Noise */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-60 dark:opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(139,92,246,0.22), rgba(6,182,212,0.12) 40%, rgba(16,185,129,0.06) 65%, transparent 85%)",
        }}
      />

      {/* Orbit Rings Decoration */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-30 stroke-violet-500/40 dark:stroke-cyan-400/30"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50%"
          cy="48%"
          r="38%"
          fill="none"
          strokeWidth="1"
          strokeDasharray="4 8"
          className="animate-spin-very-slow origin-center"
        />
        <circle
          cx="50%"
          cy="48%"
          r="26%"
          fill="none"
          strokeWidth="1"
          strokeDasharray="6 12"
          className="animate-reverse-spin-very-slow origin-center"
        />
        <ellipse
          cx="50%"
          cy="48%"
          rx="45%"
          ry="30%"
          fill="none"
          strokeWidth="1"
          strokeDasharray="2 6"
        />
      </svg>

      {/* Interactive Constellation Nodes (Portraits) */}
      <div className="absolute inset-0 pointer-events-auto z-10 overflow-hidden">
        {constellationMembers.map((member, idx) => {
          const config = nodePositions[idx] || nodePositions[0];
          // Parallax calculation
          const factor = (config.depth + 1) * 18;
          const offsetX = isLowTier ? 0 : mousePos.x * factor;
          const offsetY = isLowTier ? 0 : mousePos.y * factor;
          const isActive = activeNodeIndex === idx;

          return (
            <motion.div
              key={member.id || member.slug}
              className={`absolute cursor-pointer transition-transform duration-500 ${
                idx >= 3 ? "hidden md:block" : "block"
              }`}
              style={{
                top: config.top,
                left: config.left,
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${config.scale})`,
                zIndex: config.depth * 10 + 5,
              }}
              initial={isLowTier ? false : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: config.scale }}
              transition={{ duration: 0.8, delay: idx * 0.12 }}
              onMouseEnter={() => {
                setActiveNodeIndex(idx);
                setIsPaused(true);
              }}
              onMouseLeave={() => {
                setActiveNodeIndex(null);
                setIsPaused(false);
              }}
              onClick={() => setActiveNodeIndex(isActive ? null : idx)}
            >
              {/* Outer Glow Ring */}
              <div className="relative group">
                <div
                  className={`absolute -inset-1.5 rounded-full bg-gradient-to-r ${config.ringColor} opacity-50 group-hover:opacity-100 blur-sm transition-all duration-500 group-hover:scale-110`}
                />
                <div
                  className={`relative ${config.size} rounded-full overflow-hidden border-2 border-white/40 dark:border-slate-800/80 shadow-2xl bg-[var(--surface-default)]`}
                >
                  {member.profileImage ? (
                    <img
                      src={member.profileImage}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-600 to-cyan-600 text-white font-black text-sm md:text-base">
                      {member.initials}
                    </div>
                  )}
                </div>

                {/* Floating Glassmorphic Identity Pill */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute top-full mt-3 ${
                        isAr ? "right-1/2 translate-x-1/2" : "left-1/2 -translate-x-1/2"
                      } z-50 min-w-[180px] max-w-[240px] px-3.5 py-2.5 rounded-2xl bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-xl border border-white/20 dark:border-cyan-500/30 text-white shadow-2xl text-center pointer-events-auto`}
                    >
                      <p className="text-xs font-black tracking-wide text-white mb-0.5 truncate">
                        {member.name}
                      </p>
                      <p className="text-[10px] font-semibold text-cyan-300 dark:text-cyan-400 truncate mb-1.5">
                        {member.designation}
                      </p>
                      <Link
                        href={`/${locale}/b2b/team/${member.slug}`}
                        className="inline-flex items-center gap-1 text-[9px] font-bold text-violet-300 hover:text-white uppercase tracking-wider transition-colors"
                      >
                        <span>{isAr ? "عرض الملف" : "View Profile"}</span>
                        <ArrowRight className={`w-2.5 h-2.5 ${isAr ? "rotate-180" : ""}`} />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Hero Center Content Spine */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Eyebrow Pill */}
        <motion.div
          initial={isLowTier ? undefined : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md"
          data-testid="hero-eyebrow"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{isAr ? eyebrowAr : eyebrowEn}</span>
        </motion.div>

        {/* Semantic H1 with Masked Entrance & Rotating Words */}
        <motion.h1
          initial={isLowTier ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-[var(--text-primary)] tracking-tight leading-[1.1] mb-6"
          data-testid="hero-h1"
        >
          <span className="block mb-2 text-2xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-secondary)]">
            {isAr ? fixedHeadlineAr : fixedHeadlineEn}
          </span>
          <span className="inline-flex items-center justify-center min-h-[1.2em] relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={isLowTier ? undefined : { opacity: 0, y: 35, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={isLowTier ? undefined : { opacity: 0, y: -35, filter: "blur(8px)" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-sm font-black"
                data-testid="hero-rotating-word"
              >
                {validWords[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        {/* Description Copy */}
        <motion.p
          initial={isLowTier ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          data-testid="hero-description"
        >
          {isAr ? descriptionAr : descriptionEn}
        </motion.p>

        {/* Action CTAs: High Contrast for Light/Dark & Arabic Parity */}
        <motion.div
          initial={isLowTier ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          {/* Primary CTA: "Join Our Team" — specifically calibrated for high contrast in dark mode Arabic */}
          <Link
            href={primaryCtaUrl}
            data-testid="hero-join-team-cta"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-sm bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-xl shadow-violet-600/30 hover:shadow-cyan-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 border border-white/20"
          >
            <Users className="w-4 h-4" />
            <span>{isAr ? primaryCtaLabelAr : primaryCtaLabelEn}</span>
            <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
          </Link>

          {/* Secondary CTA: "Explore Departments" */}
          <a
            href={secondaryCtaUrl}
            data-testid="hero-explore-departments-cta"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border-level-2)] hover:border-violet-500/50 shadow-sm transition-all duration-300"
          >
            <span>{isAr ? secondaryCtaLabelAr : secondaryCtaLabelEn}</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
