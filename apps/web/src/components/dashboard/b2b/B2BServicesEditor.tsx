"use client"

import React, { useState } from "react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { MediaUploader } from "@/components/shared/MediaUploader"
import { Plus, Trash2, ArrowUp, ArrowDown, Save } from "lucide-react"
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardStickyActions,
  DashboardUnsavedChangesGuard,
  DashboardLanguageSwitch,
  LanguageEditMode,
  EditorSectionItem,
} from "@/components/dashboard/ui"

const SECTIONS: EditorSectionItem[] = [
  { id: "hero", label: "1. Hero Section" },
  { id: "capabilityCount", label: "2. Capability Metrics" },
  { id: "philosophy", label: "3. WOW & HOW" },
  { id: "navigator", label: "4. Bento Navigator" },
  { id: "spotlights", label: "5. Spotlights" },
  { id: "methodology", label: "6. Methodology" },
  { id: "caseStudies", label: "7. Case Studies" },
  { id: "partnerRibbon", label: "8. Partner Ribbon" },
  { id: "cta", label: "9. RFP Gateway" },
  { id: "seo", label: "10. SEO Metadata" },
]

export function B2BServicesEditor({ 
  initialData, 
  services = [], 
  caseStudies = [] 
}: { 
  initialData: any
  services?: any[]
  caseStudies?: any[]
}) {
  const [langMode, setLangMode] = useState<LanguageEditMode>("en")
  const activeLang = langMode === "ar" ? "ar" : "en"
  const [activeSectionId, setActiveSectionId] = useState("hero")
  const [isDirty, setIsDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const [data, setData] = useState<any>({
    hero: initialData?.hero || {},
    capabilityCount: initialData?.capabilityCount || {},
    philosophy: initialData?.philosophy || {},
    navigator: initialData?.navigator || {},
    featuredSpotlights: initialData?.featuredSpotlights || {},
    deliveryMethodology: initialData?.deliveryMethodology || {},
    caseStudies: initialData?.caseStudies || {},
    partnerRibbon: initialData?.partnerRibbon || {},
    cta: initialData?.cta || {},
    seo: initialData?.seo || {}
  })

  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2b-services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data, seo: data.seo })
      })
      if (!res.ok) throw new Error("Failed to save")
      setIsDirty(false)
      setLastSaved(new Date())
      toast("B2B Services CMS configuration saved successfully.", "success")
    } catch (e) {
      console.error(e)
      toast("Failed to save B2B Services configuration.", "error")
    } finally {
      setSaving(false)
    }
  }

  const updateSection = (section: string, field: string, value: any) => {
    setIsDirty(true)
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }))
  }

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      <DashboardPageHeader 
        title="B2B Services Page Editor"
        description="Manage hero, capability count, WOW & HOW philosophy, bento navigator, spotlights, methodology pipeline, proof & case studies, RFP CTA, and SEO (/b2b/services)."
        breadcrumbs={[
          { label: "B2B Pages", href: "/dashboard/b2b/home" },
          { label: "Services Page Editor" },
        ]}
        badge={{ label: "B2B Public", variant: "warning" }}
        previewUrl="/b2b/services"
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: saving ? "Saving..." : "Save Changes",
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />
        }}
        secondaryAction={
          <DashboardLanguageSwitch mode={langMode} onModeChange={setLangMode} />
        }
      />

      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeSectionId}
        onSectionChange={setActiveSectionId}
      />

      <AdminFormLayout>
        {/* 1. HERO SECTION */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <h2 className="text-lg font-bold text-text-primary">1. Hero Section</h2>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input 
                type="checkbox"
                checked={data.hero?.enabled !== false}
                onChange={e => updateSection('hero', 'enabled', e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span>Section Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Eyebrow Badge ({activeLang.toUpperCase()})</label>
              <input 
                type="text" 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.hero?.eyebrowEn || "") : (data.hero?.eyebrowAr || "")}
                onChange={e => updateSection('hero', activeLang === 'en' ? 'eyebrowEn' : 'eyebrowAr', e.target.value)}
                placeholder="e.g. E3 ENTERPRISE CAPABILITIES"
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Headline ({activeLang.toUpperCase()})</label>
              <input 
                type="text" 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.hero?.titleEn || data.hero?.title || "") : (data.hero?.titleAr || "")}
                onChange={e => updateSection('hero', activeLang === 'en' ? 'titleEn' : 'titleAr', e.target.value)}
                placeholder="e.g. Services That Build Living Experience Landmarks."
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Subtitle ({activeLang.toUpperCase()})</label>
              <textarea 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.hero?.subtitleEn || data.hero?.subtitle || "") : (data.hero?.subtitleAr || "")}
                onChange={e => updateSection('hero', activeLang === 'en' ? 'subtitleEn' : 'subtitleAr', e.target.value)}
                className="w-full h-20 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Supporting Description ({activeLang.toUpperCase()})</label>
              <textarea 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.hero?.descriptionEn || data.hero?.description || "") : (data.hero?.descriptionAr || "")}
                onChange={e => updateSection('hero', activeLang === 'en' ? 'descriptionEn' : 'descriptionAr', e.target.value)}
                className="w-full h-20 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-border-default">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Hero Media Type</label>
              <select 
                value={data.hero?.mediaType || "IMAGE"}
                onChange={e => updateSection('hero', 'mediaType', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="SPLINE">Spline / 3D Scene</option>
                <option value="IFRAME">iFrame Embed</option>
              </select>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Desktop Media URL</label>
              {['IFRAME', 'SPLINE'].includes(data.hero?.mediaType) ? (
                <input 
                  type="text" 
                  value={data.hero?.mediaUrl || ""}
                  onChange={e => updateSection('hero', 'mediaUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              ) : (
                <MediaUploader 
                  value={data.hero?.mediaUrl || ""} 
                  onChange={url => updateSection('hero', 'mediaUrl', url)} 
                  accept={data.hero?.mediaType === 'VIDEO' ? "video/*" : "image/*"}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border-default">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Primary CTA Label ({activeLang.toUpperCase()})</label>
              <input 
                type="text" 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.hero?.primaryCtaEn || "") : (data.hero?.primaryCtaAr || "")}
                onChange={e => updateSection('hero', activeLang === 'en' ? 'primaryCtaEn' : 'primaryCtaAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Primary CTA Link</label>
              <input 
                type="text" 
                value={data.hero?.primaryLink || "#capability-navigator"}
                onChange={e => updateSection('hero', 'primaryLink', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. CAPABILITY COUNT STATEMENT */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <h2 className="text-lg font-bold text-text-primary">2. Capability Count Statement</h2>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input 
                type="checkbox"
                checked={data.capabilityCount?.enabled !== false}
                onChange={e => updateSection('capabilityCount', 'enabled', e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span>Section Enabled</span>
            </label>
          </div>

          <p className="text-xs text-text-secondary">
            Use the token <code className="bg-surface-hover px-1.5 py-0.5 rounded text-primary font-mono font-bold">&#123;&#123;count&#125;&#125;</code> to dynamically display the number of active, published services fetched from the database.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Template (EN)</label>
              <input 
                type="text" 
                value={data.capabilityCount?.templateEn || "{{count}} Specialised Capabilities. One Integrated Partner."}
                onChange={e => updateSection('capabilityCount', 'templateEn', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Template (AR)</label>
              <input 
                type="text" 
                dir="rtl"
                value={data.capabilityCount?.templateAr || "{{count}} قدرات تخصصية متكاملة. شريك واحد."}
                onChange={e => updateSection('capabilityCount', 'templateAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. THE WOW & THE HOW (PHILOSOPHY) */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <h2 className="text-lg font-bold text-text-primary">3. The WOW & The HOW (Service Philosophy)</h2>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input 
                type="checkbox"
                checked={data.philosophy?.enabled !== false}
                onChange={e => updateSection('philosophy', 'enabled', e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span>Section Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Title ({activeLang.toUpperCase()})</label>
              <input 
                type="text" 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.philosophy?.titleEn || "") : (data.philosophy?.titleAr || "")}
                onChange={e => updateSection('philosophy', activeLang === 'en' ? 'titleEn' : 'titleAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Subtitle ({activeLang.toUpperCase()})</label>
              <input 
                type="text" 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.philosophy?.subtitleEn || "") : (data.philosophy?.subtitleAr || "")}
                onChange={e => updateSection('philosophy', activeLang === 'en' ? 'subtitleEn' : 'subtitleAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Creative Bullets */}
          <div className="space-y-3 pt-4 border-t border-border-default">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Creative Vision (The WOW Bullets)</h3>
              <button 
                type="button"
                onClick={() => {
                  const current = data.philosophy?.creativeBullets || []
                  updateSection('philosophy', 'creativeBullets', [...current, { id: `c-${Date.now()}`, textEn: '', textAr: '' }])
                }}
                className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Creative Bullet
              </button>
            </div>

            {(data.philosophy?.creativeBullets || []).map((bullet: any, idx: number) => (
              <div key={bullet.id || idx} className="flex items-center gap-3 bg-surface-hover p-3 rounded-lg border border-border-default">
                <input 
                  type="text" 
                  dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                  value={activeLang === 'en' ? (bullet.textEn || "") : (bullet.textAr || "")}
                  onChange={e => {
                    const bullets = [...(data.philosophy?.creativeBullets || [])]
                    bullets[idx][activeLang === 'en' ? 'textEn' : 'textAr'] = e.target.value
                    updateSection('philosophy', 'creativeBullets', bullets)
                  }}
                  placeholder={`Bullet ${idx + 1}...`}
                  className="flex-1 bg-surface-default border border-border-default rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none"
                />
                <button 
                  type="button"
                  onClick={() => {
                    const bullets = [...(data.philosophy?.creativeBullets || [])]
                    bullets.splice(idx, 1)
                    updateSection('philosophy', 'creativeBullets', bullets)
                  }}
                  className="text-text-tertiary hover:text-error transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Operational Bullets */}
          <div className="space-y-3 pt-4 border-t border-border-default">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Operational Engineering (The HOW Bullets)</h3>
              <button 
                type="button"
                onClick={() => {
                  const current = data.philosophy?.engineeringBullets || []
                  updateSection('philosophy', 'engineeringBullets', [...current, { id: `e-${Date.now()}`, textEn: '', textAr: '' }])
                }}
                className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Operational Bullet
              </button>
            </div>

            {(data.philosophy?.engineeringBullets || []).map((bullet: any, idx: number) => (
              <div key={bullet.id || idx} className="flex items-center gap-3 bg-surface-hover p-3 rounded-lg border border-border-default">
                <input 
                  type="text" 
                  dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                  value={activeLang === 'en' ? (bullet.textEn || "") : (bullet.textAr || "")}
                  onChange={e => {
                    const bullets = [...(data.philosophy?.engineeringBullets || [])]
                    bullets[idx][activeLang === 'en' ? 'textEn' : 'textAr'] = e.target.value
                    updateSection('philosophy', 'engineeringBullets', bullets)
                  }}
                  placeholder={`Bullet ${idx + 1}...`}
                  className="flex-1 bg-surface-default border border-border-default rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none"
                />
                <button 
                  type="button"
                  onClick={() => {
                    const bullets = [...(data.philosophy?.engineeringBullets || [])]
                    bullets.splice(idx, 1)
                    updateSection('philosophy', 'engineeringBullets', bullets)
                  }}
                  className="text-text-tertiary hover:text-error transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. CORE CAPABILITIES NAVIGATOR */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <h2 className="text-lg font-bold text-text-primary">4. Core Capabilities Navigator (Bento Grid)</h2>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input 
                type="checkbox"
                checked={data.navigator?.enabled !== false}
                onChange={e => updateSection('navigator', 'enabled', e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span>Section Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Title ({activeLang.toUpperCase()})</label>
              <input 
                type="text" 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.navigator?.titleEn || "") : (data.navigator?.titleAr || "")}
                onChange={e => updateSection('navigator', activeLang === 'en' ? 'titleEn' : 'titleAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Service Source Mode</label>
              <select 
                value={data.navigator?.sourceMode || "ALL"}
                onChange={e => updateSection('navigator', 'sourceMode', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none font-semibold"
              >
                <option value="ALL">All Active & Visible Services (Default)</option>
                <option value="MANUAL">Manually Selected Services Only</option>
              </select>
            </div>
          </div>

          {data.navigator?.sourceMode === 'MANUAL' && (
            <div className="space-y-3 pt-4 border-t border-border-default">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Select & Order Services to Display</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-3 border border-border-default rounded-lg bg-surface-hover">
                {services.map(s => {
                  const isChecked = (data.navigator?.selectedServiceIds || []).includes(s.id)
                  return (
                    <label key={s.id} className="flex items-center gap-3 p-2 rounded hover:bg-surface-default cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          const current = data.navigator?.selectedServiceIds || []
                          if (e.target.checked) {
                            updateSection('navigator', 'selectedServiceIds', [...current, s.id])
                          } else {
                            updateSection('navigator', 'selectedServiceIds', current.filter((id: string) => id !== s.id))
                          }
                        }}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-sm font-semibold">{s.titleEn || s.slug}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 5. FEATURED SERVICE SPOTLIGHTS */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <h2 className="text-lg font-bold text-text-primary">5. Featured Service Spotlights</h2>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input 
                type="checkbox"
                checked={data.featuredSpotlights?.enabled !== false}
                onChange={e => updateSection('featuredSpotlights', 'enabled', e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span>Section Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Title ({activeLang.toUpperCase()})</label>
              <input 
                type="text" 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.featuredSpotlights?.titleEn || "") : (data.featuredSpotlights?.titleAr || "")}
                onChange={e => updateSection('featuredSpotlights', activeLang === 'en' ? 'titleEn' : 'titleAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Selection Mode</label>
              <select 
                value={data.featuredSpotlights?.selectionMode || "FEATURED_FLAG"}
                onChange={e => updateSection('featuredSpotlights', 'selectionMode', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none font-semibold"
              >
                <option value="FEATURED_FLAG">Use Database isFeatured Flag</option>
                <option value="MANUAL">Manual Service Selection</option>
              </select>
            </div>
          </div>

          {data.featuredSpotlights?.selectionMode === 'MANUAL' && (
            <div className="space-y-3 pt-4 border-t border-border-default">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Select Featured Services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-3 border border-border-default rounded-lg bg-surface-hover">
                {services.map(s => {
                  const isChecked = (data.featuredSpotlights?.selectedServiceIds || []).includes(s.id)
                  return (
                    <label key={s.id} className="flex items-center gap-3 p-2 rounded hover:bg-surface-default cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          const current = data.featuredSpotlights?.selectedServiceIds || []
                          if (e.target.checked) {
                            updateSection('featuredSpotlights', 'selectedServiceIds', [...current, s.id])
                          } else {
                            updateSection('featuredSpotlights', 'selectedServiceIds', current.filter((id: string) => id !== s.id))
                          }
                        }}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-sm font-semibold">{s.titleEn || s.slug}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 6. DELIVERY METHODOLOGY PIPELINE */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <h2 className="text-lg font-bold text-text-primary">6. Delivery Methodology Pipeline</h2>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input 
                type="checkbox"
                checked={data.deliveryMethodology?.enabled !== false}
                onChange={e => updateSection('deliveryMethodology', 'enabled', e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span>Section Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Pipeline Title ({activeLang.toUpperCase()})</label>
              <input 
                type="text" 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.deliveryMethodology?.titleEn || "") : (data.deliveryMethodology?.titleAr || "")}
                onChange={e => updateSection('deliveryMethodology', activeLang === 'en' ? 'titleEn' : 'titleAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border-default">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Pipeline Steps</h3>
              <button 
                type="button"
                onClick={() => {
                  const current = data.deliveryMethodology?.steps || []
                  const num = String(current.length + 1).padStart(2, '0')
                  updateSection('deliveryMethodology', 'steps', [...current, { id: `s-${Date.now()}`, stepNumber: num, nameEn: '', nameAr: '', descEn: '', descAr: '' }])
                }}
                className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Pipeline Step
              </button>
            </div>

            {(data.deliveryMethodology?.steps || []).map((step: any, idx: number) => (
              <div key={step.id || idx} className="p-4 border border-border-default rounded-lg bg-surface-hover space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary">STEP {step.stepNumber || String(idx + 1).padStart(2, '0')}</span>
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        const steps = [...(data.deliveryMethodology?.steps || [])]
                        const temp = steps[idx]
                        steps[idx] = steps[idx - 1]
                        steps[idx - 1] = temp
                        updateSection('deliveryMethodology', 'steps', steps)
                      }}
                      className="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button"
                      disabled={idx === (data.deliveryMethodology?.steps || []).length - 1}
                      onClick={() => {
                        const steps = [...(data.deliveryMethodology?.steps || [])]
                        const temp = steps[idx]
                        steps[idx] = steps[idx + 1]
                        steps[idx + 1] = temp
                        updateSection('deliveryMethodology', 'steps', steps)
                      }}
                      className="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const steps = [...(data.deliveryMethodology?.steps || [])]
                        steps.splice(idx, 1)
                        updateSection('deliveryMethodology', 'steps', steps)
                      }}
                      className="p-1 text-text-tertiary hover:text-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                    value={activeLang === 'en' ? (step.nameEn || "") : (step.nameAr || "")}
                    onChange={e => {
                      const steps = [...(data.deliveryMethodology?.steps || [])]
                      steps[idx][activeLang === 'en' ? 'nameEn' : 'nameAr'] = e.target.value
                      updateSection('deliveryMethodology', 'steps', steps)
                    }}
                    placeholder={`Step Title (${activeLang.toUpperCase()})...`}
                    className="bg-surface-default border border-border-default rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none"
                  />
                  <input 
                    type="text" 
                    dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                    value={activeLang === 'en' ? (step.descEn || "") : (step.descAr || "")}
                    onChange={e => {
                      const steps = [...(data.deliveryMethodology?.steps || [])]
                      steps[idx][activeLang === 'en' ? 'descEn' : 'descAr'] = e.target.value
                      updateSection('deliveryMethodology', 'steps', steps)
                    }}
                    placeholder={`Step Description (${activeLang.toUpperCase()})...`}
                    className="bg-surface-default border border-border-default rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. CASE STUDIES / RELATED PROOF */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <h2 className="text-lg font-bold text-text-primary">7. Related Case Studies & Proof</h2>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input 
                type="checkbox"
                checked={data.caseStudies?.enabled !== false}
                onChange={e => updateSection('caseStudies', 'enabled', e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span>Section Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Section Title ({activeLang.toUpperCase()})</label>
              <input 
                type="text" 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.caseStudies?.titleEn || "") : (data.caseStudies?.titleAr || "")}
                onChange={e => updateSection('caseStudies', activeLang === 'en' ? 'titleEn' : 'titleAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Selection Mode</label>
              <select 
                value={data.caseStudies?.selectionMode || "LATEST"}
                onChange={e => updateSection('caseStudies', 'selectionMode', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none font-semibold"
              >
                <option value="LATEST">Latest Published Case Studies</option>
                <option value="MANUAL">Manual Case Study Selection</option>
              </select>
            </div>
          </div>

          {data.caseStudies?.selectionMode === 'MANUAL' && (
            <div className="space-y-3 pt-4 border-t border-border-default">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Select Case Studies</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-3 border border-border-default rounded-lg bg-surface-hover">
                {caseStudies.map(cs => {
                  const isChecked = (data.caseStudies?.selectedCaseStudyIds || []).includes(cs.id)
                  return (
                    <label key={cs.id} className="flex items-center gap-3 p-2 rounded hover:bg-surface-default cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          const current = data.caseStudies?.selectedCaseStudyIds || []
                          if (e.target.checked) {
                            updateSection('caseStudies', 'selectedCaseStudyIds', [...current, cs.id])
                          } else {
                            updateSection('caseStudies', 'selectedCaseStudyIds', current.filter((id: string) => id !== cs.id))
                          }
                        }}
                        className="w-4 h-4 rounded text-primary"
                      />
                      <span className="text-sm font-semibold">{cs.titleEn || cs.slug}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* 8. COMMERCIAL RFP / FINAL CTA */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <h2 className="text-lg font-bold text-text-primary">8. Commercial RFP / Final Call to Action</h2>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input 
                type="checkbox"
                checked={data.cta?.enabled !== false}
                onChange={e => updateSection('cta', 'enabled', e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span>Section Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">CTA Title ({activeLang.toUpperCase()})</label>
              <input 
                type="text" 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.cta?.titleEn || data.cta?.title || "") : (data.cta?.titleAr || "")}
                onChange={e => updateSection('cta', activeLang === 'en' ? 'titleEn' : 'titleAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">CTA Description ({activeLang.toUpperCase()})</label>
              <textarea 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.cta?.descriptionEn || data.cta?.description || "") : (data.cta?.descriptionAr || "")}
                onChange={e => updateSection('cta', activeLang === 'en' ? 'descriptionEn' : 'descriptionAr', e.target.value)}
                className="w-full h-20 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border-default">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Button Label ({activeLang.toUpperCase()})</label>
              <input 
                type="text" 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.cta?.primaryCtaEn || "") : (data.cta?.primaryCtaAr || "")}
                onChange={e => updateSection('cta', activeLang === 'en' ? 'primaryCtaEn' : 'primaryCtaAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Button Link</label>
              <input 
                type="text" 
                value={data.cta?.primaryLink || "/b2b/contact"}
                onChange={e => updateSection('cta', 'primaryLink', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 9. SEO CUSTOMIZER */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary border-b border-border-default pb-4">9. SEO & Open Graph Metadata</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Meta Title ({activeLang.toUpperCase()})</label>
              <input 
                type="text" 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.seo?.metaTitleEn || "") : (data.seo?.metaTitleAr || "")}
                onChange={e => updateSection('seo', activeLang === 'en' ? 'metaTitleEn' : 'metaTitleAr', e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Meta Description ({activeLang.toUpperCase()})</label>
              <textarea 
                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                value={activeLang === 'en' ? (data.seo?.metaDescriptionEn || "") : (data.seo?.metaDescriptionAr || "")}
                onChange={e => updateSection('seo', activeLang === 'en' ? 'metaDescriptionEn' : 'metaDescriptionAr', e.target.value)}
                className="w-full h-20 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

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
