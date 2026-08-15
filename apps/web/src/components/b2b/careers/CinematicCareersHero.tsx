"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, UploadCloud, Briefcase } from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";

interface CinematicCareersHeroProps {
  locale?: string;
  eyebrowEn?: string;
  eyebrowAr?: string;
  titleEn?: string;
  titleAr?: string;
  rotatingWordsEn?: string[];
  rotatingWordsAr?: string[];
  descriptionEn?: string;
  descriptionAr?: string;
  mediaUrl?: string;
  mediaType?: "IMAGE" | "VIDEO";
  totalVacancies?: number;
}

export function CinematicCareersHero({
  locale = "en",
  eyebrowEn = "CAREERS AT E3 QATAR",
  eyebrowAr = "فرص العمل في إي ثري قطر",
  titleEn = "Shape the Future of",
  titleAr = "اصنع معنا مستقبل",
  rotatingWordsEn = [
    "Experiential Engineering",
    "Live Entertainment",
    "Spatial Architecture",
    "Kinetic Production",
    "Mega Cultural Events",
  ],
  rotatingWordsAr = [
    "الهندسة التجريبية",
    "الفعاليات الحية الكبرى",
    "التصميم المكاني",
    "الإنتاج المسرحي الحركي",
    "التجارب الثقافية الاستثنائية",
  ],
  descriptionEn = "We are an elite collective of spatial architects, technical directors, AV systems engineers, and creative visionaries engineering Qatar's most extraordinary live experiences.",
  descriptionAr = "نحن نخبة من مهندسي المساحات، مخرجي الإنتاج، خبراء الأنظمة السمعية والبصرية، والمبدعين الذين يصنعون أضخم الفعاليات والتجارب الحية في دولة قطر.",
  mediaUrl,
  mediaType = "IMAGE",
  totalVacancies = 0,
}: CinematicCareersHeroProps) {
  const isAr = locale === "ar";
  const shouldReduceMotion = useReducedMotion();

  const words = isAr ? rotatingWordsAr : rotatingWordsEn;
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || !words || words.length <= 1) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [words, shouldReduceMotion]);

  return (
    <section
      data-testid="cinematic-careers-hero"
      aria-label={isAr ? "قسم التوظيف الرئيسي" : "Careers Hero"}
      dir={isAr ? "rtl" : "ltr"}
      className="relative min-h-[70svh] lg:min-h-[78svh] w-full bg-[#080b12] text-white flex flex-col items-center justify-center pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background Media & Scrim */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {mediaUrl ? (
          <div className="absolute inset-0">
            <UniversalMediaRenderer
              src={mediaUrl}
              type={mediaType}
              className="w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080b12] via-[#080b12]/60 to-transparent" />
          </div>
        ) : (
          <>
            {/* Ambient Radial Glow Fields */}
            <div
              className="absolute -top-32 start-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(6,182,212,0.45) 0%, rgba(99,102,241,0.25) 50%, transparent 75%)",
              }}
            />
            <div className="absolute -bottom-24 inset-x-0 h-40 bg-gradient-to-t from-[#080b12] to-transparent pointer-events-none" />
          </>
        )}
      </div>

      {/* Hero Content Area */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-wider text-cyan-400 uppercase mb-5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{isAr ? eyebrowAr : eyebrowEn}</span>
          {totalVacancies > 0 && (
            <span className="ms-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
              {isAr ? `${totalVacancies} شواغر متاحة` : `${totalVacancies} Open Roles`}
            </span>
          )}
        </div>

        {/* Kinetic Animated Headline */}
        <h1
          data-testid="careers-hero-heading"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-3xl"
        >
          {isAr ? titleAr : titleEn}{" "}
          <span className="inline-block relative min-h-[1.2em]">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? {} : { opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300"
              >
                {words[wordIndex] || words[0]}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>

        {/* Description */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
          {isAr ? descriptionAr : descriptionEn}
        </p>

        {/* Dual Primary & Secondary Action Anchors */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="#open-roles"
            data-testid="hero-explore-roles-cta"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>{isAr ? "استكشف الوظائف المتاحة ↓" : "Explore Open Roles ↓"}</span>
          </Link>
          <Link
            href="#upload-cv"
            data-testid="hero-upload-cv-cta"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UploadCloud className="w-4 h-4 shrink-0" />
            <span>{isAr ? "تحميل السيرة الذاتية (طلب عام)" : "Upload Your CV (General App)"}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
