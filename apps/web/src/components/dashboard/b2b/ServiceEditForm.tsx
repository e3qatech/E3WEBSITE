"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Save, 
  Eye, 
  ArrowLeft,
  Settings,
  Type,
  ListTree,
  Image as ImageIcon,
  Images,
  Briefcase,
  MousePointerClick,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { TipTapEditor } from "@/components/shared/TipTapEditor"
import { MediaUploader } from "@/components/shared/MediaUploader"
import { RepeaterField } from "@/components/shared/RepeaterField"

type ProcessStep = { id: string, titleEn: string, titleAr: string, descEn: string, descAr: string, icon: string }
type GalleryItem = { id: string, url: string, captionEn: string, captionAr: string }
type ProjectItem = { id: string, titleEn: string, titleAr: string, descriptionEn: string, descriptionAr: string, imageUrl: string }

export function ServiceEditForm({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    titleEn: initialData.titleEn || "",
    titleAr: initialData.titleAr || "",
    slug: initialData.slug || "",
    taglineEn: initialData.taglineEn || "",
    taglineAr: initialData.taglineAr || "",
    isVisible: initialData.isVisible || false,
    isFeatured: initialData.isFeatured || false,
    contentEn: initialData.contentEn || "",
    contentAr: initialData.contentAr || "",
    heroMediaType: initialData.heroMediaType || "IMAGE",
    heroMediaUrl: initialData.heroMediaUrl || "",
    thumbnail: initialData.thumbnail || "",
    ctaPrimary: initialData.ctaPrimary || "CONTACT",
    ctaSecondary: initialData.ctaSecondary || "",
    seo: initialData.seo || { metaTitle: "", metaDescription: "", keywords: "" },
  })

  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(
    Array.isArray(initialData.process) ? initialData.process.map((p: any) => ({ id: Math.random().toString(), ...p })) : []
  )

  const [gallery, setGallery] = useState<GalleryItem[]>(
    Array.isArray(initialData.gallery) ? initialData.gallery.map((g: any) => ({ id: Math.random().toString(), ...g })) : []
  )

  const [projects, setProjects] = useState<ProjectItem[]>(
    Array.isArray(initialData.projects) ? initialData.projects.map((p: any) => ({ id: Math.random().toString(), ...p })) : []
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
    setIsSaving(true)
    try {
      const payload = {
        ...formData,
        process: processSteps,
        gallery,
        projects
      }
      
      const res = await fetch(`/api/b2b/services/${initialData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Failed to save")
      
      setHasUnsavedChanges(false)
      // Optional: show toast success
    } catch (error) {
      console.error(error)
      // Optional: show toast error
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: "basic", label: "Basic Details", icon: Settings },
    { id: "content", label: "Content", icon: Type },
    { id: "process", label: "Process", icon: ListTree },
    { id: "hero", label: "Hero Media", icon: ImageIcon },
    { id: "gallery", label: "Gallery", icon: Images },
    { id: "projects", label: "Similar Projects", icon: Briefcase },
    { id: "cta", label: "CTA", icon: MousePointerClick },
    { id: "seo", label: "SEO", icon: Search },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Sticky Header */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-[var(--surface-default)] border-b border-[var(--border-default)] shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/b2b/services')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-black text-[var(--text-primary)]">Edit Service: {formData.titleEn}</h1>
            {hasUnsavedChanges && <span className="text-xs font-bold text-[var(--color-warning)]">Unsaved changes</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <a href={`/en/b2b/services/${formData.slug}`} target="_blank" rel="noreferrer">
              <Eye className="w-4 h-4 mr-2" /> Preview
            </a>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save Changes"}
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
                    <label className="text-sm font-bold">Tagline (EN)</label>
                    <input type="text" value={formData.taglineEn} onChange={e => handleChange('taglineEn', e.target.value)} className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]" />
                  </div>
                  <div className="space-y-2" dir="rtl">
                    <label className="text-sm font-bold">Tagline (AR)</label>
                    <input type="text" value={formData.taglineAr} onChange={e => handleChange('taglineAr', e.target.value)} className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-right" />
                  </div>
                </div>

                <div className="flex gap-8 pt-4 border-t border-[var(--border-default)]">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isVisible} onChange={e => handleChange('isVisible', e.target.checked)} className="w-5 h-5 rounded border-[var(--border-default)] text-[var(--color-primary)]" />
                    <span className="font-bold">Visible to Public</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isFeatured} onChange={e => handleChange('isFeatured', e.target.checked)} className="w-5 h-5 rounded border-[var(--border-default)] text-[var(--color-primary)]" />
                    <span className="font-bold">Featured Service</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB: CONTENT */}
            {activeTab === "content" && (
              <div className="space-y-8">
                <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8">
                  <h2 className="text-lg font-black text-[var(--text-primary)] mb-4">Description (English)</h2>
                  <TipTapEditor value={formData.contentEn} onChange={val => handleChange('contentEn', val)} dir="ltr" />
                </div>
                <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8">
                  <h2 className="text-lg font-black text-[var(--text-primary)] mb-4 text-right">Description (Arabic)</h2>
                  <TipTapEditor value={formData.contentAr} onChange={val => handleChange('contentAr', val)} dir="rtl" />
                </div>
              </div>
            )}

            {/* TAB: PROCESS */}
            {activeTab === "process" && (
              <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8">
                <h2 className="text-lg font-black text-[var(--text-primary)] mb-1">Process Steps ("How We Do It")</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6">Drag and drop to reorder the steps.</p>
                <RepeaterField
                  items={processSteps}
                  setItems={(items) => { setProcessSteps(items); setHasUnsavedChanges(true) }}
                  onAdd={() => {
                    setProcessSteps([...processSteps, { id: Math.random().toString(), titleEn: "", titleAr: "", descEn: "", descAr: "", icon: "circle" }])
                    setHasUnsavedChanges(true)
                  }}
                  addLabel="Add Process Step"
                  renderItem={(item, index, update) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <input placeholder="Title (EN)" value={item.titleEn} onChange={e => update({ titleEn: e.target.value })} className="w-full px-3 py-2 rounded bg-[var(--surface-hover)] border border-[var(--border-default)]" />
                      <input placeholder="Title (AR)" value={item.titleAr} onChange={e => update({ titleAr: e.target.value })} dir="rtl" className="w-full px-3 py-2 rounded bg-[var(--surface-hover)] border border-[var(--border-default)] text-right" />
                      <textarea placeholder="Description (EN)" value={item.descEn} onChange={e => update({ descEn: e.target.value })} className="w-full px-3 py-2 rounded bg-[var(--surface-hover)] border border-[var(--border-default)] min-h-[80px]" />
                      <textarea placeholder="Description (AR)" value={item.descAr} onChange={e => update({ descAr: e.target.value })} dir="rtl" className="w-full px-3 py-2 rounded bg-[var(--surface-hover)] border border-[var(--border-default)] text-right min-h-[80px]" />
                    </div>
                  )}
                />
              </div>
            )}

            {/* TAB: HERO */}
            {activeTab === "hero" && (
              <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 space-y-6">
                <h2 className="text-lg font-black text-[var(--text-primary)] mb-4">Hero Media</h2>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Media Type</label>
                  <select 
                    value={formData.heroMediaType} 
                    onChange={e => handleChange('heroMediaType', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="MODEL_3D">3D Model (Three.js)</option>
                    <option value="SPLINE">Spline / 3D Scene</option>
                    <option value="IFRAME">iFrame Embed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Media Source (Upload or URL)</label>
                  {(formData.heroMediaType === 'IFRAME' || formData.heroMediaType === 'SPLINE') ? (
                    <input 
                      type="text" 
                      value={formData.heroMediaUrl} 
                      onChange={e => handleChange('heroMediaUrl', e.target.value)} 
                      placeholder="https://..." 
                      className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]" 
                    />
                  ) : (
                    <div className="space-y-4">
                      <MediaUploader 
                        value={formData.heroMediaUrl} 
                        onChange={url => handleChange('heroMediaUrl', url)} 
                        accept={formData.heroMediaType === 'VIDEO' ? "video/*" : formData.heroMediaType === 'MODEL_3D' ? ".glb,.gltf" : "image/*"}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-secondary)] font-bold whitespace-nowrap">OR EXTERNAL URL:</span>
                        <input 
                          type="text" 
                          value={formData.heroMediaUrl} 
                          onChange={e => handleChange('heroMediaUrl', e.target.value)} 
                          placeholder="https://..." 
                          className="flex-1 px-4 py-2 text-sm rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: GALLERY */}
            {activeTab === "gallery" && (
              <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8">
                <h2 className="text-lg font-black text-[var(--text-primary)] mb-6">Gallery Images</h2>
                <RepeaterField
                  items={gallery}
                  setItems={(items) => { setGallery(items); setHasUnsavedChanges(true) }}
                  onAdd={() => {
                    setGallery([...gallery, { id: Math.random().toString(), url: "", captionEn: "", captionAr: "" }])
                    setHasUnsavedChanges(true)
                  }}
                  addLabel="Add Image"
                  renderItem={(item, index, update) => (
                    <div className="flex flex-col md:flex-row gap-4 w-full">
                      <div className="w-full md:w-48 shrink-0">
                        <MediaUploader value={item.url} onChange={url => update({ url })} />
                      </div>
                      <div className="flex-1 space-y-4">
                        <input placeholder="Caption (EN)" value={item.captionEn} onChange={e => update({ captionEn: e.target.value })} className="w-full px-3 py-2 rounded bg-[var(--surface-hover)] border border-[var(--border-default)]" />
                        <input placeholder="Caption (AR)" value={item.captionAr} onChange={e => update({ captionAr: e.target.value })} dir="rtl" className="w-full px-3 py-2 rounded bg-[var(--surface-hover)] border border-[var(--border-default)] text-right" />
                      </div>
                    </div>
                  )}
                />
              </div>
            )}

            {/* Remaining tabs are implemented similarly... */}
            {activeTab === "projects" && (
              <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8">
                <h2 className="text-lg font-black text-[var(--text-primary)] mb-6">Similar Projects</h2>
                <RepeaterField
                  items={projects}
                  setItems={(items) => { setProjects(items); setHasUnsavedChanges(true) }}
                  onAdd={() => {
                    setProjects([...projects, { id: Math.random().toString(), titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "", imageUrl: "" }])
                    setHasUnsavedChanges(true)
                  }}
                  addLabel="Add Project"
                  renderItem={(item, index, update) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div className="col-span-1 md:col-span-2">
                        <MediaUploader value={item.imageUrl} onChange={url => update({ imageUrl: url })} />
                      </div>
                      <input placeholder="Title (EN)" value={item.titleEn} onChange={e => update({ titleEn: e.target.value })} className="w-full px-3 py-2 rounded bg-[var(--surface-hover)] border border-[var(--border-default)]" />
                      <input placeholder="Title (AR)" value={item.titleAr} onChange={e => update({ titleAr: e.target.value })} dir="rtl" className="w-full px-3 py-2 rounded bg-[var(--surface-hover)] border border-[var(--border-default)] text-right" />
                    </div>
                  )}
                />
              </div>
            )}

            {activeTab === "cta" && (
              <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 space-y-6">
                 <h2 className="text-lg font-black text-[var(--text-primary)] mb-4">Call to Action Configuration</h2>
                 <div className="space-y-2">
                  <label className="text-sm font-bold">Primary CTA Action</label>
                  <select 
                    value={formData.ctaPrimary} 
                    onChange={e => handleChange('ctaPrimary', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]"
                  >
                    <option value="CONTACT">Contact Us</option>
                    <option value="LEARN_MORE">Learn More</option>
                    <option value="BOOK_APPOINTMENT">Book Appointment</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === "seo" && (
              <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8 space-y-6">
                 <h2 className="text-lg font-black text-[var(--text-primary)] mb-4">SEO Settings</h2>
                 <div className="space-y-2">
                  <label className="text-sm font-bold">Meta Title</label>
                  <input type="text" value={formData.seo?.metaTitle || ''} onChange={e => handleChange('seo', { ...formData.seo, metaTitle: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]" />
                 </div>
                 <div className="space-y-2">
                  <label className="text-sm font-bold">Meta Description</label>
                  <textarea value={formData.seo?.metaDescription || ''} onChange={e => handleChange('seo', { ...formData.seo, metaDescription: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] h-24" />
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
