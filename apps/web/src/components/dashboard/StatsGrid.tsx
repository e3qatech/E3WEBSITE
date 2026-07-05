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
            whileHover={{ y: -4 }}
            key={stat.id} 
            className="bg-bg-level-2 border border-border-default rounded-xl p-6 transition-all duration-300 hover:shadow-2 hover:border-accent relative overflow-hidden group"
          >

            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-lg bg-surface-default flex items-center justify-center text-text-primary border border-border-default shadow-sm group-hover:text-accent transition-colors">
                <Icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <Sparkline 
                data={stat.history} 
                color={isNeutral ? "var(--border-level-3)" : isPositive ? "var(--color-success)" : "var(--color-error)"} 
              />
            </div>

            <div className="relative z-10">
              <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-2">
                {stat.label}
              </p>
              <div className="flex items-end gap-3">
                <h3 className="text-3xl font-black text-text-primary tracking-tight">
                  {stat.value}
                </h3>
                <div className={`flex items-center text-xs font-bold pb-1 ${trendColor} bg-surface-default px-2 py-0.5 rounded border border-border-subtle`}>
                  {isPositive && <ArrowUpRight className="w-3.5 h-3.5 me-0.5" />}
                  {!isPositive && !isNeutral && <ArrowDownRight className="w-3.5 h-3.5 me-0.5" />}
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
