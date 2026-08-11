"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Sparkles, Video, Image as ImageIcon, Sliders, Play, Layers } from 'lucide-react'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'

export function B2CMediaManager() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullContent, setFullContent] = useState<any>(null)
  
  const [heroMedia, setHeroMedia] = useState({
    mediaType: 'VIDEO',
    mediaUrl: '',
    posterUrl: ''
  })

  const [maskedVideo, setMaskedVideo] = useState({
    enabled: true,
    preset: 'ORGANIC_WINDOW',
    scale: 1,
    positionX: 0,
    positionY: 0,
    edgeSoftness: 12,
    idleBreathe: true,
    customerDesktopVideo: '',
    customerPoster: '',
    customerAccent: '#10b981',
    organizerDesktopVideo: '',
    organizerPoster: '',
    organizerAccent: '#3b82f6'
  })

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/cms/pages/b2c-landing')
        if (res.ok) {
          const json = await res.json()
          const data = json?.data?.content || DEFAULT_B2C_LANDING_CONTENT
          setFullContent(data)
          if (data.hero) {
            setHeroMedia({
              mediaType: data.hero.mediaType || 'VIDEO',
              mediaUrl: data.hero.mediaUrl || DEFAULT_B2C_LANDING_CONTENT.hero.mediaUrl,
              posterUrl: data.hero.posterUrl || DEFAULT_B2C_LANDING_CONTENT.hero.posterUrl
            })
          }
          if (data.maskedVideo) {
            setMaskedVideo({
              ...DEFAULT_B2C_LANDING_CONTENT.maskedVideo,
              ...data.maskedVideo
            })
          }
        }
      } catch (err) {
        console.error('Failed to load b2c-landing CMS data:', err)
        toast('Failed to load Media Manager content', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updatedFullContent = {
        ...(fullContent || DEFAULT_B2C_LANDING_CONTENT),
        hero: {
          ...(fullContent?.hero || DEFAULT_B2C_LANDING_CONTENT.hero),
          ...heroMedia
        },
        maskedVideo
      }

      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedFullContent })
      })

      if (!res.ok) throw new Error('Failed to save B2C Media settings')

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('e3_cms_b2c_landing_updated'))
      }

      toast('B2C Media Manager saved successfully!', 'success')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast(err?.message || 'Error saving media settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-blue-400" />
        <span>Loading B2C Media Manager...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 text-white">
      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              B2C CONTENT MANAGER
            </span>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Video className="w-6 h-6 text-blue-400" />
              <span>B2C Media Manager</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage background video feeds, organic window masked video parameters, edge softness, hero media assets, and CDN links.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Media Settings'}</span>
        </button>
      </div>

      {/* Hero Media Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md">
        <h2 className="text-lg font-bold text-blue-400 flex items-center gap-2">
          <Play className="w-5 h-5" />
          <span>Hero Background Video & Poster</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Media Type</label>
            <select
              value={heroMedia.mediaType}
              onChange={(e) => setHeroMedia(prev => ({ ...prev, mediaType: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="VIDEO">Video Loop (.mp4)</option>
              <option value="IMAGE">Static High-Res Image</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Poster Preview Image URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={heroMedia.posterUrl || ''}
                onChange={(e) => setHeroMedia(prev => ({ ...prev, posterUrl: e.target.value }))}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                placeholder="https://..."
              />
              <AdminMediaPicker
                value={heroMedia.posterUrl || ''}
                onChange={(url: string) => setHeroMedia(prev => ({ ...prev, posterUrl: url }))}
                label="Poster Image"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Background Media URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={heroMedia.mediaUrl || ''}
              onChange={(e) => setHeroMedia(prev => ({ ...prev, mediaUrl: e.target.value }))}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              placeholder="https://assets.mixkit.co/..."
            />
            <AdminMediaPicker
              value={heroMedia.mediaUrl || ''}
              onChange={(url: string) => setHeroMedia(prev => ({ ...prev, mediaUrl: url }))}
              label="Hero Media"
            />
          </div>
        </div>
      </div>

      {/* Organic Masked Video Settings */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md">
        <h2 className="text-lg font-bold text-blue-400 flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          <span>Organic Masked Video Window Parameters</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mask Shape Preset</label>
            <select
              value={maskedVideo.preset}
              onChange={(e) => setMaskedVideo(prev => ({ ...prev, preset: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ORGANIC_WINDOW">Organic Fluid Window</option>
              <option value="PORTAL_ARCH">Architectural Portal Arch</option>
              <option value="KINETIC_DOME">Kinetic Dome Sphere</option>
              <option value="HEXAGON_GRID">Hexagonal Cyber Grid</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Edge Softness Blur ({maskedVideo.edgeSoftness}px)</label>
            <input
              type="range"
              min="0"
              max="40"
              value={maskedVideo.edgeSoftness}
              onChange={(e) => setMaskedVideo(prev => ({ ...prev, edgeSoftness: Number(e.target.value) }))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Idle Breathing Animation</label>
            <button
              onClick={() => setMaskedVideo(prev => ({ ...prev, idleBreathe: !prev.idleBreathe }))}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                maskedVideo.idleBreathe
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              {maskedVideo.idleBreathe ? 'Enabled (Smooth Motion)' : 'Disabled (Static)'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Portal Video URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={maskedVideo.customerDesktopVideo || ''}
                onChange={(e) => setMaskedVideo(prev => ({ ...prev, customerDesktopVideo: e.target.value }))}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                placeholder="https://..."
              />
              <AdminMediaPicker
                value={maskedVideo.customerDesktopVideo || ''}
                onChange={(url: string) => setMaskedVideo(prev => ({ ...prev, customerDesktopVideo: url }))}
                label="Customer Video"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Organizer/B2B Portal Video URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={maskedVideo.organizerDesktopVideo || ''}
                onChange={(e) => setMaskedVideo(prev => ({ ...prev, organizerDesktopVideo: e.target.value }))}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                placeholder="https://..."
              />
              <AdminMediaPicker
                value={maskedVideo.organizerDesktopVideo || ''}
                onChange={(url: string) => setMaskedVideo(prev => ({ ...prev, organizerDesktopVideo: url }))}
                label="Organizer Video"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
