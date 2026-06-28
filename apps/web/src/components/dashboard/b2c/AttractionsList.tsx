"use client"

import { useState } from "react"
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
  CalendarDays,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"

type Attraction = {
  id: string
  name: { en: string; ar: string }
  slug: string
  isPublished: boolean
  isFeatured: boolean
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

  const filtered = attractions.filter(a => 
    a.name.en.toLowerCase().includes(search.toLowerCase()) || 
    a.name.ar.includes(search)
  )

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
      if (!res.ok) throw new Error()
      
      setAttractions(prev => prev.filter(a => a.id !== id))
      router.refresh()
    } catch {
      alert("Failed to delete attraction")
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">B2C Attractions</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage consumer experiences, pricing, and FAQs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Search attractions..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] w-full md:w-64"
            />
          </div>
          <Link href="/dashboard/b2c/attractions/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Attraction
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(attraction => (
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={attraction.id}
            className="group flex flex-col bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] shadow-sm hover:border-[var(--color-primary)] transition-colors overflow-hidden"
          >
            {/* Hero Image */}
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
              
              {/* Fallback Icon (shown if no imgSrc or image fails to load) */}
              <div 
                className="w-full h-full flex items-center justify-center bg-[var(--surface-subtle)]"
                style={{ display: attraction.heroThumbnailUrl || attraction.heroFallbackUrl || (!attraction.heroMediaType || attraction.heroMediaType !== 'IFRAME' ? attraction.heroMediaUrl : null) ? 'none' : 'flex' }}
              >
                <MapPin className="w-8 h-8 text-[var(--text-tertiary)] opacity-50" />
              </div>
              
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                <Badge variant={attraction.isPublished ? "success" : "default"} className="shadow-sm backdrop-blur-md bg-white/90 dark:bg-black/90">
                  {attraction.isPublished ? "Live" : "Draft"}
                </Badge>
                {attraction.isFeatured && (
                  <Badge variant="warning" className="shadow-sm backdrop-blur-md bg-white/90 dark:bg-black/90 gap-1">
                    <Star className="w-3 h-3 fill-current" /> Featured
                  </Badge>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex-1">
                <h3 className="font-bold text-[var(--text-primary)] mb-1">{attraction.name.en}</h3>
                <h4 className="text-sm text-[var(--text-secondary)] font-arabic">{attraction.name.ar}</h4>
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
                  <Button variant="outline" className="w-full gap-2">
                    <Edit3 className="w-4 h-4" /> Edit
                  </Button>
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
    </div>
  )
}
