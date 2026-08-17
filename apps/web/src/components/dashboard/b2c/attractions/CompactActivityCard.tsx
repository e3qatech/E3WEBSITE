"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Copy,
  Trash2,
  Languages,
  Sparkles,
  Tag,
  Clock,
  Zap,
  Users,
  ShieldAlert,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Plus
} from "lucide-react"
import { MediaUploader } from "@/components/ui/MediaUploader"
import { cn } from "@/lib/utils"

export type ActivityContentType = 'ACTIVITY' | 'ZONE' | 'SHOW' | 'DINING' | 'RETAIL' | 'SERVICE'

export interface ActivityItem {
  id?: string
  titleEn: string
  titleAr: string
  descriptionEn?: string
  descriptionAr?: string
  imageUrl?: string
  iconUrl?: string
  contentType: ActivityContentType
  highlightType?: string
  primaryStoryTypeId?: string
  secondaryStoryTypeIds?: string[]
  storyTypeIds?: string[] // Legacy compat
  targetAudience?: string[] // 'KIDS' | 'TEENS' | 'ADULTS' | 'FAMILY'
  intensityLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'
  durationMinutes?: number
  minAge?: number
  minHeightCm?: number
  linkedBrandId?: string
  showBrandLogo?: boolean
  logoVariant?: string
  ctaLabelEn?: string
  ctaLabelAr?: string
  ctaUrl?: string
  isPublished?: boolean
  orderIndex?: number
}

interface CompactActivityCardProps {
  activity: ActivityItem
  index: number
  availableStoryTypes: any[]
  availableBrands: any[]
  availableLocations?: any[]
  bilingualView: 'BOTH' | 'EN' | 'AR'
  onUpdate: (updated: ActivityItem) => void
  onDuplicate: () => void
  onDelete: () => void
  onAutoTranslate?: () => void
  onStoryTypeCreated?: (newTrack: any) => void
  isDragging?: boolean
}

export const CONTENT_TYPE_LABELS: Record<ActivityContentType, { en: string; ar: string; color: string }> = {
  ACTIVITY: { en: 'Activity', ar: 'نشاط تفاعلي', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  ZONE: { en: 'Themed Zone', ar: 'منطقة ذات طابع', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  SHOW: { en: 'Show / Entertainment', ar: 'عرض وترفيه', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  DINING: { en: 'Dining / F&B', ar: 'مطاعم ومأكولات', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  RETAIL: { en: 'Retail & Merch', ar: 'متجر وهدايا', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30' },
  SERVICE: { en: 'Guest Service', ar: 'خدمة الزوار', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30' },
}

export function CompactActivityCard({
  activity,
  index,
  availableStoryTypes,
  availableBrands,
  bilingualView,
  onUpdate,
  onDuplicate,
  onDelete,
  onAutoTranslate,
  onStoryTypeCreated
}: CompactActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showQuickTrackModal, setShowQuickTrackModal] = useState(false)
  const [trackSearchQuery, setTrackSearchQuery] = useState("")

  // Quick Track Creation State
  const [newTrackTitleEn, setNewTrackTitleEn] = useState("")
  const [newTrackTitleAr, setNewTrackTitleAr] = useState("")
  const [newTrackSlug, setNewTrackSlug] = useState("")
  const [newTrackDescEn, setNewTrackDescEn] = useState("")
  const [newTrackDescAr, setNewTrackDescAr] = useState("")
  const [newTrackIcon, setNewTrackIcon] = useState("sparkles")
  const [newTrackColor, setNewTrackColor] = useState("#8b5cf6")
  const [isCreatingTrack, setIsCreatingTrack] = useState(false)
  const [trackError, setTrackError] = useState<string | null>(null)

  // Calculate completion percentage
  const hasEn = Boolean(activity.titleEn?.trim())
  const hasAr = Boolean(activity.titleAr?.trim())
  const hasDescEn = Boolean(activity.descriptionEn?.trim())
  const hasDescAr = Boolean(activity.descriptionAr?.trim())
  const hasImage = Boolean(activity.imageUrl?.trim())
  const hasStory = Boolean(activity.primaryStoryTypeId || (activity.storyTypeIds && activity.storyTypeIds.length > 0))

  const checks = [hasEn, hasAr, hasDescEn, hasDescAr, hasImage, hasStory]
  const completionScore = Math.round((checks.filter(Boolean).length / checks.length) * 100)

  const missingFields: string[] = []
  if (!hasEn) missingFields.push("Title (EN)")
  if (!hasAr) missingFields.push("Title (AR)")
  if (!hasDescEn) missingFields.push("Description (EN)")
  if (!hasDescAr) missingFields.push("Description (AR)")
  if (!hasImage) missingFields.push("Image")
  if (!hasStory) missingFields.push("Story Track")

  // 1. Resolve Primary Story Track strictly by activity.primaryStoryTypeId first
  const storyTypeIdsArr = Array.isArray(activity.storyTypeIds) ? activity.storyTypeIds : []
  const primaryStory = (activity.primaryStoryTypeId 
    ? availableStoryTypes.find(st => st.id === activity.primaryStoryTypeId) 
    : null) || (storyTypeIdsArr.length > 0 
    ? availableStoryTypes.find(st => st.id === storyTypeIdsArr[0]) 
    : null)

  // 2. Resolve Secondary Story Tracks (excluding primary track)
  const secondaryStoryTracks = (Array.isArray(activity.secondaryStoryTypeIds)
    ? activity.secondaryStoryTypeIds
    : (storyTypeIdsArr.length > 0 ? storyTypeIdsArr.filter(id => id !== primaryStory?.id) : [])
  ).map(id => availableStoryTypes.find(st => st.id === id)).filter(Boolean)

  const contentType = activity.contentType || 'ACTIVITY'
  const typeBadge = CONTENT_TYPE_LABELS[contentType] || CONTENT_TYPE_LABELS.ACTIVITY

  const toggleSecondaryStoryType = (stId: string) => {
    if (stId === (activity.primaryStoryTypeId || primaryStory?.id)) return
    const current = (activity.secondaryStoryTypeIds || []).filter(id => id !== (activity.primaryStoryTypeId || primaryStory?.id))
    if (current.includes(stId)) {
      const updated = current.filter(id => id !== stId)
      onUpdate({
        ...activity,
        secondaryStoryTypeIds: updated,
        storyTypeIds: [activity.primaryStoryTypeId || primaryStory?.id, ...updated].filter(Boolean)
      })
    } else {
      if (current.length >= 2) return // Max 2 secondary types
      const updated = [...current, stId]
      onUpdate({
        ...activity,
        secondaryStoryTypeIds: updated,
        storyTypeIds: [activity.primaryStoryTypeId || primaryStory?.id, ...updated].filter(Boolean)
      })
    }
  }

  return (
    <div className={cn(
      "border rounded-2xl transition-all duration-200 overflow-hidden bg-[var(--surface-default)] shadow-sm",
      isExpanded ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/20" : "border-[var(--border-default)] hover:border-[var(--border-hover)]"
    )}>
      {/* 1. Header Bar (Always visible) */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-grab active:cursor-grabbing p-1">
            <GripVertical className="w-4 h-4" />
          </div>

          <span className="w-6 h-6 rounded-full bg-[var(--surface-default)] border border-[var(--border-default)] flex items-center justify-center text-xs font-mono font-bold text-[var(--text-secondary)] shrink-0">
            {index + 1}
          </span>

          {/* Mini Thumbnail */}
          {activity.imageUrl ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-[var(--border-default)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activity.imageUrl} alt={activity.titleEn || "Activity"} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[var(--surface-default)] border border-dashed border-[var(--border-default)] flex items-center justify-center text-[var(--text-tertiary)] shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
          )}

          {/* Titles & Type */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                {activity.titleEn || <span className="text-amber-500 italic">Untitled Activity (EN)</span>}
              </h4>
              {activity.titleAr && (
                <span className="text-xs text-[var(--text-secondary)] font-medium truncate" dir="rtl">
                  • {activity.titleAr}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {/* Content Type Chip */}
              <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider", typeBadge.color)}>
                {typeBadge.en}
              </span>

              {/* Primary Story Type Badge (Always primary track) */}
              {primaryStory && (
                <span 
                  data-testid={`activity-primary-badge-${index}`}
                  className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{primaryStory.titleEn}</span>
                </span>
              )}

              {/* Secondary Supporting Track Chips */}
              {secondaryStoryTracks.slice(0, 2).map((st: any) => (
                <span
                  key={st.id}
                  className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[9px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-300/80 border border-purple-500/20"
                >
                  {st.titleEn}
                </span>
              ))}
              {secondaryStoryTracks.length > 2 && (
                <span className="text-[9px] font-mono text-[var(--text-tertiary)]">
                  +{secondaryStoryTracks.length - 2}
                </span>
              )}

              {/* Completion Score & Missing Fields Chip */}
              <span className={cn(
                "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                completionScore === 100 ? "text-emerald-500 bg-emerald-500/10" : "text-amber-500 bg-amber-500/10"
              )}>
                {completionScore}%
              </span>

              {missingFields.length > 0 && (
                <span className="text-[10px] text-amber-500/90 font-medium truncate">
                  Missing: {missingFields.join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate activity"
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-default)] transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete activity"
            className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Delete &quot;{activity.titleEn || 'this activity'}&quot; permanently?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-[var(--surface-default)] border border-[var(--border-default)] text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  onDelete()
                }}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-500"
              >
                Confirm Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Expanded Detail Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="p-6 border-t border-[var(--border-default)] space-y-6"
          >
            {/* Bilingual Titles & Translation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Activity Title (EN & AR)
                </label>
                {onAutoTranslate && (
                  <button
                    type="button"
                    onClick={onAutoTranslate}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Languages className="w-3 h-3" />
                    <span>Auto-Translate</span>
                  </button>
                )}
              </div>

              <div className={cn(
                "grid gap-4",
                bilingualView === 'BOTH' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
              )}>
                {(bilingualView === 'BOTH' || bilingualView === 'EN') && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">English</span>
                    <input
                      type="text"
                      placeholder="e.g. AR-Powered Racing"
                      value={activity.titleEn || ''}
                      onChange={e => onUpdate({ ...activity, titleEn: e.target.value })}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                    />
                  </div>
                )}

                {(bilingualView === 'BOTH' || bilingualView === 'AR') && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">العربية</span>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="مثال: سباقات بتقنية الواقع المعزز"
                      value={activity.titleAr || ''}
                      onChange={e => onUpdate({ ...activity, titleAr: e.target.value })}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bilingual Descriptions */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Experience Narrative & Description
              </label>

              <div className={cn(
                "grid gap-4",
                bilingualView === 'BOTH' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
              )}>
                {(bilingualView === 'BOTH' || bilingualView === 'EN') && (
                  <textarea
                    rows={3}
                    placeholder="Describe the experience, gameplay or rules in English..."
                    value={activity.descriptionEn || ''}
                    onChange={e => onUpdate({ ...activity, descriptionEn: e.target.value })}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl p-3.5 text-sm focus:border-[var(--color-primary)] focus:outline-none resize-y"
                  />
                )}

                {(bilingualView === 'BOTH' || bilingualView === 'AR') && (
                  <textarea
                    rows={3}
                    dir="rtl"
                    placeholder="صف التجربة وطريقة اللعب باللغة العربية..."
                    value={activity.descriptionAr || ''}
                    onChange={e => onUpdate({ ...activity, descriptionAr: e.target.value })}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl p-3.5 text-sm focus:border-[var(--color-primary)] focus:outline-none resize-y text-right"
                  />
                )}
              </div>
            </div>

            {/* Classification: Content Type & Story Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[var(--border-default)]">
              {/* Content Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>Content Type</span>
                </label>
                <select
                  value={activity.contentType || 'ACTIVITY'}
                  onChange={e => onUpdate({ ...activity, contentType: e.target.value as ActivityContentType, highlightType: e.target.value })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none font-bold"
                >
                  <option value="ACTIVITY">🎮 Interactive Activity / Ride</option>
                  <option value="ZONE">🏰 Themed Zone / Arena</option>
                  <option value="SHOW">🎭 Live Show / Entertainment</option>
                  <option value="DINING">🍔 Dining / F&B Outpost</option>
                  <option value="RETAIL">🛍️ Retail & Merchandise</option>
                  <option value="SERVICE">ℹ️ Guest Service / Amenity</option>
                </select>
              </div>

              {/* Primary Story Type */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Primary Story Track (Required)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTrackSlug("")
                      setNewTrackTitleEn("")
                      setNewTrackTitleAr("")
                      setShowQuickTrackModal(true)
                    }}
                    className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Quick Create Track</span>
                  </button>
                </div>
                <select
                  value={activity.primaryStoryTypeId || primaryStory?.id || ''}
                  onChange={e => {
                    const stId = e.target.value
                    const filteredSecondary = (activity.secondaryStoryTypeIds || []).filter(id => id !== stId)
                    onUpdate({
                      ...activity,
                      primaryStoryTypeId: stId,
                      secondaryStoryTypeIds: filteredSecondary,
                      storyTypeIds: [stId, ...filteredSecondary].filter(Boolean)
                    })
                  }}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none font-bold"
                >
                  <option value="">-- Select Primary Track --</option>
                  {availableStoryTypes.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.titleEn} ({st.titleAr})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Secondary Story Types (Max 2) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <span>Secondary Story Tracks (Optional, Max 2)</span>
                </label>
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  {(activity.secondaryStoryTypeIds || []).length} / 2 selected
                </span>
              </div>

              {availableStoryTypes.length > 6 && (
                <input
                  type="text"
                  placeholder="Filter tracks by name..."
                  value={trackSearchQuery}
                  onChange={e => setTrackSearchQuery(e.target.value)}
                  className="w-full h-8 px-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] mb-2"
                />
              )}

              <div className="flex flex-wrap gap-2">
                {availableStoryTypes
                  .filter(st => st.id !== (activity.primaryStoryTypeId || primaryStory?.id))
                  .filter(st => !trackSearchQuery || (st.titleEn || '').toLowerCase().includes(trackSearchQuery.toLowerCase()))
                  .map(st => {
                    const isSelected = (activity.secondaryStoryTypeIds || []).includes(st.id)
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => toggleSecondaryStoryType(st.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer",
                          isSelected 
                            ? "bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-300 ring-1 ring-purple-500/20"
                            : "bg-[var(--surface-subtle)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                        )}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.accentColor || '#8b5cf6' }} />
                        <span>{st.titleEn}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />}
                      </button>
                    )
                  })}
              </div>
            </div>

            {/* Quick Create Story Track Modal */}
            {showQuickTrackModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                <div className="w-full max-w-md bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border-level-1)]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        Quick Create Story Track
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuickTrackModal(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {trackError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                      {trackError}
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-[var(--text-secondary)] block mb-1">Track Name (EN) *</label>
                        <input
                          type="text"
                          placeholder="e.g. Adrenaline"
                          value={newTrackTitleEn}
                          onChange={e => {
                            setNewTrackTitleEn(e.target.value)
                            if (!newTrackSlug) {
                              setNewTrackSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                            }
                          }}
                          className="w-full h-9 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] text-[var(--text-primary)]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[var(--text-secondary)] block mb-1">Track Name (AR) *</label>
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="مثال: الإثارة والتشويق"
                          value={newTrackTitleAr}
                          onChange={e => setNewTrackTitleAr(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] text-[var(--text-primary)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-[var(--text-secondary)] block mb-1">URL Slug *</label>
                      <input
                        type="text"
                        placeholder="e.g. adrenaline"
                        value={newTrackSlug}
                        onChange={e => setNewTrackSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="w-full h-9 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] text-[var(--text-primary)] font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-[var(--text-secondary)] block mb-1">Color Theme</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newTrackColor}
                            onChange={e => setNewTrackColor(e.target.value)}
                            className="w-9 h-9 rounded-xl border border-[var(--border-default)] cursor-pointer p-0.5"
                          />
                          <span className="font-mono text-[11px] text-[var(--text-secondary)]">{newTrackColor}</span>
                        </div>
                      </div>
                      <div>
                        <label className="font-bold text-[var(--text-secondary)] block mb-1">Icon Name</label>
                        <input
                          type="text"
                          placeholder="e.g. zap, trophy, heart"
                          value={newTrackIcon}
                          onChange={e => setNewTrackIcon(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] text-[var(--text-primary)]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-level-1)]">
                    <button
                      type="button"
                      onClick={() => setShowQuickTrackModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isCreatingTrack || !newTrackTitleEn.trim() || !newTrackSlug.trim()}
                      onClick={async () => {
                        setIsCreatingTrack(true)
                        setTrackError(null)
                        try {
                          const res = await fetch("/api/b2c/story-types", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              titleEn: newTrackTitleEn.trim(),
                              titleAr: newTrackTitleAr.trim() || newTrackTitleEn.trim(),
                              slug: newTrackSlug.trim(),
                              icon: newTrackIcon.trim(),
                              accentColor: newTrackColor,
                              isActive: true,
                              orderIndex: 99
                            })
                          })
                          if (!res.ok) {
                            const errJson = await res.json().catch(() => ({}))
                            throw new Error(errJson.error || "Failed to create track")
                          }
                          const resData = await res.json()
                          const created = resData.data
                          if (onStoryTypeCreated) {
                            onStoryTypeCreated(created)
                          }
                          onUpdate({
                            ...activity,
                            primaryStoryTypeId: created.id,
                            storyTypeIds: [created.id, ...(activity.secondaryStoryTypeIds || [])].filter(Boolean)
                          })
                          setShowQuickTrackModal(false)
                        } catch (err: any) {
                          setTrackError(err.message || "Failed to create track")
                        } finally {
                          setIsCreatingTrack(false)
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isCreatingTrack ? "Creating..." : "Create Track"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Media & Brand Association */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[var(--border-default)]">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>Activity Image / Thumbnail</span>
                </label>
                <MediaUploader
                  value={activity.imageUrl || ''}
                  onChange={url => onUpdate({ ...activity, imageUrl: url })}
                  placeholder="Upload or enter image URL"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Brand / IP Partnership
                </label>
                <select
                  value={activity.linkedBrandId || ''}
                  onChange={e => onUpdate({ ...activity, linkedBrandId: e.target.value || undefined, showBrandLogo: Boolean(e.target.value) })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                >
                  <option value="">-- No Specific Brand Link --</option>
                  {availableBrands.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.nameEn} ({b.brandType || 'OWNED'})
                    </option>
                  ))}
                </select>

                {activity.linkedBrandId && (
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={activity.showBrandLogo !== false}
                      onChange={e => onUpdate({ ...activity, showBrandLogo: e.target.checked })}
                      className="rounded border-[var(--border-default)] text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-[var(--text-secondary)]">Show brand badge on public card</span>
                  </label>
                )}
              </div>
            </div>

            {/* Operational Attributes & Restrictions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-[var(--border-default)]">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[var(--text-tertiary)]" />
                  <span>Duration (Mins)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={activity.durationMinutes || ''}
                  onChange={e => onUpdate({ ...activity, durationMinutes: parseInt(e.target.value) || undefined })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[var(--text-tertiary)]" />
                  <span>Intensity</span>
                </label>
                <select
                  value={activity.intensityLevel || 'MEDIUM'}
                  onChange={e => onUpdate({ ...activity, intensityLevel: e.target.value as any })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-2 py-2 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                >
                  <option value="LOW">Low / Relaxed</option>
                  <option value="MEDIUM">Medium / Dynamic</option>
                  <option value="HIGH">High / Action</option>
                  <option value="EXTREME">Extreme Thrill</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                  <Users className="w-3 h-3 text-[var(--text-tertiary)]" />
                  <span>Min Age</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 6"
                  value={activity.minAge || ''}
                  onChange={e => onUpdate({ ...activity, minAge: parseInt(e.target.value) || undefined })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-[var(--text-tertiary)]" />
                  <span>Min Height (cm)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 110"
                  value={activity.minHeightCm || ''}
                  onChange={e => onUpdate({ ...activity, minHeightCm: parseInt(e.target.value) || undefined })}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
