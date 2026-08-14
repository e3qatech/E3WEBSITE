"use client"

import { motion } from 'framer-motion'
import { Sparkles, Ticket } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { localizeHref } from '@/lib/url-helper'

interface StoryTrailControlProps {
  currentStoryLabelEn?: string
  currentStoryLabelAr?: string
  currentWorldNameEn?: string
  currentWorldNameAr?: string
  locale?: string
}

export function StoryTrailControl({
  currentStoryLabelEn = "Drive",
  currentStoryLabelAr = "قيادة",
  currentWorldNameEn = "Kids City Driving School",
  currentWorldNameAr = "مدينة قيادة الأطفال",
  locale = "en"
}: StoryTrailControlProps) {
  const isAr = locale === 'ar'
  const [_minimized, _setMinimized] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed bottom-6 ${isAr ? 'left-6' : 'right-6'} z-30 transition-all duration-300 pointer-events-auto`}
    >
      <div className="flex items-center gap-3 p-2.5 rounded-2xl border border-purple-500/40 bg-slate-950/90 backdrop-blur-xl shadow-2xl shadow-purple-950/80 text-white">
        {/* Story Tag Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>{isAr ? currentStoryLabelAr : currentStoryLabelEn}</span>
        </div>

        {/* Current Active Attraction Name */}
        <div className="hidden sm:block text-xs font-bold text-slate-200 border-s border-slate-800 ps-3 pe-2">
          {isAr ? currentWorldNameAr : currentWorldNameEn}
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2">
          <a
            href="#story-discovery"
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            {isAr ? "تغيير الحكاية" : "Change Story"}
          </a>

          <Link
            href={localizeHref('/b2c/calendar', locale)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-md cursor-pointer"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>{isAr ? "احجز الآن" : "Book Current"}</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
