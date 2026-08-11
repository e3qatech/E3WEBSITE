"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminMediaPicker } from "../ui/AdminMediaPicker"
import { AdminButton } from "../ui/AdminButton"
import { Save, Eye, EyeOff, Plus, Trash2, ArrowUp, ArrowDown, Sparkles, Building2, User } from "lucide-react"
import { useToast } from "@/components/dashboard/ui/ToastProvider"

export interface OrbitDestinationItem {
  id: string
  labelEn: string
  labelAr: string
  href: string
  descEn: string
  descAr: string
  mediaUrl: string
  enabled: boolean
}

const DEFAULT_B2C_DESTINATIONS: OrbitDestinationItem[] = [
  {
    id: "attractions",
    labelEn: "Attractions",
    labelAr: "المرافق والوجهات",
    href: "/b2c/attractions",
    descEn: "Pristine Snow Park, Urban Arena, Kids City, and kinetic entertainment.",
    descAr: "حديقة الثلج النقي، والساحة التفاعلية، وعالم الأطفال.",
    mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
  {
    id: "calendar",
    labelEn: "Calendar",
    labelAr: "جدول الفعاليات والتذاكر",
    href: "/b2c/calendar",
    descEn: "Live concerts, seasonal festivals, passes, and exclusive entertainment shows.",
    descAr: "الحفلات الحية والمهرجانات الموسمية والتذاكر والعروض الترفيهية.",
    mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
  {
    id: "discover",
    labelEn: "Discover",
    labelAr: "استكشف قطر",
    href: "/b2c/discover",
    descEn: "Curated visitor guides, dining, and spatial technology showcases.",
    descAr: "دليل الزوار، المطاعم، والتكنولوجيا التفاعلية.",
    mediaUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
  {
    id: "packages",
    labelEn: "Packages",
    labelAr: "الباقات",
    href: "/b2c/packages",
    descEn: "VIP Birthday parties, corporate team outings, and private venue buyouts.",
    descAr: "حفلات أعياد الميلاد، الفعاليات الخاصة، وحجوزات الشركات.",
    mediaUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
  {
    id: "contact",
    labelEn: "Contact",
    labelAr: "تواصل معنا",
    href: "/b2c/contact",
    descEn: "24/7 guest support, venue location, and concierge services.",
    descAr: "خدمة الزوار، مواقع الفعاليات، واستفسارات الحجز.",
    mediaUrl: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
]

const DEFAULT_B2B_DESTINATIONS: OrbitDestinationItem[] = [
  {
    id: "services",
    labelEn: "Services & Solutions",
    labelAr: "الخدمات والحلول المتكاملة",
    href: "/b2b/services",
    descEn: "Turnkey event engineering, spatial design, kinetic AV, and production.",
    descAr: "هندسة الفعاليات، التصميم الفضائي، الحلول الصوتية والضوئية والإنتاج.",
    mediaUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
  {
    id: "cases",
    labelEn: "Case Studies & Portfolio",
    labelAr: "دراسات الحالة والمشاريع",
    href: "/b2b/cases",
    descEn: "Flagship national ceremonies, summits, and mega entertainment builds in Qatar.",
    descAr: "الاحتفالات الوطنية، القمم، والمشاريع الترفيهية الكبرى في قطر.",
    mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
  {
    id: "team",
    labelEn: "Leadership & Atelier Team",
    labelAr: "القيادة وفريق الإنتاج",
    href: "/b2b/team",
    descEn: "Meet the executive visionaries, technical directors, and spatial architects.",
    descAr: "تعرف على القادة والمهندسين ومخرجي الفعاليات في إي ثري.",
    mediaUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
  {
    id: "careers",
    labelEn: "HR & Talent Careers",
    labelAr: "الوظائف والكوادر البشرية",
    href: "/b2b/careers",
    descEn: "Join E3's world-class event production team or apply for open roles.",
    descAr: "انضم إلى فريق إنتاج الفعاليات العالمي في إي ثري أو قدم على الوظائف.",
    mediaUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
  {
    id: "b2b-contact",
    labelEn: "B2B Proposal & Contact",
    labelAr: "تقديم الطلبات والتواصل",
    href: "/b2b/contact",
    descEn: "24/7 corporate inquiry desk, venue booking, and RFP submission.",
    descAr: "مكتب استفسارات الشركات، حجوزات المقرات، وتقديم المناقصات.",
    mediaUrl: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
]

interface PulseOrbitCMSViewProps {
  initialData?: any
  initialB2BData?: any
  defaultTab?: 'B2C' | 'B2B'
}

export function PulseOrbitCMSView({ initialData, initialB2BData, defaultTab = 'B2C' }: PulseOrbitCMSViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'B2C' | 'B2B'>(defaultTab)
  const [saving, setSaving] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)

  // B2C Orbit State
  const rawB2CDestinations = initialData?.destinations || DEFAULT_B2C_DESTINATIONS
  const filteredB2CDestinations = rawB2CDestinations.filter((d: any) => d.id !== 'tickets' && !d.href?.includes('/tickets'))
  const [b2cDestinations, setB2CDestinations] = useState<OrbitDestinationItem[]>(
    filteredB2CDestinations.length > 0 ? filteredB2CDestinations : DEFAULT_B2C_DESTINATIONS
  )
  const [b2cTitleEn, setB2CTitleEn] = useState(initialData?.titleEn || "PULSE ORBIT DESTINATIONS")
  const [b2cTitleAr, setB2CTitleAr] = useState(initialData?.titleAr || "وجهات مدار إي ثري")
  const [b2cTicketsUrl, setB2CTicketsUrl] = useState(initialData?.bookTicketsUrl || "/b2c/tickets")
  const [b2cTicketsLabelEn, setB2CTicketsLabelEn] = useState(initialData?.bookTicketsLabelEn || "BOOK TICKETS")
  const [b2cTicketsLabelAr, setB2CTicketsLabelAr] = useState(initialData?.bookTicketsLabelAr || "احجز التذاكر")
  const [b2cTicketsEnabled, setB2CTicketsEnabled] = useState(initialData?.bookTicketsEnabled ?? true)
  const [b2cTicketsExternal, setB2CTicketsExternal] = useState(Boolean(initialData?.bookTicketsExternal))

  // B2B Orbit State
  const rawB2BDestinations = initialB2BData?.destinations || DEFAULT_B2B_DESTINATIONS
  const [b2bDestinations, setB2BDestinations] = useState<OrbitDestinationItem[]>(
    rawB2BDestinations.length > 0 ? rawB2BDestinations : DEFAULT_B2B_DESTINATIONS
  )
  const [b2bTitleEn, setB2BTitleEn] = useState(initialB2BData?.titleEn || "B2B ENTERPRISE ORBIT")
  const [b2bTitleAr, setB2BTitleAr] = useState(initialB2BData?.titleAr || "مدار إي ثري لقطاع الأعمال")
  const [b2bProposalUrl, setB2BProposalUrl] = useState(initialB2BData?.bookTicketsUrl || "/b2b/contact")
  const [b2bProposalLabelEn, setB2BProposalLabelEn] = useState(initialB2BData?.bookTicketsLabelEn || "REQUEST PROPOSAL")
  const [b2bProposalLabelAr, setB2BProposalLabelAr] = useState(initialB2BData?.bookTicketsLabelAr || "اطلب عرض سعر")
  const [b2bProposalEnabled, setB2BProposalEnabled] = useState(initialB2BData?.bookTicketsEnabled ?? true)
  const [b2bProposalExternal, setB2BProposalExternal] = useState(Boolean(initialB2BData?.bookTicketsExternal))

  // Fetch missing tab data if not provided
  useEffect(() => {
    async function loadB2B() {
      if (!initialB2BData) {
        try {
          const res = await fetch('/api/cms/pages/b2b-pulse-orbit')
          if (res.ok) {
            const json = await res.json()
            if (json?.data?.content) {
              const c = json.data.content
              if (c.titleEn) setB2BTitleEn(c.titleEn)
              if (c.titleAr) setB2BTitleAr(c.titleAr)
              if (c.destinations && c.destinations.length > 0) setB2BDestinations(c.destinations)
              if (c.bookTicketsUrl) setB2BProposalUrl(c.bookTicketsUrl)
              if (c.bookTicketsLabelEn) setB2BProposalLabelEn(c.bookTicketsLabelEn)
              if (c.bookTicketsLabelAr) setB2BProposalLabelAr(c.bookTicketsLabelAr)
            }
          }
        } catch (_e) {}
      }
    }
    loadB2B()
  }, [initialB2BData])

  const currentDestinations = activeTab === 'B2C' ? b2cDestinations : b2bDestinations
  const setCurrentDestinations = (updater: (prev: OrbitDestinationItem[]) => OrbitDestinationItem[]) => {
    if (activeTab === 'B2C') {
      setB2CDestinations(updater)
    } else {
      setB2BDestinations(updater)
    }
  }

  const handleDestinationChange = (id: string, field: keyof OrbitDestinationItem, value: any) => {
    setCurrentDestinations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const handleUploadStatus = (isUploading: boolean) => {
    setUploadingCount((prev) => (isUploading ? prev + 1 : Math.max(0, prev - 1)))
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    setCurrentDestinations((prev) => {
      const updated = [...prev]
      const temp = updated[index - 1]
      updated[index - 1] = updated[index]
      updated[index] = temp
      return updated
    })
  }

  const moveDown = (index: number) => {
    if (index === currentDestinations.length - 1) return
    setCurrentDestinations((prev) => {
      const updated = [...prev]
      const temp = updated[index + 1]
      updated[index + 1] = updated[index]
      updated[index] = temp
      return updated
    })
  }

  const addDestination = () => {
    const newId = `dest-${Date.now()}`
    const defaultHref = activeTab === 'B2C' ? '/b2c/attractions' : '/b2b/services'
    setCurrentDestinations((prev) => [
      ...prev,
      {
        id: newId,
        labelEn: activeTab === 'B2C' ? "New Experience World" : "New Service Solution",
        labelAr: activeTab === 'B2C' ? "وجهة ترفيهية جديدة" : "خدمة جديدة",
        href: defaultHref,
        descEn: "Describe this destination's key highlights and features.",
        descAr: "وصف المعالم والأنشطة في هذه الوجهة.",
        mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
        enabled: true,
      },
    ])
  }

  const removeDestination = (id: string) => {
    setCurrentDestinations((prev) => prev.filter((item) => item.id !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (activeTab === 'B2C') {
        const payload = {
          titleEn: b2cTitleEn,
          titleAr: b2cTitleAr,
          bookTicketsUrl: b2cTicketsUrl,
          bookTicketsLabelEn: b2cTicketsLabelEn,
          bookTicketsLabelAr: b2cTicketsLabelAr,
          bookTicketsEnabled: b2cTicketsEnabled,
          bookTicketsExternal: b2cTicketsExternal,
          destinations: b2cDestinations,
        }

        const res = await fetch("/api/cms/pages/b2c-pulse-orbit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: payload }),
        })

        if (!res.ok) throw new Error("Failed to save B2C Pulse Orbit CMS config")

        // Also sync pulse-orbit alias
        await fetch("/api/cms/pages/pulse-orbit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: payload }),
        })

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('e3_cms_pulse_orbit_updated', { detail: { type: 'b2c' } }))
        }
        toast("B2C Pulse Orbit media & destinations saved successfully.", "success")
      } else {
        const payload = {
          titleEn: b2bTitleEn,
          titleAr: b2bTitleAr,
          bookTicketsUrl: b2bProposalUrl,
          bookTicketsLabelEn: b2bProposalLabelEn,
          bookTicketsLabelAr: b2bProposalLabelAr,
          bookTicketsEnabled: b2bProposalEnabled,
          bookTicketsExternal: b2bProposalExternal,
          destinations: b2bDestinations,
        }

        const res = await fetch("/api/cms/pages/b2b-pulse-orbit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: payload }),
        })

        if (!res.ok) throw new Error("Failed to save B2B Pulse Orbit CMS config")

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('e3_cms_pulse_orbit_updated', { detail: { type: 'b2b' } }))
        }
        toast("B2B Enterprise Orbit media & destinations saved successfully.", "success")
      }

      router.refresh()
    } catch (e: any) {
      console.error(e)
      toast(e?.message || "Failed to save Pulse Orbit CMS.", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminFormLayout>
      <AdminPageHeader
        title="Pulse Orbit CMS Hub"
        description="Manage live media, labels, descriptions, and route paths for B2C & B2B Pulse Orbit modal navigation overlays."
        action={
          <AdminButton
            variant="primary"
            onClick={handleSave}
            disabled={saving || uploadingCount > 0}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : uploadingCount > 0 ? "Uploading Media..." : `Save ${activeTab} Orbit`}
          </AdminButton>
        }
      />

      {/* Orbit Portal Selector Tabs (B2C vs B2B) */}
      <div className="flex items-center gap-3 p-1.5 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl w-fit shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('B2C')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'B2C'
              ? 'bg-[var(--color-primary)] text-white shadow-md'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>B2C Pulse Orbit (Customer)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('B2B')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'B2B'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>B2B Enterprise Orbit (Corporate)</span>
        </button>
      </div>

      {/* Header CTA Manager for active tab */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span>{activeTab === 'B2C' ? 'B2C "Book Tickets" CTA Manager' : 'B2B "Request Proposal" CTA Manager'}</span>
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Configure hyperlink destination URL and button labels for the header CTA tab on public {activeTab} pages.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Target Hyperlink URL</label>
            <input
              type="text"
              value={activeTab === 'B2C' ? b2cTicketsUrl : b2bProposalUrl}
              onChange={(e) => activeTab === 'B2C' ? setB2CTicketsUrl(e.target.value) : setB2BProposalUrl(e.target.value)}
              placeholder={activeTab === 'B2C' ? "e.g. /b2c/tickets or https://tickets.e3.qa" : "e.g. /b2b/contact"}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Button Label (English)</label>
              <input
                type="text"
                value={activeTab === 'B2C' ? b2cTicketsLabelEn : b2bProposalLabelEn}
                onChange={(e) => activeTab === 'B2C' ? setB2CTicketsLabelEn(e.target.value) : setB2BProposalLabelEn(e.target.value)}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Button Label (Arabic)</label>
              <input
                type="text"
                value={activeTab === 'B2C' ? b2cTicketsLabelAr : b2bProposalLabelAr}
                onChange={(e) => activeTab === 'B2C' ? setB2CTicketsLabelAr(e.target.value) : setB2BProposalLabelAr(e.target.value)}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                dir="rtl"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activeTab === 'B2C' ? b2cTicketsEnabled : b2bProposalEnabled}
                onChange={(e) => activeTab === 'B2C' ? setB2CTicketsEnabled(e.target.checked) : setB2BProposalEnabled(e.target.checked)}
                className="rounded border-[var(--border-level-1)] accent-[var(--color-primary)] w-4 h-4 cursor-pointer"
              />
              Show CTA Button in Header
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activeTab === 'B2C' ? b2cTicketsExternal : b2bProposalExternal}
                onChange={(e) => activeTab === 'B2C' ? setB2CTicketsExternal(e.target.checked) : setB2BProposalExternal(e.target.checked)}
                className="rounded border-[var(--border-level-1)] accent-[var(--color-primary)] w-4 h-4 cursor-pointer"
              />
              Open in New Tab (_blank)
            </label>
          </div>
        </div>
      </div>

      {/* Global Title Settings */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">{activeTab} Orbit Header Titles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title (English)</label>
            <input
              type="text"
              value={activeTab === 'B2C' ? b2cTitleEn : b2bTitleEn}
              onChange={(e) => activeTab === 'B2C' ? setB2CTitleEn(e.target.value) : setB2BTitleEn(e.target.value)}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title (Arabic)</label>
            <input
              type="text"
              value={activeTab === 'B2C' ? b2cTitleAr : b2bTitleAr}
              onChange={(e) => activeTab === 'B2C' ? setB2CTitleAr(e.target.value) : setB2BTitleAr(e.target.value)}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Destinations List */}
      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{activeTab} Destinations & Media Portfolio</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Reorder, replace media, edit labels, or add custom destination worlds to Pulse Orbit.</p>
          </div>
          <button
            type="button"
            onClick={addDestination}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-extrabold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Destination World
          </button>
        </div>

        {currentDestinations.map((dest, idx) => (
          <div
            key={dest.id}
            className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-6 shadow-sm relative group"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-sm">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] text-base">{dest.labelEn || `Destination ${idx + 1}`}</h4>
                  <span className="text-xs font-mono text-[var(--text-secondary)]">{dest.href}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Move Up */}
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg border border-[var(--border-level-1)] bg-[var(--bg-level-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx === currentDestinations.length - 1}
                  className="p-1.5 rounded-lg border border-[var(--border-level-1)] bg-[var(--bg-level-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => handleDestinationChange(dest.id, "enabled", !dest.enabled)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dest.enabled
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                      : "bg-[var(--bg-level-1)] text-[var(--text-secondary)] border border-[var(--border-level-1)]"
                  }`}
                >
                  {dest.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{dest.enabled ? "Visible" : "Hidden"}</span>
                </button>

                {/* Delete Destination */}
                <button
                  type="button"
                  onClick={() => removeDestination(dest.id)}
                  className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer"
                  title="Remove Destination"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Media Picker & Direct URL Field */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[var(--text-secondary)]">Destination Media Cover (Video, Image, 3D Iframe)</label>
                <AdminMediaPicker
                  value={dest.mediaUrl}
                  onChange={(url) => handleDestinationChange(dest.id, "mediaUrl", url)}
                  onUploadStatusChange={handleUploadStatus}
                  label=""
                  accept="video/*,image/*"
                />
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">Direct Media URL / File Link</label>
                  <input
                    type="text"
                    value={dest.mediaUrl || ''}
                    onChange={(e) => handleDestinationChange(dest.id, "mediaUrl", e.target.value)}
                    placeholder="https://... or upload local file above"
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--text-tertiary)]"
                  />
                </div>
              </div>

              {/* Labels & Routes */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Label (English)</label>
                    <input
                      type="text"
                      value={dest.labelEn}
                      onChange={(e) => handleDestinationChange(dest.id, "labelEn", e.target.value)}
                      className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Label (Arabic)</label>
                    <input
                      type="text"
                      value={dest.labelAr}
                      onChange={(e) => handleDestinationChange(dest.id, "labelAr", e.target.value)}
                      className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Target Route URL</label>
                  <input
                    type="text"
                    value={dest.href}
                    onChange={(e) => handleDestinationChange(dest.id, "href", e.target.value)}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description (English)</label>
                    <textarea
                      rows={2}
                      value={dest.descEn}
                      onChange={(e) => handleDestinationChange(dest.id, "descEn", e.target.value)}
                      className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description (Arabic)</label>
                    <textarea
                      rows={2}
                      value={dest.descAr}
                      onChange={(e) => handleDestinationChange(dest.id, "descAr", e.target.value)}
                      className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminFormLayout>
  )
}
