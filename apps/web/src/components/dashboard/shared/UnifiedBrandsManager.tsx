"use client"

import { useState, useEffect } from "react"
import { 
  Plus, Search, Edit2, Archive, ExternalLink, Globe, 
  Building2, CheckCircle2, XCircle, Sparkles, Layers, Image as ImageIcon,
  Check, X
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MediaUploader } from "@/components/ui/MediaUploader"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { DashboardPageShell, DashboardPageHeader } from "@/components/dashboard/ui"

interface UnifiedBrandsManagerProps {
  defaultPortalFilter?: "all" | "b2c" | "b2b"
}

export function UnifiedBrandsManager({ defaultPortalFilter = "all" }: UnifiedBrandsManagerProps) {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [portalFilter, setPortalFilter] = useState<"all" | "b2c" | "b2b">(defaultPortalFilter)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  const [editingBrand, setEditingBrand] = useState<any | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const fetchBrands = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/b2c/brands')
      const data = await res.json()
      setBrands(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const filteredBrands = brands.filter(b => {
    const matchesSearch = 
      (b.nameEn || "").toLowerCase().includes(search.toLowerCase()) || 
      (b.slug || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.taglineEn || "").toLowerCase().includes(search.toLowerCase())

    const matchesPortal = 
      portalFilter === "all" ? true :
      portalFilter === "b2c" ? b.showOnB2C :
      portalFilter === "b2b" ? b.showOnB2B : true

    const matchesCategory = 
      categoryFilter === "all" ? true :
      (b.primaryRelationshipId || b.lifecycleStatus || "").toLowerCase() === categoryFilter.toLowerCase()

    return matchesSearch && matchesPortal && matchesCategory
  })

  const notifyBrandUpdate = () => {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('e3_cms_b2c_landing_updated'))
        const bc = new BroadcastChannel('e3_cms_sync')
        bc.postMessage({ type: 'b2c_landing_updated' })
        bc.close()
      }
    } catch (_e) {}
  }

  const handleToggleB2C = async (brand: any) => {
    try {
      const nextVal = !brand.showOnB2C
      setBrands(prev => prev.map(item => item.id === brand.id ? { ...item, showOnB2C: nextVal } : item))
      await fetch(`/api/b2c/brands/${brand.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnB2C: nextVal })
      })
      notifyBrandUpdate()
    } catch (e) {
      console.error(e)
      fetchBrands()
    }
  }

  const handleToggleB2B = async (brand: any) => {
    try {
      const nextVal = !brand.showOnB2B
      setBrands(prev => prev.map(item => item.id === brand.id ? { ...item, showOnB2B: nextVal } : item))
      await fetch(`/api/b2c/brands/${brand.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnB2B: nextVal })
      })
      notifyBrandUpdate()
    } catch (e) {
      console.error(e)
      fetchBrands()
    }
  }

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this brand? It will become INACTIVE.")) return;
    try {
      await fetch(`/api/b2c/brands/${id}`, { method: 'DELETE' });
      fetchBrands();
      notifyBrandUpdate();
    } catch (e) {
      console.error(e);
      alert("Failed to archive brand");
    }
  }

  if (editingBrand || isCreating) {
    return (
      <UnifiedBrandEditor 
        initialData={editingBrand} 
        onClose={() => { setEditingBrand(null); setIsCreating(false); }} 
        onSave={() => { setEditingBrand(null); setIsCreating(false); fetchBrands(); notifyBrandUpdate(); }} 
      />
    )
  }

  return (
    <DashboardPageShell variant="wide">
      {/* Top Header & Actions */}
      <DashboardPageHeader
        title="E3 Brand & IP Ecosystem"
        description="Manage canonical E3 brands, sub-brands, hosted concepts, and F&B IPs powering B2C and B2B portals."
        breadcrumbs={[
          { label: portalFilter === "b2b" ? "B2B Content" : "B2C Content", href: portalFilter === "b2b" ? "/dashboard/b2b/brands" : "/dashboard/b2c/brands" },
          { label: "Brand & IP Ecosystem" },
        ]}
        badge={{ label: `${brands.length} Brands Total`, variant: "purple" }}
        primaryAction={{
          label: "Create New Brand / IP",
          onClick: () => setIsCreating(true),
          icon: <Plus className="w-4 h-4" />
        }}
      />

      {/* Portal & Category Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Portal Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-default)] overflow-x-auto">
          <button
            onClick={() => setPortalFilter("all")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
              portalFilter === "all" ? "bg-[var(--surface-default)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Layers className="w-3.5 h-3.5" /> All Portals
          </button>
          <button
            onClick={() => setPortalFilter("b2c")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
              portalFilter === "b2c" ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Globe className="w-3.5 h-3.5" /> B2C Worlds Created ({brands.filter(b => b.showOnB2C).length})
          </button>
          <button
            onClick={() => setPortalFilter("b2b")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
              portalFilter === "b2b" ? "bg-purple-600 text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Building2 className="w-3.5 h-3.5" /> B2B Portfolio & Partners ({brands.filter(b => b.showOnB2B).length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Search brands or slugs..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Brand Grid */}
      {loading ? (
        <div className="text-center py-16 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] text-[var(--text-tertiary)] animate-pulse">
          Loading E3 Brand Portfolio...
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] space-y-3">
          <Sparkles className="w-10 h-10 mx-auto text-[var(--text-tertiary)] opacity-40" />
          <p className="text-base font-bold text-[var(--text-primary)]">No brands match your filter</p>
          <p className="text-xs text-[var(--text-secondary)]">Try adjusting your search or portal filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <div 
              key={brand.id} 
              className="group bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-5 hover:border-[var(--color-primary)] transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Header Info */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl border border-[var(--border-default)] bg-[var(--surface-subtle)] overflow-hidden relative flex items-center justify-center p-1">
                      {brand.primaryLogoUrl ? (
                        <Image 
                          src={brand.primaryLogoUrl} 
                          alt={brand.nameEn} 
                          fill 
                          className="object-contain p-1"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-[var(--text-tertiary)]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-[var(--text-primary)] flex items-center gap-1.5">
                        {brand.nameEn}
                        <span className="text-xs font-normal text-[var(--text-secondary)] font-arabic">({brand.nameAr})</span>
                      </h3>
                      <p className="text-xs font-mono text-[var(--text-tertiary)]">/{brand.slug}</p>
                    </div>
                  </div>

                  <span className={cn(
                    "text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider",
                    brand.lifecycleStatus === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600" :
                    brand.lifecycleStatus === "SEASONAL" ? "bg-amber-500/10 text-amber-600" : "bg-gray-500/10 text-gray-500"
                  )}>
                    {brand.lifecycleStatus || "ACTIVE"}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-4 font-medium">
                  {brand.taglineEn || brand.shortDescriptionEn || "No tagline configured"}
                </p>

                {/* Dual Portal Visibility Controls */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] mb-4">
                  <button 
                    type="button"
                    onClick={() => handleToggleB2C(brand)}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      brand.showOnB2C ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-[var(--surface-default)] text-[var(--text-tertiary)] border border-[var(--border-default)]"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> B2C Site
                    </span>
                    {brand.showOnB2C ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleToggleB2B(brand)}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      brand.showOnB2B ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" : "bg-[var(--surface-default)] text-[var(--text-tertiary)] border border-[var(--border-default)]"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> B2B Site
                    </span>
                    {brand.showOnB2B ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)] text-xs">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingBrand(brand)} className="gap-1 rounded-xl text-xs">
                    <Edit2 className="w-3.5 h-3.5" /> Edit Brand
                  </Button>
                  {brand.b2cCtaUrl && (
                    <a href={brand.b2cCtaUrl} target="_blank" rel="noreferrer" className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <button 
                  onClick={() => handleArchive(brand.id)} 
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Archive Brand"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardPageShell>
  )
}

// ----------------------------------------------------------------------
// UNIFIED BRAND EDITOR COMPONENT
// ----------------------------------------------------------------------
function UnifiedBrandEditor({ initialData, onClose, onSave }: { initialData?: any; onClose: () => void; onSave: () => void }) {
  const isEditing = !!initialData?.id

  const [activeTab, setActiveTab] = useState<"identity" | "b2c" | "b2b" | "media">("identity")
  const [isSaving, setIsSaving] = useState(false)

  // Form State
  const [nameEn, setNameEn] = useState(initialData?.nameEn || "")
  const [nameAr, setNameAr] = useState(initialData?.nameAr || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [taglineEn, setTaglineEn] = useState(initialData?.taglineEn || "")
  const [taglineAr, setTaglineAr] = useState(initialData?.taglineAr || "")
  const [shortDescriptionEn, setShortDescriptionEn] = useState(initialData?.shortDescriptionEn || "")
  const [shortDescriptionAr, setShortDescriptionAr] = useState(initialData?.shortDescriptionAr || "")
  const [lifecycleStatus, setLifecycleStatus] = useState(initialData?.lifecycleStatus || "ACTIVE")

  // B2C Flags & Copy
  const [showOnB2C, setShowOnB2C] = useState(initialData?.showOnB2C ?? true)
  const [showInWorldsCreated, setShowInWorldsCreated] = useState(initialData?.showInWorldsCreated ?? true)
  const [featureOnB2C, setFeatureOnB2C] = useState(initialData?.featureOnB2C ?? false)
  const [b2cCtaLabelEn, setB2cCtaLabelEn] = useState(initialData?.b2cCtaLabelEn || "Explore Brand")
  const [b2cCtaLabelAr, setB2cCtaLabelAr] = useState(initialData?.b2cCtaLabelAr || "استكشف العلامة")
  const [b2cCtaUrl, setB2cCtaUrl] = useState(initialData?.b2cCtaUrl || "")

  // B2B Flags & Copy
  const [showOnB2B, setShowOnB2B] = useState(initialData?.showOnB2B ?? true)
  const [showInB2BPortfolio, setShowInB2BPortfolio] = useState(initialData?.showInB2BPortfolio ?? true)
  const [featureOnB2B, setFeatureOnB2B] = useState(initialData?.featureOnB2B ?? false)
  const [b2bBusinessOverviewEn, setB2bBusinessOverviewEn] = useState(initialData?.b2bBusinessOverviewEn || "")
  const [b2bBusinessOverviewAr, setB2bBusinessOverviewAr] = useState(initialData?.b2bBusinessOverviewAr || "")
  const [b2bInquiryUrl, setB2bInquiryUrl] = useState(initialData?.b2bInquiryUrl || "")

  // Logos & Media
  const [primaryLogoUrl, setPrimaryLogoUrl] = useState(initialData?.primaryLogoUrl || "")
  const [lightLogoUrl, setLightLogoUrl] = useState(initialData?.lightLogoUrl || "")
  const [darkLogoUrl, setDarkLogoUrl] = useState(initialData?.darkLogoUrl || "")
  const [primaryMediaUrl, setPrimaryMediaUrl] = useState(initialData?.primaryMediaUrl || "")

  const handleSave = async () => {
    if (!nameEn.trim()) {
      alert("Brand English Name is required")
      return
    }

    setIsSaving(true)
    try {
      const generatedSlug = slug.trim() || nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      const payload = {
        nameEn,
        nameAr: nameAr || nameEn,
        slug: generatedSlug,
        taglineEn,
        taglineAr,
        shortDescriptionEn,
        shortDescriptionAr,
        lifecycleStatus,

        // B2C
        showOnB2C,
        showInWorldsCreated,
        featureOnB2C,
        b2cCtaLabelEn,
        b2cCtaLabelAr,
        b2cCtaUrl,

        // B2B
        showOnB2B,
        showInB2BPortfolio,
        featureOnB2B,
        b2bBusinessOverviewEn,
        b2bBusinessOverviewAr,
        b2bInquiryUrl,

        // Logos
        primaryLogoUrl,
        lightLogoUrl,
        darkLogoUrl,
        primaryMediaUrl,
        isActive: lifecycleStatus !== "INACTIVE"
      }

      const url = isEditing ? `/api/b2c/brands/${initialData.id}` : `/api/b2c/brands`
      const method = isEditing ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to save brand")
      }

      onSave()
    } catch (err: any) {
      alert(err.message || "Error saving brand")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardPageShell variant="focused">
      <DashboardPageHeader
        title={isEditing ? `Edit Brand: ${nameEn || "Untitled"}` : "Create New E3 Brand / IP"}
        description="Configure dual B2C & B2B presence for this canonical brand entity."
        breadcrumbs={[
          { label: "Brands Directory", href: "/dashboard/b2c/brands" },
          { label: isEditing ? (nameEn || "Edit Brand") : "New Brand" }
        ]}
        badge={{
          label: lifecycleStatus,
          variant: lifecycleStatus === "ACTIVE" ? "success" : "warning",
        }}
        primaryAction={{
          label: isSaving ? "Saving..." : "Save Brand Record",
          onClick: handleSave,
          isLoading: isSaving,
        }}
        secondaryAction={
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-default)] gap-2">
        <button
          onClick={() => setActiveTab("identity")}
          className={cn("px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer", activeTab === "identity" ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--text-secondary)]")}
        >
          1. Identity & Core Info
        </button>
        <button
          onClick={() => setActiveTab("b2c")}
          className={cn("px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer", activeTab === "b2c" ? "border-emerald-500 text-emerald-600" : "border-transparent text-[var(--text-secondary)]")}
        >
          <Globe className="w-3.5 h-3.5" /> 2. B2C Experience
        </button>
        <button
          onClick={() => setActiveTab("b2b")}
          className={cn("px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer", activeTab === "b2b" ? "border-purple-600 text-purple-600" : "border-transparent text-[var(--text-secondary)]")}
        >
          <Building2 className="w-3.5 h-3.5" /> 3. B2B Corporate
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={cn("px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer", activeTab === "media" ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--text-secondary)]")}
        >
          <ImageIcon className="w-3.5 h-3.5" /> 4. Logos & Media
        </button>
      </div>

      {/* TAB 1: IDENTITY */}
      {activeTab === "identity" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Brand Name (English) *</label>
              <input
                type="text"
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                placeholder="e.g. BookingQube, InflataRUN"
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Brand Name (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
                placeholder="اسم العلامة التجارية بالعربية"
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="e.g. bookingqube (auto-generated if empty)"
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm font-mono text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Lifecycle Status</label>
              <select
                value={lifecycleStatus}
                onChange={e => setLifecycleStatus(e.target.value)}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="ACTIVE">Active Brand</option>
                <option value="SEASONAL">Seasonal Brand</option>
                <option value="COMBO">Combo Concept</option>
                <option value="INACTIVE">Inactive / Paused</option>
                <option value="LEGACY">Legacy Archive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Tagline (English)</label>
              <input
                type="text"
                value={taglineEn}
                onChange={e => setTaglineEn(e.target.value)}
                placeholder="e.g. World Record Inflatable Obstacle Park"
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Tagline (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                value={taglineAr}
                onChange={e => setTaglineAr(e.target.value)}
                placeholder="شعار العلامة التجارية بالعربية"
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none text-right"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Short Description (English)</label>
            <textarea
              rows={3}
              value={shortDescriptionEn}
              onChange={e => setShortDescriptionEn(e.target.value)}
              placeholder="Brief overview of the brand concept..."
              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* TAB 2: B2C EXPERIENCE */}
      {activeTab === "b2c" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
            <h3 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4" /> B2C Public Presentation & Visibility
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnB2C}
                  onChange={e => setShowOnB2C(e.target.checked)}
                  className="rounded border-[var(--border-default)] text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-[var(--text-primary)]">Visible on B2C Website</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInWorldsCreated}
                  onChange={e => setShowInWorldsCreated(e.target.checked)}
                  className="rounded border-[var(--border-default)] text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-[var(--text-primary)]">Show in &quot;Worlds Created&quot;</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featureOnB2C}
                  onChange={e => setFeatureOnB2C(e.target.checked)}
                  className="rounded border-[var(--border-default)] text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-[var(--text-primary)]">Feature on B2C Hero</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">B2C Button Label (English)</label>
              <input
                type="text"
                value={b2cCtaLabelEn}
                onChange={e => setB2cCtaLabelEn(e.target.value)}
                placeholder="e.g. Explore Attraction"
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">B2C Destination URL</label>
              <input
                type="text"
                value={b2cCtaUrl}
                onChange={e => setB2cCtaUrl(e.target.value)}
                placeholder="e.g. /b2c/attractions/inflatarun"
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm font-mono text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: B2B CORPORATE */}
      {activeTab === "b2b" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
            <h3 className="text-xs font-extrabold text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> B2B Corporate Portfolio Positioning
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnB2B}
                  onChange={e => setShowOnB2B(e.target.checked)}
                  className="rounded border-[var(--border-default)] text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-bold text-[var(--text-primary)]">Visible on B2B Website</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInB2BPortfolio}
                  onChange={e => setShowInB2BPortfolio(e.target.checked)}
                  className="rounded border-[var(--border-default)] text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-bold text-[var(--text-primary)]">Show in B2B Portfolio</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featureOnB2B}
                  onChange={e => setFeatureOnB2B(e.target.checked)}
                  className="rounded border-[var(--border-default)] text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-bold text-[var(--text-primary)]">Feature on B2B Spotlight</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">B2B Business Overview (English)</label>
            <textarea
              rows={3}
              value={b2bBusinessOverviewEn}
              onChange={e => setB2bBusinessOverviewEn(e.target.value)}
              placeholder="Corporate overview for partners, investors, and venue hosts..."
              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">B2B Inquiry Gateway URL</label>
            <input
              type="text"
              value={b2bInquiryUrl}
              onChange={e => setB2bInquiryUrl(e.target.value)}
              placeholder="e.g. /b2b/contact?subject=BrandLicensing"
              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm font-mono text-[var(--text-primary)] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* TAB 4: LOGOS & MEDIA */}
      {activeTab === "media" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Primary Logo (Local Upload)</label>
              <MediaUploader
                value={primaryLogoUrl}
                onChange={setPrimaryLogoUrl}
                accept="image/*,.svg"
                placeholder="Upload Primary Logo"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Light Logo (For Dark Backgrounds)</label>
              <MediaUploader
                value={lightLogoUrl}
                onChange={setLightLogoUrl}
                accept="image/*,.svg"
                placeholder="Upload Light Logo"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Primary Feature Banner / Media</label>
            <MediaUploader
              value={primaryMediaUrl}
              onChange={setPrimaryMediaUrl}
              accept="image/*,video/*"
              placeholder="Upload Feature Banner / Video"
            />
          </div>
        </div>
      )}
    </DashboardPageShell>
  )
}
