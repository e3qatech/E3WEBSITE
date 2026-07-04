'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

const ModelViewer = dynamic(() => import('./ModelViewer'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 flex items-center justify-center bg-black"><span className="text-white/50">Loading 3D Experience...</span></div>
});

interface HeroViewerProps {
  title: string;
  tagline?: string;
  mediaType: string;
  mediaUrl?: string | null;
  fallbackUrl?: string | null;
  status?: string;
  logoUrl?: string | null;
  ctaText?: string;
  ctaLink?: string;
}

const extractUrl = (raw: string | null | undefined) => {
  if (!raw) return '';
  if (raw.includes('iframe') && raw.includes('src=')) {
    const match = raw.match(/src=["'](.*?)["']/);
    if (match) return match[1];
  }
  return raw;
};

export function HeroViewer({ title, tagline, mediaType, mediaUrl, fallbackUrl, status, logoUrl, ctaText, ctaLink }: HeroViewerProps) {
  const [mediaError, setMediaError] = React.useState(false);
  
  const currentMediaUrl = mediaError && fallbackUrl ? fallbackUrl : mediaUrl;
  const currentMediaType = mediaError && fallbackUrl ? 'IMAGE' : mediaType; // assume fallback is image

  return (
    <section className="relative w-full h-[100vh] overflow-hidden bg-black flex items-center justify-center">
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

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto mt-20">
        {logoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 relative w-32 h-32 md:w-48 md:h-48"
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
            className="mb-8 relative group"
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
          className="text-balance text-5xl md:text-7xl lg:text-[clamp(3rem,8vw,6rem)] font-black text-white tracking-tighter uppercase leading-[0.9] drop-shadow-2xl max-w-6xl break-words"
        >
          {title}
        </motion.h1>

        {tagline && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 text-xl md:text-3xl text-zinc-300 max-w-3xl font-light leading-relaxed drop-shadow-lg"
          >
            {tagline}
          </motion.p>
        )}

        {ctaText && ctaLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12"
          >
            <Link 
              href={ctaLink}
              className="inline-flex items-center justify-center px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-lg md:text-xl uppercase tracking-widest transition-all duration-300 rounded-sm hover:scale-105"
            >
              {ctaText}
            </Link>
          </motion.div>
        )}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
      >
        <span className="text-[10px] text-amber-500 uppercase tracking-[0.3em] mb-4 font-mono font-bold drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">Discover</span>
        <div className="w-[1px] h-24 bg-white/10 relative overflow-hidden rounded-full">
          <motion.div 
            className="absolute top-0 left-0 w-full h-1/2 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,1)]"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
