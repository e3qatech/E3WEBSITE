"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Plus,
  MapPin,
  Search,
  Edit3,
  Eye,
  EyeOff,
  Calendar,
  Building2,
  Tag,
  Filter,
  CheckCircle2,
  Clock,
  Archive,
  Star,
  Trash2,
  Globe
} from "lucide-react"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { Badge } from "@/components/ui/Badge"
import { AdminPageHeader } from "@/components/dashboard/ui/AdminPageHeader"

export type B2BAttractionItem = {
  id: string
  slug: string
  name: { en: string; ar: string }
  tagline: { en: string; ar: string } | null
  isPublished: boolean
  isFeatured: boolean
  isB2bVisible: boolean
  b2bCategory: string | null
  projectType: string | null
  clientName: string | null
  year: number | null
  venue: string
  temporalStatus: string
  updatedAt: string
  heroMediaUrl: string | null
  heroFallbackUrl: string | null
  heroThumbnailUrl: string | null
  heroMediaType: string | null
  _count: {
    pricing: number
    offers: number
    faqs: number
  }
}

export function B2BAttractionsList({ initialAttractions }: { initialAttractions: B2BAttractionItem[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [attractions, setAttractions] = useState(initialAttractions)

  // Filter States
  const [temporalFilter, setTemporalFilter] = useState<string>("ALL")
  const [publicationFilter, setPublicationFilter] = useState<string>("ALL")
  const [visibilityFilter, setVisibilityFilter] = useState<string>("VISIBLE")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
  const [yearFilter, setYearFilter] = useState<string>("ALL")

  // Extract unique categories and years for dropdown options
  const categories = useMemo(() => {
    const set = new Set<string>()
    attractions.forEach(a => {
      if (a.b2bCategory) set.add(a.b2bCategory)
    })
    return Array.from(set).sort()
  }, [attractions])

  const years = useMemo(() => {
    const set = new Set<number>()
    attractions.forEach(a => {
      if (a.year) set.add(a.year)
    })
    return Array.from(set).sort((a, b) => b - a)
  }, [attractions])

  const filteredAttractions = useMemo(() => {
    return attractions.filter(item => {
      // Search term filter
      const q = search.toLowerCase().trim()
      const matchesSearch = !q ||
        item.name.en.toLowerCase().includes(q) ||
        item.name.ar.includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        item.venue.toLowerCase().includes(q) ||
        (item.clientName && item.clientName.toLowerCase().includes(q))

      // Temporal Status Filter
      const matchesTemporal = temporalFilter === "ALL" || item.temporalStatus.toUpperCase() === temporalFilter

      // Publication Status Filter
      const matchesPublication = publicationFilter === "ALL" ||
        (publicationFilter === "PUBLISHED" && item.isPublished) ||
        (publicationFilter === "DRAFT" && !item.isPublished)

      // Visibility Filter
      const matchesVisibility = visibilityFilter === "ALL" ||
        (visibilityFilter === "VISIBLE" && item.isB2bVisible) ||
        (visibilityFilter === "HIDDEN" && !item.isB2bVisible)

      // Category Filter
      const matchesCategory = categoryFilter === "ALL" || item.b2bCategory === categoryFilter

      // Year Filter
      const matchesYear = yearFilter === "ALL" || (item.year && item.year.toString() === yearFilter)

      return matchesSearch && matchesTemporal && matchesPublication && matchesVisibility && matchesCategory && matchesYear
    })
  }, [attractions, search, temporalFilter, publicationFilter, visibilityFilter, categoryFilter, yearFilter])

  const toggleField = async (id: string, field: "isPublished" | "isB2bVisible", currentValue: boolean) => {
    try {
      const res = await fetch(`/api/b2b/attractions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue })
      })
      if (!res.ok) throw new Error("Failed to update status")

      setAttractions(prev => prev.map(a =>
        a.id === id ? { ...a, [field]: !currentValue } : a
      ))
      router.refresh()
    } catch (err: any) {
      alert(err.message || `Failed to update ${field}`)
    }
  }

  const deleteAttraction = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return

    try {
      const res = await fetch(`/api/b2b/attractions/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to delete attraction")
      }

      setAttractions(prev => prev.filter(a => a.id !== id))
      router.refresh()
    } catch (err: any) {
      alert(err.message || "Failed to delete attraction")
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-[1600px] mx-auto animate-fade-in-up">
      <AdminPageHeader
        title="B2B Project Portfolio & Attractions"
        description="Manage turnkey entertainment assets, past editions, brand activations, and B2B portfolio listings."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "B2B Portal", href: "/dashboard/b2b/home" },
          { label: "Attractions & Projects" }
        ]}
        action={
          <div className="flex items-center gap-3">
            <Link href="/dashboard/b2c/attractions/new">
              <AdminButton variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                New Project Record
              </AdminButton>
            </Link>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-[var(--surface-default)] p-4 rounded-xl border border-[var(--border-default)] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search by project name, venue, client, slug..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ps-9 pe-4 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] w-full text-[var(--text-primary)]"
            />
          </div>

          {/* Stats summary */}
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] bg-[var(--surface-subtle)] px-3 py-2 rounded-lg border border-[var(--border-default)]">
            <span>Showing <strong>{filteredAttractions.length}</strong> of <strong>{attractions.length}</strong> Projects</span>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-[var(--border-subtle)]">
          {/* Temporal Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
              Temporal Status
            </label>
            <select
              value={temporalFilter}
              onChange={e => setTemporalFilter(e.target.value)}
              className="w-full text-xs bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-md p-2 focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active / Ongoing</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="PAST">Past Edition</option>
            </select>
          </div>

          {/* Publication Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
              Publish Status
            </label>
            <select
              value={publicationFilter}
              onChange={e => setPublicationFilter(e.target.value)}
              className="w-full text-xs bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-md p-2 focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
            >
              <option value="ALL">All Publication</option>
              <option value="PUBLISHED">Published (Live)</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          {/* B2B Visibility Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
              B2B Visibility
            </label>
            <select
              value={visibilityFilter}
              onChange={e => setVisibilityFilter(e.target.value)}
              className="w-full text-xs bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-md p-2 focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
            >
              <option value="VISIBLE">B2B Visible (Default)</option>
              <option value="HIDDEN">B2B Hidden</option>
              <option value="ALL">All</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full text-xs bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-md p-2 focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
            >
              <option value="ALL">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
              Edition / Year
            </label>
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="w-full text-xs bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-md p-2 focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
            >
              <option value="ALL">All Years</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredAttractions.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)]">
          <Building2 className="w-12 h-12 mx-auto text-[var(--text-tertiary)] opacity-40 mb-3" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No matching B2B project records found</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Try adjusting your search queries or filter dropdown options.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAttractions.map(attraction => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              key={attraction.id}
              className="group flex flex-col bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] shadow-sm hover:border-[var(--color-primary)] transition-all overflow-hidden"
            >
              {/* Media Preview & Badges Header */}
              <div className="relative aspect-video bg-[var(--surface-subtle)] overflow-hidden">
                {(() => {
                  const isIframe = attraction.heroMediaType === 'IFRAME'
                  const imgSrc = attraction.heroThumbnailUrl || attraction.heroFallbackUrl || (!isIframe ? attraction.heroMediaUrl : null)

                  if (imgSrc) {
                    return (
                      <img
                        src={imgSrc}
                        alt={attraction.name.en}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'
                          }
                        }}
                      />
                    )
                  }
                  return null
                })()}

                <div
                  className="w-full h-full flex items-center justify-center bg-[var(--surface-subtle)]"
                  style={{ display: attraction.heroThumbnailUrl || attraction.heroFallbackUrl || (!attraction.heroMediaType || attraction.heroMediaType !== 'IFRAME' ? attraction.heroMediaUrl : null) ? 'none' : 'flex' }}
                >
                  <Building2 className="w-8 h-8 text-[var(--text-tertiary)] opacity-40" />
                </div>

                {/* Status Badges Overlay */}
                <div className="absolute top-3 start-3 flex flex-wrap gap-1.5 max-w-[85%]">
                  {/* Temporal Status */}
                  <Badge
                    variant={attraction.temporalStatus === "ACTIVE" ? "success" : attraction.temporalStatus === "UPCOMING" ? "info" : "default"}
                    className="shadow-sm backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 text-[10px] font-bold"
                  >
                    {attraction.temporalStatus}
                  </Badge>

                  {/* Year Tag */}
                  {attraction.year && (
                    <Badge variant="default" className="shadow-sm backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 text-[10px] font-bold">
                      {attraction.year}
                    </Badge>
                  )}

                  {/* B2B Visibility */}
                  <Badge
                    variant={attraction.isB2bVisible ? "info" : "default"}
                    className="shadow-sm backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 text-[10px] gap-1"
                  >
                    <Globe className="w-2.5 h-2.5" />
                    {attraction.isB2bVisible ? "B2B Visible" : "B2B Hidden"}
                  </Badge>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-[var(--text-primary)] leading-tight text-base">{attraction.name.en}</h3>
                    {attraction.isPublished ? (
                      <Badge variant="success" className="text-[10px] py-0 px-1.5 shrink-0">Live</Badge>
                    ) : (
                      <Badge variant="default" className="text-[10px] py-0 px-1.5 shrink-0">Draft</Badge>
                    )}
                  </div>
                  <h4 className="text-xs text-[var(--text-secondary)] font-arabic mb-2">{attraction.name.ar}</h4>

                  {/* Venue and Details */}
                  <div className="space-y-1 mt-3 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
                      <span className="truncate">{attraction.venue}</span>
                    </div>

                    {attraction.b2bCategory && (
                      <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                        <Tag className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{attraction.b2bCategory}</span>
                      </div>
                    )}

                    {attraction.clientName && (
                      <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Client: {attraction.clientName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer & Actions */}
                <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/b2b/attractions/${attraction.id}/edit`} className="flex-1">
                      <AdminButton variant="outline" className="w-full text-xs" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                        Edit B2B Record
                      </AdminButton>
                    </Link>

                    <div className="flex bg-[var(--surface-subtle)] rounded-lg p-1">
                      {/* B2B Visibility Toggle */}
                      <button
                        title={attraction.isB2bVisible ? "Hide from B2B Portal" : "Show on B2B Portal"}
                        onClick={() => toggleField(attraction.id, "isB2bVisible", attraction.isB2bVisible)}
                        className={`p-1.5 rounded-md transition-colors ${attraction.isB2bVisible ? 'text-[var(--color-primary)] bg-white dark:bg-neutral-800 shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
                      >
                        <Globe className="w-4 h-4" />
                      </button>

                      {/* Publish Toggle */}
                      <button
                        title={attraction.isPublished ? "Unpublish" : "Publish Live"}
                        onClick={() => toggleField(attraction.id, "isPublished", attraction.isPublished)}
                        className={`p-1.5 rounded-md transition-colors ${attraction.isPublished ? 'text-[var(--color-success)] bg-white dark:bg-neutral-800 shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
                      >
                        {attraction.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      {/* Delete Action */}
                      <button
                        title="Delete Record"
                        onClick={() => deleteAttraction(attraction.id, attraction.name.en)}
                        className="p-1.5 rounded-md transition-colors text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
