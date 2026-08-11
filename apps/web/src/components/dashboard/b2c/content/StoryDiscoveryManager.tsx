"use client"

import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'
import { Compass, Plus, Save, Sparkles, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function StoryDiscoveryManager() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullContent, setFullContent] = useState<any>(null)
  
  const [intentSelector, setIntentSelector] = useState({
    titleEn: '',
    titleAr: '',
    options: [] as Array<{
      id: string
      labelEn: string
      labelAr: string
      category: string
      mediaUrl: string
      ctaUrl?: string
    }>
  })

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/cms/pages/b2c-landing?t=' + Date.now(), { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          const data = json?.data?.content || DEFAULT_B2C_LANDING_CONTENT
          setFullContent(data)
          if (data.intentSelector) {
            setIntentSelector({
              titleEn: data.intentSelector.titleEn || DEFAULT_B2C_LANDING_CONTENT.intentSelector.titleEn,
              titleAr: data.intentSelector.titleAr || DEFAULT_B2C_LANDING_CONTENT.intentSelector.titleAr,
              options: data.intentSelector.options || DEFAULT_B2C_LANDING_CONTENT.intentSelector.options
            })
          }
        }
      } catch (err) {
        console.error('Failed to load b2c-landing CMS data:', err)
        toast('Failed to load Story Discovery content', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleOptionChange = (idx: number, field: string, value: any) => {
    setIntentSelector(prev => {
      const optionsCopy = [...prev.options]
      if (optionsCopy[idx]) {
        optionsCopy[idx] = { ...optionsCopy[idx], [field]: value }
      }
      return { ...prev, options: optionsCopy }
    })
  }

  const handleAddOption = () => {
    setIntentSelector(prev => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: `story-${Date.now()}`,
          labelEn: 'New Story Path',
          labelAr: 'مسار جديد',
          category: 'discovery',
          mediaUrl: '',
          ctaUrl: '/b2c/attractions'
        }
      ]
    }))
  }

  const handleDeleteOption = (idx: number) => {
    setIntentSelector(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updatedFullContent = {
        ...(fullContent || DEFAULT_B2C_LANDING_CONTENT),
        intentSelector
      }

      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedFullContent })
      })

      if (!res.ok) throw new Error('Failed to save Story Discovery content')

      const json = await res.json().catch(() => null)
      if (json?.data?.content) {
        setFullContent(json.data.content)
        if (json.data.content.intentSelector) {
          setIntentSelector({
            titleEn: json.data.content.intentSelector.titleEn || '',
            titleAr: json.data.content.intentSelector.titleAr || '',
            options: json.data.content.intentSelector.options || []
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

      toast('Story Discovery content manager saved successfully!', 'success')
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
        <Sparkles className="w-5 h-5 animate-spin text-purple-500" />
        <span>Loading Story Discovery Content Manager...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-[var(--text-primary)]">
      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/30">
              B2C CONTENT MANAGER
            </span>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Compass className="w-6 h-6 text-purple-500" />
              <span>Story Discovery Content Manager</span>
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage interactive guest story selection cards, mood categories, and destination media links.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer text-xs"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Story Discovery'}</span>
        </button>
      </div>

      {/* Section Header */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-purple-500 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span>Section Title & Prompt</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title Prompt (English)</label>
            <input
              type="text"
              value={intentSelector.titleEn}
              onChange={(e) => setIntentSelector(prev => ({ ...prev, titleEn: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Title Prompt (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={intentSelector.titleAr}
              onChange={(e) => setIntentSelector(prev => ({ ...prev, titleAr: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 placeholder:text-[var(--text-tertiary)]"
            />
          </div>
        </div>
      </div>

      {/* Options Cards Roster */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-purple-500 flex items-center gap-2">
              <Compass className="w-5 h-5" />
              <span>Discovery Story Paths ({intentSelector.options.length})</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Manage individual story cards presented in the interactive selector.</p>
          </div>

          <button
            onClick={handleAddOption}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Story Card</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {intentSelector.options.map((opt, idx) => (
            <div
              key={opt.id || idx}
              className="p-5 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-3">
                <span className="text-xs font-extrabold text-purple-500 uppercase tracking-wider">
                  Card #{idx + 1}
                </span>

                <button
                  onClick={() => handleDeleteOption(idx)}
                  className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                  title="Delete Card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Card Label (English)</label>
                  <input
                    type="text"
                    value={opt.labelEn || ''}
                    onChange={(e) => handleOptionChange(idx, 'labelEn', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Card Label (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={opt.labelAr || ''}
                    onChange={(e) => handleOptionChange(idx, 'labelAr', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Target Route / CTA Link</label>
                  <input
                    type="text"
                    value={opt.ctaUrl || ''}
                    onChange={(e) => handleOptionChange(idx, 'ctaUrl', e.target.value)}
                    placeholder="/b2c/attractions"
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Background Media</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={opt.mediaUrl || ''}
                      onChange={(e) => handleOptionChange(idx, 'mediaUrl', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 placeholder:text-[var(--text-tertiary)]"
                    />
                    <AdminMediaPicker
                      value={opt.mediaUrl || ''}
                      onChange={(url: string) => handleOptionChange(idx, 'mediaUrl', url)}
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
