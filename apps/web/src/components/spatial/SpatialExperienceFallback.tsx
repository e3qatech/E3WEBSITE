"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import { SpatialSection } from './spatial-experience.types';
import { localizeHref } from '@/lib/url-helper';

export interface SpatialExperienceFallbackProps {
  sections: SpatialSection[];
  locale?: string;
  reason?: string;
}

export function SpatialExperienceFallback({
  sections,
  locale = 'en',
  reason: _reason,
}: SpatialExperienceFallbackProps) {
  const isAr = locale === 'ar';

  return (
    <div
      className="w-full bg-[#070a12] text-white py-16 px-6 md:px-12 lg:px-20 space-y-24"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* 1. Header Banner & Accessible Note */}
      <div className="max-w-4xl mx-auto text-center space-y-4 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isAr ? "عرض عالي التوافق وسهولة الوصول" : "Accessible High-Compatibility Mode"}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
          {isAr ? "استكشف منظومة إي ثري الترفيهية" : "Explore The E3 Experience Worlds"}
        </h1>
        <p className="text-zinc-400 max-w-xl mx-auto text-base">
          {isAr
            ? "تصفح أقسام منظومة إي ثري الترفيهية في قطر بكل سلاسة وتوافق تام."
            : "Browse the chapters of E3 Qatar’s entertainment, event engineering, and attraction ecosystems."}
        </p>
      </div>

      {/* 2. Vertical Section Cards */}
      <div className="max-w-5xl mx-auto space-y-16">
        {sections.map((section, _idx) => (
          <article
            key={section.id}
            id={section.slug}
            className="p-8 md:p-12 rounded-3xl bg-zinc-950/80 border border-zinc-800 shadow-xl space-y-8 relative overflow-hidden transition-all hover:border-zinc-700"
            style={{
              borderLeft: isAr ? undefined : `4px solid ${section.accentColor}`,
              borderRight: isAr ? `4px solid ${section.accentColor}` : undefined,
            }}
          >
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-zinc-900 border border-zinc-800">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: section.accentColor }} />
                <span>{section.sectionNumber} / {String(sections.length).padStart(2, '0')}</span>
                <span className="text-zinc-600">•</span>
                <span style={{ color: section.accentColor }}>{isAr ? section.eyebrowAr : section.eyebrowEn}</span>
              </div>

              {/* Tags */}
              {section.tags && (
                <div className="flex flex-wrap gap-2">
                  {section.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 text-[11px] font-mono text-zinc-400 border border-zinc-850"
                    >
                      {isAr ? tag.labelAr : tag.labelEn}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Heading & Description */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-snug">
                {isAr ? section.headingAr : section.headingEn}
              </h2>
              <p className="text-zinc-300 text-base md:text-lg leading-relaxed max-w-3xl">
                {isAr ? section.descriptionAr : section.descriptionEn}
              </p>
            </div>

            {/* Stats */}
            {section.stats && section.stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                {section.stats.map((stat, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80"
                  >
                    <div className="text-2xl font-bold font-mono" style={{ color: section.accentColor }}>
                      {isAr ? stat.valueAr : stat.valueEn}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {isAr ? stat.labelAr : stat.labelEn}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={localizeHref(section.primaryCtaUrl, locale)}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm text-zinc-950 transition-all hover:scale-105"
                style={{
                  backgroundColor: section.accentColor,
                }}
              >
                <span>{isAr ? section.primaryCtaLabelAr : section.primaryCtaLabelEn}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>

              {section.secondaryCtaUrl && (
                <Link
                  href={localizeHref(section.secondaryCtaUrl, locale)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm text-zinc-300 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:text-white transition-all"
                >
                  <span>{isAr ? section.secondaryCtaLabelAr : section.secondaryCtaLabelEn}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
