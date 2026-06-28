"use client"

import { Briefcase, Target, Calendar, Star, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { motion, Variants } from "framer-motion"

export interface StatItem {
  id: string
  label: string
  value: string | number
  trend: number
  trendLabel: string
  history: number[] // for sparkline
}

interface StatsGridProps {
  stats: StatItem[]
  isLoading?: boolean
}

function Sparkline({ data, color }: { data: number[], color: string }) {
  if (!data || data.length === 0) return null
  
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  
  const width = 60
  const height = 24
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((d - min) / range) * height
    return `${x},${y}`
  }).join(" ")

  return (
    <svg width={width} height={height} className="overflow-visible">
      <motion.polyline
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVars: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  
  const ICONS: Record<string, any> = {
    "active-projects": Briefcase,
    "new-leads": Target,
    "upcoming-events": Calendar,
    "feedback-score": Star
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass border-gradient rounded-2xl p-6 animate-pulse shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-[var(--surface-active)] rounded-xl" />
              <div className="w-16 h-6 bg-[var(--surface-active)] rounded-full" />
            </div>
            <div className="space-y-3 mt-4">
              <div className="w-24 h-4 bg-[var(--surface-active)] rounded" />
              <div className="w-16 h-10 bg-[var(--surface-active)] rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div 
      variants={containerVars}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
    >
      {stats.map((stat) => {
        const Icon = ICONS[stat.id] || Briefcase
        const isPositive = stat.trend > 0
        const isNeutral = stat.trend === 0
        const trendColor = isNeutral 
          ? "text-[var(--text-tertiary)]" 
          : isPositive 
            ? "text-[var(--color-success)]" 
            : "text-[var(--color-error)]"

        return (
          <motion.div 
            variants={itemVars}
            whileHover={{ y: -6, scale: 1.01 }}
            key={stat.id} 
            className="glass border-gradient rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_15px_30px_-10px_rgba(var(--color-primary-rgb),0.1)] hover:border-[var(--color-primary)]/40 relative overflow-hidden group"
          >
            {/* Ambient Background Glow on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/5 flex items-center justify-center text-[var(--color-primary)] border border-[var(--color-primary)]/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6" />
              </div>
              <Sparkline 
                data={stat.history} 
                color={isNeutral ? "var(--border-level-3)" : isPositive ? "var(--color-success)" : "var(--color-error)"} 
              />
            </div>

            <div className="relative z-10">
              <p className="text-xs font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-2">
                {stat.label}
              </p>
              <div className="flex items-end gap-3">
                <h3 className="text-4xl font-black text-gradient tracking-tight">
                  {stat.value}
                </h3>
                <div className={`flex items-center text-sm font-bold pb-1.5 ${trendColor} bg-[var(--surface-active)] px-2 py-0.5 rounded-md`}>
                  {isPositive && <ArrowUpRight className="w-4 h-4 me-0.5" />}
                  {!isPositive && !isNeutral && <ArrowDownRight className="w-4 h-4 me-0.5" />}
                  {Math.abs(stat.trend)}%
                </div>
              </div>
            </div>

          </motion.div>
        )
      })}
    </motion.div>
  )
}
