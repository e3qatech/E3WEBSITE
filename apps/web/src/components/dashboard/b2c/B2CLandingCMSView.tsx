"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, Sparkles, Image as ImageIcon, Video, Eye, EyeOff, Plus, Trash2, Layers, Lightbulb, Compass, Award, MapPin, Radio, Film } from 'lucide-react'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'
import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker'
import { UniversalMediaSectionEditor, DEFAULT_UNIVERSAL_MEDIA, UniversalMediaConfig } from '@/components/dashboard/ui/UniversalMediaSectionEditor'

interface B2CLandingCMSViewProps {
  initialData?: any
}

export function B2CLandingCMSView({ initialData }: B2CLandingCMSViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState<any>(initialData || DEFAULT_B2C_LANDING_CONTENT)

  const fetchLatestData = async () => {
    try {
      const res = await fetch('/api/cms/pages/b2c-landing?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.content) {
          setContent(json.data.content);
        }
      }
    } catch (_e) {}
  };

  useEffect(() => {
    if (initialData) {
      setContent(initialData);
    }
    fetchLatestData();
    window.addEventListener('e3_cms_b2c_landing_updated', fetchLatestData);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('e3_cms_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'b2c_landing_updated') {
          fetchLatestData();
        }
      };
    } catch (_e) {}

    return () => {
      window.removeEventListener('e3_cms_b2c_landing_updated', fetchLatestData);
      if (bc) bc.close();
    };
  }, [initialData]);

  const handleAct1Change = (field: string, val: any) => {
    setContent((prev: any) => ({
      ...prev,
      act1Hero: { ...prev.act1Hero, [field]: val }
    }))
  }

  const handleAct2Change = (field: string, val: any) => {
    setContent((prev: any) => ({
      ...prev,
      act2Curtain: { ...prev.act2Curtain, [field]: val }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const heroMedia = content.heroMedia || {}
      const act1Hero = content.act1Hero || {}
      
      const mediaUrlResolved = (heroMedia.mediaUrl || act1Hero.mediaUrl || act1Hero.desktopVideoUrl || '').trim()
      const mediaTypeResolved = heroMedia.mediaType || (mediaUrlResolved && /\.(jpeg|jpg|png|webp|gif|svg)$/i.test(mediaUrlResolved) ? 'IMAGE' : 'IMAGE')
      
      const updatedContent = {
        ...content,
        heroMedia: {
          ...heroMedia,
          mediaUrl: mediaUrlResolved,
          mediaType: mediaTypeResolved,
        },
        hero: {
          ...(content.hero || {}),
          ...heroMedia,
          ...act1Hero,
          headerEn: act1Hero.titleEn || content.hero?.headerEn,
          headerAr: act1Hero.titleAr || content.hero?.headerAr,
          subHeaderEn: act1Hero.subtextEn || content.hero?.subHeaderEn,
          subHeaderAr: act1Hero.subtextAr || content.hero?.subHeaderAr,
          mediaUrl: mediaUrlResolved,
          mediaType: mediaTypeResolved,
          posterUrl: (heroMedia.posterUrl || '').trim(),
        },
        act1Hero: {
          ...act1Hero,
          ...heroMedia,
          titleEn: act1Hero.titleEn || content.hero?.headerEn,
          titleAr: act1Hero.titleAr || content.hero?.headerAr,
          subtextEn: act1Hero.subtextEn || content.hero?.subHeaderEn,
          subtextAr: act1Hero.subtextAr || content.hero?.subHeaderAr,
          mediaUrl: mediaUrlResolved,
          desktopVideoUrl: mediaUrlResolved,
          mediaType: mediaTypeResolved,
        },
      }

      const jsonBody = JSON.stringify({ content: updatedContent })
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
        try {
          const bc = new BroadcastChannel('e3_cms_sync')
          bc.postMessage({ type: 'b2c_landing_updated', timestamp: Date.now() })
          bc.close()
        } catch (_bcErr) {}
      }

      await fetchLatestData()
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
    <div className="p-6 max-w-6xl mx-auto space-y-8 text-[var(--text-primary)]">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[var(--surface-selected)] text-[var(--color-primary)] border border-[var(--color-primary)]/30">
              B2C PAGE EDITOR
            </span>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[var(--color-primary)]" />
              <span>Landing Page Layout & Section Editor</span>
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage page layout, hero titles, main headlines, and section visibility. Use Content Managers for detailed item rosters.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-extrabold transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Page Layout'}</span>
        </button>
      </div>

      {/* Quick B2C Content Managers Navigation */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--color-primary)]" />
            <span>Dedicated Content Managers for Landing Page Sections</span>
          </h2>
          <span className="text-[11px] font-medium text-[var(--text-tertiary)]">Click any manager to edit item rosters directly</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          <Link
            href="/dashboard/b2c/content/ideas"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 transition-all text-center group"
          >
            <Lightbulb className="w-5 h-5 mb-1 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Ideas to Life</span>
          </Link>

          <Link
            href="/dashboard/b2c/content/story-discovery"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-500 transition-all text-center group"
          >
            <Compass className="w-5 h-5 mb-1 text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Story Discovery</span>
          </Link>

          <Link
            href="/dashboard/b2c/content/brands"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-500 transition-all text-center group"
          >
            <Award className="w-5 h-5 mb-1 text-cyan-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Our Brands</span>
          </Link>

          <Link
            href="/dashboard/b2c/content/qatar-map"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 transition-all text-center group"
          >
            <MapPin className="w-5 h-5 mb-1 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Explore Qatar</span>
          </Link>

          <Link
            href="/dashboard/b2c/content/live-feed"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 transition-all text-center group"
          >
            <Radio className="w-5 h-5 mb-1 text-rose-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Live Feed</span>
          </Link>

          <Link
            href="/dashboard/b2c/content/media"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-500 transition-all text-center group"
          >
            <Film className="w-5 h-5 mb-1 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Media Manager</span>
          </Link>
        </div>
      </div>

      {/* Single Unified Hero Media Editor */}
      <UniversalMediaSectionEditor
        title="Landing Hero Media & Cover Settings"
        subtitle="Single unified hero media editor supporting Image, Video, 3D GLB Models, Embed IFrames, and Poster Fallbacks."
        value={content.heroMedia || { mediaType: content.hero?.mediaType || 'IMAGE', mediaUrl: content.hero?.mediaUrl || content.act1Hero?.desktopVideoUrl }}
        onChange={(heroMedia: UniversalMediaConfig) => setContent((prev: any) => ({
          ...prev,
          heroMedia,
          hero: {
            ...(prev.hero || {}),
            mediaUrl: heroMedia.mediaUrl,
            mediaType: heroMedia.mediaType,
            posterUrl: heroMedia.fallbackImage || heroMedia.posterUrl,
          },
          act1Hero: {
            ...(prev.act1Hero || {}),
            mediaUrl: heroMedia.mediaUrl,
            desktopVideoUrl: heroMedia.mediaUrl,
            mediaType: heroMedia.mediaType,
            posterUrl: heroMedia.fallbackImage || heroMedia.posterUrl,
          }
        }))}
        accentColor="purple"
      />

      {/* Act 1: Hero Headlines */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
          <span>Act 1: Hero Title & Headlines</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Headline Text (English)</label>
            <input
              type="text"
              value={content.act1Hero?.titleEn || content.hero?.headerEn || ''}
              onChange={(e) => handleAct1Change('titleEn', e.target.value)}
              placeholder="e.g. Some days pass. Others become stories."
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Headline Text (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={content.act1Hero?.titleAr || content.hero?.headerAr || ''}
              onChange={(e) => handleAct1Change('titleAr', e.target.value)}
              placeholder="مثال: أيام تمرّ… وأيام تتحول إلى حكايات."
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Subtext Description (English)</label>
            <textarea
              rows={3}
              value={content.act1Hero?.subtextEn || content.hero?.subHeaderEn || ''}
              onChange={(e) => handleAct1Change('subtextEn', e.target.value)}
              placeholder="Enter hero subtitle description..."
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Subtext Description (Arabic)</label>
            <textarea
              rows={3}
              dir="rtl"
              value={content.act1Hero?.subtextAr || content.hero?.subHeaderAr || ''}
              onChange={(e) => handleAct1Change('subtextAr', e.target.value)}
              placeholder="أدخل الوصف الفرعي للهيرو..."
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Act 2: Brand Manifesto */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
          <span>Act 2: Brand Manifesto & Subtext</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Manifesto Headline (English)</label>
            <input
              type="text"
              value={content.act2Curtain?.headingEn || ''}
              onChange={(e) => handleAct2Change('headingEn', e.target.value)}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Manifesto Headline (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={content.act2Curtain?.headingAr || ''}
              onChange={(e) => handleAct2Change('headingAr', e.target.value)}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Universal Footer Media Section */}
      <UniversalMediaSectionEditor
        title="Landing Footer Banner Media Settings"
        subtitle="Universal footer banner media supporting Image, Video, 3D Canvas, IFrame, and Mobile Fallbacks."
        value={content.footerMedia || { mediaType: 'IMAGE', mediaUrl: '' }}
        onChange={(footerMedia: UniversalMediaConfig) => setContent((prev: any) => ({ ...prev, footerMedia }))}
        accentColor="indigo"
      />
    </div>
  )
}
