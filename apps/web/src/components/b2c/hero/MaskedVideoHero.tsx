"use client";

import React, { useRef } from 'react';
import { resolveMediaType } from '@/lib/media-resolver';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Sparkles, Calendar, ArrowRight, Play, Volume2, VolumeX } from 'lucide-react';
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

const extractIframeUrl = (raw: string | null | undefined) => {
  if (!raw) return '';
  if (raw.includes('iframe') && raw.includes('src=')) {
    const match = raw.match(/src=["'](.*?)["']/);
    if (match) return match[1];
  }
  return raw;
};

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
  const [isMuted, setIsMuted] = React.useState(true);

  // Extract CMS hero configurations
  const heroConfig = cmsData?.hero || {};
  const maskedConfig = cmsData?.maskedVideo || {};

  const rawMediaUrl = heroConfig?.mediaUrl || maskedConfig?.customerDesktopVideo;
  const mediaUrl = (rawMediaUrl && typeof rawMediaUrl === 'string' && rawMediaUrl.trim() !== '') 
    ? rawMediaUrl 
    : '';
  const posterUrl = heroConfig?.posterUrl || maskedConfig?.customerPoster || '';
  
  const streamMediaUrl = heroConfig?.streamMediaUrl || mediaUrl;
  const streamPosterUrl = heroConfig?.streamPosterUrl || posterUrl;
  const streamBadge = isAr ? (heroConfig?.streamBadgeAr || 'مباشر الآن') : (heroConfig?.streamBadgeEn || 'LIVE STREAM');
  const streamTitle = isAr ? (heroConfig?.streamTitleAr || 'عالم إي ثري الترفيهي') : (heroConfig?.streamTitleEn || 'E3 KINETIC EXPERIENCE');
  const streamSubtitle = isAr ? (heroConfig?.streamSubtitleAr || 'تجارب تفاعلية فريدة في الدوحة') : (heroConfig?.streamSubtitleEn || 'Doha Flagship Attractions & Events');
  const streamButtonUrl = heroConfig?.streamButtonUrl || `/${locale}/b2c/attractions`;
  
  // Determine media type dynamically using unified media resolver
  const mediaType = resolveMediaType({ url: mediaUrl, explicitType: heroConfig?.mediaType });

  const headerTitle = isAr
    ? (heroConfig.headerAr || (currentPortalMode === 'customer' ? 'استكشف عالم إي ثري الترفيهي' : 'هندسة الفعاليات والإنتاج الضخم'))
    : (heroConfig.headerEn || (currentPortalMode === 'customer' ? 'E3 PULSE ENTERTAINMENT WORLDS' : 'E3 ATELIER EVENT ENGINEERING'));

  const subHeader = isAr
    ? (heroConfig.subHeaderAr || (currentPortalMode === 'customer' ? 'تجارب ترفيهية غامرة ومدن ألعاب فضائية في قطر' : 'حلول متكاملة لهندسة وتصنيع الفعاليات الضخمة'))
    : (heroConfig.subHeaderEn || (currentPortalMode === 'customer' ? 'Qatar premier immersive attractions and kinetic entertainment.' : 'End-to-end event engineering, stage fabrication, and B2B spatial technologies.'));

  return (
    <section
      ref={heroRef}
      aria-label="E3 Homepage Hero Section"
      className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden border-b border-[var(--border-level-1)] pt-20 pb-16"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* 1. FULL-BLEED CINEMATIC MEDIA BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
        {(posterUrl || (mediaType === 'IMAGE' && mediaUrl)) && (
          <img
            key={posterUrl || mediaUrl}
            src={posterUrl || mediaUrl}
            alt="Hero Background Poster"
            className="w-full h-full object-cover scale-105 opacity-60 dark:opacity-70 transition-opacity duration-1000 absolute inset-0"
          />
        )}

        {mediaType === 'VIDEO' && mediaUrl && (
          <video
            key={mediaUrl}
            src={mediaUrl}
            poster={posterUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover scale-105 opacity-70 dark:opacity-80 transition-opacity duration-1000 absolute inset-0 z-10"
          />
        )}

        {mediaType === 'IMAGE' && mediaUrl && (
          <img
            key={mediaUrl}
            src={mediaUrl}
            alt="Hero Background"
            className="w-full h-full object-cover scale-105 opacity-70 dark:opacity-80 transition-opacity duration-1000 absolute inset-0 z-10"
          />
        )}

        {(mediaType === 'MODEL_3D' || mediaType === 'IFRAME' || (mediaType as string) === 'SPLINE') && (
          <iframe
            key={extractIframeUrl(mediaUrl)}
            src={extractIframeUrl(mediaUrl)}
            className="w-full h-full border-none opacity-60 pointer-events-auto absolute inset-0 z-10"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        )}

        {/* Ambient Dark Overlay Gradients for Optimal Media Visibility & Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60 z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent z-20 pointer-events-none" />
      </div>

      {/* 2. HERO CONTENT GRID */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Headline, Subtitle, CTAs & Live Search */}
        <div className="lg:col-span-7 flex flex-col items-start text-start space-y-6 z-20">
          
          {/* Section Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-wider backdrop-blur-md select-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentPortalMode === 'customer' ? (isAr ? 'عالم الزوار والفعاليات' : 'CUSTOMER EXPERIENCE') : (isAr ? 'عالم المنظمين والشركات' : 'ORGANIZER B2B ATELIER')}</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-balance text-4xl sm:text-5xl lg:text-6.5xl font-black tracking-tight uppercase leading-[1.08] text-white font-display"
          >
            {headerTitle}
          </motion.h1>

          {/* Subheader */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-200 max-w-xl font-medium leading-relaxed drop-shadow"
          >
            {subHeader}
          </motion.p>

          {/* Primary Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 pt-2 z-30"
          >
            <Link
              href={(heroConfig.tab1Url || maskedConfig.tab1Url || `/${locale}/b2c/attractions`).replace('{locale}', locale)}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 font-black text-xs shadow-xl hover:opacity-95 transition-all uppercase tracking-wider min-h-[48px] flex items-center justify-center cursor-pointer select-none gap-2"
            >
              <span>{isAr ? (heroConfig.tab1LabelAr || maskedConfig.tab1LabelAr || 'استكشف كافة التجارب') : (heroConfig.tab1LabelEn || maskedConfig.tab1LabelEn || 'EXPLORE ATTRACTIONS')}</span>
              <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
            </Link>

            <Link
              href={(heroConfig.tab2Url || maskedConfig.tab2Url || `/${locale}/b2c/calendar`).replace('{locale}', locale)}
              className="px-8 py-4 rounded-full border border-slate-700 bg-slate-900/80 text-white hover:border-slate-500 font-bold text-xs shadow-md transition-all uppercase tracking-wider min-h-[48px] flex items-center justify-center cursor-pointer select-none gap-2 backdrop-blur-md"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? (heroConfig.tab2LabelAr || maskedConfig.tab2LabelAr || 'جدول الفعاليات والباقات') : (heroConfig.tab2LabelEn || maskedConfig.tab2LabelEn || 'EVENTS & PACKAGES')}</span>
            </Link>
          </motion.div>

          {/* Live Search Input Bar */}
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
                  placeholder={isAr ? 'ابحث عن الوجهات، الفعاليات، أو الباقات...' : 'Search attractions, events, or packages...'}
                  className={cn(
                    'w-full bg-slate-900/90 border border-slate-800 text-white placeholder-slate-400 rounded-full py-3.5 text-xs focus:outline-none focus:border-emerald-500 transition-all shadow-inner backdrop-blur-md',
                    isAr ? 'pe-10 ps-4' : 'ps-10 pe-4'
                  )}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Sleek 3D Glassmorphic Media Experience Card */}
        <div className="lg:col-span-5 flex items-center justify-center relative z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full max-w-md rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl p-4 relative group"
          >
            {/* Card Preview Media */}
            <div className="w-full h-72 md:h-80 rounded-2xl overflow-hidden relative bg-slate-950">
              {(/\.(mp4|webm|mov|m4v|mkv)$/i.test(streamMediaUrl) || streamMediaUrl.includes('/api/media/') || streamMediaUrl.includes('mixkit') || streamMediaUrl.includes('video')) ? (
                <video
                  src={streamMediaUrl}
                  poster={streamPosterUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <img
                  src={streamPosterUrl || streamMediaUrl}
                  alt={streamTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

              {/* Sound Toggle Button if Video */}
              {(/\.(mp4|webm|mov|m4v|mkv)$/i.test(streamMediaUrl) || streamMediaUrl.includes('/api/media/') || streamMediaUrl.includes('mixkit') || streamMediaUrl.includes('video')) && (
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-3 end-3 p-2.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition-colors backdrop-blur-md border border-slate-700"
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
              )}

              <div className="absolute top-3 start-3 flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="px-3 py-1 rounded-full bg-slate-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md">
                  {streamBadge}
                </span>
              </div>
            </div>

            {/* Card Description Footer */}
            <div className="p-4 pt-4 flex items-center justify-between text-start">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  {streamTitle}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {streamSubtitle}
                </p>
              </div>

              <Link
                href={streamButtonUrl}
                className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ms-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
