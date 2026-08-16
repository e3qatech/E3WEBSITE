"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, Search, Users, Award, ShieldCheck, ExternalLink, Sparkles, Quote, Globe2, Film } from 'lucide-react'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { UniversalMediaSectionEditor, UniversalMediaConfig } from '@/components/dashboard/ui/UniversalMediaSectionEditor'
import { E3LivingHeroEditor, E3LivingHeroEditorData } from '@/components/dashboard/b2c/E3LivingHeroEditor'
import { DEFAULT_B2B_TEAM_PAGE_CONTENT } from '@/lib/cms-default-pages'
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardLoadingState,
} from '@/components/dashboard/ui'

export function B2BLeadershipEditor() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'hero' | 'executive' | 'media' | 'seo'>('hero')
  
  const [pageConfig, setPageConfig] = useState<Record<string, any>>({
    ...DEFAULT_B2B_TEAM_PAGE_CONTENT,
    eyebrowEn: 'THE MASTERMINDS — E3 LEADERSHIP',
    eyebrowAr: 'العقول المدبرة — قيادة إي ثري',
    fixedHeadlineEn: 'MEET THE PEOPLE WHO BUILD {{animated}}',
    fixedHeadlineAr: 'تعرّف على الأشخاص الذين يصنعون {{animated}}',
    headlineTemplateEn: 'MEET THE PEOPLE WHO BUILD {{animated}}',
    headlineTemplateAr: 'تعرّف على الأشخاص الذين يصنعون {{animated}}',
    titleEn: 'MEET THE PEOPLE WHO BUILD {{animated}}',
    titleAr: 'تعرّف على الأشخاص الذين يصنعون {{animated}}',
    rotatingWordsEn: ['EXPERIENCES', 'DESTINATIONS', 'MOMENTS', 'THE IMPOSSIBLE'],
    rotatingWordsAr: ['التجارب', 'الوجهات', 'اللحظات', 'المستحيل'],
    descEn: 'Meet the executive leadership, spatial engineers, and event atelier directors shaping world-class entertainment.',
    descAr: 'تعرف على القيادة التنفيذية، ومهندسي المساحات، والمخططين الذين يقودون صناعة الترفيه العالمية في قطر.',
    executiveIntroEn: "E3's leadership brings together over four decades of combined experience across monumental events, spatial engineering, and global entertainment benchmarks.",
    executiveIntroAr: "تجمع قيادة إي ثري أكثر من أربعة عقود من الخبرة المتراكمة في الفعاليات الضخمة، والهندسة المكانية، ومعايير الترفيه العالمية.",
    chairmanQuoteEn: "We don't just engineer events; we build transformative cultural landmarks that elevate Qatar's standing on the global stage.",
    chairmanQuoteAr: "نحن لا نكتفي بتنظيم الفعاليات؛ بل نصنع معالم ثقافية وترفيهية ملهمة تعزز مكانة قطر العالمية.",
    gmQuoteEn: "Operational discipline, creative fearlessness, and absolute safety form the immutable foundation of everything we fabricate.",
    gmQuoteAr: "الانضباط التشغيلي، والجرأة الإبداعية، ومعايير السلامة المطلقة هي الركائز الراسخة لكل تجربة نصنعها.",
    heroMedia: {
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
      posterUrl: '',
    },
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
            setPageConfig(prev => ({
              ...prev,
              ...json.data.content,
              heroMedia: json.data.content.heroMedia || json.data.content.hero?.media || prev.heroMedia,
            }))
          }
        }
      } catch (_e) {
        // Fallback to defaults
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const mergedConfig = {
        ...pageConfig,
        hero: {
          ...(pageConfig.hero || {}),
          media: pageConfig.heroMedia,
          eyebrowEn: pageConfig.eyebrowEn,
          eyebrowAr: pageConfig.eyebrowAr,
          fixedHeadlineEn: pageConfig.fixedHeadlineEn,
          fixedHeadlineAr: pageConfig.fixedHeadlineAr,
          headlineTemplateEn: pageConfig.headlineTemplateEn || pageConfig.fixedHeadlineEn,
          headlineTemplateAr: pageConfig.headlineTemplateAr || pageConfig.fixedHeadlineAr,
          rotatingWordsEn: pageConfig.rotatingWordsEn,
          rotatingWordsAr: pageConfig.rotatingWordsAr,
          descriptionEn: pageConfig.descriptionEn || pageConfig.descEn,
          descriptionAr: pageConfig.descriptionAr || pageConfig.descAr,
        }
      }

      const res = await fetch('/api/cms/pages/b2b-team-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: mergedConfig })
      })
      if (!res.ok) throw new Error('Failed to save B2B Leadership Page settings')
      toast('B2B Leadership Page settings saved successfully!', 'success')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast(err?.message || 'Error saving page settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <DashboardLoadingState title="Loading Leadership Page Editor..." type="skeleton" />
  }

  return (
    <DashboardPageShell variant="focused">
      {/* Header */}
      <DashboardPageHeader
        title="B2B Leadership & Team Page Editor"
        description="Configure executive statements, constellation hero copy, universal atmospheric backdrop media, and SEO metadata for the public leadership portal (/b2b/team & /b2b/leadership)."
        breadcrumbs={[
          { label: "B2B Pages", href: "/dashboard/b2b/home" },
          { label: "Leadership Page Editor" },
        ]}
        badge={{ label: "B2B Corporate", variant: "purple" }}
        previewUrl="/b2b/team"
        primaryAction={{
          label: saving ? 'Saving...' : 'Save Settings',
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      {/* Roster Jump Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Leadership Roster & Employee Profiles</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">Live Database</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Add, reorder, and edit individual leadership executive profiles, credentials, and biographies.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/team"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <span>Manage Team Roster</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-level-1)] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'hero'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Constellation Hero</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'media'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Hero Atmospheric Backdrop Media</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('executive')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'executive'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Quote className="w-3.5 h-3.5" />
          <span>Executive Statements</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'seo'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>SEO & Metadata</span>
        </button>
      </div>

      {/* Tab 1: Constellation Hero */}
      {activeTab === 'hero' && (
        <E3LivingHeroEditor
          title="Human Constellation Hero & Kinetic Copy"
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
              heroMedia: heroData.media || prev.heroMedia,
              hero: heroData,
            }));
          }}
        />
      )}

      {/* Tab 2: Hero Atmospheric Backdrop Media & Footer Media */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <UniversalMediaSectionEditor
            title="Hero Atmospheric Backdrop Media"
            subtitle="Upload or configure the atmospheric hero backdrop (Image, 4K Video, 3D GLB Models, Embed IFrames, and Fallback Poster Images) displayed behind the leadership headline."
            value={pageConfig.heroMedia}
            onChange={(heroMedia: UniversalMediaConfig) => setPageConfig(prev => ({
              ...prev,
              heroMedia,
              hero: { ...(prev.hero || {}), media: heroMedia }
            }))}
            accentColor="emerald"
          />

          <UniversalMediaSectionEditor
            title="Page Footer Media Section"
            subtitle="Universal footer banner supporting Image, Video, 3D Canvas, IFrame, and Mobile Fallbacks."
            value={pageConfig.footerMedia}
            onChange={(footerMedia: UniversalMediaConfig) => setPageConfig(prev => ({ ...prev, footerMedia }))}
            accentColor="blue"
          />
        </div>
      )}

      {/* Tab 3: Executive Statements / CEO & Chairman Desk */}
      {activeTab === 'executive' && (
        <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--border-level-1)]">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Executive Perspectives & Leadership Messages</h2>
              <p className="text-xs text-[var(--text-secondary)]">Manage the strategic vision statements from executive leaders.</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Executive Introduction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Executive Overview (EN)</label>
                <textarea
                  rows={3}
                  value={pageConfig.executiveIntroEn || ''}
                  onChange={(e) => setPageConfig(prev => ({ ...prev, executiveIntroEn: e.target.value }))}
                  placeholder="Overview of executive leadership experience..."
                  className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div dir="rtl">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">نظرة عامة على القيادة (عربي)</label>
                <textarea
                  rows={3}
                  value={pageConfig.executiveIntroAr || ''}
                  onChange={(e) => setPageConfig(prev => ({ ...prev, executiveIntroAr: e.target.value }))}
                  placeholder="نبذة عن خبرات القيادة التنفيذية..."
                  className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
            </div>

            {/* Chairman Statement */}
            <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Chairman's Vision Statement</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Quote (EN)</label>
                  <textarea
                    rows={3}
                    value={pageConfig.chairmanQuoteEn || ''}
                    onChange={(e) => setPageConfig(prev => ({ ...prev, chairmanQuoteEn: e.target.value }))}
                    className="w-full bg-zinc-950 border border-[var(--border-level-1)] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div dir="rtl">
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">كلمة رئيس مجلس الإدارة (عربي)</label>
                  <textarea
                    rows={3}
                    value={pageConfig.chairmanQuoteAr || ''}
                    onChange={(e) => setPageConfig(prev => ({ ...prev, chairmanQuoteAr: e.target.value }))}
                    className="w-full bg-zinc-950 border border-[var(--border-level-1)] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* General Manager Statement */}
            <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                <ShieldCheck className="w-4 h-4" />
                <span>General Manager's Operational Manifesto</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">Manifesto (EN)</label>
                  <textarea
                    rows={3}
                    value={pageConfig.gmQuoteEn || ''}
                    onChange={(e) => setPageConfig(prev => ({ ...prev, gmQuoteEn: e.target.value }))}
                    className="w-full bg-zinc-950 border border-[var(--border-level-1)] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div dir="rtl">
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">بيان المدير العام (عربي)</label>
                  <textarea
                    rows={3}
                    value={pageConfig.gmQuoteAr || ''}
                    onChange={(e) => setPageConfig(prev => ({ ...prev, gmQuoteAr: e.target.value }))}
                    className="w-full bg-zinc-950 border border-[var(--border-level-1)] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: SEO Metadata */}
      {activeTab === 'seo' && (
        <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 pb-4 border-b border-[var(--border-level-1)]">
            <Search className="w-4 h-4 text-emerald-400" />
            <span>SEO & Social Share Metadata</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Meta Title Tag</label>
              <input
                type="text"
                value={pageConfig.seoTitle || ''}
                onChange={(e) => setPageConfig(prev => ({ ...prev, seoTitle: e.target.value }))}
                placeholder="Our Team & Leadership | E3 Qatar B2B"
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={pageConfig.seoDescription || ''}
                onChange={(e) => setPageConfig(prev => ({ ...prev, seoDescription: e.target.value }))}
                placeholder="Meet the executive leadership, spatial engineers, and event atelier directors at E3..."
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      )}
    </DashboardPageShell>
  )
}
