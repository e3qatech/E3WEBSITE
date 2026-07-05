"use client"

import { useState } from "react"
import { MapPin, Info } from "lucide-react"
import Link from "next/link"

export interface AttractionData {
  id: string
  slug: string
  name: string
  tagline: string
  status: "active" | "upcoming" | "coming_soon"
  location: [number, number] // [x, y] mapped coordinates
  capacity: number
}

interface SpatialFallbackProps {
  attractions: AttractionData[]
  onAttractionClick?: (slug: string) => void
}

export function SpatialFallback({ attractions, onAttractionClick }: SpatialFallbackProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  const getColor = (status: string) => {
    switch (status) {
      case "active": return "var(--color-success)"
      case "upcoming": return "var(--color-warning)"
      case "coming_soon": return "var(--color-primary)"
      default: return "#ffffff"
    }
  }

  return (
    <div className="relative w-full h-[40vh] md:h-[60vh] bg-[#050505] overflow-hidden flex items-center justify-center rounded-2xl border border-[var(--border-default)]">
      
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative w-full max-w-[600px] aspect-[1/1.2]">
        {/* Simplified SVG Map of Qatar */}
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-2xl opacity-40">
          <path 
            d="M50 110 C45 100, 30 90, 25 70 C20 50, 30 30, 45 15 C60 5, 75 10, 80 25 C85 40, 70 60, 85 80 C90 90, 70 105, 50 110 Z" 
            fill="#1a1a1a" stroke="#333" strokeWidth="1" 
          />
        </svg>

        {/* Event Markers */}
        {attractions.map((attr) => (
          <div
            key={attr.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: `${attr.location[0]}%`, top: `${attr.location[1]}%` }}
            onMouseEnter={() => setHovered(attr.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onAttractionClick?.(attr.slug)}
          >
            {/* Pulsing ring for active events */}
            {attr.status === 'active' && (
              <div 
                className="absolute inset-0 rounded-full animate-ping opacity-50"
                style={{ backgroundColor: getColor(attr.status) }}
              />
            )}
            
            <div 
              className="relative w-3 h-3 rounded-full shadow-lg transition-transform group-hover:scale-150"
              style={{ 
                backgroundColor: getColor(attr.status),
                boxShadow: `0 0 10px ${getColor(attr.status)}`
              }}
            />

            {/* Tooltip */}
            {hovered === attr.id && (
              <div className="absolute bottom-full start-1/2 -translate-x-1/2 mb-3 bg-[var(--surface-default)] border border-[var(--border-default)] p-3 rounded-xl shadow-xl w-48 z-10">
                <h4 className="font-bold text-[var(--text-primary)] text-sm mb-1">{attr.name}</h4>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mb-2">{attr.tagline}</p>
                <Link href={`/b2c/attractions/${attr.slug}`} className="text-xs font-bold text-[var(--color-primary)] flex items-center gap-1 hover:underline">
                  <Info className="w-3 h-3" /> View Details
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 end-4 bg-zinc-950/50 backdrop-blur border border-white/10 p-3 rounded-xl flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--color-success)]" /><span className="text-xs font-bold text-white">Active</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--color-warning)]" /><span className="text-xs font-bold text-white">Upcoming</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" /><span className="text-xs font-bold text-white">Coming Soon</span></div>
      </div>

    </div>
  )
}
