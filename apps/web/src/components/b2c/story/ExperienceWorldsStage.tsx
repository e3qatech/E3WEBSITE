/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Users, Clock, Ticket } from 'lucide-react'

interface ExperienceWorldsStageProps {
  content: any
  locale: string
}

export function ExperienceWorldsStage({ content, locale }: ExperienceWorldsStageProps) {
  const isAr = locale === 'ar'
  const worlds = content?.act3Worlds || []
  const [selectedIndex, setSelectedIndex] = useState(0)

  const activeWorld = worlds[selectedIndex] || worlds[0] || {}

  return (
    <section id="attraction-worlds" className="relative min-h-screen py-20 bg-[#080214] text-white flex flex-col justify-center overflow-hidden border-b border-purple-950/40">
      {/* Dynamic Background Material Accent Glow */}
      <div
        className="absolute inset-0 opacity-25 transition-colors duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 60% 40%, ${activeWorld.accentColor || '#10b981'}, transparent 70%)`
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
              {isAr ? "عوالم قطر الترفيهية" : "FLAGSHIP ENTERTAINMENT WORLDS"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {isAr ? "عوالم إي ثري الترفيهية بقطر" : "E3 Featured Attraction Worlds"}
            </h2>
          </div>

          {/* Attraction World Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {worlds.map((w: any, idx: number) => {
              const isActive = idx === selectedIndex
              return (
                <button
                  key={w.id || idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-lg scale-105'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {isAr ? w.nameAr : w.nameEn}
                </button>
              )
            })}
          </div>
        </div>

        {/* Viewport Attraction Showcase Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeWorld.id || selectedIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            {/* Left Media Stage (7 Cols) */}
            <div className="lg:col-span-7 relative aspect-video rounded-2xl overflow-hidden border border-slate-800 group bg-slate-950">
              <img
                src={activeWorld.mediaUrl}
                alt={activeWorld.nameEn}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

              <div className="absolute top-4 start-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-xs font-bold text-emerald-400 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{isAr ? activeWorld.statusAr : activeWorld.statusEn}</span>
              </div>

              <div
                className="absolute bottom-4 end-4 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-slate-950 shadow-md"
                style={{ backgroundColor: activeWorld.accentColor || '#10b981' }}
              >
                {activeWorld.materialType || 'E3 WORLD'}
              </div>
            </div>

            {/* Right Info & CTAs (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span
                  className="text-xs font-mono font-extrabold uppercase tracking-widest block mb-1"
                  style={{ color: activeWorld.accentColor || '#10b981' }}
                >
                  {isAr ? activeWorld.locationAr : activeWorld.locationEn}
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  {isAr ? activeWorld.nameAr : activeWorld.nameEn}
                </h3>
                <p className="text-sm text-slate-300 font-light mt-2 leading-relaxed">
                  {isAr ? activeWorld.taglineAr : activeWorld.taglineEn}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                    <Users className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">{isAr ? "الفئة المستهدفة" : "Audience"}</span>
                    <span className="text-xs font-bold text-white">{isAr ? activeWorld.audienceAr : activeWorld.audienceEn}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">{isAr ? "أوقات العمل" : "Timings"}</span>
                    <span className="text-xs font-bold text-white">{isAr ? activeWorld.timingsAr : activeWorld.timingsEn}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">{isAr ? "تبدأ الاسعار من" : "Starting From"}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">{activeWorld.price || 65}</span>
                    <span className="text-xs font-bold text-emerald-400">{activeWorld.currency || 'QAR'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/b2c/attractions/${activeWorld.slug || activeWorld.id}`}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs transition-all shadow-lg hover:scale-105 cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>{isAr ? activeWorld.ctaAr : activeWorld.ctaEn}</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
