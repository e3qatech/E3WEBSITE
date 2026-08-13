"use client"

import { useState } from "react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminButton } from "../ui/AdminButton"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { MediaUploader } from "@/components/shared/MediaUploader"
import { AdminSeoCustomizer } from "../ui/AdminSeoCustomizer"
import { Plus, Trash2, Layers, Video, Sparkles, Trophy, Users, Clock, Flame, BarChart3, CheckSquare, Eye, ArrowUpRight } from "lucide-react"

export function B2BCasesEditor({ 
  initialData, 
  caseStudies = [], 
  services = [],
  employeeProfiles = []
}: { 
  initialData: any, 
  caseStudies?: any[], 
  services?: any[],
  employeeProfiles?: any[]
}) {
  const [data, setData] = useState(initialData)
  const [seo, setSeo] = useState<any>(initialData?.seo || {})
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
      toast("B2B Case Studies landing page updated successfully.", "success")
    } catch (e) {
      console.error(e)
      toast("Failed to save B2B Case Studies landing page.", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (section: string, field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }))
  }

  // Fact Stream repeatable actions
  const addFact = () => {
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

  const removeFact = (index: number) => {
    setData((prev: any) => ({
      ...prev,
      factStream: {
        ...prev.factStream,
        facts: (prev.factStream?.facts || []).filter((_: any, i: number) => i !== index)
      }
    }))
  }

  const updateFact = (index: number, field: string, value: any) => {
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

  return (
    <div className="flex flex-col gap-6 h-full p-6 text-text-primary">
      <AdminPageHeader 
        title="B2B Case Studies Landing Page Editor"
        description="Manage all 12 interactive sections of the landmark projects showcase (b2b-cases)."
        action={
          <div className="flex items-center gap-3">
            <a 
              href="/en/b2b/cases" 
              target="_blank" 
              rel="noreferrer"
              className="px-4 py-2 bg-surface-hover border border-border-default rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-surface-active transition-colors"
            >
              <span>Preview Public Page</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving Changes..." : "Save All Sections"}
            </AdminButton>
          </div>
        }
      />

      <AdminFormLayout>
        {/* 1. HERO SECTION */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-text-primary">1. Cinematic Hero Section</h2>
            </div>
            <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
              <input 
                type="checkbox" 
                checked={data.hero?.enabled !== false} 
                onChange={e => handleChange('hero', 'enabled', e.target.checked)}
                className="rounded bg-surface-hover border-border-default text-emerald-500 focus:ring-0"
              />
              <span>SECTION ENABLED</span>
            </label>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Eyebrow (En)</label>
                <input 
                  type="text" 
                  value={data.hero?.eyebrowEn || ""}
                  onChange={e => handleChange('hero', 'eyebrowEn', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Eyebrow (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.hero?.eyebrowAr || ""}
                  onChange={e => handleChange('hero', 'eyebrowAr', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Headline (En)</label>
                <input 
                  type="text" 
                  value={data.hero?.titleEn || ""}
                  onChange={e => handleChange('hero', 'titleEn', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Headline (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.hero?.titleAr || ""}
                  onChange={e => handleChange('hero', 'titleAr', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Description (En)</label>
                <textarea 
                  value={data.hero?.subtitleEn || ""}
                  onChange={e => handleChange('hero', 'subtitleEn', e.target.value)}
                  className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Description (Ar)</label>
                <textarea 
                  dir="rtl"
                  value={data.hero?.subtitleAr || ""}
                  onChange={e => handleChange('hero', 'subtitleAr', e.target.value)}
                  className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-border-default">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Media Type</label>
                <select 
                  value={data.hero?.mediaType || "IMAGE"}
                  onChange={e => handleChange('hero', 'mediaType', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                  <option value="SPLINE">Spline / 3D Scene</option>
                  <option value="IFRAME">iFrame Embed</option>
                </select>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Desktop Media URL</label>
                <MediaUploader 
                  value={data.hero?.mediaUrl || ""} 
                  onChange={url => handleChange('hero', 'mediaUrl', url)} 
                  accept={data.hero?.mediaType === 'VIDEO' ? "video/*" : "image/*"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Primary CTA Text (En)</label>
                <input 
                  type="text" 
                  value={data.hero?.primaryCtaEn || ""}
                  onChange={e => handleChange('hero', 'primaryCtaEn', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Primary CTA Text (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.hero?.primaryCtaAr || ""}
                  onChange={e => handleChange('hero', 'primaryCtaAr', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
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
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Showreel Video URL</label>
              <MediaUploader 
                value={data.showreel?.mediaUrl || ""} 
                onChange={url => handleChange('showreel', 'mediaUrl', url)} 
                accept="video/*"
              />
            </div>
          </div>
        </div>

        {/* 3. FACT STREAM SECTION */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-text-primary">3. "Did You Know?" Fact Stream</h2>
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

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Heading (En)</label>
                <input 
                  type="text" 
                  value={data.factStream?.titleEn || ""}
                  onChange={e => handleChange('factStream', 'titleEn', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Heading (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.factStream?.titleAr || ""}
                  onChange={e => handleChange('factStream', 'titleAr', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Fact List */}
            <div className="space-y-4 pt-4 border-t border-border-default">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary">Verified Fact Cards</h3>
                <AdminButton variant="secondary" onClick={addFact} className="flex items-center gap-1.5 text-xs">
                  <Plus className="w-4 h-4" />
                  <span>Add Fact Card</span>
                </AdminButton>
              </div>

              {(data.factStream?.facts || []).map((fact: any, index: number) => (
                <div key={fact.id || index} className="p-4 bg-surface-hover border border-border-default rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">Fact #{index + 1}</span>
                    <button 
                      onClick={() => removeFact(index)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-text-secondary font-bold uppercase">Numeric Value</label>
                      <input 
                        type="text"
                        value={fact.value || ""}
                        onChange={e => updateFact(index, 'value', e.target.value)}
                        placeholder="30,000"
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary font-bold uppercase">Prefix</label>
                      <input 
                        type="text"
                        value={fact.prefix || ""}
                        onChange={e => updateFact(index, 'prefix', e.target.value)}
                        placeholder="+"
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary font-bold uppercase">Suffix</label>
                      <input 
                        type="text"
                        value={fact.suffix || ""}
                        onChange={e => updateFact(index, 'suffix', e.target.value)}
                        placeholder="sqm"
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-text-secondary font-bold uppercase">Headline (En)</label>
                      <input 
                        type="text"
                        value={fact.headlineEn || ""}
                        onChange={e => updateFact(index, 'headlineEn', e.target.value)}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary font-bold uppercase">Headline (Ar)</label>
                      <input 
                        type="text"
                        dir="rtl"
                        value={fact.headlineAr || ""}
                        onChange={e => updateFact(index, 'headlineAr', e.target.value)}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-text-secondary font-bold uppercase">Link to Case Study</label>
                    <select
                      value={fact.caseStudyId || ""}
                      onChange={e => updateFact(index, 'caseStudyId', e.target.value)}
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
        </div>

        {/* 4. FEATURED CASE STUDIES */}
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
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.featuredCases?.titleAr || ""}
                  onChange={e => handleChange('featuredCases', 'titleAr', e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Selection Mode</label>
              <select
                value={data.featuredCases?.selectionMode || "FEATURED_FLAG"}
                onChange={e => handleChange('featuredCases', 'selectionMode', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary"
              >
                <option value="FEATURED_FLAG">Automatic (Use database isFeatured flag)</option>
                <option value="MANUAL">Manual Selection</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. TEAM STORIES - BEHIND THE BUILD */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-text-primary">5. Team Stories — "Behind the Build"</h2>
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
    </div>
  )
}
