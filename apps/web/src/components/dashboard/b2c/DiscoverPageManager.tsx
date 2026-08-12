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
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  Layers,
  Award,
  Users,
  Building2,
  FileText,
  HelpCircle,
  Link as LinkIcon
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
      faqs: { ...DEFAULT_B2C_DISCOVER_CONTENT.faqs, ...(initialData?.faqs || {}) },
      finalGateway: { ...DEFAULT_B2C_DISCOVER_CONTENT.finalGateway, ...(initialData?.finalGateway || {}) },
      sectionOrder: initialData?.sectionOrder || DEFAULT_B2C_DISCOVER_CONTENT.sectionOrder,
    }
  })

  const [seo, setSeo] = useState<any>(initialData?.seo || DEFAULT_B2C_DISCOVER_CONTENT.seo)
  const [activeTab, setActiveTab] = useState<string>("hero")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // References for multi-select pickers
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [caseStudies, setCaseStudies] = useState<any[]>([])

  useEffect(() => {
    // Fetch Team Members
    fetch('/api/cms/team')
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData)) setTeamMembers(resData)
        else if (resData.team) setTeamMembers(resData.team)
      })
      .catch(() => {})

    // Fetch Partners
    fetch('/api/partners')
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData)) setPartners(resData)
      })
      .catch(() => {})

    // Fetch Clients
    fetch('/api/crm/clients')
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData)) setClients(resData)
        else if (resData.clients) setClients(resData.clients)
      })
      .catch(() => {})

    // Fetch Case Studies
    fetch('/api/b2b/cases')
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData)) setCaseStudies(resData)
        else if (resData.caseStudies) setCaseStudies(resData.caseStudies)
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2c-discover', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data, seo })
      })
      if (!res.ok) throw new Error("Failed to save Discover Page settings")
      toast("B2C Discover Page updated successfully.", "success")
    } catch (e: any) {
      console.error(e)
      toast(e.message || "Failed to save Discover Page.", "error")
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
        enabled: !prev[section]?.enabled
      }
    }))
  }

  const moveSectionOrder = (index: number, direction: 'up' | 'down') => {
    setData((prev: any) => {
      const newOrder = [...(prev.sectionOrder || DEFAULT_B2C_DISCOVER_CONTENT.sectionOrder)]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= newOrder.length) return prev
      const temp = newOrder[index]
      newOrder[index] = newOrder[targetIndex]
      newOrder[targetIndex] = temp
      return { ...prev, sectionOrder: newOrder }
    })
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
    { id: "faqs", label: "11. FAQs" },
    { id: "finalGateway", label: "12. Final Gateway" },
    { id: "ordering", label: "Section Ordering" },
    { id: "seo", label: "SEO & AEO Settings" }
  ]

  return (
    <div className="flex flex-col gap-6 h-full p-6 max-w-6xl mx-auto">
      <AdminPageHeader 
        title="B2C Discover Page Manager"
        description="Configure the complete E3 corporate story, leadership perspectives, BookingQube tech, and opportunity gateways."
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab.id 
                ? "bg-primary text-white" 
                : "bg-surface-hover text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AdminFormLayout>

        {/* 1. HERO SECTION */}
        {activeTab === "hero" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border-default">
              <h2 className="text-lg font-bold text-text-primary">1. Discover Hero Section</h2>
              <button 
                onClick={() => toggleSectionEnabled("hero")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.hero?.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.hero?.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.hero?.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Eyebrow (En)</label>
                <input 
                  type="text" 
                  value={data.hero?.eyebrowEn || ""} 
                  onChange={e => updateSectionField("hero", "eyebrowEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Eyebrow (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.hero?.eyebrowAr || ""} 
                  onChange={e => updateSectionField("hero", "eyebrowAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Title (En)</label>
                <input 
                  type="text" 
                  value={data.hero?.titleEn || ""} 
                  onChange={e => updateSectionField("hero", "titleEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Title (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.hero?.titleAr || ""} 
                  onChange={e => updateSectionField("hero", "titleAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Subtitle (En)</label>
                <textarea 
                  value={data.hero?.subtitleEn || ""} 
                  onChange={e => updateSectionField("hero", "subtitleEn", e.target.value)}
                  className="w-full h-20 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Subtitle (Ar)</label>
                <textarea 
                  dir="rtl"
                  value={data.hero?.subtitleAr || ""} 
                  onChange={e => updateSectionField("hero", "subtitleAr", e.target.value)}
                  className="w-full h-20 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none resize-none"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Hero Media</label>
                <AdminMediaPicker 
                  value={data.hero?.mediaUrl || ""} 
                  onChange={url => updateSectionField("hero", "mediaUrl", url)} 
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. ABOUT E3 SECTION */}
        {activeTab === "about" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border-default">
              <h2 className="text-lg font-bold text-text-primary">2. About E3 Section</h2>
              <button 
                onClick={() => toggleSectionEnabled("about")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.about?.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.about?.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.about?.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (En)</label>
                <input 
                  type="text" 
                  value={data.about?.headingEn || ""} 
                  onChange={e => updateSectionField("about", "headingEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.about?.headingAr || ""} 
                  onChange={e => updateSectionField("about", "headingAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Summary (En)</label>
                <textarea 
                  value={data.about?.summaryEn || ""} 
                  onChange={e => updateSectionField("about", "summaryEn", e.target.value)}
                  className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Summary (Ar)</label>
                <textarea 
                  dir="rtl"
                  value={data.about?.summaryAr || ""} 
                  onChange={e => updateSectionField("about", "summaryAr", e.target.value)}
                  className="w-full h-24 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Established Year</label>
                <input 
                  type="number" 
                  value={data.about?.establishedYear || 2020} 
                  onChange={e => updateSectionField("about", "establishedYear", parseInt(e.target.value) || 2020)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Headquarters (En)</label>
                <input 
                  type="text" 
                  value={data.about?.headquartersEn || ""} 
                  onChange={e => updateSectionField("about", "headquartersEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Corporate Profile PDF URL</label>
                <input 
                  type="text" 
                  value={data.about?.companyProfileFileUrl || ""} 
                  onChange={e => updateSectionField("about", "companyProfileFileUrl", e.target.value)}
                  placeholder="https://blob.vercel-storage.com/e3-profile.pdf"
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
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
                  data.leadership?.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.leadership?.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.leadership?.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (En)</label>
                <input 
                  type="text" 
                  value={data.leadership?.headingEn || ""} 
                  onChange={e => updateSectionField("leadership", "headingEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
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
                <h3 className="text-sm font-bold text-text-primary">Leadership Editorial Messages</h3>
                <AdminButton 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    const newMsgs = [...(data.leadership?.messages || [])]
                    newMsgs.push({
                      id: `msg-${Date.now()}`,
                      teamMemberId: "",
                      messageTitleEn: "Executive Note",
                      messageTitleAr: "كلمة تنفيذية",
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
                      <label className="text-xs font-bold text-text-secondary uppercase">Link Team Member (EmployeeProfile)</label>
                      <select
                        value={msg.teamMemberId || ""}
                        onChange={e => {
                          const newMsgs = [...data.leadership.messages]
                          newMsgs[idx].teamMemberId = e.target.value
                          updateSectionField("leadership", "messages", newMsgs)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none"
                      >
                        <option value="">-- Select Team Member --</option>
                        {teamMembers.map((m: any) => (
                          <option key={m.id} value={m.id}>
                            {m.firstName} {m.lastName} ({m.designation})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-secondary uppercase">Title (En)</label>
                      <input 
                        type="text" 
                        value={msg.messageTitleEn || ""} 
                        onChange={e => {
                          const newMsgs = [...data.leadership.messages]
                          newMsgs[idx].messageTitleEn = e.target.value
                          updateSectionField("leadership", "messages", newMsgs)
                        }}
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none"
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
                        className="w-full bg-surface-default border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none"
                      />
                    </div>
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
              <h2 className="text-lg font-bold text-text-primary">5. Guinness World Record™ Achievement</h2>
              <button 
                onClick={() => toggleSectionEnabled("recordBreaking")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.recordBreaking?.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.recordBreaking?.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.recordBreaking?.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Verification Status</label>
                <select
                  value={data.recordBreaking?.verificationStatus || "VERIFIED"}
                  onChange={e => updateSectionField("recordBreaking", "verificationStatus", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none font-bold"
                >
                  <option value="DRAFT">DRAFT (Hidden Badges & Unverified)</option>
                  <option value="EVIDENCE_UPLOADED">EVIDENCE_UPLOADED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="VERIFIED">VERIFIED (Public Badges Approved)</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Official Record Title (En)</label>
                <input 
                  type="text" 
                  value={data.recordBreaking?.officialRecordTitleEn || ""} 
                  onChange={e => updateSectionField("recordBreaking", "officialRecordTitleEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Measurement Value</label>
                <input 
                  type="text" 
                  value={data.recordBreaking?.measurementValue || "1,055"} 
                  onChange={e => updateSectionField("recordBreaking", "measurementValue", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Measurement Unit (En)</label>
                <input 
                  type="text" 
                  value={data.recordBreaking?.measurementUnitEn || "Metres"} 
                  onChange={e => updateSectionField("recordBreaking", "measurementUnitEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Case Study CTA Destination</label>
                <input 
                  type="text" 
                  value={data.recordBreaking?.ctaDestination || ""} 
                  onChange={e => updateSectionField("recordBreaking", "ctaDestination", e.target.value)}
                  placeholder="/en/b2b/case-studies/inflatarun"
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 9. CLIENTS & PARTNERS */}
        {activeTab === "trustedAcrossQatar" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border-default">
              <h2 className="text-lg font-bold text-text-primary">9. Trusted Across Qatar (Clients & Partners)</h2>
              <button 
                onClick={() => toggleSectionEnabled("trustedAcrossQatar")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                  data.trustedAcrossQatar?.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.trustedAcrossQatar?.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.trustedAcrossQatar?.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (En)</label>
                <input 
                  type="text" 
                  value={data.trustedAcrossQatar?.headingEn || ""} 
                  onChange={e => updateSectionField("trustedAcrossQatar", "headingEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Heading (Ar)</label>
                <input 
                  type="text" 
                  dir="rtl"
                  value={data.trustedAcrossQatar?.headingAr || ""} 
                  onChange={e => updateSectionField("trustedAcrossQatar", "headingAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION ORDERING TAB */}
        {activeTab === "ordering" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-text-primary">Section Display Ordering</h2>
            <p className="text-xs text-text-secondary">Reorder the Discover page sections dynamically.</p>

            <div className="space-y-2">
              {(data.sectionOrder || DEFAULT_B2C_DISCOVER_CONTENT.sectionOrder).map((secKey: string, idx: number) => (
                <div key={secKey} className="flex justify-between items-center p-3 bg-surface-hover border border-border-default rounded-lg">
                  <span className="text-sm font-bold text-text-primary">{idx + 1}. {secKey}</span>
                  <div className="flex gap-2">
                    <button 
                      disabled={idx === 0} 
                      onClick={() => moveSectionOrder(idx, 'up')}
                      className="p-1 rounded bg-surface-default hover:bg-surface-hover disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4 text-text-primary" />
                    </button>
                    <button 
                      disabled={idx === (data.sectionOrder?.length || 12) - 1} 
                      onClick={() => moveSectionOrder(idx, 'down')}
                      className="p-1 rounded bg-surface-default hover:bg-surface-hover disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4 text-text-primary" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <AdminSeoCustomizer 
            formData={{ seo }}
            setFormData={(data: any) => setSeo(data.seo || data)}
            seo={seo}
            setSeo={setSeo}
          />
        )}

      </AdminFormLayout>
    </div>
  )
}
