"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
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

export function ImpactStoriesStream({ config, facts, locale }: ImpactStoriesStreamProps) {
  const isAr = locale === "ar";
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const durationSec = Number(config?.rotationDuration) || 6;
  const durationMs = durationSec * 1000;
  const intervalStepMs = 50;

  const nextSlide = useCallback(() => {
    if (facts.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % facts.length);
    setProgress(0);
  }, [facts.length]);

  const prevSlide = useCallback(() => {
    if (facts.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + facts.length) % facts.length);
    setProgress(0);
  }, [facts.length]);

  // Auto-rotation timer with smooth progress bar
  useEffect(() => {
    if (facts.length <= 1) return;

    // Check prefers-reduced-motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (isPaused) return;

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
  }, [facts.length, isPaused, durationMs, nextSlide]);

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
      className="py-20 bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] relative overflow-hidden transition-colors"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      role="region"
      aria-label="Impact Stories Carousel"
    >
      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono text-xs uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{sectionLabel}</span>
          </span>
          <h2 className="text-3xl md:text-4xl font-black font-syne text-[var(--text-primary)] tracking-tight">
            {sectionTitle}
          </h2>
        </div>

        {/* Carousel Showcase Card */}
        <div className="bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-3xl p-5 sm:p-8 md:p-12 relative overflow-hidden shadow-md backdrop-blur-xl">
          {/* Progress Bar Top Edge */}
          {facts.length > 1 && (
            <div className="absolute top-0 inset-x-0 h-1 bg-[var(--border-level-2)]">
              <div
                className="h-full bg-amber-500 transition-all ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Metric & Story Details (8 Cols) */}
            <div className="md:col-span-8 space-y-5">
              {/* Huge Metric Number */}
              <div className="flex flex-wrap items-baseline gap-4">
                <div className="text-5xl sm:text-6xl md:text-7xl font-black font-syne text-amber-500 tracking-tight">
                  {activeFact.prefix || ""}
                  {activeFact.value}
                  {activeFact.suffix || ""}
                </div>

                {config.showProjectTitle !== false && projectTitle && (
                  <Link
                    href={`/${locale}/b2b/case-studies/${activeFact.caseStudySlug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--bg-level-2)] border border-[var(--border-level-2)] rounded-full text-xs font-mono text-amber-500 font-bold hover:border-amber-500/60 transition-colors shadow-xs"
                  >
                    <span>{projectTitle}</span>
                    <ArrowRight className="w-3 h-3 rtl:-scale-x-100" />
                  </Link>
                )}
              </div>

              {/* Headline & Narrative */}
              <div>
                <h3 className="text-2xl md:text-3xl font-bold font-syne text-[var(--text-primary)] mb-2">
                  {headline}
                </h3>
                {desc && (
                  <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed max-w-2xl">
                    {desc}
                  </p>
                )}
              </div>

              {/* Direct Link */}
              <div className="pt-2">
                <Link
                  href={`/${locale}/b2b/case-studies/${activeFact.caseStudySlug}`}
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-500 hover:text-amber-600 uppercase tracking-widest group/link transition-colors"
                >
                  <span>{isAr ? "استكشف المشروع بالكامل" : "Explore the Project"}</span>
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 rtl:group-hover/link:-translate-x-1 rtl:-scale-x-100 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Project Thumbnail & Controls (4 Cols) */}
            <div className="md:col-span-4 flex flex-col items-center md:items-end justify-between gap-6">
              {config.showProjectMedia !== false && activeFact.caseStudyMedia ? (
                <div className="w-full max-w-[280px] aspect-video rounded-2xl overflow-hidden border border-[var(--border-level-2)] bg-[var(--bg-level-2)] relative group">
                  <UniversalMediaRenderer
                    type="IMAGE"
                    src={activeFact.caseStudyMedia}
                    alt={projectTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)]/80 via-transparent to-transparent pointer-events-none" />
                </div>
              ) : null}

              {/* Navigation Controls */}
              {facts.length > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={prevSlide}
                    className="w-11 h-11 rounded-full border border-[var(--border-level-2)] bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] hover:border-amber-500/50 flex items-center justify-center text-[var(--text-secondary)] hover:text-amber-500 transition-all cursor-pointer shadow-xs"
                    aria-label="Previous Story"
                  >
                    <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                  </button>

                  <div className="text-xs font-mono font-bold text-[var(--text-secondary)] px-2">
                    {currentIndex + 1} / {facts.length}
                  </div>

                  <button
                    onClick={nextSlide}
                    className="w-11 h-11 rounded-full border border-[var(--border-level-2)] bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] hover:border-amber-500/50 flex items-center justify-center text-[var(--text-secondary)] hover:text-amber-500 transition-all cursor-pointer shadow-xs"
                    aria-label="Next Story"
                  >
                    <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
