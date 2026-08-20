"use client"

import React, { Suspense, lazy } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// Types of media supported
export type UniversalMediaType = 'IMAGE' | 'VIDEO' | 'YOUTUBE' | 'VIMEO' | 'IFRAME' | 'THREE_D' | 'SPLINE' | 'SLIDES'

export interface UniversalMediaProps {
  type: UniversalMediaType
  src: string
  alt?: string
  className?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  poster?: string
}

// Lazy load heavy 3D components
const SplineViewer = lazy(() => import('@splinetool/react-spline'))

export function parseVideoEmbedUrl(url: string, autoPlay = true, muted = true, loop = true): string {
  if (!url) return '';
  let cleanUrl = url.trim();

  // 1. If administrator pasted a raw <iframe> code snippet, extract the src URL
  if (cleanUrl.includes('<iframe') && cleanUrl.includes('src=')) {
    const srcMatch = cleanUrl.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      cleanUrl = srcMatch[1].trim();
    }
  }

  // 2. YouTube Link parsing (supports watch, shorts, share, embed, youtube-nocookie)
  if (
    cleanUrl.includes('youtube.com') ||
    cleanUrl.includes('youtu.be') ||
    cleanUrl.includes('youtube-nocookie.com')
  ) {
    const videoIdMatch = cleanUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=)|youtube-nocookie\.com\/(?:embed\/|v\/))([\w-]{11})/i
    );
    if (videoIdMatch && videoIdMatch[1]) {
      const id = videoIdMatch[1];
      const autoPlayParam = autoPlay ? '1' : '0';
      const muteParam = muted ? '1' : '0';
      const loopParam = loop ? `1&playlist=${id}` : '0';
      return `https://www.youtube.com/embed/${id}?autoplay=${autoPlayParam}&mute=${muteParam}&loop=${loopParam}&controls=1&rel=0&modestbranding=1&enablejsapi=1`;
    }
  }

  // 3. Vimeo Link parsing (supports vimeo.com/12345, player.vimeo.com/video/12345)
  if (cleanUrl.includes('vimeo.com')) {
    const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      const id = vimeoMatch[1];
      const autoPlayParam = autoPlay ? '1' : '0';
      const muteParam = muted ? '1' : '0';
      const loopParam = loop ? '1' : '0';
      return `https://player.vimeo.com/video/${id}?autoplay=${autoPlayParam}&muted=${muteParam}&loop=${loopParam}`;
    }
  }

  return cleanUrl;
}

export function UniversalMediaRenderer({
  type,
  src,
  alt = "Media content",
  className,
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
  poster
}: UniversalMediaProps) {
  const [hasError, setHasError] = React.useState(false)
  
  if (!src || hasError) {
    const fallbackSrc = poster || "/hero-bg.png";
    return (
      <div className={cn("relative w-full h-full overflow-hidden bg-zinc-950", className)}>
        <img src={fallbackSrc} alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }

  let effectiveSrc = src.trim();
  if (effectiveSrc.includes('<iframe') && effectiveSrc.includes('src=')) {
    const match = effectiveSrc.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      effectiveSrc = match[1].trim();
    }
  }

  // Detect YouTube or Vimeo URLs inside VIDEO or IFRAME type
  const isExternalVideo = effectiveSrc.includes('youtube.com') || 
                          effectiveSrc.includes('youtu.be') || 
                          effectiveSrc.includes('youtube-nocookie.com') || 
                          effectiveSrc.includes('vimeo.com');

  if (type === 'YOUTUBE' || type === 'VIMEO' || (isExternalVideo && (type === 'VIDEO' || type === 'IFRAME'))) {
    const embedUrl = parseVideoEmbedUrl(effectiveSrc, autoPlay, muted, loop);
    return (
      <div className={cn("relative w-full h-full overflow-hidden bg-zinc-950", className)}>
        <iframe 
          key={embedUrl}
          src={embedUrl}
          title={alt}
          onError={() => setHasError(true)}
          className="w-full h-full border-0 pointer-events-auto"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
        />
      </div>
    );
  }

  switch (type) {
    case 'IMAGE': {
      const isSpline = effectiveSrc.includes('spline.design') || effectiveSrc.includes('.splinecode') || effectiveSrc.includes('<iframe');
      const finalImgSrc = isSpline ? (poster || '/hero-bg.png') : effectiveSrc;
      return (
        <div className={cn("relative w-full h-full overflow-hidden", className)}>
          <img 
            key={finalImgSrc}
            src={finalImgSrc}
            alt={alt}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
      
    case 'VIDEO':
      return (
        <div className={cn("relative w-full h-full overflow-hidden flex items-center justify-center bg-zinc-950", className)}>
          <video
            key={src}
            src={src}
            poster={poster}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            controls={controls}
            playsInline
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        </div>
      );
      
    case 'IFRAME':
      if (hasError) {
        return (
          <div className={cn("relative w-full h-full overflow-hidden", className)}>
            <img
              src={poster || "/hero-bg.png"}
              alt={alt}
              className="w-full h-full object-cover"
            />
          </div>
        );
      }
      return (
        <div className={cn("relative w-full h-full", className)}>
          <iframe
            key={effectiveSrc}
            src={effectiveSrc}
            title={alt}
            onError={() => setHasError(true)}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      );
      
    case 'SPLINE':
      if (!src.includes('.splinecode') && !src.includes('spline.design')) {
        return (
          <div className={cn("relative w-full h-full", className)}>
            <iframe src={src} title={alt} className="w-full h-full border-0" allow="autoplay; fullscreen" loading="lazy" />
          </div>
        );
      }
      return (
        <div className={cn("relative w-full h-full min-h-[300px]", className)}>
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
              {poster ? (
                 <Image src={poster} alt={alt} fill className="object-cover opacity-50" />
              ) : (
                 <div className="animate-pulse w-10 h-10 rounded-full bg-emerald-500/20" />
              )}
            </div>
          }>
            <SplineViewer scene={src} onError={() => setHasError(true)} />
          </Suspense>
        </div>
      )
      
    case 'THREE_D':
      if (src.includes('.splinecode') || (src.includes('spline.design') && !src.includes('/embed/'))) {
        return (
          <div className={cn("relative w-full h-full min-h-[300px]", className)}>
            <Suspense fallback={
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
                {poster ? (
                  <Image src={poster} alt={alt} fill className="object-cover opacity-50" />
                ) : (
                  <div className="animate-pulse w-10 h-10 rounded-full bg-emerald-500/20" />
                )}
              </div>
            }>
              <SplineViewer scene={src} onError={() => setHasError(true)} />
            </Suspense>
          </div>
        )
      }
      if (src.endsWith('.mp4') || src.endsWith('.webm')) {
        return (
          <div className={cn("relative w-full h-full overflow-hidden flex items-center justify-center bg-zinc-950", className)}>
            <video
              key={src}
              src={src}
              poster={poster}
              autoPlay={autoPlay}
              loop={loop}
              muted={muted}
              controls={controls}
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        )
      }
      return (
        <div className={cn("relative w-full h-full", className)}>
          {src.startsWith('http') || src.startsWith('/') ? (
            <iframe
              key={src}
              src={src}
              title={alt}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-zinc-500">3D Model: {src}</div>
          )}
        </div>
      )
      
    case 'SLIDES':
      return (
        <div className={cn("relative w-full h-full bg-zinc-900 flex items-center justify-center", className)}>
          <p className="text-zinc-500">Slides: {src}</p>
        </div>
      )
      
    default:
      return null
  }
}
