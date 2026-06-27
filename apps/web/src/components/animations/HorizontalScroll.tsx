"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "framer-motion"

interface HorizontalScrollProps {
  children: React.ReactNode
  className?: string
}

export function HorizontalScroll({ children, className = "" }: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) return
    
    // Make sure ScrollTrigger is registered
    gsap.registerPlugin(ScrollTrigger)
    
    const container = containerRef.current
    const content = contentRef.current
    
    if (!container || !content) return

    // Calculate how far to move left (total width of content minus the viewport width)
    const getScrollAmount = () => -(content.scrollWidth - window.innerWidth)

    const tween = gsap.to(content, {
      x: getScrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: () => `+=${content.scrollWidth - window.innerWidth}`,
        pin: true,
        scrub: 1, // Smooth scrubbing
        invalidateOnRefresh: true, // Recalculate on resize
      }
    })

    return () => {
      tween.kill()
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.trigger === container) t.kill()
      })
    }
  }, [shouldReduceMotion])

  if (shouldReduceMotion) {
    return (
      <div className={`overflow-x-auto custom-scrollbar flex ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden w-full h-screen ${className}`}>
      <div ref={contentRef} className="flex h-full w-max flex-nowrap items-center">
        {children}
      </div>
    </div>
  )
}
