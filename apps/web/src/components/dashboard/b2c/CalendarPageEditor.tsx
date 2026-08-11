"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Sparkles, Calendar, Globe, Search } from 'lucide-react'
import { useToast } from '@/components/dashboard/ui/ToastProvider'

export function CalendarPageEditor() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [pageConfig, setPageConfig] = useState({
    titleEn: 'LIVE EVENTS & CALENDAR',
    titleAr: 'جدول الفعاليات والعروض الحية',
    descEn: 'Discover drone parades, live music festivals, and international shows across Qatar.',
    descAr: 'اكتشف عروض الدرون المضيئة والمهرجانات الموسيقية والعروض العالمية في الدوحة.',
    seoTitle: 'Events & Calendar | E3 Qatar',
    seoDescription: 'Live event calendar, tickets, and scheduled entertainment shows.'
  })

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/cms/pages/b2c-calendar-page')
        if (res.ok) {
          const json = await res.json()
          if (json?.data?.content) {
            setPageConfig(prev => ({ ...prev, ...json.data.content }))
          }
        }
      } catch (_e) {
        // Fallback default
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/cms/pages/b2c-calendar-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: pageConfig })
      })
      if (!res.ok) throw new Error('Failed to save Calendar Page settings')
      toast('Events & Calendar Page Editor saved successfully!', 'success')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast(err?.message || 'Error saving page settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 animate-spin text-purple-400" />
        <span>Loading Calendar Page Editor...</span>
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
              B2C PAGE EDITOR
            </span>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-400" />
              <span>Events & Calendar Page Editor</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage page layout, titles, banner text, and SEO metadata for the public Events Calendar (`/b2c/calendar`).
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Page Settings'}</span>
        </button>
      </div>

      {/* Hero Header Controls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md">
        <h2 className="text-lg font-bold text-purple-400 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          <span>Page Hero Titles & Intro</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Page Title (English)</label>
            <input
              type="text"
              value={pageConfig.titleEn}
              onChange={(e) => setPageConfig(prev => ({ ...prev, titleEn: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Page Title (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={pageConfig.titleAr}
              onChange={(e) => setPageConfig(prev => ({ ...prev, titleAr: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subtext / Intro (English)</label>
            <textarea
              rows={2}
              value={pageConfig.descEn}
              onChange={(e) => setPageConfig(prev => ({ ...prev, descEn: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subtext / Intro (Arabic)</label>
            <textarea
              rows={2}
              dir="rtl"
              value={pageConfig.descAr}
              onChange={(e) => setPageConfig(prev => ({ ...prev, descAr: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md">
        <h2 className="text-lg font-bold text-purple-400 flex items-center gap-2">
          <Search className="w-5 h-5" />
          <span>SEO Metadata</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Meta Title Tag</label>
            <input
              type="text"
              value={pageConfig.seoTitle}
              onChange={(e) => setPageConfig(prev => ({ ...prev, seoTitle: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Meta Description</label>
            <textarea
              rows={2}
              value={pageConfig.seoDescription}
              onChange={(e) => setPageConfig(prev => ({ ...prev, seoDescription: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
