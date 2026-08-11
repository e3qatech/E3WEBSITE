"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Plus, Trash2, Sparkles, Building2, MapPin, DollarSign, Clock, ShieldCheck } from 'lucide-react'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'

export function OurBrandsManager() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullContent, setFullContent] = useState<any>(null)
  
  const [act3Worlds, setAct3Worlds] = useState<Array<any>>([])

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/cms/pages/b2c-landing')
        if (res.ok) {
          const json = await res.json()
          const data = json?.data?.content || DEFAULT_B2C_LANDING_CONTENT
          setFullContent(data)
          if (data.act3Worlds) {
            setAct3Worlds(data.act3Worlds || DEFAULT_B2C_LANDING_CONTENT.act3Worlds)
          }
        }
      } catch (err) {
        console.error('Failed to load b2c-landing CMS data:', err)
        toast('Failed to load Our Brands content', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleBrandChange = (idx: number, field: string, value: any) => {
    setAct3Worlds(prev => {
      const copy = [...prev]
      if (copy[idx]) {
        copy[idx] = { ...copy[idx], [field]: value }
      }
      return copy
    })
  }

  const handleAddBrand = () => {
    setAct3Worlds(prev => [
      ...prev,
      {
        id: `brand-${Date.now()}`,
        slug: `brand-${Date.now()}`,
        nameEn: 'New Attraction World',
        nameAr: 'وجهة ترفيهية جديدة',
        taglineEn: 'Immersive entertainment world powered by E3',
        taglineAr: 'عالم ترفيهي غامر من إي ثري',
        locationEn: 'Doha, Qatar',
        locationAr: 'الدوحة، قطر',
        audienceEn: 'All Ages',
        audienceAr: 'جميع الأعمار',
        statusEn: 'Open Now',
        statusAr: 'مفتوح الآن',
        timingsEn: '10:00 AM - 10:00 PM',
        timingsAr: '١٠:٠٠ ص - ١٠:٠٠ م',
        price: 75,
        currency: 'QAR',
        ctaEn: 'Explore World',
        ctaAr: 'استكشف الوجهة',
        accentColor: '#38bdf8',
        materialType: 'ROAD_MARKING',
        mediaUrl: 'https://images.unsplash.com/photo-1566454825481-4e48f80aa4d7?q=80&w=1200&auto=format&fit=crop'
      }
    ])
  }

  const handleDeleteBrand = (idx: number) => {
    setAct3Worlds(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updatedFullContent = {
        ...(fullContent || DEFAULT_B2C_LANDING_CONTENT),
        act3Worlds
      }

      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedFullContent })
      })

      if (!res.ok) throw new Error('Failed to save Our Brands content')

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('e3_cms_b2c_landing_updated'))
      }

      toast('Our Brands content manager saved successfully!', 'success')
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
        <Sparkles className="w-5 h-5 animate-spin text-cyan-400" />
        <span>Loading Our Brands Content Manager...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 text-white">
      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              B2C CONTENT MANAGER
            </span>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-cyan-400" />
              <span>Our Brands & Flagship Worlds Manager</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage E3 flagship attraction worlds (Kids City, InflataPark, Urban Arena, Live Festivals), locations, pricing, status badges, and hero media.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddBrand}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand World</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Our Brands'}</span>
          </button>
        </div>
      </div>

      {/* Brands Roster Grid */}
      <div className="space-y-6">
        {act3Worlds.map((brand, idx) => (
          <div key={brand.id || idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: brand.accentColor || '#38bdf8' }} />
                <h3 className="text-base font-bold text-white">
                  {brand.nameEn || `Brand World #${idx + 1}`}
                </h3>
                <span className="text-xs font-medium text-slate-400">({brand.slug})</span>
              </div>

              <button
                onClick={() => handleDeleteBrand(idx)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg border border-rose-500/20 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove World</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Name (English)</label>
                <input
                  type="text"
                  value={brand.nameEn || ''}
                  onChange={(e) => handleBrandChange(idx, 'nameEn', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Kids City Driving School"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Name (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={brand.nameAr || ''}
                  onChange={(e) => handleBrandChange(idx, 'nameAr', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="مدينة قيادة الأطفال"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline (English)</label>
                <input
                  type="text"
                  value={brand.taglineEn || ''}
                  onChange={(e) => handleBrandChange(idx, 'taglineEn', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Take the wheel in Qatar's premier miniature traffic city"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={brand.taglineAr || ''}
                  onChange={(e) => handleBrandChange(idx, 'taglineAr', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="تولَّ القيادة في مدينة المرور المصغرة الأولى بقطر"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>Location (EN)</span>
                </label>
                <input
                  type="text"
                  value={brand.locationEn || ''}
                  onChange={(e) => handleBrandChange(idx, 'locationEn', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Doha Festival City"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>Timings (EN)</span>
                </label>
                <input
                  type="text"
                  value={brand.timingsEn || ''}
                  onChange={(e) => handleBrandChange(idx, 'timingsEn', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="10:00 AM - 10:00 PM"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-cyan-400" />
                  <span>Ticket Price ({brand.currency || 'QAR'})</span>
                </label>
                <input
                  type="number"
                  value={brand.price || 0}
                  onChange={(e) => handleBrandChange(idx, 'price', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span>Status Badge (EN)</span>
                </label>
                <input
                  type="text"
                  value={brand.statusEn || ''}
                  onChange={(e) => handleBrandChange(idx, 'statusEn', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Open Now / Filling Fast"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Cover Media URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={brand.mediaUrl || ''}
                  onChange={(e) => handleBrandChange(idx, 'mediaUrl', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="https://images.unsplash.com/..."
                />
                <AdminMediaPicker
                  value={brand.mediaUrl || ''}
                  onChange={(url: string) => handleBrandChange(idx, 'mediaUrl', url)}
                  label="Brand Cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
