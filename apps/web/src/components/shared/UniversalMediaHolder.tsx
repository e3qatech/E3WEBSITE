"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MediaHolderConfig } from '@/types/gateway-cms';
import { cn } from '@/lib/utils';
import { resolveMediaType } from '@/lib/media-resolver';
import { parseVideoEmbedUrl } from './UniversalMediaRenderer';
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
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
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
  const imgRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const safeConfig = config || {
    mediaType: 'IMAGE' as const,
    mediaUrl: '',
    fallbackImageUrl: '',
    altEn: '',
    altAr: '',
  };

  const isAr = locale === 'ar';
  const defaultAlt = isAr ? 'صورة إي ثري' : 'E3 Media Image';
  const altText = isAr ? (safeConfig.altAr || defaultAlt) : (safeConfig.altEn || defaultAlt);
  const captionText = isAr ? (safeConfig.captionAr || '') : (safeConfig.captionEn || '');
  const fallbackUrl = safeConfig.fallbackImageUrl || safeConfig.mediaUrl;

  const parsedMediaUrl = React.useMemo(() => {
    return parseVideoEmbedUrl(
      safeConfig.mediaUrl || '',
      safeConfig.autoplay !== false,
      safeConfig.muted ?? true,
      safeConfig.loop !== false
    );
  }, [safeConfig.mediaUrl, safeConfig.autoplay, safeConfig.muted, safeConfig.loop]);

  const effectiveMediaType = resolveMediaType({ url: parsedMediaUrl || safeConfig.mediaUrl, explicitType: safeConfig.mediaType });

  // Handle cached image checks on mount
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, [config?.mediaUrl]);

  // Iframe Domain Security Check
  const isValidIframeUrl = React.useMemo(() => {
    if (effectiveMediaType !== 'IFRAME') return true;
    const targetUrl = parsedMediaUrl || config.mediaUrl;
    if (!targetUrl || !targetUrl.startsWith('https://')) return false;
    try {
      const parsed = new URL(targetUrl);
      const host = parsed.hostname.toLowerCase();
      return ALLOWED_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
    } catch (_e) {
      return false;
    }
  }, [effectiveMediaType, parsedMediaUrl, config.mediaUrl]);

  // Video Viewport Observer (pause when offscreen)
  useEffect(() => {
    if (effectiveMediaType !== 'VIDEO' || !videoRef.current) return;
    const el = videoRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            el.pause();
          } else if (config.autoplay && !forceReducedMotion) {
            el.play().catch(() => {
              console.warn('[MEDIA_HOLDER] Video autoplay blocked by browser policy');
            });
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [effectiveMediaType, config.autoplay, forceReducedMotion]);

  if (!config.isVisible) {
    return null;
  }

  // Determine whether fallback image MUST be rendered
  const shouldUseFallback =
    forceFallbackPreview ||
    hasError ||
    (effectiveMediaType === 'IFRAME' && !isValidIframeUrl) ||
    (forceReducedMotion && (effectiveMediaType === 'VIDEO' || effectiveMediaType === 'MODEL_3D'));

  const focalStyle: React.CSSProperties = {
    objectFit: config.objectFit || 'cover',
    objectPosition: `${config.focalPointX}% ${config.focalPointY}%`,
  };

  return (
    <div
      className={cn('relative w-full h-full overflow-hidden select-none bg-zinc-950', className)}
      role="region"
      aria-label={config.mediaTitle || altText || (isAr ? 'عنصر وسائط إي ثري' : 'Media Asset Holder')}
    >
      {/* FALLBACK IMAGE RENDERING */}
      {shouldUseFallback ? (
        <img
          key={fallbackUrl}
          src={fallbackUrl}
          alt={altText || (isAr ? 'صورة احتياطية' : 'Media Fallback Asset')}
          style={focalStyle}
          className="w-full h-full object-cover opacity-100 filter contrast-[1.05] brightness-[0.95]"
          loading={config.loadingStrategy}
          onError={() => console.error('[MEDIA_HOLDER] Fallback image load error')}
        />
      ) : (
        <>
          {/* 1. IMAGE TYPE */}
          {effectiveMediaType === 'IMAGE' && (
            <img
              key={config.mediaUrl}
              ref={imgRef}
              src={config.mediaUrl}
              alt={altText || (isAr ? 'صورة إي ثري' : 'E3 Media Image')}
              style={focalStyle}
              className={cn(
                "w-full h-full object-cover filter contrast-[1.05] brightness-[0.95] transition-opacity duration-300",
                isLoaded ? "opacity-100" : "opacity-95"
              )}
              loading={config.loadingStrategy}
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
            />
          )}

          {/* 2. VIDEO TYPE */}
          {effectiveMediaType === 'VIDEO' && (
            <video
              key={config.mediaUrl}
              ref={videoRef}
              src={config.mediaUrl}
              poster={config.posterImageUrl || fallbackUrl}
              autoPlay={config.autoplay !== false && !forceReducedMotion}
              loop={config.loop !== false}
              muted={config.muted ?? true}
              playsInline
              preload="metadata"
              style={focalStyle}
              className="w-full h-full object-cover opacity-100 filter contrast-[1.05] brightness-[0.95] transition-opacity duration-300"
              onLoadedData={() => setIsLoaded(true)}
              onCanPlay={() => setIsLoaded(true)}
              onError={(e) => {
                console.warn('[MEDIA_HOLDER] Video playback warning:', e);
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
          {(config.mediaType === 'IFRAME' || effectiveMediaType === 'IFRAME') && (
            <iframe
              key={parsedMediaUrl || config.mediaUrl}
              src={parsedMediaUrl || config.mediaUrl}
              title={config.mediaTitle || altText || (isAr ? 'محتوى تفاعلي مدمج' : 'Embedded Content')}
              className="w-full h-full border-0"
              loading={config.loadingStrategy}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
            />
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
