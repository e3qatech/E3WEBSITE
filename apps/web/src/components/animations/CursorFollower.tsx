"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion"

export function CursorFollower() {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [hoverText, setHoverText] = useState("")
  const shouldReduceMotion = useReducedMotion()

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // Spring configuration for smooth trailing effect
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
  const x = useSpring(cursorX, springConfig)
  const y = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Check if it's a touch device (naive check)
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
    if (isTouchDevice || shouldReduceMotion) return

    setIsVisible(true)

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16) // Center the cursor (32x32 size)
      cursorY.set(e.clientY - 16)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Find closest interactive element
      const interactive = target.closest('a, button, [role="button"], input, select, textarea')
      
      if (interactive) {
        setIsHovering(true)
        // Check for specific data attribute for custom text, or fallback to 'View' for links
        if (interactive.hasAttribute('data-cursor-text')) {
          setHoverText(interactive.getAttribute('data-cursor-text') || "")
        } else if (interactive.tagName.toLowerCase() === 'a') {
          setHoverText("View")
        } else {
          setHoverText("")
        }
      } else {
        setIsHovering(false)
        setHoverText("")
      }
    }

    window.addEventListener("mousemove", moveCursor)
    window.addEventListener("mouseover", handleMouseOver)

    return () => {
      window.removeEventListener("mousemove", moveCursor)
      window.removeEventListener("mouseover", handleMouseOver)
    }
  }, [cursorX, cursorY, shouldReduceMotion])

  if (!isVisible || shouldReduceMotion) return null

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] flex items-center justify-center text-center overflow-hidden mix-blend-difference"
      style={{
        x,
        y,
        backgroundColor: "white",
        color: "black",
      }}
      animate={{
        scale: isHovering ? (hoverText ? 2.5 : 1.5) : 1,
        opacity: isHovering ? 1 : 0.7,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <AnimateText isHovering={isHovering} text={hoverText} />
    </motion.div>
  )
}

function AnimateText({ isHovering, text }: { isHovering: boolean, text: string }) {
  if (!text) return null
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: isHovering ? 1 : 0, scale: isHovering ? 1 : 0.5 }}
      className="text-[4px] font-black uppercase tracking-widest"
    >
      {text}
    </motion.span>
  )
}
