"use client"

import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'
import { Compass, Plus, Save, Sparkles, Trash2, Edit2, Check, X } from 'lucide-react'
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
  })

  const [storyTypes, setStoryTypes] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const [pageRes, typesRes] = await Promise.all([
          fetch('/api/cms/pages/b2c-landing?t=' + Date.now(), { cache: 'no-store' }),
          fetch('/api/b2c/story-types?t=' + Date.now(), { cache: 'no-store' })
        ])
        
        if (pageRes.ok) {
          const json = await pageRes.json()
          const data = json?.data?.content || DEFAULT_B2C_LANDING_CONTENT
          setFullContent(data)
          if (data.intentSelector) {
            setIntentSelector({
              titleEn: data.intentSelector.titleEn || DEFAULT_B2C_LANDING_CONTENT.intentSelector.titleEn,
              titleAr: data.intentSelector.titleAr || DEFAULT_B2C_LANDING_CONTENT.intentSelector.titleAr,
            })
          }
        }
        
        if (typesRes.ok) {
          const typesData = await typesRes.json()
          setStoryTypes(Array.isArray(typesData) ? typesData : [])
        }
      } catch (err) {
        console.error('Failed to load b2c-landing CMS data:', err)
        toast('Failed to load Story Discovery content', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAddStoryType = () => {
    setStoryTypes(prev => [
      ...prev,
      {
        isNew: true,
        slug: `story-${Date.now()}`,
        titleEn: 'New Story Type',
        titleAr: 'مسار جديد',
        icon: '',
        coverMediaUrl: '',
        accentColor: '#8b5cf6',
        isActive: true,
        orderIndex: prev.length
      }
    ])
  }

  const handleStoryTypeChange = (idx: number, field: string, value: any) => {
    setStoryTypes(prev => {
      const copy = [...prev]
      if (copy[idx]) {
        copy[idx] = { ...copy[idx], [field]: value }
      }
      return copy
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // 1. Save Landing Page Title (intentSelector title)
      const updatedFullContent = {
        ...(fullContent || DEFAULT_B2C_LANDING_CONTENT),
        intentSelector: {
          ...((fullContent || DEFAULT_B2C_LANDING_CONTENT).intentSelector || {}),
          titleEn: intentSelector.titleEn,
          titleAr: intentSelector.titleAr,
          options: undefined // Remove old manual options
        }
      }

      await fetch('/api/cms/pages/b2c-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedFullContent })
      })

      // 2. Save Story Types
      for (const st of storyTypes) {
        const url = '/api/b2c/story-types'
        const method = st.id && !st.isNew ? 'PUT' : 'POST'
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(st)
        })
      }

      // Re-fetch story types to get real IDs
      const typesRes = await fetch('/api/b2c/story-types?t=' + Date.now(), { cache: 'no-store' })
      if (typesRes.ok) {
        const typesData = await typesRes.json()
        setStoryTypes(Array.isArray(typesData) ? typesData : [])
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
            Manage interactive guest story selection categories and classifications.
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

      {/* Story Types Roster */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-purple-500 flex items-center gap-2">
              <Compass className="w-5 h-5" />
              <span>Story Classifications ({storyTypes.length})</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Manage the categories used to classify What&apos;s Inside activities.</p>
          </div>

          <button
            onClick={handleAddStoryType}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Story Type</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {storyTypes.map((opt, idx) => (
            <div
              key={opt.id || opt.slug || idx}
              className="p-5 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] space-y-4 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: opt.accentColor || '#8b5cf6' }}></div>
              <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-3 pl-4">
                <span className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                  {opt.titleEn || `Type #${idx + 1}`}
                  {opt._count?.features !== undefined && (
                    <span className="px-1.5 py-0.5 bg-[var(--surface-subtle)] rounded-md text-[9px]">{opt._count.features} Activities Assigned</span>
                  )}
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input type="checkbox" checked={opt.isActive} onChange={(e) => handleStoryTypeChange(idx, 'isActive', e.target.checked)} className="rounded border-gray-300" />
                  <span>Active on Frontend</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Title (English)</label>
                  <input
                    type="text"
                    value={opt.titleEn || ''}
                    onChange={(e) => handleStoryTypeChange(idx, 'titleEn', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Title (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={opt.titleAr || ''}
                    onChange={(e) => handleStoryTypeChange(idx, 'titleAr', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Short Description (Optional)</label>
                  <input
                    type="text"
                    value={opt.descriptionEn || ''}
                    onChange={(e) => handleStoryTypeChange(idx, 'descriptionEn', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Unique Slug ID</label>
                    <input
                      type="text"
                      value={opt.slug || ''}
                      onChange={(e) => handleStoryTypeChange(idx, 'slug', e.target.value)}
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Accent HEX</label>
                    <input
                      type="text"
                      value={opt.accentColor || ''}
                      onChange={(e) => handleStoryTypeChange(idx, 'accentColor', e.target.value)}
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Custom Cover Media (Optional - fallbacks to first activity)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={opt.coverMediaUrl || ''}
                      onChange={(e) => handleStoryTypeChange(idx, 'coverMediaUrl', e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 placeholder:text-[var(--text-tertiary)]"
                    />
                    <AdminMediaPicker
                      value={opt.coverMediaUrl || ''}
                      onChange={(url: string) => handleStoryTypeChange(idx, 'coverMediaUrl', url)}
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
