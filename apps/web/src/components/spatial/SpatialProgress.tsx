"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SpatialSection } from './spatial-experience.types';
import { cn } from '@/lib/utils';

export interface SpatialProgressProps {
  sections: SpatialSection[];
  activeIndex: number;
  progress: number;
  locale?: string;
  onSelectIndex: (index: number) => void;
}

export function SpatialProgress({
  sections,
  activeIndex,
  progress,
  locale = 'en',
  onSelectIndex,
}: SpatialProgressProps) {
  const isAr = locale === 'ar';
  const activeSection = sections[activeIndex] || sections[0];
  const accentColor = activeSection?.accentColor || '#38bdf8';

  return (
    <>
      {/* 1. Side Navigation Dots & Section Labels (Desktop & Tablet) */}
      <aside
        aria-label={isAr ? "التنقل بين أقسام الأسطوانة" : "Spatial section navigation"}
        className={cn(
          "hidden md:flex fixed top-1/2 -translate-y-1/2 z-30 flex-col gap-3 pointer-events-auto px-4 md:px-8",
          isAr ? "right-0 items-end" : "left-0 items-start"
        )}
      >
        <div className="flex flex-col gap-2 p-2 rounded-2xl bg-zinc-950/60 backdrop-blur-md border border-zinc-800/80 shadow-2xl">
          {sections.map((section, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={section.id}
                onClick={() => onSelectIndex(idx)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`${isAr ? 'الانتقال إلى' : 'Jump to'} ${isAr ? section.eyebrowAr : section.eyebrowEn}`}
                className="group flex items-center gap-3 p-1.5 rounded-xl transition-all duration-300 hover:bg-zinc-800/60 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                {/* Dot / Pill indicator */}
                <span
                  className={cn(
                    "block rounded-full transition-all duration-500 ease-out",
                    isActive ? "w-7 h-2" : "w-2 h-2 bg-zinc-600 group-hover:bg-zinc-400"
                  )}
                  style={{
                    backgroundColor: isActive ? accentColor : undefined,
                    boxShadow: isActive ? `0 0 12px ${accentColor}88` : undefined,
                  }}
                />

                {/* Hover / Active Label */}
                <span
                  className={cn(
                    "hidden lg:inline-block text-[11px] font-mono font-medium transition-all duration-300",
                    isActive ? "text-white font-bold opacity-100" : "text-zinc-500 opacity-0 group-hover:opacity-100"
                  )}
                >
                  {section.sectionNumber} • {isAr ? section.eyebrowAr : section.eyebrowEn}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* 2. Bottom Right Progress Counter Badge (01 / 08) */}
      <div
        className={cn(
          "fixed bottom-8 z-30 pointer-events-none flex items-center gap-4 px-6 md:px-10",
          isAr ? "left-0" : "right-0"
        )}
      >
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800 shadow-xl font-mono text-xs">
          <span className="text-white font-bold text-sm" style={{ color: accentColor }}>
            {String(activeIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">
            {String(sections.length).padStart(2, '0')}
          </span>
          <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden ml-1">
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${Math.round(((activeIndex + 1) / sections.length) * 100)}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. Bottom Center Scroll Direction Cue */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-1 opacity-75">
        <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
          {isAr ? "اسحب لتدوير الأسطوانة" : "Scroll to rotate"}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="text-zinc-400"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </div>
    </>
  );
}
