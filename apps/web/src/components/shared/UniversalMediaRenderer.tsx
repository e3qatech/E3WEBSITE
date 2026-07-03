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
  
  if (!src) return null

  switch (type) {
    case 'IMAGE':
      return (
        <div className={cn("relative w-full h-full overflow-hidden", className)}>
          <Image 
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false} // Allow overrides via props if needed in future
          />
        </div>
      )
      
    case 'VIDEO':
      return (
        <div className={cn("relative w-full h-full overflow-hidden flex items-center justify-center bg-zinc-950", className)}>
          <video
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
      
    case 'IFRAME':
      // Basic sanitization/check for allowed domains could be added here
      return (
        <div className={cn("relative w-full h-full", className)}>
          <iframe 
            src={src}
            title={alt}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      )
      
    case 'SPLINE':
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
            <SplineViewer scene={src} />
          </Suspense>
        </div>
      )
      
    case 'THREE_D':
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
             <div className="flex items-center justify-center w-full h-full text-zinc-500">3D Model: {src}</div>
          </Suspense>
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
