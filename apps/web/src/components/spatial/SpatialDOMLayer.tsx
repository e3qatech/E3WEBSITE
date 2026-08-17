"use client";

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, ExternalLink } from 'lucide-react';
import { SpatialSection } from './spatial-experience.types';
import { cn } from '@/lib/utils';
import { localizeHref } from '@/lib/url-helper';

export interface SpatialDOMLayerProps {
  sections: SpatialSection[];
  activeIndex: number;
  locale?: string;
}

export function SpatialDOMLayer({
  sections,
  activeIndex,
  locale = 'en',
}: SpatialDOMLayerProps) {
  const isAr = locale === 'ar';
  const activeSection = sections[activeIndex] || sections[0];

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-10 flex items-center justify-center">
      {/* 8 Synchronized Section Panels */}
      {sections.map((section, idx) => {
        const isActive = idx === activeIndex;
        const isPrev = idx === (activeIndex - 1 + sections.length) % sections.length;
        const isNext = idx === (activeIndex + 1) % sections.length;

        // Render readable DOM content
        return (
          <div
            key={section.id}
            id={`spatial-section-${section.slug}`}
            className={cn(
              "absolute inset-0 w-full h-full flex flex-col justify-center items-center px-6 md:px-12 lg:px-20 transition-all duration-700 ease-out",
              isActive ? "opacity-100 pointer-events-auto z-20" : "opacity-0 pointer-events-none z-0",
              isPrev && "scale-95 -translate-y-8 pointer-events-none",
              isNext && "scale-95 translate-y-8 pointer-events-none"
            )}
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {isActive && (
              <motion.div
                key={`content-${section.id}`}
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.98 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8"
              >
                {/* 1. Eyebrow Badge & Section Tracker */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-md border shadow-lg"
                  style={{
                    backgroundColor: `${section.accentColor}18`,
                    borderColor: `${section.accentColor}44`,
                    color: section.accentColor,
                  }}
                >
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: section.accentColor }} />
                  <span>{section.sectionNumber} / 08</span>
                  <span className="text-zinc-500">•</span>
                  <span>{isAr ? section.eyebrowAr : section.eyebrowEn}</span>
                </motion.div>

                {/* 2. Main High-Impact Heading */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12] drop-shadow-md"
                >
                  {isAr ? section.headingAr : section.headingEn}
                </motion.h2>

                {/* 3. Description Paragraph */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-sm"
                >
                  {isAr ? section.descriptionAr : section.descriptionEn}
                </motion.p>

                {/* 4. Feature Tags & Statistics */}
                {(section.stats?.length || section.tags?.length) ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-3 pt-2"
                  >
                    {/* Stats pills */}
                    {section.stats?.map((stat, sIdx) => (
                      <div
                        key={sIdx}
                        className="px-4 py-2 rounded-2xl bg-zinc-900/80 border border-zinc-700/60 backdrop-blur-md text-left flex items-center gap-3 shadow-md"
                      >
                        <span className="text-lg md:text-xl font-bold text-white font-mono" style={{ color: section.accentColor }}>
                          {isAr ? stat.valueAr : stat.valueEn}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium leading-tight">
                          {isAr ? stat.labelAr : stat.labelEn}
                        </span>
                      </div>
                    ))}

                    {/* Tag badges */}
                    {section.tags?.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-3 py-1.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 backdrop-blur-sm"
                      >
                        {isAr ? tag.labelAr : tag.labelEn}
                      </span>
                    ))}
                  </motion.div>
                ) : null}

                {/* 5. Primary and Secondary CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex flex-wrap items-center justify-center gap-4 pt-4"
                >
                  {/* Primary CTA */}
                  <Link
                    href={localizeHref(section.primaryCtaUrl, locale)}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm md:text-base text-zinc-950 transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950"
                    style={{
                      backgroundColor: section.accentColor,
                      boxShadow: `0 0 28px ${section.accentColor}55`,
                    }}
                  >
                    <span>{isAr ? section.primaryCtaLabelAr : section.primaryCtaLabelEn}</span>
                    {isAr ? (
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    ) : (
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    )}
                  </Link>

                  {/* Secondary CTA */}
                  {section.secondaryCtaUrl && (
                    <Link
                      href={localizeHref(section.secondaryCtaUrl, locale)}
                      className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl font-medium text-sm md:text-base text-zinc-200 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-750 backdrop-blur-md transition-all duration-300 hover:border-zinc-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
                    >
                      <span>{isAr ? section.secondaryCtaLabelAr : section.secondaryCtaLabelEn}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </Link>
                  )}
                </motion.div>
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}
