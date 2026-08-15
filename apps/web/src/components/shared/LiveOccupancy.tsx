"use client"

import React, { useEffect, useState } from 'react'
import { motion, animate } from 'framer-motion'
import { useAttractionOccupancy } from '@/hooks/useSocket'
import { WifiOff } from 'lucide-react'

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
  }, [current, displayCurrent])

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
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {/* Header Info */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--surface-active)] border border-[var(--border-level-1)] opacity-70">
              <WifiOff className="w-3 h-3 text-[var(--text-tertiary)]" />
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Offline</span>
            </div>
          )}
          
          <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isOpen ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'}`}>
            {isOpen ? 'Open' : 'Closed'}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-bold text-[var(--text-primary)]">
            <span className={`${textColor} text-xl font-extrabold me-1`}>{displayCurrent}</span>
            <span className="text-[var(--text-tertiary)] text-xs font-semibold">/ {max}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-[var(--bg-level-1)] rounded-full overflow-hidden border border-[var(--border-level-1)] relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`absolute top-0 start-0 bottom-0 rounded-full ${barColor}`}
        />
      </div>
    </div>
  )
}
