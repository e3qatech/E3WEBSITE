"use client"

import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'
import { ArrowDown, ArrowUp, Heart, Image as ImageIcon, Plus, Save, Sparkles, Trash2, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { resolveMediaType } from '@/lib/media-resolver'

export interface MemoryMomentItem {
  id: string | number
  titleEn: string
  titleAr: string
  captionEn: string
  captionAr: string
  tagEn?: string
  tagAr?: string
  mediaUrl: string
  mediaType?: 'IMAGE' | 'VIDEO'
}

export function EverlastingMemoriesManager() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullContent, setFullContent] = useState<any>(null)

  const [memories, setMemories] = useState({
    badgeEn: 'EVERLASTING MEMORIES — GPU PARALLAX',
    badgeAr: 'ذكريات لا تُنسى — EVERLASTING MEMORIES',
    headlineEn: 'The Moment Becomes a Memory',
    headlineAr: 'اللحظة تتحول إلى ذكرى تدوم',
    subtextEn: 'Real smiles, real reactions, and everlasting memories captured at E3 Qatar destinations.',
    subtextAr: 'ابتسامات حقيقية، مشاعر صادقة، وذكريات دائمة من زوار وجهات إي ثري.',
    moments: [] as MemoryMomentItem[]
  })

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/cms/pages/b2c-landing?t=' + Date.now(), { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          const data = json?.data?.content || DEFAULT_B2C_LANDING_CONTENT
          setFullContent(data)
          if (data.guestMemories) {
            setMemories({
              badgeEn: data.guestMemories.badgeEn || (DEFAULT_B2C_LANDING_CONTENT.guestMemories as any).badgeEn || 'EVERLASTING MEMORIES — GPU PARALLAX',
              badgeAr: data.guestMemories.badgeAr || (DEFAULT_B2C_LANDING_CONTENT.guestMemories as any).badgeAr || 'ذكريات لا تُنسى — EVERLASTING MEMORIES',
              headlineEn: data.guestMemories.headlineEn !== undefined ? data.guestMemories.headlineEn : DEFAULT_B2C_LANDING_CONTENT.guestMemories.headlineEn,
              headlineAr: data.guestMemories.headlineAr !== undefined ? data.guestMemories.headlineAr : DEFAULT_B2C_LANDING_CONTENT.guestMemories.headlineAr,
              subtextEn: data.guestMemories.subtextEn !== undefined ? data.guestMemories.subtextEn : DEFAULT_B2C_LANDING_CONTENT.guestMemories.subtextEn,
              subtextAr: data.guestMemories.subtextAr !== undefined ? data.guestMemories.subtextAr : DEFAULT_B2C_LANDING_CONTENT.guestMemories.subtextAr,
              moments: (data.guestMemories.moments && data.guestMemories.moments.length > 0)
                ? data.guestMemories.moments
                : DEFAULT_B2C_LANDING_CONTENT.guestMemories.moments
            })
          }
        }
      } catch (err) {
        console.error('Failed to load guestMemories CMS data:', err)
        toast('Failed to load Everlasting Memories content', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleMomentChange = (idx: number, field: string, value: any) => {
    setMemories(prev => {
      const copy = [...prev.moments]
      if (copy[idx]) {
        let updatedMediaProps = {}
        if (field === 'mediaUrl') {
          const detectedType = resolveMediaType({ url: value, explicitType: undefined })
          updatedMediaProps = { mediaType: detectedType }
        }
        copy[idx] = { ...copy[idx], [field]: value, ...updatedMediaProps }
      }
      return { ...prev, moments: copy }
    })
  }

  const handleAddMoment = () => {
    setMemories(prev => ({
      ...prev,
      moments: [
        ...prev.moments,
        {
          id: `m-${Date.now()}`,
          titleEn: `New Memory Moment ${prev.moments.length + 1}`,
          titleAr: `لحظة جديدة ${prev.moments.length + 1}`,
          captionEn: 'Capture the magic moment experience at E3 destination.',
          captionAr: 'تفاصيل اللحظة الساحرة في وجهات إي ثري.',
          tagEn: 'E3 GUEST MOMENT',
          tagAr: 'لحظات زوار إي ثري',
          mediaUrl: '',
          mediaType: 'IMAGE'
        }
      ]
    }))
  }

  const handleDeleteMoment = (idx: number) => {
    setMemories(prev => ({
      ...prev,
      moments: prev.moments.filter((_, i) => i !== idx)
    }))
  }

  const handleMoveMoment = (idx: number, direction: 'up' | 'down') => {
    setMemories(prev => {
      const newMoments = [...prev.moments]
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= newMoments.length) return prev
      const temp = newMoments[idx]
      newMoments[idx] = newMoments[targetIdx]
      newMoments[targetIdx] = temp
      return { ...prev, moments: newMoments }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updatedFullContent = {
        ...(fullContent || DEFAULT_B2C_LANDING_CONTENT),
        guestMemories: {
          ...memories
        }
      }

      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            content: updatedFullContent,
            published: true
          }
        })
      })

      if (!res.ok) {
        throw new Error('Failed to update page')
      }

      try {
        const bc = new BroadcastChannel('e3_cms_sync')
        bc.postMessage({ type: 'b2c_landing_updated', timestamp: Date.now() })
        bc.close()
      } catch (_e) {}

      window.dispatchEvent(new Event('e3_cms_b2c_landing_updated'))

      toast('Everlasting Memories section saved successfully!')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast(err.message || 'Error saving Everlasting Memories', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
        Loading Everlasting Memories Editor...
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-pink-500/10 text-pink-400 border border-pink-500/20 mb-2">
            <Heart className="w-3.5 h-3.5 fill-pink-500/20" />
            <span>EVERLASTING MEMORIES MANAGER</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Everlasting Memories Section Manager
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage section headlines, subtext, badges, and guest moment cards with full support for images and videos.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Section'}</span>
        </button>
      </div>

      {/* Main Section Settings */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-6 shadow-sm">
        <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-level-1)] pb-3">
          <Sparkles className="w-5 h-5 text-pink-400" />
          <span>Section Header Settings</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Top Badge (English)
            </label>
            <input
              type="text"
              value={memories.badgeEn}
              onChange={(e) => setMemories(prev => ({ ...prev, badgeEn: e.target.value }))}
              placeholder="e.g. EVERLASTING MEMORIES — GPU PARALLAX"
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Top Badge (Arabic)
            </label>
            <input
              type="text"
              dir="rtl"
              value={memories.badgeAr}
              onChange={(e) => setMemories(prev => ({ ...prev, badgeAr: e.target.value }))}
              placeholder="مثال: ذكريات لا تُنسى — EVERLASTING MEMORIES"
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Section Headline (English)
            </label>
            <input
              type="text"
              value={memories.headlineEn}
              onChange={(e) => setMemories(prev => ({ ...prev, headlineEn: e.target.value }))}
              placeholder="e.g. The Moment Becomes a Memory"
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Section Headline (Arabic)
            </label>
            <input
              type="text"
              dir="rtl"
              value={memories.headlineAr}
              onChange={(e) => setMemories(prev => ({ ...prev, headlineAr: e.target.value }))}
              placeholder="مثال: اللحظة تتحول إلى ذكرى تدوم"
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Subtext Description (English)
            </label>
            <textarea
              rows={3}
              value={memories.subtextEn}
              onChange={(e) => setMemories(prev => ({ ...prev, subtextEn: e.target.value }))}
              placeholder="Enter English section subtext..."
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Subtext Description (Arabic)
            </label>
            <textarea
              rows={3}
              dir="rtl"
              value={memories.subtextAr}
              onChange={(e) => setMemories(prev => ({ ...prev, subtextAr: e.target.value }))}
              placeholder="أدخل الوصف الفرعي بالعربية..."
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>
      </div>

      {/* Memory Moments Items Grid Manager */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] p-6 rounded-2xl space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              <span>Guest Moment Cards ({memories.moments.length})</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Add, edit, reorder, or remove cards. Media holders support both images and videos.
            </p>
          </div>

          <button
            onClick={handleAddMoment}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Moment Card</span>
          </button>
        </div>

        {memories.moments.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[var(--border-level-1)] rounded-2xl bg-[var(--bg-level-1)]">
            <Heart className="w-8 h-8 text-[var(--text-secondary)] mx-auto mb-2 opacity-50" />
            <p className="text-xs text-[var(--text-secondary)]">No moment cards created yet.</p>
            <button
              onClick={handleAddMoment}
              className="text-xs font-bold text-pink-400 hover:underline mt-2 inline-block cursor-pointer"
            >
              + Create First Moment Card
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {memories.moments.map((moment, idx) => {
              const isVideo = moment.mediaType === 'VIDEO' || (moment.mediaUrl && Boolean(moment.mediaUrl.match(/\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i)))

              return (
                <div
                  key={moment.id || idx}
                  className="p-5 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] space-y-4 relative group"
                >
                  <div className="flex items-center justify-between gap-4 border-b border-[var(--border-level-1)] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center font-mono text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">
                          {moment.titleEn || `Moment ${idx + 1}`}
                        </h4>
                        <span className="text-[10px] font-mono text-pink-400 uppercase tracking-wider flex items-center gap-1">
                          {isVideo ? <Video className="w-3 h-3 text-pink-400" /> : <ImageIcon className="w-3 h-3 text-pink-400" />}
                          <span>{isVideo ? 'Video Media' : 'Image Media'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMoveMoment(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-[var(--surface-default)] text-[var(--text-secondary)] hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveMoment(idx, 'down')}
                        disabled={idx === memories.moments.length - 1}
                        className="p-1.5 rounded-lg bg-[var(--surface-default)] text-[var(--text-secondary)] hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMoment(idx)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 cursor-pointer ml-2"
                        title="Delete Moment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Media Picker & Preview (5 cols) */}
                    <div className="lg:col-span-5 space-y-3">
                      <AdminMediaPicker
                        label={`Moment Media (Image or Video)`}
                        value={moment.mediaUrl || ''}
                        onChange={(url) => handleMomentChange(idx, 'mediaUrl', url)}
                        accept="image/*,video/*"
                      />
                    </div>

                    {/* Content Fields (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Title (English)</label>
                          <input
                            type="text"
                            value={moment.titleEn}
                            onChange={(e) => handleMomentChange(idx, 'titleEn', e.target.value)}
                            placeholder="e.g. First License Earned"
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Title (Arabic)</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={moment.titleAr}
                            onChange={(e) => handleMomentChange(idx, 'titleAr', e.target.value)}
                            placeholder="مثال: أول رخصة قيادة"
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Caption / Subtitle (English)</label>
                          <input
                            type="text"
                            value={moment.captionEn}
                            onChange={(e) => handleMomentChange(idx, 'captionEn', e.target.value)}
                            placeholder="e.g. Kids City Driving School victory moment"
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Caption / Subtitle (Arabic)</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={moment.captionAr}
                            onChange={(e) => handleMomentChange(idx, 'captionAr', e.target.value)}
                            placeholder="مثال: لحظة استلام رخصة قيادة الأطفال"
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Tag / Badge (English)</label>
                          <input
                            type="text"
                            value={moment.tagEn || 'E3 GUEST MOMENT'}
                            onChange={(e) => handleMomentChange(idx, 'tagEn', e.target.value)}
                            placeholder="e.g. E3 GUEST MOMENT"
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Tag / Badge (Arabic)</label>
                          <input
                            type="text"
                            dir="rtl"
                            value={moment.tagAr || 'لحظات زوار إي ثري'}
                            onChange={(e) => handleMomentChange(idx, 'tagAr', e.target.value)}
                            placeholder="مثال: لحظات زوار إي ثري"
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Save Floating Bar / Bottom Action */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Section...' : 'Save Everlasting Memories Section'}</span>
        </button>
      </div>
    </div>
  )
}
