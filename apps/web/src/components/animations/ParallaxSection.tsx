"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"

interface ParallaxSectionProps {
  children: React.ReactNode
  speed?: number // 0.1 to 0.9
  direction?: "up" | "down"
  className?: string
}

export function ParallaxSection({ 
  children, 
  speed = 0.5, 
  direction = "up",
  className = "" 
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  
  // Track scroll progress within this specific element's view
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Calculate the y translation based on direction and speed
  // A speed of 0.5 means it moves at 50% the rate of scroll.
  // The y value goes from a positive/negative offset to the opposite.
  const distance = speed * 200 // max pixels to move
  const yOffset = direction === "up" ? [distance, -distance] : [-distance, distance]
  
  const y = useTransform(scrollYProgress, [0, 1], yOffset)

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="w-full h-full">
        {children}
      </motion.div>
    </div>
  )
}
