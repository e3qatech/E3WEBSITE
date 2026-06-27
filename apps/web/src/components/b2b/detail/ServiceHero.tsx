"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { motion, useScroll, useTransform } from "framer-motion"
import { ChevronDown, Play, Pause, Volume2, VolumeX } from "lucide-react"

// Dynamically import Three.js viewer so it ONLY loads if heroMediaType === 'MODEL_3D'
const ThreeViewer = dynamic(() => import("./ThreeViewer"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
})

interface ServiceHeroProps {
  locale: string
  name: Record<string, string>
  tagline: Record<string, string>
  heroMediaType: 'IMAGE' | 'VIDEO' | 'MODEL_3D' | 'IFRAME'
  heroMediaUrl?: string
}

export function ServiceHero({ locale, name, tagline, heroMediaType, heroMediaUrl }: ServiceHeroProps) {
  const isRTL = locale === 'ar'
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, 300])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])

  const [isVideoPlaying, setIsVideoPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const renderMedia = () => {
    switch (heroMediaType) {
      case 'VIDEO':
        return (
          <>
            <motion.video
              autoPlay
              loop
              muted={isMuted}
              playsInline
              style={{ y }}
              className="absolute inset-0 w-full h-[120%] object-cover -top-[10%]"
              src={heroMediaUrl}
            />
            {/* Custom Video Controls */}
            <div className="absolute bottom-32 end-8 z-30 flex items-center gap-4">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </>
        )
      
      case 'MODEL_3D':
        if (!isMounted) return null
        return <ThreeViewer />
      
      case 'IFRAME':
        return (
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            <iframe 
              src={heroMediaUrl} 
              className="w-[100vw] h-[100vh]"
              allow="autoplay; fullscreen; picture-in-picture"
              style={{ border: 'none' }}
            />
          </div>
        )
      
      case 'IMAGE':
      default:
        return (
          <motion.div
            style={{ y, scale: useTransform(scrollY, [0, 1000], [1, 1.15]) }}
            className="absolute inset-0 w-full h-[120%] -top-[10%]"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url('${heroMediaUrl || '/placeholder.jpg'}')`,
              }}
            />
          </motion.div>
        )
    }
  }

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden bg-[var(--surface-default)]">
      
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {renderMedia()}
      </div>

      {/* Gradient Overlays for Readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[var(--surface-default)] via-[var(--surface-default)]/40 to-transparent" />
      <div className="absolute inset-0 z-10 bg-black/20" />

      {/* Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-32"
      >
        <div className="max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight drop-shadow-xl"
          >
            {name[locale] || name.en}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/90 drop-shadow-md font-medium max-w-2xl"
          >
            {tagline[locale] || tagline.en}
          </motion.p>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        style={{ opacity }}
        className="absolute bottom-10 start-1/2 -translate-x-1/2 z-20 flex flex-col items-center animate-bounce text-white/50"
      >
        <span className="text-xs uppercase tracking-widest font-bold mb-2">
          {locale === 'ar' ? 'اكتشف المزيد' : 'Scroll to explore'}
        </span>
        <ChevronDown className="w-5 h-5" />
      </motion.div>

      {/* Right Side Navigation Dots (Hint) */}
      <div className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 ${isRTL ? 'start-8' : 'end-8'} z-20 flex-col gap-4`}>
        {['Hero', 'Description', 'Process', 'Gallery', 'Projects'].map((item, i) => (
          <div key={item} className="flex items-center gap-4 group cursor-pointer">
            <span className={`text-xs font-bold text-white/0 group-hover:text-white/100 transition-colors uppercase tracking-widest ${isRTL ? 'order-2' : ''}`}>
              {item}
            </span>
            <div className={`w-2 h-2 rounded-full transition-all ${i === 0 ? 'bg-[var(--color-primary)] scale-150' : 'bg-white/30 group-hover:bg-white'}`} />
          </div>
        ))}
      </div>

    </section>
  )
}
