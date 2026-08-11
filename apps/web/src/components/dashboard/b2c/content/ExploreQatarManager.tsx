"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Plus, Trash2, Sparkles, MapPin, Navigation, Clock, Layers } from 'lucide-react'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'

export function ExploreQatarManager() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullContent, setFullContent] = useState<any>(null)
  
  const [qatarMap, setQatarMap] = useState({
    headlineEn: '',
    headlineAr: '',
    subtextEn: '',
    subtextAr: '',
    venues: [] as Array<any>
  })

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/cms/pages/b2c-landing')
        if (res.ok) {
          const json = await res.json()
          const data = json?.data?.content || DEFAULT_B2C_LANDING_CONTENT
          setFullContent(data)
          if (data.qatarMap) {
            setQatarMap({
              headlineEn: data.qatarMap.headlineEn || DEFAULT_B2C_LANDING_CONTENT.qatarMap.headlineEn,
              headlineAr: data.qatarMap.headlineAr || DEFAULT_B2C_LANDING_CONTENT.qatarMap.headlineAr,
              subtextEn: data.qatarMap.subtextEn || DEFAULT_B2C_LANDING_CONTENT.qatarMap.subtextEn,
              subtextAr: data.qatarMap.subtextAr || DEFAULT_B2C_LANDING_CONTENT.qatarMap.subtextAr,
              venues: data.qatarMap.venues || DEFAULT_B2C_LANDING_CONTENT.qatarMap.venues
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
  }, [])

  const handleVenueChange = (idx: number, field: string, value: any) => {
    setQatarMap(prev => {
      const venuesCopy = [...prev.venues]
      if (venuesCopy[idx]) {
        venuesCopy[idx] = { ...venuesCopy[idx], [field]: value }
      }
      return { ...prev, venues: venuesCopy }
    })
  }

  const handleAddVenue = () => {
    setQatarMap(prev => ({
      ...prev,
      venues: [
        ...prev.venues,
        {
          id: `venue-${Date.now()}`,
          nameEn: 'New Venue Ground',
          nameAr: 'موقع فعاليات جديد',
          areaEn: 'Central Doha',
          areaAr: 'وسط الدوحة',
          experiencesEn: 'Interactive Entertainment Arena',
          experiencesAr: 'ساحة ترفيه تفاعلية',
          hoursEn: '10:00 AM - 10:00 PM',
          hoursAr: '١٠:٠٠ ص - ١٠:٠٠ م',
          statusEn: 'Open Now',
          statusAr: 'مفتوح الآن',
          lat: 25.2854,
          lng: 51.5310,
          directionsUrl: 'https://maps.google.com/?q=Doha'
        }
      ]
    }))
  }

  const handleDeleteVenue = (idx: number) => {
    setQatarMap(prev => ({
      ...prev,
      venues: prev.venues.filter((_, i) => i !== idx)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updatedFullContent = {
        ...(fullContent || DEFAULT_B2C_LANDING_CONTENT),
        qatarMap
      }

      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedFullContent })
      })

      if (!res.ok) throw new Error('Failed to save Qatar Map content')

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('e3_cms_b2c_landing_updated'))
      }

      toast('Explore E3 Across Qatar saved successfully!', 'success')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast(err?.message || 'Error saving content', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-emerald-400" />
        <span>Loading Qatar Map Content Manager...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 text-white">
      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              B2C CONTENT MANAGER
            </span>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-emerald-400" />
              <span>Explore E3 Across Qatar Content Manager</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage interactive Qatar map pin locations, venue experience details, GPS coordinates, and directions URLs across Doha.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Qatar Venues'}</span>
        </button>
      </div>

      {/* Headline & Description */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md">
        <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          <span>Section Headline & Subtext</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Headline (English)</label>
            <input
              type="text"
              value={qatarMap.headlineEn}
              onChange={(e) => setQatarMap(prev => ({ ...prev, headlineEn: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="A Journey Across Qatar"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Headline (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={qatarMap.headlineAr}
              onChange={(e) => setQatarMap(prev => ({ ...prev, headlineAr: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="رحلة عبر أنحاء قطر"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subtext (English)</label>
            <textarea
              rows={2}
              value={qatarMap.subtextEn}
              onChange={(e) => setQatarMap(prev => ({ ...prev, subtextEn: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="Discover E3's permanent attraction worlds and temporary event arenas across Doha."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subtext (Arabic)</label>
            <textarea
              rows={2}
              dir="rtl"
              value={qatarMap.subtextAr}
              onChange={(e) => setQatarMap(prev => ({ ...prev, subtextAr: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="استكشف وجهات إي ثري الترفيهية وصالات الفعاليات في كافة مناطق الدوحة."
            />
          </div>
        </div>
      </div>

      {/* Venues Pins Manager */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>Map Venues & Pin Locations ({qatarMap.venues.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add venue coordinates, area titles, and maps links displayed on the interactive Qatar map.
            </p>
          </div>

          <button
            onClick={handleAddVenue}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Map Venue</span>
          </button>
        </div>

        <div className="space-y-4">
          {qatarMap.venues.map((venue, idx) => (
            <div key={venue.id || idx} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-4 relative">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Venue #{idx + 1}: {venue.nameEn || 'Untitled Venue'}</span>
                </span>

                <button
                  onClick={() => handleDeleteVenue(idx)}
                  className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                  title="Remove Venue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Venue Name (English)</label>
                  <input
                    type="text"
                    value={venue.nameEn || ''}
                    onChange={(e) => handleVenueChange(idx, 'nameEn', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Doha Festival City Arena"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Venue Name (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={venue.nameAr || ''}
                    onChange={(e) => handleVenueChange(idx, 'nameAr', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="ساحة دوحة فستيفال سيتي"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Featured Experiences (EN)</label>
                  <input
                    type="text"
                    value={venue.experiencesEn || ''}
                    onChange={(e) => handleVenueChange(idx, 'experiencesEn', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Kids City Driving School & Snow Dunes"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Featured Experiences (AR)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={venue.experiencesAr || ''}
                    onChange={(e) => handleVenueChange(idx, 'experiencesAr', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="مدينة قيادة الأطفال وتلال الثلج"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Area / District (EN)</label>
                  <input
                    type="text"
                    value={venue.areaEn || ''}
                    onChange={(e) => handleVenueChange(idx, 'areaEn', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="North Doha"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">GPS Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={venue.lat || 0}
                    onChange={(e) => handleVenueChange(idx, 'lat', parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">GPS Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={venue.lng || 0}
                    onChange={(e) => handleVenueChange(idx, 'lng', parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Directions Link URL</label>
                  <input
                    type="text"
                    value={venue.directionsUrl || ''}
                    onChange={(e) => handleVenueChange(idx, 'directionsUrl', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
