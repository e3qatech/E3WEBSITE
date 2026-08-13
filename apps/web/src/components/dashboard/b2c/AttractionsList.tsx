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
  Star,
  Trash2,
  Filter,
  Layers,
  ImageOff
} from "lucide-react"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { Badge } from "@/components/ui/Badge"
import { AdminPageHeader } from "@/components/dashboard/ui/AdminPageHeader"

type Attraction = {
  id: string
  name: { en: string; ar: string }
  slug: string
  isPublished: boolean
  isFeatured: boolean
  isB2bVisible?: boolean
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

export function AttractionsList({ initialAttractions }: { initialAttractions: Attraction[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [attractions, setAttractions] = useState(initialAttractions)

  // Filter States
  const [publicationFilter, setPublicationFilter] = useState<string>("ALL")
  const [scopeFilter, setScopeFilter] = useState<string>("ALL") // ALL (38), CANONICAL (34), LEGACY (4)

  const filtered = useMemo(() => {
    return attractions.filter(a => {
      const q = search.toLowerCase().trim()
      const matchesSearch = !q ||
        a.name.en.toLowerCase().includes(q) ||
        a.name.ar.includes(q) ||
        a.slug.toLowerCase().includes(q)

      const matchesPublication = publicationFilter === "ALL" ||
        (publicationFilter === "PUBLISHED" && a.isPublished) ||
        (publicationFilter === "DRAFT" && !a.isPublished)

      const matchesScope = scopeFilter === "ALL" ||
        (scopeFilter === "CANONICAL" && a.isB2bVisible !== false) ||
        (scopeFilter === "LEGACY" && a.isB2bVisible === false)

      return matchesSearch && matchesPublication && matchesScope
    })
  }, [attractions, search, publicationFilter, scopeFilter])

  const canonicalCount = useMemo(() => attractions.filter(a => a.isB2bVisible !== false).length, [attractions])
  const legacyCount = useMemo(() => attractions.filter(a => a.isB2bVisible === false).length, [attractions])

  const toggleStatus = async (id: string, field: "isPublished" | "isFeatured", currentValue: boolean) => {
    try {
      const res = await fetch(`/api/b2c/attractions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue })
      })
      if (!res.ok) throw new Error()

      setAttractions(prev => prev.map(a =>
        a.id === id ? { ...a, [field]: !currentValue } : a
      ))
      router.refresh()
    } catch {
      alert(`Failed to update ${field}`)
    }
  }

  const deleteAttraction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attraction? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/b2c/attractions/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete attraction");
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
        title="B2C Attractions"
        description="Manage consumer experiences, pricing, and FAQs."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "B2C Portal" },
          { label: "Attractions" }
        ]}
        action={
          <div className="flex items-center gap-3">
            <Link href="/dashboard/b2c/attractions/new">
              <AdminButton variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                New Attraction
              </AdminButton>
            </Link>
          </div>
        }
      />

      {/* Control Bar: Search & Multi-Filters */}
      <div className="bg-[var(--surface-default)] p-4 rounded-2xl border border-[var(--border-default)] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search attractions by name or slug..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ps-9 pe-4 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)] w-full shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Scope Filter */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <Layers className="w-3.5 h-3.5" />
              <select
                value={scopeFilter}
                onChange={e => setScopeFilter(e.target.value)}
                className="bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
              >
                <option value="ALL">All Records ({attractions.length})</option>
                <option value="CANONICAL">Canonical E3 ({canonicalCount})</option>
                <option value="LEGACY">Legacy / Test ({legacyCount})</option>
              </select>
            </div>

            {/* Publication Filter */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <Filter className="w-3.5 h-3.5" />
              <select
                value={publicationFilter}
                onChange={e => setPublicationFilter(e.target.value)}
                className="bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published (Live)</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Counter Badge Header */}
        <div className="flex items-center justify-between border-t border-[var(--border-default)] pt-3 text-xs text-[var(--text-secondary)]">
          <div>
            Showing <strong className="text-[var(--text-primary)]">{filtered.length}</strong> of <strong className="text-[var(--text-primary)]">{attractions.length}</strong> Attractions
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
              {canonicalCount} Canonical E3
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
              {legacyCount} Legacy/Test
            </span>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)]">
          <MapPin className="w-12 h-12 mx-auto text-[var(--text-tertiary)] opacity-40 mb-3" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No attractions match the current filters</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Try adjusting your search terms or filter dropdowns.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(attraction => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={attraction.id}
              className="group flex flex-col bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] shadow-sm hover:border-[var(--color-primary)] transition-colors overflow-hidden"
            >
              {/* Hero Image / Media Preview */}
              <div className="relative aspect-video bg-[var(--surface-subtle)] overflow-hidden">
                {(() => {
                  const isIframe = attraction.heroMediaType === 'IFRAME';
                  const imgSrc = attraction.heroThumbnailUrl || attraction.heroFallbackUrl || (!isIframe ? attraction.heroMediaUrl : null);

                  if (imgSrc) {
                    return (
                      <img
                        src={imgSrc}
                        alt={attraction.name.en}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    );
                  }

                  return null;
                })()}

                {/* Fallback Display (shown if no imgSrc or image fails to load) */}
                <div
                  className="w-full h-full flex flex-col items-center justify-center bg-[var(--surface-subtle)] text-[var(--text-tertiary)] gap-1"
                  style={{ display: attraction.heroThumbnailUrl || attraction.heroFallbackUrl || (!attraction.heroMediaType || attraction.heroMediaType !== 'IFRAME' ? attraction.heroMediaUrl : null) ? 'none' : 'flex' }}
                >
                  <ImageOff className="w-6 h-6 opacity-40" />
                  <span className="text-[10px] font-medium opacity-60">No Hero Media</span>
                </div>

                {/* Top Badges Overlay */}
                <div className="absolute top-3 start-3 flex flex-col gap-1">
                  <Badge variant={attraction.isPublished ? "success" : "default"} className="shadow-sm backdrop-blur-md bg-white/90 dark:bg-zinc-950/90">
                    {attraction.isPublished ? "Live" : "Draft"}
                  </Badge>
                  {attraction.isB2bVisible === false && (
                    <Badge variant="default" className="shadow-sm backdrop-blur-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      Legacy / Hidden
                    </Badge>
                  )}
                  {attraction.isFeatured && (
                    <Badge variant="warning" className="shadow-sm backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 gap-1">
                      <Star className="w-3 h-3 fill-current" /> Featured
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--text-primary)] mb-1 leading-snug">{attraction.name.en}</h3>
                  <h4 className="text-sm text-[var(--text-secondary)] font-arabic">{attraction.name.ar}</h4>
                  <div className="text-[11px] font-mono text-[var(--text-tertiary)] truncate mt-1">/{attraction.slug}</div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 py-3 border-y border-[var(--border-default)]">
                  <div className="text-center">
                    <div className="text-xs text-[var(--text-tertiary)] mb-0.5">Tiers</div>
                    <div className="font-mono text-sm font-bold text-[var(--text-primary)]">{attraction._count.pricing}</div>
                  </div>
                  <div className="text-center border-x border-[var(--border-default)]">
                    <div className="text-xs text-[var(--text-tertiary)] mb-0.5">Offers</div>
                    <div className="font-mono text-sm font-bold text-[var(--text-primary)]">{attraction._count.offers}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[var(--text-tertiary)] mb-0.5">FAQs</div>
                    <div className="font-mono text-sm font-bold text-[var(--text-primary)]">{attraction._count.faqs}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  <Link href={`/dashboard/b2c/attractions/${attraction.id}/edit`} className="flex-1">
                    <AdminButton variant="outline" className="w-full" leftIcon={<Edit3 className="w-4 h-4" />}>
                      Edit
                    </AdminButton>
                  </Link>
                  <div className="flex bg-[var(--surface-subtle)] rounded-lg p-1">
                    <button
                      title="Toggle Publish Status"
                      onClick={() => toggleStatus(attraction.id, "isPublished", attraction.isPublished)}
                      className={`p-2 rounded-md transition-colors ${attraction.isPublished ? 'text-[var(--color-success)] bg-white dark:bg-neutral-800 shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
                    >
                      {attraction.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      title="Toggle Featured Status"
                      onClick={() => toggleStatus(attraction.id, "isFeatured", attraction.isFeatured)}
                      className={`p-2 rounded-md transition-colors ${attraction.isFeatured ? 'text-[var(--color-warning)] bg-white dark:bg-neutral-800 shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
                    >
                      <Star className={`w-4 h-4 ${attraction.isFeatured ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      title="Delete Attraction"
                      onClick={() => deleteAttraction(attraction.id)}
                      className="p-2 rounded-md transition-colors text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
