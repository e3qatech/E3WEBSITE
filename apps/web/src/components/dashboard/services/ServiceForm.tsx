"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Eye, ArrowLeft, Image as ImageIcon, Settings, LayoutTemplate, Layers, Link as LinkIcon, Search, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Tabs, TabsContent } from "@/components/dashboard/ui/Tabs"
import { BilingualInput } from "@/components/dashboard/ui/BilingualInput"
import { RichTextEditor } from "@/components/dashboard/ui/RichTextEditor"
import { MediaUploader } from "@/components/dashboard/ui/MediaUploader"
import { Repeater } from "@/components/dashboard/ui/Repeater"

interface ServiceFormProps {
  initialData?: any
  isEdit?: boolean
}

const TABS = [
  { id: "basic", label: "Basic Details", icon: <Settings className="w-4 h-4" /> },
  { id: "content", label: "Content", icon: <LayoutTemplate className="w-4 h-4" /> },
  { id: "process", label: "Process", icon: <Layers className="w-4 h-4" /> },
  { id: "hero", label: "Hero Media", icon: <ImageIcon className="w-4 h-4" /> },
  { id: "gallery", label: "Gallery", icon: <ImageIcon className="w-4 h-4" /> },
  { id: "projects", label: "Projects", icon: <LinkIcon className="w-4 h-4" /> },
  { id: "cta", label: "CTA", icon: <LinkIcon className="w-4 h-4" /> },
  { id: "seo", label: "SEO", icon: <Search className="w-4 h-4" /> },
]

export function ServiceForm({ initialData, isEdit }: ServiceFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Form State
  const [formData, setFormData] = useState(initialData || {
    nameEn: "", nameAr: "",
    slug: "",
    taglineEn: "", taglineAr: "",
    status: "Hidden", featured: false, order: 0,
    descriptionEn: "", descriptionAr: "",
    processSteps: [],
    heroType: "IMAGE", heroMediaUrl: "",
    gallery: [],
    similarProjects: [],
    ctaLabelEn: "", ctaLabelAr: "", ctaType: "Contact",
    seoTitleEn: "", seoTitleAr: "", seoDescEn: "", seoDescAr: "", seoOgImage: ""
  })

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Mock save delay
    await new Promise(r => setTimeout(r, 1000))
    setIsSaving(false)
    setIsDirty(false)
    router.push("/dashboard/b2b/services")
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-32">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">
              {isEdit ? 'Edit Service' : 'New Service'}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {isDirty ? 'Unsaved changes' : 'All changes saved'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isEdit && (
            <Button variant="outline" className="gap-2" onClick={() => window.open(`/en/b2b/services/${formData.slug}`, '_blank')}>
              <Eye className="w-4 h-4" /> Preview
            </Button>
          )}
          <Button onClick={handleSave} isLoading={isSaving} className="gap-2">
            <Save className="w-4 h-4" /> Save Service
          </Button>
        </div>
      </div>

      <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)]">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        
        <div className="p-6 md:p-8">
          
          {/* TAB 1: BASIC DETAILS */}
          <TabsContent value="basic" activeTab={activeTab}>
            <div className="space-y-8 max-w-3xl">
              <BilingualInput 
                label="Service Name" required
                valueEn={formData.nameEn} onChangeEn={v => {
                  updateField('nameEn', v)
                  if (!isEdit) updateField('slug', v.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
                }}
                valueAr={formData.nameAr} onChangeAr={v => updateField('nameAr', v)}
              />
              
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">URL Slug</label>
                <Input 
                  value={formData.slug} 
                  onChange={e => updateField('slug', e.target.value)} 
                  placeholder="e.g. event-engineering" 
                />
              </div>

              <BilingualInput 
                label="Tagline" type="textarea"
                valueEn={formData.taglineEn} onChangeEn={v => updateField('taglineEn', v)}
                valueAr={formData.taglineAr} onChangeAr={v => updateField('taglineAr', v)}
              />

              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[var(--border-default)]">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-[var(--text-secondary)]">Status</label>
                  <select 
                    value={formData.status} onChange={e => updateField('status', e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl text-sm"
                  >
                    <option value="Visible">Visible</option>
                    <option value="Hidden">Hidden</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-[var(--text-secondary)]">Featured</label>
                  <select 
                    value={formData.featured ? "Yes" : "No"} onChange={e => updateField('featured', e.target.value === "Yes")}
                    className="w-full px-4 py-3 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-[var(--text-secondary)]">Sort Order</label>
                  <Input type="number" value={formData.order} onChange={e => updateField('order', parseInt(e.target.value))} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: CONTENT */}
          <TabsContent value="content" activeTab={activeTab}>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">English Description</label>
                <RichTextEditor value={formData.descriptionEn} onChange={v => updateField('descriptionEn', v)} />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">Arabic Description</label>
                <RichTextEditor value={formData.descriptionAr} onChange={v => updateField('descriptionAr', v)} dir="rtl" />
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: PROCESS */}
          <TabsContent value="process" activeTab={activeTab}>
            <div className="max-w-4xl">
              <Repeater 
                items={formData.processSteps}
                onReorder={items => updateField('processSteps', items)}
                onAdd={() => updateField('processSteps', [...formData.processSteps, { id: Math.random().toString(), titleEn: "", titleAr: "", descEn: "", descAr: "" }])}
                onRemove={id => updateField('processSteps', formData.processSteps.filter((i: any) => i.id !== id))}
                addLabel="Add Process Step"
                renderItem={(item: any, index) => (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Step {index + 1}</h4>
                    <BilingualInput 
                      label="Title"
                      valueEn={item.titleEn} onChangeEn={v => {
                        const newSteps = [...formData.processSteps]; newSteps[index].titleEn = v; updateField('processSteps', newSteps)
                      }}
                      valueAr={item.titleAr} onChangeAr={v => {
                        const newSteps = [...formData.processSteps]; newSteps[index].titleAr = v; updateField('processSteps', newSteps)
                      }}
                    />
                    <BilingualInput 
                      label="Description" type="textarea"
                      valueEn={item.descEn} onChangeEn={v => {
                        const newSteps = [...formData.processSteps]; newSteps[index].descEn = v; updateField('processSteps', newSteps)
                      }}
                      valueAr={item.descAr} onChangeAr={v => {
                        const newSteps = [...formData.processSteps]; newSteps[index].descAr = v; updateField('processSteps', newSteps)
                      }}
                    />
                  </div>
                )}
              />
            </div>
          </TabsContent>

          {/* TAB 4: HERO MEDIA */}
          <TabsContent value="hero" activeTab={activeTab}>
            <div className="space-y-8 max-w-2xl">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">Media Type</label>
                <select 
                  value={formData.heroType} onChange={e => updateField('heroType', e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl text-sm"
                >
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                  <option value="MODEL_3D">3D Model (.glb/.gltf)</option>
                  <option value="IFRAME">External iFrame</option>
                </select>
              </div>

              {formData.heroType === "IFRAME" ? (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-[var(--text-secondary)]">iFrame URL</label>
                  <Input value={formData.heroMediaUrl} onChange={e => updateField('heroMediaUrl', e.target.value)} placeholder="https://..." />
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-[var(--text-secondary)]">Upload Media</label>
                  <MediaUploader onUploadComplete={(urls) => updateField('heroMediaUrl', urls[0])} />
                  {formData.heroMediaUrl && (
                    <div className="mt-4 p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-hover)] flex items-center justify-between">
                      <span className="text-sm truncate">{formData.heroMediaUrl}</span>
                      <Button variant="ghost" size="sm" onClick={() => updateField('heroMediaUrl', '')}>Clear</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 5-8: Placeholders for brevity but following same patterns */}
          <TabsContent value="gallery" activeTab={activeTab}>
            <div className="max-w-2xl">
              <MediaUploader multiple onUploadComplete={(urls) => updateField('gallery', [...formData.gallery, ...urls])} />
              <div className="grid grid-cols-3 gap-4 mt-8">
                {formData.gallery.map((url: string, i: number) => (
                  <div key={i} className="aspect-square bg-[var(--surface-hover)] rounded-xl border border-[var(--border-default)] overflow-hidden relative group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => updateField('gallery', formData.gallery.filter((_: any, idx: number) => idx !== i))}
                      className="absolute top-2 end-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projects" activeTab={activeTab}>
            <p className="text-[var(--text-secondary)]">Link existing case studies here using the Repeater component.</p>
          </TabsContent>

          <TabsContent value="cta" activeTab={activeTab}>
            <div className="max-w-2xl space-y-6">
              <BilingualInput 
                label="Primary CTA Label"
                valueEn={formData.ctaLabelEn} onChangeEn={v => updateField('ctaLabelEn', v)}
                valueAr={formData.ctaLabelAr} onChangeAr={v => updateField('ctaLabelAr', v)}
              />
            </div>
          </TabsContent>

          <TabsContent value="seo" activeTab={activeTab}>
            <div className="max-w-3xl space-y-8">
              <BilingualInput 
                label="Meta Title"
                valueEn={formData.seoTitleEn} onChangeEn={v => updateField('seoTitleEn', v)}
                valueAr={formData.seoTitleAr} onChangeAr={v => updateField('seoTitleAr', v)}
              />
              <BilingualInput 
                label="Meta Description" type="textarea"
                valueEn={formData.seoDescEn} onChangeEn={v => updateField('seoDescEn', v)}
                valueAr={formData.seoDescAr} onChangeAr={v => updateField('seoDescAr', v)}
              />
            </div>
          </TabsContent>

        </div>
      </div>
    </div>
  )
}
