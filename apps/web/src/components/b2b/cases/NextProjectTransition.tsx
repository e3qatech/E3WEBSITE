"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Layers, Sparkles, FolderOpen } from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { cn } from "@/lib/utils";

interface NextProjectItem {
  id: string;
  slug: string;
  titleEn?: string | null;
  titleAr?: string | null;
  category?: string | null;
  clientName?: string | null;
  year?: number | null;
  thumbnailUrl?: string | null;
  thumbnailMediaType?: string | null;
  heroImageUrl?: string | null;
  heroMediaType?: string | null;
}

interface NextProjectTransitionProps {
  locale?: string;
  nextProject?: NextProjectItem | null;
}

export function NextProjectTransition({
  locale = "en",
  nextProject,
}: NextProjectTransitionProps) {
  const isAr = locale === "ar";

  if (!nextProject) {
    return (
      <section
        data-testid="next-project-transition"
        aria-label={isAr ? "العودة إلى المشاريع" : "Return to Case Studies"}
        dir={isAr ? "rtl" : "ltr"}
        className="w-full bg-[#070b14] border-t border-white/10 py-16 sm:py-20 text-center"
      >
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href={`/${locale}/b2b/case-studies`}
            data-testid="back-to-all-cases-btn"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm sm:text-base transition-all shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95"
          >
            <FolderOpen className="w-5 h-5" />
            <span>{isAr ? "استعراض جميع دراسات الحالة والمشاريع" : "Explore All Case Studies & Projects"}</span>
            <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
          </Link>
        </div>
      </section>
    );
  }

  const title = isAr
    ? nextProject.titleAr || nextProject.titleEn
    : nextProject.titleEn || nextProject.titleAr;

  const mediaSource = nextProject.thumbnailUrl || nextProject.heroImageUrl;
  const mediaType = nextProject.thumbnailUrl
    ? nextProject.thumbnailMediaType || "IMAGE"
    : nextProject.heroMediaType || "IMAGE";

  const nextUrl = `/${locale}/b2b/case-studies/${nextProject.slug}`;

  return (
    <section
      data-testid="next-project-transition"
      aria-label={isAr ? "المشروع التالي" : "Next Project Transition"}
      dir={isAr ? "rtl" : "ltr"}
      className="relative w-full bg-[#050810] border-t border-white/10 overflow-hidden"
    >
      {/* Background Media with Dark Readability Scrim */}
      <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none">
        {mediaSource && (
          <UniversalMediaRenderer
            type={mediaType as any}
            src={mediaSource}
            className="w-full h-full object-cover filter grayscale contrast-125"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-[#050810]/70 to-[#050810]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 flex flex-col items-center text-center">
        {/* Next Project Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-4 border border-cyan-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? "المشروع التالي" : "NEXT FEATURED CASE STUDY"}</span>
        </div>

        {/* Category */}
        {nextProject.category && (
          <div className="text-xs sm:text-sm font-mono text-slate-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>{nextProject.category}</span>
          </div>
        )}

        {/* Next Project Title Link */}
        <Link
          href={nextUrl}
          data-testid="next-case-link"
          className="group inline-flex items-center gap-3 sm:gap-6 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white hover:text-cyan-400 transition-colors font-syne tracking-tight max-w-4xl leading-tight"
        >
          <span>{title}</span>
          <ArrowRight className="w-7 h-7 sm:w-10 sm:h-10 text-cyan-400 shrink-0 group-hover:translate-x-3 rtl:group-hover:-translate-x-3 rtl:rotate-180 transition-transform duration-300" />
        </Link>

        {/* Back to All Cases Auxiliary Action */}
        <div className="mt-12 pt-6 border-t border-white/10 w-full max-w-xs">
          <Link
            href={`/${locale}/b2b/case-studies`}
            data-testid="back-to-all-cases-btn"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>{isAr ? "العودة إلى جميع دراسات الحالة" : "Back to All Case Studies"}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
