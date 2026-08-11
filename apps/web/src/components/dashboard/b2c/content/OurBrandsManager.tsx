"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Plus, Trash2, Sparkles, Award } from 'lucide-react'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'

export function OurBrandsManager() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullContent, setFullContent] = useState<any>(null)
  
  const [act3Worlds, setAct3Worlds] = useState<Array<{
    id: string
    titleEn: string
    titleAr: string
    taglineEn: string
    taglineAr: string
    mediaUrl: string
    href: string
  }>>([])

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/cms/pages/b2c-landing?t=' + Date.now(), { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          const data = json?.data?.content || DEFAULT_B2C_LANDING_CONTENT
          setFullContent(data)
          if (data.act3Worlds) {
            setAct3Worlds(data.act3Worlds)
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
        titleEn: 'New Attraction Brand',
        titleAr: 'علامة تجارية جديدة',
        taglineEn: 'Immersive entertainment destination in Qatar.',
        taglineAr: 'وجهة ترفيهية تفاعلية في قطر.',
        mediaUrl: '',
        href: '/b2c/attractions'
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

      const json = await res.json().catch(() => null)
      if (json?.data?.content) {
        setFullContent(json.data.content)
        if (json.data.content.act3Worlds) {
          setAct3Worlds(json.data.content.act3Worlds)
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
      <div className="p-8 text-center text-[var(--text-secondary)] flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-cyan-500" />
        <span>Loading Our Brands Content Manager...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-[var(--text-primary)]">
      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/30">
              B2C CONTENT MANAGER
            </span>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Award className="w-6 h-6 text-cyan-500" />
              <span>Our Brands & Flagship Worlds Manager</span>
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage flagship E3 entertainment brands, cover artwork, and destination routes featured on the landing page.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer text-xs"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Our Brands'}</span>
        </button>
      </div>

      {/* Brands Cards Roster */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-cyan-500 flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span>Flagship Brand Worlds ({act3Worlds.length})</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Manage brand titles, taglines, media covers, and links.</p>
          </div>

          <button
            onClick={handleAddBrand}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {act3Worlds.map((brand, idx) => (
            <div
              key={brand.id || idx}
              className="p-5 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-3">
                <span className="text-xs font-extrabold text-cyan-500 uppercase tracking-wider">
                  Brand #{idx + 1}
                </span>

                <button
                  onClick={() => handleDeleteBrand(idx)}
                  className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                  title="Delete Brand"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Brand Name (English)</label>
                  <input
                    type="text"
                    value={brand.titleEn || ''}
                    onChange={(e) => handleBrandChange(idx, 'titleEn', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Brand Name (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={brand.titleAr || ''}
                    onChange={(e) => handleBrandChange(idx, 'titleAr', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Tagline (English)</label>
                  <input
                    type="text"
                    value={brand.taglineEn || ''}
                    onChange={(e) => handleBrandChange(idx, 'taglineEn', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Tagline (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={brand.taglineAr || ''}
                    onChange={(e) => handleBrandChange(idx, 'taglineAr', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Brand Cover Media</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={brand.mediaUrl || ''}
                      onChange={(e) => handleBrandChange(idx, 'mediaUrl', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-500 placeholder:text-[var(--text-tertiary)]"
                    />
                    <AdminMediaPicker
                      value={brand.mediaUrl || ''}
                      onChange={(url: string) => handleBrandChange(idx, 'mediaUrl', url)}
                      label="Media"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
