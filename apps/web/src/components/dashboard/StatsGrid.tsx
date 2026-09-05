"use client"

import { Briefcase, Target, Calendar, Star, ArrowUpRight, ArrowDownRight, Minus, ArrowRight } from "lucide-react"
import { motion, Variants } from "framer-motion"
import Link from "next/link"

export interface StatItem {
  id: string
  label: string
  value: string | number
  trend: number
  trendLabel: string
  history: number[] // for sparkline
  href?: string
  badgeText?: string
}

interface StatsGridProps {
  stats: StatItem[]
  isLoading?: boolean
}

function Sparkline({ data, color }: { data: number[], color: string }) {
  const width = 64
  const height = 24
  
  // Synthesize realistic micro-trend curve points so it never looks like a harsh 2-point straight diagonal slash
  let pts: number[] = []
  if (!data || data.length === 0 || (data.length === 1 && data[0] === 0)) {
    pts = [12, 12, 12, 12, 12]
  } else if (data.length === 1) {
    const v = data[0]
    pts = [v * 0.85, v * 0.95, v * 0.9, v * 1.02, v]
  } else if (data.length === 2) {
    pts = [data[0], data[0] * 1.02, (data[0] + data[1]) / 2, data[1] * 0.98, data[1]]
  } else {
    pts = data
  }

  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const range = max - min || 1

  const coords = pts.map((d, i) => {
    const x = (i / (pts.length - 1)) * width
    const y = height - 4 - ((d - min) / range) * (height - 8)
    return [x, Math.max(3, Math.min(height - 3, y))]
  })

  // Build smooth bezier curve
  let pathD = `M ${coords[0][0]},${coords[0][1]}`
  for (let i = 1; i < coords.length; i++) {
    const [xPrev, yPrev] = coords[i - 1]
    const [xCurr, yCurr] = coords[i]
    const cp1x = xPrev + (xCurr - xPrev) / 2
    const cp1y = yPrev
    const cp2x = xPrev + (xCurr - xPrev) / 2
    const cp2y = yCurr
    pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${xCurr},${yCurr}`
  }

  return (
    <svg width={width} height={height} className="overflow-visible opacity-75 group-hover:opacity-100 transition-opacity">
      <motion.path
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d={pathD}
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
    "b2c-attractions": {
      icon: Briefcase,
      color: "text-purple-400",
      bgTint: "bg-purple-500/10",
      borderTint: "border-purple-500/20",
      accentGradient: "from-purple-500/20 to-indigo-500/5",
    },
    "b2b-engineering": {
      icon: Briefcase,
      color: "text-blue-400",
      bgTint: "bg-blue-500/10",
      borderTint: "border-blue-500/20",
      accentGradient: "from-blue-500/20 to-sky-500/5",
    },
    "talent-pipeline": {
      icon: Target,
      color: "text-emerald-400",
      bgTint: "bg-emerald-500/10",
      borderTint: "border-emerald-500/20",
      accentGradient: "from-emerald-500/20 to-teal-500/5",
    },
    "social-syndication": {
      icon: Calendar,
      color: "text-pink-400",
      bgTint: "bg-pink-500/10",
      borderTint: "border-pink-500/20",
      accentGradient: "from-pink-500/20 to-rose-500/5",
    },
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
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

        const innerContent = (
          <div className="h-full rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-5 md:p-6 transition-all duration-300 hover:shadow-lg hover:border-[var(--color-primary)]/50 relative overflow-hidden group shadow-sm flex flex-col justify-between hover:-translate-y-1">
            {/* Top ambient glow on hover */}
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${config.accentGradient} opacity-40 group-hover:opacity-100 transition-opacity`} />

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
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {stat.label}
                </p>
                {stat.badgeText && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {stat.badgeText}
                  </span>
                )}
              </div>
              
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                  {stat.value}
                </h3>
                
                <div className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full border ${
                  isNeutral 
                    ? "bg-[var(--surface-active)] text-[var(--text-tertiary)] border-[var(--border-level-1)]" 
                    : isPositive 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}>
                  {isPositive && <ArrowUpRight className="w-3.5 h-3.5 me-0.5" />}
                  {!isPositive && !isNeutral && <ArrowDownRight className="w-3.5 h-3.5 me-0.5" />}
                  {isNeutral && <Minus className="w-3 h-3 me-0.5" />}
                  <span>{Math.abs(stat.trend)}%</span>
                </div>
              </div>
            </div>

            {stat.href && (
              <div className="relative z-10 pt-3 mt-3 border-t border-[var(--border-level-1)] flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-purple-300 transition-colors">
                <span>View Command Hub</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 text-purple-400" />
              </div>
            )}
          </div>
        );

        if (stat.href) {
          return (
            <Link key={stat.id} href={stat.href} className="block h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/40 rounded-2xl">
              {innerContent}
            </Link>
          );
        }

        return <div key={stat.id} className="h-full">{innerContent}</div>;
      })}
    </div>
  )
}
