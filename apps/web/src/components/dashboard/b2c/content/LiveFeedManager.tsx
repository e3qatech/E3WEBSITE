"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Plus, Trash2, Sparkles, Video, Camera, Heart, Radio, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'

export function LiveFeedManager() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullContent, setFullContent] = useState<any>(null)
  
  const [guestMemories, setGuestMemories] = useState({
    headlineEn: '',
    headlineAr: '',
    subtextEn: '',
    subtextAr: '',
    moments: [] as Array<any>
  })

  const [streamConfig, setStreamConfig] = useState({
    streamMediaUrl: '',
    streamPosterUrl: '',
    streamBadgeEn: '',
    streamBadgeAr: '',
    streamTitleEn: '',
    streamTitleAr: '',
    streamSubtitleEn: '',
    streamSubtitleAr: '',
    streamButtonUrl: ''
  })

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/cms/pages/b2c-landing')
        if (res.ok) {
          const json = await res.json()
          const data = json?.data?.content || DEFAULT_B2C_LANDING_CONTENT
          setFullContent(data)
          if (data.guestMemories) {
            setGuestMemories({
              headlineEn: data.guestMemories.headlineEn || DEFAULT_B2C_LANDING_CONTENT.guestMemories.headlineEn,
              headlineAr: data.guestMemories.headlineAr || DEFAULT_B2C_LANDING_CONTENT.guestMemories.headlineAr,
              subtextEn: data.guestMemories.subtextEn || DEFAULT_B2C_LANDING_CONTENT.guestMemories.subtextEn,
              subtextAr: data.guestMemories.subtextAr || DEFAULT_B2C_LANDING_CONTENT.guestMemories.subtextAr,
              moments: data.guestMemories.moments || DEFAULT_B2C_LANDING_CONTENT.guestMemories.moments
            })
          }

          if (data.hero) {
            setStreamConfig({
              streamMediaUrl: data.hero.streamMediaUrl || DEFAULT_B2C_LANDING_CONTENT.hero.streamMediaUrl,
              streamPosterUrl: data.hero.streamPosterUrl || DEFAULT_B2C_LANDING_CONTENT.hero.streamPosterUrl,
              streamBadgeEn: data.hero.streamBadgeEn || DEFAULT_B2C_LANDING_CONTENT.hero.streamBadgeEn,
              streamBadgeAr: data.hero.streamBadgeAr || DEFAULT_B2C_LANDING_CONTENT.hero.streamBadgeAr,
              streamTitleEn: data.hero.streamTitleEn || DEFAULT_B2C_LANDING_CONTENT.hero.streamTitleEn,
              streamTitleAr: data.hero.streamTitleAr || DEFAULT_B2C_LANDING_CONTENT.hero.streamTitleAr,
              streamSubtitleEn: data.hero.streamSubtitleEn || DEFAULT_B2C_LANDING_CONTENT.hero.streamSubtitleEn,
              streamSubtitleAr: data.hero.streamSubtitleAr || DEFAULT_B2C_LANDING_CONTENT.hero.streamSubtitleAr,
              streamButtonUrl: data.hero.streamButtonUrl || DEFAULT_B2C_LANDING_CONTENT.hero.streamButtonUrl
            })
          }
        }
      } catch (err) {
        console.error('Failed to load b2c-landing CMS data:', err)
        toast('Failed to load Live Feed content', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleMomentChange = (idx: number, field: string, value: any) => {
    setGuestMemories(prev => {
      const momentsCopy = [...prev.moments]
      if (momentsCopy[idx]) {
        momentsCopy[idx] = { ...momentsCopy[idx], [field]: value }
      }
      return { ...prev, moments: momentsCopy }
    })
  }

  const handleAddMoment = () => {
    setGuestMemories(prev => ({
      ...prev,
      moments: [
        ...prev.moments,
        {
          id: `moment-${Date.now()}`,
          titleEn: 'New Guest Moment',
          titleAr: 'لحظة زائر جديدة',
          captionEn: 'Real reactions from E3 attractions',
          captionAr: 'مشاعر حقيقية من زوار إي ثري',
          mediaUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop'
        }
      ]
    }))
  }

  const handleDeleteMoment = (idx: number) => {
    setGuestMemories(prev => ({
      ...prev,
      moments: prev.moments.filter((_, i) => i !== idx)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updatedFullContent = {
        ...(fullContent || DEFAULT_B2C_LANDING_CONTENT),
        guestMemories,
        hero: {
          ...(fullContent?.hero || DEFAULT_B2C_LANDING_CONTENT.hero),
          ...streamConfig
        }
      }

      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedFullContent })
      })

      if (!res.ok) throw new Error('Failed to save Live Feed content')

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('e3_cms_b2c_landing_updated'))
      }

      toast('Live Feed content manager saved successfully!', 'success')
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
        <Sparkles className="w-5 h-5 animate-spin text-rose-400" />
        <span>Loading Live Feed Content Manager...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 text-white">
      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              B2C CONTENT MANAGER
            </span>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Radio className="w-6 h-6 text-rose-400" />
              <span>Live Feed & Guest Moments Manager</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage real-time guest memory photos, live event feeds, and live stream video badges across the B2C experience.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Live Feed'}</span>
        </button>
      </div>

      {/* Live Stream Broadcast Widget Config */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md">
        <h2 className="text-lg font-bold text-rose-400 flex items-center gap-2">
          <Video className="w-5 h-5" />
          <span>Live Stream Video Badge Settings</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Live Badge Label (EN)</label>
            <input
              type="text"
              value={streamConfig.streamBadgeEn}
              onChange={(e) => setStreamConfig(prev => ({ ...prev, streamBadgeEn: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              placeholder="LIVE STREAM"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Live Badge Label (AR)</label>
            <input
              type="text"
              dir="rtl"
              value={streamConfig.streamBadgeAr}
              onChange={(e) => setStreamConfig(prev => ({ ...prev, streamBadgeAr: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              placeholder="مباشر الآن"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Stream Title (EN)</label>
            <input
              type="text"
              value={streamConfig.streamTitleEn}
              onChange={(e) => setStreamConfig(prev => ({ ...prev, streamTitleEn: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              placeholder="E3 KINETIC EXPERIENCE"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Stream Title (AR)</label>
            <input
              type="text"
              dir="rtl"
              value={streamConfig.streamTitleAr}
              onChange={(e) => setStreamConfig(prev => ({ ...prev, streamTitleAr: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              placeholder="عالم إي ثري الترفيهي"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Live Video Stream Direct URL (.mp4 / stream)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={streamConfig.streamMediaUrl || ''}
              onChange={(e) => setStreamConfig(prev => ({ ...prev, streamMediaUrl: e.target.value }))}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              placeholder="https://assets.mixkit.co/videos/preview/..."
            />
            <AdminMediaPicker
              value={streamConfig.streamMediaUrl || ''}
              onChange={(url: string) => setStreamConfig(prev => ({ ...prev, streamMediaUrl: url }))}
              label="Stream Video"
            />
          </div>
        </div>
      </div>

      {/* Guest Moments Roster */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              <span>Guest Moments & Photo Feed ({guestMemories.moments.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add real guest memory snapshots, captions, and experience moments.
            </p>
          </div>

          <button
            onClick={handleAddMoment}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Moment</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guestMemories.moments.map((moment, idx) => (
            <div key={moment.id || idx} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-4 relative">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                  <span>Moment #{idx + 1}</span>
                </span>

                <button
                  onClick={() => handleDeleteMoment(idx)}
                  className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                  title="Remove Moment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Title (English)</label>
                  <input
                    type="text"
                    value={moment.titleEn || ''}
                    onChange={(e) => handleMomentChange(idx, 'titleEn', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    placeholder="First License Earned"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Title (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={moment.titleAr || ''}
                    onChange={(e) => handleMomentChange(idx, 'titleAr', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    placeholder="أول رخصة قيادة"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-rose-400" />
                  <span>Photo / Media URL</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={moment.mediaUrl || ''}
                    onChange={(e) => handleMomentChange(idx, 'mediaUrl', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    placeholder="https://..."
                  />
                  <AdminMediaPicker
                    value={moment.mediaUrl || ''}
                    onChange={(url: string) => handleMomentChange(idx, 'mediaUrl', url)}
                    label="Moment Photo"
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
