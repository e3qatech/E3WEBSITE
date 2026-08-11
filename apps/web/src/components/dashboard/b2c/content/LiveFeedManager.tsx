"use client"

import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'
import { Plus, Radio, Save, Sparkles, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function LiveFeedManager() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullContent, setFullContent] = useState<any>(null)
  
  const [liveFeed, setLiveFeed] = useState({
    titleEn: 'LIVE EVENT FEED & BROADCASTS',
    titleAr: 'البث المباشر للفعاليات والمهرجانات',
    streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4',
    isLiveNow: true,
    recentHighlights: [
      {
        id: 'hl-1',
        titleEn: 'Nocturnal Drone Parade in Lusail',
        titleAr: 'عروض طائرات الدرون المضيئة في لوسيل',
        mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4',
        dateLabelEn: 'Tonight in Doha',
        dateLabelAr: 'الليلة في الدوحة'
      }
    ] as Array<{
      id: string
      titleEn: string
      titleAr: string
      mediaUrl: string
      dateLabelEn?: string
      dateLabelAr?: string
    }>
  })

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/cms/pages/b2c-landing')
        if (res.ok) {
          const json = await res.json()
          const data = json?.data?.content || DEFAULT_B2C_LANDING_CONTENT
          setFullContent(data)
          if (data.liveFeed) {
            setLiveFeed(prev => ({
              ...prev,
              titleEn: data.liveFeed.titleEn || prev.titleEn,
              titleAr: data.liveFeed.titleAr || prev.titleAr,
              streamUrl: data.liveFeed.streamUrl || prev.streamUrl,
              isLiveNow: data.liveFeed.isLiveNow ?? prev.isLiveNow,
              recentHighlights: data.liveFeed.recentHighlights || prev.recentHighlights
            }))
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
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleHighlightChange = (idx: number, field: string, value: any) => {
    setLiveFeed(prev => {
      const copy = [...prev.recentHighlights]
      if (copy[idx]) {
        copy[idx] = { ...copy[idx], [field]: value }
      }
      return { ...prev, recentHighlights: copy }
    })
  }

  const handleAddHighlight = () => {
    setLiveFeed(prev => ({
      ...prev,
      recentHighlights: [
        ...prev.recentHighlights,
        {
          id: `highlight-${Date.now()}`,
          titleEn: 'Live Concert & Festival Highlights',
          titleAr: 'عروض حية ومهرجانات موسيقية',
          mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4',
          dateLabelEn: 'Tonight in Doha',
          dateLabelAr: 'الليلة في الدوحة'
        }
      ]
    }))
  }

  const handleDeleteHighlight = (idx: number) => {
    setLiveFeed(prev => ({
      ...prev,
      recentHighlights: prev.recentHighlights.filter((_, i) => i !== idx)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updatedFullContent = {
        ...(fullContent || DEFAULT_B2C_LANDING_CONTENT),
        liveFeed
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
      <div className="p-8 text-center text-[var(--text-secondary)] flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-rose-500" />
        <span>Loading Live Feed Content Manager...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-[var(--text-primary)]">
      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
              B2C CONTENT MANAGER
            </span>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Radio className="w-6 h-6 text-rose-500" />
              <span>Live Broadcast & Stream Feed Manager</span>
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage live broadcast streams, ON-AIR status flags, and video highlights featured on the landing page.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer text-xs"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Live Feed'}</span>
        </button>
      </div>

      {/* Main Broadcast Control */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-rose-500 flex items-center gap-2">
            <Radio className="w-5 h-5" />
            <span>Live Stream & Status Control</span>
          </h2>

          <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer">
            <input
              type="checkbox"
              checked={liveFeed.isLiveNow}
              onChange={(e) => setLiveFeed(prev => ({ ...prev, isLiveNow: e.target.checked }))}
              className="rounded accent-rose-500"
            />
            <span className={liveFeed.isLiveNow ? "text-rose-500 font-extrabold" : "text-[var(--text-secondary)]"}>
              {liveFeed.isLiveNow ? "● LIVE ON-AIR NOW" : "OFFLINE / STANDBY"}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Headline (English)</label>
            <input
              type="text"
              value={liveFeed.titleEn}
              onChange={(e) => setLiveFeed(prev => ({ ...prev, titleEn: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Headline (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={liveFeed.titleAr}
              onChange={(e) => setLiveFeed(prev => ({ ...prev, titleAr: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Live Stream Video URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={liveFeed.streamUrl || ''}
                onChange={(e) => setLiveFeed(prev => ({ ...prev, streamUrl: e.target.value }))}
                placeholder="https://assets.mixkit.co/..."
                className="flex-1 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-rose-500 placeholder:text-[var(--text-tertiary)]"
              />
              <AdminMediaPicker
                value={liveFeed.streamUrl || ''}
                onChange={(url: string) => setLiveFeed(prev => ({ ...prev, streamUrl: url }))}
                label="Stream Video"
                accept="video/*"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Highlights Roster */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-rose-500 flex items-center gap-2">
              <Radio className="w-5 h-5" />
              <span>Video Highlights ({liveFeed.recentHighlights.length})</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Manage featured video clip highlights shown alongside the stream.</p>
          </div>

          <button
            onClick={handleAddHighlight}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Video Clip</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveFeed.recentHighlights.map((hl, idx) => (
            <div
              key={hl.id || idx}
              className="p-5 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-3">
                <span className="text-xs font-extrabold text-rose-500 uppercase tracking-wider">
                  Highlight #{idx + 1}
                </span>

                <button
                  onClick={() => handleDeleteHighlight(idx)}
                  className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                  title="Delete Highlight"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title (English)</label>
                  <input
                    type="text"
                    value={hl.titleEn || ''}
                    onChange={(e) => handleHighlightChange(idx, 'titleEn', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={hl.titleAr || ''}
                    onChange={(e) => handleHighlightChange(idx, 'titleAr', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Clip Media URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={hl.mediaUrl || ''}
                      onChange={(e) => handleHighlightChange(idx, 'mediaUrl', e.target.value)}
                      placeholder="https://assets.mixkit.co/..."
                      className="flex-1 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-rose-500 placeholder:text-[var(--text-tertiary)]"
                    />
                    <AdminMediaPicker
                      value={hl.mediaUrl || ''}
                      onChange={(url: string) => handleHighlightChange(idx, 'mediaUrl', url)}
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
