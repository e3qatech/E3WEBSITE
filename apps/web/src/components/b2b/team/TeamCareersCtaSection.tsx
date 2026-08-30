"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamCareersCtaSectionProps {
  locale?: string;
  primaryUrl?: string;
}

export function TeamCareersCtaSection({
  locale = "en",
  primaryUrl,
}: TeamCareersCtaSectionProps) {
  const isAr = locale === "ar";
  const defaultCareersUrl = primaryUrl || `/${locale}/b2b/careers`;
  const contactUrl = `/${locale}/contact`;

  return (
    <section
      data-testid="team-careers-cta"
      aria-label={isAr ? "انضم إلى الفريق" : "Careers at E3"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full bg-[#080b12] text-white py-16 sm:py-24 border-t border-white/10 relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -bottom-24 start-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.5) 0%, rgba(99,102,241,0.3) 50%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? "فرص الانضمام والتوظيف" : "JOIN OUR ATELIER"}</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-tight font-syne">
          {isAr
            ? "اصنع التجربة القادمة معنا"
            : "BUILD THE NEXT EXPERIENCE WITH US"}
        </h2>

        {/* Subtitle */}
        <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
          {isAr
            ? "تجمع إي ثري بين المبدعين والمنتجين والتقنيين والمشغلين وحلالي المشكلات القادرين على تحويل التجارب الأكثر طموحاً إلى واقع ملموس."
            : "E3 brings together creators, producers, technicians, operators and problem-solvers who know how to make ambitious experiences work."}
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href={defaultCareersUrl}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{isAr ? "استكشف الوظائف الشاغرة" : "Explore Careers"}</span>
            <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
          </Link>
          <Link
            href={contactUrl}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            <span>{isAr ? "تواصل مع الإدارة" : "Contact Executive Team"}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
