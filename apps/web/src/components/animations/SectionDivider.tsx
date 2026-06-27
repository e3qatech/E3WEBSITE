"use client"

import { useReducedMotion, motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

interface SectionDividerProps {
  variant?: "wave" | "zigzag" | "diagonal" | "dots"
  fill?: string
  className?: string
  flip?: boolean
}

export function SectionDivider({ 
  variant = "wave", 
  fill = "var(--surface-default, #020202)", 
  className = "",
  flip = false
}: SectionDividerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Subtle parallax effect on the divider itself
  const y = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [20, -20])
  const scaleX = flip ? -1 : 1

  return (
    <div ref={ref} className={`w-full overflow-hidden leading-[0] ${className}`} style={{ transform: `scaleX(${scaleX})` }}>
      <motion.div style={{ y }} className="w-full relative block">
        {variant === "wave" && (
          <svg className="w-full h-[5vw] min-h-[50px] block" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.42,123.6,193.3,110.51,235.33,101.81,278.47,81.16,321.39,56.44Z" fill={fill}></path>
          </svg>
        )}
        
        {variant === "zigzag" && (
          <svg className="w-full h-[3vw] min-h-[30px] block" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" fill={fill}></path>
          </svg>
        )}
        
        {variant === "diagonal" && (
          <svg className="w-full h-[5vw] min-h-[40px] block" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" fill={fill}></path>
          </svg>
        )}
        
        {variant === "dots" && (
          <div className="w-full h-8 flex items-center justify-center gap-4">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: fill }}
                animate={shouldReduceMotion ? {} : { y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
