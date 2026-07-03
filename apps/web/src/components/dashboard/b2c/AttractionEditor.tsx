"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Save, ArrowLeft, Settings, DollarSign, HelpCircle, 
  Plus, Trash2, Image as ImageIcon, MapPin, Share2, 
  Users, CheckCircle2, List, Calendar
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MediaUploader } from "@/components/ui/MediaUploader"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useEffect } from "react"

export function AttractionEditor({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const isEditing = !!initialData
  
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  
  // 1. Core Details
  const [nameEn, setNameEn] = useState(initialData?.nameEn || "")
  const [nameAr, setNameAr] = useState(initialData?.nameAr || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [taglineEn, setTaglineEn] = useState(initialData?.taglineEn || "")
  const [taglineAr, setTaglineAr] = useState(initialData?.taglineAr || "")
  const [descriptionEn, setDescriptionEn] = useState(initialData?.descriptionEn || "")
  const [descriptionAr, setDescriptionAr] = useState(initialData?.descriptionAr || "")
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false)
  const [isHidden, setIsHidden] = useState(initialData?.isHidden ?? false)

  // 2. Hero Media
  const [heroMediaType, setHeroMediaType] = useState(initialData?.heroMediaType || "IMAGE")
  const [heroMediaUrl, setHeroMediaUrl] = useState(initialData?.heroMediaUrl || "")
  const [heroFallbackUrl, setHeroFallbackUrl] = useState(initialData?.heroFallbackUrl || "")
  const [heroThumbnailUrl, setHeroThumbnailUrl] = useState(initialData?.heroThumbnailUrl || "")
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "")

  // 3. What's Inside (Features)
  const [features, setFeatures] = useState<any[]>(
    Array.isArray(initialData?.features) ? initialData.features : []
  )

  // 4. Pricing & Tickets
  const [pricing, setPricing] = useState<any[]>(initialData?.pricing || [])

  // 5. Partners
  const [partnerOffers, setPartnerOffers] = useState<any[]>(
    Array.isArray(initialData?.partnerOffers) ? initialData.partnerOffers : []
  )
  const [partners, setPartners] = useState<any[]>(
    Array.isArray(initialData?.partners) ? initialData.partners : []
  )

  // 6. Social & News
  const [socialLinks, setSocialLinks] = useState<any[]>(initialData?.socialLinks || [])
  const [socialPreviews, setSocialPreviews] = useState<any[]>(
    Array.isArray(initialData?.socialPreviews) ? initialData.socialPreviews : []
  )
  const [newsCoverage, setNewsCoverage] = useState<any[]>(
    Array.isArray(initialData?.newsCoverage) ? initialData.newsCoverage : []
  )

  // 7. Booking & Ops
  const [mapUrl, setMapUrl] = useState(initialData?.mapUrl || "")
  const [ticketingUrl, setTicketingUrl] = useState(initialData?.ticketingUrl || "")
  const [operations, setOperations] = useState<any>(
    initialData?.operations || { venueName: "", ageGroup: "", hours: "", schedules: [], contactDetails: { phone: "", email: "", whatsapp: "", chatLink: "" } }
  )
  const [temporalStatus, setTemporalStatus] = useState<any>(
    initialData?.temporalStatus || { isPermanent: true, startDate: "", endDate: "", statusOverride: "", isSpecialEvent: false }
  )
  const [testimonials, setTestimonials] = useState<any[]>(
    Array.isArray(initialData?.testimonials) ? initialData.testimonials : []
  )

  // 8. FAQs
  const [faqs, setFaqs] = useState<any[]>(initialData?.faqs || [])

  // 9. Gallery
  const [gallery, setGallery] = useState<any[]>(initialData?.gallery || [])

  const [errors, setErrors] = useState<string[]>([])

  const currentData = JSON.stringify({
    nameEn, nameAr, slug, taglineEn, taglineAr, descriptionEn, descriptionAr,
    isPublished, isFeatured, isHidden,
    heroMediaType, heroMediaUrl, heroFallbackUrl, heroThumbnailUrl, logoUrl,
    features, pricing, partnerOffers, partners, socialLinks, socialPreviews, newsCoverage,
    mapUrl, ticketingUrl, operations, temporalStatus, faqs, testimonials, gallery
  })
  const [initialDataStr] = useState(currentData)
  const isDirty = currentData !== initialDataStr

  useEffect(() => {
    if (!isDirty) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const handleSave = async () => {
    const newErrors = []
    if (!nameEn) newErrors.push("nameEn")
    if (!slug) newErrors.push("slug")
    
    if (newErrors.length > 0) {
      setActiveTab("general")
      setErrors(newErrors)
      setTimeout(() => setErrors([]), 800)
      return
    }
    
    setIsSaving(true)
    try {
      const payload = {
        nameEn, nameAr, slug, taglineEn, taglineAr, descriptionEn, descriptionAr,
        isPublished, isFeatured, isHidden,
        heroMediaType, heroMediaUrl, heroFallbackUrl, heroThumbnailUrl, logoUrl,
        features,
        pricing,
        partnerOffers, partners,
        socialLinks, socialPreviews, newsCoverage,
        mapUrl, ticketingUrl, operations, temporalStatus,
        faqs, testimonials, gallery
      }
      
      const url = isEditing 
        ? `/api/b2c/attractions/${initialData.id}/full` 
        : `/api/b2c/attractions`
        
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) throw new Error("Failed to save")
      
      router.push("/dashboard/b2c/attractions")
      router.refresh()
    } catch (error) {
      alert("Error saving attraction")
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: "general", label: "Core Details", icon: Settings },
    { id: "hero", label: "Hero Media", icon: ImageIcon },
    { id: "features", label: "What's Inside", icon: List },
    { id: "pricing", label: "Pricing & Tickets", icon: DollarSign },
    { id: "partners", label: "Partners", icon: Users },
    { id: "social", label: "Social & News", icon: Share2 },
    { id: "ops", label: "Booking & Ops", icon: MapPin },
    { id: "visibility", label: "Visibility", icon: Calendar },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    { id: "faqs", label: "FAQs", icon: HelpCircle },
  ]

  // Helper for generic array updates
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
            onClick={() => {
              if (isDirty && !window.confirm("You have unsaved changes. Discard them?")) return;
              router.back()
            }}
            className="p-2 hover:bg-[var(--surface-hover)] rounded-xl transition-colors text-[var(--text-secondary)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {isEditing ? "Edit Attraction Microsite" : "New Attraction Microsite"}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{nameEn || "Untitled"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-[var(--surface-subtle)] px-4 py-2 rounded-xl border border-[var(--border-default)]">
            <input 
              type="checkbox" 
              checked={isPublished}
              onChange={e => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <span className="text-sm font-bold text-[var(--text-primary)]">Published</span>
          </label>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left",
                  activeTab === tab.id 
                    ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20 translate-x-1" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl shadow-sm p-6 md:p-8 min-h-[600px]">
          
          {/* 1. CORE DETAILS */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6">Core Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div animate={{ x: errors.includes("nameEn") ? [0, -10, 10, -10, 10, 0] : 0 }} transition={{ duration: 0.4 }} className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Attraction Name (EN) *</label>
                  <input type="text" value={nameEn}
                    onChange={e => {
                      setNameEn(e.target.value)
                      if (!isEditing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
                    }}
                    className={cn(
                      "w-full bg-[var(--surface-subtle)] border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors",
                      errors.includes("nameEn") ? "border-[var(--color-error)] focus:border-[var(--color-error)]" : "border-[var(--border-default)] focus:border-[var(--color-primary)]"
                    )}
                  />
                </motion.div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Attraction Name (AR)</label>
                  <input type="text" dir="rtl" value={nameAr} onChange={e => setNameAr(e.target.value)}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none transition-colors text-right"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tagline (EN)</label>
                  <input type="text" value={taglineEn} onChange={e => setTaglineEn(e.target.value)}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tagline (AR)</label>
                  <input type="text" dir="rtl" value={taglineAr} onChange={e => setTaglineAr(e.target.value)}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none transition-colors text-right"
                  />
                </div>
                <motion.div animate={{ x: errors.includes("slug") ? [0, -10, 10, -10, 10, 0] : 0 }} transition={{ duration: 0.4 }} className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">URL Slug *</label>
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
                    className={cn(
                      "w-full bg-[var(--surface-subtle)] border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none transition-colors",
                      errors.includes("slug") ? "border-[var(--color-error)] focus:border-[var(--color-error)]" : "border-[var(--border-default)] focus:border-[var(--color-primary)]"
                    )}
                  />
                </motion.div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Description (EN)</label>
                  <textarea value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} rows={5}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none resize-y"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Description (AR)</label>
                  <textarea dir="rtl" value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} rows={5}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none resize-y text-right"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. HERO MEDIA */}
          {activeTab === "hero" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6">Hero Media Controller</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 block">Media Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["IMAGE", "VIDEO", "MODEL_3D", "IFRAME"].map(type => (
                      <button key={type} onClick={() => setHeroMediaType(type)}
                        className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                          heroMediaType === type 
                          ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]' 
                          : 'bg-[var(--surface-subtle)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--color-primary)]/50'
                        }`}
                      >
                        {type.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Primary Media Source (Upload or URL)</label>
                  {heroMediaType === 'IFRAME' ? (
                    <input 
                      type="text" 
                      value={heroMediaUrl || ''} 
                      onChange={e => setHeroMediaUrl(e.target.value)} 
                      placeholder="https://my.spline.design/..." 
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                    />
                  ) : (
                    <div className="space-y-4">
                      <MediaUploader 
                        value={heroMediaUrl} 
                        onChange={(url) => {
                          setHeroMediaUrl(url);
                          // Distribute accordingly
                          if (heroMediaType === 'IMAGE') {
                            if (!heroFallbackUrl) setHeroFallbackUrl(url);
                            if (!heroThumbnailUrl) setHeroThumbnailUrl(url);
                            if (!logoUrl) setLogoUrl(url);
                          } else if (heroMediaType === 'VIDEO' || heroMediaType === 'MODEL_3D') {
                            // Even if it's video/3D, they might want the URL for thumbnail or we don't overwrite if it's not an image.
                            // But usually, video is just the primary media.
                          }
                        }}
                        accept={heroMediaType === 'VIDEO' ? "video/*" : heroMediaType === 'MODEL_3D' ? ".glb,.gltf" : "image/*"}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase whitespace-nowrap">OR EXTERNAL URL:</span>
                        <input 
                          type="text" 
                          value={heroMediaUrl || ''} 
                          onChange={e => setHeroMediaUrl(e.target.value)} 
                          onBlur={e => {
                            const url = e.target.value;
                            if (url && heroMediaType === 'IMAGE') {
                              if (!heroFallbackUrl) setHeroFallbackUrl(url);
                              if (!heroThumbnailUrl) setHeroThumbnailUrl(url);
                              if (!logoUrl) setLogoUrl(url);
                            }
                          }}
                          placeholder="https://..." 
                          className="flex-1 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none" 
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Fallback Image URL</label>
                    <MediaUploader value={heroFallbackUrl} onChange={setHeroFallbackUrl} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Thumbnail Image URL</label>
                    <MediaUploader value={heroThumbnailUrl} onChange={setHeroThumbnailUrl} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Attraction Logo URL</label>
                    <MediaUploader value={logoUrl} onChange={setLogoUrl} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. WHAT'S INSIDE */}
          {activeTab === "features" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black">What's Inside</h2>
                <Button type="button" onClick={() => setFeatures([...features, { id: Date.now(), title: "", description: "", imageUrl: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Add Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {features.map((item, index) => (
                  <div key={item.id || index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative">
                    <button type="button" onClick={() => setFeatures(features.filter((_, i) => i !== index))} className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Item Title</label>
                        <input type="text" value={item.title} onChange={e => updateArrayItem(setFeatures, features, index, "title", e.target.value)}
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Media URL</label>
                        <MediaUploader value={item.imageUrl} onChange={val => updateArrayItem(setFeatures, features, index, "imageUrl", val)} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Short Description</label>
                        <textarea value={item.description} onChange={e => updateArrayItem(setFeatures, features, index, "description", e.target.value)} rows={2}
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {features.length === 0 && <div className="text-center py-12 border-2 border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-tertiary)] font-medium">No items added.</div>}
              </div>
            </div>
          )}

          {/* 4. PRICING */}
          {activeTab === "pricing" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black">Pricing & Tickets</h2>
                <Button type="button" onClick={() => setPricing([...pricing, { id: Date.now().toString(), titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "", price: 0, discount: 0, currency: "QAR", type: "GENERAL" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Add Tier
                </Button>
              </div>

              <div className="space-y-4">
                {pricing.map((tier, index) => (
                  <div key={tier.id || index} className="p-5 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative">
                    <button type="button" onClick={() => setPricing(pricing.filter((_, i) => i !== index))} className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pr-10">
                      <div className="md:col-span-4 space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Tier Title (EN)</label>
                          <input type="text" value={tier.titleEn} onChange={e => updateArrayItem(setPricing, pricing, index, "titleEn", e.target.value)}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Tier Title (AR)</label>
                          <input type="text" dir="rtl" value={tier.titleAr} onChange={e => updateArrayItem(setPricing, pricing, index, "titleAr", e.target.value)}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-4 space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Base Price</label>
                          <input type="number" value={tier.price} onChange={e => updateArrayItem(setPricing, pricing, index, "price", parseFloat(e.target.value))}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Discount %</label>
                          <input type="number" value={tier.discount || ''} onChange={e => updateArrayItem(setPricing, pricing, index, "discount", parseFloat(e.target.value))}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-4 space-y-3">
                         <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Ticket Type</label>
                          <input type="text" placeholder="e.g. VIP, General, Family" value={tier.type} onChange={e => updateArrayItem(setPricing, pricing, index, "type", e.target.value)}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-12 space-y-3 mt-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Short Description (EN & AR)</label>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="EN Description" value={tier.descriptionEn || ''} onChange={e => updateArrayItem(setPricing, pricing, index, "descriptionEn", e.target.value)}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                          />
                           <input type="text" placeholder="AR Description" dir="rtl" value={tier.descriptionAr || ''} onChange={e => updateArrayItem(setPricing, pricing, index, "descriptionAr", e.target.value)}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {pricing.length === 0 && <div className="text-center py-12 border-2 border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-tertiary)] font-medium">No pricing tiers defined.</div>}
              </div>
            </div>
          )}

          {/* 5. PARTNERS */}
          {activeTab === "partners" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Partner Offers */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black">Partner Offers</h2>
                  <Button type="button" onClick={() => setPartnerOffers([...partnerOffers, { id: Date.now(), name: "", discount: "", description: "", image: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Offer
                  </Button>
                </div>
                <div className="space-y-4">
                  {partnerOffers.map((offer, index) => (
                    <div key={offer.id || index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative">
                      <button type="button" onClick={() => setPartnerOffers(partnerOffers.filter((_, i) => i !== index))} className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Partner Name</label>
                          <input type="text" value={offer.name} onChange={e => updateArrayItem(setPartnerOffers, partnerOffers, index, "name", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Discount Detail</label>
                          <input type="text" value={offer.discount} onChange={e => updateArrayItem(setPartnerOffers, partnerOffers, index, "discount", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Image/Logo URL</label>
                          <MediaUploader value={offer.image} onChange={val => updateArrayItem(setPartnerOffers, partnerOffers, index, "image", val)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Short Description</label>
                          <input type="text" value={offer.description} onChange={e => updateArrayItem(setPartnerOffers, partnerOffers, index, "description", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[var(--border-default)] w-full" />

              {/* General Partners */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black">General Partners</h2>
                  <Button type="button" onClick={() => setPartners([...partners, { id: Date.now(), name: "", tagline: "", logo: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Partner
                  </Button>
                </div>
                <div className="space-y-4">
                  {partners.map((partner, index) => (
                    <div key={partner.id || index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative flex gap-4 pr-10">
                      <button type="button" onClick={() => setPartners(partners.filter((_, i) => i !== index))} className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <input type="text" placeholder="Name (e.g. Visit Qatar)" value={partner.name} onChange={e => updateArrayItem(setPartners, partners, index, "name", e.target.value)} className="w-1/3 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      <input type="text" placeholder="Tagline (e.g. Official Tourism Partner)" value={partner.tagline} onChange={e => updateArrayItem(setPartners, partners, index, "tagline", e.target.value)} className="w-1/3 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      <div className="w-1/3">
                        <MediaUploader value={partner.logo} onChange={val => updateArrayItem(setPartners, partners, index, "logo", val)} placeholder="Logo URL" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 6. SOCIAL & NEWS */}
          {activeTab === "social" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Official Social Links */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black">Official Social Links</h2>
                  <Button type="button" onClick={() => setSocialLinks([...socialLinks, { id: Date.now(), platform: "Instagram", url: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Link
                  </Button>
                </div>
                <div className="space-y-3">
                  {socialLinks.map((link, index) => (
                    <div key={link.id || index} className="flex gap-4 relative pr-10">
                      <select value={link.platform} onChange={e => updateArrayItem(setSocialLinks, socialLinks, index, "platform", e.target.value)} className="w-40 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm">
                        <option>Instagram</option><option>TikTok</option><option>Facebook</option><option>X / Twitter</option><option>LinkedIn</option>
                      </select>
                      <input type="text" placeholder="Profile URL" value={link.url} onChange={e => updateArrayItem(setSocialLinks, socialLinks, index, "url", e.target.value)} className="flex-1 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      <button type="button" onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== index))} className="absolute top-1.5 right-0 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Previews */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black">Social Previews</h2>
                  <Button type="button" onClick={() => setSocialPreviews([...socialPreviews, { id: Date.now(), platform: "Instagram", url: "", previewUrl: "", fetchSource: "LINK", tagToFetch: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Post
                  </Button>
                </div>
                <div className="space-y-4">
                  {socialPreviews.map((post, index) => (
                    <div key={post.id || index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative flex flex-col gap-4 pr-10">
                      <button type="button" onClick={() => setSocialPreviews(socialPreviews.filter((_, i) => i !== index))} className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex gap-4">
                        <select value={post.platform} onChange={e => updateArrayItem(setSocialPreviews, socialPreviews, index, "platform", e.target.value)} className="w-32 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm">
                          <option>Instagram</option><option>TikTok</option>
                        </select>
                        <select value={post.fetchSource || "LINK"} onChange={e => updateArrayItem(setSocialPreviews, socialPreviews, index, "fetchSource", e.target.value)} className="w-40 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm">
                          <option value="LINK">Fetch by Link</option>
                          <option value="TAG">Fetch by Tag</option>
                        </select>
                        {post.fetchSource === "TAG" ? (
                          <input type="text" placeholder="#TagToFetch" value={post.tagToFetch} onChange={e => updateArrayItem(setSocialPreviews, socialPreviews, index, "tagToFetch", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        ) : (
                          <input type="text" placeholder="Post URL" value={post.url} onChange={e => updateArrayItem(setSocialPreviews, socialPreviews, index, "url", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        )}
                      </div>
                      <div className="w-full">
                        <MediaUploader value={post.previewUrl} onChange={val => updateArrayItem(setSocialPreviews, socialPreviews, index, "previewUrl", val)} placeholder="Preview Image/Video URL" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* News & Coverage */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black">News & Coverage</h2>
                  <Button type="button" onClick={() => setNewsCoverage([...newsCoverage, { id: Date.now(), publisher: "", date: "", title: "", url: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Link
                  </Button>
                </div>
                <div className="space-y-4">
                  {newsCoverage.map((news, index) => (
                    <div key={news.id || index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative grid grid-cols-2 gap-4 pr-10">
                      <button type="button" onClick={() => setNewsCoverage(newsCoverage.filter((_, i) => i !== index))} className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <input type="text" placeholder="Publisher (e.g. Forbes)" value={news.publisher} onChange={e => updateArrayItem(setNewsCoverage, newsCoverage, index, "publisher", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      <input type="date" placeholder="Date" value={news.date} onChange={e => updateArrayItem(setNewsCoverage, newsCoverage, index, "date", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      <input type="text" placeholder="Article Title" value={news.title} onChange={e => updateArrayItem(setNewsCoverage, newsCoverage, index, "title", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      <input type="text" placeholder="Article URL" value={news.url} onChange={e => updateArrayItem(setNewsCoverage, newsCoverage, index, "url", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* What People Say (Testimonials) */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black">What People Say (Feedback)</h2>
                  <Button type="button" onClick={() => setTestimonials([...testimonials, { id: Date.now(), author: "", quote: "", mediaUrl: "", rating: 5, link: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Feedback
                  </Button>
                </div>
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={testimonial.id || index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative flex flex-col gap-4 pr-10">
                      <button type="button" onClick={() => setTestimonials(testimonials.filter((_, i) => i !== index))} className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Author / Name" value={testimonial.author} onChange={e => updateArrayItem(setTestimonials, testimonials, index, "author", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Rating:</span>
                          <input type="number" min="1" max="5" value={testimonial.rating} onChange={e => updateArrayItem(setTestimonials, testimonials, index, "rating", parseInt(e.target.value) || 5)} className="w-20 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        </div>
                      </div>
                      
                      <textarea placeholder="Quote / Feedback" value={testimonial.quote} onChange={e => updateArrayItem(setTestimonials, testimonials, index, "quote", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm min-h-[80px]" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Source Link (Optional)" value={testimonial.link} onChange={e => updateArrayItem(setTestimonials, testimonials, index, "link", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        <MediaUploader value={testimonial.mediaUrl} onChange={val => updateArrayItem(setTestimonials, testimonials, index, "mediaUrl", val)} placeholder="Media URL (Image/Video)" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 7. BOOKING & OPS */}
          {activeTab === "ops" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-lg font-black mb-6">Booking & Maps</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Map URL (Google Maps)</label>
                    <input type="text" value={mapUrl} onChange={e => setMapUrl(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ticketing URL</label>
                    <input type="text" value={ticketingUrl} onChange={e => setTicketingUrl(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-black mb-6">Operations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Venue Name</label>
                    <input type="text" value={operations.venueName} onChange={e => setOperations({...operations, venueName: e.target.value})} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Age Group</label>
                    <input type="text" value={operations.ageGroup} onChange={e => setOperations({...operations, ageGroup: e.target.value})} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Hours (General)</label>
                    <input type="text" value={operations.hours} onChange={e => setOperations({...operations, hours: e.target.value})} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                  </div>
                </div>

                <div className="mt-8 border-t border-[var(--border-default)] pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-bold">Venue Contact Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Phone</label>
                      <input type="text" placeholder="+974..." value={operations.contactDetails?.phone || ""} onChange={e => setOperations({...operations, contactDetails: {...operations.contactDetails, phone: e.target.value}})} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Email</label>
                      <input type="email" placeholder="info@..." value={operations.contactDetails?.email || ""} onChange={e => setOperations({...operations, contactDetails: {...operations.contactDetails, email: e.target.value}})} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">WhatsApp</label>
                      <input type="text" placeholder="wa.me/..." value={operations.contactDetails?.whatsapp || ""} onChange={e => setOperations({...operations, contactDetails: {...operations.contactDetails, whatsapp: e.target.value}})} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Chat Link</label>
                      <input type="text" placeholder="URL..." value={operations.contactDetails?.chatLink || ""} onChange={e => setOperations({...operations, contactDetails: {...operations.contactDetails, chatLink: e.target.value}})} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-[var(--border-default)] pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-bold">Specific Date & Timing Rules</h3>
                    <Button type="button" onClick={() => setOperations({...operations, schedules: [...(operations.schedules || []), { id: Date.now(), title: "", daysOfWeek: [], dateRanges: [{ startDate: "", endDate: "" }], timeSlots: [{ from: "", to: "" }] }]})} variant="outline" size="sm" className="gap-2 rounded-xl">
                      <Plus className="w-4 h-4" /> Add Rule
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {(operations.schedules || []).map((schedule: any, index: number) => (
                      <div key={schedule.id || index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative">
                        <button type="button" onClick={() => {
                          const newSchedules = [...(operations.schedules || [])];
                          newSchedules.splice(index, 1);
                          setOperations({...operations, schedules: newSchedules});
                        }} className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="grid grid-cols-1 gap-6 pr-10">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Rule Title</label>
                            <input type="text" placeholder="e.g. Weekends, National Day" value={schedule.title || ""} onChange={e => {
                              const newSchedules = [...(operations.schedules || [])];
                              newSchedules[index].title = e.target.value;
                              setOperations({...operations, schedules: newSchedules});
                            }} className="w-full md:w-1/2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Days of Week</label>
                            <div className="flex flex-wrap gap-2">
                              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => {
                                // For backwards compatibility, if it's a string, we might not match properly, so we encourage array usage
                                const isSelected = Array.isArray(schedule.daysOfWeek) 
                                  ? schedule.daysOfWeek.includes(day) 
                                  : typeof schedule.daysOfWeek === 'string' && schedule.daysOfWeek.includes(day.slice(0, 3));
                                return (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => {
                                      const newSchedules = [...(operations.schedules || [])];
                                      let currentDays = Array.isArray(schedule.daysOfWeek) ? [...schedule.daysOfWeek] : [];
                                      if (isSelected) {
                                        currentDays = currentDays.filter(d => d !== day);
                                      } else {
                                        currentDays.push(day);
                                      }
                                      newSchedules[index].daysOfWeek = currentDays;
                                      setOperations({...operations, schedules: newSchedules});
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                                      isSelected 
                                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' 
                                        : 'bg-[var(--surface-default)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--color-primary)]/50'
                                    }`}
                                  >
                                    {day.slice(0, 3)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date Ranges */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Date Ranges</label>
                                <button type="button" onClick={() => {
                                  const newSchedules = [...(operations.schedules || [])];
                                  if (!Array.isArray(newSchedules[index].dateRanges)) {
                                    newSchedules[index].dateRanges = newSchedules[index].startDate || newSchedules[index].endDate 
                                      ? [{ startDate: newSchedules[index].startDate || "", endDate: newSchedules[index].endDate || "" }] 
                                      : [];
                                  }
                                  newSchedules[index].dateRanges.push({ startDate: "", endDate: "" });
                                  setOperations({...operations, schedules: newSchedules});
                                }} className="text-[10px] uppercase font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1">
                                  <Plus className="w-3 h-3" /> Add Range
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(() => {
                                  let ranges = Array.isArray(schedule.dateRanges) ? schedule.dateRanges : null;
                                  if (!ranges) {
                                    ranges = schedule.startDate || schedule.endDate ? [{ startDate: schedule.startDate || "", endDate: schedule.endDate || "" }] : [];
                                  }
                                  return ranges.length === 0 ? (
                                    <p className="text-xs text-[var(--text-tertiary)] italic">No date ranges. Applies to all dates.</p>
                                  ) : ranges.map((range: any, rIndex: number) => (
                                    <div key={rIndex} className="flex items-center gap-2">
                                      <input type="date" value={range.startDate || ""} onChange={e => {
                                        const newSchedules = [...(operations.schedules || [])];
                                        if (!Array.isArray(newSchedules[index].dateRanges)) {
                                          newSchedules[index].dateRanges = ranges;
                                        }
                                        newSchedules[index].dateRanges[rIndex].startDate = e.target.value;
                                        setOperations({...operations, schedules: newSchedules});
                                      }} className="flex-1 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-2 py-1.5 text-xs focus:border-[var(--color-primary)] focus:outline-none" />
                                      <span className="text-[var(--text-secondary)] text-xs font-medium">to</span>
                                      <input type="date" value={range.endDate || ""} onChange={e => {
                                        const newSchedules = [...(operations.schedules || [])];
                                        if (!Array.isArray(newSchedules[index].dateRanges)) {
                                          newSchedules[index].dateRanges = ranges;
                                        }
                                        newSchedules[index].dateRanges[rIndex].endDate = e.target.value;
                                        setOperations({...operations, schedules: newSchedules});
                                      }} className="flex-1 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-2 py-1.5 text-xs focus:border-[var(--color-primary)] focus:outline-none" />
                                      <button type="button" onClick={() => {
                                        const newSchedules = [...(operations.schedules || [])];
                                        if (!Array.isArray(newSchedules[index].dateRanges)) newSchedules[index].dateRanges = ranges;
                                        newSchedules[index].dateRanges.splice(rIndex, 1);
                                        setOperations({...operations, schedules: newSchedules});
                                      }} className="p-1.5 text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>

                            {/* Time Slots */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Time Slots</label>
                                <button type="button" onClick={() => {
                                  const newSchedules = [...(operations.schedules || [])];
                                  if (!Array.isArray(newSchedules[index].timeSlots)) {
                                    newSchedules[index].timeSlots = typeof newSchedules[index].timeSlots === 'string' && newSchedules[index].timeSlots 
                                      ? [{ from: newSchedules[index].timeSlots, to: "" }] 
                                      : [];
                                  }
                                  newSchedules[index].timeSlots.push({ from: "", to: "" });
                                  setOperations({...operations, schedules: newSchedules});
                                }} className="text-[10px] uppercase font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1">
                                  <Plus className="w-3 h-3" /> Add Time
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(() => {
                                  let slots = Array.isArray(schedule.timeSlots) ? schedule.timeSlots : null;
                                  if (!slots) {
                                    slots = typeof schedule.timeSlots === 'string' && schedule.timeSlots ? [{ from: schedule.timeSlots, to: "" }] : [];
                                  }
                                  return slots.length === 0 ? (
                                    <p className="text-xs text-[var(--text-tertiary)] italic">No time slots specified.</p>
                                  ) : slots.map((slot: any, tIndex: number) => (
                                    <div key={tIndex} className="flex items-center gap-2">
                                      <input type="time" value={slot.from || ""} onChange={e => {
                                        const newSchedules = [...(operations.schedules || [])];
                                        if (!Array.isArray(newSchedules[index].timeSlots)) newSchedules[index].timeSlots = slots;
                                        newSchedules[index].timeSlots[tIndex].from = e.target.value;
                                        setOperations({...operations, schedules: newSchedules});
                                      }} className="flex-1 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-2 py-1.5 text-xs focus:border-[var(--color-primary)] focus:outline-none" />
                                      <span className="text-[var(--text-secondary)] text-xs font-medium">to</span>
                                      <input type="time" value={slot.to || ""} onChange={e => {
                                        const newSchedules = [...(operations.schedules || [])];
                                        if (!Array.isArray(newSchedules[index].timeSlots)) newSchedules[index].timeSlots = slots;
                                        newSchedules[index].timeSlots[tIndex].to = e.target.value;
                                        setOperations({...operations, schedules: newSchedules});
                                      }} className="flex-1 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-2 py-1.5 text-xs focus:border-[var(--color-primary)] focus:outline-none" />
                                      <button type="button" onClick={() => {
                                        const newSchedules = [...(operations.schedules || [])];
                                        if (!Array.isArray(newSchedules[index].timeSlots)) newSchedules[index].timeSlots = slots;
                                        newSchedules[index].timeSlots.splice(tIndex, 1);
                                        setOperations({...operations, schedules: newSchedules});
                                      }} className="p-1.5 text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!operations.schedules || operations.schedules.length === 0) && (
                      <div className="text-center py-6 border-2 border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-tertiary)] font-medium text-sm">
                        No specific timing rules added.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. VISIBILITY TAB */}
          {activeTab === "visibility" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6">Visibility & Temporal Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--surface-subtle)] p-6 rounded-2xl border border-[var(--border-default)]">
                <div className="md:col-span-2 flex flex-col sm:flex-row gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={temporalStatus.isPermanent} onChange={e => setTemporalStatus({...temporalStatus, isPermanent: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                    <span className="text-sm font-bold text-[var(--text-primary)]">Is Permanent Attraction</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={temporalStatus.isSpecialEvent} onChange={e => setTemporalStatus({...temporalStatus, isSpecialEvent: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                    <span className="text-sm font-bold text-[var(--text-primary)] px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full">★ Mark as Special Event</span>
                  </label>
                </div>
                {!temporalStatus.isPermanent && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Start Date</label>
                      <input type="datetime-local" value={temporalStatus.startDate} onChange={e => setTemporalStatus({...temporalStatus, startDate: e.target.value})} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">End Date</label>
                      <input type="datetime-local" value={temporalStatus.endDate} onChange={e => setTemporalStatus({...temporalStatus, endDate: e.target.value})} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                    </div>
                  </>
                )}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Admin Status Override</label>
                  <select value={temporalStatus.statusOverride} onChange={e => setTemporalStatus({...temporalStatus, statusOverride: e.target.value})} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none">
                    <option value="">None (Auto-Calculate)</option>
                    <option value="FORCE_ACTIVE">FORCE ACTIVE</option>
                    <option value="FORCE_INCOMING">FORCE INCOMING</option>
                    <option value="FORCE_PAST">FORCE PAST</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 8. FAQs TAB */}
          {activeTab === "faqs" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black">Frequently Asked Questions</h2>
                <Button type="button" onClick={() => setFaqs([...faqs, { id: Date.now().toString(), questionEn: "", questionAr: "", answerEn: "", answerAr: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Add FAQ
                </Button>
              </div>

              {faqs.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-tertiary)] font-medium">
                  No FAQs added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={faq.id || index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] space-y-4 relative">
                      <button type="button" onClick={() => setFaqs(faqs.filter((_, i) => i !== index))} className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3 pr-8 md:pr-0">
                          <input type="text" placeholder="Question (EN)" value={faq.questionEn} onChange={e => updateArrayItem(setFaqs, faqs, index, "questionEn", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm font-bold" />
                          <textarea placeholder="Answer (EN)" value={faq.answerEn} rows={3} onChange={e => updateArrayItem(setFaqs, faqs, index, "answerEn", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm resize-none" />
                        </div>
                        <div className="space-y-3">
                          <input type="text" placeholder="السؤال (AR)" dir="rtl" value={faq.questionAr} onChange={e => updateArrayItem(setFaqs, faqs, index, "questionAr", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm font-bold font-arabic text-right" />
                          <textarea placeholder="الجواب (AR)" dir="rtl" value={faq.answerAr} rows={3} onChange={e => updateArrayItem(setFaqs, faqs, index, "answerAr", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm resize-none font-arabic text-right" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 9. GALLERY */}
          {activeTab === "gallery" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Media Gallery</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Upload images and videos for the attraction's lightbox gallery. Supports .jpg, .png, .mp4, .mov, etc.
                  </p>
                </div>
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      accept="image/*,video/*"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        
                        setIsSaving(true);
                        try {
                          const newItems: any[] = [];
                          for (let i = 0; i < files.length; i++) {
                            const formData = new FormData();
                            formData.append("file", files[i]);
                            const res = await fetch("/api/upload", { method: "POST", body: formData });
                            const data = await res.json();
                            if (data.success && data.url) {
                              newItems.push({ url: data.url, captionEn: "", captionAr: "" });
                            }
                          }
                          setGallery(prev => [...prev, ...newItems]);
                        } catch (error) {
                          alert("Failed to upload some files.");
                        } finally {
                          setIsSaving(false);
                          e.target.value = "";
                        }
                      }}
                    />
                    <div className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                      <ImageIcon className="w-4 h-4" /> Bulk Upload
                    </div>
                  </label>
                  <Button 
                    onClick={() => setGallery([...gallery, { url: "", captionEn: "", captionAr: "" }])}
                    className="gap-2 rounded-xl"
                  >
                    <Plus className="w-4 h-4" /> Add Media
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {gallery.map((item, index) => (
                  <div key={index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative group">
                    <button
                      onClick={() => setGallery(gallery.filter((_, i) => i !== index))}
                      className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-4">
                        <label className="block text-sm font-semibold mb-2">Media File/URL</label>
                        <MediaUploader
                          value={item.url}
                          onChange={(url) => updateArrayItem(setGallery, gallery, index, "url", url)}
                        />
                      </div>
                      <div className="md:col-span-8 space-y-4 pt-2">
                        <div>
                          <label className="block text-sm font-semibold mb-1">Caption (English)</label>
                          <input
                            type="text"
                            value={item.captionEn || ""}
                            onChange={(e) => updateArrayItem(setGallery, gallery, index, "captionEn", e.target.value)}
                            className="w-full px-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none"
                            placeholder="e.g. Inside the trampoline park"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">Caption (Arabic)</label>
                          <input
                            type="text"
                            value={item.captionAr || ""}
                            onChange={(e) => updateArrayItem(setGallery, gallery, index, "captionAr", e.target.value)}
                            className="w-full px-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-right"
                            dir="rtl"
                            placeholder="وصف الصورة"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {gallery.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-secondary)]">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No gallery items yet</p>
                    <p className="text-sm mt-1">Click "Add Media" to upload images or videos</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
