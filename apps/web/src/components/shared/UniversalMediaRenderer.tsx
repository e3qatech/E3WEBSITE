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

function parseVideoEmbedUrl(url: string, autoPlay = true, muted = true, loop = true): string {
  if (!url) return '';
  // YouTube watch link: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      const id = videoIdMatch[1];
      const autoPlayParam = autoPlay ? '1' : '0';
      const muteParam = muted ? '1' : '0';
      const loopParam = loop ? `1&playlist=${id}` : '0';
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=${autoPlayParam}&mute=${muteParam}&loop=${loopParam}&controls=1&rel=0&modestbranding=1`;
    }
  }
  // Vimeo link: https://vimeo.com/VIDEO_ID
  if (url.includes('vimeo.com')) {
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      const id = vimeoMatch[1];
      const autoPlayParam = autoPlay ? '1' : '0';
      const muteParam = muted ? '1' : '0';
      return `https://player.vimeo.com/video/${id}?autoplay=${autoPlayParam}&muted=${muteParam}&loop=${loop ? '1' : '0'}`;
    }
  }
  return url;
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
    if (poster) {
      return (
        <div className={cn("relative w-full h-full overflow-hidden", className)}>
          <img src={poster} alt={alt} className="w-full h-full object-cover" />
        </div>
      )
    }
    return (
      <div className={cn("relative w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 flex items-center justify-center", className)}>
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-emerald-400 font-syne">
          E3
        </div>
      </div>
    )
  }

  // Detect YouTube or Vimeo URLs inside VIDEO or IFRAME type
  const isExternalVideo = src.includes('youtube.com') || src.includes('youtu.be') || src.includes('vimeo.com');

  if (type === 'YOUTUBE' || type === 'VIMEO' || (isExternalVideo && (type === 'VIDEO' || type === 'IFRAME'))) {
    const embedUrl = parseVideoEmbedUrl(src, autoPlay, muted, loop);
    return (
      <div className={cn("relative w-full h-full overflow-hidden bg-zinc-950", className)}>
        <iframe 
          key={embedUrl}
          src={embedUrl}
          title={alt}
          onError={() => setHasError(true)}
          className="w-full h-full border-0 pointer-events-auto"
          allow="autoplay; fullscreen; picture-in-picture; accelerometer; gyroscope; encrypted-media"
          loading="lazy"
        />
      </div>
    );
  }

  switch (type) {
    case 'IMAGE':
      return (
        <div className={cn("relative w-full h-full overflow-hidden", className)}>
          <img 
            key={src}
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        </div>
      )
      
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
      )
      
    case 'IFRAME':
      return (
        <div className={cn("relative w-full h-full", className)}>
          <iframe 
            key={src}
            src={src}
            title={alt}
            onError={() => setHasError(true)}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      )
      
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
