"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MediaUploader } from "@/components/ui/MediaUploader"

export function ServiceEditor({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const isEditing = !!initialData

  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  // Fields
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [titleEn, setTitleEn] = useState(initialData?.titleEn || "")
  const [titleAr, setTitleAr] = useState(initialData?.titleAr || "")
  const [taglineEn, setTaglineEn] = useState(initialData?.taglineEn || "")
  const [taglineAr, setTaglineAr] = useState(initialData?.taglineAr || "")
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "")
  const [contentEn, setContentEn] = useState(initialData?.contentEn || "")
  const [contentAr, setContentAr] = useState(initialData?.contentAr || "")
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false)
  const [isVisible, setIsVisible] = useState(initialData?.isVisible ?? false)
  const [heroMediaType, setHeroMediaType] = useState(initialData?.heroMediaType || "IMAGE")
  const [heroMediaUrl, setHeroMediaUrl] = useState(initialData?.heroMediaUrl || "")
  
  const [process, setProcess] = useState<any[]>(Array.isArray(initialData?.process) ? initialData.process : [])
  const [projects, setProjects] = useState<any[]>(Array.isArray(initialData?.projects) ? initialData.projects : [])
  const [gallery, setGallery] = useState<any[]>(Array.isArray(initialData?.gallery) ? initialData.gallery : [])

  const handleSave = async () => {
    if (!slug || !titleEn || !titleAr) {
      alert("Slug and Titles are required")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        slug, titleEn, titleAr, taglineEn, taglineAr, thumbnail, contentEn, contentAr,
        isFeatured, isVisible, isPublished: isVisible, heroMediaType, heroMediaUrl,
        process, projects, gallery
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
          body: JSON.stringify({ slug, titleEn, titleAr })
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

      router.push("/dashboard/b2b/services")
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  const updateArrayItem = (setter: any, array: any[], index: number, field: string, value: any) => {
    const newArr = [...array]
    newArr[index][field] = value
    setter(newArr)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[var(--surface-default)] p-4 rounded-2xl border border-[var(--border-default)] shadow-sm sticky top-6 z-30 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-[var(--surface-hover)] rounded-xl transition-colors text-[var(--text-secondary)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {isEditing ? "Edit Service" : "New Service"}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{titleEn || "Untitled"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-[var(--surface-subtle)] px-4 py-2 rounded-xl border border-[var(--border-default)]">
            <input 
              type="checkbox" 
              checked={isVisible}
              onChange={e => setIsVisible(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm font-bold text-[var(--text-primary)]">Visible</span>
          </label>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 rounded-xl h-10 px-6">
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          {["general", "hero", "process", "projects", "gallery"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                activeTab === tab 
                  ? "bg-[var(--color-primary)] text-white shadow-lg" 
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-6 md:p-8 min-h-[500px]">
          
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6 border-b border-[var(--border-default)] pb-4">Core Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Title (EN) *</label>
                  <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 focus:border-[var(--color-primary)] focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Title (AR) *</label>
                  <input type="text" dir="rtl" value={titleAr} onChange={e => setTitleAr(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 focus:border-[var(--color-primary)] focus:outline-none font-arabic" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Slug URL *</label>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-tertiary)] bg-[var(--surface-subtle)] px-4 py-3 rounded-xl border border-[var(--border-default)]">/b2b/services/</span>
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} className="flex-1 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 focus:border-[var(--color-primary)] focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tagline (EN)</label>
                  <textarea value={taglineEn} rows={2} onChange={e => setTaglineEn(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 focus:border-[var(--color-primary)] focus:outline-none resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tagline (AR)</label>
                  <textarea value={taglineAr} dir="rtl" rows={2} onChange={e => setTaglineAr(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 focus:border-[var(--color-primary)] focus:outline-none resize-none font-arabic" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Card Thumbnail</label>
                <MediaUploader value={thumbnail} onChange={setThumbnail} />
              </div>
            </div>
          )}

          {/* HERO TAB */}
          {activeTab === "hero" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6 border-b border-[var(--border-default)] pb-4">Hero Media</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Media Type</label>
                  <select value={heroMediaType} onChange={e => setHeroMediaType(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 focus:border-[var(--color-primary)] focus:outline-none">
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video File</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Hero Media URL</label>
                <MediaUploader value={heroMediaUrl} onChange={setHeroMediaUrl} />
              </div>
            </div>
          )}

          {/* PROCESS TAB */}
          {activeTab === "process" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-[var(--border-default)] pb-4">
                <h2 className="text-lg font-black">Process & Steps</h2>
                <Button onClick={() => setProcess([...process, { title: "", desc: "", icon: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Add Step
                </Button>
              </div>
              <div className="space-y-4">
                {process.map((step, index) => (
                  <div key={index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative group">
                    <button onClick={() => setProcess(process.filter((_, i) => i !== index))} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-12">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)]">Step Title</label>
                        <input type="text" value={step.title} onChange={e => updateArrayItem(setProcess, process, index, "title", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)]">Icon (Optional)</label>
                        <input type="text" value={step.icon} onChange={e => updateArrayItem(setProcess, process, index, "icon", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)]">Description</label>
                        <textarea value={step.desc} onChange={e => updateArrayItem(setProcess, process, index, "desc", e.target.value)} rows={2} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm resize-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === "projects" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-[var(--border-default)] pb-4">
                <h2 className="text-lg font-black">Related Projects</h2>
                <Button onClick={() => setProjects([...projects, { titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "", imageUrl: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Add Project
                </Button>
              </div>
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative group flex flex-col md:flex-row gap-6">
                    <button onClick={() => setProjects(projects.filter((_, i) => i !== index))} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-full md:w-1/3">
                      <label className="text-xs font-bold text-[var(--text-secondary)] mb-2 block">Project Image</label>
                      <MediaUploader value={project.imageUrl} onChange={url => updateArrayItem(setProjects, projects, index, "imageUrl", url)} />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Title (EN)" value={project.titleEn} onChange={e => updateArrayItem(setProjects, projects, index, "titleEn", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm font-bold" />
                        <input type="text" placeholder="Title (AR)" dir="rtl" value={project.titleAr} onChange={e => updateArrayItem(setProjects, projects, index, "titleAr", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm font-bold font-arabic" />
                        <textarea placeholder="Description (EN)" rows={3} value={project.descriptionEn} onChange={e => updateArrayItem(setProjects, projects, index, "descriptionEn", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm resize-none" />
                        <textarea placeholder="Description (AR)" dir="rtl" rows={3} value={project.descriptionAr} onChange={e => updateArrayItem(setProjects, projects, index, "descriptionAr", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm resize-none font-arabic" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === "gallery" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-[var(--border-default)] pb-4">
                <h2 className="text-lg font-black">Gallery</h2>
                <Button onClick={() => setGallery([...gallery, { url: "", captionEn: "", captionAr: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Add Media
                </Button>
              </div>
              <div className="space-y-4">
                {gallery.map((item, index) => (
                  <div key={index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative group">
                    <button onClick={() => setGallery(gallery.filter((_, i) => i !== index))} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-4">
                        <MediaUploader value={item.url} onChange={(url) => updateArrayItem(setGallery, gallery, index, "url", url)} />
                      </div>
                      <div className="md:col-span-8 space-y-4">
                        <input type="text" value={item.captionEn || ""} onChange={(e) => updateArrayItem(setGallery, gallery, index, "captionEn", e.target.value)} className="w-full px-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl text-sm outline-none" placeholder="Caption (EN)" />
                        <input type="text" dir="rtl" value={item.captionAr || ""} onChange={(e) => updateArrayItem(setGallery, gallery, index, "captionAr", e.target.value)} className="w-full px-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl text-sm outline-none font-arabic" placeholder="Caption (AR)" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
