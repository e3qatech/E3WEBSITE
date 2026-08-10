"use client"

import { motion } from 'framer-motion'

interface E3ArrowHeroDeviceProps {
  progress?: number
  variant?: 'LIGHT_BEAM' | 'SKETCH' | 'ROAD_MARKING' | 'INFLATABLE_SEAM' | 'LUMINOUS_TRAIL' | 'TIMELINE' | 'QATAR_ROUTE' | 'TICKET_EDGE'
  accentColor?: string
  className?: string
}

export function E3ArrowHeroDevice({
  progress = 0,
  variant = 'LIGHT_BEAM',
  accentColor = '#10b981',
  className = ''
}: E3ArrowHeroDeviceProps) {
  return (
    <div className={`relative pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="e3-arrow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="1" />
          </linearGradient>

          <filter id="e3-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* E3 Diagonal Arrow Base Path */}
        <motion.path
          d="M 120,480 L 580,120 L 720,120 L 840,240 L 720,240 L 540,160 L 160,520 Z"
          fill="url(#e3-arrow-gradient)"
          filter="url(#e3-glow)"
          initial={{ opacity: 0.3, scale: 0.95 }}
          animate={{
            opacity: [0.6, 0.9, 0.6],
            scale: [0.98, 1.02, 0.98],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Dynamic Light Beam Trail */}
        <motion.path
          d="M 80,520 L 620,80 L 880,80"
          stroke={accentColor}
          strokeWidth={variant === 'ROAD_MARKING' ? 8 : variant === 'INFLATABLE_SEAM' ? 14 : 4}
          strokeDasharray={variant === 'ROAD_MARKING' ? "24 16" : variant === 'INFLATABLE_SEAM' ? "32 8" : "none"}
          strokeLinecap="round"
          initial={{ pathLength: 0.2 }}
          animate={{ pathLength: Math.max(0.2, Math.min(1, progress + 0.3)) }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Pulsing Core Diamond Node */}
        <motion.circle
          cx={120 + progress * 600}
          cy={480 - progress * 360}
          r={variant === 'LUMINOUS_TRAIL' ? 12 : 8}
          fill="#ffffff"
          filter="url(#e3-glow)"
          animate={{
            r: [6, 12, 6],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>
    </div>
  )
}
