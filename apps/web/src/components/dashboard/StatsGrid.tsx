"use client"

import { Briefcase, Target, Calendar, Star, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
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
  
  // If only 1 data point, create a smooth subtle 2-point visual line
  const normalizedData = data.length === 1 ? [data[0] * 0.9, data[0]] : data
  
  const min = Math.min(...normalizedData)
  const max = Math.max(...normalizedData)
  const range = max - min || (max > 0 ? max : 1)
  
  const width = 64
  const height = 28
  
  const points = normalizedData.map((d, i) => {
    const x = (i / (normalizedData.length - 1)) * width
    const y = height - 4 - ((d - min) / range) * (height - 8)
    return `${x},${Math.max(2, Math.min(height - 2, y))}`
  }).join(" ")

  return (
    <svg width={width} height={height} className="overflow-visible opacity-80 group-hover:opacity-100 transition-opacity">
      <motion.polyline
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
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
      staggerChildren: 0.08
    }
  }
}

const itemVars: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 26 } }
}

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  
  const STAT_CONFIGS: Record<string, {
    icon: any;
    color: string;
    bgTint: string;
    borderTint: string;
    accentGradient: string;
  }> = {
    "active-projects": {
      icon: Briefcase,
      color: "text-emerald-500",
      bgTint: "bg-emerald-500/10",
      borderTint: "border-emerald-500/20",
      accentGradient: "from-emerald-500/20 to-teal-500/5",
    },
    "new-leads": {
      icon: Target,
      color: "text-[var(--color-primary)]",
      bgTint: "bg-[var(--color-primary)]/10",
      borderTint: "border-[var(--color-primary)]/20",
      accentGradient: "from-purple-500/20 to-pink-500/5",
    },
    "upcoming-events": {
      icon: Calendar,
      color: "text-sky-500",
      bgTint: "bg-sky-500/10",
      borderTint: "border-sky-500/20",
      accentGradient: "from-sky-500/20 to-blue-500/5",
    },
    "feedback-score": {
      icon: Star,
      color: "text-amber-500",
      bgTint: "bg-amber-500/10",
      borderTint: "border-amber-500/20",
      accentGradient: "from-amber-500/20 to-orange-500/5",
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-6 animate-pulse shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-11 h-11 bg-[var(--surface-active)] rounded-xl" />
              <div className="w-16 h-6 bg-[var(--surface-active)] rounded-full" />
            </div>
            <div className="space-y-3 mt-4">
              <div className="w-24 h-3.5 bg-[var(--surface-active)] rounded" />
              <div className="w-20 h-8 bg-[var(--surface-active)] rounded-lg" />
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
    >
      {stats.map((stat) => {
        const config = STAT_CONFIGS[stat.id] || STAT_CONFIGS["active-projects"]
        const Icon = config.icon
        const isPositive = stat.trend > 0
        const isNeutral = stat.trend === 0
        
        const sparklineColor = isNeutral 
          ? "var(--text-tertiary)" 
          : isPositive 
            ? "var(--color-success)" 
            : "var(--color-error)"

        return (
          <motion.div 
            variants={itemVars}
            whileHover={{ y: -3 }}
            key={stat.id} 
            className="rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-5 md:p-6 transition-all duration-300 hover:shadow-md hover:border-[var(--color-primary)]/40 relative overflow-hidden group shadow-sm flex flex-col justify-between"
          >
            {/* Top ambient glow on hover */}
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${config.accentGradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

            <div className="relative z-10 flex justify-between items-start mb-4">
              <div className={`w-11 h-11 rounded-xl ${config.bgTint} ${config.color} border ${config.borderTint} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" strokeWidth={2.2} />
              </div>
              
              <div className="flex flex-col items-end">
                <Sparkline 
                  data={stat.history} 
                  color={sparklineColor} 
                />
              </div>
            </div>

            <div className="relative z-10 space-y-2">
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                {stat.label}
              </p>
              
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight font-mono">
                  {stat.value}
                </h3>
                
                <div className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full border ${
                  isNeutral 
                    ? "bg-[var(--surface-active)] text-[var(--text-tertiary)] border-[var(--border-level-1)]" 
                    : isPositive 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                }`}>
                  {isPositive && <ArrowUpRight className="w-3.5 h-3.5 me-0.5" />}
                  {!isPositive && !isNeutral && <ArrowDownRight className="w-3.5 h-3.5 me-0.5" />}
                  {isNeutral && <Minus className="w-3 h-3 me-0.5" />}
                  <span>{Math.abs(stat.trend)}%</span>
                </div>
              </div>
            </div>

          </motion.div>
        )
      })}
    </motion.div>
  )
}
