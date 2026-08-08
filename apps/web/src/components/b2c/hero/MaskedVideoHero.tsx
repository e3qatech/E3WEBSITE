"use client";

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MaskedMediaEngine } from './MaskedMediaEngine';
import { MaskPresetType } from './MaskPresets';
import { Search, Sparkles, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MaskedVideoHeroProps {
  locale: string;
  cmsData?: any;
  currentPortalMode?: 'customer' | 'organizer';
  onPortalModeChange?: (mode: 'customer' | 'organizer') => void;
  localSearch?: string;
  onSearchChange?: (val: string) => void;
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
}

export function MaskedVideoHero({
  locale,
  cmsData,
  currentPortalMode = 'customer',
  localSearch = '',
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
}: MaskedVideoHeroProps) {
  const isAr = locale === 'ar';
  const heroRef = useRef<HTMLDivElement>(null);

  // Extract CMS configurations with fallback
  const heroConfig = cmsData?.hero || {};
  const maskedConfig = cmsData?.maskedVideo || {};

  const activeMediaConfig = currentPortalMode === 'customer'
    ? {
        videoUrl: maskedConfig?.customerDesktopVideo || heroConfig?.mediaUrl || 'https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4',
        posterUrl: maskedConfig?.customerPoster || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
        preset: (maskedConfig?.customerMaskPreset || maskedConfig?.preset || 'ORGANIC_WINDOW') as MaskPresetType,
        accent: maskedConfig?.customerAccent || '#10b981',
        altEn: maskedConfig?.customerAltEn || 'E3 Pulse Customer Attractions',
        altAr: maskedConfig?.customerAltAr || 'عالم تجارب زوار إي ثري',
      }
    : {
        videoUrl: maskedConfig?.organizerDesktopVideo || 'https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4',
        posterUrl: maskedConfig?.organizerPoster || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop',
        preset: (maskedConfig?.organizerMaskPreset || maskedConfig?.preset || 'PORTAL_ARCH') as MaskPresetType,
        accent: maskedConfig?.organizerAccent || '#3b82f6',
        altEn: maskedConfig?.organizerAltEn || 'E3 Atelier Event Engineering',
        altAr: maskedConfig?.organizerAltAr || 'هندسة الفعاليات والإنتاج',
      };

  const headerTitle = isAr
    ? (currentPortalMode === 'customer' ? heroConfig.headerAr || 'استكشف عالم إي ثري الترفيهي' : 'هندسة الفعاليات والإنتاج الضخم')
    : (currentPortalMode === 'customer' ? heroConfig.headerEn || 'E3 PULSE MASKED WORLDS' : 'E3 ATELIER EVENT ENGINEERING');

  const subHeader = isAr
    ? (currentPortalMode === 'customer' ? heroConfig.subHeaderAr || 'تجارب ترفيهية غامرة ومدن ألعاب فضائية في قطر' : 'حلول متكاملة لهندسة وتصنيع الفعاليات الضخمة')
    : (currentPortalMode === 'customer' ? heroConfig.subHeaderEn || ' Qatar premier immersive attractions and kinetic entertainment.' : 'End-to-end event engineering, stage fabrication, and B2B spatial technologies.');

  return (
    <section
      ref={heroRef}
      aria-label="E3 Homepage Hero Section"
      className="relative w-full min-h-[85vh] flex flex-col items-center justify-center px-4 overflow-hidden border-b border-[var(--border-level-1)] pt-20 pb-12"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Background Ambient Canvas Grid */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 opacity-90 pointer-events-none" />

      {/* Main Grid Layout: Protected Content Zone on Left, Masked Video Engine on Right */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Protected Text & CTA Zone */}
        <div className="lg:col-span-7 flex flex-col items-start text-start space-y-6 z-20">
          
          {/* Section Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-extrabold uppercase tracking-wider select-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentPortalMode === 'customer' ? (isAr ? 'عالم الزوار' : 'CUSTOMER EXPERIENCE') : (isAr ? 'عالم المنظمين' : 'ORGANIZER B2B ATELIER')}</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-balance text-4xl sm:text-5xl lg:text-6.5xl font-black tracking-tight uppercase leading-[1.08] text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300"
          >
            {headerTitle}
          </motion.h1>

          {/* Subheader */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-xl font-medium leading-relaxed"
          >
            {subHeader}
          </motion.p>

          {/* Primary Action CTAs - Protected Touch Targets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 pt-2 z-30"
          >
            <Link
              href={`/${locale}/b2c/attractions`}
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 font-extrabold text-sm shadow-lg hover:opacity-95 transition-all uppercase tracking-wider min-h-[44px] flex items-center justify-center cursor-pointer select-none"
            >
              {isAr ? 'استكشف التجارب' : 'EXPLORE ATTRACTIONS'}
            </Link>
            <Link
              href={`/${locale}/b2c/tickets`}
              className="px-7 py-3.5 rounded-full border border-slate-700 bg-slate-900/80 text-white hover:border-slate-500 font-bold text-sm shadow-md transition-all uppercase tracking-wider min-h-[44px] flex items-center justify-center cursor-pointer select-none gap-2"
            >
              <Ticket className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'احجز التذاكر' : 'BOOK TICKETS'}</span>
            </Link>
          </motion.div>

          {/* Search Bar */}
          {(heroConfig.showSearch ?? true) && onSearchChange && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="w-full max-w-md relative pt-2"
            >
              <div className="relative flex items-center w-full">
                <Search className={cn('absolute w-4 h-4 text-slate-400 z-20', isAr ? 'end-4' : 'start-4')} />
                <input
                  type="search"
                  value={localSearch}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={onSearchFocus}
                  onBlur={onSearchBlur}
                  placeholder={isAr ? 'ابحث عن الوجهات والفعاليات...' : 'Search attractions & events...'}
                  className={cn(
                    'w-full bg-slate-900/90 border border-slate-800 text-white placeholder-slate-400 rounded-full py-3 text-xs focus:outline-none focus:border-emerald-500 transition-all shadow-inner',
                    isAr ? 'pe-10 ps-4' : 'ps-10 pe-4'
                  )}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Masked Video Engine (E3 Pulse Masked Worlds) */}
        <div className="lg:col-span-5 flex items-center justify-center relative z-10">
          <MaskedMediaEngine
            portalMode={currentPortalMode}
            videoUrl={activeMediaConfig.videoUrl}
            posterUrl={activeMediaConfig.posterUrl}
            preset={activeMediaConfig.preset}
            customSvgMask={maskedConfig?.customSvgMask}
            scale={maskedConfig?.scale || 1}
            positionX={maskedConfig?.positionX || 0}
            positionY={maskedConfig?.positionY || 0}
            edgeSoftness={maskedConfig?.edgeSoftness || 12}
            distortionAmount={maskedConfig?.distortionAmount || 0}
            idleBreathe={maskedConfig?.idleBreathe ?? true}
            cursorResponse={maskedConfig?.cursorResponse ?? true}
            rendererMode={maskedConfig?.rendererMode || 'STANDARD'}
            accentColor={activeMediaConfig.accent}
            altTextEn={activeMediaConfig.altEn}
            altTextAr={activeMediaConfig.altAr}
            isRtl={isAr}
          />
        </div>

      </div>
    </section>
  );
}
