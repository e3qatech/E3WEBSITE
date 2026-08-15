"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Briefcase, ArrowRight, Quote } from "lucide-react";
import { SafePublicTeamMember } from "@/lib/team/team-resolver";

interface FeaturedMemberStoryProps {
  featuredMembers: SafePublicTeamMember[];
  locale?: string;
}

export function FeaturedMemberStory({
  featuredMembers,
  locale = "en",
}: FeaturedMemberStoryProps) {
  const isAr = locale === "ar";
  const stories = featuredMembers.filter((m) => m.isFeatured || m.aboutSummary || m.projects?.length > 0);

  const [currentIndex, setCurrentIndex] = useState(0);

  if (stories.length === 0) return null;

  const currentMember = stories[currentIndex] || stories[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      if (isAr) {
        handlePrev();
      } else {
        handleNext();
      }
    } else if (e.key === "ArrowLeft") {
      if (isAr) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return (
    <section
      className="relative w-full my-16 md:my-24 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 text-white p-6 sm:p-8 md:p-12 border border-violet-500/30 shadow-2xl"
      dir={isAr ? "rtl" : "ltr"}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      data-testid="featured-member-story"
      aria-label={isAr ? "قصة قائد مميز" : "Featured Member Story"}
    >
      {/* Background Ambience */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(139,92,246,0.35), rgba(6,182,212,0.2) 40%, transparent 70%)",
        }}
      />

      {/* Header bar */}
      <div className="relative z-10 flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-violet-300">
            {isAr ? "أضواء على القيادة والابتكار" : "Featured Mastermind Spotlight"}
          </span>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 me-2">
            {currentIndex + 1} / {stories.length}
          </span>
          <button
            type="button"
            onClick={isAr ? handleNext : handlePrev}
            aria-label={isAr ? "السابق" : "Previous member"}
            data-testid="featured-prev-btn"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
          </button>
          <button
            type="button"
            onClick={isAr ? handlePrev : handleNext}
            aria-label={isAr ? "التالي" : "Next member"}
            data-testid="featured-next-btn"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Story Content with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMember.id || currentMember.slug}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center"
        >
          {/* Portrait Column (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-950">
              {currentMember.profileImage ? (
                <img
                  src={currentMember.profileImage}
                  alt={currentMember.name}
                  className="w-full h-full object-cover grayscale-0 scale-100 transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-600 to-cyan-600 text-white text-6xl font-black">
                  {currentMember.initials}
                </div>
              )}
              <div className="absolute top-4 start-4 px-3 py-1 rounded-full text-xs font-black uppercase bg-violet-600/80 backdrop-blur-md text-white border border-white/20">
                {currentMember.presentationGroup || currentMember.department}
              </div>
            </div>
          </div>

          {/* Details & Biography Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
            <div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                {currentMember.name}
              </h3>
              <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                {currentMember.designation}
              </p>
            </div>

            {/* Tagline Quote */}
            {currentMember.tagline && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <Quote className="w-6 h-6 text-violet-400 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base font-semibold text-violet-100 italic leading-relaxed">
                  &ldquo;{currentMember.tagline}&rdquo;
                </p>
              </div>
            )}

            {/* Short Biography */}
            {currentMember.aboutSummary && (
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                {currentMember.aboutSummary}
              </p>
            )}

            {/* Existing Projects / Key Portfolio Items */}
            {Array.isArray(currentMember.projects) && currentMember.projects.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isAr ? "مشاريع وإنجازات بارزة" : "Key Project Portfolio"}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentMember.projects.slice(0, 4).map((p: any, pIdx: number) => {
                    const pName = typeof p === "string" ? p : p.name || p.title || p.projectName || `Project ${pIdx + 1}`;
                    return (
                      <span
                        key={p.id || `proj-${pIdx}`}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/10 border border-white/15 text-slate-200"
                      >
                        {pName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action link */}
            <div className="pt-3">
              <Link
                href={`/${locale}/b2b/team/${currentMember.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs md:text-sm bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-600/30 transition-all hover:scale-105"
              >
                <span>{isAr ? "عرض الملف الكامل للمشروع والمسيرة" : "View Full Career Journey"}</span>
                <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
