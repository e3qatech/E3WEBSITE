"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export interface CaseStudiesCommercialCtaProps {
  cta: {
    enabled?: boolean;
    eyebrowEn?: string;
    eyebrowAr?: string;
    headlineEn?: string;
    headlineAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
    primaryCtaEn?: string;
    primaryCtaAr?: string;
    primaryLink?: string;
  };
  locale: string;
}

export function CaseStudiesCommercialCta({
  cta,
  locale,
}: CaseStudiesCommercialCtaProps) {
  const isAr = locale === "ar";
  if (cta?.enabled === false) return null;

  const eyebrow = isAr
    ? cta.eyebrowAr || "قد يكون مشروعك هو القادم"
    : cta.eyebrowEn || "Your Project Could Be Next";
  const headline = isAr
    ? cta.headlineAr || "لنصنع معاً التجربة الاستثنائية القادمة."
    : cta.headlineEn || "Let’s Create the Next Landmark Experience.";
  const description = isAr
    ? cta.descriptionAr ||
      "تواصل مع فريق الهندسة والتصنيع والتشغيل في إي ثري لبناء وتفعيل تجربتك القادمة."
    : cta.descriptionEn ||
      "Collaborate with E3's turnkey masterplanning, fabrication, and live operations teams in Qatar.";

  const rawLink = cta.primaryLink || "/b2b/contact";
  const contactHref = rawLink.startsWith("http")
    ? rawLink
    : rawLink.startsWith(`/${locale}`)
    ? rawLink
    : `/${locale}${rawLink.startsWith("/") ? "" : "/"}${rawLink}`;

  const ctaText = isAr
    ? cta.primaryCtaAr || "ابدأ مشروعك"
    : cta.primaryCtaEn || "Start a Project";

  return (
    <section className="py-24 border-t border-zinc-900 bg-zinc-950 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{eyebrow}</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-black font-syne text-zinc-100 tracking-tight mb-6 leading-tight">
          {headline}
        </h2>

        <p className="text-lg text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href={contactHref}
            className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-syne font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] inline-flex items-center gap-2 group cursor-pointer"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:-scale-x-100 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
