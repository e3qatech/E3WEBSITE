"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { parseTwoLineHeadline } from "@/components/b2c/hero/E3LivingHero";

export interface LivingHeroHeadlineProps {
  headlineTemplateEn?: string;
  headlineTemplateAr?: string;
  fixedHeadlineEn?: string;
  fixedHeadlineAr?: string;
  titleEn?: string;
  titleAr?: string;
  fallbackTitle?: string;
  rotatingWordsEn?: string[];
  rotatingWordsAr?: string[];
  enableRotatingWords?: boolean;
  animationSpeed?: number;
  locale?: string;
  className?: string;
  gradientClass?: string;
  align?: "center" | "start" | "left" | "right";
  as?: "h1" | "h2" | "div";
}

export function LivingHeroHeadline({
  headlineTemplateEn,
  headlineTemplateAr,
  fixedHeadlineEn,
  fixedHeadlineAr,
  titleEn,
  titleAr,
  fallbackTitle,
  rotatingWordsEn,
  rotatingWordsAr,
  enableRotatingWords = true,
  animationSpeed = 2800,
  locale = "en",
  className = "text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.75rem] font-black font-syne text-zinc-100 tracking-tight leading-[1.08] drop-shadow-xl",
  gradientClass = "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500",
  align = "start",
  as: Tag = "h1",
}: LivingHeroHeadlineProps) {
  const isAr = locale === "ar";
  const shouldReduceMotion = useReducedMotion();

  // 1. Resolve raw headline template string
  const rawHeadline = isAr
    ? (headlineTemplateAr || fixedHeadlineAr || titleAr || fallbackTitle || "تحويل الأفكار إلى {{animated}}")
    : (headlineTemplateEn || fixedHeadlineEn || titleEn || fallbackTitle || "Bringing Ideas into {{animated}}");

  const hasExplicitTemplate = rawHeadline.includes("{{animated}}") || rawHeadline.includes("\n");

  // 2. Parse into two clean lines
  const parsedHeadline = useMemo(() => {
    return parseTwoLineHeadline(rawHeadline);
  }, [rawHeadline]);

  // 3. Resolve rotating words
  const activeRotatingWords = useMemo(() => {
    if (isAr) {
      return Array.isArray(rotatingWordsAr) && rotatingWordsAr.length > 0
        ? rotatingWordsAr
        : ["واقع حي", "تجارب ملهمة", "مشاريع استثنائية", "إنجازات فارقة"];
    }
    return Array.isArray(rotatingWordsEn) && rotatingWordsEn.length > 0
      ? rotatingWordsEn
      : ["Living Landmarks", "Dynamic Environments", "Flawless Operations", "Extraordinary Impact"];
  }, [isAr, rotatingWordsAr, rotatingWordsEn]);

  const hasRotating = enableRotatingWords && activeRotatingWords.length > 0;
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || !hasRotating || activeRotatingWords.length <= 1) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % activeRotatingWords.length);
    }, Math.max(1200, animationSpeed));
    return () => clearInterval(interval);
  }, [hasRotating, activeRotatingWords, animationSpeed, shouldReduceMotion]);

  const currentWord = hasRotating ? (activeRotatingWords[wordIndex] || activeRotatingWords[0] || "") : "";

  // Alignment classes
  const alignmentClass =
    align === "center"
      ? "items-center text-center justify-center"
      : align === "right"
      ? "items-end text-end justify-end"
      : "items-start text-start justify-start";

  // Accessible full text for screen readers
  const accessibleText = rawHeadline.replace("{{animated}}", currentWord);

  return (
    <Tag className={className} aria-label={accessibleText}>
      {hasExplicitTemplate && parsedHeadline ? (
        <div className={`flex flex-col ${alignmentClass} gap-1 sm:gap-2.5 max-w-full`}>
          {/* Line 1 */}
          {parsedHeadline.line1.text && (
            <div className="inline-flex items-baseline flex-wrap gap-x-2.5">
              {parsedHeadline.line1.hasToken ? (
                <>
                  {parsedHeadline.line1.prefix && <span>{parsedHeadline.line1.prefix}</span>}
                  <span className="inline-block relative min-h-[1.15em] whitespace-nowrap">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={wordIndex}
                        initial={shouldReduceMotion ? {} : { opacity: 0, y: 14, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? {} : { opacity: 0, y: -14, filter: "blur(6px)" }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className={gradientClass}
                      >
                        {currentWord}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  {parsedHeadline.line1.suffix && <span>{parsedHeadline.line1.suffix}</span>}
                </>
              ) : (
                <span>{parsedHeadline.line1.text}</span>
              )}
            </div>
          )}

          {/* Line 2 */}
          {parsedHeadline.line2.text && (
            <div className="inline-flex items-baseline flex-wrap gap-x-2.5">
              {parsedHeadline.line2.hasToken ? (
                <>
                  {parsedHeadline.line2.prefix && <span>{parsedHeadline.line2.prefix}</span>}
                  <span className="inline-block relative min-h-[1.15em] whitespace-nowrap">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={wordIndex}
                        initial={shouldReduceMotion ? {} : { opacity: 0, y: 14, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? {} : { opacity: 0, y: -14, filter: "blur(6px)" }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className={gradientClass}
                      >
                        {currentWord}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  {parsedHeadline.line2.suffix && <span>{parsedHeadline.line2.suffix}</span>}
                </>
              ) : (
                <span>{parsedHeadline.line2.text}</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <span>{rawHeadline}</span>
      )}
    </Tag>
  );
}
