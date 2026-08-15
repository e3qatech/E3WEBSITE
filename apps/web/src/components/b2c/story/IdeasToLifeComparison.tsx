"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ChevronRight, Layers } from 'lucide-react'
import { useState } from 'react'

interface IdeasToLifeComparisonProps {
  content: any
  locale: string
}

import { resolveMediaType } from '@/lib/media-resolver'

export function IdeasToLifeComparison({ content, locale }: IdeasToLifeComparisonProps) {
  const isAr = locale === 'ar'
  const act = content?.act2 || {}
  const steps = act.steps || []
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  const activeStep = steps[activeStepIndex] || steps[0] || {}

  // CMS-first: each step has a mediaUrl field; these are only used if step.mediaUrl is empty
  const _stepMediaFallbacks: string[] = []

  return (
    <section id="bring-it-to-life" className="relative py-24 bg-[var(--bg-level-1)] border-b border-[var(--border-level-2)] text-[var(--text-primary)] overflow-hidden transition-colors duration-300">
      {/* Structural Wireframe Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-level-2)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-level-2)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
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
                  onMouseEnter={() => setActiveStepIndex(idx)}
                  className={`w-full text-start p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'border-sky-500 bg-sky-500/15 text-[var(--text-primary)] shadow-lg shadow-sky-500/20 translate-x-1'
                      : 'border-[var(--border-level-2)] bg-[var(--surface-default)] text-[var(--text-secondary)] hover:border-sky-500/50 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-bold text-sm text-[var(--text-primary)]">
                        {isAr ? step.titleAr : step.titleEn}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] line-clamp-1">
                        {isAr ? step.descAr : step.descEn}
                      </div>
                    </div>
                  </div>
                  {isActive ? (
                    <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" />
                  ) : (
                    <ChevronRight className={`w-4 h-4 text-[var(--text-tertiary)] ${isAr ? 'rotate-180' : ''}`} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Right Column — Transformation Visual Display (7 Cols) */}
          <div className="lg:col-span-7 relative aspect-video rounded-3xl overflow-hidden border border-sky-500/30 bg-[var(--surface-default)] shadow-2xl group">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStepIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                {activeStep.mediaUrl ? (
                  resolveMediaType({ url: activeStep.mediaUrl, explicitType: activeStep?.mediaType || undefined }) === 'VIDEO' ? (
                    <video
                      key={activeStep.mediaUrl}
                      src={activeStep.mediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      key={activeStep.mediaUrl}
                      src={activeStep.mediaUrl}
                      alt={activeStep.titleEn || "Transformation Stage"}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--surface-hover)] text-[var(--text-secondary)] text-xs font-mono p-6 text-center space-y-2 border border-[var(--border-level-2)]">
                    <Layers className="w-8 h-8 text-sky-500/40 animate-pulse" />
                    <span>Upload stage visual media from Ideas to Life Content Manager in CMS</span>
                  </div>
                )}
                {activeStepIndex < 2 && (
                  <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[2px] border-4 border-dashed border-sky-400/40 mix-blend-overlay" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)]/90 via-[var(--surface-default)]/30 to-transparent" />

                <div className="absolute bottom-6 start-6 end-6 p-4 rounded-2xl bg-[var(--surface-default)]/90 border border-[var(--border-level-2)] backdrop-blur-md shadow-lg">
                  <h3 className="text-xl font-extrabold text-[var(--text-primary)] mt-1">
                    {isAr ? activeStep.titleAr : activeStep.titleEn}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
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
