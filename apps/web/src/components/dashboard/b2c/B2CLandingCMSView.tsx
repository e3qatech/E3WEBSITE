"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, Plus, Trash2, Layers, Sparkles, MapPin, Heart, Ticket, Video, Image as ImageIcon, Users, Share2, Lightbulb, Compass, Building2, Radio } from 'lucide-react'
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
      const jsonBody = JSON.stringify({ content });
      if (jsonBody.length > 3.5 * 1024 * 1024) {
        throw new Error('Payload Too Large. One or more of your section media items contains a large embedded file. Please compress images/videos or paste direct CDN URLs.')
      }

      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonBody
      })

      if (!res.ok) {
        if (res.status === 413) {
          throw new Error('Payload Too Large (HTTP 413). Please compress uploaded media files or paste direct video URLs.')
        }
        throw new Error('Failed to save CMS configuration')
      }

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
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              B2C PAGE EDITOR
            </span>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span>Landing Page Layout & Section Editor</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage page layout, hero titles, main headlines, and section visibility. Use Content Managers for detailed item rosters.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Page Layout'}</span>
        </button>
      </div>

      {/* Quick B2C Content Managers Navigation */}
      <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-purple-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Dedicated Content Managers for Landing Page Sections</span>
          </h2>
          <span className="text-[11px] font-medium text-slate-400">Click any manager to edit item rosters directly</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          <Link
            href="/dashboard/b2c/content/ideas"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all text-center group"
          >
            <Lightbulb className="w-5 h-5 mb-1 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold truncate w-full">Ideas to Life</span>
          </Link>

          <Link
            href="/dashboard/b2c/content/story-discovery"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 transition-all text-center group"
          >
            <Compass className="w-5 h-5 mb-1 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold truncate w-full">Story Discovery</span>
          </Link>

          <Link
            href="/dashboard/b2c/content/brands"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-all text-center group"
          >
            <Building2 className="w-5 h-5 mb-1 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold truncate w-full">Our Brands</span>
          </Link>

          <Link
            href="/dashboard/b2c/content/qatar-map"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-all text-center group"
          >
            <MapPin className="w-5 h-5 mb-1 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold truncate w-full">Explore Qatar</span>
          </Link>

          <Link
            href="/dashboard/b2c/content/live-feed"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-all text-center group"
          >
            <Radio className="w-5 h-5 mb-1 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold truncate w-full">Live Feed</span>
          </Link>

          <Link
            href="/dashboard/b2c/content/media"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 transition-all text-center group"
          >
            <Video className="w-5 h-5 mb-1 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold truncate w-full">Media Manager</span>
          </Link>
        </div>
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
