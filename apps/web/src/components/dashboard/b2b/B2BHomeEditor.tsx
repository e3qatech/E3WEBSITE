"use client"

import * as React from "react"
import { AdminFormLayout } from "@/components/dashboard/ui/AdminFormLayout"
import { AdminFormSection, AdminFormGrid } from "@/components/dashboard/ui/AdminFormSection"
import { AdminInput } from "@/components/dashboard/ui/AdminInput"
import { AdminTextarea } from "@/components/dashboard/ui/AdminTextarea"
import { AdminMediaPicker } from "@/components/dashboard/ui/AdminMediaPicker"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { Save } from "lucide-react"

import { AdminSeoCustomizer } from "@/components/dashboard/ui/AdminSeoCustomizer"
import { E3LivingHeroEditor } from "@/components/dashboard/b2c/E3LivingHeroEditor"
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
  { id: "hero", label: "1. Hero Section", labelAr: "1. قسم البداية والواجهة" },
  { id: "stats", label: "2. Key Metrics & Stats", labelAr: "2. المؤشرات والأرقام الرئيسية" },
  { id: "wowAndHow", label: "3. The Wow & How", labelAr: "3. قسم الإبهار والتنفيذ" },
  { id: "blueprintDepth", label: "4. CAD Blueprint & Depth", labelAr: "4. المخطط الهندسي والواقع الحي" },
  { id: "capabilities", label: "5. Strategic Capabilities", labelAr: "5. القدرات والحلول الاستراتيجية" },
  { id: "caseStudies", label: "6. Case Studies Portfolio", labelAr: "6. معرض دراسات الحالة" },
  { id: "deliveryProcess", label: "7. Delivery Process", labelAr: "7. مراحل وآلية التنفيذ" },
  { id: "partnerRibbon", label: "8. Partner Ribbon", labelAr: "8. شريط الشركاء والعملاء" },
  { id: "seo", label: "9. SEO Metadata", labelAr: "9. بيانات محركات البحث (SEO)" },
]

export function B2BHomeEditor({ 
  initialData,
  services = [],
  caseStudies = []
}: { 
  initialData: any
  services?: any[]
  caseStudies?: any[]
}) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDirty, setIsDirty] = React.useState(false)
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null)
  const [activeSectionId, setActiveSectionId] = React.useState("hero")
  const [langMode, setLangMode] = React.useState<LanguageEditMode>("en")
  const activeLang = langMode === "ar" ? "ar" : "en"
  const { toast } = useToast()

  // State
  const [hero, setHero] = React.useState(initialData.content?.hero || {})
  const [stats, setStats] = React.useState<any[]>(initialData.content?.stats || [])
  const [wowAndHow, setWowAndHow] = React.useState(initialData.content?.wowAndHow || {})
  const [blueprintDepth, setBlueprintDepth] = React.useState<any>(initialData.content?.blueprintDepth || {})
  const [capabilities, setCapabilities] = React.useState(initialData.content?.capabilities || {})
  const [caseStudiesSection, setCaseStudiesSection] = React.useState(initialData.content?.caseStudies || initialData.content?.caseStudiesSection || {})
  const [deliveryProcess, setDeliveryProcess] = React.useState(initialData.content?.deliveryProcess || {})
  const [partnerRibbon, setPartnerRibbon] = React.useState(initialData.content?.partnerRibbon || {})
  const [featuredServiceIds, setFeaturedServiceIds] = React.useState<string[]>(initialData.content?.featuredServiceIds || [])
  const [featuredCaseStudyIds, setFeaturedCaseStudyIds] = React.useState<string[]>(initialData.content?.featuredCaseStudyIds || [])
  const [seo, setSeo] = React.useState<any>(initialData.seo || {})

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2b-home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { 
            hero, 
            stats, 
            wowAndHow,
            blueprintDepth,
            capabilities,
            caseStudies: caseStudiesSection,
            deliveryProcess,
            partnerRibbon,
            featuredServiceIds,
            featuredCaseStudyIds
          },
          seo
        })
      })

      if (!res.ok) throw new Error("Failed to save")
      
      setIsDirty(false)
      setLastSaved(new Date())
      toast("B2B Homepage content updated successfully", "success")
    } catch {
      toast("Failed to update B2B homepage content", "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      {/* Standard Page Header */}
      <DashboardPageHeader
        title="B2B Homepage Editor"
        description="Manage the content blocks, video heroes, case studies showcase, and delivery process on the main B2B corporate portal (/b2b)."
        breadcrumbs={[
          { label: "B2B Pages", href: "/dashboard/b2b/home" },
          { label: "Homepage Editor" },
        ]}
        badge={{ label: "B2B Public", variant: "warning" }}
        previewUrl="/b2b"
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: isSaving ? "Saving..." : "Save Changes",
          onClick: handleSave,
          isLoading: isSaving,
          icon: <Save className="w-4 h-4" />
        }}
        secondaryAction={
          <DashboardLanguageSwitch mode={langMode} onModeChange={setLangMode} />
        }
      />

      {/* Section Navigator */}
      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeSectionId}
        onSectionChange={setActiveSectionId}
      />

      <AdminFormLayout>
      <div className="space-y-8">

        {/* 1. HERO SECTION & TWO-LINE LIVING HEADLINE COMPOSER */}
        <div id="hero" className="space-y-6">
          <E3LivingHeroEditor
            title="Two-Line Living Hero Headline Composer & Atmospheric Media"
            description="Compose kinetic two-line living headlines with {{animated}} token interpolation, rotating words, custom atmospheric media, and interactive CTAs."
            value={{
              eyebrowEn: hero.eyebrowEn || hero.eyebrow || "E3 ENTERPRISE ATELIER",
              eyebrowAr: hero.eyebrowAr || hero.eyebrow || "منظومة إي ثري لقطاع الأعمال",
              fixedHeadlineEn: hero.title || hero.fixedHeadlineEn || hero.titleEn || "Ideas to Life",
              fixedHeadlineAr: hero.titleAr || hero.fixedHeadlineAr || "تحويل الأفكار إلى واقع",
              headlineTemplateEn: hero.headlineTemplateEn || hero.title || hero.titleEn || "Ideas to {{animated}}",
              headlineTemplateAr: hero.headlineTemplateAr || hero.titleAr || "تحويل الأفكار إلى {{animated}}",
              rotatingWordsEn: hero.rotatingWordsEn || ["Reality", "Living Landmarks", "Iconic Spectacles", "Unforgettable Impact"],
              rotatingWordsAr: hero.rotatingWordsAr || ["واقع حي", "تجارب ملهمة", "مشاريع استثنائية", "إنجازات فارقة"],
              descriptionEn: hero.description || hero.subtitle || hero.descriptionEn,
              descriptionAr: hero.descriptionAr || hero.subtitleAr || hero.descriptionAr,
              primaryCta: typeof hero.primaryCta === 'object' ? hero.primaryCta : {
                labelEn: hero.primaryCta || hero.primaryCtaEn || "Explore Services",
                labelAr: hero.primaryCtaAr || hero.primaryCta || "استكشف الخدمات",
                url: hero.primaryLink || "/b2b/services"
              },
              secondaryCta: typeof hero.secondaryCta === 'object' ? hero.secondaryCta : {
                labelEn: hero.secondaryCta || hero.secondaryCtaEn || "Start a Project",
                labelAr: hero.secondaryCtaAr || hero.secondaryCta || "ابدأ مشروعاً",
                url: hero.secondaryLink || "/b2b/contact"
              },
              preset: (hero.preset as any) || "memory-engine",
              animationSpeed: hero.animationSpeed || 2800,
              animationDuration: hero.animationDuration || 600,
              animationType: hero.animationType || "blur-morph",
              wordStyle: hero.wordStyle || "static-gradient",
              enableRotatingWords: hero.enableRotatingWords !== false,
              media: hero.media || {
                mediaType: (hero.mediaType as any) || "IMAGE",
                mediaUrl: hero.mediaUrl || hero.backgroundImage || "/hero-bg.png"
              }
            }}
            onChange={(updatedHero) => {
              setIsDirty(true);
              setHero((prev: any) => ({
                ...prev,
                ...updatedHero,
                title: updatedHero.fixedHeadlineEn || prev.title,
                titleEn: updatedHero.fixedHeadlineEn || prev.titleEn,
                titleAr: updatedHero.fixedHeadlineAr || prev.titleAr,
                headlineTemplateEn: updatedHero.headlineTemplateEn,
                headlineTemplateAr: updatedHero.headlineTemplateAr,
                rotatingWordsEn: updatedHero.rotatingWordsEn,
                rotatingWordsAr: updatedHero.rotatingWordsAr,
                description: updatedHero.descriptionEn || prev.description,
                descriptionAr: updatedHero.descriptionAr || prev.descriptionAr,
                subtitle: updatedHero.descriptionEn || prev.subtitle,
                subtitleAr: updatedHero.descriptionAr || prev.descriptionAr,
                mediaType: updatedHero.media?.mediaType || prev.mediaType || "IMAGE",
                mediaUrl: updatedHero.media?.mediaUrl || prev.mediaUrl,
                backgroundImage: updatedHero.media?.mediaUrl || prev.backgroundImage,
                primaryCta: updatedHero.primaryCta?.labelEn || prev.primaryCta,
                primaryCtaAr: updatedHero.primaryCta?.labelAr || prev.primaryCtaAr,
                primaryLink: updatedHero.primaryCta?.url || prev.primaryLink,
                secondaryCta: updatedHero.secondaryCta?.labelEn || prev.secondaryCta,
                secondaryCtaAr: updatedHero.secondaryCta?.labelAr || prev.secondaryCtaAr,
                secondaryLink: updatedHero.secondaryCta?.url || prev.secondaryLink,
              }));
            }}
          />
        </div>

        {/* STATS SECTION */}
        <AdminFormSection id="stats" title="Credibility Stats" description="The statistics displayed prominently on the board.">
          <div className="space-y-4">
            <div className="flex justify-end mb-2">
              <button 
                onClick={() => setStats([...stats, { value: '', label: '' }])}
                className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
              >
                + Add Stat
              </button>
            </div>
            {stats.map((stat, idx) => (
              <div key={idx} className="flex gap-4 p-4 border border-border-default rounded-md bg-surface-active relative">
                <button 
                  onClick={() => {
                    const newStats = [...stats]
                    newStats.splice(idx, 1)
                    setStats(newStats)
                  }}
                  className="absolute top-2 end-2 text-text-tertiary hover:text-error transition-colors"
                >
                  &times;
                </button>
                <div className="w-1/3">
                  <AdminInput 
                    label="Value" 
                    value={activeLang === 'en' ? (stat.value || "") : (stat.valueAr || stat.value || "")} 
                    onChange={e => {
                      const newStats = [...stats]
                      newStats[idx][activeLang === 'en' ? 'value' : 'valueAr'] = e.target.value
                      setStats(newStats)
                    }} 
                    placeholder="e.g. 50+"
                  />
                </div>
                <div className="w-2/3">
                  <AdminInput 
                    label="Label" 
                    value={activeLang === 'en' ? (stat.label || "") : (stat.labelAr || stat.label || "")} 
                    onChange={e => {
                      const newStats = [...stats]
                      newStats[idx][activeLang === 'en' ? 'label' : 'labelAr'] = e.target.value
                      setStats(newStats)
                    }} 
                    placeholder="e.g. Years Experience"
                  />
                </div>
              </div>
            ))}
          </div>
        </AdminFormSection>

        {/* WOW AND HOW */}
        <AdminFormSection id="wowhow" title="The Wow & How" description="The two distinct pillars of the E3 methodology.">
          <AdminFormGrid>
            <div className="sm:col-span-2">
              <AdminInput 
                label="Section Title" 
                value={activeLang === 'en' ? (wowAndHow.title || "") : (wowAndHow.titleAr || "")} 
                onChange={e => setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'title' : 'titleAr']: e.target.value })} 
              />
            </div>
            <div className="sm:col-span-2">
              <AdminTextarea 
                label="Section Description" 
                value={activeLang === 'en' ? (wowAndHow.description || "") : (wowAndHow.descriptionAr || "")} 
                onChange={e => setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'description' : 'descriptionAr']: e.target.value })} 
                rows={3}
              />
            </div>
            
            {/* Wow Bullets */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-text-primary">Wow Bullets</label>
                <button 
                  onClick={() => {
                    const currentBullets = activeLang === 'en' ? (wowAndHow.wowBullets || []) : (wowAndHow.wowBulletsAr || [])
                    setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'wowBullets' : 'wowBulletsAr']: [...currentBullets, ''] })
                  }}
                  className="text-xs font-bold bg-primary text-white px-2 py-1 rounded hover:bg-primary/90"
                >
                  + Add Bullet
                </button>
              </div>
              {(activeLang === 'en' ? (wowAndHow.wowBullets || []) : (wowAndHow.wowBulletsAr || [])).map((bullet: string, idx: number) => (
                <div key={`wow-${idx}`} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={bullet}
                    onChange={e => {
                      const currentBullets = activeLang === 'en' ? (wowAndHow.wowBullets || []) : (wowAndHow.wowBulletsAr || [])
                      const newBullets = [...currentBullets]
                      newBullets[idx] = e.target.value
                      setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'wowBullets' : 'wowBulletsAr']: newBullets })
                    }}
                    className="w-full h-10 px-3 bg-surface-default border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button 
                    onClick={() => {
                      const currentBullets = activeLang === 'en' ? (wowAndHow.wowBullets || []) : (wowAndHow.wowBulletsAr || [])
                      const newBullets = [...currentBullets]
                      newBullets.splice(idx, 1)
                      setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'wowBullets' : 'wowBulletsAr']: newBullets })
                    }}
                    className="text-text-tertiary hover:text-error px-2"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            {/* How Bullets */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-text-primary">How Bullets</label>
                <button 
                  onClick={() => {
                    const currentBullets = activeLang === 'en' ? (wowAndHow.howBullets || []) : (wowAndHow.howBulletsAr || [])
                    setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'howBullets' : 'howBulletsAr']: [...currentBullets, ''] })
                  }}
                  className="text-xs font-bold bg-primary text-white px-2 py-1 rounded hover:bg-primary/90"
                >
                  + Add Bullet
                </button>
              </div>
              {(activeLang === 'en' ? (wowAndHow.howBullets || []) : (wowAndHow.howBulletsAr || [])).map((bullet: string, idx: number) => (
                <div key={`how-${idx}`} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={bullet}
                    onChange={e => {
                      const currentBullets = activeLang === 'en' ? (wowAndHow.howBullets || []) : (wowAndHow.howBulletsAr || [])
                      const newBullets = [...currentBullets]
                      newBullets[idx] = e.target.value
                      setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'howBullets' : 'howBulletsAr']: newBullets })
                    }}
                    className="w-full h-10 px-3 bg-surface-default border border-border-default rounded-md text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button 
                    onClick={() => {
                      const currentBullets = activeLang === 'en' ? (wowAndHow.howBullets || []) : (wowAndHow.howBulletsAr || [])
                      const newBullets = [...currentBullets]
                      newBullets.splice(idx, 1)
                      setWowAndHow({ ...wowAndHow, [activeLang === 'en' ? 'howBullets' : 'howBulletsAr']: newBullets })
                    }}
                    className="text-text-tertiary hover:text-error px-2"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </AdminFormGrid>
        </AdminFormSection>

        {/* INTERACTIVE CAD BLUEPRINT & SPATIAL ARCHITECTURE */}
        <AdminFormSection 
          id="blueprintDepth" 
          title="Interactive CAD Blueprint & Spatial Architecture" 
          description="Customize the interactive 3D blueprint-to-reality depth transition, CAD schematic telemetry HUD, live venue render, and capability feature cards."
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-default">
            <span className="text-sm font-semibold text-text-primary">Enable Section Visibility</span>
            <label className="flex items-center gap-2 text-xs font-mono font-bold cursor-pointer">
              <input 
                type="checkbox" 
                checked={blueprintDepth?.enabled !== false} 
                onChange={e => {
                  setIsDirty(true);
                  setBlueprintDepth({ ...blueprintDepth, enabled: e.target.checked });
                }}
                className="rounded bg-surface-hover border-border-default text-primary focus:ring-primary w-4 h-4"
              />
              <span>SECTION ENABLED</span>
            </label>
          </div>

          <AdminFormGrid>
            <div className="sm:col-span-2">
              <AdminInput 
                label="Eyebrow Badge" 
                value={activeLang === 'en' ? (blueprintDepth.eyebrowEn || blueprintDepth.eyebrow || "") : (blueprintDepth.eyebrowAr || "")} 
                onChange={e => {
                  setIsDirty(true);
                  setBlueprintDepth({ ...blueprintDepth, [activeLang === 'en' ? 'eyebrowEn' : 'eyebrowAr']: e.target.value });
                }} 
                placeholder="e.g. SPATIAL ARCHITECTURE & DEPTH"
              />
            </div>
            <div className="sm:col-span-2">
              <AdminInput 
                label="Section Headline" 
                value={activeLang === 'en' ? (blueprintDepth.titleEn || blueprintDepth.title || "") : (blueprintDepth.titleAr || "")} 
                onChange={e => {
                  setIsDirty(true);
                  setBlueprintDepth({ ...blueprintDepth, [activeLang === 'en' ? 'titleEn' : 'titleAr']: e.target.value });
                }} 
                placeholder="e.g. From Blueprint to Landmark Reality"
              />
            </div>
            <div className="sm:col-span-2">
              <AdminTextarea 
                label="Section Description" 
                value={activeLang === 'en' ? (blueprintDepth.descriptionEn || blueprintDepth.description || "") : (blueprintDepth.descriptionAr || "")} 
                onChange={e => {
                  setIsDirty(true);
                  setBlueprintDepth({ ...blueprintDepth, [activeLang === 'en' ? 'descriptionEn' : 'descriptionAr']: e.target.value });
                }} 
                rows={2}
                placeholder="e.g. Explore how rigorous structural engineering, spatial telemetry, and crowd logistics transform into world-class entertainment destinations."
              />
            </div>

            {/* Tab Labels */}
            <div>
              <AdminInput 
                label="CAD Blueprint Tab Label" 
                value={activeLang === 'en' ? (blueprintDepth.cadTabLabelEn || "") : (blueprintDepth.cadTabLabelAr || "")} 
                onChange={e => {
                  setIsDirty(true);
                  setBlueprintDepth({ ...blueprintDepth, [activeLang === 'en' ? 'cadTabLabelEn' : 'cadTabLabelAr']: e.target.value });
                }} 
                placeholder="e.g. 01. CAD Blueprint"
              />
            </div>
            <div>
              <AdminInput 
                label="Interactive Split Tab Label" 
                value={activeLang === 'en' ? (blueprintDepth.splitTabLabelEn || "") : (blueprintDepth.splitTabLabelAr || "")} 
                onChange={e => {
                  setIsDirty(true);
                  setBlueprintDepth({ ...blueprintDepth, [activeLang === 'en' ? 'splitTabLabelEn' : 'splitTabLabelAr']: e.target.value });
                }} 
                placeholder="e.g. 02. Interactive Split"
              />
            </div>
            <div className="sm:col-span-2">
              <AdminInput 
                label="Live Experience Tab Label" 
                value={activeLang === 'en' ? (blueprintDepth.liveTabLabelEn || "") : (blueprintDepth.liveTabLabelAr || "")} 
                onChange={e => {
                  setIsDirty(true);
                  setBlueprintDepth({ ...blueprintDepth, [activeLang === 'en' ? 'liveTabLabelEn' : 'liveTabLabelAr']: e.target.value });
                }} 
                placeholder="e.g. 03. Live Experience"
              />
            </div>

            {/* HUD Schematic Telemetry Badges */}
            <div className="sm:col-span-2 pt-2 border-t border-border-default">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3">
                HUD Technical Schematic Telemetry Overlay
              </h4>
            </div>

            <div>
              <AdminInput 
                label="Schematic Header Title" 
                value={activeLang === 'en' ? (blueprintDepth.schematicTitleEn || "") : (blueprintDepth.schematicTitleAr || "")} 
                onChange={e => {
                  setIsDirty(true);
                  setBlueprintDepth({ ...blueprintDepth, [activeLang === 'en' ? 'schematicTitleEn' : 'schematicTitleAr']: e.target.value });
                }} 
                placeholder="e.g. E3 SPATIAL SCHEMATIC // QATAR"
              />
            </div>
            <div>
              <AdminInput 
                label="System ID Badge" 
                value={blueprintDepth.systemId || ""} 
                onChange={e => {
                  setIsDirty(true);
                  setBlueprintDepth({ ...blueprintDepth, systemId: e.target.value });
                }} 
                placeholder="e.g. SYSTEM ID: E3-B2B-ENG-2026"
              />
            </div>

            <div>
              <AdminInput 
                label="Spec 1: Tolerance & Load" 
                value={activeLang === 'en' ? (blueprintDepth.schematicSpec1En || "") : (blueprintDepth.schematicSpec1Ar || "")} 
                onChange={e => {
                  setIsDirty(true);
                  setBlueprintDepth({ ...blueprintDepth, [activeLang === 'en' ? 'schematicSpec1En' : 'schematicSpec1Ar']: e.target.value });
                }} 
                placeholder="e.g. TOLERANCE: ±0.5mm | LOAD: 4.8 kN/m²"
              />
            </div>
            <div>
              <AdminInput 
                label="Spec 2: Crowd Capacity" 
                value={activeLang === 'en' ? (blueprintDepth.schematicSpec2En || "") : (blueprintDepth.schematicSpec2Ar || "")} 
                onChange={e => {
                  setIsDirty(true);
                  setBlueprintDepth({ ...blueprintDepth, [activeLang === 'en' ? 'schematicSpec2En' : 'schematicSpec2Ar']: e.target.value });
                }} 
                placeholder="e.g. CROWD CAPACITY: 12,500 PAX/HR"
              />
            </div>

            {/* Live Render Layer & Badge */}
            <div className="sm:col-span-2 pt-2 border-t border-border-default">
              <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-3">
                Live Commissioned Venue Layer
              </h4>
            </div>

            <div className="sm:col-span-2">
              <AdminInput 
                label="Live Commissioned Badge Text" 
                value={activeLang === 'en' ? (blueprintDepth.liveBadgeTextEn || "") : (blueprintDepth.liveBadgeTextAr || "")} 
                onChange={e => {
                  setIsDirty(true);
                  setBlueprintDepth({ ...blueprintDepth, [activeLang === 'en' ? 'liveBadgeTextEn' : 'liveBadgeTextAr']: e.target.value });
                }} 
                placeholder="e.g. LIVE COMMISSIONED VENUE"
              />
            </div>

            <div className="sm:col-span-2">
              <AdminMediaPicker 
                label="Live Experience Render Image"
                value={blueprintDepth.liveImageUrl || ""}
                onChange={url => {
                  setIsDirty(true);
                  setBlueprintDepth({ ...blueprintDepth, liveImageUrl: url });
                }}
                accept="image/*"
              />
            </div>
          </AdminFormGrid>

          {/* 3 Feature Highlight Cards */}
          <div className="mt-8 space-y-4 pt-4 border-t border-border-default">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-text-primary">Feature Highlight Cards (3 Pillars)</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((idx) => {
                const defaultCardNames = ["Structural Precision", "Acoustic & Lighting Staging", "Turnkey Commissioning"];
                const defaultCardNamesAr = ["دقة التصميم الإنشائي", "محاكاة الإضاءة والصوت", "تسليم تشغيلي متكامل"];
                const defaultIcons = ["Compass", "Layers", "ShieldCheck"];
                const currentFeats = Array.isArray(blueprintDepth.features) ? [...blueprintDepth.features] : [];
                const feat = currentFeats[idx] || {};

                return (
                  <div key={idx} className="p-4 bg-surface-default border border-border-default rounded-xl space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-primary uppercase">Card #{idx + 1}</span>
                      <select
                        value={feat.icon || defaultIcons[idx]}
                        onChange={e => {
                          setIsDirty(true);
                          const updated = [...(blueprintDepth.features || [])];
                          while (updated.length <= idx) updated.push({});
                          updated[idx] = { ...updated[idx], icon: e.target.value };
                          setBlueprintDepth({ ...blueprintDepth, features: updated });
                        }}
                        className="text-xs bg-surface-hover border border-border-default rounded px-2 py-1 text-text-primary font-mono"
                      >
                        <option value="Compass">Compass (CAD/Engineering)</option>
                        <option value="Layers">Layers (Acoustics/Lighting)</option>
                        <option value="ShieldCheck">ShieldCheck (Safety/Turnkey)</option>
                        <option value="Cpu">Cpu (Telemetry/Compute)</option>
                        <option value="Sparkles">Sparkles (Live Show/Magic)</option>
                      </select>
                    </div>

                    <AdminInput 
                      label="Card Title"
                      value={activeLang === 'en' ? (feat.titleEn || feat.title || defaultCardNames[idx]) : (feat.titleAr || defaultCardNamesAr[idx])}
                      onChange={e => {
                        setIsDirty(true);
                        const updated = [...(blueprintDepth.features || [])];
                        while (updated.length <= idx) updated.push({});
                        updated[idx] = { 
                          ...updated[idx], 
                          [activeLang === 'en' ? 'titleEn' : 'titleAr']: e.target.value 
                        };
                        setBlueprintDepth({ ...blueprintDepth, features: updated });
                      }}
                    />

                    <AdminTextarea 
                      label="Card Description"
                      rows={2}
                      value={activeLang === 'en' ? (feat.descEn || feat.desc || "") : (feat.descAr || "")}
                      onChange={e => {
                        setIsDirty(true);
                        const updated = [...(blueprintDepth.features || [])];
                        while (updated.length <= idx) updated.push({});
                        updated[idx] = { 
                          ...updated[idx], 
                          [activeLang === 'en' ? 'descEn' : 'descAr']: e.target.value 
                        };
                        setBlueprintDepth({ ...blueprintDepth, features: updated });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </AdminFormSection>

        {/* CORE CAPABILITIES SECTION HEADERS & SELECTION */}
        <AdminFormSection id="capabilities" title="Core Capabilities (Services)" description="Customize the capabilities section headers and select featured services.">
          <AdminFormGrid>
            <div className="sm:col-span-2">
              <AdminInput 
                label="Capabilities Section Title" 
                value={activeLang === 'en' ? (capabilities.titleEn || capabilities.title || "") : (capabilities.titleAr || "")} 
                onChange={e => setCapabilities({ ...capabilities, [activeLang === 'en' ? 'titleEn' : 'titleAr']: e.target.value })} 
                placeholder="e.g. Core Capabilities"
              />
            </div>
            <div className="sm:col-span-2">
              <AdminTextarea 
                label="Capabilities Section Description" 
                value={activeLang === 'en' ? (capabilities.descriptionEn || capabilities.description || "") : (capabilities.descriptionAr || "")} 
                onChange={e => setCapabilities({ ...capabilities, [activeLang === 'en' ? 'descriptionEn' : 'descriptionAr']: e.target.value })} 
                rows={2}
                placeholder="e.g. Everything required to deliver landmark experiences."
              />
            </div>
            <AdminInput 
              label="View All Services CTA Label" 
              value={activeLang === 'en' ? (capabilities.ctaEn || "") : (capabilities.ctaAr || "")} 
              onChange={e => setCapabilities({ ...capabilities, [activeLang === 'en' ? 'ctaEn' : 'ctaAr']: e.target.value })} 
              placeholder="e.g. View All Services"
            />
          </AdminFormGrid>
          
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary">Featured Services Grid Selection</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-4 border border-border-default rounded-md bg-surface-default">
              {services?.map(service => (
                <label key={service.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-surface-hover rounded-md transition-colors">
                  <input 
                    type="checkbox"
                    checked={featuredServiceIds.includes(service.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setFeaturedServiceIds([...featuredServiceIds, service.id])
                      } else {
                        setFeaturedServiceIds(featuredServiceIds.filter(id => id !== service.id))
                      }
                    }}
                    className="w-4 h-4 rounded border-border-default text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-text-primary">{service.titleEn || service.slug}</span>
                </label>
              ))}
              {(!services || services.length === 0) && (
                <p className="text-sm text-text-tertiary">No services available.</p>
              )}
            </div>
          </div>
        </AdminFormSection>

        {/* FEATURED WORK / CASE STUDIES SECTION HEADERS & SELECTION */}
        <AdminFormSection id="caseStudies" title="Featured Work (Case Studies)" description="Customize the case studies section headers and select featured projects.">
          <AdminFormGrid>
            <div className="sm:col-span-2">
              <AdminInput 
                label="Case Studies Section Title" 
                value={activeLang === 'en' ? (caseStudiesSection.titleEn || caseStudiesSection.title || "") : (caseStudiesSection.titleAr || "")} 
                onChange={e => setCaseStudiesSection({ ...caseStudiesSection, [activeLang === 'en' ? 'titleEn' : 'titleAr']: e.target.value })} 
                placeholder="e.g. Featured Work"
              />
            </div>
            <div className="sm:col-span-2">
              <AdminTextarea 
                label="Case Studies Section Description" 
                value={activeLang === 'en' ? (caseStudiesSection.descriptionEn || caseStudiesSection.description || "") : (caseStudiesSection.descriptionAr || "")} 
                onChange={e => setCaseStudiesSection({ ...caseStudiesSection, [activeLang === 'en' ? 'descriptionEn' : 'descriptionAr']: e.target.value })} 
                rows={2}
                placeholder="e.g. Landmark projects delivered across the region."
              />
            </div>
            <AdminInput 
              label="View All Case Studies CTA Label" 
              value={activeLang === 'en' ? (caseStudiesSection.ctaEn || "") : (caseStudiesSection.ctaAr || "")} 
              onChange={e => setCaseStudiesSection({ ...caseStudiesSection, [activeLang === 'en' ? 'ctaEn' : 'ctaAr']: e.target.value })} 
              placeholder="e.g. View All Case Studies"
            />
          </AdminFormGrid>

          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary">Featured Case Studies Selection</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-4 border border-border-default rounded-md bg-surface-default">
              {caseStudies?.map(cs => (
                <label key={cs.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-surface-hover rounded-md transition-colors">
                  <input 
                    type="checkbox"
                    checked={featuredCaseStudyIds.includes(cs.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setFeaturedCaseStudyIds([...featuredCaseStudyIds, cs.id])
                      } else {
                        setFeaturedCaseStudyIds(featuredCaseStudyIds.filter(id => id !== cs.id))
                      }
                    }}
                    className="w-4 h-4 rounded border-border-default text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-text-primary">{cs.titleEn || cs.slug}</span>
                </label>
              ))}
              {(!caseStudies || caseStudies.length === 0) && (
                <p className="text-sm text-text-tertiary">No case studies available.</p>
              )}
            </div>
          </div>
        </AdminFormSection>

        {/* DELIVERY PROCESS PIPELINE */}
        <AdminFormSection id="deliveryProcess" title="Delivery Process Pipeline" description="Manage the 5-step operational delivery methodology pipeline.">
          <AdminFormGrid>
            <div className="sm:col-span-2">
              <AdminInput 
                label="Delivery Section Title" 
                value={activeLang === 'en' ? (deliveryProcess.titleEn || deliveryProcess.title || "") : (deliveryProcess.titleAr || "")} 
                onChange={e => setDeliveryProcess({ ...deliveryProcess, [activeLang === 'en' ? 'titleEn' : 'titleAr']: e.target.value })} 
                placeholder="e.g. Delivery Process"
              />
            </div>
          </AdminFormGrid>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-text-primary">Pipeline Steps</h4>
              <button 
                type="button"
                onClick={() => {
                  const currentSteps = deliveryProcess.steps || []
                  const num = String(currentSteps.length + 1).padStart(2, '0')
                  setDeliveryProcess({
                    ...deliveryProcess,
                    steps: [...currentSteps, { stepNumber: num, nameEn: '', nameAr: '', descEn: '', descAr: '' }]
                  })
                }}
                className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
              >
                + Add Step
              </button>
            </div>

            {(deliveryProcess.steps || []).map((step: any, idx: number) => (
              <div key={idx} className="p-4 border border-border-default rounded-md bg-surface-active space-y-3 relative">
                <button 
                  type="button"
                  onClick={() => {
                    const newSteps = [...(deliveryProcess.steps || [])]
                    newSteps.splice(idx, 1)
                    setDeliveryProcess({ ...deliveryProcess, steps: newSteps })
                  }}
                  className="absolute top-2 end-2 text-text-tertiary hover:text-error transition-colors"
                >
                  &times;
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <AdminInput 
                      label="Step Number" 
                      value={step.stepNumber || String(idx + 1).padStart(2, '0')} 
                      onChange={e => {
                        const newSteps = [...(deliveryProcess.steps || [])]
                        newSteps[idx].stepNumber = e.target.value
                        setDeliveryProcess({ ...deliveryProcess, steps: newSteps })
                      }} 
                      placeholder="01"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <AdminInput 
                      label="Step Name" 
                      value={activeLang === 'en' ? (step.nameEn || step.name || "") : (step.nameAr || step.name || "")} 
                      onChange={e => {
                        const newSteps = [...(deliveryProcess.steps || [])]
                        newSteps[idx][activeLang === 'en' ? 'nameEn' : 'nameAr'] = e.target.value
                        setDeliveryProcess({ ...deliveryProcess, steps: newSteps })
                      }} 
                      placeholder="e.g. Discover"
                    />
                  </div>
                </div>

                <AdminTextarea 
                  label="Step Description" 
                  value={activeLang === 'en' ? (step.descEn || step.desc || "") : (step.descAr || step.desc || "")} 
                  onChange={e => {
                    const newSteps = [...(deliveryProcess.steps || [])]
                    newSteps[idx][activeLang === 'en' ? 'descEn' : 'descAr'] = e.target.value
                    setDeliveryProcess({ ...deliveryProcess, steps: newSteps })
                  }} 
                  rows={2}
                  placeholder="Short description of this delivery milestone..."
                />
              </div>
            ))}
          </div>
        </AdminFormSection>

        {/* PARTNER RIBBON */}
        <AdminFormSection id="partnerRibbon" title="Partner Ribbon Header" description="Heading for the client & partner marquee ribbon.">
          <AdminFormGrid>
            <div className="sm:col-span-2">
              <AdminInput 
                label="Partner Ribbon Section Title" 
                value={activeLang === 'en' ? (partnerRibbon.titleEn || partnerRibbon.title || "") : (partnerRibbon.titleAr || "")} 
                onChange={e => setPartnerRibbon({ ...partnerRibbon, [activeLang === 'en' ? 'titleEn' : 'titleAr']: e.target.value })} 
                placeholder="e.g. Trusted by Industry Leaders"
              />
            </div>
          </AdminFormGrid>
        </AdminFormSection>

        {/* SEO */}
        <AdminSeoCustomizer seo={seo} setSeo={setSeo} formData={null} setFormData={() => {}} />

      </div>
    </AdminFormLayout>

      <DashboardStickyActions
        onSave={handleSave}
        isSaving={isSaving}
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
