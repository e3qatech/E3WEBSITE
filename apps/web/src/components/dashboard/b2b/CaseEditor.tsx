"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Save, ArrowLeft, Plus, X, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { BeforeAfterSlider } from "./BeforeAfterSlider"

interface CaseStudy {
  id?: string
  slug: string
  title: { en: string; ar: string }
  clientName: string
  category: string[]
  year: number
  duration?: string
  location?: { en: string; ar: string }
  challenge: { en: string; ar: string }
  solution: { en: string; ar: string }
  results?: { en: string; ar: string }
  testimonial?: { quoteEn: string; quoteAr: string; author: string }
  isPublished: boolean
  isFeatured: boolean
  telemetry?: { labelEn: string; valueEn: string; labelAr: string; valueAr: string }[]
  beforeImage?: string
  afterImage?: string
}

interface CaseEditorProps {
  initialData?: CaseStudy
}

export function CaseEditor({ initialData }: CaseEditorProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<CaseStudy>({
    slug: initialData?.slug || "",
    title: {
      en: initialData?.title?.en || "",
      ar: initialData?.title?.ar || ""
    },
    clientName: initialData?.clientName || "",
    category: initialData?.category || [],
    year: initialData?.year || new Date().getFullYear(),
    duration: initialData?.duration || "",
    location: {
      en: initialData?.location?.en || "",
      ar: initialData?.location?.ar || ""
    },
    challenge: {
      en: initialData?.challenge?.en || "",
      ar: initialData?.challenge?.ar || ""
    },
    solution: {
      en: initialData?.solution?.en || "",
      ar: initialData?.solution?.ar || ""
    },
    results: {
      en: initialData?.results?.en || "",
      ar: initialData?.results?.ar || ""
    },
    testimonial: {
      quoteEn: initialData?.testimonial?.quoteEn || "",
      quoteAr: initialData?.testimonial?.quoteAr || "",
      author: initialData?.testimonial?.author || ""
    },
    isPublished: initialData?.isPublished ?? false,
    isFeatured: initialData?.isFeatured ?? false,
    telemetry: initialData?.telemetry || [],
    beforeImage: initialData?.beforeImage || "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600",
    afterImage: initialData?.afterImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600"
  })

  const [newTag, setNewTag] = useState("")
  const [newMetric, setNewMetric] = useState({ labelEn: "", valueEn: "", labelAr: "", valueAr: "" })

  const handleAddTag = () => {
    if (!newTag.trim()) return
    if (!formData.category.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, category: [...prev.category, newTag.trim()] }))
    }
    setNewTag("")
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, category: prev.category.filter(t => t !== tag) }))
  }

  const handleAddMetric = () => {
    if (!newMetric.labelEn.trim() || !newMetric.valueEn.trim()) return
    setFormData(prev => ({
      ...prev,
      telemetry: [...(prev.telemetry || []), { ...newMetric }]
    }))
    setNewMetric({ labelEn: "", valueEn: "", labelAr: "", valueAr: "" })
  }

  const handleRemoveMetric = (index: number) => {
    setFormData(prev => ({
      ...prev,
      telemetry: prev.telemetry?.filter((_, idx) => idx !== index) || []
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    
    try {
      const url = initialData?.id ? `/api/cases/${initialData.id}` : "/api/cases"
      const method = initialData?.id ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Something went wrong")
      }

      router.push("/dashboard/b2b/cases")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/dashboard/b2b/cases")}
            className="p-2 hover:bg-[var(--surface-hover)] rounded-lg text-[var(--text-secondary)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">
              {initialData ? "Edit Case Study" : "Create Case Study"}
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">Establish premium corporate record proofs</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/dashboard/b2b/cases")} disabled={isSaving}>
            Cancel
          </Button>
          <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Showcase</>}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Inputs (Left/2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Identity Card */}
          <div className="bg-[var(--surface-default)] p-6 rounded-xl border border-[var(--border-default)] space-y-4">
            <h3 className="font-black text-[var(--text-primary)] uppercase tracking-wider text-xs border-b border-[var(--border-default)] pb-2 mb-4">
              1. Showcase Identity
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Client Name</label>
                <input 
                  type="text" 
                  value={formData.clientName}
                  onChange={e => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)]" 
                  placeholder="e.g. Qatar Tourism" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Custom URL Slug</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)] font-mono" 
                  placeholder="doha-balloon-parade" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Title (English)</label>
                <input 
                  type="text" 
                  value={formData.title.en}
                  onChange={e => setFormData(prev => ({ ...prev, title: { ...prev.title, en: e.target.value } }))}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)]" 
                  placeholder="Showcase Title" 
                />
              </div>
              <div className="space-y-1" dir="rtl">
                <label className="text-xs font-bold text-[var(--text-secondary)] text-right block">Title (Arabic)</label>
                <input 
                  type="text" 
                  value={formData.title.ar}
                  onChange={e => setFormData(prev => ({ ...prev, title: { ...prev.title, ar: e.target.value } }))}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)]" 
                  placeholder="العنوان بالعربية" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Execution Year</label>
                <input 
                  type="number" 
                  value={formData.year}
                  onChange={e => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)] font-mono" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Project Duration</label>
                <input 
                  type="text" 
                  value={formData.duration}
                  onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)]" 
                  placeholder="e.g. 3 Months" 
                />
              </div>
            </div>
          </div>

          {/* Bilingual Project Narrative */}
          <div className="bg-[var(--surface-default)] p-6 rounded-xl border border-[var(--border-default)] space-y-6">
            <h3 className="font-black text-[var(--text-primary)] uppercase tracking-wider text-xs border-b border-[var(--border-default)] pb-2">
              2. Case Narrative (Bilingual)
            </h3>

            {/* Challenge */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span> Challenge
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea 
                  rows={4}
                  value={formData.challenge.en}
                  onChange={e => setFormData(prev => ({ ...prev, challenge: { ...prev.challenge, en: e.target.value } }))}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)] resize-none"
                  placeholder="Describe the client's problem / challenge in English"
                />
                <textarea 
                  rows={4}
                  dir="rtl"
                  value={formData.challenge.ar}
                  onChange={e => setFormData(prev => ({ ...prev, challenge: { ...prev.challenge, ar: e.target.value } }))}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)] resize-none text-right"
                  placeholder="صِف تحدي المشروع بالعربية"
                />
              </div>
            </div>

            {/* Solution */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span> Solution
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea 
                  rows={4}
                  value={formData.solution.en}
                  onChange={e => setFormData(prev => ({ ...prev, solution: { ...prev.solution, en: e.target.value } }))}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)] resize-none"
                  placeholder="Describe E3's unique solution in English"
                />
                <textarea 
                  rows={4}
                  dir="rtl"
                  value={formData.solution.ar}
                  onChange={e => setFormData(prev => ({ ...prev, solution: { ...prev.solution, ar: e.target.value } }))}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)] resize-none text-right"
                  placeholder="صِف حل المشروع بالعربية"
                />
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span> Results
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea 
                  rows={4}
                  value={formData.results?.en}
                  onChange={e => setFormData(prev => ({ ...prev, results: { en: e.target.value, ar: prev.results?.ar || "" } }))}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)] resize-none"
                  placeholder="Describe final execution achievements in English"
                />
                <textarea 
                  rows={4}
                  dir="rtl"
                  value={formData.results?.ar}
                  onChange={e => setFormData(prev => ({ ...prev, results: { en: prev.results?.en || "", ar: e.target.value } }))}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)] resize-none text-right"
                  placeholder="صِف نتائج وإنجازات المشروع بالعربية"
                />
              </div>
            </div>
          </div>

          {/* Before/After Media Section */}
          <div className="bg-[var(--surface-default)] p-6 rounded-xl border border-[var(--border-default)] space-y-6">
            <h3 className="font-black text-[var(--text-primary)] uppercase tracking-wider text-xs border-b border-[var(--border-default)] pb-2">
              3. Before / After Visual comparison
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Before Image URL</label>
                <input 
                  type="text" 
                  value={formData.beforeImage}
                  onChange={e => setFormData(prev => ({ ...prev, beforeImage: e.target.value }))}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)] font-mono" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">After Image URL</label>
                <input 
                  type="text" 
                  value={formData.afterImage}
                  onChange={e => setFormData(prev => ({ ...prev, afterImage: e.target.value }))}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-3 text-sm focus:border-[var(--color-primary)] outline-none text-[var(--text-primary)] font-mono" 
                />
              </div>
            </div>

            {formData.beforeImage && formData.afterImage && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Live Interactive Preview</label>
                <BeforeAfterSlider 
                  beforeImage={formData.beforeImage}
                  afterImage={formData.afterImage}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls (Right/1 Col) */}
        <div className="space-y-6">
          
          {/* Status & Publication */}
          <div className="bg-[var(--surface-default)] p-6 rounded-xl border border-[var(--border-default)] space-y-4">
            <h3 className="font-black text-[var(--text-primary)] uppercase tracking-wider text-xs border-b border-[var(--border-default)] pb-2 mb-4">
              Publishing Options
            </h3>

            <div className="flex items-center justify-between p-3 bg-[var(--surface-subtle)] rounded-lg border border-[var(--border-default)]">
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">Public Visibility</div>
                <div className="text-xs text-[var(--text-secondary)]">Make showcase live on site</div>
              </div>
              <input 
                type="checkbox" 
                checked={formData.isPublished}
                onChange={e => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--surface-subtle)] rounded-lg border border-[var(--border-default)]">
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">Featured Showcase</div>
                <div className="text-xs text-[var(--text-secondary)]">Prioritize on home sliders</div>
              </div>
              <input 
                type="checkbox" 
                checked={formData.isFeatured}
                onChange={e => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer"
              />
            </div>
          </div>

          {/* Tags CMS */}
          <div className="bg-[var(--surface-default)] p-6 rounded-xl border border-[var(--border-default)] space-y-4">
            <h3 className="font-black text-[var(--text-primary)] uppercase tracking-wider text-xs border-b border-[var(--border-default)] pb-2">
              Capability Tags
            </h3>
            
            <div className="flex flex-wrap gap-1.5">
              {formData.category.map(tag => (
                <span 
                  key={tag}
                  className="inline-flex items-center gap-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2.5 py-1 rounded-lg text-xs font-bold border border-[var(--color-primary)]/20"
                >
                  {tag}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => handleRemoveTag(tag)}
                  />
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="e.g. Fabrication"
                className="flex-1 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-1.5 text-xs outline-none text-[var(--text-primary)]"
              />
              <Button size="sm" onClick={handleAddTag}>Add</Button>
            </div>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="bg-[var(--surface-default)] p-6 rounded-xl border border-[var(--border-default)] space-y-4">
            <h3 className="font-black text-[var(--text-primary)] uppercase tracking-wider text-xs border-b border-[var(--border-default)] pb-2">
              Telemetry metrics
            </h3>

            {/* Metrics List */}
            {formData.telemetry && formData.telemetry.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {formData.telemetry.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-[var(--surface-subtle)] rounded-lg border border-[var(--border-default)] text-xs">
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">{m.valueEn} {m.labelEn}</div>
                      {(m.labelAr || m.valueAr) && (
                        <div className="text-[var(--text-tertiary)] font-medium" dir="rtl">{m.valueAr} {m.labelAr}</div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleRemoveMetric(idx)}
                      className="text-red-500 hover:bg-red-500/10 p-1 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Metric Form */}
            <div className="space-y-3 p-3 bg-[var(--surface-subtle)] rounded-lg border border-[var(--border-default)]">
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={newMetric.valueEn}
                  onChange={e => setNewMetric(prev => ({ ...prev, valueEn: e.target.value }))}
                  placeholder="Val (En) e.g. 760,000+"
                  className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded px-2 py-1 text-xs outline-none text-[var(--text-primary)]"
                />
                <input 
                  type="text" 
                  value={newMetric.labelEn}
                  onChange={e => setNewMetric(prev => ({ ...prev, labelEn: e.target.value }))}
                  placeholder="Label (En) e.g. Attendees"
                  className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded px-2 py-1 text-xs outline-none text-[var(--text-primary)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2" dir="rtl">
                <input 
                  type="text" 
                  value={newMetric.valueAr}
                  onChange={e => setNewMetric(prev => ({ ...prev, valueAr: e.target.value }))}
                  placeholder="القيمة (عربي)"
                  className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded px-2 py-1 text-xs outline-none text-[var(--text-primary)] text-right"
                />
                <input 
                  type="text" 
                  value={newMetric.labelAr}
                  onChange={e => setNewMetric(prev => ({ ...prev, labelAr: e.target.value }))}
                  placeholder="العنوان (عربي)"
                  className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded px-2 py-1 text-xs outline-none text-[var(--text-primary)] text-right"
                />
              </div>
              <Button size="sm" className="w-full gap-1" onClick={handleAddMetric}>
                <Plus className="w-3.5 h-3.5" /> Add Metric
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
