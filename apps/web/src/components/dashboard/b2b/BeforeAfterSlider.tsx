"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Sparkles } from "lucide-react"

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After"
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    let position = (x / rect.width) * 100
    if (position < 0) position = 0
    if (position > 100) position = 100
    setSliderPosition(position)
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return
    handleMove(e.touches[0].clientX)
  }, [isDragging, handleMove])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }, [isDragging, handleMove])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      window.addEventListener("touchmove", handleTouchMove)
      window.addEventListener("touchend", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove])

  const [containerWidth, setContainerWidth] = useState<number | string>('100%')

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden select-none touch-none rounded-xl border border-border-default shadow-inner"
      style={{ aspectRatio: '16/9' }}
      onMouseMove={handleMouseMove as any}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchStart={(e) => {
        setIsDragging(true)
        handleMove(e.touches[0].clientX)
      }}
    >
      {/* After Image (Background) */}
      <img 
        src={afterImage} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <div className="absolute top-4 end-4 bg-zinc-950/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-10 pointer-events-none">
        {afterLabel}
      </div>

      {/* Before Image (Foreground, clipped) */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={beforeImage} 
          alt="Before" 
          className="absolute inset-0 h-full object-cover"
          style={{ width: containerWidth, maxWidth: 'none' }}
        />
        <div className="absolute top-4 start-4 bg-white/80 backdrop-blur-md text-zinc-950 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-10">
          {beforeLabel}
        </div>
      </div>

      {/* Slider Handle Divider */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white hover:bg-accent cursor-ew-resize z-20"
        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white hover:bg-accent hover:text-white text-text-secondary shadow-md border border-border-default flex items-center justify-center transition-colors">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
