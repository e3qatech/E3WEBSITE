"use client"

import { useState } from "react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminButton } from "../ui/AdminButton"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { MediaUploader } from "@/components/shared/MediaUploader"
import { AdminSeoCustomizer } from "../ui/AdminSeoCustomizer"
import { Plus, Trash2, Layers, Video, Sparkles, Trophy, Users, Flame, BarChart3, CheckSquare, Save } from "lucide-react"
import { E3LivingHeroEditor } from "@/components/dashboard/b2c/E3LivingHeroEditor"
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardStickyActions,
  DashboardUnsavedChangesGuard,
  EditorSectionItem,
} from "@/components/dashboard/ui"

const SECTIONS: EditorSectionItem[] = [
  { id: "hero", label: "1. Hero Section" },
  { id: "showreel", label: "2. Master Showreel" },
  { id: "factStream", label: "3. Fact Stream" },
  { id: "featuredCases", label: "4. Featured Cases" },
  { id: "archive", label: "5. Projects Archive" },
  { id: "teamStories", label: "6. Team Stories" },
  { id: "timeline", label: "7. Production Timeline" },
  { id: "transformations", label: "8. Transformations" },
  { id: "impactOverview", label: "9. ROI & Impact" },
  { id: "servicesSection", label: "10. Linked Services" },
  { id: "cta", label: "11. RFP CTA" },
  { id: "seo", label: "12. SEO Settings" },
]

export function B2BCasesEditor({ 
  initialData, 
  caseStudies = [], 
  services: _services = [],
  employeeProfiles = []
}: { 
  initialData: any, 
  caseStudies?: any[], 
  services?: any[],
  employeeProfiles?: any[]
}) {
  const [data, setData] = useState(initialData)
  const [seo, setSeo] = useState<any>(initialData?.seo || {})
  const [activeSectionId, setActiveSectionId] = useState("hero")
  const [isDirty, setIsDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2b-cases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data, seo })
      })
      if (!res.ok) throw new Error("Failed to save")
      setIsDirty(false)
      setLastSaved(new Date())
      toast("B2B Case Studies landing page updated successfully.", "success")
    } catch (e) {
      console.error(e)
      toast("Failed to save B2B Case Studies landing page.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (section: string, field: string, value: any) => {
    setIsDirty(true)
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }))
  }

  // Fact Stream repeatable actions
  const _addFact = () => {
    const newFact = {
      id: `f_${Date.now()}`,
      value: "100+",
      prefix: "",
      suffix: "",
      headlineEn: "New Key Achievement Fact",
      headlineAr: "حقيقة وإنجاز جديد",
      descEn: "Fact description highlighting project impact.",
      descAr: "وصف الإنجاز والأثر الملموس.",
      mediaType: "IMAGE",
      mediaUrl: "",
      caseStudyId: ""
    }
    setData((prev: any) => ({
      ...prev,
      factStream: {
        ...prev.factStream,
        facts: [...(prev.factStream?.facts || []), newFact]
      }
    }))
  }

  const _removeFact = (index: number) => {
    setData((prev: any) => ({
      ...prev,
      factStream: {
        ...prev.factStream,
        facts: (prev.factStream?.facts || []).filter((_: any, i: number) => i !== index)
      }
    }))
  }

  const _updateFact = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const facts = [...(prev.factStream?.facts || [])]
      facts[index] = { ...facts[index], [field]: value }
      return {
        ...prev,
        factStream: { ...prev.factStream, facts }
      }
    })
  }

  // Team Stories repeatable actions
  const addTeamStory = () => {
    const newStory = {
      id: `ts_${Date.now()}`,
      roleEn: "Project Lead",
      roleAr: "قائد المشروع",
      storyTitleEn: "Behind the Build Story",
      storyTitleAr: "قصة الكواليس والتنفيذ",
      storyEn: "Engineering story details.",
      storyAr: "تفاصيل قصة التنفيذ والهندسة.",
      teamMemberName: "",
      employeeProfileId: "",
      quoteEn: "Execution is key.",
      quoteAr: "التنفيذ الدقيق هو الجوهر.",
      caseStudyId: ""
    }
    setData((prev: any) => ({
      ...prev,
      teamStories: {
        ...prev.teamStories,
        stories: [...(prev.teamStories?.stories || []), newStory]
      }
    }))
  }

  const removeTeamStory = (index: number) => {
    setData((prev: any) => ({
      ...prev,
      teamStories: {
        ...prev.teamStories,
        stories: (prev.teamStories?.stories || []).filter((_: any, i: number) => i !== index)
      }
    }))
  }

  const updateTeamStory = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const stories = [...(prev.teamStories?.stories || [])]
      stories[index] = { ...stories[index], [field]: value }
      return {
        ...prev,
        teamStories: { ...prev.teamStories, stories }
      }
    })
  }

  // Impact Statistics repeatable actions
  const addImpactStat = () => {
    const newStat = {
      id: `stat_${Date.now()}`,
      value: "100%",
      prefix: "",
      suffix: "",
      labelEn: "Verified Standard",
      labelAr: "معيار معتمد",
      descEn: "Statistical details.",
      descAr: "تفاصيل الإحصائية المعتمدة."
    }
    setData((prev: any) => ({
      ...prev,
      impactOverview: {
        ...prev.impactOverview,
        stats: [...(prev.impactOverview?.stats || []), newStat]
      }
    }))
  }

  const removeImpactStat = (index: number) => {
    setData((prev: any) => ({
      ...prev,
      impactOverview: {
        ...prev.impactOverview,
        stats: (prev.impactOverview?.stats || []).filter((_: any, i: number) => i !== index)
      }
    }))
  }

  const updateImpactStat = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const stats = [...(prev.impactOverview?.stats || [])]
      stats[index] = { ...stats[index], [field]: value }
      return {
        ...prev,
        impactOverview: { ...prev.impactOverview, stats }
      }
    })
  }

  // Transformations repeatable actions
  const addTransformation = () => {
    const newItem = {
      id: `tr_${Date.now()}`,
      enabled: true,
      caseStudyId: "",
      beforeUrl: "",
      afterUrl: "",
      beforeLabelEn: "Before Build",
      beforeLabelAr: "قبل التنفيذ",
      afterLabelEn: "Live Activation",
      afterLabelAr: "التشغيل الحي",
      captionEn: "Transformation Showcase",
      captionAr: "استعراض التحول قبل وبعد"
    }
    setData((prev: any) => ({
      ...prev,
      transformations: {
        ...prev.transformations,
        items: [...(prev.transformations?.items || []), newItem]
      }
    }))
  }

  const removeTransformation = (index: number) => {
    setData((prev: any) => ({
      ...prev,
      transformations: {
        ...prev.transformations,
        items: (prev.transformations?.items || []).filter((_: any, i: number) => i !== index)
      }
    }))
  }

  const updateTransformation = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const items = [...(prev.transformations?.items || [])]
      items[index] = { ...items[index], [field]: value }
      return {
        ...prev,
        transformations: { ...prev.transformations, items }
      }
    })
  }

  const toggleFeaturedCaseSelection = (caseStudyId: string) => {
    setData((prev: any) => {
      const currentIds: string[] = Array.isArray(prev.featuredCases?.selectedCaseStudyIds)
        ? prev.featuredCases.selectedCaseStudyIds.map(String)
        : [];
      
      const newIds = currentIds.includes(caseStudyId)
        ? currentIds.filter(id => id !== caseStudyId)
        : [...currentIds, caseStudyId];

      return {
        ...prev,
        featuredCases: {
          ...prev.featuredCases,
          selectedCaseStudyIds: newIds
        }
      };
    });
  };

  const moveFeaturedCaseOrder = (index: number, direction: 'up' | 'down') => {
    setData((prev: any) => {
      const currentIds: string[] = Array.isArray(prev.featuredCases?.selectedCaseStudyIds)
        ? [...prev.featuredCases.selectedCaseStudyIds.map(String)]
        : [];

      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= currentIds.length) return prev;

      const temp = currentIds[index];
      currentIds[index] = currentIds[targetIdx];
      currentIds[targetIdx] = temp;

      return {
        ...prev,
        featuredCases: {
          ...prev.featuredCases,
          selectedCaseStudyIds: currentIds
        }
      };
    });
  };

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      <DashboardPageHeader 
        title="B2B Case Studies Page Editor"
        description="Manage all 12 interactive sections of the landmark projects showcase (/b2b/cases)."
        breadcrumbs={[
          { label: "B2B Pages", href: "/dashboard/b2b/home" },
          { label: "Case Studies Editor" },
        ]}
        badge={{ label: "B2B Public", variant: "warning" }}
        previewUrl="/b2b/cases"
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: saving ? "Saving..." : "Save All Sections",
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />
        }}
      />

      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeSectionId}
        onSectionChange={setActiveSectionId}
      />

      <AdminFormLayout>
        {/* 1. HERO SECTION & TWO-LINE LIVING HEADLINE COMPOSER */}
        <div id="hero" className="space-y-6">
          <E3LivingHeroEditor
            title="Two-Line Living Hero Headline Composer & Atmospheric Media"
            description="Configure the landmark cases living headline with {{animated}} token interpolation, rotating words, custom atmospheric media, and interactive CTAs."
            value={{
              eyebrowEn: data.hero?.eyebrowEn || "THE VAULT",
              eyebrowAr: data.hero?.eyebrowAr || "سجل الإنجازات",
              fixedHeadlineEn: data.hero?.titleEn || data.hero?.title || "Ideas Are Powerful. Results Make Them Real.",
              fixedHeadlineAr: data.hero?.titleAr || "الأفكار تصنع الإمكانات. والنتائج تثبتها.",
              headlineTemplateEn: data.hero?.headlineTemplateEn || data.hero?.titleEn || data.hero?.title || "Ideas Are Powerful. Results Make Them {{animated}}",
              headlineTemplateAr: data.hero?.headlineTemplateAr || data.hero?.titleAr || "الأفكار تصنع الإمكانات. والنتائج تجعلها {{animated}}",
              rotatingWordsEn: data.hero?.rotatingWordsEn || ["Real", "Iconic", "Measurable", "Extraordinary"],
              rotatingWordsAr: data.hero?.rotatingWordsAr || ["حقيقية", "أيقونية", "ذات أثر ملموس", "استثنائية"],
              descriptionEn: data.hero?.descriptionEn || data.hero?.subtitleEn || data.hero?.subtitle,
              descriptionAr: data.hero?.descriptionAr || data.hero?.subtitleAr,
              primaryCta: {
                labelEn: data.hero?.primaryCtaEn || "Explore Our Work",
                labelAr: data.hero?.primaryCtaAr || "استكشف أعمالنا",
                url: data.hero?.primaryLink || "#archive"
              },
              secondaryCta: {
                labelEn: data.hero?.secondaryCtaEn || "Start a Project",
                labelAr: data.hero?.secondaryCtaAr || "ابدأ مشروعك",
                url: data.hero?.secondaryLink || "/b2b/contact"
              },
              preset: (data.hero?.preset as any) || "memory-engine",
              animationSpeed: data.hero?.animationSpeed || 2800,
              animationDuration: data.hero?.animationDuration || 600,
              animationType: data.hero?.animationType || "blur-morph",
              wordStyle: data.hero?.wordStyle || "static-gradient",
              enableRotatingWords: data.hero?.enableRotatingWords !== false,
              media: data.hero?.media || {
                mediaType: (data.hero?.mediaType as any) || "IMAGE",
                mediaUrl: data.hero?.mediaUrl || "/hero-bg.png",
                posterUrl: data.hero?.posterImage
              }
            }}
            onChange={(updatedHero) => {
              setIsDirty(true);
              setData((prev: any) => ({
                ...prev,
                hero: {
                  ...(prev.hero || {}),
                  ...updatedHero,
                  titleEn: updatedHero.fixedHeadlineEn || prev.hero?.titleEn,
                  titleAr: updatedHero.fixedHeadlineAr || prev.hero?.titleAr,
                  headlineTemplateEn: updatedHero.headlineTemplateEn,
                  headlineTemplateAr: updatedHero.headlineTemplateAr,
                  rotatingWordsEn: updatedHero.rotatingWordsEn,
                  rotatingWordsAr: updatedHero.rotatingWordsAr,
                  subtitleEn: updatedHero.descriptionEn || prev.hero?.subtitleEn,
                  subtitleAr: updatedHero.descriptionAr || prev.hero?.subtitleAr,
                  descriptionEn: updatedHero.descriptionEn || prev.hero?.descriptionEn,
                  descriptionAr: updatedHero.descriptionAr || prev.hero?.descriptionAr,
                  mediaType: updatedHero.media?.mediaType || prev.hero?.mediaType || "IMAGE",
                  mediaUrl: updatedHero.media?.mediaUrl || prev.hero?.mediaUrl,
                  posterImage: updatedHero.media?.posterUrl || prev.hero?.posterImage,
                  primaryCtaEn: updatedHero.primaryCta?.labelEn || prev.hero?.primaryCtaEn,
                  primaryCtaAr: updatedHero.primaryCta?.labelAr || prev.hero?.primaryCtaAr,
                  primaryLink: updatedHero.primaryCta?.url || prev.hero?.primaryLink,
                  secondaryCtaEn: updatedHero.secondaryCta?.labelEn || prev.hero?.secondaryCtaEn,
                  secondaryCtaAr: updatedHero.secondaryCta?.labelAr || prev.hero?.secondaryCtaAr,
                  secondaryLink: updatedHero.secondaryCta?.url || prev.hero?.secondaryLink,
                }
              }));
            }}
          />
        </div>

        {/* 2. SHOWREEL SECTION */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <div className="flex items-center gap-2.5">
              <Video className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-text-primary">2. Interactive Showreel</h2>
            </div>
            <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
              <input 
                type="checkbox" 
                checked={data.showreel?.enabled !== false} 
                onChange={e => handleChange('showreel', 'enabled', e.target.checked)}
                className="rounded bg-surface-hover border-border-default text-indigo-500 focus:ring-0"
              />
              <span>SECTION ENABLED</span>
            </label>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Showreel Title (En)</label>
                <input 
                  type="text" 
                  value={data.showreel?.titleEn || ""}
                  onChange={e => handleChange('showreel', 'titleEn', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Showreel Title (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.showreel?.titleAr || ""}
                  onChange={e => handleChange('showreel', 'titleAr', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Source Type</label>
                <select
                  value={data.showreel?.mediaType || "YOUTUBE"}
                  onChange={e => handleChange('showreel', 'mediaType', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="YOUTUBE">YouTube Video / Embed URL</option>
                  <option value="VIMEO">Vimeo Video / Embed URL</option>
                  <option value="VIDEO">Direct MP4 / Uploaded Video File</option>
                  <option value="IFRAME">Custom iFrame Embed</option>
                </select>
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  {['YOUTUBE', 'VIMEO', 'IFRAME'].includes(data.showreel?.mediaType || "YOUTUBE") ? "YouTube / Vimeo / External Video URL" : "Video File / Upload"}
                </label>
                {['YOUTUBE', 'VIMEO', 'IFRAME'].includes(data.showreel?.mediaType || "YOUTUBE") ? (
                  <input 
                    type="text" 
                    value={data.showreel?.mediaUrl || ""}
                    onChange={e => handleChange('showreel', 'mediaUrl', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                    className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                ) : (
                  <MediaUploader 
                    value={data.showreel?.mediaUrl || ""} 
                    onChange={url => handleChange('showreel', 'mediaUrl', url)} 
                    accept="video/*"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Cover / Poster Image (Optional Thumbnail)</label>
              <MediaUploader 
                value={data.showreel?.posterImage || ""} 
                onChange={url => handleChange('showreel', 'posterImage', url)} 
                accept="image/*"
              />
            </div>
          </div>
        </div>

        {/* 3. VERIFIED FACT STREAM (AUTOMATICALLY FETCHED FROM CASESTUDY METRICS) */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-text-primary">3. Verified &quot;Did You Know?&quot; Fact Stream</h2>
            </div>
            <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
              <input 
                type="checkbox" 
                checked={data.factStream?.enabled !== false} 
                onChange={e => handleChange('factStream', 'enabled', e.target.checked)}
                className="rounded bg-surface-hover border-border-default text-amber-500 focus:ring-0"
              />
              <span>SECTION ENABLED</span>
            </label>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              <span>Automated Canonical Data Source</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Fact cards are generated automatically from verified impact metrics stored inside published CaseStudy database records.
            </p>
            {!caseStudies.some(cs => cs.isPublished && Array.isArray(cs.metrics) && cs.metrics.length > 0) && (
              <div className="mt-2 text-xs font-bold text-red-400 bg-red-950/60 p-2.5 rounded-lg border border-red-800/60">
                ⚠️ No verified impact metrics are available. Add impact metrics to published case studies under Dashboard &gt; B2B Case Studies.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Eyebrow (En / Ar)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    value={data.factStream?.labelEn || ""}
                    onChange={e => handleChange('factStream', 'labelEn', e.target.value)}
                    placeholder="Did You Know?"
                    className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary"
                  />
                  <input 
                    type="text" 
                    dir="rtl"
                    value={data.factStream?.labelAr || ""}
                    onChange={e => handleChange('factStream', 'labelAr', e.target.value)}
                    placeholder="هل تعلم؟"
                    className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Heading (En / Ar)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    value={data.factStream?.titleEn || ""}
                    onChange={e => handleChange('factStream', 'titleEn', e.target.value)}
                    placeholder="Every Project Leaves a Bigger Story Behind."
                    className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary"
                  />
                  <input 
                    type="text" 
                    dir="rtl"
                    value={data.factStream?.titleAr || ""}
                    onChange={e => handleChange('factStream', 'titleAr', e.target.value)}
                    placeholder="وراء كل مشروع قصة أكبر من الأرقام."
                    className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Max Facts Limit</label>
                <input 
                  type="number" 
                  min="1" 
                  max="20"
                  value={data.factStream?.maxFacts ?? 5}
                  onChange={e => handleChange('factStream', 'maxFacts', parseInt(e.target.value))}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Slide Duration (Sec)</label>
                <input 
                  type="number" 
                  min="2" 
                  max="30"
                  value={data.factStream?.rotationDuration ?? 5}
                  onChange={e => handleChange('factStream', 'rotationDuration', parseInt(e.target.value))}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Ordering Strategy</label>
                <select
                  value={data.factStream?.displayOrder || "FEATURED_FIRST"}
                  onChange={e => handleChange('factStream', 'displayOrder', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary"
                >
                  <option value="FEATURED_FIRST">Featured Projects First</option>
                  <option value="NEWEST_FIRST">Newest Projects First</option>
                  <option value="MANUAL">Selected Case Studies Only</option>
                </select>
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-text-primary mb-2">
                  <input 
                    type="checkbox" 
                    checked={data.factStream?.showProjectTitle !== false}
                    onChange={e => handleChange('factStream', 'showProjectTitle', e.target.checked)}
                    className="rounded bg-surface-hover border-border-default text-amber-500"
                  />
                  <span>Show Project Title Badge</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FEATURED CASE STUDIES (EXPLICIT MANUAL SELECTION & ORDERING) */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-text-primary">4. Featured Case Studies</h2>
            </div>
            <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
              <input 
                type="checkbox" 
                checked={data.featuredCases?.enabled !== false} 
                onChange={e => handleChange('featuredCases', 'enabled', e.target.checked)}
                className="rounded bg-surface-hover border-border-default text-emerald-500 focus:ring-0"
              />
              <span>SECTION ENABLED</span>
            </label>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (En)</label>
                <input 
                  type="text" 
                  value={data.featuredCases?.titleEn || ""}
                  onChange={e => handleChange('featuredCases', 'titleEn', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.featuredCases?.titleAr || ""}
                  onChange={e => handleChange('featuredCases', 'titleAr', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Selection Mode</label>
                <select
                  value={data.featuredCases?.selectionMode || "FEATURED_FLAG"}
                  onChange={e => handleChange('featuredCases', 'selectionMode', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary font-bold"
                >
                  <option value="FEATURED_FLAG">Automatic (Use database isFeatured flag)</option>
                  <option value="MANUAL">Manual Selection &amp; Ordering</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Max Display Limit</label>
                <input 
                  type="number"
                  min="1"
                  max="12"
                  value={data.featuredCases?.maxItems ?? 3}
                  onChange={e => handleChange('featuredCases', 'maxItems', parseInt(e.target.value))}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary"
                />
              </div>
            </div>

            {/* MANUAL SELECTION CONTROLS */}
            {data.featuredCases?.selectionMode === 'MANUAL' && (
              <div className="space-y-6 pt-4 border-t border-border-default">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-text-primary">Manual Case Study Selector</h3>
                    <p className="text-xs text-text-secondary">Select published projects to feature and adjust their exact display sequence.</p>
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                    {(data.featuredCases?.selectedCaseStudyIds || []).length} Selected
                  </div>
                </div>

                {(data.featuredCases?.selectedCaseStudyIds || []).length === 0 && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300">
                    ⚠️ No case studies selected. No featured cards will be rendered publicly in Manual Mode.
                  </div>
                )}

                {/* ORDERED SELECTED LIST */}
                {(data.featuredCases?.selectedCaseStudyIds || []).length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Ordered Selected List (Top = First Card)</label>
                    <div className="space-y-2">
                      {(data.featuredCases?.selectedCaseStudyIds || []).map((id: string, idx: number) => {
                        const cs = caseStudies.find(c => String(c.id) === String(id));
                        return (
                          <div key={id || idx} className="flex items-center justify-between p-3 bg-surface-hover border border-border-default rounded-xl">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              {cs ? (
                                <div>
                                  <div className="text-sm font-bold text-text-primary">{cs.titleEn}</div>
                                  <div className="text-xs text-text-secondary font-mono">{cs.clientName || 'General Client'} • {cs.year}</div>
                                </div>
                              ) : (
                                <div className="text-xs font-bold text-red-400">
                                  ⚠️ Saved Case Study ID [{id}] no longer resolves to a published record.
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button 
                                type="button"
                                onClick={() => moveFeaturedCaseOrder(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1.5 hover:bg-surface-active rounded-lg text-text-secondary disabled:opacity-30"
                                title="Move Up"
                              >
                                ↑
                              </button>
                              <button 
                                type="button"
                                onClick={() => moveFeaturedCaseOrder(idx, 'down')}
                                disabled={idx === (data.featuredCases?.selectedCaseStudyIds || []).length - 1}
                                className="p-1.5 hover:bg-surface-active rounded-lg text-text-secondary disabled:opacity-30"
                                title="Move Down"
                              >
                                ↓
                              </button>
                              <button 
                                type="button"
                                onClick={() => toggleFeaturedCaseSelection(id)}
                                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg ml-2"
                                title="Remove Selection"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* PUBLISHED PROJECTS CHECKBOX SELECTOR */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Available Published Projects</label>
                  <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-3 bg-surface-hover rounded-xl border border-border-default scrollbar-thin">
                    {caseStudies.map(cs => {
                      const isSelected = (data.featuredCases?.selectedCaseStudyIds || []).includes(String(cs.id));
                      return (
                        <label 
                          key={cs.id} 
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-emerald-500/10 border-emerald-500/50 text-text-primary' 
                              : 'bg-surface-default border-border-default text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFeaturedCaseSelection(String(cs.id))}
                            className="rounded border-border-default text-emerald-500 focus:ring-0"
                          />
                          <div className="truncate text-xs font-bold">
                            <div>{cs.titleEn}</div>
                            <div className="text-[10px] font-mono text-zinc-500">{cs.clientName || 'General'} • {cs.year}</div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. TEAM STORIES - BEHIND THE BUILD */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-text-primary">5. Team Stories — &quot;Behind the Build&quot;</h2>
            </div>
            <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
              <input 
                type="checkbox" 
                checked={data.teamStories?.enabled !== false} 
                onChange={e => handleChange('teamStories', 'enabled', e.target.checked)}
                className="rounded bg-surface-hover border-border-default text-purple-500 focus:ring-0"
              />
              <span>SECTION ENABLED</span>
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary">Team Story Cards</h3>
              <AdminButton variant="secondary" onClick={addTeamStory} className="flex items-center gap-1.5 text-xs">
                <Plus className="w-4 h-4" />
                <span>Add Story Card</span>
              </AdminButton>
            </div>

            {(data.teamStories?.stories || []).map((story: any, index: number) => (
              <div key={story.id || index} className="p-4 bg-surface-hover border border-border-default rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-400 uppercase">Story #{index + 1}</span>
                  <button 
                    onClick={() => removeTeamStory(index)}
                    className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-secondary font-bold uppercase">Role Title (En)</label>
                    <input 
                      type="text"
                      value={story.roleEn || ""}
                      onChange={e => updateTeamStory(index, 'roleEn', e.target.value)}
                      className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary font-bold uppercase">Role Title (Ar)</label>
                    <input 
                      type="text"
                      dir="rtl"
                      value={story.roleAr || ""}
                      onChange={e => updateTeamStory(index, 'roleAr', e.target.value)}
                      className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-secondary font-bold uppercase">Personal Quote (En)</label>
                    <textarea 
                      value={story.quoteEn || ""}
                      onChange={e => updateTeamStory(index, 'quoteEn', e.target.value)}
                      className="w-full h-16 bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary font-bold uppercase">Personal Quote (Ar)</label>
                    <textarea 
                      dir="rtl"
                      value={story.quoteAr || ""}
                      onChange={e => updateTeamStory(index, 'quoteAr', e.target.value)}
                      className="w-full h-16 bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-secondary font-bold uppercase">Select Team Member (Database Profile)</label>
                    <select
                      value={story.employeeProfileId || ""}
                      onChange={e => updateTeamStory(index, 'employeeProfileId', e.target.value)}
                      className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary"
                    >
                      <option value="">-- Select Team Member Profile --</option>
                      {employeeProfiles.map(ep => (
                        <option key={ep.id} value={ep.id}>{ep.firstName} {ep.lastName} ({ep.designation || 'Specialist'})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary font-bold uppercase">Associated Case Study</label>
                    <select
                      value={story.caseStudyId || ""}
                      onChange={e => updateTeamStory(index, 'caseStudyId', e.target.value)}
                      className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary"
                    >
                      <option value="">-- No Linked Case Study --</option>
                      {caseStudies.map(cs => (
                        <option key={cs.id} value={cs.id}>{cs.titleEn} ({cs.clientName || 'General'})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BEFORE & AFTER TRANSFORMATIONS */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-text-primary">Before & After Transformations</h2>
            </div>
            <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
              <input 
                type="checkbox" 
                checked={data.transformations?.enabled !== false} 
                onChange={e => handleChange('transformations', 'enabled', e.target.checked)}
                className="rounded bg-surface-hover border-border-default text-amber-500 focus:ring-0"
              />
              <span>SECTION ENABLED</span>
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary">Transformation Cards</h3>
              <AdminButton variant="secondary" onClick={addTransformation} className="flex items-center gap-1.5 text-xs">
                <Plus className="w-4 h-4" />
                <span>Add Transformation Pair</span>
              </AdminButton>
            </div>

            {(data.transformations?.items || []).map((tr: any, index: number) => (
              <div key={tr.id || index} className="p-4 bg-surface-hover border border-border-default rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase">Pair #{index + 1}</span>
                  <button 
                    onClick={() => removeTransformation(index)}
                    className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Pair</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-secondary font-bold uppercase">Before Image URL</label>
                    <MediaUploader 
                      value={tr.beforeUrl || ""} 
                      onChange={url => updateTransformation(index, 'beforeUrl', url)} 
                      accept="image/*"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary font-bold uppercase">After Image URL</label>
                    <MediaUploader 
                      value={tr.afterUrl || ""} 
                      onChange={url => updateTransformation(index, 'afterUrl', url)} 
                      accept="image/*"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-secondary font-bold uppercase">Before Label (En / Ar)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text"
                        value={tr.beforeLabelEn || ""}
                        onChange={e => updateTransformation(index, 'beforeLabelEn', e.target.value)}
                        placeholder="Before Build"
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary"
                      />
                      <input 
                        type="text"
                        dir="rtl"
                        value={tr.beforeLabelAr || ""}
                        onChange={e => updateTransformation(index, 'beforeLabelAr', e.target.value)}
                        placeholder="قبل التنفيذ"
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary font-bold uppercase">After Label (En / Ar)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text"
                        value={tr.afterLabelEn || ""}
                        onChange={e => updateTransformation(index, 'afterLabelEn', e.target.value)}
                        placeholder="Live Activation"
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary"
                      />
                      <input 
                        type="text"
                        dir="rtl"
                        value={tr.afterLabelAr || ""}
                        onChange={e => updateTransformation(index, 'afterLabelAr', e.target.value)}
                        placeholder="التشغيل الحي"
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-secondary font-bold uppercase">Associated Case Study</label>
                  <select
                    value={tr.caseStudyId || ""}
                    onChange={e => updateTransformation(index, 'caseStudyId', e.target.value)}
                    className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary"
                  >
                    <option value="">-- No Linked Case Study --</option>
                    {caseStudies.map(cs => (
                      <option key={cs.id} value={cs.id}>{cs.titleEn} ({cs.clientName || 'General'})</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. IMPACT OVERVIEW / STATISTICS */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-text-primary">6. Impact Overview / Statistics</h2>
            </div>
            <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
              <input 
                type="checkbox" 
                checked={data.impactOverview?.enabled !== false} 
                onChange={e => handleChange('impactOverview', 'enabled', e.target.checked)}
                className="rounded bg-surface-hover border-border-default text-emerald-500 focus:ring-0"
              />
              <span>SECTION ENABLED</span>
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary">Verified Statistics Cards</h3>
              <AdminButton variant="secondary" onClick={addImpactStat} className="flex items-center gap-1.5 text-xs">
                <Plus className="w-4 h-4" />
                <span>Add Impact Stat</span>
              </AdminButton>
            </div>

            {(data.impactOverview?.stats || []).map((stat: any, index: number) => (
              <div key={stat.id || index} className="p-4 bg-surface-hover border border-border-default rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Stat #{index + 1}</span>
                  <button 
                    onClick={() => removeImpactStat(index)}
                    className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-text-secondary font-bold uppercase">Value</label>
                    <input 
                      type="text"
                      value={stat.value || ""}
                      onChange={e => updateImpactStat(index, 'value', e.target.value)}
                      placeholder="1.2M+"
                      className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary font-bold uppercase">Label (En)</label>
                    <input 
                      type="text"
                      value={stat.labelEn || ""}
                      onChange={e => updateImpactStat(index, 'labelEn', e.target.value)}
                      className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary font-bold uppercase">Label (Ar)</label>
                    <input 
                      type="text"
                      dir="rtl"
                      value={stat.labelAr || ""}
                      onChange={e => updateImpactStat(index, 'labelAr', e.target.value)}
                      className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. FOOTER CTA */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <h2 className="text-lg font-bold text-text-primary">7. Final Commercial CTA</h2>
            <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
              <input 
                type="checkbox" 
                checked={data.cta?.enabled !== false} 
                onChange={e => handleChange('cta', 'enabled', e.target.checked)}
                className="rounded bg-surface-hover border-border-default text-emerald-500 focus:ring-0"
              />
              <span>SECTION ENABLED</span>
            </label>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Headline (En)</label>
                <input 
                  type="text" 
                  value={data.cta?.headlineEn || data.cta?.titleEn || ""}
                  onChange={e => handleChange('cta', 'headlineEn', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Headline (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.cta?.headlineAr || data.cta?.titleAr || ""}
                  onChange={e => handleChange('cta', 'headlineAr', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Primary Button (En)</label>
                <input 
                  type="text" 
                  value={data.cta?.primaryCtaEn || ""}
                  onChange={e => handleChange('cta', 'primaryCtaEn', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Primary Button (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.cta?.primaryCtaAr || ""}
                  onChange={e => handleChange('cta', 'primaryCtaAr', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Button Link</label>
                <input 
                  type="text" 
                  value={data.cta?.primaryLink || "/b2b/contact"}
                  onChange={e => handleChange('cta', 'primaryLink', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEO Customizer */}
        <AdminSeoCustomizer seo={seo} setSeo={setSeo} formData={null} setFormData={() => {}} />

      </AdminFormLayout>

      <DashboardStickyActions
        onSave={handleSave}
        isSaving={saving}
        isUnsaved={isDirty}
        onDiscard={() => {
          if (confirm("Discard unsaved changes?")) {
            window.location.reload();
          }
        }}
      />
    </DashboardPageShell>
  )
}
