"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdminFormLayout } from "../ui/AdminFormLayout"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { AdminMediaPicker } from "../ui/AdminMediaPicker"
import { AdminButton } from "../ui/AdminButton"
import { Save, Eye, EyeOff, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react"
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

export function PulseOrbitCMSView({ initialData }: { initialData: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)

  const rawInitialDestinations = initialData?.destinations || DEFAULT_DESTINATIONS
  const filteredDestinations = rawInitialDestinations.filter((d: any) => d.id !== 'tickets' && !d.href?.includes('/tickets'))
  const [destinations, setDestinations] = useState<OrbitDestinationItem[]>(
    filteredDestinations.length > 0 ? filteredDestinations : DEFAULT_DESTINATIONS
  )
  const [orbitTitleEn, setOrbitTitleEn] = useState(initialData?.titleEn || "PULSE ORBIT DESTINATIONS")
  const [orbitTitleAr, setOrbitTitleAr] = useState(initialData?.titleAr || "وجهات مدار إي ثري")

  const [bookTicketsUrl, setBookTicketsUrl] = useState(initialData?.bookTicketsUrl || "/b2c/tickets")
  const [bookTicketsLabelEn, setBookTicketsLabelEn] = useState(initialData?.bookTicketsLabelEn || "BOOK TICKETS")
  const [bookTicketsLabelAr, setBookTicketsLabelAr] = useState(initialData?.bookTicketsLabelAr || "احجز التذاكر")
  const [bookTicketsEnabled, setBookTicketsEnabled] = useState(initialData?.bookTicketsEnabled ?? true)
  const [bookTicketsExternal, setBookTicketsExternal] = useState(Boolean(initialData?.bookTicketsExternal))

  const handleDestinationChange = (id: string, field: keyof OrbitDestinationItem, value: any) => {
    setDestinations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const handleUploadStatus = (isUploading: boolean) => {
    setUploadingCount((prev) => (isUploading ? prev + 1 : Math.max(0, prev - 1)))
  }

  const moveUp = (index: number) => {
    if (index <= 0) return
    setDestinations((prev) => {
      const copy = [...prev]
      const temp = copy[index - 1]
      copy[index - 1] = copy[index]
      copy[index] = temp
      return copy
    })
  }

  const moveDown = (index: number) => {
    if (index >= destinations.length - 1) return
    setDestinations((prev) => {
      const copy = [...prev]
      const temp = copy[index + 1]
      copy[index + 1] = copy[index]
      copy[index] = temp
      return copy
    })
  }

  const removeDestination = (id: string) => {
    if (destinations.length <= 1) {
      toast("At least one destination world must be maintained.", "error")
      return
    }
    setDestinations((prev) => prev.filter((d) => d.id !== id))
    toast("Destination removed", "info")
  }

  const addDestination = () => {
    const newId = `dest-${Date.now()}`
    const newItem: OrbitDestinationItem = {
      id: newId,
      labelEn: "New World Destination",
      labelAr: "وجهة ترفيهية جديدة",
      href: "/b2c/attractions",
      descEn: "Custom E3 kinetic experience world.",
      descAr: "عالم تفاعلي جديد من إي ثري.",
      mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
      enabled: true,
    }
    setDestinations((prev) => [...prev, newItem])
    toast("New destination world added", "success")
  }

  const handleSave = async () => {
    if (uploadingCount > 0) {
      toast("Please wait for all pending image/video uploads to complete before saving.", "error")
      return
    }

    setSaving(true);
    try {
      const payload = {
        content: {
          titleEn: orbitTitleEn,
          titleAr: orbitTitleAr,
          destinations,
          bookTicketsUrl,
          bookTicketsLabelEn,
          bookTicketsLabelAr,
          bookTicketsEnabled,
          bookTicketsExternal,
        },
      };

      // Save to pulse-orbit slug
      const res = await fetch("/api/cms/pages/pulse-orbit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned HTTP ${res.status}`);
      }

      // Also save to b2c-pulse-orbit slug for cross-compatibility
      fetch("/api/cms/pages/b2c-pulse-orbit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});

      // Sync settings payload safely
      const settingsPayload = [
        { key: "bookTicketsUrl", value: bookTicketsUrl, type: "GENERAL" },
        { key: "bookTicketsLabelEn", value: bookTicketsLabelEn, type: "GENERAL" },
        { key: "bookTicketsLabelAr", value: bookTicketsLabelAr, type: "GENERAL" },
        { key: "bookTicketsEnabled", value: String(bookTicketsEnabled), type: "GENERAL" },
        { key: "bookTicketsExternal", value: String(bookTicketsExternal), type: "GENERAL" },
      ];

      for (const item of settingsPayload) {
        try {
          await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
        } catch (_sErr) {
          // Ignore non-critical setting sync notice
        }
      }

      // Trigger instant Next.js router refresh so public & admin pages re-fetch immediately
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('e3_cms_pulse_orbit_updated'));
      }
      router.refresh();
      toast("Pulse Orbit & Destination media saved successfully.", "success");
    } catch (e: any) {
      console.error(e);
      toast(e?.message || "Failed to save Pulse Orbit CMS.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminFormLayout>
      <AdminPageHeader
        title="Pulse Orbit CMS"
        description="Manage media, labels, descriptions, and routes for the Pulse Orbit immersive menu destinations."
        action={
          <AdminButton
            variant="primary"
            onClick={handleSave}
            disabled={saving || uploadingCount > 0}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : uploadingCount > 0 ? "Uploading Media..." : "Save Configuration"}
          </AdminButton>
        }
      />

      {/* Book Tickets CTA Hyperlink Config */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <span>Header &quot;Book Tickets&quot; CTA Hyperlink Manager</span>
        </h3>
        <p className="text-xs text-slate-400">
          Configure the hyperlink destination URL and button labels for the header &quot;Book Tickets&quot; tab across all public pages.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Target Hyperlink URL</label>
            <input
              type="text"
              value={bookTicketsUrl}
              onChange={(e) => setBookTicketsUrl(e.target.value)}
              placeholder="e.g. /b2c/tickets or https://tickets.e3.qa"
              className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Button Label (English)</label>
              <input
                type="text"
                value={bookTicketsLabelEn}
                onChange={(e) => setBookTicketsLabelEn(e.target.value)}
                className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Button Label (Arabic)</label>
              <input
                type="text"
                value={bookTicketsLabelAr}
                onChange={(e) => setBookTicketsLabelAr(e.target.value)}
                className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={bookTicketsEnabled}
                onChange={(e) => setBookTicketsEnabled(e.target.checked)}
                className="rounded border-[var(--border-level-2)] text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              Show CTA Button in Header
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={bookTicketsExternal}
                onChange={(e) => setBookTicketsExternal(e.target.checked)}
                className="rounded border-[var(--border-level-2)] text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              Open in New Tab (_blank)
            </label>
          </div>
        </div>
      </div>

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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)]">Destinations Media & Content</h3>
            <p className="text-xs text-slate-400 mt-1">Reorder, replace media, edit labels, or add custom destination worlds to Pulse Orbit.</p>
          </div>
          <button
            type="button"
            onClick={addDestination}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Destination World
          </button>
        </div>

        {destinations.map((dest, idx) => (
          <div
            key={dest.id}
            className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-6 shadow-sm relative group"
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

              <div className="flex items-center gap-2">
                {/* Move Up */}
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx === destinations.length - 1}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => handleDestinationChange(dest.id, "enabled", !dest.enabled)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dest.enabled
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {dest.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{dest.enabled ? "Visible" : "Hidden"}</span>
                </button>

                {/* Delete Destination */}
                <button
                  type="button"
                  onClick={() => removeDestination(dest.id)}
                  className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 transition-colors"
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
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Direct Media URL / File Link</label>
                  <input
                    type="text"
                    value={dest.mediaUrl || ''}
                    onChange={(e) => handleDestinationChange(dest.id, "mediaUrl", e.target.value)}
                    placeholder="https://... or upload local file above"
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
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
                      className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Label (Arabic)</label>
                    <input
                      type="text"
                      value={dest.labelAr}
                      onChange={(e) => handleDestinationChange(dest.id, "labelAr", e.target.value)}
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
                    onChange={(e) => handleDestinationChange(dest.id, "href", e.target.value)}
                    className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description (English)</label>
                    <textarea
                      rows={2}
                      value={dest.descEn}
                      onChange={(e) => handleDestinationChange(dest.id, "descEn", e.target.value)}
                      className="w-full bg-[var(--surface-input)] border border-[var(--border-level-2)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description (Arabic)</label>
                    <textarea
                      rows={2}
                      value={dest.descAr}
                      onChange={(e) => handleDestinationChange(dest.id, "descAr", e.target.value)}
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
