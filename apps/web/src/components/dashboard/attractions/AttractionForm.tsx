"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Save, Eye, ArrowLeft, Image as ImageIcon, Settings, LayoutTemplate, Layers, Link as LinkIcon, Search, HelpCircle, Map, DollarSign, Users, Clock, Share2, X
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Tabs, TabsContent } from "@/components/dashboard/ui/Tabs"
import { BilingualInput } from "@/components/dashboard/ui/BilingualInput"
import { RichTextEditor } from "@/components/dashboard/ui/RichTextEditor"
import { MediaUploader } from "@/components/dashboard/ui/MediaUploader"
import { Repeater } from "@/components/dashboard/ui/Repeater"

interface AttractionFormProps {
  initialData?: any
  isEdit?: boolean
}

const TABS = [
  { id: "basic", label: "Basic", icon: <Settings className="w-4 h-4" /> },
  { id: "inside", label: "What's Inside", icon: <LayoutTemplate className="w-4 h-4" /> },
  { id: "hero", label: "Hero Media", icon: <ImageIcon className="w-4 h-4" /> },
  { id: "gallery", label: "Gallery", icon: <ImageIcon className="w-4 h-4" /> },
  { id: "pricing", label: "Pricing", icon: <DollarSign className="w-4 h-4" /> },
  { id: "partners", label: "Partners", icon: <Users className="w-4 h-4" /> },
  { id: "social", label: "Social Links", icon: <LinkIcon className="w-4 h-4" /> },
  { id: "social_prev", label: "Social Previews", icon: <Share2 className="w-4 h-4" /> },
  { id: "booking", label: "Booking & Maps", icon: <Map className="w-4 h-4" /> },
  { id: "temporal", label: "Temporal Rules", icon: <Clock className="w-4 h-4" /> },
  { id: "operations", label: "Operations", icon: <Layers className="w-4 h-4" /> },
  { id: "faq", label: "FAQ", icon: <HelpCircle className="w-4 h-4" /> },
  { id: "seo", label: "SEO", icon: <Search className="w-4 h-4" /> },
]

export function AttractionForm({ initialData, isEdit }: AttractionFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Form State
  const [formData, setFormData] = useState(initialData || {
    nameEn: "", nameAr: "",
    slug: "",
    taglineEn: "", taglineAr: "",
    status: "Upcoming", featured: false, order: 0,
    descriptionEn: "", descriptionAr: "",
    whatsInside: [],
    heroType: "IMAGE", heroMediaUrl: "",
    gallery: [],
    pricing: [],
    partners: [],
    socialLinks: [],
    socialPreviews: [],
    bookingUrl: "", mapUrl: "", addressEn: "", addressAr: "", lat: "", lng: "",
    temporalRules: [],
    opsDefaultHours: "", opsMaxCapacity: 1000, opsAvgDuration: 120, opsIotId: "",
    faq: [],
    seoTitleEn: "", seoTitleAr: "", seoDescEn: "", seoDescAr: "", seoOgImage: ""
  })

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
    await new Promise(r => setTimeout(r, 1000))
    setIsSaving(false)
    setIsDirty(false)
    router.push("/dashboard/b2c/attractions")
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-32">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">
              {isEdit ? 'Edit Attraction' : 'New Attraction'}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {isDirty ? 'Unsaved changes' : 'All changes saved'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isEdit && (
            <Button variant="outline" className="gap-2" onClick={() => window.open(`/en/b2c/attractions/${formData.slug}`, '_blank')}>
              <Eye className="w-4 h-4" /> Preview
            </Button>
          )}
          <Button onClick={handleSave} isLoading={isSaving} className="gap-2">
            <Save className="w-4 h-4" /> Save Attraction
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
                label="Attraction Name" required
                valueEn={formData.nameEn} onChangeEn={v => {
                  updateField('nameEn', v)
                  if (!isEdit) updateField('slug', v.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
                }}
                valueAr={formData.nameAr} onChangeAr={v => updateField('nameAr', v)}
              />
              
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">URL Slug</label>
                <Input value={formData.slug} onChange={e => updateField('slug', e.target.value)} placeholder="e.g. winter-wonderland" />
              </div>

              <BilingualInput 
                label="Tagline" type="textarea"
                valueEn={formData.taglineEn} onChangeEn={v => updateField('taglineEn', v)}
                valueAr={formData.taglineAr} onChangeAr={v => updateField('taglineAr', v)}
              />

              <div className="space-y-3">
                <label className="block text-sm font-bold text-[var(--text-secondary)]">Status</label>
                <select 
                  value={formData.status} onChange={e => updateField('status', e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl text-sm"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

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

          {/* TAB 2: WHATS INSIDE */}
          <TabsContent value="inside" activeTab={activeTab}>
            <div className="max-w-4xl">
              <Repeater 
                items={formData.whatsInside}
                onReorder={items => updateField('whatsInside', items)}
                onAdd={() => updateField('whatsInside', [...formData.whatsInside, { id: Math.random().toString(), titleEn: "", titleAr: "", descEn: "", descAr: "", icon: "", image: "" }])}
                onRemove={id => updateField('whatsInside', formData.whatsInside.filter((i: any) => i.id !== id))}
                addLabel="Add Feature"
                renderItem={(item: any, index) => (
                  <div className="space-y-4">
                    <BilingualInput 
                      label="Feature Title"
                      valueEn={item.titleEn} onChangeEn={v => { const n = [...formData.whatsInside]; n[index].titleEn = v; updateField('whatsInside', n) }}
                      valueAr={item.titleAr} onChangeAr={v => { const n = [...formData.whatsInside]; n[index].titleAr = v; updateField('whatsInside', n) }}
                    />
                    <BilingualInput 
                      label="Description" type="textarea"
                      valueEn={item.descEn} onChangeEn={v => { const n = [...formData.whatsInside]; n[index].descEn = v; updateField('whatsInside', n) }}
                      valueAr={item.descAr} onChangeAr={v => { const n = [...formData.whatsInside]; n[index].descAr = v; updateField('whatsInside', n) }}
                    />
                  </div>
                )}
              />
            </div>
          </TabsContent>

          {/* TAB 12: FAQ */}
          <TabsContent value="faq" activeTab={activeTab}>
            <div className="max-w-4xl">
              <Repeater 
                items={formData.faq}
                onReorder={items => updateField('faq', items)}
                onAdd={() => updateField('faq', [...formData.faq, { id: Math.random().toString(), qEn: "", qAr: "", aEn: "", aAr: "" }])}
                onRemove={id => updateField('faq', formData.faq.filter((i: any) => i.id !== id))}
                addLabel="Add FAQ"
                renderItem={(item: any, index) => (
                  <div className="space-y-4">
                    <BilingualInput 
                      label="Question"
                      valueEn={item.qEn} onChangeEn={v => { const n = [...formData.faq]; n[index].qEn = v; updateField('faq', n) }}
                      valueAr={item.qAr} onChangeAr={v => { const n = [...formData.faq]; n[index].qAr = v; updateField('faq', n) }}
                    />
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-[var(--text-secondary)]">Answer (English)</label>
                      <RichTextEditor value={item.aEn} onChange={v => { const n = [...formData.faq]; n[index].aEn = v; updateField('faq', n) }} />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-[var(--text-secondary)]">Answer (Arabic)</label>
                      <RichTextEditor value={item.aAr} onChange={v => { const n = [...formData.faq]; n[index].aAr = v; updateField('faq', n) }} dir="rtl" />
                    </div>
                  </div>
                )}
              />
            </div>
          </TabsContent>

          {/* Other tabs omitted for brevity but they follow the same pattern using the shared primitives */}
          <TabsContent value="hero" activeTab={activeTab}>
            <p className="text-[var(--text-secondary)]">Hero Media config goes here.</p>
          </TabsContent>
          <TabsContent value="gallery" activeTab={activeTab}>
            <p className="text-[var(--text-secondary)]">Gallery uploader goes here.</p>
          </TabsContent>
          <TabsContent value="pricing" activeTab={activeTab}>
            <p className="text-[var(--text-secondary)]">Ticket pricing repeater goes here.</p>
          </TabsContent>
          <TabsContent value="partners" activeTab={activeTab}>
            <p className="text-[var(--text-secondary)]">Partner offers repeater goes here.</p>
          </TabsContent>
          <TabsContent value="booking" activeTab={activeTab}>
            <p className="text-[var(--text-secondary)]">BookingQube and Map configs go here.</p>
          </TabsContent>

        </div>
      </div>
    </div>
  )
}
