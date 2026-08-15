"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Search } from 'lucide-react'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { UniversalMediaSectionEditor, UniversalMediaConfig } from '@/components/dashboard/ui/UniversalMediaSectionEditor'
import { E3LivingHeroEditor, E3LivingHeroEditorData } from '@/components/dashboard/b2c/E3LivingHeroEditor'
import { DEFAULT_B2B_TEAM_PAGE_CONTENT } from '@/lib/cms-default-pages'
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardLoadingState,
} from '@/components/dashboard/ui'

export function B2BTeamPageEditor() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [pageConfig, setPageConfig] = useState<Record<string, any>>({
    ...DEFAULT_B2B_TEAM_PAGE_CONTENT,
    titleEn: 'MEET THE PEOPLE WHO BUILD',
    titleAr: 'تعرّف على الأشخاص الذين يصنعون',
    descEn: 'Meet the engineers, creatives, and tacticians who make the impossible happen every day.',
    descAr: 'تعرف على المهندسين والمبدعين والمخططين الذين يجعلون المستحيل ممكناً كل يوم.',
    hero: {
      ...DEFAULT_B2B_TEAM_PAGE_CONTENT,
    } as E3LivingHeroEditorData,
  })

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/cms/pages/b2b-team-page')
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
      const res = await fetch('/api/cms/pages/b2b-team-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: pageConfig })
      })
      if (!res.ok) throw new Error('Failed to save B2B Team Page settings')
      toast('B2B Team Page Editor saved successfully!', 'success')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast(err?.message || 'Error saving page settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <DashboardLoadingState title="Loading Team Page Editor..." type="skeleton" />
  }

  return (
    <DashboardPageShell variant="focused">
      {/* Top Action Header */}
      <DashboardPageHeader
        title="B2B Team Page Editor"
        description="Manage page titles, universal hero & footer media (Image, Video, 3D, IFrame, Fallbacks), and SEO metadata (/b2b/team)."
        breadcrumbs={[
          { label: "B2B Pages", href: "/dashboard/b2b/home" },
          { label: "Team Page Editor" },
        ]}
        badge={{ label: "B2B Public", variant: "purple" }}
        previewUrl="/b2b/team"
        primaryAction={{
          label: saving ? 'Saving...' : 'Save Page Settings',
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      {/* E3 Living Hero & Constellation Header Editor */}
      <E3LivingHeroEditor
        title="Human Constellation Hero & Rotating Copy"
        description="Configure the cinematic team constellation headline, rotating phrases, CTAs, presets, and animation timing."
        value={{
          eyebrowEn: pageConfig.eyebrowEn,
          eyebrowAr: pageConfig.eyebrowAr,
          fixedHeadlineEn: pageConfig.fixedHeadlineEn || pageConfig.headlineTemplateEn || pageConfig.titleEn,
          fixedHeadlineAr: pageConfig.fixedHeadlineAr || pageConfig.headlineTemplateAr || pageConfig.titleAr,
          headlineTemplateEn: pageConfig.headlineTemplateEn || pageConfig.fixedHeadlineEn,
          headlineTemplateAr: pageConfig.headlineTemplateAr || pageConfig.fixedHeadlineAr,
          rotatingWordsEn: pageConfig.rotatingWordsEn,
          rotatingWordsAr: pageConfig.rotatingWordsAr,
          descriptionEn: pageConfig.descriptionEn || pageConfig.descEn,
          descriptionAr: pageConfig.descriptionAr || pageConfig.descAr,
          primaryCta: pageConfig.primaryCta,
          secondaryCta: pageConfig.secondaryCta,
          preset: (pageConfig.preset as any) || "team-constellation",
          animationSpeed: pageConfig.animationSpeed || 2800,
          animationDuration: pageConfig.animationDuration || 600,
          animationType: pageConfig.animationType || "blur-morph",
          wordStyle: pageConfig.wordStyle || "static-gradient",
          alignmentEn: pageConfig.alignmentEn || pageConfig.alignment || "center",
          alignmentAr: pageConfig.alignmentAr || pageConfig.alignment || "center",
          alignment: pageConfig.alignment,
          enableRotatingWords: pageConfig.enableRotatingWords !== false,
          media: pageConfig.heroMedia as any,
        }}
        onChange={(heroData) => {
          setPageConfig((prev) => ({
            ...prev,
            ...heroData,
            titleEn: heroData.fixedHeadlineEn || prev.titleEn,
            titleAr: heroData.fixedHeadlineAr || prev.titleAr,
            descEn: heroData.descriptionEn || prev.descEn,
            descAr: heroData.descriptionAr || prev.descAr,
            hero: heroData,
          }));
        }}
      />

      {/* Universal Hero Media Section */}
      <UniversalMediaSectionEditor
        title="Page Hero Media Section"
        subtitle="Universal hero media supporting Image, Video, 3D GLB Models, Embed IFrames, and Fallback Poster Images."
        value={pageConfig.heroMedia}
        onChange={(heroMedia: UniversalMediaConfig) => setPageConfig(prev => ({ ...prev, heroMedia }))}
        accentColor="blue"
      />

      {/* Universal Footer Media Section */}
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
          <Search className="w-5 h-5 text-[var(--color-primary)]" />
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
    </DashboardPageShell>
  )
}
