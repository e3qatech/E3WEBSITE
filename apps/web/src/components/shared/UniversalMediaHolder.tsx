"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MediaHolderConfig } from '@/types/gateway-cms';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const ModelViewer3D = dynamic(
  () => import('./ARViewer').then((mod) => mod.ARViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-black/40 text-xs text-white/60">
        Loading 3D Scene...
      </div>
    ),
  }
);

interface UniversalMediaHolderProps {
  config: MediaHolderConfig;
  locale?: 'en' | 'ar';
  className?: string;
  forceFallbackPreview?: boolean;
  forceReducedMotion?: boolean;
}

const ALLOWED_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
  'spline.design',
  'prod.spline.design',
  'my.spline.design',
  'booking.e3.qa',
  'cdn.e3.qa',
  'e3.qa',
  'images.unsplash.com',
  'public.blob.vercel-storage.com',
];

export function UniversalMediaHolder({
  config,
  locale = 'en',
  className,
  forceFallbackPreview = false,
  forceReducedMotion = false,
}: UniversalMediaHolderProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const altText = locale === 'ar' ? config.altAr || config.altEn : config.altEn || config.altAr;
  const captionText = locale === 'ar' ? config.captionAr || config.captionEn : config.captionEn || config.captionAr;
  const fallbackUrl = config.fallbackImageUrl || config.mediaUrl;

  // Iframe Domain Security Check
  const isValidIframeUrl = React.useMemo(() => {
    if (config.mediaType !== 'IFRAME') return true;
    if (!config.mediaUrl || !config.mediaUrl.startsWith('https://')) return false;
    try {
      const parsed = new URL(config.mediaUrl);
      const host = parsed.hostname.toLowerCase();
      return ALLOWED_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
    } catch (_e) {
      return false;
    }
  }, [config.mediaType, config.mediaUrl]);

  // Video Viewport Observer (pause when offscreen)
  useEffect(() => {
    if (config.mediaType !== 'VIDEO' || !videoRef.current) return;
    const el = videoRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            el.pause();
          } else if (config.autoplay && !forceReducedMotion) {
            el.play().catch(() => {
              // Autoplay blocked fallback handling
              console.warn('[MEDIA_HOLDER] Video autoplay blocked by browser policy');
            });
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [config.mediaType, config.autoplay, forceReducedMotion]);

  if (!config.isVisible) {
    return null;
  }

  // Determine whether fallback image MUST be rendered
  const shouldUseFallback =
    forceFallbackPreview ||
    hasError ||
    (config.mediaType === 'IFRAME' && !isValidIframeUrl) ||
    (forceReducedMotion && (config.mediaType === 'VIDEO' || config.mediaType === 'MODEL_3D'));

  const focalStyle: React.CSSProperties = {
    objectFit: config.objectFit || 'cover',
    objectPosition: `${config.focalPointX}% ${config.focalPointY}%`,
  };

  return (
    <div
      className={cn('relative w-full h-full overflow-hidden select-none bg-zinc-950', className)}
      role="region"
      aria-label={config.mediaTitle || altText || 'Media Asset Holder'}
    >
      {/* FALLBACK IMAGE RENDERING */}
      {shouldUseFallback ? (
        <img
          src={fallbackUrl}
          alt={altText || 'Media Fallback Asset'}
          style={focalStyle}
          className="w-full h-full transition-opacity duration-500"
          loading={config.loadingStrategy}
          onError={() => console.error('[MEDIA_HOLDER] Fallback image load error')}
        />
      ) : (
        <>
          {/* 1. IMAGE TYPE */}
          {config.mediaType === 'IMAGE' && (
            <img
              src={config.mediaUrl}
              alt={altText || 'E3 Media Image'}
              style={focalStyle}
              className={cn(
                'w-full h-full transition-opacity duration-500',
                isLoaded ? 'opacity-100' : 'opacity-0'
              )}
              loading={config.loadingStrategy}
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
            />
          )}

          {/* 2. VIDEO TYPE */}
          {config.mediaType === 'VIDEO' && (
            <video
              ref={videoRef}
              src={config.mediaUrl}
              poster={config.posterImageUrl || fallbackUrl}
              autoPlay={config.autoplay !== false && !forceReducedMotion}
              loop={config.loop !== false}
              muted={config.muted ?? true}
              playsInline
              preload="metadata"
              style={focalStyle}
              className={cn(
                'w-full h-full object-cover transition-opacity duration-500',
                isLoaded ? 'opacity-100' : 'opacity-90'
              )}
              onLoadedData={() => setIsLoaded(true)}
              onCanPlay={() => setIsLoaded(true)}
              onError={(e) => {
                console.warn('[MEDIA_HOLDER] Video playback warning:', e);
                // Only set fallback error if mediaUrl is missing or completely invalid
                if (!config.mediaUrl) setHasError(true);
              }}
            />
          )}

          {/* 3. 3D MODEL TYPE */}
          {config.mediaType === 'MODEL_3D' && (
            <div className="w-full h-full relative">
              <ModelViewer3D
                modelUrl={config.mediaUrl}
                posterUrl={config.posterImageUrl || fallbackUrl}
                interactive={config.interactionEnabled}
              />
            </div>
          )}

          {/* 4. IFRAME EMBED TYPE */}
          {config.mediaType === 'IFRAME' && (
            <iframe
              src={config.mediaUrl}
              title={config.mediaTitle || altText || 'Embedded Content'}
              className="w-full h-full border-0"
              loading={config.loadingStrategy}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              allow="autoplay; fullscreen; vr; xr; accelerometer; gyroscope"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
            />
          )}

          {/* Loading Overlay Spinner until primary media renders */}
          {!isLoaded && config.mediaType !== 'MODEL_3D' && (
            <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center pointer-events-none transition-opacity duration-300">
              <img
                src={fallbackUrl}
                alt="Loading poster placeholder"
                style={focalStyle}
                className="w-full h-full opacity-40 absolute inset-0 blur-sm"
              />
              <div className="relative z-10 w-8 h-8 rounded-full border-2 border-white/20 border-t-[var(--color-primary)] animate-spin" />
            </div>
          )}
        </>
      )}

      {/* Caption Overlay */}
      {captionText && (
        <div className="absolute bottom-2 start-2 end-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded text-xs text-white/90 font-medium z-10 pointer-events-none">
          {captionText}
        </div>
      )}
    </div>
  );
}
