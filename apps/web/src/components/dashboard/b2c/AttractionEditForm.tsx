"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Save, 
  Eye, 
  ArrowLeft,
  Settings,
  Image as ImageIcon,
  Images,
  Ticket,
  Gift,
  Share2,
  Smartphone,
  MapPin,
  Clock,
  Briefcase,
  HelpCircle,
  Search,
  Box
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { TipTapEditor } from "@/components/shared/TipTapEditor"
import { MediaUploader } from "@/components/shared/MediaUploader"
import { RepeaterField } from "@/components/shared/RepeaterField"

export function AttractionEditForm({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    nameEn: initialData.nameEn || "",
    nameAr: initialData.nameAr || "",
    slug: initialData.slug || "",
    descriptionEn: initialData.descriptionEn || "",
    descriptionAr: initialData.descriptionAr || "",
    isPublished: initialData.isPublished || false,
    isFeatured: initialData.isFeatured || false,
    isHidden: initialData.isHidden || false,
    heroMediaType: initialData.heroMediaType || "IMAGE",
    heroMediaUrl: initialData.heroMediaUrl || "",
    coordinates: initialData.coordinates || { lat: 0, lng: 0 },
    features: initialData.features || []
  })

  // Repeaters
  const [gallery, setGallery] = useState<any[]>(
    Array.isArray(initialData.gallery) ? initialData.gallery.map((g: any) => ({ id: Math.random().toString(), ...g })) : []
  )
  const [pricing, setPricing] = useState<any[]>(
    Array.isArray(initialData.pricing) ? initialData.pricing.map((p: any) => ({ id: Math.random().toString(), ...p })) : []
  )
  const [offers, setOffers] = useState<any[]>(
    Array.isArray(initialData.offers) ? initialData.offers.map((o: any) => ({ id: Math.random().toString(), ...o })) : []
  )
  const [faqs, setFaqs] = useState<any[]>(
    Array.isArray(initialData.faqs) ? initialData.faqs.map((f: any) => ({ id: Math.random().toString(), ...f })) : []
  )
  const [socialLinks, setSocialLinks] = useState<any[]>(
    Array.isArray(initialData.socialLinks) ? initialData.socialLinks.map((s: any) => ({ id: Math.random().toString(), ...s })) : []
  )
  const [temporalRules, setTemporalRules] = useState<any[]>(
    Array.isArray(initialData.temporalRules) ? initialData.temporalRules.map((t: any) => ({ id: Math.random().toString(), ...t })) : []
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
        gallery,
        pricing,
        offers,
        faqs,
        socialLinks,
        temporalRules
      }
      
      const res = await fetch(`/api/b2c/attractions/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Failed to save")
      
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: "basic", label: "Basic Details", icon: Settings },
    { id: "features", label: "What's Inside", icon: Box },
    { id: "hero", label: "Hero Media", icon: ImageIcon },
    { id: "gallery", label: "Gallery", icon: Images },
    { id: "pricing", label: "Pricing & Tickets", icon: Ticket },
    { id: "offers", label: "Partner Offers", icon: Gift },
    { id: "social", label: "Social Links", icon: Share2 },
    { id: "maps", label: "Booking & Maps", icon: MapPin },
    { id: "rules", label: "Temporal Rules", icon: Clock },
    { id: "faq", label: "FAQ", icon: HelpCircle },
    { id: "seo", label: "SEO", icon: Search },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Sticky Header */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-[var(--surface-default)] border-b border-[var(--border-default)] shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/b2c/attractions')}>
            <ArrowLeft className="w-4 h-4 me-2" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-black text-[var(--text-primary)]">Edit Attraction: {formData.nameEn}</h1>
            {hasUnsavedChanges && <span className="text-xs font-bold text-[var(--color-warning)]">Unsaved changes</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <a href={`/en/b2c/attractions/${formData.slug}`} target="_blank" rel="noreferrer">
              <Eye className="w-4 h-4 me-2" /> Preview
            </a>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 me-2" /> {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-64 bg-[var(--surface-default)] border-e border-[var(--border-default)] p-4 overflow-y-auto hidden md:block shrink-0">
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
                    <label className="text-sm font-bold">Name (EN)</label>
                    <input type="text" value={formData.nameEn} onChange={e => handleChange('nameEn', e.target.value)} className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]" />
                  </div>
                  <div className="space-y-2" dir="rtl">
                    <label className="text-sm font-bold">Name (AR)</label>
                    <input type="text" value={formData.nameAr} onChange={e => handleChange('nameAr', e.target.value)} className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-right" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">URL Slug</label>
                  <input type="text" value={formData.slug} onChange={e => handleChange('slug', e.target.value)} className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Description (EN)</label>
                  <TipTapEditor value={formData.descriptionEn} onChange={v => handleChange('descriptionEn', v)} dir="ltr" />
                </div>

                <div className="space-y-2" dir="rtl">
                  <label className="text-sm font-bold">Description (AR)</label>
                  <TipTapEditor value={formData.descriptionAr} onChange={v => handleChange('descriptionAr', v)} dir="rtl" />
                </div>

                <div className="flex gap-8 pt-4 border-t border-[var(--border-default)]">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isPublished} onChange={e => handleChange('isPublished', e.target.checked)} className="w-5 h-5 rounded border-[var(--border-default)] text-[var(--color-primary)]" />
                    <span className="font-bold">Published</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isHidden} onChange={e => handleChange('isHidden', e.target.checked)} className="w-5 h-5 rounded border-[var(--border-default)] text-[var(--color-primary)]" />
                    <span className="font-bold">Hidden from Listings</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.isFeatured} onChange={e => handleChange('isFeatured', e.target.checked)} className="w-5 h-5 rounded border-[var(--border-default)] text-[var(--color-primary)]" />
                    <span className="font-bold">Featured Attraction</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB: HERO MEDIA */}
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
                    <option value="MODEL_3D">3D Model</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Media Source (Upload or URL)</label>
                  {formData.heroMediaType === 'IFRAME' ? (
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

            {/* TAB: PRICING */}
            {activeTab === "pricing" && (
              <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8">
                <h2 className="text-lg font-black text-[var(--text-primary)] mb-6">Pricing & Tickets</h2>
                <RepeaterField
                  items={pricing}
                  setItems={(items) => { setPricing(items); setHasUnsavedChanges(true) }}
                  onAdd={() => {
                    setPricing([...pricing, { id: Math.random().toString(), titleEn: "", titleAr: "", price: 0, currency: "QAR", type: "GENERAL" }])
                    setHasUnsavedChanges(true)
                  }}
                  addLabel="Add Ticket Tier"
                  renderItem={(item, index, update) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <input placeholder="Tier Title (EN)" value={item.titleEn} onChange={e => update({ titleEn: e.target.value })} className="w-full px-3 py-2 rounded bg-[var(--surface-hover)] border border-[var(--border-default)]" />
                      <input placeholder="Tier Title (AR)" value={item.titleAr} onChange={e => update({ titleAr: e.target.value })} dir="rtl" className="w-full px-3 py-2 rounded bg-[var(--surface-hover)] border border-[var(--border-default)] text-right" />
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="Price" value={item.price} onChange={e => update({ price: e.target.value })} className="w-full px-3 py-2 rounded bg-[var(--surface-hover)] border border-[var(--border-default)]" />
                        <select value={item.currency} onChange={e => update({ currency: e.target.value })} className="px-3 py-2 rounded bg-[var(--surface-hover)] border border-[var(--border-default)]">
                          <option value="QAR">QAR</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>
                      <select value={item.type} onChange={e => update({ type: e.target.value })} className="px-3 py-2 rounded bg-[var(--surface-hover)] border border-[var(--border-default)]">
                        <option value="GENERAL">General Admission</option>
                        <option value="VIP">VIP</option>
                        <option value="CHILD">Child</option>
                        <option value="FAMILY">Family Package</option>
                      </select>
                    </div>
                  )}
                />
              </div>
            )}

            {/* TAB: FAQ */}
            {activeTab === "faq" && (
              <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl p-6 md:p-8">
                <h2 className="text-lg font-black text-[var(--text-primary)] mb-6">Frequently Asked Questions</h2>
                <RepeaterField
                  items={faqs}
                  setItems={(items) => { setFaqs(items); setHasUnsavedChanges(true) }}
                  onAdd={() => {
                    setFaqs([...faqs, { id: Math.random().toString(), questionEn: "", questionAr: "", answerEn: "", answerAr: "" }])
                    setHasUnsavedChanges(true)
                  }}
                  addLabel="Add FAQ"
                  renderItem={(item, index, update) => (
                    <div className="grid grid-cols-1 gap-4 w-full">
                      <input placeholder="Question (EN)" value={item.questionEn} onChange={e => update({ questionEn: e.target.value })} className="w-full px-3 py-2 rounded bg-[var(--surface-hover)] border border-[var(--border-default)] font-bold" />
                      <TipTapEditor value={item.answerEn} onChange={v => update({ answerEn: v })} dir="ltr" placeholder="Answer (EN)" />
                      <div className="h-px bg-[var(--border-default)] my-2" />
                      <input placeholder="Question (AR)" value={item.questionAr} onChange={e => update({ questionAr: e.target.value })} dir="rtl" className="w-full px-3 py-2 rounded bg-[var(--surface-hover)] border border-[var(--border-default)] text-right font-bold" />
                      <TipTapEditor value={item.answerAr} onChange={v => update({ answerAr: v })} dir="rtl" placeholder="Answer (AR)" />
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
