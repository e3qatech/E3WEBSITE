"use client"

import { useState, useEffect } from "react"
import { 
  Plus, Search, Edit2, Trash2, Copy, Eye, Globe, Sparkles, Check, X, 
  Layers, Package, ShieldCheck, FileText, ArrowRight, Save
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MediaUploader } from "@/components/ui/MediaUploader"
import { cn } from "@/lib/utils"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"

export function PackagesManager() {
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const fetchPackages = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/b2c/packages")
      const json = await res.json()
      setPackages(Array.isArray(json.data) ? json.data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return
    try {
      await fetch(`/api/b2c/packages/${id}`, { method: "DELETE" })
      fetchPackages()
    } catch (e) {
      alert("Failed to delete package")
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await fetch(`/api/b2c/packages/${id}`, { method: "POST" })
      fetchPackages()
    } catch (e) {
      alert("Failed to duplicate package")
    }
  }

  const filtered = packages.filter(item => {
    const matchesSearch = 
      (item.titleEn || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.titleAr || "").toLowerCase().includes(search.toLowerCase())
    const matchesCat = categoryFilter === "ALL" || item.category === categoryFilter
    return matchesSearch && matchesCat
  })

  if (editingItem || isCreating) {
    return (
      <PackageEditor
        initialData={editingItem}
        onClose={() => { setEditingItem(null); setIsCreating(false); }}
        onSave={() => { setEditingItem(null); setIsCreating(false); fetchPackages(); }}
      />
    )
  }

  return (
    <DashboardPageShell variant="wide">
      {/* Header */}
      <DashboardPageHeader
        title="Packages & Birthdays Manager"
        description="Create, edit, duplicate, and manage bilingual package microsites for birthdays, groups, schools, and corporate events."
        breadcrumbs={[
          { label: "B2C Content", href: "/dashboard/b2c/attractions" },
          { label: "Packages & Birthdays" },
        ]}
        badge={{ label: `${packages.length} Total Packages`, variant: "purple" }}
        previewUrl="/b2c/packages"
        primaryAction={{
          label: "Create New Package",
          onClick: () => setIsCreating(true),
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-default)] overflow-x-auto">
          {["ALL", "BIRTHDAY", "GROUP", "SCHOOL", "CORPORATE", "PRIVATE_EVENT"].map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer",
                categoryFilter === c ? "bg-[var(--surface-default)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)]"
              )}
            >
              {c.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="relative flex-1 md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input 
            type="text" 
            placeholder="Search package title..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] text-[var(--text-tertiary)] animate-pulse">
          Loading Packages...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] space-y-3">
          <Package className="w-10 h-10 mx-auto text-[var(--text-tertiary)] opacity-40" />
          <p className="text-base font-bold text-[var(--text-primary)]">No packages found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div key={item.id} className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-5 hover:border-[var(--color-primary)] transition-all shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider bg-purple-500/10 text-purple-600 border border-purple-500/20">
                    {item.category}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider",
                    item.isPublished ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500"
                  )}>
                    {item.isPublished ? "PUBLISHED" : "DRAFT"}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-[var(--text-primary)] line-clamp-1">
                  {item.titleEn}
                </h3>
                {item.titleAr && (
                  <p className="text-xs text-[var(--text-secondary)] font-arabic text-right mt-0.5 line-clamp-1">
                    {item.titleAr}
                  </p>
                )}

                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-2">
                  {item.shortDescriptionEn || "No description..."}
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-default)]/60 text-xs font-mono font-bold">
                  <span className="text-[var(--text-secondary)]">{item.minGuests}-{item.maxGuests} Guests</span>
                  <span className="text-[var(--color-primary)]">{item.startingPrice} {item.currency || 'QAR'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)] text-xs">
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => setEditingItem(item)} className="gap-1 rounded-xl text-xs">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <button onClick={() => handleDuplicate(item.id)} className="p-2 text-purple-500 hover:bg-purple-500/10 rounded-lg cursor-pointer">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardPageShell>
  )
}

function PackageEditor({ initialData, onClose, onSave }: { initialData?: any; onClose: () => void; onSave: () => void }) {
  const isEditing = !!initialData?.id
  const [isSaving, setIsSaving] = useState(false)

  const [activeTab, setActiveTab] = useState("core")

  const [titleEn, setTitleEn] = useState(initialData?.titleEn || "")
  const [titleAr, setTitleAr] = useState(initialData?.titleAr || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [category, setCategory] = useState(initialData?.category || "BIRTHDAY")
  const [startingPrice, setStartingPrice] = useState(initialData?.startingPrice || 1500)
  const [minGuests, setMinGuests] = useState(initialData?.minGuests || 10)
  const [maxGuests, setMaxGuests] = useState(initialData?.maxGuests || 40)
  const [durationMinutes, setDurationMinutes] = useState(initialData?.durationMinutes || 120)
  const [shortDescriptionEn, setShortDescriptionEn] = useState(initialData?.shortDescriptionEn || "")
  const [shortDescriptionAr, setShortDescriptionAr] = useState(initialData?.shortDescriptionAr || "")
  const [coverMediaUrl, setCoverMediaUrl] = useState(initialData?.coverMediaUrl || "")
  const [heroMediaUrl, setHeroMediaUrl] = useState(initialData?.heroMediaUrl || "")
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true)
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false)

  // Tiers JSON Repeater
  const [tiers, setTiers] = useState<any[]>(initialData?.tiers || [
    { id: "t1", nameEn: "Essential Tier", nameAr: "المستوى الأساسي", price: 1500, guestCount: 10, extraGuestPrice: 100, includedItems: ["Attraction Access", "Party Room"] }
  ])

  // Inclusions JSON Repeater
  const [inclusions, setInclusions] = useState<any[]>(initialData?.inclusions || [
    { id: "i1", titleEn: "Attraction Access", titleAr: "دخول الفعالية", icon: "Sparkles", status: "INCLUDED" }
  ])

  const handleSave = async () => {
    if (!titleEn.trim()) {
      alert("English Title is required")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        titleEn,
        titleAr: titleAr || titleEn,
        slug: slug.trim() || titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category,
        startingPrice: parseFloat(startingPrice.toString()) || 0,
        minGuests: parseInt(minGuests.toString()) || 10,
        maxGuests: parseInt(maxGuests.toString()) || 40,
        durationMinutes: parseInt(durationMinutes.toString()) || 120,
        shortDescriptionEn,
        shortDescriptionAr,
        coverMediaUrl,
        heroMediaUrl,
        isPublished,
        isFeatured,
        tiers,
        inclusions
      }

      const url = isEditing ? `/api/b2c/packages/${initialData.id}` : "/api/b2c/packages"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Failed to save package")
      onSave()
    } catch (err: any) {
      alert(err.message || "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-6 max-w-4xl mx-auto shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
            {isEditing ? `Edit Package: ${titleEn}` : "Create New Package"}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Configure package microsite sections, tiers, inclusions, and availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="w-3.5 h-3.5 mr-1" />
            {isSaving ? "Saving..." : "Save Package"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Title (English) *</label>
              <input
                type="text"
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Title (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                value={titleAr}
                onChange={e => setTitleAr(e.target.value)}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Short Summary (English)</label>
            <textarea
              rows={2}
              value={shortDescriptionEn}
              onChange={e => setShortDescriptionEn(e.target.value)}
              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Starting Price (QAR)</label>
              <input
                type="number"
                value={startingPrice}
                onChange={e => setStartingPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Min Guests</label>
              <input
                type="number"
                value={minGuests}
                onChange={e => setMinGuests(parseInt(e.target.value) || 10)}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Max Guests</label>
              <input
                type="number"
                value={maxGuests}
                onChange={e => setMaxGuests(parseInt(e.target.value) || 40)}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] font-mono"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Package Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)]"
            >
              <option value="BIRTHDAY">Birthday</option>
              <option value="GROUP">Group</option>
              <option value="SCHOOL">School & Nursery</option>
              <option value="CORPORATE">Corporate & Team Building</option>
              <option value="PRIVATE_EVENT">Private Event</option>
              <option value="CUSTOM">Custom Experience</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Cover Image URL</label>
            <MediaUploader value={coverMediaUrl} onChange={setCoverMediaUrl} accept="image/*" />
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="rounded text-purple-600" />
              <span className="text-xs font-bold text-[var(--text-primary)]">Published Publicly</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="rounded text-purple-600" />
              <span className="text-xs font-bold text-[var(--text-primary)]">Featured on Homepage</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
