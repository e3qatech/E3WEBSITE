"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion"

interface MagneticButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'ref'> {
  children: React.ReactNode
  strength?: number
  radius?: number
  className?: string
}

export function MagneticButton({ 
  children, 
  strength = 0.2, 
  radius = 50,
  className = "",
  ...props 
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Smooth springs for returning to origin and moving
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  useEffect(() => {
    if (shouldReduceMotion) return
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return
      
      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const distanceX = e.clientX - centerX
      const distanceY = e.clientY - centerY
      
      // Calculate absolute distance from center
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
      
      // If within radius, move the button towards the cursor
      if (distance < radius) {
        setIsHovered(true)
        x.set(distanceX * strength)
        y.set(distanceY * strength)
      } else if (isHovered) {
        // Only trigger reset if we were previously hovered
        setIsHovered(false)
        x.set(0)
        y.set(0)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [x, y, strength, radius, isHovered, shouldReduceMotion])

  // Cleanup on unmount or when reducing motion
  useEffect(() => {
    if (shouldReduceMotion || !isHovered) {
      x.set(0)
      y.set(0)
    }
  }, [shouldReduceMotion, isHovered, x, y])

  if (shouldReduceMotion) {
    return (
      <button ref={ref} className={className} {...props}>
        {children}
      </button>
    )
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      className={`relative inline-block ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
