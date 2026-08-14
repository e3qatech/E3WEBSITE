"use client"

import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { DEFAULT_UNIVERSAL_MEDIA, UniversalMediaConfig, UniversalMediaSectionEditor } from '@/components/dashboard/ui/UniversalMediaSectionEditor'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'
import { Save, Sliders, Sparkles, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardLoadingState,
} from '@/components/dashboard/ui'
import { resolveMediaType } from '@/lib/media-resolver'

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
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const mediaUrlResolved = (heroMedia.mediaUrl || '').trim();
      const mediaTypeResolved = resolveMediaType({ url: mediaUrlResolved, explicitType: heroMedia.mediaType });

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
    return <DashboardLoadingState title="Loading B2C Media Manager..." type="skeleton" />
  }

  return (
    <DashboardPageShell variant="wide">
      {/* Top Action Header */}
      <DashboardPageHeader
        title="B2C Media Manager"
        description="Manage background video feeds, organic window masked video parameters, edge softness, hero media assets, and CDN links."
        breadcrumbs={[
          { label: "B2C Content", href: "/dashboard/b2c/attractions" },
          { label: "B2C Media Manager" },
        ]}
        badge={{ label: "B2C Media", variant: "cyan" }}
        primaryAction={{
          label: saving ? 'Saving Changes...' : 'Save Media Settings',
          onClick: handleSave,
          isLoading: saving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

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
    </DashboardPageShell>
  )
}
