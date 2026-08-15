"use client"

import React, { useState } from 'react'
import { 
  Plus, 
  X, 
  CheckCircle2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Monitor,
  Tablet,
  Smartphone,
  Type
} from 'lucide-react'
import { DashboardSectionCard, DashboardBilingualField } from '@/components/dashboard/ui'
import { LanguageEditMode } from '@/components/dashboard/ui/DashboardBilingualEditor'
import { MediaUploader } from '@/components/shared/MediaUploader'
import { 
  E3LivingHero, 
  E3LivingHeroPreset, 
  HeadlineAnimationType, 
  AnimatedWordStyle, 
  HeroAlignment
} from '@/components/b2c/hero/E3LivingHero'
import { UniversalMediaType } from '@/components/shared/UniversalMediaRenderer'
import { cn } from '@/lib/utils'

export interface E3LivingHeroEditorData {
  eyebrowEn?: string
  eyebrowAr?: string
  fixedHeadlineEn?: string
  fixedHeadlineAr?: string
  headlineTemplateEn?: string
  headlineTemplateAr?: string
  rotatingWordsEn?: string[]
  rotatingWordsAr?: string[]
  descriptionEn?: string
  descriptionAr?: string
  primaryCta?: {
    labelEn?: string
    labelAr?: string
    url?: string
  }
  secondaryCta?: {
    labelEn?: string
    labelAr?: string
    url?: string
  }
  media?: {
    mediaType?: UniversalMediaType | string
    mediaUrl?: string
    mobileMediaUrl?: string
    posterUrl?: string
    focalPoint?: string
    overlayOpacity?: number
    gradientScrim?: boolean
  }
  animationSpeed?: number
  animationDuration?: number
  enableRotatingWords?: boolean
  preset?: E3LivingHeroPreset
  accentColor?: string
  parallaxIntensity?: number

  // UX-02B-B Headline Composer Fields
  animationType?: HeadlineAnimationType
  wordStyle?: AnimatedWordStyle
  alignmentEn?: HeroAlignment
  alignmentAr?: HeroAlignment
  alignment?: HeroAlignment
}

interface E3LivingHeroEditorProps {
  value: E3LivingHeroEditorData
  onChange: (updated: E3LivingHeroEditorData) => void
  isAr?: boolean
  languageMode?: LanguageEditMode | 'BOTH' | 'EN' | 'AR'
  title?: string
  description?: string
  defaultPreset?: E3LivingHeroPreset
}

const ANIMATION_TYPES: { id: HeadlineAnimationType; label: string; desc: string }[] = [
  { id: 'typewriter', label: 'Typewriter', desc: 'Character-by-character mechanical typing with flashing cursor' },
  { id: 'fade', label: 'Fade', desc: 'Smooth opacity crossfade with minimal motion' },
  { id: 'zoom', label: 'Zoom', desc: 'Scale pop entrance with depth accentuation' },
  { id: 'wipe', label: 'Wipe', desc: 'Sharp horizontal clip-path reveal' },
  { id: 'slide-up', label: 'Slide Up', desc: 'Masked upward directional translation' },
  { id: 'blur-morph', label: 'Blur Morph', desc: 'High-end optical blur to sharp focal clarity' },
]

const WORD_STYLES: { id: AnimatedWordStyle; label: string; desc: string }[] = [
  { id: 'solid', label: 'Solid Color', desc: 'High-contrast accent primary color' },
  { id: 'static-gradient', label: 'Static Gradient', desc: 'Multi-stop harmonious linear gradient' },
  { id: 'moving-gradient', label: 'Moving Gradient', desc: 'Shimmering perpetual horizontal flow' },
]

type PreviewViewport = '1440' | '1024' | '768' | '390'

export function E3LivingHeroEditor({
  value,
  onChange,
  isAr = false,
  languageMode = 'both',
  title,
  description,
  defaultPreset = 'memory-engine'
}: E3LivingHeroEditorProps) {
  const [newWordEn, setNewWordEn] = useState('')
  const [newWordAr, setNewWordAr] = useState('')
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>('1440')
  const [activeComposerLang, setActiveComposerLang] = useState<'EN' | 'AR'>(isAr ? 'AR' : 'EN')

  const normalizedLangMode: LanguageEditMode = (
    typeof languageMode === 'string' ? languageMode.toLowerCase() : 'both'
  ) as LanguageEditMode

  const showEn = normalizedLangMode === 'both' || normalizedLangMode === 'en'
  const showAr = normalizedLangMode === 'both' || normalizedLangMode === 'ar'

  const data: E3LivingHeroEditorData = {
    eyebrowEn: value?.eyebrowEn || '',
    eyebrowAr: value?.eyebrowAr || '',
    fixedHeadlineEn: value?.fixedHeadlineEn || 'SOME DAYS PASS. OTHERS BECOME {{animated}}',
    fixedHeadlineAr: value?.fixedHeadlineAr || 'بعض الأيام تمضي. وأخرى تصبح {{animated}}',
    headlineTemplateEn: value?.headlineTemplateEn || value?.fixedHeadlineEn || 'SOME DAYS PASS. OTHERS BECOME {{animated}}',
    headlineTemplateAr: value?.headlineTemplateAr || value?.fixedHeadlineAr || 'بعض الأيام تمضي. وأخرى تصبح {{animated}}',
    rotatingWordsEn: Array.isArray(value?.rotatingWordsEn) ? value.rotatingWordsEn : ['STORIES', 'ADVENTURES', 'MOMENTS', 'MEMORIES'],
    rotatingWordsAr: Array.isArray(value?.rotatingWordsAr) ? value.rotatingWordsAr : ['حكايات', 'مغامرات', 'لحظات', 'ذكريات'],
    descriptionEn: value?.descriptionEn || '',
    descriptionAr: value?.descriptionAr || '',
    primaryCta: {
      labelEn: value?.primaryCta?.labelEn || 'EXPLORE NOW',
      labelAr: value?.primaryCta?.labelAr || 'استكشف الآن',
      url: value?.primaryCta?.url || '/{locale}/b2c/attractions'
    },
    secondaryCta: {
      labelEn: value?.secondaryCta?.labelEn || 'VIEW CALENDAR',
      labelAr: value?.secondaryCta?.labelAr || 'جدول الفعاليات',
      url: value?.secondaryCta?.url || '/{locale}/b2c/calendar'
    },
    media: {
      mediaType: value?.media?.mediaType || 'IMAGE',
      mediaUrl: value?.media?.mediaUrl || '',
      mobileMediaUrl: value?.media?.mobileMediaUrl || '',
      posterUrl: value?.media?.posterUrl || '',
      overlayOpacity: value?.media?.overlayOpacity !== undefined ? value.media.overlayOpacity : 0.6,
      gradientScrim: value?.media?.gradientScrim !== false
    },
    animationSpeed: value?.animationSpeed || 2800,
    animationDuration: value?.animationDuration || 600,
    enableRotatingWords: value?.enableRotatingWords !== false,
    preset: value?.preset || defaultPreset,
    accentColor: value?.accentColor || '#10b981',
    parallaxIntensity: value?.parallaxIntensity !== undefined ? value.parallaxIntensity : 0.15,

    animationType: value?.animationType || 'blur-morph',
    wordStyle: value?.wordStyle || 'static-gradient',
    alignmentEn: value?.alignmentEn || 'center',
    alignmentAr: value?.alignmentAr || 'center',
  }

  const handleUpdate = (updater: (prev: E3LivingHeroEditorData) => E3LivingHeroEditorData) => {
    const updated = updater(data)
    onChange(updated)
  }

  // Word manipulation (EN)
  const addWordEn = () => {
    if (!newWordEn.trim()) return
    const word = newWordEn.trim().toUpperCase()
    if (data.rotatingWordsEn?.includes(word)) return
    handleUpdate((p) => ({
      ...p,
      rotatingWordsEn: [...(p.rotatingWordsEn || []), word]
    }))
    setNewWordEn('')
  }

  const removeWordEn = (idx: number) => {
    handleUpdate((p) => ({
      ...p,
      rotatingWordsEn: (p.rotatingWordsEn || []).filter((_, i) => i !== idx)
    }))
  }

  const moveWordEn = (idx: number, direction: 'up' | 'down') => {
    const words = [...(data.rotatingWordsEn || [])]
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= words.length) return
    const temp = words[idx]
    words[idx] = words[targetIdx]
    words[targetIdx] = temp
    handleUpdate((p) => ({ ...p, rotatingWordsEn: words }))
  }

  // Word manipulation (AR)
  const addWordAr = () => {
    if (!newWordAr.trim()) return
    const word = newWordAr.trim()
    if (data.rotatingWordsAr?.includes(word)) return
    handleUpdate((p) => ({
      ...p,
      rotatingWordsAr: [...(p.rotatingWordsAr || []), word]
    }))
    setNewWordAr('')
  }

  const removeWordAr = (idx: number) => {
    handleUpdate((p) => ({
      ...p,
      rotatingWordsAr: (p.rotatingWordsAr || []).filter((_, i) => i !== idx)
    }))
  }

  const moveWordAr = (idx: number, direction: 'up' | 'down') => {
    const words = [...(data.rotatingWordsAr || [])]
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= words.length) return
    const temp = words[idx]
    words[idx] = words[targetIdx]
    words[targetIdx] = temp
    handleUpdate((p) => ({ ...p, rotatingWordsAr: words }))
  }

  // Visual word selector: Click a word in plain sentence to convert it to {{animated}}
  const setTokenOnWordEn = (targetWord: string) => {
    const current = (data.headlineTemplateEn || '').replace(/\{\{animated\}\}/g, '').trim()
    const words = current.split(/\s+/)
    const replaced = words.map(w => w === targetWord ? '{{animated}}' : w).join(' ')
    handleUpdate((p) => ({
      ...p,
      headlineTemplateEn: replaced,
      fixedHeadlineEn: replaced
    }))
  }

  const setTokenOnWordAr = (targetWord: string) => {
    const current = (data.headlineTemplateAr || '').replace(/\{\{animated\}\}/g, '').trim()
    const words = current.split(/\s+/)
    const replaced = words.map(w => w === targetWord ? '{{animated}}' : w).join(' ')
    handleUpdate((p) => ({
      ...p,
      headlineTemplateAr: replaced,
      fixedHeadlineAr: replaced
    }))
  }

  // Validation checker for 2-Line system
  const templateEn = (data.headlineTemplateEn || '').trim()
  let validationWarningEn: string | null = null
  if (!templateEn.includes('{{animated}}')) {
    validationWarningEn = 'Notice: Template is missing {{animated}} tag. Word will be placed at the end.'
  } else if ((templateEn.match(/\{\{animated\}\}/g) || []).length > 1) {
    validationWarningEn = 'Warning: Multiple {{animated}} tokens found. Exactly one token is allowed.'
  } else if (templateEn.length > 80) {
    validationWarningEn = 'Warning: Headline is very long (>80 chars) and may cause wrapping at smaller viewports.'
  }

  const templateAr = (data.headlineTemplateAr || '').trim()
  let validationWarningAr: string | null = null
  if (!templateAr.includes('{{animated}}')) {
    validationWarningAr = 'تنبيه: القالب لا يحتوي على وسم {{animated}}. سيتم وضع الكلمة في نهاية السطر.'
  } else if ((templateAr.match(/\{\{animated\}\}/g) || []).length > 1) {
    validationWarningAr = 'تحذير: يوجد أكثر من وسم {{animated}}. يُسمح بوسم واحد فقط.'
  } else if (templateAr.length > 80) {
    validationWarningAr = 'تحذير: العنوان طويل جداً (>80 حرفاً) وقد يتسبب في كسر السطور في الشاشات الصغيرة.'
  }

  // Split template words for interactive word selector
  const templateWordsEn = (data.headlineTemplateEn || '')
    .replace(/\{\{animated\}\}/g, '')
    .split(/\s+/)
    .filter(Boolean)

  const templateWordsAr = (data.headlineTemplateAr || '')
    .replace(/\{\{animated\}\}/g, '')
    .split(/\s+/)
    .filter(Boolean)

  return (
    <div className="space-y-8" data-testid="e3-living-hero-editor">
      {/* ============================================================ */}
      {/* 1. TWO-LINE HEADLINE COMPOSER & ANIMATION SUITE               */}
      {/* ============================================================ */}
      <DashboardSectionCard
        title={title || "Two-Line Living Hero Headline Composer"}
        description={description || "Compose semantic 2-line headlines with inline animated tokens, space reservation, physical alignments, and visual animation presets."}
        badge="UX-02B-B Composer"
      >
        <div className="space-y-6">
          {/* Language Mode Selector for Headline Composer */}
          {showEn && showAr && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)]">
              <span className="text-xs font-bold text-[var(--text-secondary)] px-2">Composer Locale:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveComposerLang('EN')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    activeComposerLang === 'EN'
                      ? "bg-[var(--color-primary)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  English Template
                </button>
                <button
                  type="button"
                  onClick={() => setActiveComposerLang('AR')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    activeComposerLang === 'AR'
                      ? "bg-[var(--color-primary)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  Arabic Template (العربية)
                </button>
              </div>
            </div>
          )}

          {/* 1A. English Headline Composer */}
          {(showEn && activeComposerLang === 'EN') && (
            <div className="space-y-5 p-5 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)]">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Type className="w-4 h-4 text-emerald-400" />
                  <span>English Headline Template (2 Visual Lines)</span>
                </h4>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Target: 2 Lines
                </span>
              </div>

              {/* Template Input */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Full Template with <code className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">{"{{animated}}"}</code> token
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={data.headlineTemplateEn}
                    onChange={(e) => {
                      const val = e.target.value
                      handleUpdate((p) => ({
                        ...p,
                        headlineTemplateEn: val,
                        fixedHeadlineEn: val
                      }))
                    }}
                    placeholder="SOME DAYS PASS. OTHERS BECOME {{animated}}"
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-bold tracking-wide"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!data.headlineTemplateEn?.includes('{{animated}}')) {
                        handleUpdate((p) => ({
                          ...p,
                          headlineTemplateEn: `${p.headlineTemplateEn || ''} {{animated}}`.trim(),
                          fixedHeadlineEn: `${p.fixedHeadlineEn || ''} {{animated}}`.trim()
                        }))
                      }
                    }}
                    className="absolute end-2 top-2 px-2.5 py-1.5 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--color-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-white transition-all"
                  >
                    + Insert Token
                  </button>
                </div>
              </div>

              {/* Visual Word Selector */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
                  Visual Word Selector (Click any word to make it the rotating token):
                </label>
                <div className="flex flex-wrap gap-2">
                  {templateWordsEn.map((word, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTokenOnWordEn(word)}
                      className="px-3 py-1.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-default)] hover:border-emerald-400 hover:bg-emerald-500/10 text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer shadow-sm"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              {/* Validation Alert */}
              {validationWarningEn && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{validationWarningEn}</span>
                </div>
              )}

              {/* Reorderable Replacement Words List (EN) */}
              <div className="space-y-3 pt-2 border-t border-[var(--border-level-1)]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    Replacement Words (EN)
                  </label>
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    {(data.rotatingWordsEn || []).length} active words
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newWordEn}
                    onChange={(e) => setNewWordEn(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWordEn())}
                    placeholder="e.g. DESTINATIONS"
                    className="flex-1 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-bold uppercase"
                  />
                  <button
                    type="button"
                    onClick={addWordEn}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                {/* Word Chips with Move Up/Down and Delete */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(data.rotatingWordsEn || []).map((word, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs font-bold"
                    >
                      <span className="text-emerald-400 font-mono">#{idx + 1} {word}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveWordEn(idx, 'up')}
                          className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === (data.rotatingWordsEn || []).length - 1}
                          onClick={() => moveWordEn(idx, 'down')}
                          className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeWordEn(idx)}
                          className="p-1 rounded hover:bg-rose-500/20 text-rose-400 ms-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Alignment (EN) */}
              <div className="pt-2 border-t border-[var(--border-level-1)]">
                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Content Alignment (English)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'left', label: 'Left Aligned', icon: AlignLeft },
                    { id: 'center', label: 'Center Aligned', icon: AlignCenter },
                    { id: 'right', label: 'Right Aligned', icon: AlignRight },
                  ].map((align) => {
                    const Icon = align.icon
                    const isSelected = (data.alignmentEn || 'center') === align.id
                    return (
                      <button
                        key={align.id}
                        type="button"
                        onClick={() => handleUpdate((p) => ({ ...p, alignmentEn: align.id as HeroAlignment, alignment: align.id as HeroAlignment }))}
                        className={cn(
                          "flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all",
                          isSelected
                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
                            : "bg-[var(--surface-default)] text-[var(--text-secondary)] border-[var(--border-level-2)] hover:border-[var(--color-primary)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{align.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 1B. Arabic Headline Composer */}
          {(showAr && activeComposerLang === 'AR') && (
            <div className="space-y-5 p-5 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)]" dir="rtl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Type className="w-4 h-4 text-emerald-400" />
                  <span>قالب العنوان بالعربية (سطرين بصريين)</span>
                </h4>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  الهدف: سطرين
                </span>
              </div>

              {/* Template Input */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  القالب الكامل مع وسم <code className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">{"{{animated}}"}</code>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    dir="rtl"
                    value={data.headlineTemplateAr}
                    onChange={(e) => {
                      const val = e.target.value
                      handleUpdate((p) => ({
                        ...p,
                        headlineTemplateAr: val,
                        fixedHeadlineAr: val
                      }))
                    }}
                    placeholder="بعض الأيام تمضي. وأخرى تصبح {{animated}}"
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-bold tracking-wide"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!data.headlineTemplateAr?.includes('{{animated}}')) {
                        handleUpdate((p) => ({
                          ...p,
                          headlineTemplateAr: `${p.headlineTemplateAr || ''} {{animated}}`.trim(),
                          fixedHeadlineAr: `${p.fixedHeadlineAr || ''} {{animated}}`.trim()
                        }))
                      }
                    }}
                    className="absolute start-2 top-2 px-2.5 py-1.5 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--color-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-white transition-all"
                  >
                    + إضافة الوسم
                  </button>
                </div>
              </div>

              {/* Visual Word Selector (AR) */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
                  المحدد البصري للكلمات (اضغط على أي كلمة لجعلها الكلمة المتحركة):
                </label>
                <div className="flex flex-wrap gap-2">
                  {templateWordsAr.map((word, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTokenOnWordAr(word)}
                      className="px-3 py-1.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-default)] hover:border-emerald-400 hover:bg-emerald-500/10 text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer shadow-sm"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              {/* Validation Alert (AR) */}
              {validationWarningAr && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{validationWarningAr}</span>
                </div>
              )}

              {/* Reorderable Replacement Words List (AR) */}
              <div className="space-y-3 pt-2 border-t border-[var(--border-level-1)]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    الكلمات المتناوبة (AR)
                  </label>
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    {(data.rotatingWordsAr || []).length} كلمات مفعلة
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    dir="rtl"
                    value={newWordAr}
                    onChange={(e) => setNewWordAr(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWordAr())}
                    placeholder="مثال: ذكريات"
                    className="flex-1 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-bold"
                  />
                  <button
                    type="button"
                    onClick={addWordAr}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة
                  </button>
                </div>

                {/* Word Chips with Move Up/Down and Delete (AR) */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(data.rotatingWordsAr || []).map((word, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs font-bold"
                    >
                      <span className="text-emerald-400 font-mono">#{idx + 1} {word}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveWordAr(idx, 'up')}
                          className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === (data.rotatingWordsAr || []).length - 1}
                          onClick={() => moveWordAr(idx, 'down')}
                          className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeWordAr(idx)}
                          className="p-1 rounded hover:bg-rose-500/20 text-rose-400 me-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Alignment (AR) */}
              <div className="pt-2 border-t border-[var(--border-level-1)]">
                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 text-start">
                  محاذاة المحتوى (العربية)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'right', label: 'محاذاة لليمين', icon: AlignRight },
                    { id: 'center', label: 'توسيط المحتوى', icon: AlignCenter },
                    { id: 'left', label: 'محاذاة لليسار', icon: AlignLeft },
                  ].map((align) => {
                    const Icon = align.icon
                    const isSelected = (data.alignmentAr || 'center') === align.id
                    return (
                      <button
                        key={align.id}
                        type="button"
                        onClick={() => handleUpdate((p) => ({ ...p, alignmentAr: align.id as HeroAlignment, alignment: align.id as HeroAlignment }))}
                        className={cn(
                          "flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all",
                          isSelected
                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
                            : "bg-[var(--surface-default)] text-[var(--text-secondary)] border-[var(--border-level-2)] hover:border-[var(--color-primary)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{align.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 1C. Animation Selector (Exactly 6 Types) */}
          <div className="space-y-3 pt-4 border-t border-[var(--border-level-1)]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Animation Type (6 Exact Presets)
              </label>
              <span className="text-xs font-bold text-cyan-400 capitalize">
                Selected: {data.animationType}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ANIMATION_TYPES.map((anim) => {
                const isSelected = data.animationType === anim.id
                return (
                  <button
                    key={anim.id}
                    type="button"
                    onClick={() => handleUpdate((p) => ({ ...p, animationType: anim.id }))}
                    className={cn(
                      "flex flex-col text-start p-3.5 rounded-xl border transition-all cursor-pointer",
                      isSelected
                        ? "bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400"
                        : "bg-[var(--surface-default)] border-[var(--border-level-1)] text-[var(--text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-black">{anim.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <span className="text-[10px] text-[var(--text-tertiary)] leading-tight">{anim.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 1D. Animated Word Styling (Solid, Static Gradient, Moving Gradient) */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Animated Word Visual Styling
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {WORD_STYLES.map((style) => {
                const isSelected = data.wordStyle === style.id
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleUpdate((p) => ({ ...p, wordStyle: style.id }))}
                    className={cn(
                      "flex flex-col text-start p-3 rounded-xl border transition-all cursor-pointer",
                      isSelected
                        ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-400 text-white shadow-md ring-1 ring-emerald-400"
                        : "bg-[var(--surface-default)] border-[var(--border-level-1)] text-[var(--text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <span className="text-xs font-bold mb-0.5">{style.label}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">{style.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 1E. Timing Controls: Speed and Transition Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Word Display Duration (ms)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {data.animationSpeed || 2800}ms ({((data.animationSpeed || 2800) / 1000).toFixed(1)}s)
                </span>
              </div>
              <input
                type="range"
                min={1500}
                max={6000}
                step={100}
                value={data.animationSpeed || 2800}
                onChange={(e) => handleUpdate((p) => ({ ...p, animationSpeed: Number(e.target.value) }))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Transition Speed / Duration (ms)
                </label>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {data.animationDuration || 600}ms
                </span>
              </div>
              <input
                type="range"
                min={200}
                max={1200}
                step={50}
                value={data.animationDuration || 600}
                onChange={(e) => handleUpdate((p) => ({ ...p, animationDuration: Number(e.target.value) }))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </DashboardSectionCard>

      {/* ============================================================ */}
      {/* 2. ACCURATE MULTI-DEVICE RESPONSIVE PREVIEW                  */}
      {/* ============================================================ */}
      <DashboardSectionCard
        title="Live Interactive Living Hero Preview"
        description="Verify accurate two-line headline rendering and zero layout shift at 1440px, 1024px, 768px, and 390px."
        badge="Multi-Device"
      >
        <div className="space-y-4">
          {/* Viewport Width Switcher */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)]">
            <span className="text-xs font-bold text-[var(--text-secondary)] px-2">Viewport Width:</span>
            <div className="flex items-center gap-2">
              {[
                { id: '1440', label: '1440px Desktop', icon: Monitor },
                { id: '1024', label: '1024px Tablet', icon: Tablet },
                { id: '768', label: '768px Small Tablet', icon: Tablet },
                { id: '390', label: '390px Mobile', icon: Smartphone },
              ].map((vp) => {
                const Icon = vp.icon
                const isSelected = previewViewport === vp.id
                return (
                  <button
                    key={vp.id}
                    type="button"
                    onClick={() => setPreviewViewport(vp.id as PreviewViewport)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                      isSelected
                        ? "bg-[var(--color-primary)] text-white shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{vp.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Scaled Preview Frame */}
          <div className="w-full overflow-x-auto p-4 rounded-2xl bg-slate-950/80 border border-[var(--border-level-2)] flex justify-center items-center">
            <div
              style={{
                width: previewViewport === '1440' ? '100%' : `${previewViewport}px`,
                maxWidth: '100%',
                transition: 'all 0.3s ease-in-out'
              }}
              className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[var(--bg-level-1)]"
            >
              <E3LivingHero
                eyebrowEn={data.eyebrowEn}
                eyebrowAr={data.eyebrowAr}
                fixedHeadlineEn={data.headlineTemplateEn || data.fixedHeadlineEn || ''}
                fixedHeadlineAr={data.headlineTemplateAr || data.fixedHeadlineAr || ''}
                headlineTemplateEn={data.headlineTemplateEn}
                headlineTemplateAr={data.headlineTemplateAr}
                rotatingWordsEn={data.rotatingWordsEn}
                rotatingWordsAr={data.rotatingWordsAr}
                descriptionEn={data.descriptionEn}
                descriptionAr={data.descriptionAr}
                primaryCta={data.primaryCta}
                secondaryCta={data.secondaryCta}
                media={data.media as any}
                animationSpeed={data.animationSpeed}
                animationDuration={data.animationDuration}
                enableRotatingWords={data.enableRotatingWords}
                preset={data.preset}
                accentColor={data.accentColor}
                parallaxIntensity={0}
                animationType={data.animationType}
                wordStyle={data.wordStyle}
                alignmentEn={data.alignmentEn}
                alignmentAr={data.alignmentAr}
                alignment={activeComposerLang === 'AR' ? (data.alignmentAr || data.alignment) : (data.alignmentEn || data.alignment)}
                locale={activeComposerLang === 'AR' ? 'ar' : 'en'}
                scrollIndicator={false}
              />
            </div>
          </div>
        </div>
      </DashboardSectionCard>

      {/* ============================================================ */}
      {/* 3. CORE CONTENT (EYEBROW, DESCRIPTION, CTAS)                 */}
      {/* ============================================================ */}
      <DashboardSectionCard
        title="Hero Content & CTAs"
        description="Configure eyebrow badge, descriptive paragraph, and primary / secondary call-to-action buttons."
      >
        <div className="space-y-6">
          {/* Eyebrow Bilingual */}
          <DashboardBilingualField
            label="Eyebrow Badge Text"
            description="Displays above the H1 with animated aura badge"
            valueEn={data.eyebrowEn || ''}
            valueAr={data.eyebrowAr || ''}
            onChangeEn={(val) => handleUpdate((p) => ({ ...p, eyebrowEn: val }))}
            onChangeAr={(val) => handleUpdate((p) => ({ ...p, eyebrowAr: val }))}
          />

          {/* Description Bilingual */}
          <DashboardBilingualField
            label="Subtext / Description"
            description="Secondary narrative copy below the main headline"
            valueEn={data.descriptionEn || ''}
            valueAr={data.descriptionAr || ''}
            type="textarea"
            rows={2}
            onChangeEn={(val) => handleUpdate((p) => ({ ...p, descriptionEn: val }))}
            onChangeAr={(val) => handleUpdate((p) => ({ ...p, descriptionAr: val }))}
          />

          {/* Primary CTA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[var(--surface-hover)]/40 border border-[var(--border-level-1)]">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Primary CTA (EN)</label>
              <input
                type="text"
                value={data.primaryCta?.labelEn || ''}
                onChange={(e) => handleUpdate((p) => ({
                  ...p,
                  primaryCta: { ...(p.primaryCta || {}), labelEn: e.target.value }
                }))}
                className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Primary CTA (AR)</label>
              <input
                type="text"
                dir="rtl"
                value={data.primaryCta?.labelAr || ''}
                onChange={(e) => handleUpdate((p) => ({
                  ...p,
                  primaryCta: { ...(p.primaryCta || {}), labelAr: e.target.value }
                }))}
                className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Primary CTA URL</label>
              <input
                type="text"
                value={data.primaryCta?.url || ''}
                onChange={(e) => handleUpdate((p) => ({
                  ...p,
                  primaryCta: { ...(p.primaryCta || {}), url: e.target.value }
                }))}
                className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] font-mono"
              />
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[var(--surface-hover)]/40 border border-[var(--border-level-1)]">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Secondary CTA (EN)</label>
              <input
                type="text"
                value={data.secondaryCta?.labelEn || ''}
                onChange={(e) => handleUpdate((p) => ({
                  ...p,
                  secondaryCta: { ...(p.secondaryCta || {}), labelEn: e.target.value }
                }))}
                className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Secondary CTA (AR)</label>
              <input
                type="text"
                dir="rtl"
                value={data.secondaryCta?.labelAr || ''}
                onChange={(e) => handleUpdate((p) => ({
                  ...p,
                  secondaryCta: { ...(p.secondaryCta || {}), labelAr: e.target.value }
                }))}
                className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Secondary CTA URL</label>
              <input
                type="text"
                value={data.secondaryCta?.url || ''}
                onChange={(e) => handleUpdate((p) => ({
                  ...p,
                  secondaryCta: { ...(p.secondaryCta || {}), url: e.target.value }
                }))}
                className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] font-mono"
              />
            </div>
          </div>
        </div>
      </DashboardSectionCard>

      {/* ============================================================ */}
      {/* 4. MEDIA & ATMOSPHERIC BACKDROP CONFIGURATION                */}
      {/* ============================================================ */}
      <DashboardSectionCard
        title="Hero Atmospheric Backdrop Media"
        description="Upload backdrop image or video with dimming opacity and gradient scrim controls."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              Hero Media File (Image or Video)
            </label>
            <MediaUploader
              value={data.media?.mediaUrl || ''}
              onChange={(url) => handleUpdate((p) => ({
                ...p,
                media: { ...(p.media || {}), mediaUrl: url }
              }))}
              accept="image/*,video/mp4,video/webm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Media Type</label>
              <select
                value={data.media?.mediaType || 'IMAGE'}
                onChange={(e) => handleUpdate((p) => ({
                  ...p,
                  media: { ...(p.media || {}), mediaType: e.target.value as any }
                }))}
                className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
              >
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video (MP4 / WebM)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Backdrop Overlay Opacity ({data.media?.overlayOpacity || 0.6})
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={data.media?.overlayOpacity !== undefined ? data.media.overlayOpacity : 0.6}
                onChange={(e) => handleUpdate((p) => ({
                  ...p,
                  media: { ...(p.media || {}), overlayOpacity: Number(e.target.value) }
                }))}
                className="w-full accent-[var(--color-primary)]"
              />
            </div>
          </div>
        </div>
      </DashboardSectionCard>
    </div>
  )
}
