"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion, animate } from "framer-motion"

interface CountUpProps {
  target: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function CountUp({ 
  target, 
  duration = 2, 
  prefix = "", 
  suffix = "", 
  decimals = 0,
  className = "" 
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const shouldReduceMotion = useReducedMotion()
  
  const [displayValue, setDisplayValue] = useState(() => 
    shouldReduceMotion ? target.toFixed(decimals) : "0"
  )
  
  // Only trigger once when 10% visible
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" })

  useEffect(() => {
    if (shouldReduceMotion) {
      return
    }

    if (isInView) {
      const controls = animate(0, target, {
        duration,
        ease: "easeOut",
        onUpdate(value) {
          setDisplayValue(value.toFixed(decimals))
        },
      })
      return controls.stop
    }
  }, [isInView, target, duration, decimals, shouldReduceMotion])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}
