"use client";

import React, { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MaskPresetType, getPresetSvgPath } from './MaskPresets';
import { cn } from '@/lib/utils';

export interface MaskEngineProps {
  portalMode: 'customer' | 'organizer';
  videoUrl?: string;
  posterUrl?: string;
  fallbackImageUrl?: string;
  preset?: MaskPresetType;
  customSvgMask?: string;
  scale?: number;
  positionX?: number;
  positionY?: number;
  edgeSoftness?: number;
  distortionAmount?: number;
  idleBreathe?: boolean;
  cursorResponse?: boolean;
  altTextEn?: string;
  altTextAr?: string;
  accentColor?: string;
  isRtl?: boolean;
  onVideoError?: () => void;
  className?: string;
}

export function StandardMaskEngine({
  portalMode,
  videoUrl,
  posterUrl,
  fallbackImageUrl,
  preset = 'ORGANIC_WINDOW',
  customSvgMask,
  scale = 1,
  positionX = 0,
  positionY = 0,
  edgeSoftness = 10,
  distortionAmount: _distortionAmount = 0,
  idleBreathe = true,
  cursorResponse = true,
  altTextEn = 'E3 Pulse Attraction Experience Video',
  altTextAr = 'فيديو تجارب إي ثري الترفيهية',
  accentColor = '#10b981',
  isRtl = false,
  onVideoError,
  className,
}: MaskEngineProps) {
  const maskId = useId().replace(/:/g, '_');
  const [videoFailed, setVideoFailed] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset videoFailed when videoUrl changes
  useEffect(() => {
    setVideoFailed(false);
  }, [videoUrl]);

  // Handle cursor interaction (limited maximum displacement)
  useEffect(() => {
    if (!cursorResponse) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxShift = 12; // Tight threshold safety
      const shiftX = Math.max(-maxShift, Math.min(maxShift, (e.clientX - centerX) * 0.05));
      const shiftY = Math.max(-maxShift, Math.min(maxShift, (e.clientY - centerY) * 0.05));
      setMouseOffset({ x: shiftX, y: shiftY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorResponse]);

  const pathData = getPresetSvgPath(preset, customSvgMask);

  const handleVideoError = () => {
    setVideoFailed(true);
    if (onVideoError) onVideoError();
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative flex items-center justify-center select-none overflow-hidden', className)}
      style={{
        transform: `translate3d(${positionX + mouseOffset.x}px, ${positionY + mouseOffset.y}px, 0) scale(${scale})`,
        transition: 'transform 0.4s ease-out',
      }}
    >
      {/* Invisible Accessible Screen Reader Content */}
      <span className="sr-only">
        {isRtl ? altTextAr : altTextEn}
      </span>

      {/* Dynamic SVG Filter Defs for Soft Edges & Masking */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id={`svgClip_${maskId}`} clipPathUnits="objectBoundingBox">
            <path
              d={pathData}
              transform="scale(0.01, 0.01)"
            />
          </clipPath>
          {edgeSoftness > 0 && (
            <filter id={`softEdge_${maskId}`}>
              <feGaussianBlur stdDeviation={edgeSoftness / 5} />
            </filter>
          )}
        </defs>
      </svg>

      {/* Mask Container */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: idleBreathe ? [1, 1.02, 1] : 1,
        }}
        transition={{
          opacity: { duration: 0.6 },
          scale: idleBreathe
            ? { duration: 6, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.4 },
        }}
        className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] md:w-[500px] md:h-[500px] lg:w-[560px] lg:h-[560px] rounded-3xl overflow-hidden shadow-2xl"
        style={{
          clipPath: `url(#svgClip_${maskId})`,
          WebkitClipPath: `url(#svgClip_${maskId})`,
        }}
      >
        {/* Glow backdrop behind media */}
        <div
          className="absolute inset-0 opacity-40 blur-2xl pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
          aria-hidden="true"
        />

        {/* Media Crossfade Animation on Portal Mode Change */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${portalMode}_${videoUrl}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full relative"
          >
            {!videoFailed && videoUrl ? (
              <video
                src={videoUrl}
                poster={posterUrl || fallbackImageUrl}
                autoPlay
                loop
                muted
                playsInline
                onError={handleVideoError}
                className="w-full h-full object-cover scale-105"
              />
            ) : (
              <img
                src={posterUrl || fallbackImageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop'}
                alt={isRtl ? altTextAr : altTextEn}
                className="w-full h-full object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20 pointer-events-none" />
      </motion.div>
    </div>
  );
}
