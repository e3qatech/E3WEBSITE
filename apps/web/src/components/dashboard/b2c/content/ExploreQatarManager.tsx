"use client"

import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'
import { MapPin, Plus, Save, Sparkles, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
  
  const [qatarMap, setQatarMap] = useState({
    titleEn: '',
    titleAr: '',
    subtextEn: '',
    subtextAr: '',
    pinPoints: [] as Array<{
      id: string
      nameEn: string
      nameAr: string
      lat: number
      lng: number
      locationLabelEn?: string
      locationLabelAr?: string
      mediaUrl?: string
    }>
  })

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/cms/pages/b2c-landing?t=' + Date.now(), { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          const data = json?.data?.content || DEFAULT_B2C_LANDING_CONTENT
          setFullContent(data)
          if (data.qatarMap) {
            setQatarMap({
              titleEn: data.qatarMap.headlineEn || data.qatarMap.titleEn || DEFAULT_B2C_LANDING_CONTENT.qatarMap.headlineEn,
              titleAr: data.qatarMap.headlineAr || data.qatarMap.titleAr || DEFAULT_B2C_LANDING_CONTENT.qatarMap.headlineAr,
              subtextEn: data.qatarMap.subtextEn || DEFAULT_B2C_LANDING_CONTENT.qatarMap.subtextEn,
              subtextAr: data.qatarMap.subtextAr || DEFAULT_B2C_LANDING_CONTENT.qatarMap.subtextAr,
              pinPoints: data.qatarMap.venues || data.qatarMap.pinPoints || []
            })
          }
        }
      } catch (err) {
        console.error('Failed to load b2c-landing CMS data:', err)
        toast('Failed to load Qatar Map content', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePinChange = (idx: number, field: string, value: any) => {
    setQatarMap(prev => {
      const copy = [...prev.pinPoints]
      if (copy[idx]) {
        copy[idx] = { ...copy[idx], [field]: value }
      }
      return { ...prev, pinPoints: copy }
    })
  }

  const handleAddPin = () => {
    setQatarMap(prev => ({
      ...prev,
      pinPoints: [
        ...prev.pinPoints,
        {
          id: `pin-${Date.now()}`,
          nameEn: 'New Venue Location',
          nameAr: 'موقع جديد',
          lat: 25.2854,
          lng: 51.5310,
          locationLabelEn: 'Doha, Qatar',
          locationLabelAr: 'الدوحة، قطر',
          mediaUrl: ''
        }
      ]
    }))
  }

  const handleDeletePin = (idx: number) => {
    setQatarMap(prev => ({
      ...prev,
      pinPoints: prev.pinPoints.filter((_, i) => i !== idx)
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
          venues: qatarMap.pinPoints
        }
      }

      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedFullContent })
      })

      if (!res.ok) throw new Error('Failed to save Qatar Map content')

      const json = await res.json().catch(() => null)
      if (json?.data?.content) {
        setFullContent(json.data.content)
        if (json.data.content.qatarMap) {
          setQatarMap({
            titleEn: json.data.content.qatarMap.headlineEn || json.data.content.qatarMap.titleEn || '',
            titleAr: json.data.content.qatarMap.headlineAr || json.data.content.qatarMap.titleAr || '',
            subtextEn: json.data.content.qatarMap.subtextEn || '',
            subtextAr: json.data.content.qatarMap.subtextAr || '',
            pinPoints: json.data.content.qatarMap.venues || json.data.content.qatarMap.pinPoints || []
          })
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('e3_cms_b2c_landing_updated'))
        try {
          const bc = new BroadcastChannel('e3_cms_sync')
          bc.postMessage({ type: 'b2c_landing_updated', timestamp: Date.now() })
          bc.close()
        } catch (_bcErr) {}
      }

      toast('Qatar Map content manager saved successfully!', 'success')
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
        description="Manage interactive map pins, GPS coordinates, venue labels, and location media highlights across Qatar."
        breadcrumbs={[
          { label: "B2C Content", href: "/dashboard/b2c/attractions" },
          { label: "Qatar Map GIS" },
        ]}
        badge={{ label: "GIS Map", variant: "success" }}
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
              onChange={(e) => setQatarMap(prev => ({ ...prev, titleEn: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={qatarMap.titleAr}
              onChange={(e) => setQatarMap(prev => ({ ...prev, titleAr: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 placeholder:text-[var(--text-tertiary)]"
            />
          </div>
        </div>
      </div>

      {/* Map Pins Roster */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>Location Map Pins ({qatarMap.pinPoints.length})</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Manage venue locations, lat/lng coordinates, and location photos.</p>
          </div>

          <button
            onClick={handleAddPin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Map Pin</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {qatarMap.pinPoints.map((pin, idx) => (
            <div
              key={pin.id || idx}
              className="p-5 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-3">
                <span className="text-xs font-extrabold text-emerald-500 uppercase tracking-wider">
                  Pin #{idx + 1}
                </span>

                <button
                  onClick={() => handleDeletePin(idx)}
                  className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                  title="Delete Pin"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Venue Name (English)</label>
                  <input
                    type="text"
                    value={pin.nameEn || ''}
                    onChange={(e) => handlePinChange(idx, 'nameEn', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Venue Name (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={pin.nameAr || ''}
                    onChange={(e) => handlePinChange(idx, 'nameAr', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={pin.lat || 0}
                      onChange={(e) => handlePinChange(idx, 'lat', parseFloat(e.target.value))}
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={pin.lng || 0}
                      onChange={(e) => handlePinChange(idx, 'lng', parseFloat(e.target.value))}
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Location Media Photo</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pin.mediaUrl || ''}
                      onChange={(e) => handlePinChange(idx, 'mediaUrl', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 placeholder:text-[var(--text-tertiary)]"
                    />
                    <AdminMediaPicker
                      value={pin.mediaUrl || ''}
                      onChange={(url: string) => handlePinChange(idx, 'mediaUrl', url)}
                      label="Media"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardPageShell>
  )
}
