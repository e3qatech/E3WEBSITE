"use client"

import React, { useEffect, useState } from 'react'
import { motion, useSpring, useTransform, animate } from 'framer-motion'
import { useAttractionOccupancy } from '@/hooks/useSocket'
import { Wifi, WifiOff } from 'lucide-react'

interface LiveOccupancyProps {
  attractionId: string
  initialCurrent?: number
  initialMax?: number
  className?: string
}

export function LiveOccupancy({ attractionId, initialCurrent = 0, initialMax = 100, className = '' }: LiveOccupancyProps) {
  const { current = initialCurrent, max = initialMax, percentage, isOpen, isConnected } = useAttractionOccupancy(attractionId)
  
  // Animate the number for smooth count up/down
  const [displayCurrent, setDisplayCurrent] = useState(current)
  
  useEffect(() => {
    const controls = animate(displayCurrent, current, {
      duration: 0.5,
      onUpdate: (val) => setDisplayCurrent(Math.round(val)),
      ease: "easeOut"
    })
    return controls.stop
  }, [current])

  // Color logic
  const getStatusColor = (percent: number) => {
    if (percent < 50) return 'bg-[#00e676]' // Green
    if (percent < 80) return 'bg-[#ffc107]' // Yellow
    return 'bg-[#ff3d00]' // Red
  }
  
  const getTextColor = (percent: number) => {
    if (percent < 50) return 'text-[#00e676]'
    if (percent < 80) return 'text-[#ffc107]'
    return 'text-[#ff3d00]'
  }

  const barColor = getStatusColor(percentage)
  const textColor = getTextColor(percentage)

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Header Info */}
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff3d00] animate-pulse" />
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 opacity-50">
              <WifiOff className="w-3 h-3 text-white/50" />
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Offline</span>
            </div>
          )}
          
          <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isOpen ? 'bg-[#00e676]/10 text-[#00e676]' : 'bg-red-500/10 text-red-500'}`}>
            {isOpen ? 'Open' : 'Closed'}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-bold text-white/90">
            <span className={`${textColor} text-xl mr-1`}>{displayCurrent}</span>
            <span className="text-white/40 text-xs">/ {max}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`absolute top-0 left-0 bottom-0 ${barColor}`}
        />
      </div>
    </div>
  )
}
