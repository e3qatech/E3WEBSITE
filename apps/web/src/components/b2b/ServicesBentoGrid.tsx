"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Box, Zap, Cog, Maximize, Target, Activity, Star, Layout, Shield } from "lucide-react"

interface ServiceData {
  id: string
  slug: string
  name: Record<string, string>
  shortDesc: Record<string, string>
}

interface ServicesBentoGridProps {
  services: ServiceData[]
  locale: string
}

// Fallback icons array for dynamic services without explicit icons
const ICONS = [Box, Zap, Cog, Maximize, Target, Activity, Star, Layout, Shield]

export function ServicesBentoGrid({ services, locale }: ServicesBentoGridProps) {
  const isRTL = locale === 'ar'

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  }

  return (
    <motion.div 
      variants={containerVariants as any}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[250px]"
    >
      {services.map((service, index) => {
        // Determine grid span based on index to create a varied Bento layout
        // Mobile: all are col-span-1
        // Desktop:
        // Item 0: 2x2
        // Item 1, 2: 1x1
        // Item 3: 2x1 (horizontal)
        // Others: 1x1
        let gridClass = "col-span-1 row-span-1"
        if (index === 0) {
          gridClass = "md:col-span-2 md:row-span-2"
        } else if (index === 3) {
          gridClass = "md:col-span-2 row-span-1"
        }

        const Icon = ICONS[index % ICONS.length]
        const displayName = service.name[locale] || service.name.en
        const displayDesc = service.shortDesc?.[locale] || service.shortDesc?.en

        return (
          <motion.div 
            key={service.id}
            variants={itemVariants as any}
            className={`group relative flex flex-col justify-between p-8 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-default)] transition-all duration-300 hover:shadow-xl ${gridClass} overflow-hidden`}
          >
            {/* Hover Gradient Border Effect (Subtle) */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-default)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[var(--color-primary)]/50 transition-all duration-300">
              <Icon className="w-7 h-7 text-[var(--color-primary)]" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-end">
              <h3 className={`font-black text-[var(--text-primary)] mb-3 ${index === 0 ? 'text-3xl md:text-4xl' : 'text-xl'}`}>
                {displayName}
              </h3>
              <p className={`text-[var(--text-secondary)] line-clamp-3 mb-6 ${index === 0 ? 'text-lg' : 'text-sm'}`}>
                {displayDesc}
              </p>

              <Link 
                href={`/${locale}/b2b/services/${service.slug}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] hover:text-[var(--text-primary)] transition-colors mt-auto w-fit"
              >
                <span>{locale === 'ar' ? 'اعرف المزيد' : 'Learn More'}</span>
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </Link>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
