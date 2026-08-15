"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { useLocale } from "@/components/layout/LocaleProvider"
import { cn } from "@/lib/utils"
import {
  ArrowDown,
  ArrowUp,
  Building2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
  Type,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminMediaPicker } from "../ui/AdminMediaPicker"
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardStickyActions,
  DashboardUnsavedChangesGuard,
  EditorSectionItem,
} from "@/components/dashboard/ui"

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
    mediaUrl: "",
    enabled: true,
  },
  {
    id: "calendar",
    labelEn: "Calendar",
    labelAr: "جدول الفعاليات والتذاكر",
    href: "/b2c/calendar",
    descEn: "Live concerts, seasonal festivals, passes, and exclusive entertainment shows.",
    descAr: "الحفلات الحية والمهرجانات الموسمية والتذاكر والعروض الترفيهية.",
    mediaUrl: "",
    enabled: true,
  },
  {
    id: "discover",
    labelEn: "Discover",
    labelAr: "استكشف قطر",
    href: "/b2c/discover",
    descEn: "Curated visitor guides, dining, and spatial technology showcases.",
    descAr: "دليل الزوار، المطاعم، والتكنولوجيا التفاعلية.",
    mediaUrl: "",
    enabled: true,
  },
  {
    id: "packages",
    labelEn: "Packages",
    labelAr: "الباقات",
    href: "/b2c/packages",
    descEn: "VIP Birthday parties, corporate team outings, and private venue buyouts.",
    descAr: "حفلات أعياد الميلاد، الفعاليات الخاصة، وحجوزات الشركات.",
    mediaUrl: "",
    enabled: true,
  },
  {
    id: "contact",
    labelEn: "Contact",
    labelAr: "تواصل معنا",
    href: "/b2c/contact",
    descEn: "24/7 guest support, venue location, and concierge services.",
    descAr: "خدمة الزوار، مواقع الفعاليات، واستفسارات الحجز.",
    mediaUrl: "",
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
    mediaUrl: "",
    enabled: true,
  },
  {
    id: "cases",
    labelEn: "Case Studies & Portfolio",
    labelAr: "دراسات الحالة والمشاريع",
    href: "/b2b/cases",
    descEn: "Flagship national ceremonies, summits, and mega entertainment builds in Qatar.",
    descAr: "الاحتفالات الوطنية، القمم، والمشاريع الترفيهية الكبرى في قطر.",
    mediaUrl: "",
    enabled: true,
  },
  {
    id: "team",
    labelEn: "Leadership & Atelier Team",
    labelAr: "القيادة وفريق الإنتاج",
    href: "/b2b/team",
    descEn: "Meet the executive visionaries, technical directors, and spatial architects.",
    descAr: "تعرف على القادة والمهندسين ومخرجي الفعاليات في إي ثري.",
    mediaUrl: "",
    enabled: true,
  },
  {
    id: "careers",
    labelEn: "HR & Talent Careers",
    labelAr: "الوظائف والكوادر البشرية",
    href: "/b2b/careers",
    descEn: "Join E3's world-class event production team or apply for open roles.",
    descAr: "انضم إلى فريق إنتاج الفعاليات العالمي في إي ثري أو قدم على الوظائف.",
    mediaUrl: "",
    enabled: true,
  },
  {
    id: "b2b-contact",
    labelEn: "B2B Proposal & Contact",
    labelAr: "تقديم الطلبات والتواصل",
    href: "/b2b/contact",
    descEn: "24/7 corporate inquiry desk, venue booking, and RFP submission.",
    descAr: "مكتب استفسارات الشركات، حجوزات المقرات، وتقديم المناقصات.",
    mediaUrl: "",
    enabled: true,
  },
]

export interface PulseOrbitCMSViewProps {
  initialData?: any
  initialB2BData?: any
  defaultTab?: 'B2C' | 'B2B'
  scopedPortal?: 'B2C' | 'B2B' | 'ALL'
  allowedTabs?: ('B2C' | 'B2B')[]
}

export function PulseOrbitCMSView({
  initialData,
  initialB2BData,
  defaultTab = 'B2C',
  scopedPortal = 'ALL',
  allowedTabs = ['B2C', 'B2B'],
}: PulseOrbitCMSViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { locale: contextLocale } = useLocale()
  const pathname = usePathname()
  const locale = pathname?.startsWith("/ar") ? "ar" : contextLocale || "en"
  const isAr = locale === "ar"

  const effectiveDefaultTab: 'B2C' | 'B2B' =
    scopedPortal === 'B2C'
      ? 'B2C'
      : scopedPortal === 'B2B'
      ? 'B2B'
      : defaultTab && allowedTabs.includes(defaultTab)
      ? defaultTab
      : 'B2C'

  const [activeTab, setActiveTab] = useState<'B2C' | 'B2B'>(effectiveDefaultTab)
  const [saving, setSaving] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)

  // B2C Orbit State
  const rawB2CDestinations = initialData?.destinations || DEFAULT_B2C_DESTINATIONS
  const filteredB2CDestinations = rawB2CDestinations.filter(
    (d: any) => d.id !== 'tickets' && !d.href?.includes('/tickets')
  )
  const [b2cDestinations, setB2CDestinations] = useState<OrbitDestinationItem[]>(
    filteredB2CDestinations.length > 0 ? filteredB2CDestinations : DEFAULT_B2C_DESTINATIONS
  )
  const [b2cTitleEn, setB2CTitleEn] = useState(initialData?.titleEn || "PULSE ORBIT DESTINATIONS")
  const [b2cTitleAr, setB2CTitleAr] = useState(initialData?.titleAr || "وجهات مدار إي ثري")
  const [b2cNavButtonTextEn, setB2CNavButtonTextEn] = useState(initialData?.navButtonTextEn || "PULSE ORBIT")
  const [b2cNavButtonTextAr, setB2CNavButtonTextAr] = useState(initialData?.navButtonTextAr || "القائمة")
  const [b2cLogoUrl, setB2CLogoUrl] = useState(initialData?.logoUrl || "")

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
  const [b2bNavButtonTextEn, setB2BNavButtonTextEn] = useState(initialB2BData?.navButtonTextEn || "B2B ORBIT")
  const [b2bNavButtonTextAr, setB2BNavButtonTextAr] = useState(initialB2BData?.navButtonTextAr || "قطاع الأعمال")
  const [b2bLogoUrl, setB2BLogoUrl] = useState(initialB2BData?.logoUrl || "")

  const [b2bProposalUrl, setB2BProposalUrl] = useState(initialB2BData?.bookTicketsUrl || "/b2b/contact")
  const [b2bProposalLabelEn, setB2BProposalLabelEn] = useState(initialB2BData?.bookTicketsLabelEn || "REQUEST PROPOSAL")
  const [b2bProposalLabelAr, setB2BProposalLabelAr] = useState(initialB2BData?.bookTicketsLabelAr || "اطلب عرض سعر")
  const [b2bProposalEnabled, setB2BProposalEnabled] = useState(initialB2BData?.bookTicketsEnabled ?? true)
  const [b2bProposalExternal, setB2BProposalExternal] = useState(Boolean(initialB2BData?.bookTicketsExternal))

  // Fetch latest CMS data from API to ensure state matches DB 100%
  const fetchLatestCMSData = async () => {
    try {
      const shouldFetchB2C = scopedPortal === 'B2C' || scopedPortal === 'ALL'
      const shouldFetchB2B = scopedPortal === 'B2B' || scopedPortal === 'ALL'

      const [resB2C, resB2B] = await Promise.all([
        shouldFetchB2C
          ? fetch('/api/cms/pages/b2c-pulse-orbit?t=' + Date.now(), { cache: 'no-store' }).catch(() => null)
          : null,
        shouldFetchB2B
          ? fetch('/api/cms/pages/b2b-pulse-orbit?t=' + Date.now(), { cache: 'no-store' }).catch(() => null)
          : null,
      ])

      if (resB2C && resB2C.ok) {
        const json = await resB2C.json()
        const c = json?.data?.content
        if (c) {
          if (c.titleEn !== undefined) setB2CTitleEn(c.titleEn)
          if (c.titleAr !== undefined) setB2CTitleAr(c.titleAr)
          if (c.navButtonTextEn !== undefined) setB2CNavButtonTextEn(c.navButtonTextEn)
          if (c.navButtonTextAr !== undefined) setB2CNavButtonTextAr(c.navButtonTextAr)
          if (c.logoUrl !== undefined) setB2CLogoUrl(c.logoUrl)
          if (Array.isArray(c.destinations) && c.destinations.length > 0) {
            setB2CDestinations(
              c.destinations.filter((d: any) => d.id !== 'tickets' && !d.href?.includes('/tickets'))
            )
          }
          if (c.bookTicketsUrl !== undefined) setB2CTicketsUrl(c.bookTicketsUrl)
          if (c.bookTicketsLabelEn !== undefined) setB2CTicketsLabelEn(c.bookTicketsLabelEn)
          if (c.bookTicketsLabelAr !== undefined) setB2CTicketsLabelAr(c.bookTicketsLabelAr)
          if (c.bookTicketsEnabled !== undefined) setB2CTicketsEnabled(Boolean(c.bookTicketsEnabled))
          if (c.bookTicketsExternal !== undefined) setB2CTicketsExternal(Boolean(c.bookTicketsExternal))
        }
      }

      if (resB2B && resB2B.ok) {
        const json = await resB2B.json()
        const c = json?.data?.content
        if (c) {
          if (c.titleEn !== undefined) setB2BTitleEn(c.titleEn)
          if (c.titleAr !== undefined) setB2BTitleAr(c.titleAr)
          if (c.navButtonTextEn !== undefined) setB2BNavButtonTextEn(c.navButtonTextEn)
          if (c.navButtonTextAr !== undefined) setB2BNavButtonTextAr(c.navButtonTextAr)
          if (c.logoUrl !== undefined) setB2BLogoUrl(c.logoUrl)
          if (Array.isArray(c.destinations) && c.destinations.length > 0) {
            setB2BDestinations(c.destinations)
          }
          if (c.bookTicketsUrl !== undefined) setB2BProposalUrl(c.bookTicketsUrl)
          if (c.bookTicketsLabelEn !== undefined) setB2BProposalLabelEn(c.bookTicketsLabelEn)
          if (c.bookTicketsLabelAr !== undefined) setB2BProposalLabelAr(c.bookTicketsLabelAr)
          if (c.bookTicketsEnabled !== undefined) setB2BProposalEnabled(Boolean(c.bookTicketsEnabled))
          if (c.bookTicketsExternal !== undefined) setB2BProposalExternal(Boolean(c.bookTicketsExternal))
        }
      }
    } catch (_e) {}
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLatestCMSData()
    window.addEventListener('e3_cms_pulse_orbit_updated', fetchLatestCMSData)
    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel('e3_cms_sync')
      bc.onmessage = (event) => {
        if (event.data?.type === 'pulse_orbit_updated') {
          fetchLatestCMSData()
        }
      }
    } catch (_e) {}

    return () => {
      window.removeEventListener('e3_cms_pulse_orbit_updated', fetchLatestCMSData)
      if (bc) bc.close()
    }
  }, [scopedPortal])

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
          navButtonTextEn: b2cNavButtonTextEn,
          navButtonTextAr: b2cNavButtonTextAr,
          logoUrl: b2cLogoUrl,
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
          try {
            const bc = new BroadcastChannel('e3_cms_sync')
            bc.postMessage({ type: 'pulse_orbit_updated', timestamp: Date.now() })
            bc.close()
          } catch (_bcErr) {}
        }
        await fetchLatestCMSData()
        toast(
          isAr
            ? "تم حفظ وسائط ووجهات مدار الفعاليات (B2C) بنجاح."
            : "B2C Pulse Orbit media & destinations saved successfully.",
          "success"
        )
      } else {
        const payload = {
          titleEn: b2bTitleEn,
          titleAr: b2bTitleAr,
          navButtonTextEn: b2bNavButtonTextEn,
          navButtonTextAr: b2bNavButtonTextAr,
          logoUrl: b2bLogoUrl,
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
          try {
            const bc = new BroadcastChannel('e3_cms_sync')
            bc.postMessage({ type: 'pulse_orbit_updated', timestamp: Date.now() })
            bc.close()
          } catch (_bcErr) {}
        }
        await fetchLatestCMSData()
        toast(
          isAr
            ? "تم حفظ وسائط ووجهات مدار قطاع الأعمال (B2B) بنجاح."
            : "B2B Enterprise Orbit media & destinations saved successfully.",
          "success"
        )
      }

      router.refresh()
    } catch (e: any) {
      console.error(e)
      toast(e?.message || (isAr ? "فشل حفظ إعدادات مدار إي ثري." : "Failed to save Pulse Orbit CMS."), "error")
    } finally {
      setSaving(false)
    }
  }

  // Section Navigator items
  const SECTIONS: EditorSectionItem[] =
    scopedPortal === 'B2C'
      ? [{ id: "B2C", label: isAr ? "١. مدار الفعاليات والترفيه (B2C)" : "1. B2C Entertainment Orbit" }]
      : scopedPortal === 'B2B'
      ? [{ id: "B2B", label: isAr ? "١. مدار قطاع الأعمال والشركات (B2B)" : "1. B2B Enterprise Orbit" }]
      : [
          { id: "B2C", label: isAr ? "١. مدار الفعاليات والترفيه (B2C)" : "1. B2C Entertainment Orbit" },
          { id: "B2B", label: isAr ? "٢. مدار قطاع الأعمال والشركات (B2B)" : "2. B2B Enterprise Orbit" },
        ]

  // Page Header Details
  const pageTitle =
    scopedPortal === 'B2C'
      ? isAr
        ? "محرر نبض الفعاليات ثلاثي الأبعاد (B2C)"
        : "B2C Pulse Orbit 3D Navigation"
      : scopedPortal === 'B2B'
      ? isAr
        ? "محرر نبض قطاع الأعمال ثلاثي الأبعاد (B2B)"
        : "B2B Pulse Orbit 3D Navigation"
      : isAr
      ? "مركز نبض الأنظمة ثلاثي الأبعاد (Pulse Orbit Hub)"
      : "Pulse Orbit 3D Portal Settings"

  const pageDescription =
    scopedPortal === 'B2C'
      ? isAr
        ? "إدارة وتعديل وجهات مدار الفعاليات العامة، والوسائط ثلاثية الأبعاد، وزر حجز التذاكر للأفراد."
        : "Configure B2C entertainment orbit destinations, interactive media nodes, and header ticket CTAs."
      : scopedPortal === 'B2B'
      ? isAr
        ? "إدارة وتعديل وجهات مدار قطاع الأعمال، والحلول المؤسسية، وزر طلب عروض الأسعار."
        : "Configure B2B enterprise orbit destinations, corporate solutions, and header proposal CTAs."
      : isAr
      ? "إدارة الوسائط التفاعلية، العقد والوجهات، شارات الشعارات، وروابط المسارات لمدار الأفراد والشركات (/settings/pulse-orbit)."
      : "Manage live media, destination nodes, logo overlays, and route links for B2C and B2B Pulse Orbit modal navigation (/settings/pulse-orbit)."

  const breadcrumbs =
    scopedPortal === 'B2C'
      ? [
          { label: isAr ? "محتوى الأفراد" : "B2C Content", href: `/${locale}/dashboard/b2c/landing` },
          { label: isAr ? "نبض الفعاليات (B2C)" : "Pulse Orbit (B2C)" },
        ]
      : scopedPortal === 'B2B'
      ? [
          { label: isAr ? "محتوى الشركات" : "B2B Content", href: `/${locale}/dashboard/b2b/home` },
          { label: isAr ? "نبض الشركات (B2B)" : "Pulse Orbit (B2B)" },
        ]
      : [
          { label: isAr ? "الإعدادات" : "Settings", href: `/${locale}/dashboard/settings/general` },
          { label: isAr ? "مركز نبض الأنظمة" : "Pulse Orbit Hub" },
        ]

  const badgeVariant: 'purple' | 'cyan' = scopedPortal === 'B2B' ? 'cyan' : 'purple'
  const badgeLabel =
    scopedPortal === 'B2C'
      ? isAr
        ? "ترفيه للأفراد"
        : "B2C Public"
      : scopedPortal === 'B2B'
      ? isAr
        ? "قطاع الأعمال"
        : "B2B Enterprise"
      : isAr
      ? "شامل المنصة"
      : "Cross-Portal Hub"

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={uploadingCount > 0} />

      <DashboardPageHeader
        title={pageTitle}
        description={pageDescription}
        breadcrumbs={breadcrumbs}
        badge={{ label: badgeLabel, variant: badgeVariant }}
        previewUrl={`/${locale}/b2c`}
        primaryAction={{
          label: saving
            ? isAr
              ? "جاري الحفظ..."
              : "Saving..."
            : uploadingCount > 0
            ? isAr
              ? "جاري رفع الوسائط..."
              : "Uploading Media..."
            : isAr
            ? `حفظ مدار ${activeTab === 'B2C' ? 'الفعاليات' : 'الشركات'}`
            : `Save ${activeTab} Orbit`,
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      {/* Reciprocal Handoff Banners */}
      {scopedPortal === 'B2C' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {isAr ? "مدار قطاع الأعمال والشركات (B2B)" : "B2B Enterprise Orbit (Corporate)"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isAr
                  ? "لتعديل وجهات مدار الشركات والحلول المؤسسية وزر طلب العروض، انتقل إلى محرر B2B."
                  : "To edit B2B enterprise destinations, corporate solutions, and proposal request CTA, switch to the B2B Pulse Orbit editor."}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/dashboard/b2b/pulse-orbit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-xs font-bold text-cyan-200 transition-all shrink-0 cursor-pointer"
          >
            <span>{isAr ? "فتح محرر B2B" : "Open B2B Orbit"}</span>
            <ArrowRight className={cn("w-3.5 h-3.5", isAr && "rotate-180")} />
          </Link>
        </div>
      )}

      {scopedPortal === 'B2B' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 backdrop-blur-md mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {isAr ? "مدار الفعاليات والترفيه للأفراد (B2C)" : "B2C Entertainment Orbit (Public)"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isAr
                  ? "لتعديل وجهات مدار الفعاليات الترفيهية والتجارب العامة وزر التذاكر، انتقل إلى محرر B2C."
                  : "To edit B2C public entertainment destinations and ticket booking CTA, switch to the B2C Pulse Orbit editor."}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/dashboard/b2c/pulse-orbit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-bold text-purple-200 transition-all shrink-0 cursor-pointer"
          >
            <span>{isAr ? "فتح محرر B2C" : "Open B2C Orbit"}</span>
            <ArrowRight className={cn("w-3.5 h-3.5", isAr && "rotate-180")} />
          </Link>
        </div>
      )}

      {scopedPortal === 'ALL' && SECTIONS.length > 1 && (
        <DashboardSectionNavigator
          sections={SECTIONS}
          activeSectionId={activeTab}
          onSectionChange={(id) => setActiveTab(id as any)}
        />
      )}

      <AdminFormLayout>

      {/* Orbit Logo Manager Section */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[var(--color-primary)]" />
          <span>
            {isAr
              ? `مدير شعار مدار ${activeTab === 'B2C' ? 'الفعاليات' : 'الشركات'}`
              : `${activeTab} Pulse Orbit Dropdown Logo Manager`}
          </span>
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          {isAr
            ? `قم برفع أو تعيين رابط صورة شعار مخصصة لعرضها حصرياً داخل رأس القائمة التفاعلية لمدار ${activeTab === 'B2C' ? 'الفعاليات (B2C)' : 'الشركات (B2B)'}.`
            : `Upload or specify a custom brand logo image to display exclusively inside the header of the ${activeTab} Pulse Orbit dropdown modal overlay. (Note: Main site navigation bar logo is managed globally in General Settings).`}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          <div>
            <AdminMediaPicker
              value={activeTab === 'B2C' ? b2cLogoUrl : b2bLogoUrl}
              onChange={(url) => activeTab === 'B2C' ? setB2CLogoUrl(url) : setB2BLogoUrl(url)}
              onUploadStatusChange={handleUploadStatus}
              label={
                isAr
                  ? `رفع شعار مدار ${activeTab === 'B2C' ? 'الفعاليات' : 'الشركات'}`
                  : `Upload ${activeTab} Orbit Logo`
              }
              accept="image/*"
            />
          </div>
          <div className="lg:col-span-2 space-y-3">
            <label className="block text-xs font-semibold text-[var(--text-secondary)]">
              {isAr ? "رابط ملف الصورة المباشر / الأصول" : "Direct Image URL / Asset Link"}
            </label>
            <input
              type="text"
              value={activeTab === 'B2C' ? b2cLogoUrl : b2bLogoUrl}
              onChange={(e) => activeTab === 'B2C' ? setB2CLogoUrl(e.target.value) : setB2BLogoUrl(e.target.value)}
              placeholder={isAr ? "https://... (اتركه فارغاً لاستخدام الشعار العام للموقع)" : "https://... (Leave blank to use default site global logo)"}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--text-tertiary)]"
            />
            { (activeTab === 'B2C' ? b2cLogoUrl : b2bLogoUrl) && (
              <div className="p-3 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl flex items-center gap-4 w-fit">
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  {isAr ? "معاينة الشعار:" : "Logo Preview:"}
                </span>
                <img src={activeTab === 'B2C' ? b2cLogoUrl : b2bLogoUrl} alt="Orbit Logo Preview" className="h-8 w-auto object-contain" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header Button / Tab Name Customizer */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Type className="w-5 h-5 text-[var(--color-primary)]" />
          <span>
            {isAr
              ? "تخصيص نص زر القائمة الرئيسية في الهيدر"
              : `Header Navigation Button Custom Name (Change "${activeTab === 'B2C' ? 'Pulse Orbit' : 'B2B Orbit'}" Tab Label)`}
          </span>
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          {isAr
            ? `تخصيص النص الدقيق المعروض على زر تشغيل القائمة في الهيدر لصفحات ${activeTab === 'B2C' ? 'الأفراد العامة' : 'الشركات'}.`
            : `Customize the exact text displayed on the header menu trigger button on public ${activeTab} pages (e.g. "PULSE ORBIT", "NAVIGATE", "DESTINATIONS", etc.).`}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              {isAr ? "نص زر الهيدر (الإنجليزية)" : "Header Button Text (English)"}
            </label>
            <input
              type="text"
              value={activeTab === 'B2C' ? b2cNavButtonTextEn : b2bNavButtonTextEn}
              onChange={(e) => activeTab === 'B2C' ? setB2CNavButtonTextEn(e.target.value) : setB2BNavButtonTextEn(e.target.value)}
              placeholder={activeTab === 'B2C' ? "PULSE ORBIT" : "B2B ORBIT"}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              {isAr ? "نص زر الهيدر (العربية)" : "Header Button Text (Arabic)"}
            </label>
            <input
              type="text"
              value={activeTab === 'B2C' ? b2cNavButtonTextAr : b2bNavButtonTextAr}
              onChange={(e) => activeTab === 'B2C' ? setB2CNavButtonTextAr(e.target.value) : setB2BNavButtonTextAr(e.target.value)}
              placeholder={activeTab === 'B2C' ? "القائمة" : "قطاع الأعمال"}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Global Orbit Header Titles */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">
          {isAr
            ? `عناوين بانر نافذة مدار ${activeTab === 'B2C' ? 'الفعاليات' : 'الشركات'}`
            : `${activeTab} Orbit Overlay Banner Titles`}
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          {isAr
            ? "تعيين العنوان الرئيسي المعروض في أعلى نافذة القائمة التفاعلية ثلاثية الأبعاد."
            : "Configure the top headline text shown inside the full-screen Pulse Orbit modal overlay header."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              {isAr ? "عنوان البانر (الإنجليزية)" : "Overlay Banner Title (English)"}
            </label>
            <input
              type="text"
              value={activeTab === 'B2C' ? b2cTitleEn : b2bTitleEn}
              onChange={(e) => activeTab === 'B2C' ? setB2CTitleEn(e.target.value) : setB2BTitleEn(e.target.value)}
              placeholder={activeTab === 'B2C' ? "PULSE ORBIT DESTINATIONS" : "B2B ENTERPRISE ORBIT"}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              {isAr ? "عنوان البانر (العربية)" : "Overlay Banner Title (Arabic)"}
            </label>
            <input
              type="text"
              value={activeTab === 'B2C' ? b2cTitleAr : b2bTitleAr}
              onChange={(e) => activeTab === 'B2C' ? setB2CTitleAr(e.target.value) : setB2BTitleAr(e.target.value)}
              placeholder={activeTab === 'B2C' ? "وجهات مدار إي ثري" : "مدار إي ثري لقطاع الأعمال"}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-semibold"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Header CTA Manager for active tab */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span>
            {isAr
              ? activeTab === 'B2C'
                ? 'مدير زر "احجز التذاكر" في الهيدر (B2C)'
                : 'مدير زر "اطلب عرض سعر" في الهيدر (B2B)'
              : activeTab === 'B2C'
              ? 'B2C "Book Tickets" CTA Manager'
              : 'B2B "Request Proposal" CTA Manager'}
          </span>
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          {isAr
            ? `إدارة وجهة الرابط وتسمية الأزرار الخاصة بالزر الترويجي في الهيدر لصفحات ${activeTab === 'B2C' ? 'الأفراد (B2C)' : 'الشركات (B2B)'}.`
            : `Configure hyperlink destination URL and button labels for the header CTA tab on public ${activeTab} pages.`}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
              {isAr ? "رابط الوجهة المستهدفة" : "Target Hyperlink URL"}
            </label>
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
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                {isAr ? "تسمية الزر (الإنجليزية)" : "Button Label (English)"}
              </label>
              <input
                type="text"
                value={activeTab === 'B2C' ? b2cTicketsLabelEn : b2bProposalLabelEn}
                onChange={(e) => activeTab === 'B2C' ? setB2CTicketsLabelEn(e.target.value) : setB2BProposalLabelEn(e.target.value)}
                className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                {isAr ? "تسمية الزر (العربية)" : "Button Label (Arabic)"}
              </label>
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
              {isAr ? "إظهار زر الدعوة للإجراء في الهيدر" : "Show CTA Button in Header"}
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activeTab === 'B2C' ? b2cTicketsExternal : b2bProposalExternal}
                onChange={(e) => activeTab === 'B2C' ? setB2CTicketsExternal(e.target.checked) : setB2BProposalExternal(e.target.checked)}
                className="rounded border-[var(--border-level-1)] accent-[var(--color-primary)] w-4 h-4 cursor-pointer"
              />
              {isAr ? "فتح الرابط في علامة تبويب جديدة (_blank)" : "Open in New Tab (_blank)"}
            </label>
          </div>
        </div>
      </div>

      {/* Destinations List */}
      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
              {isAr
                ? `معرض وجهات ووسائط مدار ${activeTab === 'B2C' ? 'الفعاليات (B2C)' : 'الشركات (B2B)'}`
                : `${activeTab} Destinations & Media Portfolio`}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {isAr
                ? "إعادة ترتيب، استبدال الوسائط، تعديل التسميات والمسارات، أو إضافة وجهات جديدة."
                : "Reorder, replace media, edit labels, or add custom destination worlds to Pulse Orbit."}
            </p>
          </div>
          <button
            type="button"
            onClick={addDestination}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-extrabold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {isAr ? "إضافة وجهة جديدة" : "Add Destination World"}
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
                  <h4 className="font-bold text-[var(--text-primary)] text-base">
                    {isAr ? dest.labelAr || dest.labelEn || `وجهة ${idx + 1}` : dest.labelEn || `Destination ${idx + 1}`}
                  </h4>
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
                  title={isAr ? "تحريك لأعلى" : "Move Up"}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx === currentDestinations.length - 1}
                  className="p-1.5 rounded-lg border border-[var(--border-level-1)] bg-[var(--bg-level-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title={isAr ? "تحريك لأسفل" : "Move Down"}
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
                  <span>{dest.enabled ? (isAr ? "مرئي" : "Visible") : (isAr ? "مخفي" : "Hidden")}</span>
                </button>

                {/* Delete Destination */}
                <button
                  type="button"
                  onClick={() => removeDestination(dest.id)}
                  className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer"
                  title={isAr ? "حذف الوجهة" : "Remove Destination"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Media Picker & Direct URL Field */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                  {isAr ? "غلاف وسائط الوجهة (فيديو، صورة، تضمين ثلاثي الأبعاد)" : "Destination Media Cover (Video, Image, 3D Iframe)"}
                </label>
                <AdminMediaPicker
                  value={dest.mediaUrl}
                  onChange={(url) => handleDestinationChange(dest.id, "mediaUrl", url)}
                  onUploadStatusChange={handleUploadStatus}
                  label=""
                  accept="video/*,image/*"
                />
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] mb-1">
                    {isAr ? "رابط ملف الوسائط المباشر" : "Direct Media URL / File Link"}
                  </label>
                  <input
                    type="text"
                    value={dest.mediaUrl || ''}
                    onChange={(e) => handleDestinationChange(dest.id, "mediaUrl", e.target.value)}
                    placeholder={isAr ? "https://... أو قم برفع الملف أعلاه" : "https://... or upload local file above"}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--text-tertiary)]"
                  />
                </div>
              </div>

              {/* Labels & Routes */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      {isAr ? "التسمية (الإنجليزية)" : "Label (English)"}
                    </label>
                    <input
                      type="text"
                      value={dest.labelEn}
                      onChange={(e) => handleDestinationChange(dest.id, "labelEn", e.target.value)}
                      className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      {isAr ? "التسمية (العربية)" : "Label (Arabic)"}
                    </label>
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
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    {isAr ? "مسار الوجهة (URL)" : "Target Route URL"}
                  </label>
                  <input
                    type="text"
                    value={dest.href}
                    onChange={(e) => handleDestinationChange(dest.id, "href", e.target.value)}
                    className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      {isAr ? "الوصف (الإنجليزية)" : "Description (English)"}
                    </label>
                    <textarea
                      rows={2}
                      value={dest.descEn}
                      onChange={(e) => handleDestinationChange(dest.id, "descEn", e.target.value)}
                      className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      {isAr ? "الوصف (العربية)" : "Description (Arabic)"}
                    </label>
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

      <DashboardStickyActions
        onSave={handleSave}
        isSaving={saving}
        isUnsaved={uploadingCount > 0}
        onDiscard={() => {
          const confirmMessage = isAr
            ? "هل أنت متأكد من إلغاء التغييرات غير المحفوظة؟"
            : "Discard unsaved changes?"
          if (confirm(confirmMessage)) {
            window.location.reload()
          }
        }}
      />
    </DashboardPageShell>
  )
}
