"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ExternalLink } from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";

export interface ImpactStoryItem {
  id: string;
  caseStudyId: string;
  caseStudyTitleEn: string;
  caseStudyTitleAr?: string;
  caseStudySlug: string;
  caseStudyMedia?: string;
  value: string;
  prefix?: string;
  suffix?: string;
  headlineEn: string;
  headlineAr?: string;
  descEn?: string;
  descAr?: string;
}

export interface ImpactStoriesStreamProps {
  config: {
    enabled?: boolean;
    labelEn?: string;
    labelAr?: string;
    titleEn?: string;
    titleAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
    rotationDuration?: number;
    showProjectTitle?: boolean;
    showProjectMedia?: boolean;
  };
  facts: ImpactStoryItem[];
  locale: string;
}

function parseMetric(val: string) {
  const str = String(val || "").trim();
  const match = str.match(/^([^\d.]*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return { isNumeric: false, raw: str, prefix: "", number: 0, suffix: "", decimals: 0, hasCommas: false };
  }
  const prefix = match[1] || "";
  const numStr = match[2];
  const suffix = match[3] || "";
  const hasCommas = numStr.includes(",");
  const parsedNum = parseFloat(numStr.replace(/,/g, ""));
  const decimals = numStr.includes(".") ? (numStr.split(".")[1]?.length || 0) : 0;

  return {
    isNumeric: !isNaN(parsedNum),
    raw: str,
    prefix,
    number: parsedNum,
    suffix,
    decimals,
    hasCommas,
  };
}

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  triggerKey,
  isActive,
}: {
  value: string;
  prefix?: string;
  suffix?: string;
  triggerKey: string | number;
  isActive: boolean;
}) {
  const parsed = useMemo(() => parseMetric(value), [value]);
  const [displayNumber, setDisplayNumber] = useState<string>(() => {
    if (!parsed.isNumeric) return value;
    return parsed.number.toLocaleString(undefined, {
      minimumFractionDigits: parsed.decimals,
      maximumFractionDigits: parsed.decimals,
      useGrouping: parsed.hasCommas,
    });
  });

  useEffect(() => {
    if (!isActive) return;
    if (!parsed.isNumeric) {
      setDisplayNumber(value);
      return;
    }

    let start: number | null = null;
    const duration = 1200; // ms
    const target = parsed.number;
    let animId: number;

    const step = (now: number) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo deceleration curve
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = ease * target;

      const formatted = current.toLocaleString(undefined, {
        minimumFractionDigits: parsed.decimals,
        maximumFractionDigits: parsed.decimals,
        useGrouping: parsed.hasCommas,
      });

      setDisplayNumber(formatted);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        const finalFormatted = target.toLocaleString(undefined, {
          minimumFractionDigits: parsed.decimals,
          maximumFractionDigits: parsed.decimals,
          useGrouping: parsed.hasCommas,
        });
        setDisplayNumber(finalFormatted);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value, triggerKey, isActive, parsed]);

  if (!parsed.isNumeric) {
    return (
      <span className="tabular-nums">
        {prefix || ""}{value}{suffix || ""}
      </span>
    );
  }

  return (
    <span className="tabular-nums">
      {prefix || parsed.prefix}
      {displayNumber}
      {suffix || parsed.suffix}
    </span>
  );
}

export function ImpactStoriesStream({ config, facts, locale }: ImpactStoriesStreamProps) {
  const isAr = locale === "ar";
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Scroll trigger detection via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        } else {
          setIsInView(false);
        }
      },
      { threshold: 0.15 }
    );

    const el = sectionRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  const durationSec = Number(config?.rotationDuration) || 5;
  const durationMs = durationSec * 1000;
  const intervalStepMs = 50;

  const goToSlide = useCallback((newIndex: number) => {
    if (facts.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setProgress(0);
      setIsTransitioning(false);
    }, 180);
  }, [facts.length]);

  const nextSlide = useCallback(() => {
    if (facts.length <= 1) return;
    goToSlide((currentIndex + 1) % facts.length);
  }, [facts.length, currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    if (facts.length <= 1) return;
    goToSlide((currentIndex - 1 + facts.length) % facts.length);
  }, [facts.length, currentIndex, goToSlide]);

  // Auto-rotation timer: Rotates every 5 seconds when in view
  useEffect(() => {
    if (facts.length <= 1) return;
    if (!isInView || isPaused) return;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (intervalStepMs / durationMs) * 100;
        if (next >= 100) {
          nextSlide();
          return 0;
        }
        return next;
      });
    }, intervalStepMs);

    return () => clearInterval(timer);
  }, [facts.length, isInView, isPaused, durationMs, nextSlide]);

  if (config?.enabled === false || !facts || facts.length === 0) return null;

  const activeFact = facts[currentIndex] || facts[0];
  const sectionLabel = isAr ? config.labelAr || "هل تعلم؟" : config.labelEn || "Did You Know?";
  const sectionTitle = isAr
    ? config.titleAr || "وراء كل مشروع قصة وإنجاز بالأرقام."
    : config.titleEn || "Every Project Leaves a Measurable Story Behind.";

  const headline = isAr
    ? activeFact.headlineAr || activeFact.headlineEn
    : activeFact.headlineEn;
  const desc = isAr
    ? activeFact.descAr || activeFact.descEn
    : activeFact.descEn;
  const projectTitle = isAr
    ? activeFact.caseStudyTitleAr || activeFact.caseStudyTitleEn
    : activeFact.caseStudyTitleEn;

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] relative overflow-hidden transition-colors"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      role="region"
      aria-label="Impact Stories Carousel"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
        {/* Header with scroll trigger fade-in */}
        <div
          className={`text-center max-w-3xl mx-auto mb-14 transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono text-xs uppercase tracking-widest mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{sectionLabel}</span>
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-syne text-[var(--text-primary)] tracking-tight leading-tight">
            {sectionTitle}
          </h2>
        </div>

        {/* Carousel Showcase Card */}
        <div
          className={`bg-[var(--surface-default)]/95 border border-[var(--border-level-2)] rounded-3xl p-6 sm:p-10 md:p-14 relative overflow-hidden shadow-xl backdrop-blur-2xl transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Top Progress Bar for 5-sec Rotation */}
          {facts.length > 1 && (
            <div className="absolute top-0 inset-x-0 h-1 bg-[var(--border-level-2)]">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all ease-linear duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div
            className={`grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center transition-all duration-300 ${
              isTransitioning ? "opacity-0 translate-y-2 scale-[0.99]" : "opacity-100 translate-y-0 scale-100"
            }`}
          >
            {/* Metric & Story Details (8 Cols) */}
            <div className="md:col-span-8 space-y-6">
              {/* Huge Animated Metric Number */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-syne text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 tracking-tight drop-shadow-sm">
                  <AnimatedNumber
                    value={activeFact.value}
                    prefix={activeFact.prefix}
                    suffix={activeFact.suffix}
                    triggerKey={`${activeFact.id}_${currentIndex}`}
                    isActive={isInView}
                  />
                </div>

                {config.showProjectTitle !== false && projectTitle && (
                  <Link
                    href={`/${locale}/b2b/case-studies/${activeFact.caseStudySlug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[var(--surface-raised)] border border-[var(--border-level-2)] rounded-full text-xs font-mono text-amber-500 hover:text-amber-400 font-bold hover:border-amber-500/60 transition-all shadow-xs"
                  >
                    <span>{projectTitle}</span>
                    <ExternalLink className="w-3 h-3 rtl:-scale-x-100" />
                  </Link>
                )}
              </div>

              {/* Headline & Narrative */}
              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-syne text-[var(--text-primary)] leading-snug">
                  {headline}
                </h3>
                {desc && (
                  <p className="text-[var(--text-secondary)] text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-medium">
                    {desc}
                  </p>
                )}
              </div>

              {/* Direct Project Link */}
              <div className="pt-2">
                <Link
                  href={`/${locale}/b2b/case-studies/${activeFact.caseStudySlug}`}
                  className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-mono font-bold text-amber-500 hover:text-amber-400 uppercase tracking-widest group/link transition-colors"
                >
                  <span>{isAr ? "استكشف المشروع بالكامل" : "Explore the Project"}</span>
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 rtl:group-hover/link:-translate-x-1.5 rtl:-scale-x-100 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Project Thumbnail & Controls (4 Cols) */}
            <div className="md:col-span-4 flex flex-col items-center md:items-end justify-between gap-6">
              {config.showProjectMedia !== false && activeFact.caseStudyMedia ? (
                <div className="w-full max-w-[280px] aspect-video rounded-2xl overflow-hidden border border-[var(--border-level-2)] bg-[var(--surface-sunken)] relative group shadow-sm">
                  <UniversalMediaRenderer
                    type="IMAGE"
                    src={activeFact.caseStudyMedia}
                    alt={projectTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
              ) : null}

              {/* Navigation Controls & Pagination Dots */}
              {facts.length > 1 && (
                <div className="flex flex-col items-center md:items-end gap-3.5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={prevSlide}
                      className="w-11 h-11 rounded-full border border-[var(--border-level-2)] bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] hover:border-amber-500/50 flex items-center justify-center text-[var(--text-secondary)] hover:text-amber-500 transition-all cursor-pointer shadow-xs active:scale-95"
                      aria-label="Previous Story"
                    >
                      <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                    </button>

                    {/* Pagination Dots */}
                    <div className="flex items-center gap-1.5 px-2">
                      {facts.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => goToSlide(dotIdx)}
                          className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            currentIndex === dotIdx
                              ? "w-6 bg-amber-500"
                              : "w-2 bg-[var(--border-level-2)] hover:bg-[var(--text-tertiary)]"
                          }`}
                          aria-label={`Go to slide ${dotIdx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={nextSlide}
                      className="w-11 h-11 rounded-full border border-[var(--border-level-2)] bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] hover:border-amber-500/50 flex items-center justify-center text-[var(--text-secondary)] hover:text-amber-500 transition-all cursor-pointer shadow-xs active:scale-95"
                      aria-label="Next Story"
                    >
                      <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                    {isAr ? "يتم التدوير تلقائياً كل 5 ثوانٍ" : "Auto-rotates every 5s"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
