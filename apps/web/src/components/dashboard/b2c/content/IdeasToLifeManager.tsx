"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Plus, Trash2, Sparkles, ArrowUp, ArrowDown, Lightbulb } from 'lucide-react'
import { useToast } from '@/components/dashboard/ui/ToastProvider'
import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker'
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages'

export function IdeasToLifeManager() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullContent, setFullContent] = useState<any>(null)
  
  const [act2, setAct2] = useState({
    headlineEn: '',
    headlineAr: '',
    steps: [] as Array<{ id: number | string; titleEn: string; titleAr: string; descEn: string; descAr: string; mediaUrl?: string }>
  })

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/cms/pages/b2c-landing')
        if (res.ok) {
          const json = await res.json()
          const data = json?.data?.content || DEFAULT_B2C_LANDING_CONTENT
          setFullContent(data)
          if (data.act2) {
            setAct2({
              headlineEn: data.act2.headlineEn || DEFAULT_B2C_LANDING_CONTENT.act2.headlineEn,
              headlineAr: data.act2.headlineAr || DEFAULT_B2C_LANDING_CONTENT.act2.headlineAr,
              steps: data.act2.steps || DEFAULT_B2C_LANDING_CONTENT.act2.steps
            })
          }
        }
      } catch (err) {
        console.error('Failed to load b2c-landing CMS data:', err)
        toast('Failed to load Ideas to Life content', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleStepChange = (idx: number, field: string, value: any) => {
    setAct2(prev => {
      const copy = [...prev.steps]
      if (copy[idx]) {
        copy[idx] = { ...copy[idx], [field]: value }
      }
      return { ...prev, steps: copy }
    })
  }

  const handleAddStep = () => {
    setAct2(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          id: Date.now(),
          titleEn: `${prev.steps.length + 1}. New Step`,
          titleAr: `Step ${prev.steps.length + 1}`,
          descEn: 'Describe how this stage brings the idea to life.',
          descAr: 'وصف المرحلة العملية في تحويل الفكرة إلى واقع.',
          mediaUrl: ''
        }
      ]
    }))
  }

  const handleDeleteStep = (idx: number) => {
    setAct2(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== idx)
    }))
  }

  const handleMoveStep = (idx: number, direction: 'up' | 'down') => {
    setAct2(prev => {
      const newSteps = [...prev.steps]
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= newSteps.length) return prev
      const temp = newSteps[idx]
      newSteps[idx] = newSteps[targetIdx]
      newSteps[targetIdx] = temp
      return { ...prev, steps: newSteps }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updatedFullContent = {
        ...(fullContent || DEFAULT_B2C_LANDING_CONTENT),
        act2
      }

      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedFullContent })
      })

      if (!res.ok) throw new Error('Failed to save Ideas to Life content')

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('e3_cms_b2c_landing_updated'))
      }

      toast('Ideas to Life content manager saved successfully!', 'success')
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
        <Sparkles className="w-5 h-5 animate-spin text-amber-500" />
        <span>Loading Ideas to Life Content Manager...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-[var(--text-primary)]">
      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
              B2C CONTENT MANAGER
            </span>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              <span>Ideas to Life Content Manager</span>
            </h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Manage the step-by-step creative blueprint process, headline messaging, and visual stages shown on the B2C Landing Page.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer text-xs"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Ideas to Life'}</span>
        </button>
      </div>

      {/* Main Section Banner */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-amber-500 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span>Section Headline & Subtext</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Headline (English)</label>
            <input
              type="text"
              value={act2.headlineEn}
              onChange={(e) => setAct2(prev => ({ ...prev, headlineEn: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 placeholder:text-[var(--text-tertiary)]"
              placeholder="We don’t just imagine fun. We bring it to life."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Headline (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={act2.headlineAr}
              onChange={(e) => setAct2(prev => ({ ...prev, headlineAr: e.target.value }))}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 placeholder:text-[var(--text-tertiary)]"
              placeholder="لا نكتفي بتخيّل المتعة… بل نحوّلها إلى واقع."
            />
          </div>
        </div>
      </div>

      {/* Process Steps Roster */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-amber-500 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              <span>Blueprint Steps Roster ({act2.steps.length})</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Add, reorder, or edit stages in the blueprint pipeline.</p>
          </div>

          <button
            onClick={handleAddStep}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stage</span>
          </button>
        </div>

        <div className="space-y-4">
          {act2.steps.map((step, idx) => (
            <div
              key={step.id || idx}
              className="p-5 rounded-2xl border border-[var(--border-level-1)] bg-[var(--bg-level-1)] space-y-4 transition-all"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-3">
                <span className="text-xs font-extrabold text-amber-500 uppercase tracking-wider">
                  Stage #{idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMoveStep(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveStep(idx, 'down')}
                    disabled={idx === act2.steps.length - 1}
                    className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStep(idx)}
                    className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                    title="Delete Stage"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Stage Title (English)</label>
                  <input
                    type="text"
                    value={step.titleEn || ''}
                    onChange={(e) => handleStepChange(idx, 'titleEn', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Stage Title (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={step.titleAr || ''}
                    onChange={(e) => handleStepChange(idx, 'titleAr', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description (English)</label>
                  <textarea
                    rows={2}
                    value={step.descEn || ''}
                    onChange={(e) => handleStepChange(idx, 'descEn', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Description (Arabic)</label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={step.descAr || ''}
                    onChange={(e) => handleStepChange(idx, 'descAr', e.target.value)}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Stage Visual Media</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={step.mediaUrl || ''}
                    onChange={(e) => handleStepChange(idx, 'mediaUrl', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500 placeholder:text-[var(--text-tertiary)]"
                  />
                  <AdminMediaPicker
                    value={step.mediaUrl || ''}
                    onChange={(url: string) => handleStepChange(idx, 'mediaUrl', url)}
                    label="Media"
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
