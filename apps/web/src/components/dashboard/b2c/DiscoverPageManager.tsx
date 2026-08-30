"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminMediaPicker } from "../ui/AdminMediaPicker"
import { AdminButton } from "../ui/AdminButton"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { AdminSeoCustomizer } from "../ui/AdminSeoCustomizer"
import { DEFAULT_B2C_DISCOVER_CONTENT } from "@/lib/cms-default-pages"
import { useLocale } from "@/components/layout/LocaleProvider"
import { cn } from "@/lib/utils"
import { 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Trash2, 
  FileText,
  Save,
  Compass,
  ArrowRight,
  Image as ImageIcon
} from "lucide-react"
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardStickyActions,
  DashboardUnsavedChangesGuard,
} from "@/components/dashboard/ui"
import { E3LivingHeroEditor } from "@/components/dashboard/b2c/E3LivingHeroEditor"

export function DiscoverPageManager({ initialData }: { initialData: any }) {
  const { locale } = useLocale()
  const isAr = locale === "ar"

  const [data, setData] = useState<any>(() => {
    return {
      ...DEFAULT_B2C_DISCOVER_CONTENT,
      ...(initialData || {}),
      hero: { ...DEFAULT_B2C_DISCOVER_CONTENT.hero, ...(initialData?.hero || {}) },
      about: { ...DEFAULT_B2C_DISCOVER_CONTENT.about, ...(initialData?.about || initialData?.heritage || {}) },
      leadership: { ...DEFAULT_B2C_DISCOVER_CONTENT.leadership, ...(initialData?.leadership || {}) },
      visionMissionValues: { ...DEFAULT_B2C_DISCOVER_CONTENT.visionMissionValues, ...(initialData?.visionMissionValues || {}) },
      recordBreaking: { ...DEFAULT_B2C_DISCOVER_CONTENT.recordBreaking, ...(initialData?.recordBreaking || {}) },
      impactMilestones: { ...DEFAULT_B2C_DISCOVER_CONTENT.impactMilestones, ...(initialData?.impactMilestones || {}) },
      bookingQube: { ...DEFAULT_B2C_DISCOVER_CONTENT.bookingQube, ...(initialData?.bookingQube || {}) },
      e3Rentals: { ...DEFAULT_B2C_DISCOVER_CONTENT.e3Rentals, ...(initialData?.e3Rentals || {}) },
      connect: { ...DEFAULT_B2C_DISCOVER_CONTENT.connect, ...(initialData?.connect || {}) },
      trustedAcrossQatar: { ...DEFAULT_B2C_DISCOVER_CONTENT.trustedAcrossQatar, ...(initialData?.trustedAcrossQatar || {}) },
      latestInsights: { ...DEFAULT_B2C_DISCOVER_CONTENT.latestInsights, ...(initialData?.latestInsights || {}) },
      finalGateway: { ...DEFAULT_B2C_DISCOVER_CONTENT.finalGateway, ...(initialData?.finalGateway || {}) },
      sectionOrder: initialData?.sectionOrder || [
        "hero", "about", "leadership", "visionMissionValues", "recordBreaking", 
        "impactMilestones", "bookingQube", "e3Rentals", "connect", "trustedAcrossQatar", 
        "latestInsights", "finalGateway"
      ],
    }
  })

  const [seo, setSeo] = useState<any>(initialData?.seo || DEFAULT_B2C_DISCOVER_CONTENT.seo)
  const [activeTab, setActiveTab] = useState<string>("hero")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Dynamic entity sources
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])

  useEffect(() => {
    // 1. Fetch team members from /api/team and /api/employees
    Promise.all([
      fetch('/api/team').then(res => res.json()).catch(() => []),
      fetch('/api/employees').then(res => res.json()).catch(() => [])
    ]).then(([t1, t2]) => {
      const arr1 = Array.isArray(t1) ? t1 : (t1.team || t1.data || []);
      const arr2 = Array.isArray(t2) ? t2 : (t2.employees || t2.data || []);
      const map = new Map();
      [...arr1, ...arr2].forEach((item: any) => { if (item && item.id) map.set(item.id, item); });
      if (map.size === 0) {
        [
          { id: "tm-ceo", firstName: "E3", lastName: "Leadership Team", designation: "Executive Board" },
          { id: "tm-eng", firstName: "Event", lastName: "Engineering Specialists", designation: "Production Dept" }
        ].forEach(t => map.set(t.id, t));
      }
      setTeamMembers(Array.from(map.values()));
    });

    // 2. Fetch Partners from /api/partners and /api/b2b/partners
    Promise.all([
      fetch('/api/partners').then(res => res.json()).catch(() => []),
      fetch('/api/b2b/partners').then(res => res.json()).catch(() => [])
    ]).then(([p1, p2]) => {
      const arr1 = Array.isArray(p1) ? p1 : (p1.partners || p1.data || []);
      const arr2 = Array.isArray(p2) ? p2 : (p2.partners || p2.data || []);
      const map = new Map();
      [...arr1, ...arr2].forEach((item: any) => { if (item && item.id) map.set(item.id, item); });
      if (map.size === 0) {
        [
          { id: "p-visit-qatar", name: "Visit Qatar", company: "Visit Qatar" },
          { id: "p-qatar-airways", name: "Qatar Airways", company: "Qatar Airways" },
          { id: "p-katara", name: "Katara Cultural Village", company: "Katara Cultural Village" },
          { id: "p-moc", name: "Ministry of Culture Qatar", company: "Ministry of Culture Qatar" }
        ].forEach(p => map.set(p.id, p));
      }
      setPartners(Array.from(map.values()));
    });

    // 3. Fetch B2B Clients from /api/b2b/clients, /api/crm/clients, /api/clients
    Promise.all([
      fetch('/api/b2b/clients').then(res => res.json()).catch(() => []),
      fetch('/api/crm/clients').then(res => res.json()).catch(() => []),
      fetch('/api/clients').then(res => res.json()).catch(() => [])
    ]).then(([c1, c2, c3]) => {
      const arr1 = Array.isArray(c1) ? c1 : (c1.clients || c1.data || []);
      const arr2 = Array.isArray(c2) ? c2 : (c2.clients || c2.data || []);
      const arr3 = Array.isArray(c3) ? c3 : (c3.clients || c3.data || []);
      const map = new Map();
      [...arr1, ...arr2, ...arr3].forEach((item: any) => { if (item && item.id) map.set(item.id, item); });
      if (map.size === 0) {
        [
          { id: "c-msheireb", company: "Msheireb Properties", name: "Msheireb Properties" },
          { id: "c-qef", company: "Qatar Events Federation", name: "Qatar Events Federation" },
          { id: "c-qta", company: "Qatar Tourism Authority", name: "Qatar Tourism Authority" },
          { id: "c-lusail", company: "Lusail Real Estate", name: "Lusail Real Estate" }
        ].forEach(c => map.set(c.id, c));
      }
      setClients(Array.from(map.values()));
    });

    // 4. Fetch Insights & Operations News & Updates
    Promise.all([
      fetch('/api/insights').then(res => res.json()).catch(() => []),
      fetch('/api/news').then(res => res.json()).catch(() => []),
      fetch('/api/operations/news').then(res => res.json()).catch(() => [])
    ]).then(([i1, n1, n2]) => {
      const arr1 = Array.isArray(i1?.data) ? i1.data : (Array.isArray(i1) ? i1 : []);
      const arr2 = Array.isArray(n1?.data) ? n1.data : (Array.isArray(n1) ? n1 : []);
      const arr3 = Array.isArray(n2?.data) ? n2.data : (Array.isArray(n2) ? n2 : []);
      const map = new Map();
      [...arr1, ...arr2, ...arr3].forEach((item: any) => { if (item && item.id) map.set(item.id, item); });
      setInsights(Array.from(map.values()));
    });

  }, [])

  const [isDirty, setIsDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        slug: "b2c-discover",
        title: { en: "E3 Discover Page", ar: "صفحة اكتشف إي ثري" },
        content: {
          ...data,
          seo
        },
        seo,
        status: "PUBLISHED"
      }

      const res = await fetch("/api/cms/pages/b2c-discover", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setIsDirty(false)
        setLastSaved(new Date())
        toast("Discover Page configuration published to database successfully!", "success")
      } else {
        toast("Could not save Discover Page settings.", "error")
      }
    } catch (err: any) {
      toast(err.message || "An unexpected error occurred while saving.", "error")
    } finally {
      setSaving(false)
    }
  }

  const updateSectionField = (section: string, field: string, value: any) => {
    setIsDirty(true)
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }))
  }

  const toggleSectionEnabled = (section: string) => {
    setIsDirty(true)
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        enabled: !(prev[section]?.enabled ?? true)
      }
    }))
  }

  const moveSectionOrder = (index: number, direction: 'up' | 'down') => {
    setIsDirty(true)
    const order = [...(data.sectionOrder || [])]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= order.length) return
    const temp = order[index]
    order[index] = order[targetIdx]
    order[targetIdx] = temp
    setData((prev: any) => ({ ...prev, sectionOrder: order }))
  }

  const tabsList = [
    { id: "hero", label: "1. Hero" },
    { id: "about", label: "2. About E3" },
    { id: "leadership", label: "3. Leadership" },
    { id: "visionMissionValues", label: "4. Vision & Values" },
    { id: "recordBreaking", label: "5. Guinness Record" },
    { id: "impactMilestones", label: "6. Impact & Milestones" },
    { id: "bookingQube", label: "7. BookingQube Tech" },
    { id: "e3Rentals", label: "8. E3 Rentals Tech Spotlight" },
    { id: "connect", label: "9. Connect Gateways" },
    { id: "trustedAcrossQatar", label: "10. Clients & Partners" },
    { id: "latestInsights", label: "11. Insights & News" },
    { id: "finalGateway", label: "12. Final Gateway" },
    { id: "ordering", label: "13. Section Ordering" },
    { id: "seo", label: "14. SEO & AEO Settings" },
    { id: "footer", label: "15. Footer Media" }
  ]

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      <DashboardPageHeader 
        title={isAr ? "محرر صفحة اكتشف إي ثري" : "B2C Discover Page Editor"}
        description={
          isAr
            ? "تخصيص قصة إي ثري الترفيهية، ورسائل القيادة، وإنجاز غينيس، وتقنية بوكينج كيوب، وبوابات التواصل."
            : "Configure E3 corporate story, leadership, record achievements, BookingQube tech, and opportunity gateways."
        }
        breadcrumbs={[
          { label: isAr ? "صفحات الأفراد" : "B2C Pages", href: `/${locale}/dashboard/b2c/landing` },
          { label: isAr ? "محرر صفحة اكتشف" : "Discover Page Editor" }
        ]}
        badge={{ label: isAr ? "عام الأفراد" : "B2C Public", variant: "purple" }}
        previewUrl={`/${locale}/b2c/discover`}
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: saving
            ? (isAr ? "جاري الحفظ..." : "Saving...")
            : (isAr ? "حفظ صفحة اكتشف" : "Save Discover Page"),
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />
        }}
      />

      {/* Reciprocal Handoff Card to Story Discovery Manager */}
      <div className="bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-[var(--surface-default)] border border-purple-500/30 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {isAr ? "مدير محتوى مسارات الحكايات والتصنيفات" : "Story Discovery & Narrative Tracks CMS"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isAr
                ? "لإدارة مسارات الحكايات الفردية (القيادة، القفز، الاستكشاف، إلخ) وتصنيفات الأنشطة، انتقل إلى مدير مسارات الحكايات."
                : "To manage individual story tracks (Drive, Bounce, Explore, etc.) and What's Inside activity classifications, use the dedicated manager."}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/dashboard/b2c/content/story-discovery`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-bold text-purple-200 transition-all shrink-0 cursor-pointer"
        >
          <span>{isAr ? "فتح مدير مسارات الحكايات" : "Open Story Discovery Manager"}</span>
          <ArrowRight className={cn("w-3.5 h-3.5", isAr && "rotate-180")} />
        </Link>
      </div>

      <DashboardSectionNavigator
        sections={tabsList}
        activeSectionId={activeTab}
        onSectionChange={setActiveTab}
      />

      <AdminFormLayout>
        {/* 1. HERO TAB (E3 Living Hero System) */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-surface-default border border-border-default rounded-xl p-4">
              <h2 className="text-lg font-bold text-text-primary">{isAr ? "قسم الهيرو الرئيسي" : "1. Hero Section"}</h2>
              <button 
                onClick={() => toggleSectionEnabled("hero")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.hero?.enabled ?? true ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.hero?.enabled ?? true ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.hero?.enabled ?? true ? "Enabled" : "Disabled"}
              </button>
            </div>

            <E3LivingHeroEditor
              value={{
                eyebrowEn: data.hero?.eyebrowEn || "E3 CORPORATE STORY & ECOSYSTEM",
                eyebrowAr: data.hero?.eyebrowAr || "قصة إي ثري الترفيهية والتنفيذية",
                fixedHeadlineEn: data.hero?.fixedHeadlineEn || data.hero?.headlineTemplateEn || "CHOOSE HOW YOU WANT TO {{animated}}",
                fixedHeadlineAr: data.hero?.fixedHeadlineAr || data.hero?.headlineTemplateAr || "اختر كيف ترغب في أن {{animated}}",
                headlineTemplateEn: data.hero?.headlineTemplateEn || data.hero?.fixedHeadlineEn,
                headlineTemplateAr: data.hero?.headlineTemplateAr || data.hero?.fixedHeadlineAr,
                rotatingWordsEn: data.hero?.rotatingWordsEn || ["EXPLORE", "COMPETE", "CREATE", "DISCOVER"],
                rotatingWordsAr: data.hero?.rotatingWordsAr || ["تستكشف", "تنافس", "تبتكر", "تكتشف"],
                descriptionEn: data.hero?.subtitleEn || data.hero?.subtextEn || "",
                descriptionAr: data.hero?.subtitleAr || data.hero?.subtextAr || "",
                primaryCta: {
                  labelEn: data.hero?.primaryCtaLabelEn || data.hero?.primaryCta?.labelEn || "Explore Ecosystem",
                  labelAr: data.hero?.primaryCtaLabelAr || data.hero?.primaryCta?.labelAr || "استكشف المنظومة",
                  url: data.hero?.primaryCtaUrl || data.hero?.primaryCta?.customUrl || "#about"
                },
                secondaryCta: {
                  labelEn: data.hero?.secondaryCtaLabelEn || data.hero?.secondaryCta?.labelEn || "Leadership Message",
                  labelAr: data.hero?.secondaryCtaLabelAr || data.hero?.secondaryCta?.labelAr || "كلمة القيادة",
                  url: data.hero?.secondaryCtaUrl || data.hero?.secondaryCta?.customUrl || "#leadership"
                },
                media: {
                  mediaType: data.hero?.mediaType || "IMAGE",
                  mediaUrl: data.hero?.mediaUrl || "",
                  posterUrl: data.hero?.posterUrl || data.hero?.posterMediaUrl || "",
                  mobileMediaUrl: data.hero?.mobileMediaUrl || ""
                },
                preset: data.hero?.preset || "story-portal",
                animationSpeed: data.hero?.animationSpeed || 2800,
                animationDuration: data.hero?.animationDuration || 600,
                animationType: data.hero?.animationType || "blur-morph",
                wordStyle: data.hero?.wordStyle || "static-gradient",
                alignmentEn: data.hero?.alignmentEn || data.hero?.alignment || "center",
                alignmentAr: data.hero?.alignmentAr || data.hero?.alignment || "center",
                alignment: data.hero?.alignment,
                enableRotatingWords: data.hero?.enableRotatingWords !== false
              }}
              onChange={(updated) => {
                setIsDirty(true)
                setData((prev: any) => ({
                  ...prev,
                  hero: {
                    ...prev.hero,
                    eyebrowEn: updated.eyebrowEn,
                    eyebrowAr: updated.eyebrowAr,
                    fixedHeadlineEn: updated.fixedHeadlineEn,
                    fixedHeadlineAr: updated.fixedHeadlineAr,
                    headlineTemplateEn: updated.headlineTemplateEn,
                    headlineTemplateAr: updated.headlineTemplateAr,
                    headlineEn: updated.fixedHeadlineEn,
                    headlineAr: updated.fixedHeadlineAr,
                    rotatingWordsEn: updated.rotatingWordsEn,
                    rotatingWordsAr: updated.rotatingWordsAr,
                    subtitleEn: updated.descriptionEn,
                    subtitleAr: updated.descriptionAr,
                    subtextEn: updated.descriptionEn,
                    subtextAr: updated.descriptionAr,
                    primaryCtaLabelEn: updated.primaryCta?.labelEn,
                    primaryCtaLabelAr: updated.primaryCta?.labelAr,
                    primaryCtaUrl: updated.primaryCta?.url,
                    primaryCta: {
                      labelEn: updated.primaryCta?.labelEn,
                      labelAr: updated.primaryCta?.labelAr,
                      customUrl: updated.primaryCta?.url
                    },
                    secondaryCtaLabelEn: updated.secondaryCta?.labelEn,
                    secondaryCtaLabelAr: updated.secondaryCta?.labelAr,
                    secondaryCtaUrl: updated.secondaryCta?.url,
                    secondaryCta: {
                      labelEn: updated.secondaryCta?.labelEn,
                      labelAr: updated.secondaryCta?.labelAr,
                      customUrl: updated.secondaryCta?.url
                    },
                    mediaType: updated.media?.mediaType,
                    mediaUrl: updated.media?.mediaUrl,
                    posterUrl: updated.media?.posterUrl,
                    posterMediaUrl: updated.media?.posterUrl,
                    mobileMediaUrl: updated.media?.mobileMediaUrl,
                    preset: updated.preset,
                    animationSpeed: updated.animationSpeed,
                    animationDuration: updated.animationDuration,
                    animationType: updated.animationType,
                    wordStyle: updated.wordStyle,
                    alignmentEn: updated.alignmentEn,
                    alignmentAr: updated.alignmentAr,
                    alignment: updated.alignment,
                    enableRotatingWords: updated.enableRotatingWords
                  }
                }))
              }}
              isAr={isAr}
              defaultPreset="story-portal"
            />
          </div>
        )}

        {/* 2. ABOUT E3 TAB */}
        {activeTab === "about" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border-default">
              <h2 className="text-lg font-bold text-text-primary">2. About E3 & Corporate Profile Link</h2>
              <button 
                onClick={() => toggleSectionEnabled("about")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.about?.enabled ?? true ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.about?.enabled ?? true ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.about?.enabled ?? true ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Eyebrow (En)</label>
                <input 
                  type="text" 
                  value={data.about?.eyebrowEn || "Engineering & Experience Excellence"} 
                  onChange={e => updateSectionField("about", "eyebrowEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Eyebrow (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.about?.eyebrowAr || "تميز الترفيه والهندسة"} 
                  onChange={e => updateSectionField("about", "eyebrowAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (En)</label>
                <input 
                  type="text" 
                  value={data.about?.headingEn || ""} 
                  onChange={e => updateSectionField("about", "headingEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.about?.headingAr || ""} 
                  onChange={e => updateSectionField("about", "headingAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Long-Form Story (En)</label>
                <textarea 
                  rows={4}
                  value={data.about?.storyEn || data.about?.descriptionEn || ""} 
                  onChange={e => {
                    updateSectionField("about", "storyEn", e.target.value)
                    updateSectionField("about", "descriptionEn", e.target.value)
                  }}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none resize-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Long-Form Story (Ar)</label>
                <textarea 
                  rows={4}
                  dir="rtl"
                  value={data.about?.storyAr || data.about?.descriptionAr || ""} 
                  onChange={e => {
                    updateSectionField("about", "storyAr", e.target.value)
                    updateSectionField("about", "descriptionAr", e.target.value)
                  }}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none resize-none"
                />
              </div>

              {/* Corporate Profile Link Box */}
              <div className="col-span-2 p-4 bg-surface-subtle rounded-xl border border-border-default space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-text-primary uppercase flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-color-primary" /> Editable Corporate Profile Download Link
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.about?.companyProfileEnabled ?? true}
                      onChange={e => updateSectionField("about", "companyProfileEnabled", e.target.checked)}
                      className="rounded text-color-primary"
                    />
                    <span className="text-xs font-bold text-text-primary">Enable Link</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Label (En)</label>
                    <input
                      type="text"
                      value={data.about?.companyProfileLabelEn || "Download Corporate Profile (PDF)"}
                      onChange={e => updateSectionField("about", "companyProfileLabelEn", e.target.value)}
                      className="w-full bg-surface-hover border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Label (Ar)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={data.about?.companyProfileLabelAr || "تحميل الملف التعريفي للشركة (PDF)"}
                      onChange={e => updateSectionField("about", "companyProfileLabelAr", e.target.value)}
                      className="w-full bg-surface-hover border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Profile Document URL</label>
                    <input
                      type="text"
                      value={data.about?.companyProfileUrl || data.about?.companyProfileFileUrl || ""}
                      onChange={e => {
                        updateSectionField("about", "companyProfileUrl", e.target.value)
                        updateSectionField("about", "companyProfileFileUrl", e.target.value)
                      }}
                      placeholder="https://e3.qa/downloads/E3_Corporate_Profile_2024.pdf"
                      className="w-full bg-surface-hover border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. LEADERSHIP PERSPECTIVES */}
        {activeTab === "leadership" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border-default">
              <h2 className="text-lg font-bold text-text-primary">3. Leadership Perspectives</h2>
              <button 
                onClick={() => toggleSectionEnabled("leadership")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.leadership?.enabled ?? true ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.leadership?.enabled ?? true ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.leadership?.enabled ?? true ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (En)</label>
                <input 
                  type="text" 
                  value={data.leadership?.headingEn || ""} 
                  onChange={e => updateSectionField("leadership", "headingEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.leadership?.headingAr || ""} 
                  onChange={e => updateSectionField("leadership", "headingAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Messages Repeater */}
            <div className="space-y-4 pt-4 border-t border-border-default">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-text-primary">Leadership Messages (Linked to EmployeeProfile)</h3>
                <AdminButton 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    const newMsgs = [...(data.leadership?.messages || [])]
                    newMsgs.push({
                      id: `msg-${Date.now()}`,
                      teamMemberId: "",
                      messageTitleEn: "Executive Perspective",
                      messageTitleAr: "رؤية تنفيذية",
                      pullQuoteEn: "",
                      pullQuoteAr: "",
                      fullMessageEn: "",
                      fullMessageAr: "",
                      enabled: true,
                      sortOrder: newMsgs.length + 1
                    })
                    updateSectionField("leadership", "messages", newMsgs)
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Message
                </AdminButton>
              </div>

              {(data.leadership?.messages || []).map((msg: any, idx: number) => (
                <div key={msg.id || idx} className="p-4 bg-surface-hover rounded-xl border border-border-default space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-text-primary">Message #{idx + 1} ({msg.messageTitleEn})</span>
                    <button 
                      onClick={() => {
                        const newMsgs = data.leadership?.messages.filter((_: any, i: number) => i !== idx)
                        updateSectionField("leadership", "messages", newMsgs)
                      }}
                      className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-text-secondary uppercase">Link Active Team Member (from /dashboard/team)</label>
                      <select
                        value={msg.teamMemberId || ""}
                        onChange={e => {
                          const newMsgs = [...data.leadership.messages]
                          newMsgs[idx].teamMemberId = e.target.value
                          updateSectionField("leadership", "messages", newMsgs)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                      >
                        <option value="">-- Select Team Member --</option>
                        {teamMembers.map((m: any) => (
                          <option key={m.id} value={m.id}>
                            {m.firstName ? `${m.firstName} ${m.lastName}` : (m.name || m.id)} ({m.designation || m.role || "Team"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-secondary uppercase">Leader Name (Ar - Optional Override)</label>
                      <input 
                        type="text" 
                        dir="rtl"
                        placeholder="الاسم بالعربي"
                        value={msg.nameAr || ""} 
                        onChange={e => {
                          const newMsgs = [...data.leadership.messages]
                          newMsgs[idx].nameAr = e.target.value
                          updateSectionField("leadership", "messages", newMsgs)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-secondary uppercase">Message Title (En)</label>
                      <input 
                        type="text" 
                        value={msg.messageTitleEn || ""} 
                        onChange={e => {
                          const newMsgs = [...data.leadership.messages]
                          newMsgs[idx].messageTitleEn = e.target.value
                          updateSectionField("leadership", "messages", newMsgs)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-secondary uppercase">Message Title (Ar)</label>
                      <input 
                        type="text" 
                        dir="rtl"
                        value={msg.messageTitleAr || ""} 
                        onChange={e => {
                          const newMsgs = [...data.leadership.messages]
                          newMsgs[idx].messageTitleAr = e.target.value
                          updateSectionField("leadership", "messages", newMsgs)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-xs font-bold text-text-secondary uppercase">Leader Portrait / Avatar Image (Managed from Backend)</label>
                      <AdminMediaPicker
                        value={msg.mediaOverrideUrl || msg.imageUrl || msg.avatarUrl || ""}
                        onChange={url => {
                          const newMsgs = [...data.leadership.messages]
                          newMsgs[idx].mediaOverrideUrl = url
                          newMsgs[idx].imageUrl = url
                          newMsgs[idx].avatarUrl = url
                          updateSectionField("leadership", "messages", newMsgs)
                        }}
                        accept="image/*"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-secondary uppercase">Pull Quote (En)</label>
                      <input 
                        type="text" 
                        value={msg.pullQuoteEn || ""} 
                        onChange={e => {
                          const newMsgs = [...data.leadership.messages]
                          newMsgs[idx].pullQuoteEn = e.target.value
                          updateSectionField("leadership", "messages", newMsgs)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-secondary uppercase">Pull Quote (Ar)</label>
                      <input 
                        type="text" 
                        dir="rtl"
                        value={msg.pullQuoteAr || ""} 
                        onChange={e => {
                          const newMsgs = [...data.leadership.messages]
                          newMsgs[idx].pullQuoteAr = e.target.value
                          updateSectionField("leadership", "messages", newMsgs)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-xs font-bold text-text-secondary uppercase">Full Message (En)</label>
                      <textarea 
                        rows={2}
                        value={msg.fullMessageEn || ""} 
                        onChange={e => {
                          const newMsgs = [...data.leadership.messages]
                          newMsgs[idx].fullMessageEn = e.target.value
                          updateSectionField("leadership", "messages", newMsgs)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none resize-none"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-xs font-bold text-text-secondary uppercase">Full Message (Ar)</label>
                      <textarea 
                        rows={2}
                        dir="rtl"
                        value={msg.fullMessageAr || ""} 
                        onChange={e => {
                          const newMsgs = [...data.leadership.messages]
                          newMsgs[idx].fullMessageAr = e.target.value
                          updateSectionField("leadership", "messages", newMsgs)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. VISION & VALUES TAB */}
        {activeTab === "visionMissionValues" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border-default">
              <h2 className="text-lg font-bold text-text-primary">4. Vision, Mission & Values</h2>
              <button 
                onClick={() => toggleSectionEnabled("visionMissionValues")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.visionMissionValues?.enabled ?? true ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.visionMissionValues?.enabled ?? true ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.visionMissionValues?.enabled ?? true ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Vision Title (En)</label>
                <input 
                  type="text" 
                  value={data.visionMissionValues?.visionTitleEn || "Our Vision"} 
                  onChange={e => updateSectionField("visionMissionValues", "visionTitleEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Vision Title (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.visionMissionValues?.visionTitleAr || "رؤيتنا"} 
                  onChange={e => updateSectionField("visionMissionValues", "visionTitleAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Vision Description (En)</label>
                <textarea 
                  rows={2}
                  value={data.visionMissionValues?.visionDescriptionEn || ""} 
                  onChange={e => updateSectionField("visionMissionValues", "visionDescriptionEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none resize-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Mission Description (En)</label>
                <textarea 
                  rows={2}
                  value={data.visionMissionValues?.missionDescriptionEn || ""} 
                  onChange={e => updateSectionField("visionMissionValues", "missionDescriptionEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Values Repeater */}
            <div className="space-y-4 pt-4 border-t border-border-default">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-text-primary">Core Corporate Values</h3>
                <AdminButton 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    const vals = [...(data.visionMissionValues?.values || [])]
                    vals.push({
                      id: `val-${Date.now()}`,
                      titleEn: "New Value",
                      titleAr: "قيمة جديدة",
                      descriptionEn: "",
                      descriptionAr: "",
                      accentToken: "PRIMARY",
                      enabled: true
                    })
                    updateSectionField("visionMissionValues", "values", vals)
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Value
                </AdminButton>
              </div>

              {(data.visionMissionValues?.values || []).map((valItem: any, idx: number) => (
                <div key={valItem.id || idx} className="p-4 bg-surface-hover rounded-xl border border-border-default space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-text-primary">Value #{idx + 1}: {valItem.titleEn}</span>
                    <button 
                      onClick={() => {
                        const vals = data.visionMissionValues?.values.filter((_: any, i: number) => i !== idx)
                        updateSectionField("visionMissionValues", "values", vals)
                      }}
                      className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Title (En)"
                      value={valItem.titleEn || ""} 
                      onChange={e => {
                        const vals = [...data.visionMissionValues.values]
                        vals[idx].titleEn = e.target.value
                        updateSectionField("visionMissionValues", "values", vals)
                      }}
                      className="bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                    />
                    <input 
                      type="text" 
                      dir="rtl"
                      placeholder="Title (Ar)"
                      value={valItem.titleAr || ""} 
                      onChange={e => {
                        const vals = [...data.visionMissionValues.values]
                        vals[idx].titleAr = e.target.value
                        updateSectionField("visionMissionValues", "values", vals)
                      }}
                      className="bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. RECORD BREAKING GUINNESS SECTION */}
        {activeTab === "recordBreaking" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border-default">
              <div>
                <h2 className="text-lg font-bold text-text-primary">5. Guinness World Record™ Achievement & Evidence</h2>
                <p className="text-xs text-text-secondary">E3 InflataRUN 1,055m statement is published. Logo and certificate require evidence approval below.</p>
              </div>
              <button 
                onClick={() => toggleSectionEnabled("recordBreaking")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.recordBreaking?.enabled ?? true ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.recordBreaking?.enabled ?? true ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.recordBreaking?.enabled ?? true ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.recordBreaking?.brandingUsageApproved ?? false}
                  onChange={e => updateSectionField("recordBreaking", "brandingUsageApproved", e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-sm font-extrabold text-text-primary">Guinness World Records™ Official Branding & Logo Approved</span>
                  <p className="text-xs text-text-secondary">When enabled, renders official badge, certificate image, and structured-data award.</p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Measurement Value</label>
                <input 
                  type="text" 
                  value={data.recordBreaking?.measurementValue || "1,055"} 
                  onChange={e => updateSectionField("recordBreaking", "measurementValue", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Measurement Unit (En)</label>
                <input 
                  type="text" 
                  value={data.recordBreaking?.measurementUnitEn || "Metres"} 
                  onChange={e => updateSectionField("recordBreaking", "measurementUnitEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Official Record Title (En)</label>
                <input 
                  type="text" 
                  value={data.recordBreaking?.officialRecordTitleEn || ""} 
                  onChange={e => updateSectionField("recordBreaking", "officialRecordTitleEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Guinness Achievement / Certificate Image (Managed from Backend)</label>
                <AdminMediaPicker
                  value={data.recordBreaking?.recordImageUrl || data.recordBreaking?.certificateUrl || data.recordBreaking?.approvedBadgeMediaId || ""}
                  onChange={url => {
                    updateSectionField("recordBreaking", "recordImageUrl", url)
                    updateSectionField("recordBreaking", "certificateUrl", url)
                    updateSectionField("recordBreaking", "approvedBadgeMediaId", url)
                  }}
                  accept="image/*"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. IMPACT & MILESTONES TAB */}
        {activeTab === "impactMilestones" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border-default">
              <h2 className="text-lg font-bold text-text-primary">6. Impact Metrics & Corporate Milestones</h2>
              <button 
                onClick={() => toggleSectionEnabled("impactMilestones")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.impactMilestones?.enabled ?? true ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.impactMilestones?.enabled ?? true ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.impactMilestones?.enabled ?? true ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-text-primary">Impact Metrics Repeater</h3>
                <AdminButton 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    const metrics = [...(data.impactMilestones?.metrics || [])]
                    metrics.push({
                      id: `metric-${Date.now()}`,
                      value: "100k+",
                      labelEn: "Visitors Served",
                      labelAr: "زائر تم خدمتهم",
                      enabled: true
                    })
                    updateSectionField("impactMilestones", "metrics", metrics)
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Metric
                </AdminButton>
              </div>

              {(data.impactMilestones?.metrics || []).map((m: any, idx: number) => (
                <div key={m.id || idx} className="p-3 bg-surface-hover rounded-xl border border-border-default flex items-center gap-4">
                  <input 
                    type="text" 
                    placeholder="Value (e.g. 100k+)"
                    value={m.value || ""} 
                    onChange={e => {
                      const metrics = [...data.impactMilestones.metrics]
                      metrics[idx].value = e.target.value
                      updateSectionField("impactMilestones", "metrics", metrics)
                    }}
                    className="w-32 bg-surface-default border border-border-default rounded-lg px-3 py-1 text-xs text-text-primary font-bold font-mono"
                  />
                  <input 
                    type="text" 
                    placeholder="Label (En)"
                    value={m.labelEn || ""} 
                    onChange={e => {
                      const metrics = [...data.impactMilestones.metrics]
                      metrics[idx].labelEn = e.target.value
                      updateSectionField("impactMilestones", "metrics", metrics)
                    }}
                    className="flex-1 bg-surface-default border border-border-default rounded-lg px-3 py-1 text-xs text-text-primary"
                  />
                  <button 
                    onClick={() => {
                      const metrics = data.impactMilestones.metrics.filter((_: any, i: number) => i !== idx)
                      updateSectionField("impactMilestones", "metrics", metrics)
                    }}
                    className="text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. BOOKINGQUBE TECH TAB */}
        {activeTab === "bookingQube" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border-default">
              <h2 className="text-lg font-bold text-text-primary">7. BookingQube Technology Spotlight</h2>
              <button 
                onClick={() => toggleSectionEnabled("bookingQube")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.bookingQube?.enabled ?? true ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.bookingQube?.enabled ?? true ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.bookingQube?.enabled ?? true ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (En)</label>
                <input 
                  type="text" 
                  value={data.bookingQube?.headingEn || "BookingQube Engine"} 
                  onChange={e => updateSectionField("bookingQube", "headingEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.bookingQube?.headingAr || "منظومة بوكينج كيوب"} 
                  onChange={e => updateSectionField("bookingQube", "headingAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Summary (En)</label>
                <textarea 
                  rows={2}
                  value={data.bookingQube?.summaryEn || ""} 
                  onChange={e => updateSectionField("bookingQube", "summaryEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none resize-none"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">BookingQube Section Logo (Managed from Backend)</label>
                <AdminMediaPicker
                  value={data.bookingQube?.logoUrl || ""}
                  onChange={url => updateSectionField("bookingQube", "logoUrl", url)}
                  accept="image/*"
                />
              </div>
            </div>

            {/* Feature Cards Repeater */}
            <div className="space-y-4 pt-4 border-t border-border-default">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-text-primary">BookingQube Feature Cards</h3>
                <AdminButton 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    const feats = [...(data.bookingQube?.featureItems || [])]
                    feats.push({
                      id: `feat-${Date.now()}`,
                      titleEn: "New Feature",
                      titleAr: "ميزة جديدة",
                      descriptionEn: "",
                      descriptionAr: "",
                      imageUrl: "",
                      enabled: true
                    })
                    updateSectionField("bookingQube", "featureItems", feats)
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Feature Card
                </AdminButton>
              </div>

              {(data.bookingQube?.featureItems || []).map((feat: any, idx: number) => (
                <div key={feat.id || idx} className="p-4 bg-surface-hover rounded-xl border border-border-default space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-text-primary">Card #{idx + 1}: {feat.titleEn}</span>
                    <button 
                      onClick={() => {
                        const feats = data.bookingQube?.featureItems.filter((_: any, i: number) => i !== idx)
                        updateSectionField("bookingQube", "featureItems", feats)
                      }}
                      className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Title (En)</label>
                      <input 
                        type="text"
                        value={feat.titleEn || ""}
                        onChange={e => {
                          const feats = [...data.bookingQube.featureItems]
                          feats[idx].titleEn = e.target.value
                          updateSectionField("bookingQube", "featureItems", feats)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Title (Ar)</label>
                      <input 
                        type="text"
                        dir="rtl"
                        value={feat.titleAr || ""}
                        onChange={e => {
                          const feats = [...data.bookingQube.featureItems]
                          feats[idx].titleAr = e.target.value
                          updateSectionField("bookingQube", "featureItems", feats)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Short Description (En)</label>
                      <textarea
                        rows={2}
                        value={feat.descriptionEn || ""}
                        onChange={e => {
                          const feats = [...data.bookingQube.featureItems]
                          feats[idx].descriptionEn = e.target.value
                          updateSectionField("bookingQube", "featureItems", feats)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none resize-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Short Description (Ar)</label>
                      <textarea
                        rows={2}
                        dir="rtl"
                        value={feat.descriptionAr || ""}
                        onChange={e => {
                          const feats = [...data.bookingQube.featureItems]
                          feats[idx].descriptionAr = e.target.value
                          updateSectionField("bookingQube", "featureItems", feats)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none resize-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Detailed Popup Specification Text (En)</label>
                      <textarea
                        rows={3}
                        value={feat.detailedTextEn || ""}
                        placeholder="Detailed technical specifications, sub-second telemetry, gate access architecture..."
                        onChange={e => {
                          const feats = [...data.bookingQube.featureItems]
                          feats[idx].detailedTextEn = e.target.value
                          updateSectionField("bookingQube", "featureItems", feats)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none resize-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Detailed Popup Specification Text (Ar)</label>
                      <textarea
                        rows={3}
                        dir="rtl"
                        value={feat.detailedTextAr || ""}
                        placeholder="تفاصيل المواصفات التقنية الكاملة والتحليلات والبروتوكولات..."
                        onChange={e => {
                          const feats = [...data.bookingQube.featureItems]
                          feats[idx].detailedTextAr = e.target.value
                          updateSectionField("bookingQube", "featureItems", feats)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-default/60">
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Architecture / Badge Label (En)</label>
                        <input 
                          type="text"
                          value={feat.architectureLabelEn || "BOOKINGQUBE™ ARCHITECTURE"}
                          placeholder="e.g. BOOKINGQUBE™ ARCHITECTURE"
                          onChange={e => {
                            const feats = [...data.bookingQube.featureItems]
                            feats[idx].architectureLabelEn = e.target.value
                            updateSectionField("bookingQube", "featureItems", feats)
                          }}
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Architecture / Badge Label (Ar)</label>
                        <input 
                          type="text"
                          dir="rtl"
                          value={feat.architectureLabelAr || "هندسة بوكينج كيوب™"}
                          placeholder="مثال: هندسة بوكينج كيوب™"
                          onChange={e => {
                            const feats = [...data.bookingQube.featureItems]
                            feats[idx].architectureLabelAr = e.target.value
                            updateSectionField("bookingQube", "featureItems", feats)
                          }}
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Technical Specifications Grid Editor */}
                    <div className="space-y-3 pt-2 border-t border-border-default/60">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Technical Specifications Matrix</label>
                        <button
                          type="button"
                          onClick={() => {
                            const feats = [...data.bookingQube.featureItems]
                            const currentSpecs = Array.isArray(feats[idx].specs) ? [...feats[idx].specs] : [
                              { keyEn: "LATENCY & VALIDATION", keyAr: "سرعة الاستجابة والتحقق", valueEn: "Sub-200ms NFC & Offline Token Scanning", valueAr: "مسح فوري للرموز وتقنية NFC بدون إنترنت" },
                              { keyEn: "WALLET INTEGRATION", keyAr: "التوافق مع المحافظ الرقمية", valueEn: "Native Apple Wallet & Google Pass Sync", valueAr: "مزامنة مباشرة مع Apple Wallet و Google Pass" },
                              { keyEn: "SECURITY PROTOCOL", keyAr: "بروتوكول الأمان والحماية", valueEn: "Dynamic Encrypted QR Code Anti-Screenshot", valueAr: "رمز QR ديناميكي مشفر لمنع لقطات الشاشة" },
                              { keyEn: "ANALYTICS ENGINE", keyAr: "محرك التحليلات والبيانات", valueEn: "Real-Time Heatmaps & Density Telemetry", valueAr: "خرائط حرارية ومؤشرات كثافة لحظية" }
                            ]
                            currentSpecs.push({
                              keyEn: "NEW SPEC",
                              keyAr: "مواصفة جديدة",
                              valueEn: "Specification Value",
                              valueAr: "قيمة المواصفة"
                            })
                            feats[idx].specs = currentSpecs
                            updateSectionField("bookingQube", "featureItems", feats)
                          }}
                          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Spec Metric
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(Array.isArray(feat.specs) && feat.specs.length > 0 ? feat.specs : [
                          { keyEn: "LATENCY & VALIDATION", keyAr: "سرعة الاستجابة والتحقق", valueEn: "Sub-200ms NFC & Offline Token Scanning", valueAr: "مسح فوري للرموز وتقنية NFC بدون إنترنت" },
                          { keyEn: "WALLET INTEGRATION", keyAr: "التوافق مع المحافظ الرقمية", valueEn: "Native Apple Wallet & Google Pass Sync", valueAr: "مزامنة مباشرة مع Apple Wallet و Google Pass" },
                          { keyEn: "SECURITY PROTOCOL", keyAr: "بروتوكول الأمان والحماية", valueEn: "Dynamic Encrypted QR Code Anti-Screenshot", valueAr: "رمز QR ديناميكي مشفر لمنع لقطات الشاشة" },
                          { keyEn: "ANALYTICS ENGINE", keyAr: "محرك التحليلات والبيانات", valueEn: "Real-Time Heatmaps & Density Telemetry", valueAr: "خرائط حرارية ومؤشرات كثافة لحظية" }
                        ]).map((spec: any, sIdx: number) => (
                          <div key={sIdx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-2 rounded-lg bg-surface-default border border-border-default/60 items-center">
                            <input
                              type="text"
                              value={spec.keyEn || ""}
                              placeholder="Spec Label En (e.g. LATENCY & VALIDATION)"
                              onChange={e => {
                                const feats = [...data.bookingQube.featureItems]
                                const currentSpecs = Array.isArray(feats[idx].specs) ? [...feats[idx].specs] : [
                                  { keyEn: "LATENCY & VALIDATION", keyAr: "سرعة الاستجابة والتحقق", valueEn: "Sub-200ms NFC & Offline Token Scanning", valueAr: "مسح فوري للرموز وتقنية NFC بدون إنترنت" },
                                  { keyEn: "WALLET INTEGRATION", keyAr: "التوافق مع المحافظ الرقمية", valueEn: "Native Apple Wallet & Google Pass Sync", valueAr: "مزامنة مباشرة مع Apple Wallet و Google Pass" },
                                  { keyEn: "SECURITY PROTOCOL", keyAr: "بروتوكول الأمان والحماية", valueEn: "Dynamic Encrypted QR Code Anti-Screenshot", valueAr: "رمز QR ديناميكي مشفر لمنع لقطات الشاشة" },
                                  { keyEn: "ANALYTICS ENGINE", keyAr: "محرك التحليلات والبيانات", valueEn: "Real-Time Heatmaps & Density Telemetry", valueAr: "خرائط حرارية ومؤشرات كثافة لحظية" }
                                ]
                                currentSpecs[sIdx] = { ...currentSpecs[sIdx], keyEn: e.target.value }
                                feats[idx].specs = currentSpecs
                                updateSectionField("bookingQube", "featureItems", feats)
                              }}
                              className="col-span-2 bg-surface-hover border border-border-default rounded px-2 py-1 text-[11px] text-text-primary focus:outline-none font-mono"
                            />
                            <input
                              type="text"
                              value={spec.valueEn || ""}
                              placeholder="Spec Value En (e.g. Sub-200ms NFC & Offline...)"
                              onChange={e => {
                                const feats = [...data.bookingQube.featureItems]
                                const currentSpecs = Array.isArray(feats[idx].specs) ? [...feats[idx].specs] : [
                                  { keyEn: "LATENCY & VALIDATION", keyAr: "سرعة الاستجابة والتحقق", valueEn: "Sub-200ms NFC & Offline Token Scanning", valueAr: "مسح فوري للرموز وتقنية NFC بدون إنترنت" },
                                  { keyEn: "WALLET INTEGRATION", keyAr: "التوافق مع المحافظ الرقمية", valueEn: "Native Apple Wallet & Google Pass Sync", valueAr: "مزامنة مباشرة مع Apple Wallet و Google Pass" },
                                  { keyEn: "SECURITY PROTOCOL", keyAr: "بروتوكول الأمان والحماية", valueEn: "Dynamic Encrypted QR Code Anti-Screenshot", valueAr: "رمز QR ديناميكي مشفر لمنع لقطات الشاشة" },
                                  { keyEn: "ANALYTICS ENGINE", keyAr: "محرك التحليلات والبيانات", valueEn: "Real-Time Heatmaps & Density Telemetry", valueAr: "خرائط حرارية ومؤشرات كثافة لحظية" }
                                ]
                                currentSpecs[sIdx] = { ...currentSpecs[sIdx], valueEn: e.target.value }
                                feats[idx].specs = currentSpecs
                                updateSectionField("bookingQube", "featureItems", feats)
                              }}
                              className="col-span-2 bg-surface-hover border border-border-default rounded px-2 py-1 text-[11px] text-text-primary focus:outline-none font-bold"
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const feats = [...data.bookingQube.featureItems]
                                  const currentSpecs = (Array.isArray(feats[idx].specs) ? feats[idx].specs : [
                                    { keyEn: "LATENCY & VALIDATION", keyAr: "سرعة الاستجابة والتحقق", valueEn: "Sub-200ms NFC & Offline Token Scanning", valueAr: "مسح فوري للرموز وتقنية NFC بدون إنترنت" },
                                    { keyEn: "WALLET INTEGRATION", keyAr: "التوافق مع المحافظ الرقمية", valueEn: "Native Apple Wallet & Google Pass Sync", valueAr: "مزامنة مباشرة مع Apple Wallet و Google Pass" },
                                    { keyEn: "SECURITY PROTOCOL", keyAr: "بروتوكول الأمان والحماية", valueEn: "Dynamic Encrypted QR Code Anti-Screenshot", valueAr: "رمز QR ديناميكي مشفر لمنع لقطات الشاشة" },
                                    { keyEn: "ANALYTICS ENGINE", keyAr: "محرك التحليلات والبيانات", valueEn: "Real-Time Heatmaps & Density Telemetry", valueAr: "خرائط حرارية ومؤشرات كثافة لحظية" }
                                  ]).filter((_: any, sI: number) => sI !== sIdx)
                                  feats[idx].specs = currentSpecs
                                  updateSectionField("bookingQube", "featureItems", feats)
                                }}
                                className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                                title="Remove Spec"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase">Card Image (Header Cover)</label>
                    <AdminMediaPicker
                      value={feat.imageUrl || feat.mediaUrl || ""}
                      onChange={url => {
                        const feats = [...data.bookingQube.featureItems]
                        feats[idx].imageUrl = url
                        feats[idx].mediaUrl = url
                        updateSectionField("bookingQube", "featureItems", feats)
                      }}
                      accept="image/*"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. E3 RENTALS TECH SPOTLIGHT TAB */}
        {activeTab === "e3Rentals" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border-default">
              <h2 className="text-lg font-bold text-text-primary">8. E3 Rentals Technology Spotlight</h2>
              <button 
                onClick={() => toggleSectionEnabled("e3Rentals")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.e3Rentals?.enabled ?? true ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.e3Rentals?.enabled ?? true ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.e3Rentals?.enabled ?? true ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (En)</label>
                <input 
                  type="text" 
                  value={data.e3Rentals?.headingEn || "POWERED BY E3 RENTALS™"} 
                  onChange={e => updateSectionField("e3Rentals", "headingEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.e3Rentals?.headingAr || "مدعوم بمنظومة إي ثري للتأجير والتجهيز™"} 
                  onChange={e => updateSectionField("e3Rentals", "headingAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary uppercase">Summary (En)</label>
              <textarea 
                value={data.e3Rentals?.summaryEn || ""} 
                onChange={e => updateSectionField("e3Rentals", "summaryEn", e.target.value)}
                rows={2}
                className="w-full bg-surface-hover border border-border-default rounded-lg p-3 text-sm text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary uppercase">E3 Rentals Section Logo</label>
              <AdminMediaPicker
                value={data.e3Rentals?.logoUrl || ""}
                onChange={url => updateSectionField("e3Rentals", "logoUrl", url)}
                accept="image/*"
              />
            </div>

            {/* Feature Cards Manager */}
            <div className="space-y-4 pt-4 border-t border-border-default">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-text-primary">E3 Rentals Feature Cards</h3>
                <AdminButton 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => {
                    const feats = [...(data.e3Rentals?.featureItems || [])]
                    feats.push({
                      id: `rent-${Date.now()}`,
                      titleEn: "New Rentals Feature",
                      titleAr: "ميزة تأجير جديدة",
                      descriptionEn: "Feature description...",
                      descriptionAr: "وصف الميزة...",
                      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC_6565.jpg",
                      architectureLabelEn: "E3 RENTALS™ ARCHITECTURE",
                      architectureLabelAr: "هندسة إي ثري للتأجير",
                      specs: [
                        { keyEn: "FLEET TELEMETRY", keyAr: "تتبع الأصول والمعدات", valueEn: "Real-Time RFID & GPS Asset Tracking", valueAr: "تتبع رقمي دقيق لكافة الأصول والمعدات" },
                        { keyEn: "RIGGING & LOAD SAFETY", keyAr: "أمان التحميل والتعليق", valueEn: "Automated Structural Load & Wind Simulation", valueAr: "محاكاة رقمية للأحمال الإنشائية وسرعة الرياح" },
                        { keyEn: "POWER REDUNDANCY", keyAr: "استمرارية الطاقة", valueEn: "Dual-Grid Synchronized Distribution Telemetry", valueAr: "توزيع طاقة مزدوج متزامن يمنع انقطاع التيار" },
                        { keyEn: "DISPATCH TIMELINE", keyAr: "سرعة التجهيز والتوريد", valueEn: "24-Hour Rapid Staging & Mobilization Protocol", valueAr: "جاهزية تشغيلية وتوريد سريع خلال ٢٤ ساعة" }
                      ]
                    })
                    updateSectionField("e3Rentals", "featureItems", feats)
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Rentals Feature Card
                </AdminButton>
              </div>

              {(data.e3Rentals?.featureItems || []).map((feat: any, idx: number) => (
                <div key={feat.id || idx} className="bg-surface-hover border border-border-default rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-text-secondary">Card #{idx + 1}</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        const feats = data.e3Rentals?.featureItems.filter((_: any, i: number) => i !== idx)
                        updateSectionField("e3Rentals", "featureItems", feats)
                      }}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-text-secondary uppercase">Title (En)</label>
                      <input 
                        type="text" 
                        value={feat.titleEn || ""} 
                        onChange={e => {
                          const feats = [...data.e3Rentals.featureItems]
                          feats[idx].titleEn = e.target.value
                          updateSectionField("e3Rentals", "featureItems", feats)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-secondary uppercase">Title (Ar)</label>
                      <input 
                        type="text" 
                        dir="rtl"
                        value={feat.titleAr || ""} 
                        onChange={e => {
                          const feats = [...data.e3Rentals.featureItems]
                          feats[idx].titleAr = e.target.value
                          updateSectionField("e3Rentals", "featureItems", feats)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-text-secondary uppercase">Description (En)</label>
                      <textarea 
                        value={feat.descriptionEn || ""} 
                        onChange={e => {
                          const feats = [...data.e3Rentals.featureItems]
                          feats[idx].descriptionEn = e.target.value
                          updateSectionField("e3Rentals", "featureItems", feats)
                        }}
                        rows={2}
                        className="w-full bg-surface-default border border-border-default rounded-lg p-2 text-xs text-text-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-text-secondary uppercase">Description (Ar)</label>
                      <textarea 
                        value={feat.descriptionAr || ""} 
                        dir="rtl"
                        onChange={e => {
                          const feats = [...data.e3Rentals.featureItems]
                          feats[idx].descriptionAr = e.target.value
                          updateSectionField("e3Rentals", "featureItems", feats)
                        }}
                        rows={2}
                        className="w-full bg-surface-default border border-border-default rounded-lg p-2 text-xs text-text-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Technical Specs Customizer */}
                  <div className="space-y-3 pt-2 border-t border-border-default/60">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                          Architecture Eyebrow Tag (EN)
                        </label>
                        <input
                          type="text"
                          value={feat.architectureLabelEn || "E3 RENTALS™ FLEET LOGISTICS"}
                          placeholder="e.g. E3 RENTALS™ FLEET LOGISTICS"
                          onChange={e => {
                            const feats = [...data.e3Rentals.featureItems]
                            feats[idx].architectureLabelEn = e.target.value
                            updateSectionField("e3Rentals", "featureItems", feats)
                          }}
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                          Architecture Eyebrow Tag (AR)
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          value={feat.architectureLabelAr || "لوجستيات أسطول إي ثري للتأجير"}
                          placeholder="مثال: لوجستيات أسطول إي ثري للتأجير"
                          onChange={e => {
                            const feats = [...data.e3Rentals.featureItems]
                            feats[idx].architectureLabelAr = e.target.value
                            updateSectionField("e3Rentals", "featureItems", feats)
                          }}
                          className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-text-secondary uppercase">
                          Live Architecture Telemetry & Specs (4 Slots)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const feats = [...data.e3Rentals.featureItems]
                            const currentSpecs = Array.isArray(feats[idx].specs) ? [...feats[idx].specs] : []
                            currentSpecs.push({
                              keyEn: "NEW SPEC KEY",
                              keyAr: "مواصفة جديدة",
                              valueEn: "Real-Time Value",
                              valueAr: "قيمة المواصفة اللحظية"
                            })
                            feats[idx].specs = currentSpecs
                            updateSectionField("e3Rentals", "featureItems", feats)
                          }}
                          className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Spec
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(Array.isArray(feat.specs) && feat.specs.length > 0 ? feat.specs : [
                          { keyEn: "FLEET TELEMETRY", keyAr: "تتبع الأصول والمعدات", valueEn: "Real-Time RFID & GPS Asset Tracking", valueAr: "تتبع رقمي دقيق لكافة الأصول والمعدات" },
                          { keyEn: "DISPATCH TIMELINE", keyAr: "سرعة التجهيز والتوريد", valueEn: "24-Hour Rapid Staging & Mobilization Protocol", valueAr: "جاهزية تشغيلية وتوريد سريع خلال ٢٤ ساعة" },
                          { keyEn: "MAINTENANCE AUDIT", keyAr: "فحص الجودة والسلامة", valueEn: "ISO-Certified Cycle Inspection & Load Testing", valueAr: "فحص دوري معتمد واختبارات للأحمال والتحمل" },
                          { keyEn: "WAREHOUSE INVENTORY", keyAr: "إدارة المخزون الفوري", valueEn: "Real-Time Centralized ERP Cloud Sync", valueAr: "مزامنة سحابية مباشرة لحالة وتوفر الأصول" }
                        ]).map((spec: any, sIdx: number) => (
                          <div key={sIdx} className="grid grid-cols-5 gap-2 items-center bg-surface-default p-2 rounded-lg border border-border-default/70">
                            <input
                              type="text"
                              value={spec.keyEn || ""}
                              placeholder="Spec Key En (e.g. FLEET TELEMETRY)"
                              onChange={e => {
                                const feats = [...data.e3Rentals.featureItems]
                                const currentSpecs = Array.isArray(feats[idx].specs) ? [...feats[idx].specs] : [
                                  { keyEn: "FLEET TELEMETRY", keyAr: "تتبع الأصول والمعدات", valueEn: "Real-Time RFID & GPS Asset Tracking", valueAr: "تتبع رقمي دقيق لكافة الأصول والمعدات" },
                                  { keyEn: "DISPATCH TIMELINE", keyAr: "سرعة التجهيز والتوريد", valueEn: "24-Hour Rapid Staging & Mobilization Protocol", valueAr: "جاهزية تشغيلية وتوريد سريع خلال ٢٤ ساعة" },
                                  { keyEn: "MAINTENANCE AUDIT", keyAr: "فحص الجودة والسلامة", valueEn: "ISO-Certified Cycle Inspection & Load Testing", valueAr: "فحص دوري معتمد واختبارات للأحمال والتحمل" },
                                  { keyEn: "WAREHOUSE INVENTORY", keyAr: "إدارة المخزون الفوري", valueEn: "Real-Time Centralized ERP Cloud Sync", valueAr: "مزامنة سحابية مباشرة لحالة وتوفر الأصول" }
                                ]
                                currentSpecs[sIdx] = { ...currentSpecs[sIdx], keyEn: e.target.value }
                                feats[idx].specs = currentSpecs
                                updateSectionField("e3Rentals", "featureItems", feats)
                              }}
                              className="col-span-2 bg-surface-hover border border-border-default rounded px-2 py-1 text-[11px] text-text-primary focus:outline-none font-mono"
                            />
                            <input
                              type="text"
                              value={spec.valueEn || ""}
                              placeholder="Spec Value En"
                              onChange={e => {
                                const feats = [...data.e3Rentals.featureItems]
                                const currentSpecs = Array.isArray(feats[idx].specs) ? [...feats[idx].specs] : [
                                  { keyEn: "FLEET TELEMETRY", keyAr: "تتبع الأصول والمعدات", valueEn: "Real-Time RFID & GPS Asset Tracking", valueAr: "تتبع رقمي دقيق لكافة الأصول والمعدات" },
                                  { keyEn: "DISPATCH TIMELINE", keyAr: "سرعة التجهيز والتوريد", valueEn: "24-Hour Rapid Staging & Mobilization Protocol", valueAr: "جاهزية تشغيلية وتوريد سريع خلال ٢٤ ساعة" },
                                  { keyEn: "MAINTENANCE AUDIT", keyAr: "فحص الجودة والسلامة", valueEn: "ISO-Certified Cycle Inspection & Load Testing", valueAr: "فحص دوري معتمد واختبارات للأحمال والتحمل" },
                                  { keyEn: "WAREHOUSE INVENTORY", keyAr: "إدارة المخزون الفوري", valueEn: "Real-Time Centralized ERP Cloud Sync", valueAr: "مزامنة سحابية مباشرة لحالة وتوفر الأصول" }
                                ]
                                currentSpecs[sIdx] = { ...currentSpecs[sIdx], valueEn: e.target.value }
                                feats[idx].specs = currentSpecs
                                updateSectionField("e3Rentals", "featureItems", feats)
                              }}
                              className="col-span-2 bg-surface-hover border border-border-default rounded px-2 py-1 text-[11px] text-text-primary focus:outline-none font-bold"
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const feats = [...data.e3Rentals.featureItems]
                                  const currentSpecs = (Array.isArray(feats[idx].specs) ? feats[idx].specs : [
                                    { keyEn: "FLEET TELEMETRY", keyAr: "تتبع الأصول والمعدات", valueEn: "Real-Time RFID & GPS Asset Tracking", valueAr: "تتبع رقمي دقيق لكافة الأصول والمعدات" },
                                    { keyEn: "DISPATCH TIMELINE", keyAr: "سرعة التجهيز والتوريد", valueEn: "24-Hour Rapid Staging & Mobilization Protocol", valueAr: "جاهزية تشغيلية وتوريد سريع خلال ٢٤ ساعة" },
                                    { keyEn: "MAINTENANCE AUDIT", keyAr: "فحص الجودة والسلامة", valueEn: "ISO-Certified Cycle Inspection & Load Testing", valueAr: "فحص دوري معتمد واختبارات للأحمال والتحمل" },
                                    { keyEn: "WAREHOUSE INVENTORY", keyAr: "إدارة المخزون الفوري", valueEn: "Real-Time Centralized ERP Cloud Sync", valueAr: "مزامنة سحابية مباشرة لحالة وتوفر الأصول" }
                                  ]).filter((_: any, sI: number) => sI !== sIdx)
                                  feats[idx].specs = currentSpecs
                                  updateSectionField("e3Rentals", "featureItems", feats)
                                }}
                                className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                                title="Remove Spec"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase">Card Image (Header Cover)</label>
                    <AdminMediaPicker
                      value={feat.imageUrl || feat.mediaUrl || ""}
                      onChange={url => {
                        const feats = [...data.e3Rentals.featureItems]
                        feats[idx].imageUrl = url
                        feats[idx].mediaUrl = url
                        updateSectionField("e3Rentals", "featureItems", feats)
                      }}
                      accept="image/*"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. CONNECT GATEWAYS TAB */}
        {activeTab === "connect" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border-default">
              <h2 className="text-lg font-bold text-text-primary">8. Connect With E3 Gateways</h2>
              <button 
                onClick={() => toggleSectionEnabled("connect")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.connect?.enabled ?? true ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.connect?.enabled ?? true ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.connect?.enabled ?? true ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (En)</label>
                <input 
                  type="text" 
                  value={data.connect?.headingEn || "Connect With E3"} 
                  onChange={e => updateSectionField("connect", "headingEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.connect?.headingAr || "تواصل مع إي ثري"} 
                  onChange={e => updateSectionField("connect", "headingAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Gateway Cards Repeater */}
            <div className="space-y-4 pt-4 border-t border-border-default">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-text-primary">Gateway Cards</h3>
                <AdminButton 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    const items = [...(data.connect?.items || [])]
                    items.push({
                      id: `gateway-${Date.now()}`,
                      tabLabelEn: "Gateway",
                      tabLabelAr: "بوابة",
                      titleEn: "New Gateway",
                      titleAr: "بوابة جديدة",
                      descriptionEn: "",
                      descriptionAr: "",
                      ctaLabelEn: "Visit Gateway",
                      ctaLabelAr: "زيارة البوابة",
                      customUrl: "#",
                      imageUrl: "",
                      enabled: true
                    })
                    updateSectionField("connect", "items", items)
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Gateway Card
                </AdminButton>
              </div>

              {(data.connect?.items || []).map((item: any, idx: number) => (
                <div key={item.id || idx} className="p-4 bg-surface-hover rounded-xl border border-border-default space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-text-primary">Gateway Card #{idx + 1}: {item.titleEn}</span>
                    <button 
                      onClick={() => {
                        const items = data.connect?.items.filter((_: any, i: number) => i !== idx)
                        updateSectionField("connect", "items", items)
                      }}
                      className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase">Gateway Card Image (40% Cover Area)</label>
                    <AdminMediaPicker
                      value={item.imageUrl || item.mediaUrl || ""}
                      onChange={url => {
                        const items = [...data.connect.items]
                        items[idx].imageUrl = url
                        items[idx].mediaUrl = url
                        updateSectionField("connect", "items", items)
                      }}
                      accept="image/*"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. CLIENTS & PARTNERS TAB */}
        {activeTab === "trustedAcrossQatar" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border-default">
              <h2 className="text-lg font-bold text-text-primary">9. Trusted Across Qatar (Clients & Partners)</h2>
              <button 
                onClick={() => toggleSectionEnabled("trustedAcrossQatar")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.trustedAcrossQatar?.enabled ?? true ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.trustedAcrossQatar?.enabled ?? true ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.trustedAcrossQatar?.enabled ?? true ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-secondary uppercase">Select Partners (from Database)</label>
                <div className="p-3 bg-surface-hover rounded-xl border border-border-default max-h-60 overflow-y-auto space-y-2">
                  {partners.map((p: any) => {
                    const selected = (data.trustedAcrossQatar?.selectedPartnerIds || []).includes(p.id)
                    const displayName = p.name || p.company || p.title || p.id;
                    return (
                      <label key={p.id} className="flex items-center gap-3 text-xs text-text-primary cursor-pointer hover:bg-surface-subtle p-2 rounded-lg border border-border-subtle">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={e => {
                            const cur = [...(data.trustedAcrossQatar?.selectedPartnerIds || [])]
                            const updated = e.target.checked ? [...cur, p.id] : cur.filter((id: string) => id !== p.id)
                            updateSectionField("trustedAcrossQatar", "selectedPartnerIds", updated)
                          }}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="font-semibold">{displayName}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-text-secondary uppercase">Select B2B Clients (from /dashboard/b2b/clients)</label>
                <div className="p-3 bg-surface-hover rounded-xl border border-border-default max-h-60 overflow-y-auto space-y-2">
                  {clients.map((c: any) => {
                    const selected = (data.trustedAcrossQatar?.selectedClientIds || []).includes(c.id)
                    const displayName = c.company || c.name || c.clientName || c.id;
                    return (
                      <label key={c.id} className="flex items-center gap-3 text-xs text-text-primary cursor-pointer hover:bg-surface-subtle p-2 rounded-lg border border-border-subtle">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={e => {
                            const cur = [...(data.trustedAcrossQatar?.selectedClientIds || [])]
                            const updated = e.target.checked ? [...cur, c.id] : cur.filter((id: string) => id !== c.id)
                            updateSectionField("trustedAcrossQatar", "selectedClientIds", updated)
                          }}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="font-semibold">{displayName}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 10. INSIGHTS & NEWS TAB */}
        {activeTab === "latestInsights" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border-default">
              <h2 className="text-lg font-bold text-text-primary">10. Operations News & Update Manager Connection</h2>
              <button 
                onClick={() => toggleSectionEnabled("latestInsights")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.latestInsights?.enabled ?? true ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.latestInsights?.enabled ?? true ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.latestInsights?.enabled ?? true ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Source Mode (Operations News & Press Center)</label>
                <select
                  value={data.latestInsights?.sourceMode || "LATEST"}
                  onChange={e => updateSectionField("latestInsights", "sourceMode", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-xs text-text-primary focus:outline-none"
                >
                  <option value="LATEST">Automatic Latest Articles from Operations News Manager</option>
                  <option value="SELECTED">Manually Selected News & Press Releases</option>
                </select>
              </div>

              {data.latestInsights?.sourceMode === "SELECTED" && (
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase">Choose Articles from Operations News & Updates Manager</label>
                  <div className="p-3 bg-surface-hover rounded-xl border border-border-default max-h-60 overflow-y-auto space-y-2 mt-1">
                    {insights.map((ins: any) => {
                      const selected = (data.latestInsights?.selectedArticleIds || []).includes(ins.id)
                      const title = ins.titleEn || ins.titleAr || ins.headline || ins.id;
                      const thumb = ins.featuredMediaUrl || ins.featuredMediaId;
                      return (
                        <label key={ins.id} className="flex items-center gap-3 text-xs text-text-primary cursor-pointer hover:bg-surface-subtle p-2.5 rounded-xl border border-border-subtle transition-all">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={e => {
                              const cur = [...(data.latestInsights?.selectedArticleIds || [])]
                              const updated = e.target.checked ? [...cur, ins.id] : cur.filter((id: string) => id !== ins.id)
                              updateSectionField("latestInsights", "selectedArticleIds", updated)
                            }}
                            className="w-4 h-4 rounded text-blue-600 shrink-0"
                          />
                          <div className="w-12 h-9 rounded-lg overflow-hidden bg-black/10 border border-border-default shrink-0 flex items-center justify-center">
                            {thumb ? (
                              <img src={thumb} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-4 h-4 opacity-40 text-text-tertiary" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold truncate">{title}</div>
                            <span className="text-[10px] text-text-tertiary uppercase font-mono">{ins.contentType || "ARTICLE"}</span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 11. FINAL GATEWAY TAB */}
        {activeTab === "finalGateway" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border-default">
              <h2 className="text-lg font-bold text-text-primary">11. Selectable Final Gateway</h2>
              <button 
                onClick={() => toggleSectionEnabled("finalGateway")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.finalGateway?.enabled ?? true ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.finalGateway?.enabled ?? true ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.finalGateway?.enabled ?? true ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (En)</label>
                <input 
                  type="text" 
                  value={data.finalGateway?.headingEn || "Ready to Shape the Future of Experience?"} 
                  onChange={e => updateSectionField("finalGateway", "headingEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.finalGateway?.headingAr || "جاهز لصياغة مستقبل الترفيه معنا؟"} 
                  onChange={e => updateSectionField("finalGateway", "headingAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 12. SECTION ORDERING TAB */}
        {activeTab === "ordering" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-text-primary">12. Section Display Ordering</h2>
            <p className="text-xs text-text-secondary">Reorder the Discover page sections dynamically.</p>

            <div className="space-y-2">
              {(data.sectionOrder || [
                "hero", "about", "leadership", "visionMissionValues", "recordBreaking", 
                "impactMilestones", "bookingQube", "e3Rentals", "connect", "trustedAcrossQatar", 
                "latestInsights", "finalGateway"
              ]).map((secKey: string, idx: number) => (
                <div key={secKey} className="flex justify-between items-center p-3 bg-surface-hover border border-border-default rounded-lg">
                  <span className="text-sm font-bold text-text-primary capitalize">{idx + 1}. {secKey}</span>
                  <div className="flex gap-2">
                    <button 
                      disabled={idx === 0} 
                      onClick={() => moveSectionOrder(idx, 'up')}
                      className="p-1.5 rounded bg-surface-default hover:bg-surface-hover disabled:opacity-30 border border-border-default"
                    >
                      <ArrowUp className="w-4 h-4 text-text-primary" />
                    </button>
                    <button 
                      disabled={idx === (data.sectionOrder?.length || 11) - 1} 
                      onClick={() => moveSectionOrder(idx, 'down')}
                      className="p-1.5 rounded bg-surface-default hover:bg-surface-hover disabled:opacity-30 border border-border-default"
                    >
                      <ArrowDown className="w-4 h-4 text-text-primary" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 13. SEO & AEO SETTINGS TAB */}
        {activeTab === "seo" && (
          <AdminSeoCustomizer 
            formData={{ seo }}
            setFormData={(d: any) => setSeo(d.seo || d)}
            seo={seo}
            setSeo={setSeo}
          />
        )}

        {/* 14. FOOTER BACKGROUND MEDIA TAB */}
        {activeTab === "footer" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-text-primary">14. Footer Background Media Settings</h2>
            <p className="text-xs text-text-secondary">Configure background media for the B2C Footer on this page. Supports Image, Video (.mp4/.webm), Iframe, and 3D Spline/GLB models.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Footer Background Media URL (Image, Video, Iframe, 3D)</label>
                <AdminMediaPicker
                  value={data.footer?.backgroundMediaUrl || data.footerMediaUrl || ""}
                  onChange={url => {
                    updateSectionField("footer", "backgroundMediaUrl", url);
                    setData((prev: any) => ({ ...prev, footerMediaUrl: url }));
                  }}
                  accept="image/*,video/*"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase">Media Format / Type</label>
                  <select
                    value={data.footer?.backgroundMediaType || data.footerMediaType || "IMAGE"}
                    onChange={e => {
                      updateSectionField("footer", "backgroundMediaType", e.target.value);
                      setData((prev: any) => ({ ...prev, footerMediaType: e.target.value }));
                    }}
                    className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-xs text-text-primary focus:outline-none"
                  >
                    <option value="IMAGE">Image (JPG / PNG / WebP)</option>
                    <option value="VIDEO">Video (MP4 / WebM)</option>
                    <option value="IFRAME">Iframe Embed (YouTube / Vimeo)</option>
                    <option value="THREE_D">3D Scene (Spline / GLB)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase">Poster / Fallback Image URL</label>
                  <AdminMediaPicker
                    value={data.footer?.backgroundPosterUrl || data.footerPosterUrl || ""}
                    onChange={url => {
                      updateSectionField("footer", "backgroundPosterUrl", url);
                      setData((prev: any) => ({ ...prev, footerPosterUrl: url }));
                    }}
                    accept="image/*"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
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
