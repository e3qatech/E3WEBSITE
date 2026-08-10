"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, ChevronRight, CheckCircle2 } from 'lucide-react'

interface Act2BringItToLifeProps {
  content: any
  locale: string
}

export function Act2BringItToLife({ content, locale }: Act2BringItToLifeProps) {
  const isAr = locale === 'ar'
  const act = content?.act2 || {}
  const steps = act.steps || []
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  const activeStep = steps[activeStepIndex] || steps[0] || {}

  // Media presets for the 6 step evolution
  const stepMediaList = [
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1200&auto=format&fit=crop", // Sketch
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop", // Wireframe blueprint
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop", // Light & Materials
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop", // Fabrication
    "https://images.unsplash.com/photo-1566454825481-4e48f80aa4d7?q=80&w=1200&auto=format&fit=crop", // Guests entering
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200&auto=format&fit=crop"  // Fully alive
  ]

  return (
    <section id="bring-it-to-life" className="relative py-24 bg-[#070310] border-b border-purple-950/40 text-white overflow-hidden">
      {/* Structural Wireframe Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/30 bg-sky-950/40 text-sky-400 text-xs font-bold uppercase tracking-widest">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>{isAr ? "الفصل الثاني — تحويل الأفكار إلى واقع" : "ACT II — IDEAS TO LIFE"}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {isAr ? (act.headlineAr || "لا نكتفي بتخيّل المتعة… بل نحوّلها إلى واقع.") : (act.headlineEn || "We don’t just imagine fun. We bring it to life.")}
          </h2>
        </div>

        {/* Interactive 6-Step Evolution Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
          {/* Left Column — Interactive Step Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            {steps.map((step: any, idx: number) => {
              const isActive = idx === activeStepIndex
              return (
                <button
                  key={step.id || idx}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`w-full text-start p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'border-sky-500 bg-sky-950/40 text-white shadow-lg shadow-sky-950/50 translate-x-1'
                      : 'border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isActive ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">
                        {isAr ? step.titleAr : step.titleEn}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1">
                        {isAr ? step.descAr : step.descEn}
                      </div>
                    </div>
                  </div>
                  {isActive ? (
                    <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
                  ) : (
                    <ChevronRight className={`w-4 h-4 text-slate-600 ${isAr ? 'rotate-180' : ''}`} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Right Column — Transformation Visual Display (7 Cols) */}
          <div className="lg:col-span-7 relative aspect-video rounded-3xl overflow-hidden border border-sky-500/30 bg-slate-950 shadow-2xl group">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStepIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <img
                  src={stepMediaList[activeStepIndex] || stepMediaList[0]}
                  alt={activeStep.titleEn || "Transformation Stage"}
                  className="w-full h-full object-cover"
                />
                {/* Wireframe Overlay Effect */}
                {activeStepIndex < 2 && (
                  <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-[2px] border-4 border-dashed border-sky-400/40 mix-blend-overlay" />
                )}
                {/* Gradient Shading */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                {/* Active Stage Label Overlay */}
                <div className="absolute bottom-6 start-6 end-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md">
                  <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">
                    {isAr ? `المرحلة ٠${activeStepIndex + 1} من ٠٦` : `STAGE 0${activeStepIndex + 1} OF 06`}
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-1">
                    {isAr ? activeStep.titleAr : activeStep.titleEn}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {isAr ? activeStep.descAr : activeStep.descEn}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
