"use client"

import { useEffect, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register ScrollTrigger globally
gsap.registerPlugin(ScrollTrigger)

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Refresh ScrollTrigger on resize or dynamic layout changes
    const handleResize = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener("resize", handleResize)
    
    return () => {
      window.removeEventListener("resize", handleResize)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  // We wait for mount to avoid hydration mismatch with animations
  return <>{mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}</>
}
