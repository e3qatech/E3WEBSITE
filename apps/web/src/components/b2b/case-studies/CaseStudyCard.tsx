"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/Badge"

export interface CaseStudy {
  id: string
  slug: string
  title: Record<string, string>
  clientName: Record<string, string>
  category: string
  year: string
  thumbnailUrl: string
  keyMetric?: {
    value: string
    label: Record<string, string>
  }
}

interface CaseStudyCardProps {
  caseStudy: CaseStudy
  locale: string
  isFeatured?: boolean
  index?: number
}

export function CaseStudyCard({ caseStudy, locale, isFeatured = false, index = 0 }: CaseStudyCardProps) {
  const isRTL = locale === 'ar'
  const title = caseStudy.title[locale] || caseStudy.title.en
  const clientName = caseStudy.clientName[locale] || caseStudy.clientName.en
  const metricLabel = caseStudy.keyMetric?.label[locale] || caseStudy.keyMetric?.label.en

  // Animations
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, delay: Math.min(index * 0.1, 0.5) } }
  }

  if (isFeatured) {
    return (
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="group relative w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-[var(--surface-default)] mb-16"
      >
        <Link href={`/${locale}/b2b/case-studies/${caseStudy.slug}`} className="flex flex-col lg:flex-row relative z-10 w-full h-full min-h-[500px]">
          {/* Image Side */}
          <div className="w-full lg:w-3/5 h-[400px] lg:h-auto overflow-hidden relative">
            <img 
              src={caseStudy.thumbnailUrl} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* View Case Study Overlay on hover */}
            <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-white text-zinc-950 font-bold px-6 py-3 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                {locale === 'ar' ? 'عرض دراسة الحالة' : 'View Case Study'}
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </span>
            </div>
          </div>
          
          {/* Content Side */}
          <div className="w-full lg:w-2/5 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[var(--surface-hover)] border-s border-t lg:border-t-0 border-[var(--border-default)]">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="default">{caseStudy.category}</Badge>
              <span className="text-sm font-bold text-[var(--text-tertiary)]">{caseStudy.year}</span>
            </div>
            
            <span className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-widest mb-2">
              {clientName}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-8 line-clamp-3">
              {title}
            </h2>

            {caseStudy.keyMetric && (
              <div className="mt-auto pt-8 border-t border-[var(--border-default)]">
                <p className="text-5xl font-black text-[var(--text-primary)] mb-1">
                  {caseStudy.keyMetric.value}
                </p>
                <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {metricLabel}
                </p>
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    )
  }

  // Standard Card
  return (
    <motion.div 
      variants={itemVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className="group relative w-full h-full flex flex-col"
    >
      <Link href={`/${locale}/b2b/case-studies/${caseStudy.slug}`} className="flex flex-col h-full">
        {/* Image */}
        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative mb-6">
          <img 
            src={caseStudy.thumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          {/* View Case Study Overlay on hover */}
          <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-white text-zinc-950 font-bold px-6 py-3 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </span>
          </div>

          <div className="absolute top-4 start-4 z-10">
            <Badge variant="default" className="bg-zinc-950/50 backdrop-blur-md text-white border-none">
              {caseStudy.category}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-bold text-[var(--color-primary)] tracking-widest uppercase">
              {clientName}
            </span>
            <span className="text-sm font-bold text-[var(--text-tertiary)]">
              {caseStudy.year}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 mb-6">
            {title}
          </h3>

          {caseStudy.keyMetric && (
            <div className="mt-auto pt-4 border-t border-[var(--border-default)]">
              <p className="text-2xl font-black text-[var(--text-primary)] mb-1">
                {caseStudy.keyMetric.value}
              </p>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                {metricLabel}
              </p>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
