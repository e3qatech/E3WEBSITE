"use client"

import { useEffect, useRef, useState } from 'react'

export interface PointerState {
  x: number // -1 to 1
  y: number // -1 to 1
  rawX: number
  rawY: number
  isCoarse: boolean
  reducedMotion: boolean
}

export function usePointerIntent(options?: {
  damping?: number
  disabledOnMobile?: boolean
  disabledInReducedMotion?: boolean
}) {
  const damping = options?.damping ?? 0.1
  const disabledOnMobile = options?.disabledOnMobile ?? true
  const disabledInReducedMotion = options?.disabledInReducedMotion ?? true

  const targetRef = useRef({ x: 0, y: 0, rawX: 0, rawY: 0 })
  const currentRef = useRef({ x: 0, y: 0, rawX: 0, rawY: 0 })
  const [pointerState, setPointerState] = useState<PointerState>({
    x: 0,
    y: 0,
    rawX: 0,
    rawY: 0,
    isCoarse: false,
    reducedMotion: false
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    setPointerState(prev => ({ ...prev, isCoarse, reducedMotion }))

    if ((isCoarse && disabledOnMobile) || (reducedMotion && disabledInReducedMotion)) {
      return
    }

    let animationFrameId: number

    const handleMouseMove = (e: MouseEvent) => {
      const width = window.innerWidth
      const height = window.innerHeight
      const x = (e.clientX / width) * 2 - 1
      const y = (e.clientY / height) * 2 - 1

      targetRef.current = { x, y, rawX: e.clientX, rawY: e.clientY }
    }

    const updateLoop = () => {
      const target = targetRef.current
      const current = currentRef.current

      // Lerp / Spring Smoothing
      current.x += (target.x - current.x) * damping
      current.y += (target.y - current.y) * damping
      current.rawX += (target.rawX - current.rawX) * damping
      current.rawY += (target.rawY - current.rawY) * damping

      // Publish directly to root CSS variables for high-performance zero-re-render animations
      document.documentElement.style.setProperty('--pointer-x', current.x.toFixed(4))
      document.documentElement.style.setProperty('--pointer-y', current.y.toFixed(4))
      document.documentElement.style.setProperty('--pointer-px', `${current.rawX.toFixed(1)}px`)
      document.documentElement.style.setProperty('--pointer-py', `${current.rawY.toFixed(1)}px`)

      animationFrameId = requestAnimationFrame(updateLoop)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    animationFrameId = requestAnimationFrame(updateLoop)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [damping, disabledOnMobile, disabledInReducedMotion])

  return pointerState
}
