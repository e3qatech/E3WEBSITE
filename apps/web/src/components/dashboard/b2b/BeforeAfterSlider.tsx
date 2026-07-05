"use client"

import { useState, useRef, useEffect } from "react"
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

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    let position = (x / rect.width) * 100
    if (position < 0) position = 0
    if (position > 100) position = 100
    setSliderPosition(position)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    handleMove(e.touches[0].clientX)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

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
  }, [isDragging])

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden select-none cursor-ew-resize border border-[var(--border-default)] shadow-inner"
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
    >
      {/* After (Base/Underneath Image) */}
      <img 
        src={afterImage} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <div className="absolute end-4 bottom-4 bg-zinc-950/60 text-white px-2 py-1 text-xs font-bold rounded uppercase tracking-wider backdrop-blur-sm z-10">
        {afterLabel}
      </div>

      {/* Before (Overlay Image, Clipped) */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={beforeImage} 
          alt="Before" 
          className="absolute inset-0 w-full h-full object-cover max-w-none pointer-events-none"
          style={{ width: containerRef.current?.getBoundingClientRect().width }}
        />
        <div className="absolute start-4 bottom-4 bg-[var(--color-primary)] text-white px-2 py-1 text-xs font-bold rounded uppercase tracking-wider shadow z-10">
          {beforeLabel}
        </div>
      </div>

      {/* Slider Handle Divider */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white hover:bg-[var(--color-primary)] cursor-ew-resize z-20"
        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white hover:bg-[var(--color-primary)] hover:text-white text-[var(--text-secondary)] shadow-md border border-[var(--border-default)] flex items-center justify-center transition-colors">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
