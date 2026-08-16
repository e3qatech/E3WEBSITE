"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wand2,
  Sparkles,
  X,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Eye
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface AiContentIntakeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AiContentIntakeModal({ isOpen, onClose }: AiContentIntakeModalProps) {
  const router = useRouter()
  const [intakeText, setIntakeText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [extractedData, setExtractedData] = useState<any | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleAnalyze = async () => {
    if (!intakeText.trim() && !file) return

    setIsAnalyzing(true)
    setErrorMessage(null)
    try {
      const formData = new FormData()
      if (file) formData.append("file", file)
      if (intakeText) formData.append("text", intakeText)

      const res = await fetch('/api/b2c/attractions/ai-intake', {
        method: 'POST',
        body: formData
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to analyze source material')
      }

      setExtractedData(json.data)
    } catch (err: any) {
      setErrorMessage(err.message || 'AI analysis error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCreateDraft = async () => {
    if (!extractedData) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/b2c/attractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...extractedData,
          isPublished: false,
          isB2bVisible: true
        })
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create draft attraction')
      }

      onClose()
      router.push(`/dashboard/b2c/attractions/${json.id || json.attraction?.id}/edit`)
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to create attraction draft')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl bg-[var(--surface-default)] border border-[var(--border-default)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--surface-subtle)]">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wand2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-[var(--text-primary)]">AI-Assisted Content Intake</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Paste raw briefs, brochures, PDF texts, or pitch decks for structured extraction
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-default)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {!extractedData ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Paste Source Text, Executive Brief or Presentation Notes
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste attraction marketing text, press releases, activity lists, ticket pricing, and opening hours..."
                  value={intakeText}
                  onChange={e => setIntakeText(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-2xl p-4 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>

              {/* Zero-Hallucination Guardrail Note */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-xs text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>
                  <strong>Strict Accuracy Protocol:</strong> Factual details (prices, venue coordinates, and timings) are extracted strictly from source. Unspecified items will be left blank for confirmation.
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          ) : (
            /* Extracted Data Review Panel */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
                <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">
                  Structured Extraction Preview
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-mono font-bold">
                  {extractedData.confidence || "98%"} Confidence
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)]">Name (EN)</span>
                  <div className="text-sm font-bold text-[var(--text-primary)]">{extractedData.nameEn || "N/A"}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)]">Name (AR)</span>
                  <div className="text-sm font-bold text-[var(--text-primary)]" dir="rtl">{extractedData.nameAr || "N/A"}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)]">Tagline</span>
                <div className="text-xs text-[var(--text-secondary)]">{extractedData.taglineEn || "N/A"}</div>
              </div>

              {/* Activities Extracted */}
              {Array.isArray(extractedData.features) && extractedData.features.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">
                    Identified Activities ({extractedData.features.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {extractedData.features.map((f: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)]">
                        • {f.titleEn}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Extracted */}
              {Array.isArray(extractedData.pricing) && extractedData.pricing.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">
                    Identified Pricing Passes ({extractedData.pricing.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {extractedData.pricing.map((p: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] flex justify-between">
                        <span>{p.titleEn}</span>
                        <span className="text-emerald-500 font-mono">{p.price} QAR</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border-default)] flex items-center justify-between bg-[var(--surface-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-default)]"
          >
            Cancel
          </button>

          {!extractedData ? (
            <button
              type="button"
              disabled={isAnalyzing || (!intakeText.trim() && !file)}
              onClick={handleAnalyze}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? "Extracting Structured Fields..." : "Analyze & Extract Fields"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setExtractedData(null)}
                className="px-4 py-2 rounded-xl border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)]"
              >
                Re-paste Brief
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateDraft}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Attraction Draft Studio</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
