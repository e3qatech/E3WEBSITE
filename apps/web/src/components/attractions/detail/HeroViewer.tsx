'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ChevronDown } from 'lucide-react';

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
}

const extractUrl = (raw: string | null | undefined) => {
  if (!raw) return '';
  if (raw.includes('iframe') && raw.includes('src=')) {
    const match = raw.match(/src=["'](.*?)["']/);
    if (match) return match[1];
  }
  return raw;
};

export function HeroViewer({ title, tagline, mediaType, mediaUrl, fallbackUrl, status, logoUrl }: HeroViewerProps) {
  return (
    <section className="relative w-full h-[100vh] overflow-hidden bg-black flex items-center justify-center">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {mediaType === 'IMAGE' && mediaUrl && (
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: 'easeOut' }}
            className="w-full h-full"
          >
            <Image
              src={mediaUrl}
              alt={title}
              fill
              className="object-cover opacity-60"
              priority
            />
          </motion.div>
        )}

        {mediaType === 'VIDEO' && mediaUrl && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
          >
            <source src={mediaUrl} type="video/mp4" />
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
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10 z-10 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto mt-20">
        {logoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 relative w-48 h-48 md:w-72 md:h-72"
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
          className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white tracking-tighter uppercase leading-[0.85] drop-shadow-2xl"
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
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
      >
        <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-4 font-mono">Discover</span>
        <div className="w-[1px] h-16 bg-white/10 relative overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 w-full h-1/2 bg-white"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
