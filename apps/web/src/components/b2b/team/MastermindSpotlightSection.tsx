"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Briefcase, ArrowRight, Quote, Award, Play, Pause } from "lucide-react";
import { SafePublicTeamMember } from "@/lib/team/team-resolver";
import { resolveDepartmentAura } from "@/lib/team/department-aura";
import { cn } from "@/lib/utils";

interface MastermindSpotlightSectionProps {
  featuredMembers: SafePublicTeamMember[];
  locale?: string;
}

export function MastermindSpotlightSection({
  featuredMembers,
  locale = "en",
}: MastermindSpotlightSectionProps) {
  const isAr = locale === "ar";
  const shouldReduceMotion = useReducedMotion();
  const spotlightRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Filter members who are featured or have rich content
  const stories = featuredMembers.filter(
    (m) => m.isFeatured || m.aboutSummary || m.aboutSummaryAr || (m.projects && m.projects.length > 0)
  );
  const activeStories = stories.length > 0 ? stories : featuredMembers.slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = activeStories.length;
  const currentMember = activeStories[currentIndex] || activeStories[0];

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Auto-advance spotlight every 7 seconds when not paused or motion reduced
  useEffect(() => {
    if (shouldReduceMotion || isPaused || total <= 1) return;
    const interval = setInterval(handleNext, 7000);
    return () => clearInterval(interval);
  }, [shouldReduceMotion, isPaused, total, handleNext]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartX.current;
    const deltaY = endY - touchStartY.current;

    // Trigger only if horizontal swipe dominates vertical scroll
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX > 0) {
        // Swiped Right
        if (isAr) {
          handleNext();
        } else {
          handlePrev();
        }
      } else {
        // Swiped Left
        if (isAr) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (isAr) {
        handlePrev();
      } else {
        handleNext();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (isAr) {
        handleNext();
      } else {
        handlePrev();
      }
    } else if (e.key === " " || e.key === "Spacebar") {
      // Toggle pause on spacebar
      e.preventDefault();
      togglePause();
    }
  };

  if (!currentMember) return null;

  const aura = resolveDepartmentAura(currentMember.department, currentMember.departmentKey);
  const profileUrl = `/${locale}/b2b/team/${currentMember.slug}`;

  const displayName = isAr && currentMember.nameAr ? currentMember.nameAr : currentMember.name;
  const displayDesignation = isAr && currentMember.designationAr ? currentMember.designationAr : currentMember.designation;
  const displayDepartment = isAr && currentMember.departmentAr ? currentMember.departmentAr : currentMember.department;
  const displayTagline = isAr && currentMember.taglineAr ? currentMember.taglineAr : currentMember.tagline;
  const displayAbout = isAr && currentMember.aboutSummaryAr ? currentMember.aboutSummaryAr : currentMember.aboutSummary;

  return (
    <section
      ref={spotlightRef}
      dir={isAr ? "rtl" : "ltr"}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      tabIndex={0}
      data-testid="mastermind-spotlight-section"
      aria-label={isAr ? "أضواء على القيادة والابتكار" : "Featured Mastermind Spotlight"}
      className="relative w-full max-w-7xl mx-auto my-12 sm:my-16 md:my-20 px-4 sm:px-6 lg:px-8 focus:outline-none"
    >
      <div
        className={cn(
          "relative w-full rounded-3xl lg:rounded-[2.5rem] overflow-hidden p-6 sm:p-8 md:p-10 lg:p-12",
          "border border-white/10 shadow-2xl transition-colors duration-1000",
          "bg-[#080b12] text-white"
        )}
      >
        {/* Subtle Background Radial Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25 transition-all duration-1000 ease-out"
          style={{
            background: aura.auraGradient,
          }}
          aria-hidden="true"
        />

        {/* Faint Noise Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Top Header Bar with Carousel Controls */}
        <div className="relative z-10 flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-300">
              {isAr ? "أضواء على القيادة والابتكار" : "Featured Mastermind Spotlight"}
            </span>
          </div>

          {/* Accessible Carousel Controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-400 hidden sm:inline">
              {currentIndex + 1} / {total}
            </span>

            {/* Pause/Play Toggle Button */}
            <button
              type="button"
              onClick={togglePause}
              aria-label={isPaused ? (isAr ? "تشغيل التبديل التلقائي" : "Play auto-advance") : (isAr ? "إيقاف مؤقت" : "Pause auto-advance")}
              aria-pressed={isPaused}
              data-testid="spotlight-pause-btn"
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={isAr ? handleNext : handlePrev}
                aria-label={isAr ? "السابق" : "Previous mastermind"}
                data-testid="spotlight-prev-btn"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className={cn("w-4 h-4", isAr && "rotate-180")} />
              </button>
              <button
                type="button"
                onClick={isAr ? handlePrev : handleNext}
                aria-label={isAr ? "التالي" : "Next mastermind"}
                data-testid="spotlight-next-btn"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <ChevronRight className={cn("w-4 h-4", isAr && "rotate-180")} />
              </button>
            </div>
          </div>
        </div>

        {/* 40% Portrait / 60% Content Asymmetric Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* PORTRAIT COLUMN (5 cols on lg) - 4:5 Aspect Ratio */}
          <div className="lg:col-span-5 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMember.id || currentMember.slug}
                initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={shouldReduceMotion ? {} : { opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.45 }}
                className="relative w-full max-w-xs sm:max-w-sm aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-zinc-950 group"
              >
                {currentMember.profileImage ? (
                  <img
                    src={currentMember.profileImage}
                    alt={displayName}
                    className="w-full h-full object-cover object-top filter grayscale-0 contrast-[1.03] group-hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center p-6 text-white text-center"
                    style={{
                      background: `linear-gradient(135deg, ${aura.primaryColor}33 0%, #090c13 100%)`,
                    }}
                  >
                    <div
                      className="w-24 h-24 rounded-2xl border-2 flex items-center justify-center text-3xl font-black mb-3 bg-white/5"
                      style={{
                        borderColor: aura.primaryColor,
                        color: aura.primaryColor,
                      }}
                    >
                      {currentMember.initials}
                    </div>
                    <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                      {displayDepartment}
                    </span>
                  </div>
                )}

                {/* Ambient subtle vignette scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none opacity-60" />

                {/* Glowing border highlight */}
                <div
                  className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none border opacity-40 transition-colors duration-700"
                  style={{ borderColor: aura.primaryColor }}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CONTENT COLUMN (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col items-start text-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMember.id || currentMember.slug}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? {} : { opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-4 sm:space-y-5 w-full"
              >
                {/* Department pill & Experience Badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border"
                    style={{
                      backgroundColor: `${aura.primaryColor}15`,
                      color: aura.primaryColor,
                      borderColor: `${aura.primaryColor}35`,
                    }}
                  >
                    {displayDepartment}
                  </span>
                  {currentMember.yearsOfExperience > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-medium text-slate-300 bg-white/5 border border-white/10 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-cyan-400" />
                      <span>
                        {currentMember.yearsOfExperience} {isAr ? "سنوات خبرة" : "Years Experience"}
                      </span>
                    </span>
                  )}
                </div>

                {/* Name & Designation */}
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight font-syne">
                    {displayName}
                  </h2>
                  <p className="text-sm sm:text-base text-cyan-300 font-semibold mt-1">
                    {displayDesignation}
                  </p>
                </div>

                {/* Tagline */}
                {displayTagline && (
                  <div className="relative ps-4 py-2 border-s-2 border-cyan-400/60 bg-white/5 rounded-e-xl">
                    <Quote className="w-3.5 h-3.5 text-cyan-400/60 absolute -top-1 start-2" />
                    <p className="text-xs sm:text-sm italic text-slate-200 font-medium leading-relaxed">
                      &ldquo;{displayTagline}&rdquo;
                    </p>
                  </div>
                )}

                {/* Shortened Biography (2-3 lines max) */}
                {displayAbout && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl line-clamp-3">
                    {displayAbout}
                  </p>
                )}

                {/* Landmark Projects Preview */}
                {currentMember.projects && currentMember.projects.length > 0 && (
                  <div>
                    <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isAr ? "مشاريع معتمدة" : "Key Project Deliverables"}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentMember.projects.slice(0, 3).map((project: any, idx: number) => {
                        const projectName = typeof project === "string" ? project : project?.name || "";
                        if (!projectName) return null;
                        return (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-slate-200"
                          >
                            {projectName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action CTA Link */}
                <div className="pt-2">
                  <Link
                    href={profileUrl}
                    data-testid="spotlight-profile-cta"
                    className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-cyan-400/25 active:scale-[0.98]"
                  >
                    <span>{isAr ? "استعرض الملف الكامل والخبرات" : "View Full Profile & Experience"}</span>
                    <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress Bar Indicator */}
        <div className="relative z-10 w-full h-1 bg-white/10 rounded-full mt-8 overflow-hidden">
          <motion.div
            className="h-full bg-cyan-400"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </section>
  );
}
