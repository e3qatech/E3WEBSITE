"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Plus, Trash2, Layers, Sparkles, MapPin, Heart, Ticket, Video, Image as ImageIcon, Users, Share2 } from 'lucide-react'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'

export function B2CLandingCMSView({ initialData }: { initialData: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const [content, setContent] = useState(() => ({
    ...DEFAULT_B2C_LANDING_CONTENT,
    ...(initialData || {})
  }))

  const handleHeroChange = (field: string, val: any) => {
    setContent((prev: any) => ({
      ...prev,
      hero: { ...prev.hero, [field]: val }
    }))
  }

  const handleAct1Change = (field: string, val: any) => {
    setContent((prev: any) => ({
      ...prev,
      act1: { ...prev.act1, [field]: val }
    }))
  }

  const handleAct2Change = (field: string, val: any) => {
    setContent((prev: any) => ({
      ...prev,
      act2: { ...prev.act2, [field]: val }
    }))
  }

  const handleSectionHeadingChange = (section: string, field: string, val: any) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: val
      }
    }))
  }

  const handleWorldMediaChange = (idx: number, url: string) => {
    setContent((prev: any) => {
      const copy = [...(prev.act3Worlds || [])]
      if (copy[idx]) {
        copy[idx] = { ...copy[idx], mediaUrl: url }
      }
      return { ...prev, act3Worlds: copy }
    })
  }

  const handleStoryOptionMediaChange = (idx: number, url: string) => {
    setContent((prev: any) => {
      const optionsCopy = [...(prev.intentSelector?.options || [])]
      if (optionsCopy[idx]) {
        optionsCopy[idx] = { ...optionsCopy[idx], mediaUrl: url }
      }
      return {
        ...prev,
        intentSelector: {
          ...(prev.intentSelector || {}),
          options: optionsCopy
        }
      }
    })
  }

  const handleGuestMomentMediaChange = (idx: number, url: string) => {
    setContent((prev: any) => {
      const momentsCopy = [...(prev.guestMemories?.moments || [])]
      if (momentsCopy[idx]) {
        momentsCopy[idx] = { ...momentsCopy[idx], mediaUrl: url }
      }
      return {
        ...prev,
        guestMemories: {
          ...(prev.guestMemories || {}),
          moments: momentsCopy
        }
      }
    })
  }

  const handleAct7Change = (field: string, val: any) => {
    setContent((prev: any) => ({
      ...prev,
      act7Ticket: { ...prev.act7Ticket, [field]: val }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!res.ok) throw new Error('Failed to save CMS configuration')

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('e3_cms_b2c_landing_updated'))
      }

      toast('B2C Landing Story saved successfully!', 'success')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast(err?.message || 'Error saving CMS configuration', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 text-white">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span>B2C Story Landing CMS Editor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage Our Brands, Core Team, Social Feeds, Media Covers, and Digital Tickets in real-time.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Story Configuration'}</span>
        </button>
      </div>

      {/* Universal Hero Media Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-lg font-extrabold text-purple-400 flex items-center gap-2">
          <Video className="w-5 h-5" />
          <span>Universal Hero Media Settings</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-400">Hero Media Type</label>
            <select
              value={content.hero?.mediaType || 'VIDEO'}
              onChange={(e) => handleHeroChange('mediaType', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="VIDEO">Autoplay Muted Video</option>
              <option value="IMAGE">Static Premium Image</option>
              <option value="IFRAME">Allowlisted Embedded Iframe / WebGL</option>
              <option value="MODEL_3D">3D Model (GLB/GLTF)</option>
            </select>

            <label className="block text-xs font-semibold text-slate-400">Hero Desktop Cover / Video URL</label>
            <AdminMediaPicker
              value={content.hero?.mediaUrl}
              onChange={(url) => handleHeroChange('mediaUrl', url)}
              label=""
              accept="video/*,image/*"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Seeded Heading (English)</label>
              <input
                type="text"
                value={content.act1?.headlineEn || ''}
                onChange={(e) => handleAct1Change('headlineEn', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Seeded Heading (Arabic)</label>
              <input
                type="text"
                value={content.act1?.headlineAr || ''}
                onChange={(e) => handleAct1Change('headlineAr', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                dir="rtl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Our Brands Section Settings */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-lg font-extrabold text-purple-400 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span>Worlds Created by E3 (Our Brands) Section</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Section Headline (English)</label>
            <input
              type="text"
              value={content.ourBrands?.headlineEn || ''}
              onChange={(e) => handleSectionHeadingChange('ourBrands', 'headlineEn', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Section Headline (Arabic)</label>
            <input
              type="text"
              value={content.ourBrands?.headlineAr || ''}
              onChange={(e) => handleSectionHeadingChange('ourBrands', 'headlineAr', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Core Team Section Settings */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-lg font-extrabold text-sky-400 flex items-center gap-2">
          <Users className="w-5 h-5" />
          <span>The People Behind the Experience (Core Team) Section</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Section Headline (English)</label>
            <input
              type="text"
              value={content.coreTeam?.headlineEn || ''}
              onChange={(e) => handleSectionHeadingChange('coreTeam', 'headlineEn', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Section Headline (Arabic)</label>
            <input
              type="text"
              value={content.coreTeam?.headlineAr || ''}
              onChange={(e) => handleSectionHeadingChange('coreTeam', 'headlineAr', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Social Feed Section Settings */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-lg font-extrabold text-pink-400 flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          <span>E3 Happening Now (Social Feed) Section</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Section Headline (English)</label>
            <input
              type="text"
              value={content.socialFeed?.headlineEn || ''}
              onChange={(e) => handleSectionHeadingChange('socialFeed', 'headlineEn', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Section Headline (Arabic)</label>
            <input
              type="text"
              value={content.socialFeed?.headlineAr || ''}
              onChange={(e) => handleSectionHeadingChange('socialFeed', 'headlineAr', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Featured Attraction Worlds Media Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <h2 className="text-lg font-extrabold text-emerald-400 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          <span>Attraction Worlds Media & Covers</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(content.act3Worlds || []).map((world: any, idx: number) => (
            <div key={world.id || idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-emerald-400 block">{world.nameEn} ({world.nameAr})</span>
              <AdminMediaPicker
                value={world.mediaUrl}
                onChange={(url) => handleWorldMediaChange(idx, url)}
                label="World Media Cover"
                accept="video/*,image/*"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tactile Ticket Settings */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-lg font-extrabold text-amber-400 flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          <span>Tactile Digital Ticket & Booking Settings</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Final Headline (English)</label>
            <input
              type="text"
              value={content.act7Ticket?.headlineEn || ''}
              onChange={(e) => handleAct7Change('headlineEn', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Final Headline (Arabic)</label>
            <input
              type="text"
              value={content.act7Ticket?.headlineAr || ''}
              onChange={(e) => handleAct7Change('headlineAr', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              dir="rtl"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
