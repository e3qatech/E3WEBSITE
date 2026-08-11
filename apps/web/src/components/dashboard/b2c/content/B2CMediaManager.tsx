"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Sparkles, Video, Play, Sliders } from 'lucide-react'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { UniversalMediaSectionEditor, DEFAULT_UNIVERSAL_MEDIA, UniversalMediaConfig } from '@/components/dashboard/ui/UniversalMediaSectionEditor'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'

export function B2CMediaManager() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullContent, setFullContent] = useState<any>(null)
  
  const [heroMedia, setHeroMedia] = useState<UniversalMediaConfig>({
    ...DEFAULT_UNIVERSAL_MEDIA,
    mediaType: 'IMAGE',
    mediaUrl: '',
    fallbackImage: ''
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
        const res = await fetch('/api/cms/pages/b2c-landing?t=' + Date.now(), { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          const data = json?.data?.content || DEFAULT_B2C_LANDING_CONTENT
          setFullContent(data)
          setHeroMedia({
            ...DEFAULT_UNIVERSAL_MEDIA,
            ...(data.heroMedia || data.hero || {})
          })
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
      const mediaUrlResolved = (heroMedia.mediaUrl || '').trim()
      const mediaTypeResolved = heroMedia.mediaType || (mediaUrlResolved && /\.(jpeg|jpg|png|webp|gif|svg)$/i.test(mediaUrlResolved) ? 'IMAGE' : 'IMAGE')

      const updatedFullContent = {
        ...(fullContent || DEFAULT_B2C_LANDING_CONTENT),
        heroMedia: {
          ...heroMedia,
          mediaUrl: mediaUrlResolved,
          mediaType: mediaTypeResolved,
        },
        hero: {
          ...(fullContent?.hero || DEFAULT_B2C_LANDING_CONTENT.hero),
          ...heroMedia,
          mediaUrl: mediaUrlResolved,
          mediaType: mediaTypeResolved,
        },
        act1Hero: {
          ...(fullContent?.act1Hero || {}),
          ...heroMedia,
          mediaUrl: mediaUrlResolved,
          desktopVideoUrl: mediaUrlResolved,
          mediaType: mediaTypeResolved,
        },
        maskedVideo
      }

      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedFullContent })
      })

      if (!res.ok) throw new Error('Failed to save B2C Media settings')

      const json = await res.json().catch(() => null)
      if (json?.data?.content) {
        setFullContent(json.data.content)
        if (json.data.content.heroMedia) {
          setHeroMedia({
            ...DEFAULT_UNIVERSAL_MEDIA,
            ...json.data.content.heroMedia
          })
        }
        if (json.data.content.maskedVideo) {
          setMaskedVideo({
            ...DEFAULT_B2C_LANDING_CONTENT.maskedVideo,
            ...json.data.content.maskedVideo
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
      <div className="p-8 text-center text-[var(--text-secondary)] flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-blue-500" />
        <span>Loading B2C Media Manager...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 text-[var(--text-primary)]">
      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/30">
              B2C CONTENT MANAGER
            </span>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Video className="w-6 h-6 text-blue-500" />
              <span>B2C Media Manager</span>
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage background video feeds, organic window masked video parameters, edge softness, hero media assets, and CDN links.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer text-xs"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Media Settings'}</span>
        </button>
      </div>

      {/* Hero Media Section */}
      <UniversalMediaSectionEditor
        title="Landing Hero Media & Cover Settings"
        subtitle="Universal hero media configuration supporting Image, Video, 3D Canvas, IFrame, and Fallback Images. Kept in 100% lockstep with B2C Landing Layout Editor."
        value={heroMedia}
        onChange={(updated: UniversalMediaConfig) => setHeroMedia(updated)}
        accentColor="blue"
      />

      {/* Masked Organic Window Controls */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-blue-500 flex items-center gap-2">
            <Sliders className="w-5 h-5" />
            <span>Organic Window Masked Video Controls</span>
          </h2>

          <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer">
            <input
              type="checkbox"
              checked={maskedVideo.enabled}
              onChange={(e) => setMaskedVideo(prev => ({ ...prev, enabled: e.target.checked }))}
              className="rounded accent-blue-500"
            />
            <span>Enable Organic Window Video</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Mask Shape Preset</label>
            <select
              value={maskedVideo.preset}
              onChange={(e) => setMaskedVideo(prev => ({ ...prev, preset: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
            >
              <option value="ORGANIC_WINDOW">Organic Window Arch</option>
              <option value="PILL_CAPSULE">Pill Capsule</option>
              <option value="MODERN_HEXAGON">Modern Hexagon</option>
              <option value="CIRCLE">Circular Focal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Mask Scale ({maskedVideo.scale}x)</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.05"
              value={maskedVideo.scale}
              onChange={(e) => setMaskedVideo(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
              className="w-full accent-blue-500 mt-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Edge Feathering / Softness ({maskedVideo.edgeSoftness}px)</label>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={maskedVideo.edgeSoftness}
              onChange={(e) => setMaskedVideo(prev => ({ ...prev, edgeSoftness: parseInt(e.target.value) }))}
              className="w-full accent-blue-500 mt-2"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
