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
  status?: string;
}

export function HeroViewer({ title, tagline, mediaType, mediaUrl, status }: HeroViewerProps) {
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
            <ModelViewer url={mediaUrl} />
          </div>
        )}

        {mediaType === 'IFRAME' && mediaUrl && (
          <div className="w-full h-full">
            <iframe 
              src={mediaUrl} 
              className="w-full h-full border-none pointer-events-auto"
              allow="autoplay; fullscreen; xr-spatial-tracking"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        )}
      </div>

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto mt-20">
        {status && (
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-white uppercase bg-white/10 backdrop-blur-md rounded-full border border-white/20"
          >
            {status}
          </motion.span>
        )}
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]"
        >
          {title}
        </motion.h1>

        {tagline && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-lg md:text-2xl text-zinc-300 max-w-2xl font-light"
          >
            {tagline}
          </motion.p>
        )}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-bounce"
      >
        <span className="text-[10px] text-white/50 uppercase tracking-widest mb-2 font-mono">Scroll</span>
        <ChevronDown className="w-5 h-5 text-white/50" />
      </motion.div>
    </section>
  );
}
