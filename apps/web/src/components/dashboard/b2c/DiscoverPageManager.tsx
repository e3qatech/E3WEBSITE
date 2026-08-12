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
  Link as LinkIcon,
  CheckCircle2,
  Info
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

  // Dynamic references
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
      const currentOrder = prev.sectionOrder || [
        "hero", "about", "leadership", "visionMissionValues", "recordBreaking", 
        "impactMilestones", "bookingQube", "connect", "trustedAcrossQatar", 
        "latestInsights", "finalGateway"
      ]
      const newOrder = [...currentOrder]
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
    { id: "finalGateway", label: "11. Final Gateway" },
    { id: "ordering", label: "Section Ordering" },
    { id: "seo", label: "SEO & AEO Settings" }
  ]

  return (
    <div className="flex flex-col gap-6 h-full p-6 max-w-6xl mx-auto">
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
            <h2 className="text-lg font-bold text-text-primary">1. Hero Section</h2>
            <div className="grid grid-cols-2 gap-4">
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
                <label className="text-xs font-bold text-text-secondary uppercase block mb-1">Hero Media (Image / Video / 3D Model / Iframe)</label>
                <div className="flex gap-4 items-center">
                  <select
                    value={data.hero?.mediaType || "IMAGE"}
                    onChange={e => updateSectionField("hero", "mediaType", e.target.value)}
                    className="bg-surface-hover border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none cursor-pointer"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="MODEL_3D">3D Model</option>
                    <option value="IFRAME">Iframe</option>
                  </select>
                  <div className="flex-1">
                    <AdminMediaPicker
                      value={data.hero?.mediaUrl || ""}
                      onChange={url => updateSectionField("hero", "mediaUrl", url)}
                      accept="image/*,video/*"
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
            <h2 className="text-lg font-bold text-text-primary">2. About E3 & Corporate Profile Link</h2>
            <div className="grid grid-cols-2 gap-4">
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
                  data.leadership?.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.leadership?.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.leadership?.enabled ? "Enabled" : "Disabled"}
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
                  data.recordBreaking?.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {data.recordBreaking?.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {data.recordBreaking?.enabled ? "Enabled" : "Disabled"}
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

        {/* 9. CLIENTS & PARTNERS */}
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

        {/* 10. INSIGHTS & NEWS */}
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

        {/* SECTION ORDERING TAB */}
        {activeTab === "ordering" && (
          <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-text-primary">Section Display Ordering</h2>
            <p className="text-xs text-text-secondary">Reorder the Discover page sections dynamically.</p>

            <div className="space-y-2">
              {(data.sectionOrder || [
                "hero", "about", "leadership", "visionMissionValues", "recordBreaking", 
                "impactMilestones", "bookingQube", "connect", "trustedAcrossQatar", 
                "latestInsights", "finalGateway"
              ]).map((secKey: string, idx: number) => (
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
                      disabled={idx === (data.sectionOrder?.length || 11) - 1} 
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
            setFormData={(d: any) => setSeo(d.seo || d)}
            seo={seo}
            setSeo={setSeo}
          />
        )}
      </AdminFormLayout>
    </div>
  )
}
