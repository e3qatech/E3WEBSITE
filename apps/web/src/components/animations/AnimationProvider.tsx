"use client"

import { useEffect, useSyncExternalStore } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register ScrollTrigger globally
gsap.registerPlugin(ScrollTrigger)

const emptySubscribe = () => () => {}

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  useEffect(() => {
    
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
