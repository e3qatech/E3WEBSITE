"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Plus, Trash2, Sparkles, Compass, Target, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'

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
        const res = await fetch('/api/cms/pages/b2c-landing')
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
          mediaUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop',
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

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('e3_cms_b2c_landing_updated'))
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
      <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-purple-400" />
        <span>Loading Story Discovery Content Manager...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-white">
      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              B2C CONTENT MANAGER
            </span>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-purple-400" />
              <span>Story Discovery Content Manager</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage interactive visitor intent paths (Drive, Bounce, Compete, Celebrate, etc.), category filters, and story choice covers.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Story Discovery'}</span>
        </button>
      </div>

      {/* Title & Section Config */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md">
        <h2 className="text-lg font-bold text-purple-400 flex items-center gap-2">
          <Target className="w-5 h-5" />
          <span>Selector Title & Question</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title Question (English)</label>
            <input
              type="text"
              value={intentSelector.titleEn}
              onChange={(e) => setIntentSelector(prev => ({ ...prev, titleEn: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              placeholder="What Kind of Story Do You Want Today?"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title Question (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={intentSelector.titleAr}
              onChange={(e) => setIntentSelector(prev => ({ ...prev, titleAr: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              placeholder="أي نوع من الحكايات تريد أن تعيشها اليوم؟"
            />
          </div>
        </div>
      </div>

      {/* Intent Options Grid */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-purple-400 flex items-center gap-2">
              <Compass className="w-5 h-5" />
              <span>Interactive Story Options ({intentSelector.options.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Each option provides a quick filter trigger for guests looking for specific experience categories.
            </p>
          </div>

          <button
            onClick={handleAddOption}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Story Option</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {intentSelector.options.map((opt, idx) => (
            <div key={opt.id || idx} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-4 relative">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>Option #{idx + 1} ({opt.category})</span>
                </span>

                <button
                  onClick={() => handleDeleteOption(idx)}
                  className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                  title="Delete Option"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Label (English)</label>
                  <input
                    type="text"
                    value={opt.labelEn}
                    onChange={(e) => handleOptionChange(idx, 'labelEn', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="Drive"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Label (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={opt.labelAr}
                    onChange={(e) => handleOptionChange(idx, 'labelAr', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="قيادة"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Category Tag</label>
                <select
                  value={opt.category}
                  onChange={(e) => handleOptionChange(idx, 'category', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="kids">Kids (الأطفال)</option>
                  <option value="active">Active & Bounce (الأنشطة والقفز)</option>
                  <option value="arena">Tactical Arena (التحديات والمنافسات)</option>
                  <option value="discovery">Discovery & Culture (الاستكشاف)</option>
                  <option value="events">Live Events & Festivals (الفعاليات الحية)</option>
                  <option value="family">Family Time (العائلة)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-purple-400" />
                  <span>Thumbnail Cover Image</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={opt.mediaUrl || ''}
                    onChange={(e) => handleOptionChange(idx, 'mediaUrl', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="https://..."
                  />
                  <AdminMediaPicker
                    value={opt.mediaUrl || ''}
                    onChange={(url: string) => handleOptionChange(idx, 'mediaUrl', url)}
                    label="Cover Image"
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
