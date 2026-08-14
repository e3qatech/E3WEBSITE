"use client"

import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'
import { MapPin, Save, Sparkles, ExternalLink, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardLoadingState,
} from '@/components/dashboard/ui'

export function ExploreQatarManager() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullContent, setFullContent] = useState<any>(null)
  const [canonicalLocations, setCanonicalLocations] = useState<any[]>([])

  const [qatarMap, setQatarMap] = useState({
    titleEn: '',
    titleAr: '',
    subtextEn: '',
    subtextAr: '',
    selectedLocationIds: [] as string[],
    presentationOverrides: {} as Record<string, any>,
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [cmsRes, locsRes] = await Promise.all([
          fetch('/api/cms/pages/b2c-landing?t=' + Date.now(), { cache: 'no-store' }),
          fetch('/api/b2c/locations?publicationStatus=PUBLISHED'),
        ])

        let loadedLocations: any[] = []
        if (locsRes.ok) {
          const locsJson = await locsRes.json()
          loadedLocations = locsJson.data || []
          setCanonicalLocations(loadedLocations)
        }

        if (cmsRes.ok) {
          const json = await cmsRes.json()
          const data = json?.data?.content || DEFAULT_B2C_LANDING_CONTENT
          setFullContent(data)
          if (data.qatarMap) {
            // Extract selected IDs or map from legacy venues
            const existingSelectedIds: string[] = Array.isArray(data.qatarMap.selectedLocationIds)
              ? data.qatarMap.selectedLocationIds
              : Array.isArray(data.qatarMap.locationIds)
              ? data.qatarMap.locationIds
              : Array.isArray(data.qatarMap.venues)
              ? data.qatarMap.venues.map((v: any) => v.id || v.locationId).filter(Boolean)
              : loadedLocations.slice(0, 6).map((l: any) => l.id)

            setQatarMap({
              titleEn: data.qatarMap.headlineEn || data.qatarMap.titleEn || DEFAULT_B2C_LANDING_CONTENT.qatarMap.headlineEn,
              titleAr: data.qatarMap.headlineAr || data.qatarMap.titleAr || DEFAULT_B2C_LANDING_CONTENT.qatarMap.headlineAr,
              subtextEn: data.qatarMap.subtextEn || DEFAULT_B2C_LANDING_CONTENT.qatarMap.subtextEn,
              subtextAr: data.qatarMap.subtextAr || DEFAULT_B2C_LANDING_CONTENT.qatarMap.subtextAr,
              selectedLocationIds: existingSelectedIds,
              presentationOverrides: data.qatarMap.presentationOverrides || {},
            })
          }
        }
      } catch (err) {
        console.error('Failed to load Qatar Map content manager:', err)
        toast('Failed to load Qatar Map content', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleLocationSelection = (locId: string) => {
    setQatarMap((prev) => {
      const isSelected = prev.selectedLocationIds.includes(locId)
      const nextIds = isSelected
        ? prev.selectedLocationIds.filter((id) => id !== locId)
        : [...prev.selectedLocationIds, locId]
      return { ...prev, selectedLocationIds: nextIds }
    })
  }

  const moveLocationOrder = (locId: string, direction: 'up' | 'down') => {
    setQatarMap((prev) => {
      const ids = [...prev.selectedLocationIds]
      const idx = ids.indexOf(locId)
      if (idx === -1) return prev
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= ids.length) return prev
      const temp = ids[idx]
      ids[idx] = ids[targetIdx]
      ids[targetIdx] = temp
      return { ...prev, selectedLocationIds: ids }
    })
  }

  const handleOverrideChange = (locId: string, field: string, value: any) => {
    setQatarMap((prev) => ({
      ...prev,
      presentationOverrides: {
        ...prev.presentationOverrides,
        [locId]: {
          ...(prev.presentationOverrides[locId] || {}),
          [field]: value,
        },
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updatedFullContent = {
        ...(fullContent || DEFAULT_B2C_LANDING_CONTENT),
        qatarMap: {
          headlineEn: qatarMap.titleEn,
          headlineAr: qatarMap.titleAr,
          subtextEn: qatarMap.subtextEn,
          subtextAr: qatarMap.subtextAr,
          selectedLocationIds: qatarMap.selectedLocationIds,
          presentationOverrides: qatarMap.presentationOverrides,
        },
      }

      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedFullContent }),
      })

      if (!res.ok) throw new Error('Failed to save Qatar Map content')

      const json = await res.json().catch(() => null)
      if (json?.data?.content) {
        setFullContent(json.data.content)
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('e3_cms_b2c_landing_updated'))
        try {
          const bc = new BroadcastChannel('e3_cms_sync')
          bc.postMessage({ type: 'b2c_landing_updated', timestamp: Date.now() })
          bc.close()
        } catch (_bcErr) {}
      }

      toast('Qatar Map settings and pin selection saved successfully!', 'success')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast(err?.message || 'Error saving content', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <DashboardLoadingState title="Loading Qatar Map Content Manager..." type="skeleton" />
  }

  return (
    <DashboardPageShell variant="focused">
      {/* Top Action Header */}
      <DashboardPageHeader
        title="Explore E3 Across Qatar Content Manager"
        description="Configure public landing map presentations by selecting and ordering canonical Location records from the GIS system."
        breadcrumbs={[
          { label: "B2C Content", href: "/dashboard/b2c/attractions" },
          { label: "Qatar Map GIS" },
        ]}
        badge={{ label: "GIS Canonical Map", variant: "success" }}
        primaryAction={{
          label: saving ? 'Saving Changes...' : 'Save Qatar Map',
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      {/* Section Header */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span>Map Section Title & Subtext</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title (English)</label>
            <input
              type="text"
              value={qatarMap.titleEn}
              onChange={(e) => setQatarMap((prev) => ({ ...prev, titleEn: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={qatarMap.titleAr}
              onChange={(e) => setQatarMap((prev) => ({ ...prev, titleAr: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 placeholder:text-[var(--text-tertiary)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Subtext (English)</label>
            <textarea
              rows={2}
              value={qatarMap.subtextEn}
              onChange={(e) => setQatarMap((prev) => ({ ...prev, subtextEn: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Subtext (Arabic)</label>
            <textarea
              rows={2}
              dir="rtl"
              value={qatarMap.subtextAr}
              onChange={(e) => setQatarMap((prev) => ({ ...prev, subtextAr: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Canonical Location Selection Roster */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-level-1)] pb-4">
          <div>
            <h2 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>Canonical Location Pins ({qatarMap.selectedLocationIds.length} Selected)</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Select and reorder canonical GIS records displayed on the public landing map. Venue coordinates, operational statuses, and addresses are managed centrally.
            </p>
          </div>

          <Link
            href="/dashboard/b2c/locations"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all shrink-0"
          >
            <span>Manage All Locations</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
          </Link>
        </div>

        {/* Selected Locations Table with Reordering */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Active Map Pins Order
          </div>

          {qatarMap.selectedLocationIds.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[var(--border-level-1)] rounded-2xl text-xs text-[var(--text-secondary)]">
              No custom location subset selected. The public map will display all published canonical locations sorted by default order.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-level-1)] rounded-xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] overflow-hidden">
              {qatarMap.selectedLocationIds.map((id, idx) => {
                const loc = canonicalLocations.find((l) => l.id === id) || {
                  id,
                  nameEn: `Location (${id})`,
                  venueEn: 'Qatar',
                  latitude: 25.4,
                  longitude: 51.5,
                  operationalStatus: 'OPEN',
                }
                const override = qatarMap.presentationOverrides[id] || {}

                return (
                  <div key={id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">{loc.nameEn}</div>
                        <div className="text-xs text-[var(--text-secondary)] font-mono">
                          {loc.venueEn || loc.addressEn || 'Qatar'} • GPS: {loc.latitude}, {loc.longitude}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Pin Color Token Override */}
                      <select
                        value={override.pinColorToken || loc.pinColorToken || 'CYAN'}
                        onChange={(e) => handleOverrideChange(id, 'pinColorToken', e.target.value)}
                        className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-2 py-1 text-xs font-mono text-[var(--text-primary)]"
                        title="Pin Color Token"
                      >
                        <option value="CYAN">Cyan Pin</option>
                        <option value="GOLD">Gold Pin</option>
                        <option value="PURPLE">Purple Pin</option>
                        <option value="AMBER">Amber Pin</option>
                      </select>

                      {/* Order Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveLocationOrder(id, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] disabled:opacity-30 cursor-pointer text-xs"
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveLocationOrder(id, 'down')}
                          disabled={idx === qatarMap.selectedLocationIds.length - 1}
                          className="p-1.5 rounded-lg bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] disabled:opacity-30 cursor-pointer text-xs"
                          title="Move Down"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => toggleLocationSelection(id)}
                        className="px-2.5 py-1 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Available Canonical Locations Selector */}
        <div className="space-y-3 pt-4 border-t border-[var(--border-level-1)]">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Available Published Locations ({canonicalLocations.length})
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {canonicalLocations.map((loc) => {
              const isSelected = qatarMap.selectedLocationIds.includes(loc.id)
              return (
                <div
                  key={loc.id}
                  onClick={() => toggleLocationSelection(loc.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                      : 'bg-[var(--bg-level-1)] border-[var(--border-level-1)] hover:border-[var(--border-level-2)]'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs font-bold text-[var(--text-primary)] truncate">{loc.nameEn}</div>
                    <div className="text-[10px] text-[var(--text-secondary)] truncate font-mono">
                      {loc.venueEn || loc.addressEn || 'Qatar'}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[var(--border-level-1)]" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardPageShell>
  )
}
