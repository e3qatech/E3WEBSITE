"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useMotionCapability } from '@/lib/motion/capability-context';

export interface CinematicVideoProps {
  src: string;
  poster?: string;
  alt?: string;
  aspectRatio?: string; // e.g. "16/9", "4/3", "1/1", "21/9"
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  overlayGradient?: string;
  reserveMinHeight?: string;
}

export function CinematicVideo({
  src,
  poster,
  alt = 'E3 Cinematic Background Video',
  aspectRatio = '16/9',
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  overlayGradient,
  reserveMinHeight = '300px',
}: CinematicVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { isDataSaver, tier, isReducedMotion } = useMotionCapability();

  // If data saver or minimal tier with reduced motion, prioritize static poster
  const shouldSkipVideo = isDataSaver || (tier === 'minimal' && isReducedMotion);

  useEffect(() => {
    if (shouldSkipVideo || typeof window === 'undefined') return;

    const el = containerRef.current;
    if (!el) return;

    // IntersectionObserver to auto-pause offscreen media
    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsVisible(inView);

        if (videoRef.current) {
          if (inView && document.visibilityState === 'visible') {
            videoRef.current.play().catch(() => {});
          } else {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    // Tab visibility change handler
    const handleVisibilityChange = () => {
      if (!videoRef.current) return;
      if (document.visibilityState === 'hidden') {
        videoRef.current.pause();
      } else if (isVisible) {
        videoRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldSkipVideo, isVisible]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio,
        minHeight: reserveMinHeight,
      }}
      aria-label={alt}
    >
      {shouldSkipVideo || !src ? (
        poster ? (
          <img
            src={poster}
            alt={alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600 text-xs font-mono">
            {alt}
          </div>
        )
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay && isVisible}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          preload="metadata"
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      )}

      {overlayGradient && (
        <div
          className={`absolute inset-0 pointer-events-none ${overlayGradient}`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
