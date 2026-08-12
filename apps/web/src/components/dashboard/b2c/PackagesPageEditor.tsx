"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Sparkles, Gift, Globe, Search, Tag, Sliders, Type } from 'lucide-react'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { UniversalMediaSectionEditor, DEFAULT_UNIVERSAL_MEDIA, UniversalMediaConfig } from '@/components/dashboard/ui/UniversalMediaSectionEditor'

export function PackagesPageEditor() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [pageConfig, setPageConfig] = useState({
    eyebrowEn: 'E3 CELEBRATIONS & GROUP PACKAGES',
    eyebrowAr: 'باقات الفعاليات والاحتفالات الاستثنائية',
    titleEn: 'Big Moments Deserve Bigger Experiences',
    titleAr: 'لحظاتكم الكبيرة تستحق تجارب استثنائية',
    descEn: 'Discover birthday celebrations, group adventures, school experiences and corporate packages across E3\'s entertainment destinations.',
    descAr: 'اكتشفوا باقات أعياد الميلاد والمجموعات والمدارس والشركات في وجهات E3 الترفيهية.',
    primaryCtaEn: 'Find Your Package',
    primaryCtaAr: 'اختر باقتك',
    secondaryCtaEn: 'Plan a Custom Event',
    secondaryCtaAr: 'خطط لفعاليتك الخاصة',
    campaignBadgeEn: 'VIP PACKAGES & EVENTS',
    campaignBadgeAr: 'باقات كبار الشخصيات',
    heroMedia: { ...DEFAULT_UNIVERSAL_MEDIA, mediaType: 'IMAGE', mediaUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop' } as UniversalMediaConfig,
    footerMedia: { ...DEFAULT_UNIVERSAL_MEDIA, mediaType: 'VIDEO', mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4' } as UniversalMediaConfig,
    seoTitle: 'Packages & Birthdays | E3 Qatar',
    seoDescription: 'Book custom birthday packages, VIP party rooms, and group events.'
  })

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/cms/pages/b2c-packages-page')
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
      const res = await fetch('/api/cms/pages/b2c-packages-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: pageConfig })
      })
      if (!res.ok) throw new Error('Failed to save Packages Page settings')
      toast('Packages Page Editor saved successfully!', 'success')
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
        <Sparkles className="w-5 h-5 animate-spin text-pink-500" />
        <span>Loading Packages Page Editor...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-[var(--text-primary)]">
      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">
              B2C PAGE EDITOR
            </span>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Gift className="w-6 h-6 text-pink-500" />
              <span>Packages & Birthday Page Editor</span>
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage page layout, universal hero & footer media (Image, Video, 3D, IFrame, Fallbacks), CTAs, badges, and SEO metadata (`/b2c/packages`).
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

      {/* Hero Header Controls */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Globe className="w-5 h-5 text-pink-500" />
          <span>Page Hero Titles & Eyebrow</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Eyebrow (English)</label>
            <input
              type="text"
              value={pageConfig.eyebrowEn}
              onChange={(e) => setPageConfig(prev => ({ ...prev, eyebrowEn: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Eyebrow (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={pageConfig.eyebrowAr}
              onChange={(e) => setPageConfig(prev => ({ ...prev, eyebrowAr: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Page Title (English)</label>
            <input
              type="text"
              value={pageConfig.titleEn}
              onChange={(e) => setPageConfig(prev => ({ ...prev, titleEn: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Page Title (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={pageConfig.titleAr}
              onChange={(e) => setPageConfig(prev => ({ ...prev, titleAr: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Subtext / Intro (English)</label>
            <textarea
              rows={2}
              value={pageConfig.descEn}
              onChange={(e) => setPageConfig(prev => ({ ...prev, descEn: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Subtext / Intro (Arabic)</label>
            <textarea
              rows={2}
              dir="rtl"
              value={pageConfig.descAr}
              onChange={(e) => setPageConfig(prev => ({ ...prev, descAr: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Hero CTA & Campaign Badge Controls */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Tag className="w-5 h-5 text-pink-500" />
          <span>Call To Actions & Campaign Badge</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Primary CTA Label (English)</label>
            <input
              type="text"
              value={pageConfig.primaryCtaEn}
              onChange={(e) => setPageConfig(prev => ({ ...prev, primaryCtaEn: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Primary CTA Label (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={pageConfig.primaryCtaAr}
              onChange={(e) => setPageConfig(prev => ({ ...prev, primaryCtaAr: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Secondary CTA Label (English)</label>
            <input
              type="text"
              value={pageConfig.secondaryCtaEn}
              onChange={(e) => setPageConfig(prev => ({ ...prev, secondaryCtaEn: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Secondary CTA Label (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={pageConfig.secondaryCtaAr}
              onChange={(e) => setPageConfig(prev => ({ ...prev, secondaryCtaAr: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Optional Campaign Badge (English)</label>
            <input
              type="text"
              value={pageConfig.campaignBadgeEn}
              onChange={(e) => setPageConfig(prev => ({ ...prev, campaignBadgeEn: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Optional Campaign Badge (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={pageConfig.campaignBadgeAr}
              onChange={(e) => setPageConfig(prev => ({ ...prev, campaignBadgeAr: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Universal Hero Media Section */}
      <UniversalMediaSectionEditor
        title="Page Hero Media Section"
        subtitle="Universal hero media supporting Image, Video, 3D GLB Models, Embed IFrames, and Fallback Poster Images."
        value={pageConfig.heroMedia}
        onChange={(heroMedia: UniversalMediaConfig) => setPageConfig(prev => ({ ...prev, heroMedia }))}
        accentColor="pink"
      />

      {/* Universal Footer Media Section */}
      <UniversalMediaSectionEditor
        title="Page Footer Media Section"
        subtitle="Universal footer banner supporting Image, Video, 3D Canvas, IFrame, and Mobile Fallbacks."
        value={pageConfig.footerMedia}
        onChange={(footerMedia: UniversalMediaConfig) => setPageConfig(prev => ({ ...prev, footerMedia }))}
        accentColor="purple"
      />

      {/* SEO Settings */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Search className="w-5 h-5 text-pink-500" />
          <span>SEO Metadata</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Meta Title Tag</label>
            <input
              type="text"
              value={pageConfig.seoTitle}
              onChange={(e) => setPageConfig(prev => ({ ...prev, seoTitle: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Meta Description</label>
            <textarea
              rows={2}
              value={pageConfig.seoDescription}
              onChange={(e) => setPageConfig(prev => ({ ...prev, seoDescription: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
