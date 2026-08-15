"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Sparkles, Calendar, Search } from 'lucide-react'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { UniversalMediaSectionEditor, DEFAULT_UNIVERSAL_MEDIA, UniversalMediaConfig } from '@/components/dashboard/ui/UniversalMediaSectionEditor'
import { E3LivingHeroEditor } from '@/components/dashboard/b2c/E3LivingHeroEditor'

export function CalendarPageEditor() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [pageConfig, setPageConfig] = useState({
    titleEn: 'LIVE EVENTS & CALENDAR',
    titleAr: 'جدول الفعاليات والعروض الحية',
    descEn: 'Discover drone parades, live music festivals, and international shows across Qatar.',
    descAr: 'اكتشف عروض الدرون المضيئة والمهرجانات الموسيقية والعروض العالمية في الدوحة.',
    heroMedia: { ...DEFAULT_UNIVERSAL_MEDIA, mediaType: 'VIDEO', mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4' } as UniversalMediaConfig,
    footerMedia: { ...DEFAULT_UNIVERSAL_MEDIA, mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200&auto=format&fit=crop' } as UniversalMediaConfig,
    seoTitle: 'Events & Calendar | E3 Qatar',
    seoDescription: 'Live event calendar, tickets, and scheduled entertainment shows.'
  })

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/cms/pages/b2c-calendar-page')
        if (res.ok) {
          const json = await res.json()
          if (json?.data?.content) {
            setPageConfig(prev => ({ ...prev, ...json.data.content }))
          }
        }
      } catch (_e) {
        // Fallback default
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2c-calendar-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: pageConfig })
      })
      if (!res.ok) throw new Error('Failed to save Calendar Page settings')
      toast('Events & Calendar Page Editor saved successfully!', 'success')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast(err?.message || 'Error saving page settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-[var(--text-secondary)] flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-purple-500" />
        <span>Loading Calendar Page Editor...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-[var(--text-primary)]">
      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              B2C PAGE EDITOR
            </span>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-500" />
              <span>Events & Calendar Page Editor</span>
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage page layout, universal hero & footer media (Image, Video, 3D, IFrame, Fallbacks), and SEO metadata (`/b2c/calendar`).
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Page Settings'}</span>
        </button>
      </div>

      {/* Hero Header Controls (E3 Living Hero System) */}
      <E3LivingHeroEditor
        value={{
          eyebrowEn: (pageConfig as any).eyebrowEn || "EVENTS & OCCURRENCES TIMELINE",
          eyebrowAr: (pageConfig as any).eyebrowAr || "جدول الفعاليات والمواعيد الحية",
          fixedHeadlineEn: (pageConfig as any).fixedHeadlineEn || "YOUR NEXT MOMENT STARTS",
          fixedHeadlineAr: (pageConfig as any).fixedHeadlineAr || "لحظتك القادمة تبدأ",
          rotatingWordsEn: (pageConfig as any).rotatingWordsEn || ["TODAY", "THIS WEEK", "THIS WEEKEND", "SOON"],
          rotatingWordsAr: (pageConfig as any).rotatingWordsAr || ["اليوم", "هذا الأسبوع", "عطلة نهاية الأسبوع", "قريباً"],
          descriptionEn: pageConfig.descEn,
          descriptionAr: pageConfig.descAr,
          primaryCta: {
            labelEn: "Browse Schedule",
            labelAr: "تصفح الجدول",
            url: "#calendar-schedule"
          },
          secondaryCta: {
            labelEn: "Book Group Pass",
            labelAr: "باقات المجموعات",
            url: "/b2c/packages"
          },
          media: pageConfig.heroMedia,
          preset: (pageConfig as any).preset || "living-timeline",
          animationSpeed: (pageConfig as any).animationSpeed || 2800,
          enableRotatingWords: (pageConfig as any).enableRotatingWords !== false
        }}
        onChange={(updated) => {
          setPageConfig((prev: any) => ({
            ...prev,
            eyebrowEn: updated.eyebrowEn,
            eyebrowAr: updated.eyebrowAr,
            fixedHeadlineEn: updated.fixedHeadlineEn,
            fixedHeadlineAr: updated.fixedHeadlineAr,
            titleEn: updated.fixedHeadlineEn,
            titleAr: updated.fixedHeadlineAr,
            rotatingWordsEn: updated.rotatingWordsEn,
            rotatingWordsAr: updated.rotatingWordsAr,
            descEn: updated.descriptionEn,
            descAr: updated.descriptionAr,
            heroMedia: {
              ...(prev.heroMedia || {}),
              ...updated.media
            },
            preset: updated.preset,
            animationSpeed: updated.animationSpeed,
            enableRotatingWords: updated.enableRotatingWords
          }))
        }}
        isAr={false}
        defaultPreset="living-timeline"
      />

      {/* Universal Hero Media Controls */}
      <UniversalMediaSectionEditor
        title="Page Hero Media Section"
        subtitle="Universal hero media supporting Image, Video, 3D GLB Models, Embed IFrames, and Fallback Poster Images."
        value={pageConfig.heroMedia}
        onChange={(heroMedia: UniversalMediaConfig) => setPageConfig(prev => ({ ...prev, heroMedia }))}
        accentColor="purple"
      />

      {/* Universal Footer Media Controls */}
      <UniversalMediaSectionEditor
        title="Page Footer Media Section"
        subtitle="Universal footer banner supporting Image, Video, 3D Canvas, IFrame, and Mobile Fallbacks."
        value={pageConfig.footerMedia}
        onChange={(footerMedia: UniversalMediaConfig) => setPageConfig(prev => ({ ...prev, footerMedia }))}
        accentColor="indigo"
      />

      {/* SEO Settings */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Search className="w-5 h-5 text-purple-500" />
          <span>SEO Metadata</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Meta Title Tag</label>
            <input
              type="text"
              value={pageConfig.seoTitle}
              onChange={(e) => setPageConfig(prev => ({ ...prev, seoTitle: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Meta Description</label>
            <textarea
              rows={2}
              value={pageConfig.seoDescription}
              onChange={(e) => setPageConfig(prev => ({ ...prev, seoDescription: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--text-tertiary)]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
