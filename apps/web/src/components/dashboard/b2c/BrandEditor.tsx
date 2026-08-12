"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Save, ArrowLeft, Settings, Image as ImageIcon, 
  Tags, LayoutTemplate, Briefcase, Plus, Trash2 
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MediaUploader } from "@/components/ui/MediaUploader"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function BrandEditor({ 
  initialData, 
  onClose, 
  onSave 
}: { 
  initialData?: any, 
  onClose: () => void,
  onSave: () => void
}) {
  const router = useRouter()
  const isEditing = !!initialData?.id
  
  const [activeTab, setActiveTab] = useState("identity")
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  
  // 1. Identity
  const [nameEn, setNameEn] = useState(initialData?.nameEn || "")
  const [nameAr, setNameAr] = useState(initialData?.nameAr || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [taglineEn, setTaglineEn] = useState(initialData?.taglineEn || "")
  const [taglineAr, setTaglineAr] = useState(initialData?.taglineAr || "")
  const [shortDescriptionEn, setShortDescriptionEn] = useState(initialData?.shortDescriptionEn || "")
  const [shortDescriptionAr, setShortDescriptionAr] = useState(initialData?.shortDescriptionAr || "")
  const [fullStoryEn, setFullStoryEn] = useState(initialData?.fullStoryEn || "")
  const [fullStoryAr, setFullStoryAr] = useState(initialData?.fullStoryAr || "")
  const [launchYear, setLaunchYear] = useState<number | "">(initialData?.launchYear || "")
  const [parentEntity, setParentEntity] = useState(initialData?.parentEntity || "")
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [lifecycleStatus, setLifecycleStatus] = useState(initialData?.lifecycleStatus || "ACTIVE")

  // 2. Logos & Media
  const [primaryLogoUrl, setPrimaryLogoUrl] = useState(initialData?.primaryLogoUrl || "")
  const [lightLogoUrl, setLightLogoUrl] = useState(initialData?.lightLogoUrl || "")
  const [darkLogoUrl, setDarkLogoUrl] = useState(initialData?.darkLogoUrl || "")
  const [compactLogoUrl, setCompactLogoUrl] = useState(initialData?.compactLogoUrl || "")
  
  const [mediaType, setMediaType] = useState(initialData?.mediaType || "IMAGE")
  const [primaryMediaUrl, setPrimaryMediaUrl] = useState(initialData?.primaryMediaUrl || "")
  const [coverMediaUrl, setCoverMediaUrl] = useState(initialData?.coverMediaUrl || "")
  const [detailMediaUrl, setDetailMediaUrl] = useState(initialData?.detailMediaUrl || "")
  const [fallbackImageUrl, setFallbackImageUrl] = useState(initialData?.fallbackImageUrl || "")
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || "")

  // 3. Taxonomies & Relationships
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "")
  const [relationshipIds, setRelationshipIds] = useState<string[]>(
    initialData?.relationships?.map((r: any) => r.id) || []
  )

  const [categories, setCategories] = useState<any[]>([])
  const [relationships, setRelationships] = useState<any[]>([])

  useEffect(() => {
    // Ideally these would be API calls to fetch taxonomies. Hardcoding fallback for now.
    setCategories([
      { id: 'cm-1', slug: 'attraction-brand', nameEn: 'Attraction Brand', nameAr: 'علامة تجارية لجذب' },
      { id: 'cm-2', slug: 'umbrella-brand', nameEn: 'Umbrella Brand', nameAr: 'علامة تجارية رئيسية' }
    ])
    setRelationships([
      { id: 'rm-1', slug: 'created-by', labelEn: 'Created by E3', labelAr: 'تم الإنشاء بواسطة E3' },
      { id: 'rm-2', slug: 'owned-by', labelEn: 'Owned by E3', labelAr: 'مملوكة لشركة E3' }
    ])
  }, [])

  // 4. B2C Presentation
  const [showOnB2C, setShowOnB2C] = useState(initialData?.showOnB2C ?? true)
  const [showInWorldsCreated, setShowInWorldsCreated] = useState(initialData?.showInWorldsCreated ?? true)
  const [featureOnB2C, setFeatureOnB2C] = useState(initialData?.featureOnB2C ?? false)
  const [b2cTitleOverrideEn, setB2cTitleOverrideEn] = useState(initialData?.b2cTitleOverrideEn || "")
  const [b2cTitleOverrideAr, setB2cTitleOverrideAr] = useState(initialData?.b2cTitleOverrideAr || "")
  const [b2cShortDescOverrideEn, setB2cShortDescOverrideEn] = useState(initialData?.b2cShortDescOverrideEn || "")
  const [b2cShortDescOverrideAr, setB2cShortDescOverrideAr] = useState(initialData?.b2cShortDescOverrideAr || "")
  
  // 5. B2B Presentation
  const [showOnB2B, setShowOnB2B] = useState(initialData?.showOnB2B ?? true)
  const [showInB2BPortfolio, setShowInB2BPortfolio] = useState(initialData?.showInB2BPortfolio ?? true)
  const [featureOnB2B, setFeatureOnB2B] = useState(initialData?.featureOnB2B ?? false)
  const [b2bBusinessOverviewEn, setB2bBusinessOverviewEn] = useState(initialData?.b2bBusinessOverviewEn || "")
  const [b2bBusinessOverviewAr, setB2bBusinessOverviewAr] = useState(initialData?.b2bBusinessOverviewAr || "")
  const [b2bBusinessValueEn, setB2bBusinessValueEn] = useState(initialData?.b2bBusinessValueEn || "")
  const [b2bBusinessValueAr, setB2bBusinessValueAr] = useState(initialData?.b2bBusinessValueAr || "")
  const [b2bCapabilitiesEn, setB2bCapabilitiesEn] = useState(initialData?.b2bCapabilitiesEn || "")
  const [b2bCapabilitiesAr, setB2bCapabilitiesAr] = useState(initialData?.b2bCapabilitiesAr || "")
  const [b2bCtaLabelEn, setB2bCtaLabelEn] = useState(initialData?.b2bCtaLabelEn || "")
  const [b2bCtaLabelAr, setB2bCtaLabelAr] = useState(initialData?.b2bCtaLabelAr || "")
  const [b2bInquiryUrl, setB2bInquiryUrl] = useState(initialData?.b2bInquiryUrl || "")

  const handleSave = async () => {
    const newErrors = []
    if (!nameEn) newErrors.push("nameEn")
    if (!slug) newErrors.push("slug")
    
    if (newErrors.length > 0) {
      setActiveTab("identity")
      setErrors(newErrors)
      setTimeout(() => setErrors([]), 800)
      return
    }
    
    setIsSaving(true)
    try {
      const payload = {
        nameEn, nameAr, slug, taglineEn, taglineAr,
        shortDescriptionEn, shortDescriptionAr, fullStoryEn, fullStoryAr,
        launchYear: launchYear ? Number(launchYear) : null,
        parentEntity, isActive, lifecycleStatus,
        primaryLogoUrl, lightLogoUrl, darkLogoUrl, compactLogoUrl,
        mediaType, primaryMediaUrl, coverMediaUrl, detailMediaUrl, fallbackImageUrl, thumbnailUrl,
        categoryId: categoryId || null,
        relationshipIds,
        showOnB2C, showInWorldsCreated, featureOnB2C,
        b2cTitleOverrideEn, b2cTitleOverrideAr, b2cShortDescOverrideEn, b2cShortDescOverrideAr,
        showOnB2B, showInB2BPortfolio, featureOnB2B, 
        b2bBusinessOverviewEn, b2bBusinessOverviewAr, 
        b2bBusinessValueEn, b2bBusinessValueAr,
        b2bCapabilitiesEn, b2bCapabilitiesAr,
        b2bCtaLabelEn, b2bCtaLabelAr, b2bInquiryUrl
      }
      
      const url = isEditing ? `/api/b2c/brands/${initialData.id}` : `/api/b2c/brands`
        
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) throw new Error("Failed to save")
      
      onSave()
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error saving brand");
    } finally {
      setIsSaving(false);
    }
  }

  const tabs = [
    { id: "identity", label: "Identity & Story", icon: Settings },
    { id: "media", label: "Logos & Media", icon: ImageIcon },
    { id: "taxonomies", label: "Categories & Rel", icon: Tags },
    { id: "b2c", label: "B2C Presentation", icon: LayoutTemplate },
    { id: "b2b", label: "B2B Presentation", icon: Briefcase },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[var(--surface-default)] p-4 rounded-2xl border border-[var(--border-default)] shadow-sm sticky top-6 z-30 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-[var(--surface-hover)] rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {isEditing ? "Edit Brand / IP" : "New Brand / IP"}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{nameEn || "Untitled"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-[var(--surface-subtle)] px-4 py-2 rounded-xl border border-[var(--border-default)]">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm font-bold">Active</span>
          </label>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> : <Save className="w-4 h-4" />}
            Save Brand
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
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
          
          {/* 1. IDENTITY */}
          {activeTab === "identity" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6">Identity & Story</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div animate={{ x: errors.includes("nameEn") ? [0, -10, 10, -10, 10, 0] : 0 }} transition={{ duration: 0.4 }} className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Brand Name (EN) *</label>
                  <input type="text" value={nameEn} onChange={e => {
                    setNameEn(e.target.value)
                    if (!isEditing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
                  }} className={cn("w-full bg-[var(--surface-subtle)] border rounded-xl px-4 py-3 text-sm focus:outline-none", errors.includes("nameEn") ? "border-[var(--color-error)]" : "border-[var(--border-default)] focus:border-[var(--color-primary)]")} />
                </motion.div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Brand Name (AR)</label>
                  <input type="text" dir="rtl" value={nameAr} onChange={e => setNameAr(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right" />
                </div>
                <motion.div animate={{ x: errors.includes("slug") ? [0, -10, 10, -10, 10, 0] : 0 }} transition={{ duration: 0.4 }} className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">URL Slug *</label>
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className={cn("w-full bg-[var(--surface-subtle)] border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none", errors.includes("slug") ? "border-[var(--color-error)]" : "border-[var(--border-default)] focus:border-[var(--color-primary)]")} />
                </motion.div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tagline (EN)</label>
                  <input type="text" value={taglineEn} onChange={e => setTaglineEn(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tagline (AR)</label>
                  <input type="text" dir="rtl" value={taglineAr} onChange={e => setTaglineAr(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right" />
                </div>
              </div>
            </div>
          )}

          {/* 2. LOGOS & MEDIA */}
          {activeTab === "media" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6">Logo System</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Primary Logo</label>
                  <MediaUploader value={primaryLogoUrl} onChange={setPrimaryLogoUrl} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Compact/App Icon</label>
                  <MediaUploader value={compactLogoUrl} onChange={setCompactLogoUrl} />
                </div>
              </div>

              <h2 className="text-lg font-black mb-6">Media System</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Primary Media Source</label>
                  <MediaUploader value={primaryMediaUrl} onChange={setPrimaryMediaUrl} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Cover Media (Worlds Created)</label>
                  <MediaUploader value={coverMediaUrl} onChange={setCoverMediaUrl} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Thumbnail Image</label>
                  <MediaUploader value={thumbnailUrl} onChange={setThumbnailUrl} />
                </div>
              </div>
            </div>
          )}

          {/* 3. TAXONOMIES */}
          {activeTab === "taxonomies" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6">Categories & Relationships</h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Brand Category</label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none">
                    <option value="">Select Category...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nameEn}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">E3 Relationship</label>
                  <div className="flex flex-col gap-2 p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)]">
                    {relationships.map(r => (
                      <label key={r.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={relationshipIds.includes(r.id)} onChange={e => {
                          if (e.target.checked) setRelationshipIds([...relationshipIds, r.id])
                          else setRelationshipIds(relationshipIds.filter(id => id !== r.id))
                        }} className="rounded" />
                        <span className="text-sm">{r.labelEn}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. B2C */}
          {activeTab === "b2c" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6">B2C Presentation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showOnB2C} onChange={e => setShowOnB2C(e.target.checked)} className="rounded" />
                    <span className="text-sm font-bold">Show on B2C Portal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showInWorldsCreated} onChange={e => setShowInWorldsCreated(e.target.checked)} className="rounded" />
                    <span className="text-sm font-bold">List in "Worlds Created"</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Title Override (EN)</label>
                  <input type="text" value={b2cTitleOverrideEn} onChange={e => setB2cTitleOverrideEn(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" placeholder="Overrides Brand Name En" />
                </div>
              </div>
            </div>
          )}

          {/* 5. B2B */}
          {activeTab === "b2b" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6">B2B Presentation</h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showOnB2B} onChange={e => setShowOnB2B(e.target.checked)} className="rounded" />
                    <span className="text-sm font-bold">Show on B2B Portal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showInB2BPortfolio} onChange={e => setShowInB2BPortfolio(e.target.checked)} className="rounded" />
                    <span className="text-sm font-bold">List in B2B Portfolio</span>
                  </label>
                </div>
                 <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Business Overview (EN)</label>
                  <textarea rows={3} value={b2bBusinessOverviewEn} onChange={e => setB2bBusinessOverviewEn(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Business Overview (AR)</label>
                  <textarea rows={3} dir="rtl" value={b2bBusinessOverviewAr} onChange={e => setB2bBusinessOverviewAr(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Business Value (EN)</label>
                  <input type="text" value={b2bBusinessValueEn} onChange={e => setB2bBusinessValueEn(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Business Value (AR)</label>
                  <input type="text" dir="rtl" value={b2bBusinessValueAr} onChange={e => setB2bBusinessValueAr(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Capabilities (EN)</label>
                  <input type="text" value={b2bCapabilitiesEn} onChange={e => setB2bCapabilitiesEn(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Capabilities (AR)</label>
                  <input type="text" dir="rtl" value={b2bCapabilitiesAr} onChange={e => setB2bCapabilitiesAr(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">CTA Label (EN)</label>
                  <input type="text" value={b2bCtaLabelEn} onChange={e => setB2bCtaLabelEn(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">CTA Label (AR)</label>
                  <input type="text" dir="rtl" value={b2bCtaLabelAr} onChange={e => setB2bCtaLabelAr(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Inquiry URL</label>
                  <input type="text" value={b2bInquiryUrl} onChange={e => setB2bInquiryUrl(e.target.value)} className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm font-mono focus:border-[var(--color-primary)] focus:outline-none" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
