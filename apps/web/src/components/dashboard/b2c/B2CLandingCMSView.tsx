"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Plus, Trash2, Layers, Sparkles, MapPin, Heart, Ticket, Video, Image as ImageIcon } from 'lucide-react'
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

      // Dispatch real-time update event for public landing pages
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
            Manage the continuous narrative experience: universal hero media, story taxonomy, Qatar venue map, and tickets.
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

      {/* Ideas to Life Spatial Blueprint Settings */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-lg font-extrabold text-sky-400 flex items-center gap-2">
          <Layers className="w-5 h-5" />
          <span>From Idea to Reality (Ideas to Life)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Headline (English)</label>
            <input
              type="text"
              value={content.act2?.headlineEn || ''}
              onChange={(e) => handleAct2Change('headlineEn', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Headline (Arabic)</label>
            <input
              type="text"
              value={content.act2?.headlineAr || ''}
              onChange={(e) => handleAct2Change('headlineAr', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Tactile Ticket Settings */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-lg font-extrabold text-emerald-400 flex items-center gap-2">
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Final Headline (Arabic)</label>
            <input
              type="text"
              value={content.act7Ticket?.headlineAr || ''}
              onChange={(e) => handleAct7Change('headlineAr', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              dir="rtl"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
