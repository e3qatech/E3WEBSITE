'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatLocalizedText } from '@/lib/utils';
import { B2CSceneHost } from '@/components/b2c/runtime/B2CExperienceRuntime';
import ModelViewer from './ModelViewer';
import { E3LivingHero } from '@/components/b2c/hero/E3LivingHero';
import { ChevronDown, Ticket } from 'lucide-react';

const extractUrl = (raw: string | null | undefined) => {
  if (!raw) return '';
  if (raw.includes('iframe') && raw.includes('src=')) {
    const match = raw.match(/src=["'](.*?)["']/);
    if (match) return match[1];
  }
  return raw;
};

interface HeroViewerProps {
  title: string;
  tagline?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'MODEL_3D' | 'IFRAME' | string;
  mediaUrl?: string;
  fallbackUrl?: string;
  status?: string;
  logoUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  motionPreset?: string;
  rotatingWordsEn?: string[];
  rotatingWordsAr?: string[];
  accentColor?: string;
  locale?: string;
}

export function HeroViewer({
  title,
  tagline,
  mediaType = 'IMAGE',
  mediaUrl,
  fallbackUrl,
  status,
  logoUrl,
  ctaText,
  ctaLink,
  motionPreset = 'MEDIA_CINEMATIC',
  rotatingWordsEn = [],
  rotatingWordsAr = [],
  accentColor = '#10b981',
  locale = 'en'
}: HeroViewerProps) {
  const [mediaError, setMediaError] = React.useState(false);
  const isAr = locale === 'ar';

  const currentMediaUrl = mediaError && fallbackUrl ? fallbackUrl : (mediaUrl || '');
  const currentMediaType = mediaError && fallbackUrl ? 'IMAGE' : mediaType;

  const hasRecordRotatingWords = isAr
    ? Array.isArray(rotatingWordsAr) && rotatingWordsAr.length > 0
    : Array.isArray(rotatingWordsEn) && rotatingWordsEn.length > 0;

  if (hasRecordRotatingWords) {
    return (
      <E3LivingHero
        eyebrowEn={status || "Featured Experience"}
        eyebrowAr={status || "تجربة متميزة"}
        fixedHeadlineEn={title}
        fixedHeadlineAr={title}
        rotatingWordsEn={rotatingWordsEn}
        rotatingWordsAr={rotatingWordsAr}
        descriptionEn={tagline}
        descriptionAr={tagline}
        primaryCta={ctaText && ctaLink ? {
          labelEn: ctaText,
          labelAr: ctaText,
          url: ctaLink
        } : undefined}
        media={{
          mediaType: currentMediaType.toUpperCase(),
          mediaUrl: currentMediaUrl,
          posterUrl: fallbackUrl || ''
        }}
        preset="record-accent"
        accentColor={accentColor}
        locale={locale}
      />
    );
  }

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-zinc-950 flex flex-col items-center justify-between pt-24 pb-12 px-6">
      {/* Ambient B2C Motion Preset Signature Layer */}
      <B2CSceneHost preset={motionPreset} colorAccent={accentColor} />

      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {currentMediaType === 'IMAGE' && currentMediaUrl && (
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: 'easeOut' }}
            className="w-full h-full"
          >
            <Image
              src={currentMediaUrl}
              alt={title}
              fill
              className="object-cover opacity-60"
              priority
              onError={() => setMediaError(true)}
            />
          </motion.div>
        )}

        {currentMediaType === 'VIDEO' && currentMediaUrl && (
          <video
            autoPlay
            loop
            muted
            playsInline
            onError={() => setMediaError(true)}
            className="w-full h-full object-cover opacity-60"
          >
            <source src={currentMediaUrl} type="video/mp4" />
          </video>
        )}

        {mediaType === 'MODEL_3D' && mediaUrl && (
          <div className="w-full h-full opacity-80 cursor-grab active:cursor-grabbing">
            <ModelViewer url={extractUrl(mediaUrl)} fallbackUrl={extractUrl(fallbackUrl)} />
          </div>
        )}

        {mediaType === 'IFRAME' && mediaUrl && (
          <div className="w-full h-full">
            <iframe 
              src={extractUrl(mediaUrl)} 
              className="w-full h-full border-none pointer-events-auto"
              allow="autoplay; fullscreen; xr-spatial-tracking"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        )}
      </div>

      {/* Gradient Scrim for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-transparent z-10 pointer-events-none" />

      {/* Hero Content - Centered */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto my-auto space-y-6">
        {logoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-28 h-28 md:w-40 md:h-40 mb-2"
          >
            <Image
              src={logoUrl}
              alt={`${title} Logo`}
              fill
              className="object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              priority
            />
          </motion.div>
        )}
        
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/40 transition-colors duration-500" />
            <span className="relative px-6 py-2 text-xs font-bold tracking-[0.2em] text-white uppercase bg-white/5 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
              {status}
            </span>
          </motion.div>
        )}
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance text-4xl sm:text-6xl md:text-7xl lg:text-[clamp(3rem,7vw,5.5rem)] font-black text-white tracking-tighter uppercase leading-[0.92] drop-shadow-2xl max-w-5xl break-words"
        >
          {formatLocalizedText(title, locale)}
        </motion.h1>

        {tagline && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl md:text-2xl text-zinc-300 max-w-3xl font-light leading-relaxed drop-shadow-lg"
          >
            {formatLocalizedText(tagline, locale)}
          </motion.p>
        )}

        {ctaText && ctaLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="pt-4"
          >
            {ctaLink.startsWith('http://') || ctaLink.startsWith('https://') ? (
              <a 
                href={ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-base md:text-lg uppercase tracking-wider transition-all duration-300 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:scale-105"
              >
                <Ticket className="w-5 h-5" />
                <span>{ctaText}</span>
              </a>
            ) : (
              <Link 
                href={ctaLink}
                className="inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-base md:text-lg uppercase tracking-wider transition-all duration-300 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:scale-105"
              >
                <Ticket className="w-5 h-5" />
                <span>{ctaText}</span>
              </Link>
            )}
          </motion.div>
        )}
      </div>

      {/* Clean Scroll Down Hint (Positioned with safe clearance at bottom) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="relative z-20 flex flex-col items-center gap-1.5 pt-4 pointer-events-none"
      >
        <span className="text-[10px] text-zinc-400 uppercase tracking-[0.25em] font-mono font-bold">
          {isAr ? "مرر للأسفل" : "Scroll to Explore"}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-emerald-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
