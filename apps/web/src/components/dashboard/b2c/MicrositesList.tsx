"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2,
  FolderOpen
} from "lucide-react"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { Badge } from "@/components/ui/Badge"
import { AdminPageHeader } from "@/components/dashboard/ui/AdminPageHeader"

type Microsite = {
  id: string
  slug: string
  titleEn: string
  titleAr: string
  status: string
  attraction: {
    nameEn: string
    nameAr: string
  } | null
}

export function MicrositesList({ initialMicrosites }: { initialMicrosites: Microsite[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [microsites, setMicrosites] = useState(initialMicrosites)

  const filtered = microsites.filter(m => 
    m.titleEn.toLowerCase().includes(search.toLowerCase()) || 
    m.titleAr.includes(search)
  )

  const deleteMicrosite = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project microsite? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/microsites/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete microsite");
      }
      
      setMicrosites(prev => prev.filter(m => m.id !== id))
      router.refresh()
    } catch (err: any) {
      alert(err.message || "Failed to delete microsite")
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-[1600px] mx-auto animate-fade-in-up">
      <AdminPageHeader 
        title="Project Microsites"
        description="Manage case studies and project narratives."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "B2C Portal" },
          { label: "Microsites" }
        ]}
        action={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--color-primary)] w-full md:w-64 shadow-sm"
              />
            </div>
            <Link href="/dashboard/b2c/microsites/new">
              <AdminButton variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                New Project
              </AdminButton>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(microsite => (
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={microsite.id}
            className="group flex flex-col bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] shadow-sm hover:border-[var(--color-primary)] transition-colors overflow-hidden"
          >
            {/* Header Icon */}
            <div className="relative aspect-video bg-[var(--surface-subtle)] overflow-hidden flex items-center justify-center">
              <FolderOpen className="w-12 h-12 text-[var(--text-tertiary)] opacity-50 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                <Badge variant={microsite.status === 'ACTIVE' ? "success" : microsite.status === 'COMPLETED' ? "default" : "error"} className="shadow-sm backdrop-blur-md bg-white/90 dark:bg-black/90">
                  {microsite.status}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex-1">
                <h3 className="font-bold text-[var(--text-primary)] mb-1">{microsite.titleEn}</h3>
                <h4 className="text-sm text-[var(--text-secondary)] font-arabic">{microsite.titleAr}</h4>
              </div>

              {/* Linked Attraction */}
              {microsite.attraction && (
                <div className="mt-4 pt-3 border-t border-[var(--border-default)] text-sm">
                  <span className="text-[var(--text-tertiary)] block text-xs mb-1">Linked Attraction:</span>
                  <span className="font-medium text-[var(--text-secondary)]">{microsite.attraction.nameEn}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <Link href={`/dashboard/b2c/microsites/${microsite.id}/edit`} className="flex-1">
                  <AdminButton variant="outline" className="w-full" leftIcon={<Edit3 className="w-4 h-4" />}>
                    Edit
                  </AdminButton>
                </Link>
                <button 
                  title="Delete Microsite"
                  onClick={() => deleteMicrosite(microsite.id)}
                  className="p-2 rounded-md transition-colors text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
