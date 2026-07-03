"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, Package, Shuffle, Image as ImageIcon, 
  Grid, Link as LinkIcon, MousePointer2, Search, Plus, Save, Trash2, ChevronRight, ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"
import { TipTapEditor } from "@/components/shared/TipTapEditor"
import { MediaUploader } from "@/components/shared/MediaUploader"
import { RepeaterField } from "@/components/shared/RepeaterField"

const TABS = [
  { id: "basic", label: "Basic Details", icon: FileText },
  { id: "inside", label: "What's Inside", icon: Package },
  { id: "process", label: "Process Stepper", icon: Shuffle },
  { id: "hero", label: "Hero Media", icon: ImageIcon },
  { id: "gallery", label: "Portfolio Gallery", icon: Grid },
  { id: "projects", label: "Cross-Reference", icon: LinkIcon },
  { id: "cta", label: "Call to Action", icon: MousePointer2 },
  { id: "seo", label: "SEO Customizer", icon: Search },
]

export function ServicesEditor({ initialData, attractions }: { initialData?: any, attractions?: { id: string, nameEn: string }[] }) {
  const router = useRouter()
  const isEditing = !!initialData
  
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    titleEn: initialData?.titleEn || "",
    titleAr: initialData?.titleAr || "",
    slug: initialData?.slug || "",
    taglineEn: initialData?.taglineEn || "",
    taglineAr: initialData?.taglineAr || "",
    isVisible: initialData?.isVisible || false,
    isFeatured: initialData?.isFeatured || false,
    contentEn: initialData?.contentEn || "",
    contentAr: initialData?.contentAr || "",
    heroMediaType: initialData?.heroMediaType || "IMAGE",
    heroMediaUrl: initialData?.heroMediaUrl || "",
    thumbnail: initialData?.thumbnail || "",
    ctaPrimary: initialData?.ctaPrimary || "CONTACT",
    ctaSecondary: initialData?.ctaSecondary || "",
    attractionId: initialData?.attractionId || "",
    seo: initialData?.seo || { metaTitle: "", metaDescription: "", keywords: "" },
  })

  const [processSteps, setProcessSteps] = useState<any[]>(
    Array.isArray(initialData?.process) ? initialData.process.map((p: any) => ({ id: Math.random().toString(), ...p })) : []
  )

  const [gallery, setGallery] = useState<any[]>(
    Array.isArray(initialData?.gallery) ? initialData.gallery.map((g: any) => ({ id: Math.random().toString(), ...g })) : []
  )

  const [projects, setProjects] = useState<any[]>(
    Array.isArray(initialData?.projects) ? initialData.projects.map((p: any) => ({ id: Math.random().toString(), ...p })) : []
  )

  // Warn on unsaved changes
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
    if (!formData.slug || !formData.titleEn || !formData.titleAr) {
      alert("Slug and Titles are required")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        ...formData,
        process: processSteps,
        gallery,
        projects
      }

      if (isEditing) {
        const res = await fetch(`/api/b2b/services/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error("Failed to update")
      } else {
        const res = await fetch(`/api/b2b/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            slug: formData.slug, 
            titleEn: formData.titleEn, 
            titleAr: formData.titleAr 
          })
        })
        if (!res.ok) throw new Error("Failed to create. Slug might already exist.")
        const data = await res.json()
        
        // Follow up with a PUT to save all other fields
        await fetch(`/api/b2b/services/${data.service.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      }

      setHasUnsavedChanges(false)
      router.push("/dashboard/b2b/services")
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-6 bg-[var(--background)]">
      
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-[var(--border-default)] bg-[var(--surface-default)] p-4 flex flex-col z-10 shrink-0">
        <div className="mb-6 flex items-center gap-3">
          <button 
            onClick={() => router.push('/dashboard/b2b/services')}
            className="p-1.5 hover:bg-[var(--surface-hover)] rounded-lg transition-colors text-[var(--text-secondary)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)] leading-tight">Services CMS</h2>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)]">Advanced Capability Editor</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left
                  ${isActive 
                    ? 'bg-[var(--color-primary)] text-white font-bold shadow-md' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--text-tertiary)]'}`} />
                {tab.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            )
          })}
        </nav>

        <div className="pt-4 border-t border-[var(--border-default)] space-y-3">
          {hasUnsavedChanges && (
            <p className="text-xs text-center font-bold text-[var(--color-warning)]">Unsaved Changes</p>
          )}
          <Button className="w-full gap-2 rounded-xl h-12 text-sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <span className="animate-spin text-xl">⟳</span> : <Save className="w-4 h-4" />}
            Publish Service
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative bg-[var(--surface-hover)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            
            {activeTab === "basic" && (
              <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-8 space-y-8">
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Basic Details</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Set the core identity and bilingual descriptions for this service.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Title (English) *</label>
                    <input type="text" value={formData.titleEn} onChange={e => handleChange('titleEn', e.target.value)} className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl p-3 text-sm focus:border-[var(--color-primary)] outline-none transition-colors" placeholder="e.g. Festival Engineering" />
                  </div>
                  <div className="space-y-2" dir="rtl">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Title (Arabic) *</label>
                    <input type="text" value={formData.titleAr} onChange={e => handleChange('titleAr', e.target.value)} className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl p-3 text-sm focus:border-[var(--color-primary)] outline-none transition-colors font-arabic" placeholder="عنوان الخدمة" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">URL Slug *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-tertiary)] bg-[var(--surface-hover)] px-4 py-3 rounded-xl border border-[var(--border-default)]">/b2b/services/</span>
                    <input type="text" value={formData.slug} onChange={e => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} className="flex-1 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl p-3 text-sm focus:border-[var(--color-primary)] outline-none font-mono transition-colors" placeholder="festival-engineering" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tagline (English)</label>
                    <textarea rows={2} value={formData.taglineEn} onChange={e => handleChange('taglineEn', e.target.value)} className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl p-3 text-sm focus:border-[var(--color-primary)] outline-none resize-none transition-colors" placeholder="Short description..." />
                  </div>
                  <div className="space-y-2" dir="rtl">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Tagline (Arabic)</label>
                    <textarea rows={2} value={formData.taglineAr} onChange={e => handleChange('taglineAr', e.target.value)} className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl p-3 text-sm focus:border-[var(--color-primary)] outline-none resize-none transition-colors font-arabic" placeholder="وصف قصير..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Card Thumbnail</label>
                  <MediaUploader value={formData.thumbnail} onChange={val => handleChange('thumbnail', val)} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Linked Attraction (Optional)</label>
                  <select
                    value={formData.attractionId}
                    onChange={(e) => handleChange("attractionId", e.target.value)}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl p-3 text-sm focus:border-[var(--color-primary)] outline-none transition-colors"
                  >
                    <option value="">None</option>
                    {attractions?.map(a => (
                      <option key={a.id} value={a.id}>{a.nameEn}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-8 pt-6 border-t border-[var(--border-default)]">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isVisible ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[var(--border-default)] bg-[var(--surface-hover)] group-hover:border-[var(--color-primary)]'}`}>
                      {formData.isVisible && <div className="w-2 h-2 rounded-sm bg-white" />}
                    </div>
                    <input type="checkbox" checked={formData.isVisible} onChange={e => handleChange('isVisible', e.target.checked)} className="hidden" />
                    <span className="font-bold text-sm text-[var(--text-primary)]">Visible to Public</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isFeatured ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[var(--border-default)] bg-[var(--surface-hover)] group-hover:border-[var(--color-primary)]'}`}>
                      {formData.isFeatured && <div className="w-2 h-2 rounded-sm bg-white" />}
                    </div>
                    <input type="checkbox" checked={formData.isFeatured} onChange={e => handleChange('isFeatured', e.target.checked)} className="hidden" />
                    <span className="font-bold text-sm text-[var(--text-primary)]">Featured Service</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === "inside" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">What's Inside</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Compile the distinct deliverables and components of this service.</p>
                </div>
                
                <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 space-y-4">
                  <h2 className="text-lg font-black text-[var(--text-primary)]">Description (English)</h2>
                  <TipTapEditor value={formData.contentEn} onChange={val => handleChange('contentEn', val)} dir="ltr" />
                </div>
                
                <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 space-y-4">
                  <h2 className="text-lg font-black text-[var(--text-primary)] text-right">Description (Arabic)</h2>
                  <TipTapEditor value={formData.contentAr} onChange={val => handleChange('contentAr', val)} dir="rtl" />
                </div>
              </div>
            )}

            {activeTab === "process" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Process Stepper</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Map E3's execution phases (e.g. Discovery → Feasibility → Fabrication).</p>
                </div>
                
                <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8">
                  <RepeaterField
                    items={processSteps}
                    setItems={(items) => { setProcessSteps(items); setHasUnsavedChanges(true) }}
                    onAdd={() => {
                      setProcessSteps([...processSteps, { id: Math.random().toString(), titleEn: "", titleAr: "", descEn: "", descAr: "", icon: "circle" }])
                      setHasUnsavedChanges(true)
                    }}
                    addLabel="Add Process Phase"
                    renderItem={(item, index, update) => (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <input placeholder="Phase Title (EN)" value={item.titleEn} onChange={e => update({ titleEn: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] focus:border-[var(--color-primary)] outline-none" />
                        <input placeholder="Phase Title (AR)" value={item.titleAr} onChange={e => update({ titleAr: e.target.value })} dir="rtl" className="w-full px-4 py-3 text-sm rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] focus:border-[var(--color-primary)] outline-none font-arabic" />
                        <textarea placeholder="Description (EN)" value={item.descEn} onChange={e => update({ descEn: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] focus:border-[var(--color-primary)] outline-none min-h-[100px] resize-none" />
                        <textarea placeholder="Description (AR)" value={item.descAr} onChange={e => update({ descAr: e.target.value })} dir="rtl" className="w-full px-4 py-3 text-sm rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] focus:border-[var(--color-primary)] outline-none min-h-[100px] resize-none font-arabic" />
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            {activeTab === "hero" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Hero Media</h3>
                  <p className="text-sm text-[var(--text-secondary)]">The primary visual that sits behind the service title.</p>
                </div>

                <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Media Format</label>
                    <select 
                      value={formData.heroMediaType} 
                      onChange={e => handleChange('heroMediaType', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-sm focus:border-[var(--color-primary)] outline-none"
                    >
                      <option value="IMAGE">Image</option>
                      <option value="VIDEO">Video</option>
                      <option value="MODEL_3D">3D Model (Three.js)</option>
                      <option value="SPLINE">Spline / 3D Scene</option>
                      <option value="IFRAME">iFrame Embed</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Source</label>
                    {(formData.heroMediaType === 'IFRAME' || formData.heroMediaType === 'SPLINE') ? (
                      <input 
                        type="text" 
                        value={formData.heroMediaUrl} 
                        onChange={e => handleChange('heroMediaUrl', e.target.value)} 
                        placeholder="https://..." 
                        className="w-full px-4 py-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-sm focus:border-[var(--color-primary)] outline-none font-mono" 
                      />
                    ) : (
                      <div className="space-y-4">
                        <MediaUploader 
                          value={formData.heroMediaUrl} 
                          onChange={url => handleChange('heroMediaUrl', url)} 
                          accept={formData.heroMediaType === 'VIDEO' ? "video/*" : formData.heroMediaType === 'MODEL_3D' ? ".glb,.gltf" : "image/*"}
                        />
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[var(--text-secondary)] font-bold tracking-wider">OR URL:</span>
                          <input 
                            type="text" 
                            value={formData.heroMediaUrl} 
                            onChange={e => handleChange('heroMediaUrl', e.target.value)} 
                            placeholder="https://..." 
                            className="flex-1 px-4 py-2 text-sm rounded-lg bg-[var(--surface-hover)] border border-[var(--border-default)] focus:border-[var(--color-primary)] outline-none font-mono" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Portfolio Gallery</h3>
                  <p className="text-sm text-[var(--text-secondary)]">A masonry or grid gallery showcasing deliverables from this service.</p>
                </div>
                
                <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8">
                  <RepeaterField
                    items={gallery}
                    setItems={(items) => { setGallery(items); setHasUnsavedChanges(true) }}
                    onAdd={() => {
                      setGallery([...gallery, { id: Math.random().toString(), url: "", captionEn: "", captionAr: "" }])
                      setHasUnsavedChanges(true)
                    }}
                    addLabel="Add Image to Gallery"
                    renderItem={(item, index, update) => (
                      <div className="flex flex-col md:flex-row gap-6 w-full items-start">
                        <div className="w-full md:w-64 shrink-0">
                          <MediaUploader value={item.url} onChange={url => update({ url })} />
                        </div>
                        <div className="flex-1 space-y-4 w-full">
                          <input placeholder="Caption (EN)" value={item.captionEn} onChange={e => update({ captionEn: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] focus:border-[var(--color-primary)] outline-none" />
                          <input placeholder="Caption (AR)" value={item.captionAr} onChange={e => update({ captionAr: e.target.value })} dir="rtl" className="w-full px-4 py-3 text-sm rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] focus:border-[var(--color-primary)] outline-none font-arabic" />
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            {activeTab === "projects" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Cross-Reference</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Link to related case studies or projects where this service was utilized.</p>
                </div>
                
                <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8">
                  <RepeaterField
                    items={projects}
                    setItems={(items) => { setProjects(items); setHasUnsavedChanges(true) }}
                    onAdd={() => {
                      setProjects([...projects, { id: Math.random().toString(), titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "", imageUrl: "" }])
                      setHasUnsavedChanges(true)
                    }}
                    addLabel="Add Related Project"
                    renderItem={(item, index, update) => (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div className="col-span-1 md:col-span-2">
                          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Project Cover</label>
                          <MediaUploader value={item.imageUrl} onChange={url => update({ imageUrl: url })} />
                        </div>
                        <input placeholder="Project Title (EN)" value={item.titleEn} onChange={e => update({ titleEn: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] focus:border-[var(--color-primary)] outline-none" />
                        <input placeholder="Project Title (AR)" value={item.titleAr} onChange={e => update({ titleAr: e.target.value })} dir="rtl" className="w-full px-4 py-3 text-sm rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] focus:border-[var(--color-primary)] outline-none font-arabic" />
                        <textarea placeholder="Short Description (EN)" value={item.descriptionEn} onChange={e => update({ descriptionEn: e.target.value })} className="w-full px-4 py-3 text-sm rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] focus:border-[var(--color-primary)] outline-none min-h-[80px] resize-none" />
                        <textarea placeholder="Short Description (AR)" value={item.descriptionAr} onChange={e => update({ descriptionAr: e.target.value })} dir="rtl" className="w-full px-4 py-3 text-sm rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] focus:border-[var(--color-primary)] outline-none min-h-[80px] resize-none font-arabic" />
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            {activeTab === "cta" && (
              <div className="space-y-6">
                 <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Call to Action</h3>
                  <p className="text-sm text-[var(--text-secondary)]">The concluding interaction for this service page.</p>
                </div>
                
                <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Primary Action</label>
                    <select 
                      value={formData.ctaPrimary} 
                      onChange={e => handleChange('ctaPrimary', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-sm focus:border-[var(--color-primary)] outline-none"
                    >
                      <option value="CONTACT">Contact Us</option>
                      <option value="LEARN_MORE">Learn More</option>
                      <option value="BOOK_APPOINTMENT">Book Appointment</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "seo" && (
              <div className="space-y-6">
                 <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">SEO Customizer</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Control how this service appears on search engines.</p>
                </div>
                
                <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Meta Title</label>
                    <input type="text" value={formData.seo?.metaTitle || ''} onChange={e => handleChange('seo', { ...formData.seo, metaTitle: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-sm focus:border-[var(--color-primary)] outline-none" placeholder="Default inherits from Service Title if blank" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Meta Description</label>
                    <textarea value={formData.seo?.metaDescription || ''} onChange={e => handleChange('seo', { ...formData.seo, metaDescription: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-sm focus:border-[var(--color-primary)] outline-none h-24 resize-none" placeholder="Brief summary of the service for search results..." />
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
