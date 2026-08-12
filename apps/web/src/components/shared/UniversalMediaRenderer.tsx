"use client"

import React, { Suspense, lazy } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// Types of media supported
export type UniversalMediaType = 'IMAGE' | 'VIDEO' | 'IFRAME' | 'THREE_D' | 'SPLINE' | 'SLIDES'

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
// Assume we have a shared SpatialScene for GLTF/THREE_D
// const SpatialScene = lazy(() => import('./SpatialScene').then(mod => ({ default: mod.SpatialScene })))

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
      <div className={cn("relative w-full h-full bg-gradient-to-br from-[var(--e3-deep-blue)] via-[var(--e3-midnight)] to-zinc-950 flex items-center justify-center", className)}>
        <div className="w-12 h-12 rounded-full bg-[var(--e3-royal-blue)]/20 border border-[var(--e3-royal-blue)]/40 flex items-center justify-center font-bold text-xs text-[var(--e3-royal-blue)]">
          E3
        </div>
      </div>
    )
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
      // Spline runtime requires valid .splinecode scene binary or prod.spline.design embed URL
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
      // Placeholder for carousel/slider implementation
      return (
        <div className={cn("relative w-full h-full bg-zinc-900 flex items-center justify-center", className)}>
          <p className="text-zinc-500">Slides: {src}</p>
        </div>
      )
      
    default:
      return null
  }
}
