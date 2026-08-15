"use client"

import React, { useState } from 'react'
import { 
  Sparkles, 
  Layers, 
  Film, 
  Image as ImageIcon, 
  Video, 
  Play, 
  Radio, 
  Box, 
  Globe, 
  Plus, 
  X, 
  Eye, 
  Sliders, 
  CheckCircle2 
} from 'lucide-react'
import { DashboardSectionCard, DashboardBilingualField } from '@/components/dashboard/ui'
import { LanguageEditMode } from '@/components/dashboard/ui/DashboardBilingualEditor'
import { MediaUploader } from '@/components/shared/MediaUploader'
import { E3LivingHero, E3LivingHeroPreset } from '@/components/b2c/hero/E3LivingHero'
import { UniversalMediaType } from '@/components/shared/UniversalMediaRenderer'
import { cn } from '@/lib/utils'

export interface E3LivingHeroEditorData {
  eyebrowEn?: string
  eyebrowAr?: string
  fixedHeadlineEn?: string
  fixedHeadlineAr?: string
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
  enableRotatingWords?: boolean
  preset?: E3LivingHeroPreset
  accentColor?: string
  parallaxIntensity?: number
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

  const normalizedLangMode: LanguageEditMode = (
    typeof languageMode === 'string' ? languageMode.toLowerCase() : 'both'
  ) as LanguageEditMode

  const showEn = normalizedLangMode === 'both' || normalizedLangMode === 'en'
  const showAr = normalizedLangMode === 'both' || normalizedLangMode === 'ar'

  const data: E3LivingHeroEditorData = {
    eyebrowEn: value?.eyebrowEn || '',
    eyebrowAr: value?.eyebrowAr || '',
    fixedHeadlineEn: value?.fixedHeadlineEn || 'SOME DAYS PASS. OTHERS BECOME',
    fixedHeadlineAr: value?.fixedHeadlineAr || 'بعض الأيام تمضي. وأخرى تصبح',
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
    enableRotatingWords: value?.enableRotatingWords !== false,
    preset: value?.preset || defaultPreset,
    accentColor: value?.accentColor || '#10b981',
    parallaxIntensity: value?.parallaxIntensity !== undefined ? value.parallaxIntensity : 0.15
  }

  const handleUpdate = (updater: (prev: E3LivingHeroEditorData) => E3LivingHeroEditorData) => {
    const updated = updater(data)
    onChange(updated)
  }

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

  const mediaType = (data.media?.mediaType || 'IMAGE').toUpperCase() as UniversalMediaType

  return (
    <div data-testid="e3-living-hero-editor">
      <DashboardSectionCard
        title={title || (isAr ? "نظام الهيرو الحي (E3 Living Hero System)" : "E3 Living Hero System & Atmospheric Studio")}
        description={description || (isAr ? "تحكم بالعناوين الحركية، الكلمات المتغيرة، وسائط الخلفية، ونمط العرض المتطور." : "Configure fixed headlines, rotating animated words, atmospheric media, visual presets and CTAs.")}
        icon={<Sparkles className="w-5 h-5 text-[var(--color-primary)]" />}
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
            {data.preset?.toUpperCase()}
          </span>
        }
      >
      {/* 1. VISUAL PRESET & MOTION CONTROLS */}
      <div className="space-y-4 pb-6 border-b border-[var(--border-level-1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {isAr ? "١. نمط الهيرو وسرعة الحركة (Visual Preset & Speed)" : "1. Visual Preset & Motion Timing"}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[var(--text-secondary)]">
              {isAr ? "تفعيل الكلمات المتحركة" : "Enable Rotating Words"}
            </label>
            <input
              type="checkbox"
              checked={data.enableRotatingWords}
              onChange={(e) => handleUpdate((p) => ({ ...p, enableRotatingWords: e.target.checked }))}
              className="w-4 h-4 rounded border-[var(--border-level-2)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        {/* Preset Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { id: 'memory-engine', label: isAr ? 'محرك الذاكرة' : 'Memory Engine', desc: 'Landing' },
            { id: 'story-portal', label: isAr ? 'بوابة القصص' : 'Story Portal', desc: 'Discover' },
            { id: 'e3-universe', label: isAr ? 'كون إي ثري' : 'E3 Universe', desc: 'Attractions' },
            { id: 'day-builder', label: isAr ? 'صانع اليوم' : 'Day Builder', desc: 'Packages' },
            { id: 'living-timeline', label: isAr ? 'الجدول الحي' : 'Living Timeline', desc: 'Calendar' },
            { id: 'record-accent', label: isAr ? 'لون السجل' : 'Record Accent', desc: 'Detail Pages' },
          ].map((p) => {
            const isSelected = data.preset === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleUpdate((prev) => ({ ...prev, preset: p.id as E3LivingHeroPreset }))}
                className={cn(
                  "p-3 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-1",
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--surface-selected)] text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30"
                    : "border-[var(--border-level-1)] bg-[var(--surface-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{p.label}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)]">{p.desc}</span>
              </button>
            )
          })}
        </div>

        {/* Animation Speed Slider */}
        <div className="flex items-center gap-4 pt-2">
          <label className="text-xs font-bold text-[var(--text-secondary)] shrink-0">
            {isAr ? "معدل تبديل الكلمة:" : "Word Rotation Interval:"} {((data.animationSpeed || 2800) / 1000).toFixed(1)}s
          </label>
          <input
            type="range"
            min="1200"
            max="5000"
            step="200"
            value={data.animationSpeed || 2800}
            onChange={(e) => handleUpdate((p) => ({ ...p, animationSpeed: Number(e.target.value) }))}
            className="w-full accent-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* 2. HEADLINE & ROTATING PHRASES */}
      <div className="space-y-4 pt-2 pb-6 border-b border-[var(--border-level-1)]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "٢. العناوين والكلمات الدورية (Headlines & Rotating Phrases)" : "2. Headlines & Rotating Phrases"}
          </h4>
        </div>

        {/* Eyebrow */}
        <DashboardBilingualField
          label={isAr ? "العنوان التمهيدي (Eyebrow)" : "Eyebrow Pill Label"}
          valueEn={data.eyebrowEn || ''}
          valueAr={data.eyebrowAr || ''}
          onChangeEn={(val) => handleUpdate((p) => ({ ...p, eyebrowEn: val }))}
          onChangeAr={(val) => handleUpdate((p) => ({ ...p, eyebrowAr: val }))}
          placeholderEn="E3 QATAR ENTERTAINMENT WORLDS"
          placeholderAr="عالم إي ثري الترفيهي بقطر"
          mode={normalizedLangMode}
        />

        {/* Fixed Headline */}
        <DashboardBilingualField
          label={isAr ? "العنوان الرئيسي الثابت (Fixed Headline)" : "Fixed Headline"}
          valueEn={data.fixedHeadlineEn || ''}
          valueAr={data.fixedHeadlineAr || ''}
          onChangeEn={(val) => handleUpdate((p) => ({ ...p, fixedHeadlineEn: val }))}
          onChangeAr={(val) => handleUpdate((p) => ({ ...p, fixedHeadlineAr: val }))}
          placeholderEn="SOME DAYS PASS. OTHERS BECOME"
          placeholderAr="بعض الأيام تمضي. وأخرى تصبح"
          mode={normalizedLangMode}
        />

        {/* Rotating Words List Manager (English) */}
        {showEn && (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              {isAr ? "الكلمات الدورية المتحركة (الإنجليزية)" : "Rotating Words (English)"}
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {data.rotatingWordsEn?.map((word, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold font-mono"
                >
                  <span>{word}</span>
                  <button
                    type="button"
                    onClick={() => removeWordEn(idx)}
                    className="hover:text-red-400 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newWordEn}
                onChange={(e) => setNewWordEn(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWordEn())}
                placeholder="Add English word (e.g. STORIES)..."
                className="flex-1 h-9 px-3 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono uppercase"
              />
              <button
                type="button"
                onClick={addWordEn}
                className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        )}

        {/* Rotating Words List Manager (Arabic) */}
        {showAr && (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              {isAr ? "الكلمات الدورية المتحركة (العربية)" : "Rotating Words (Arabic)"}
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {data.rotatingWordsAr?.map((word, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
                >
                  <span>{word}</span>
                  <button
                    type="button"
                    onClick={() => removeWordAr(idx)}
                    className="hover:text-red-400 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newWordAr}
                onChange={(e) => setNewWordAr(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWordAr())}
                placeholder="أدخل كلمة عربية (مثال: حكايات)..."
                dir="rtl"
                className="flex-1 h-9 px-3 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
              <button
                type="button"
                onClick={addWordAr}
                className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? "إضافة" : "Add AR"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Description / Subtitle */}
        <DashboardBilingualField
          label={isAr ? "الوصف التفصيلي (Description)" : "Hero Subtitle & Description"}
          type="textarea"
          rows={2}
          valueEn={data.descriptionEn || ''}
          valueAr={data.descriptionAr || ''}
          onChangeEn={(val) => handleUpdate((p) => ({ ...p, descriptionEn: val }))}
          onChangeAr={(val) => handleUpdate((p) => ({ ...p, descriptionAr: val }))}
          placeholderEn="Enter an inspiring hero description..."
          placeholderAr="أدخل وصفاً تمهيدياً ملهماً..."
          mode={normalizedLangMode}
        />
      </div>

      {/* 3. PRIMARY & SECONDARY CALLS TO ACTION */}
      <div className="space-y-4 pt-2 pb-6 border-b border-[var(--border-level-1)]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "٣. أزرار الدعوة للتفاعل (Action CTAs)" : "3. Calls to Action (Primary & Secondary CTAs)"}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary CTA */}
          <div className="p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] space-y-3">
            <span className="text-xs font-bold uppercase text-[var(--text-primary)]">
              {isAr ? "الزر الأساسي (Primary CTA)" : "Primary CTA Button"}
            </span>
            <DashboardBilingualField
              label={isAr ? "نص الزر" : "Label"}
              valueEn={data.primaryCta?.labelEn || ''}
              valueAr={data.primaryCta?.labelAr || ''}
              onChangeEn={(val) => handleUpdate((p) => ({ ...p, primaryCta: { ...p.primaryCta, labelEn: val } }))}
              onChangeAr={(val) => handleUpdate((p) => ({ ...p, primaryCta: { ...p.primaryCta, labelAr: val } }))}
              mode={normalizedLangMode}
            />
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                {isAr ? "رابط الوجهة" : "Destination URL"}
              </label>
              <input
                type="text"
                value={data.primaryCta?.url || ''}
                onChange={(e) => handleUpdate((p) => ({ ...p, primaryCta: { ...p.primaryCta, url: e.target.value } }))}
                className="w-full h-8 px-3 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg text-xs font-mono text-[var(--text-primary)]"
              />
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] space-y-3">
            <span className="text-xs font-bold uppercase text-[var(--text-primary)]">
              {isAr ? "الزر الثانوي (Secondary CTA)" : "Secondary CTA Button"}
            </span>
            <DashboardBilingualField
              label={isAr ? "نص الزر" : "Label"}
              valueEn={data.secondaryCta?.labelEn || ''}
              valueAr={data.secondaryCta?.labelAr || ''}
              onChangeEn={(val) => handleUpdate((p) => ({ ...p, secondaryCta: { ...p.secondaryCta, labelEn: val } }))}
              onChangeAr={(val) => handleUpdate((p) => ({ ...p, secondaryCta: { ...p.secondaryCta, labelAr: val } }))}
              mode={normalizedLangMode}
            />
            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                {isAr ? "رابط الوجهة" : "Destination URL"}
              </label>
              <input
                type="text"
                value={data.secondaryCta?.url || ''}
                onChange={(e) => handleUpdate((p) => ({ ...p, secondaryCta: { ...p.secondaryCta, url: e.target.value } }))}
                className="w-full h-8 px-3 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg text-xs font-mono text-[var(--text-primary)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. MULTI-TYPE ATMOSPHERIC MEDIA STUDIO */}
      <div className="space-y-4 pt-2 pb-6 border-b border-[var(--border-level-1)]">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "٤. وسائط خلفية الهيرو التفاعلية (Atmospheric Media Studio)" : "4. Atmospheric Backdrop Media Studio"}
          </h4>
        </div>

        {/* Media Format Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { id: 'IMAGE', label: isAr ? 'صورة' : 'Image', icon: <ImageIcon className="w-4 h-4" /> },
            { id: 'VIDEO', label: isAr ? 'فيديو' : 'Video', icon: <Video className="w-4 h-4" /> },
            { id: 'YOUTUBE', label: isAr ? 'يوتيوب' : 'YouTube', icon: <Play className="w-4 h-4" /> },
            { id: 'VIMEO', label: isAr ? 'فيميو' : 'Vimeo', icon: <Radio className="w-4 h-4" /> },
            { id: 'THREE_D', label: isAr ? '3D / Spline' : '3D / Spline', icon: <Box className="w-4 h-4" /> },
            { id: 'IFRAME', label: isAr ? 'تضمين' : 'Iframe', icon: <Globe className="w-4 h-4" /> },
          ].map((typeOption) => {
            const isSelected = mediaType === typeOption.id
            return (
              <button
                key={typeOption.id}
                type="button"
                onClick={() => handleUpdate((p) => ({ ...p, media: { ...p.media, mediaType: typeOption.id as UniversalMediaType } }))}
                className={cn(
                  "p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1",
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--surface-selected)] text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/30"
                    : "border-[var(--border-level-1)] bg-[var(--surface-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                )}
              >
                <span>{typeOption.icon}</span>
                <span className="text-xs font-bold">{typeOption.label}</span>
              </button>
            )
          })}
        </div>

        {/* Media URL Input & Direct Uploader */}
        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              {isAr ? "رابط الوسائط الرئيسي" : "Primary Media URL or Stream Link"}
            </label>
            <input
              type="text"
              value={data.media?.mediaUrl || ''}
              onChange={(e) => handleUpdate((p) => ({ ...p, media: { ...p.media, mediaUrl: e.target.value } }))}
              placeholder="https://..."
              className="w-full h-10 px-3.5 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs font-mono text-[var(--text-primary)]"
            />
          </div>

          <MediaUploader
            value={data.media?.mediaUrl || ''}
            onChange={(url) => {
              const detected = url.endsWith('.mp4') || url.endsWith('.webm') ? 'VIDEO' : 'IMAGE'
              handleUpdate((p) => ({ ...p, media: { ...p.media, mediaUrl: url, mediaType: detected } }))
            }}
            accept="image/*,video/*"
          />
        </div>

        {/* Mobile Media / Poster Image */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {isAr ? "صورة البوستر البديلة / للهواتف (Mobile Poster Fallback)" : "Mobile Poster / Preload Fallback"}
          </label>
          <input
            type="text"
            value={data.media?.posterUrl || ''}
            onChange={(e) => handleUpdate((p) => ({ ...p, media: { ...p.media, posterUrl: e.target.value } }))}
            placeholder="https://images.unsplash.com/..."
            className="w-full h-9 px-3.5 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs font-mono text-[var(--text-primary)]"
          />
        </div>
      </div>

      {/* 5. LIVE INTERACTIVE HERO PREVIEW */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? "المعاينة المباشرة للهيرو الحي" : "Live Interactive Living Hero Preview"}</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold">
            {data.preset}
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden border border-[var(--border-level-2)] shadow-xl relative min-h-[420px]">
          <E3LivingHero
            eyebrowEn={data.eyebrowEn}
            eyebrowAr={data.eyebrowAr}
            fixedHeadlineEn={data.fixedHeadlineEn || 'SOME DAYS PASS. OTHERS BECOME'}
            fixedHeadlineAr={data.fixedHeadlineAr || 'بعض الأيام تمضي. وأخرى تصبح'}
            rotatingWordsEn={data.rotatingWordsEn}
            rotatingWordsAr={data.rotatingWordsAr}
            descriptionEn={data.descriptionEn}
            descriptionAr={data.descriptionAr}
            primaryCta={data.primaryCta}
            secondaryCta={data.secondaryCta}
            media={data.media}
            animationSpeed={data.animationSpeed}
            enableRotatingWords={data.enableRotatingWords}
            preset={data.preset}
            locale={isAr ? 'ar' : 'en'}
            scrollIndicator={false}
            className="min-h-[420px] py-16"
          />
        </div>
      </div>
    </DashboardSectionCard>
  </div>
  )
}
