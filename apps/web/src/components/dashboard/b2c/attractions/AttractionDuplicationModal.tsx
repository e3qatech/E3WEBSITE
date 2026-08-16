"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Copy,
  Sparkles,
  X,
  Layers,
  Check,
  Calendar,
  Building,
  Ticket,
  Image as ImageIcon,
  HelpCircle,
  Tag,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface AttractionDuplicationModalProps {
  isOpen: boolean
  onClose: () => void
  sourceAttraction?: any
  availableAttractions: any[]
}

const TEMPLATE_PRESETS = [
  {
    id: "FEC",
    titleEn: "Permanent Family Entertainment Center (FEC)",
    titleAr: "مركز ترفيهي عائلي دائم",
    desc: "Includes year-round operating rules, 8+ activity zones, and general + VIP pricing passes.",
    format: "FEC"
  },
  {
    id: "MALL_ATTRACTION",
    titleEn: "Mall Anchor Attraction",
    titleAr: "وجهة رئيسية داخل مجمع تجاري",
    desc: "Includes mall floor level context, drop-off directions, and hourly ticket add-ons.",
    format: "MALL_ATTRACTION"
  },
  {
    id: "SEASONAL_ACTIVATION",
    titleEn: "Seasonal Holiday Activation / Pop-Up",
    titleAr: "فعالية موسمية / تجربة مؤقتة",
    desc: "Includes defined start/end dates, pre-sale launch windows, and temporary operating notices.",
    format: "SEASONAL_ACTIVATION"
  },
  {
    id: "TOURING_EXPERIENCE",
    titleEn: "Touring / Traveling Exhibition",
    titleAr: "معرض / تجربة متنقلة",
    desc: "Includes multi-city tour routing, timed entry slots, and branded merchandise zones.",
    format: "TOURING_EXPERIENCE"
  },
  {
    id: "FREE_EVENT",
    titleEn: "Free Public Cultural Event",
    titleAr: "فعالية عامة مجانية",
    desc: "Open public admission, registration RSVP booking link, and partner sponsorship credits.",
    format: "FREE_EVENT"
  }
]

export function AttractionDuplicationModal({
  isOpen,
  onClose,
  sourceAttraction,
  availableAttractions
}: AttractionDuplicationModalProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'DUPLICATE' | 'NEW_EDITION' | 'TEMPLATE'>('DUPLICATE')
  const [selectedSourceId, setSelectedSourceId] = useState<string>(sourceAttraction?.id || availableAttractions[0]?.id || '')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('FEC')

  const [newNameEn, setNewNameEn] = useState("")
  const [newNameAr, setNewNameAr] = useState("")
  const [newSlug, setNewSlug] = useState("")

  // Selective cloning options
  const [copyActivities, setCopyActivities] = useState(true)
  const [copyPricing, setCopyPricing] = useState(true)
  const [copyGallery, setCopyGallery] = useState(true)
  const [copyFaqs, setCopyFaqs] = useState(true)
  const [copyPartners, setCopyPartners] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleDuplicate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNameEn.trim() || !newSlug.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/b2c/attractions/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: mode === 'TEMPLATE' ? null : selectedSourceId,
          templateType: mode === 'TEMPLATE' ? selectedTemplateId : null,
          mode,
          nameEn: newNameEn.trim(),
          nameAr: newNameAr.trim() || newNameEn.trim(),
          slug: newSlug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          options: {
            copyActivities,
            copyPricing,
            copyGallery,
            copyFaqs,
            copyPartners
          }
        })
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to duplicate attraction')
      }

      onClose()
      router.push(`/dashboard/b2c/attractions/${json.id}/edit`)
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Duplication error')
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
        className="w-full max-w-2xl bg-[var(--surface-default)] border border-[var(--border-default)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--surface-subtle)]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Copy className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-[var(--text-primary)]">
                {mode === 'TEMPLATE' ? 'Create from Industry Template' : mode === 'NEW_EDITION' ? 'Create New Season / Edition' : 'Duplicate Attraction'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Clone configuration, activities, and pricing passes without starting from scratch
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

        {/* Mode Switcher Tabs */}
        <div className="p-4 border-b border-[var(--border-default)] flex items-center gap-2 bg-[var(--surface-default)]">
          <button
            type="button"
            onClick={() => setMode('DUPLICATE')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center",
              mode === 'DUPLICATE' ? "bg-[var(--surface-subtle)] border border-[var(--border-default)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            )}
          >
            Duplicate Attraction
          </button>
          <button
            type="button"
            onClick={() => setMode('NEW_EDITION')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center",
              mode === 'NEW_EDITION' ? "bg-[var(--surface-subtle)] border border-[var(--border-default)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            )}
          >
            Create New Edition (e.g. 2026)
          </button>
          <button
            type="button"
            onClick={() => setMode('TEMPLATE')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center",
              mode === 'TEMPLATE' ? "bg-[var(--surface-subtle)] border border-[var(--border-default)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            )}
          >
            Start from Template
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleDuplicate} className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Source Selector */}
          {mode !== 'TEMPLATE' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Source Attraction</label>
              <select
                value={selectedSourceId}
                onChange={e => {
                  setSelectedSourceId(e.target.value)
                  const chosen = availableAttractions.find(a => a.id === e.target.value)
                  if (chosen) {
                    if (mode === 'NEW_EDITION') {
                      setNewNameEn(`${chosen.nameEn || chosen.name?.en || ''} 2026`)
                      setNewNameAr(`${chosen.nameAr || chosen.name?.ar || ''} ٢٠٢٦`)
                      setNewSlug(`${chosen.slug}-2026`)
                    } else {
                      setNewNameEn(`${chosen.nameEn || chosen.name?.en || ''} (Copy)`)
                      setNewNameAr(`${chosen.nameAr || chosen.name?.ar || ''} (نسخة)`)
                      setNewSlug(`${chosen.slug}-copy`)
                    }
                  }
                }}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none font-bold"
              >
                {availableAttractions.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.nameEn || a.name?.en} ({a.slug})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Template Cards */
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Choose Attraction Template</label>
              <div className="grid grid-cols-1 gap-2.5">
                {TEMPLATE_PRESETS.map(tpl => (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setSelectedTemplateId(tpl.id)
                      setNewNameEn(`New ${tpl.titleEn.split('(')[0].trim()}`)
                      setNewSlug(tpl.id.toLowerCase().replace(/_/g, '-'))
                    }}
                    className={cn(
                      "p-3.5 rounded-2xl border cursor-pointer transition-all",
                      selectedTemplateId === tpl.id
                        ? "bg-purple-500/10 border-purple-500/40 text-[var(--text-primary)]"
                        : "bg-[var(--surface-subtle)] border-[var(--border-default)] hover:border-[var(--border-hover)]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{tpl.titleEn}</span>
                      {selectedTemplateId === tpl.id && <Check className="w-4 h-4 text-purple-500" />}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1">{tpl.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-default)]">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">New Name (EN) *</label>
              <input
                type="text"
                required
                placeholder="e.g. InflataCity 2026"
                value={newNameEn}
                onChange={e => {
                  setNewNameEn(e.target.value)
                  if (!newSlug) {
                    setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                  }
                }}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">الاسم الجديد (العربية)</label>
              <input
                type="text"
                dir="rtl"
                placeholder="مثال: إنفلاتا سيتي ٢٠٢٦"
                value={newNameAr}
                onChange={e => setNewNameAr(e.target.value)}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">New URL Slug *</label>
            <input
              type="text"
              required
              placeholder="inflatacity-2026"
              value={newSlug}
              onChange={e => setNewSlug(e.target.value)}
              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none font-mono font-bold"
            />
          </div>

          {/* Selective Cloning Checkboxes */}
          <div className="space-y-3 pt-2 border-t border-[var(--border-default)]">
            <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Components to Clone</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={copyActivities}
                  onChange={e => setCopyActivities(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="font-bold">What&apos;s Inside Activities</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={copyPricing}
                  onChange={e => setCopyPricing(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="font-bold">Pricing Passes</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={copyGallery}
                  onChange={e => setCopyGallery(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="font-bold">Photo Gallery</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={copyFaqs}
                  onChange={e => setCopyFaqs(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="font-bold">FAQ Accordions</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={copyPartners}
                  onChange={e => setCopyPartners(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="font-bold">Partner Logos</span>
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? "Creating..." : "Create Attraction"}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
