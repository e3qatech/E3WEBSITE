"use client"

import { useState, useEffect } from "react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminMediaPicker } from "../ui/AdminMediaPicker"
import { AdminButton } from "../ui/AdminButton"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { AdminSeoCustomizer } from "../ui/AdminSeoCustomizer"
import { DEFAULT_B2C_DISCOVER_CONTENT } from "@/lib/cms-default-pages"
import { 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Trash2, 
  FileText
} from "lucide-react"

export function DiscoverPageManager({ initialData }: { initialData: any }) {
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
      connect: { ...DEFAULT_B2C_DISCOVER_CONTENT.connect, ...(initialData?.connect || {}) },
      trustedAcrossQatar: { ...DEFAULT_B2C_DISCOVER_CONTENT.trustedAcrossQatar, ...(initialData?.trustedAcrossQatar || {}) },
      latestInsights: { ...DEFAULT_B2C_DISCOVER_CONTENT.latestInsights, ...(initialData?.latestInsights || {}) },
      finalGateway: { ...DEFAULT_B2C_DISCOVER_CONTENT.finalGateway, ...(initialData?.finalGateway || {}) },
      sectionOrder: initialData?.sectionOrder || [
        "hero", "about", "leadership", "visionMissionValues", "recordBreaking", 
        "impactMilestones", "bookingQube", "connect", "trustedAcrossQatar", 
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
    fetch('/api/team')
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData)) setTeamMembers(resData)
        else if (resData.team) setTeamMembers(resData.team)
      })
      .catch(console.error)

    fetch('/api/partners')
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData)) setPartners(resData)
        else if (resData.data) setPartners(resData.data)
      })
      .catch(console.error)

    fetch('/api/crm/clients')
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData)) setClients(resData)
        else if (resData.clients) setClients(resData.clients)
      })
      .catch(console.error)

    fetch('/api/insights')
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData.data)) setInsights(resData.data)
      })
      .catch(console.error)

  }, [])

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
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }))
  }

  const toggleSectionEnabled = (section: string) => {
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        enabled: !(prev[section]?.enabled ?? true)
      }
    }))
  }

  const moveSectionOrder = (index: number, direction: 'up' | 'down') => {
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
    { id: "connect", label: "8. Connect Gateways" },
    { id: "trustedAcrossQatar", label: "9. Clients & Partners" },
    { id: "latestInsights", label: "10. Insights & News" },
    { id: "finalGateway", label: "11. Final Gateway" },
    { id: "ordering", label: "12. Section Ordering" },
    { id: "seo", label: "13. SEO & AEO Settings" }
  ]

  return (
    <div className="flex flex-col gap-6 h-full p-6 max-w-6xl mx-auto font-poppins">
      <AdminPageHeader 
        title="B2C Discover Page Manager"
        description="Configure E3 corporate story, leadership, record achievements, BookingQube tech, and opportunity gateways."
        action={
          <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Discover Page"}
          </AdminButton>
        }
      />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border-default pb-4">
        {tabsList.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === tab.id 
                ? "bg-color-primary text-white" 
                : "bg-surface-subtle text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AdminFormLayout>
        {/* 1. HERO TAB */}
        {activeTab === "hero" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border-default">
              <h2 className="text-lg font-bold text-text-primary">1. Hero Section</h2>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Eyebrow (En)</label>
                <input 
                  type="text" 
                  value={data.hero?.eyebrowEn || "The E3 Qatar Ecosystem"} 
                  onChange={e => updateSectionField("hero", "eyebrowEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Eyebrow (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.hero?.eyebrowAr || "منظومة إي ثري الترفيهية"} 
                  onChange={e => updateSectionField("hero", "eyebrowAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Headline (En)</label>
                <input 
                  type="text" 
                  value={data.hero?.headlineEn || ""} 
                  onChange={e => updateSectionField("hero", "headlineEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Headline (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.hero?.headlineAr || ""} 
                  onChange={e => updateSectionField("hero", "headlineAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Subtext (En)</label>
                <textarea 
                  rows={2}
                  value={data.hero?.subtextEn || ""} 
                  onChange={e => updateSectionField("hero", "subtextEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none resize-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Subtext (Ar)</label>
                <textarea 
                  rows={2}
                  dir="rtl"
                  value={data.hero?.subtextAr || ""} 
                  onChange={e => updateSectionField("hero", "subtextAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none resize-none"
                />
              </div>

              {/* Primary CTA — EN label, AR label, destination URL */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Primary CTA Label (En)</label>
                <input 
                  type="text" 
                  value={data.hero?.primaryCtaLabelEn || "Explore Ecosystem"} 
                  onChange={e => updateSectionField("hero", "primaryCtaLabelEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Primary CTA Label (Ar)</label>
                <input 
                  type="text"
                  dir="rtl"
                  value={data.hero?.primaryCtaLabelAr || "استكشف المنظومة"} 
                  onChange={e => updateSectionField("hero", "primaryCtaLabelAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Primary CTA Destination (internal route, #anchor, or https://)</label>
                <input 
                  type="text" 
                  value={data.hero?.primaryCtaUrl || "#about"} 
                  onChange={e => updateSectionField("hero", "primaryCtaUrl", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none font-mono"
                />
              </div>

              {/* Universal Media Controls */}
              <div className="col-span-2 p-4 bg-surface-subtle rounded-xl border border-border-default space-y-4">
                <label className="text-xs font-extrabold text-text-primary uppercase block">Universal Hero Media (Image / Video / 3D Model / Iframe)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Media Type</label>
                    <select
                      value={data.hero?.mediaType || "IMAGE"}
                      onChange={e => updateSectionField("hero", "mediaType", e.target.value)}
                      className="w-full bg-surface-hover border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                    >
                      <option value="IMAGE">Image</option>
                      <option value="VIDEO">Video</option>
                      <option value="MODEL_3D">3D GLB Model</option>
                      <option value="IFRAME">Iframe / Embed</option>
                      <option value="SPLINE">Spline 3D</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Theme</label>
                    <select
                      value={data.hero?.theme || "DARK"}
                      onChange={e => updateSectionField("hero", "theme", e.target.value)}
                      className="w-full bg-surface-hover border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none"
                    >
                      <option value="DARK">Dark Cinematic</option>
                      <option value="LIGHT">Light Clean</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Desktop Media URL</label>
                    <AdminMediaPicker
                      value={data.hero?.mediaUrl || ""}
                      onChange={url => updateSectionField("hero", "mediaUrl", url)}
                      accept="image/*,video/*"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Mobile Fallback Media URL</label>
                    <input
                      type="text"
                      value={data.hero?.mobileMediaUrl || ""}
                      onChange={e => updateSectionField("hero", "mobileMediaUrl", e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-surface-hover border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Video Poster Media URL</label>
                    <input
                      type="text"
                      value={data.hero?.posterMediaUrl || ""}
                      onChange={e => updateSectionField("hero", "posterMediaUrl", e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-surface-hover border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
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
                      <label className="text-xs font-bold text-text-secondary uppercase">Link Active Team Member (EmployeeProfile)</label>
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
                            {m.firstName} {m.lastName} ({m.designation || "Team"})
                          </option>
                        ))}
                      </select>
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

                    <div className="col-span-2">
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
            </div>
          </div>
        )}

        {/* 8. CONNECT GATEWAYS TAB */}
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
          </div>
        )}

        {/* 9. CLIENTS & PARTNERS TAB */}
        {activeTab === "trustedAcrossQatar" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-text-primary">9. Trusted Across Qatar (Clients & Partners)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Select Partners (from Database)</label>
                <div className="p-3 bg-surface-hover rounded-xl border border-border-default max-h-48 overflow-y-auto space-y-1">
                  {partners.map(p => {
                    const selected = (data.trustedAcrossQatar?.selectedPartnerIds || []).includes(p.id)
                    return (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-text-primary cursor-pointer hover:bg-surface-subtle p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={e => {
                            const cur = [...(data.trustedAcrossQatar?.selectedPartnerIds || [])]
                            const updated = e.target.checked ? [...cur, p.id] : cur.filter(id => id !== p.id)
                            updateSectionField("trustedAcrossQatar", "selectedPartnerIds", updated)
                          }}
                        />
                        <span>{p.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Select Clients (from Database)</label>
                <div className="p-3 bg-surface-hover rounded-xl border border-border-default max-h-48 overflow-y-auto space-y-1">
                  {clients.map(c => {
                    const selected = (data.trustedAcrossQatar?.selectedClientIds || []).includes(c.id)
                    return (
                      <label key={c.id} className="flex items-center gap-2 text-xs text-text-primary cursor-pointer hover:bg-surface-subtle p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={e => {
                            const cur = [...(data.trustedAcrossQatar?.selectedClientIds || [])]
                            const updated = e.target.checked ? [...cur, c.id] : cur.filter(id => id !== c.id)
                            updateSectionField("trustedAcrossQatar", "selectedClientIds", updated)
                          }}
                        />
                        <span>{c.company}</span>
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
            <h2 className="text-lg font-bold text-text-primary">10. Latest Insights & News Connection</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase">Source Mode</label>
                <select
                  value={data.latestInsights?.sourceMode || "LATEST"}
                  onChange={e => updateSectionField("latestInsights", "sourceMode", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-xs text-text-primary focus:outline-none"
                >
                  <option value="LATEST">Automatic Latest Articles</option>
                  <option value="SELECTED">Manually Selected Articles</option>
                </select>
              </div>

              {data.latestInsights?.sourceMode === "SELECTED" && (
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase">Choose Articles from Central Insights Portal</label>
                  <div className="p-3 bg-surface-hover rounded-xl border border-border-default max-h-48 overflow-y-auto space-y-1 mt-1">
                    {insights.map(ins => {
                      const selected = (data.latestInsights?.selectedArticleIds || []).includes(ins.id)
                      return (
                        <label key={ins.id} className="flex items-center gap-2 text-xs text-text-primary cursor-pointer hover:bg-surface-subtle p-1 rounded">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={e => {
                              const cur = [...(data.latestInsights?.selectedArticleIds || [])]
                              const updated = e.target.checked ? [...cur, ins.id] : cur.filter(id => id !== ins.id)
                              updateSectionField("latestInsights", "selectedArticleIds", updated)
                            }}
                          />
                          <span>{ins.titleEn} ({ins.contentType})</span>
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
                "impactMilestones", "bookingQube", "connect", "trustedAcrossQatar", 
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
      </AdminFormLayout>
    </div>
  )
}
