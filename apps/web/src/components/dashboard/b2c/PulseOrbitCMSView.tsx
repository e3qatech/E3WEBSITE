"use client"

import { useState } from "react"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminMediaPicker } from "../ui/AdminMediaPicker"
import { AdminButton } from "../ui/AdminButton"
import { Save, Eye, EyeOff } from "lucide-react"
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

const DEFAULT_DESTINATIONS: OrbitDestinationItem[] = [
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
    labelAr: "جدول الفعاليات",
    href: "/b2c/calendar",
    descEn: "Live concerts, seasonal festivals, and exclusive entertainment shows.",
    descAr: "الحفلات الحية والمهرجانات الموسمية والعروض الترفيهية.",
    mediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
    enabled: true,
  },
  {
    id: "tickets",
    labelEn: "Tickets",
    labelAr: "التذاكر والحجز",
    href: "/b2c/tickets",
    descEn: "Day passes, VIP experiences, family packages, and group booking.",
    descAr: "التذاكر اليومية، التجارب الفاخرة، والباقات العائلية.",
    mediaUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop",
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
    id: "careers",
    labelEn: "Careers",
    labelAr: "الوظائف والفرص",
    href: "/b2c/careers",
    descEn: "Join Qatar premier entertainment and event engineering team.",
    descAr: "انضم إلى فريق هندسة الفعاليات والترفيه في قطر.",
    mediaUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
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

export function PulseOrbitCMSView({ initialData }: { initialData: any }) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [destinations, setDestinations] = useState<OrbitDestinationItem[]>(
    initialData?.destinations || DEFAULT_DESTINATIONS
  )
  const [orbitTitleEn, setOrbitTitleEn] = useState(initialData?.titleEn || "PULSE ORBIT DESTINATIONS")
  const [orbitTitleAr, setOrbitTitleAr] = useState(initialData?.titleAr || "وجهات مدار إي ثري")

  const handleDestinationChange = (index: number, field: keyof OrbitDestinationItem, value: any) => {
    setDestinations((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/cms/pages/pulse-orbit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: {
            titleEn: orbitTitleEn,
            titleAr: orbitTitleAr,
            destinations,
          },
        }),
      })
      if (!res.ok) throw new Error("Failed to save Pulse Orbit configuration")
      toast("Pulse Orbit CMS updated successfully.", "success")
    } catch (e) {
      console.error(e)
      toast("Failed to save Pulse Orbit CMS.", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminFormLayout>
      <AdminPageHeader
        title="Pulse Orbit CMS"
        description="Manage media, labels, descriptions, and routes for the Pulse Orbit immersive menu destinations."
        action={
          <AdminButton variant="primary" onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Configuration"}
          </AdminButton>
        }
      />

      {/* Global Title Settings */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Orbit Header Titles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title (English)</label>
            <input
              type="text"
              value={orbitTitleEn}
              onChange={(e) => setOrbitTitleEn(e.target.value)}
              className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title (Arabic)</label>
            <input
              type="text"
              value={orbitTitleAr}
              onChange={(e) => setOrbitTitleAr(e.target.value)}
              className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Destinations List */}
      <div className="space-y-6 mt-6">
        <h3 className="text-xl font-extrabold text-[var(--text-primary)]">Destinations Media & Content</h3>

        {destinations.map((dest, idx) => (
          <div
            key={dest.id || idx}
            className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-6 shadow-sm relative"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-sm">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-bold text-white text-base">{dest.labelEn || `Destination ${idx + 1}`}</h4>
                  <span className="text-xs font-mono text-slate-400">{dest.href}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDestinationChange(idx, "enabled", !dest.enabled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dest.enabled
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {dest.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{dest.enabled ? "Visible" : "Hidden"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Media Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--text-secondary)]">Destination Media Cover</label>
                <AdminMediaPicker
                  value={dest.mediaUrl}
                  onChange={(url) => handleDestinationChange(idx, "mediaUrl", url)}
                  label="Destination Media"
                  accept="image/*"
                />
              </div>

              {/* Labels & Routes */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Label (English)</label>
                    <input
                      type="text"
                      value={dest.labelEn}
                      onChange={(e) => handleDestinationChange(idx, "labelEn", e.target.value)}
                      className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Label (Arabic)</label>
                    <input
                      type="text"
                      value={dest.labelAr}
                      onChange={(e) => handleDestinationChange(idx, "labelAr", e.target.value)}
                      className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Target Route URL</label>
                  <input
                    type="text"
                    value={dest.href}
                    onChange={(e) => handleDestinationChange(idx, "href", e.target.value)}
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description (English)</label>
                    <textarea
                      rows={2}
                      value={dest.descEn}
                      onChange={(e) => handleDestinationChange(idx, "descEn", e.target.value)}
                      className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description (Arabic)</label>
                    <textarea
                      rows={2}
                      value={dest.descAr}
                      onChange={(e) => handleDestinationChange(idx, "descAr", e.target.value)}
                      className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
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
