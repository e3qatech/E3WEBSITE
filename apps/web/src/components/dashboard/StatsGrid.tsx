"use client"

import { Briefcase, Target, Calendar, Star, ArrowUpRight, ArrowDownRight } from "lucide-react"

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
      <polyline
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
          <div key={i} className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-[var(--surface-hover)] rounded-xl" />
              <div className="w-16 h-6 bg-[var(--surface-hover)] rounded-full" />
            </div>
            <div className="space-y-3">
              <div className="w-24 h-4 bg-[var(--surface-hover)] rounded" />
              <div className="w-16 h-8 bg-[var(--surface-hover)] rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
          <div key={stat.id} className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 hover:border-[var(--color-primary)]/30 transition-colors">
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                <Icon className="w-6 h-6" />
              </div>
              <Sparkline 
                data={stat.history} 
                color={isNeutral ? "var(--border-default)" : isPositive ? "var(--color-success)" : "var(--color-error)"} 
              />
            </div>

            <div>
              <p className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <div className="flex items-end gap-3">
                <h3 className="text-3xl font-black text-[var(--text-primary)]">
                  {stat.value}
                </h3>
                <div className={`flex items-center text-sm font-bold pb-1 ${trendColor}`}>
                  {isPositive && <ArrowUpRight className="w-4 h-4 me-0.5" />}
                  {!isPositive && !isNeutral && <ArrowDownRight className="w-4 h-4 me-0.5" />}
                  {Math.abs(stat.trend)}%
                </div>
              </div>
            </div>

          </div>
        )
      })}
    </div>
  )
}
