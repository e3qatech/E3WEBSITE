"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  locale: string
  className?: string
}

export function AnimatedCounter({ 
  value, 
  prefix = "", 
  suffix = "", 
  duration = 2000, 
  locale,
  className = "" 
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const counterRef = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const element = counterRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          animateValue(0, value, duration)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [value, duration])

  const animateValue = (start: number, end: number, durationMs: number) => {
    let startTimestamp: number | null = null
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1)
      
      // Easing out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * (end - start) + start))

      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setCount(end)
      }
    }
    window.requestAnimationFrame(step)
  }

  const formatNumber = (num: number) => {
    // If arabic, we might want to use eastern arabic numerals, 
    // but typically Intl.NumberFormat handles it if we pass 'ar-QA'
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-QA' : 'en-US').format(num)
  }

  return (
    <span ref={counterRef} className={className}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  )
}
