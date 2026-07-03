"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Save, 
  ArrowLeft,
  Settings,
  Image as ImageIcon,
  BookOpen,
  AlertTriangle,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { TipTapEditor } from "@/components/shared/TipTapEditor"
import { MediaUploader } from "@/components/shared/MediaUploader"
import { RepeaterField } from "@/components/shared/RepeaterField"

export function MicrositeEditor({ initialData, attractions }: { initialData: any, attractions: any[] }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    titleEn: initialData.titleEn || "",
    titleAr: initialData.titleAr || "",
    slug: initialData.slug || "",
    status: initialData.status || "ACTIVE",
    attractionId: initialData.attractionId || "",
    narrativeEn: initialData.narrativeEn || "",
    narrativeAr: initialData.narrativeAr || "",
    challengesEn: initialData.challengesEn || "",
    challengesAr: initialData.challengesAr || "",
    postEventReport: initialData.postEventReport || "",
  })

  // Repeaters
  const [gallery, setGallery] = useState<any[]>(
    Array.isArray(initialData.gallery) ? initialData.gallery.map((g: any) => ({ id: Math.random().toString(), ...g })) : []
  )
  const [testimonials, setTestimonials] = useState<any[]>(
    Array.isArray(initialData.testimonials) ? initialData.testimonials.map((t: any) => ({ id: Math.random().toString(), ...t })) : []
  )

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = {
        ...formData,
        attractionId: formData.attractionId || null,
        gallery,
        testimonials
      }
      
      const url = initialData.id ? `/api/microsites/${initialData.id}` : `/api/microsites`
      const method = initialData.id ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to save")
      }
      
      setHasUnsavedChanges(false)
      if (!initialData.id) {
        router.push('/dashboard/b2c/microsites')
      }
    } catch (error: any) {
      alert(error.message)
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: "basic", label: "Basic Details", icon: Settings },
    { id: "narrative", label: "Narrative", icon: BookOpen },
    { id: "challenges", label: "Challenges", icon: AlertTriangle },
    { id: "media", label: "Media & Report", icon: ImageIcon },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Sticky Header */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-[var(--surface-default)] border-b border-[var(--border-default)] shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/b2c/microsites')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-black text-[var(--text-primary)]">
              {initialData.id ? `Edit: ${formData.titleEn}` : "New Project Microsite"}
            </h1>
            {hasUnsavedChanges && <span className="text-xs font-bold text-[var(--color-warning)]">Unsaved changes</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save Project"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-64 bg-[var(--surface-default)] border-r border-[var(--border-default)] p-4 overflow-y-auto hidden md:block shrink-0">
          <div className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[var(--surface-hover)]">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* TAB: BASIC */}
            {activeTab === "basic" && (
              <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 space-y-6">
                <h2 className="text-lg font-black text-[var(--text-primary)] mb-4">Basic Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Title (EN)</label>
                    <input type="text" value={formData.titleEn} onChange={e => handleChange('titleEn', e.target.value)} className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]" />
                  </div>
                  <div className="space-y-2" dir="rtl">
                    <label className="text-sm font-bold">Title (AR)</label>
                    <input type="text" value={formData.titleAr} onChange={e => handleChange('titleAr', e.target.value)} className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-right" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">URL Slug</label>
                  <input type="text" value={formData.slug} onChange={e => handleChange('slug', e.target.value)} className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Status</label>
                    <select 
                      value={formData.status} 
                      onChange={e => handleChange('status', e.target.value)} 
                      className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Link to Attraction (Optional)</label>
                    <select 
                      value={formData.attractionId} 
                      onChange={e => handleChange('attractionId', e.target.value)} 
                      className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]"
                    >
                      <option value="">None</option>
                      {attractions.map(attr => (
                        <option key={attr.id} value={attr.id}>{attr.nameEn}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: NARRATIVE */}
            {activeTab === "narrative" && (
              <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 space-y-6">
                <h2 className="text-lg font-black text-[var(--text-primary)] mb-4">Project Narrative</h2>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Narrative (EN)</label>
                  <TipTapEditor value={formData.narrativeEn} onChange={v => handleChange('narrativeEn', v)} dir="ltr" />
                </div>
                <div className="space-y-2" dir="rtl">
                  <label className="text-sm font-bold">Narrative (AR)</label>
                  <TipTapEditor value={formData.narrativeAr} onChange={v => handleChange('narrativeAr', v)} dir="rtl" />
                </div>
              </div>
            )}

            {/* TAB: CHALLENGES */}
            {activeTab === "challenges" && (
              <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 space-y-6">
                <h2 className="text-lg font-black text-[var(--text-primary)] mb-4">Challenges & Solutions</h2>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Challenges (EN)</label>
                  <TipTapEditor value={formData.challengesEn} onChange={v => handleChange('challengesEn', v)} dir="ltr" />
                </div>
                <div className="space-y-2" dir="rtl">
                  <label className="text-sm font-bold">Challenges (AR)</label>
                  <TipTapEditor value={formData.challengesAr} onChange={v => handleChange('challengesAr', v)} dir="rtl" />
                </div>
              </div>
            )}

            {/* TAB: MEDIA & REPORT */}
            {activeTab === "media" && (
              <div className="space-y-6">
                <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8">
                  <h2 className="text-lg font-black text-[var(--text-primary)] mb-4">Post-Event Report</h2>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">PDF Report</label>
                    <MediaUploader 
                      value={formData.postEventReport} 
                      onChange={url => handleChange('postEventReport', url)} 
                      accept="application/pdf"
                    />
                  </div>
                </div>

                <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8">
                  <h2 className="text-lg font-black text-[var(--text-primary)] mb-4">Gallery</h2>
                  <RepeaterField 
                    items={gallery} 
                    setItems={setGallery} 
                    addLabel="Add Image"
                    onAdd={() => setGallery([...gallery, { id: Math.random().toString(), url: '', caption: '' }])}
                    renderItem={(item, index, updateItem) => (
                      <div className="space-y-4">
                        <MediaUploader value={item.url} onChange={url => updateItem({ url })} accept="image/*" />
                        <input type="text" value={item.caption || ''} onChange={e => updateItem({ caption: e.target.value })} placeholder="Caption..." className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]" />
                      </div>
                    )} 
                  />
                </div>
              </div>
            )}

            {/* TAB: TESTIMONIALS */}
            {activeTab === "testimonials" && (
              <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 space-y-6">
                <h2 className="text-lg font-black text-[var(--text-primary)] mb-4">Testimonials</h2>
                <RepeaterField 
                  items={testimonials} 
                  setItems={setTestimonials}
                  addLabel="Add Testimonial"
                  onAdd={() => setTestimonials([...testimonials, { id: Math.random().toString(), author: '', quote: '', rating: 5 }])}
                  renderItem={(item, index, updateItem) => (
                    <div className="space-y-4">
                      <input type="text" value={item.author || ''} onChange={e => updateItem({ author: e.target.value })} placeholder="Author Name" className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]" />
                      <textarea value={item.quote || ''} onChange={e => updateItem({ quote: e.target.value })} placeholder="Quote" className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]" />
                      <input type="number" min="1" max="5" value={item.rating || 5} onChange={e => updateItem({ rating: parseInt(e.target.value) })} placeholder="Rating (1-5)" className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]" />
                    </div>
                  )} 
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
