"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Calendar } from 'lucide-react'

interface Act1ImagineItProps {
  content: any
  locale: string
}

export function Act1ImagineIt({ content, locale }: Act1ImagineItProps) {
  const isAr = locale === 'ar'
  const act = content?.act1 || {}

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-[#090314] via-[#0f0728] to-[#090314] px-4 sm:px-6 lg:px-8 py-20 text-white border-b border-purple-950/40">
      {/* Background Ambient Glow & Starfield Particles */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(168,85,247,0.15),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.12),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 my-auto">
        {/* Subtle Brand Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/50 text-purple-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-lg shadow-purple-950/50"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>{isAr ? "من الخيال إلى الذكرى — E3" : "FROM IMAGINATION TO MEMORY — E3"}</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight font-sans"
        >
          {isAr ? (act.headlineAr || "أيام تمرّ… وأيام تتحول إلى حكايات.") : (act.headlineEn || "Some days pass. Others become stories.")}
        </motion.h1>

        {/* Supporting Copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 font-light leading-relaxed"
        >
          {isAr
            ? (act.subtextAr || "ادخل عالمًا من الوجهات الترفيهية والتجارب الحية واللحظات التي لا تُنسى مع E3.")
            : (act.subtextEn || "Enter a world of attractions, live experiences and unforgettable moments created by E3.")}
        </motion.p>

        {/* Dual Instant Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          {/* Primary CTA */}
          <Link
            href={act.primaryCtaUrl || "#bring-it-to-life"}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-extrabold text-base shadow-xl shadow-purple-950/80 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>{isAr ? (act.primaryCtaAr || "ابدأ حكايتك") : (act.primaryCtaEn || "Begin Your Story")}</span>
            <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
          </Link>

          {/* Secondary CTA */}
          <Link
            href={act.secondaryCtaUrl || "#living-day"}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 hover:text-white font-bold text-base backdrop-blur-md transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? (act.secondaryCtaAr || "اكتشف فعاليات اليوم") : (act.secondaryCtaEn || "See What's On Today")}</span>
          </Link>
        </motion.div>
      </div>

      {/* Floating Micro Highlights Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full text-center border-t border-purple-900/30 pt-8"
      >
        <div>
          <span className="block text-2xl font-extrabold text-purple-400">4+</span>
          <span className="text-xs text-slate-400 font-medium">{isAr ? "وجهات ترفيهية مغلقة" : "Flagship Destinations"}</span>
        </div>
        <div>
          <span className="block text-2xl font-extrabold text-blue-400">5,000+</span>
          <span className="text-xs text-slate-400 font-medium">{isAr ? "متر مربع من المطاط" : "Sqm Inflatable Dunes"}</span>
        </div>
        <div>
          <span className="block text-2xl font-extrabold text-emerald-400">100%</span>
          <span className="text-xs text-slate-400 font-medium">{isAr ? "تجارب حية آمنة" : "Qatar Family Entertainment"}</span>
        </div>
        <div>
          <span className="block text-2xl font-extrabold text-pink-400">24/7</span>
          <span className="text-xs text-slate-400 font-medium">{isAr ? "حجز تذاكر وحفلات" : "Instant Digital Booking"}</span>
        </div>
      </motion.div>
    </section>
  )
}
