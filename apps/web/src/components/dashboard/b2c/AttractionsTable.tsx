"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Search,
  Plus
} from "lucide-react"

type AttractionSummary = {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  heroMediaUrl: string | null
  isPublished: boolean
  isHidden: boolean
  createdAt: Date
}

export function AttractionsTable({ attractions }: { attractions: AttractionSummary[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  
  const filtered = attractions.filter(a => 
    a.nameEn.toLowerCase().includes(search.toLowerCase()) || 
    a.nameAr.includes(search)
  )

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) setSelected([])
    else setSelected(filtered.map(a => a.id))
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attraction?")) return
    
    await fetch(`/api/b2c/attractions/${id}`, { method: "DELETE" })
    router.refresh()
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} attractions?`)) return
    
    await fetch(`/api/b2c/attractions/bulk`, { 
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected })
    })
    setSelected([])
    router.refresh()
  }

  const handleBulkTogglePublish = async (isPublished: boolean) => {
    await fetch(`/api/b2c/attractions/bulk`, { 
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, isPublished })
    })
    setSelected([])
    router.refresh()
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search attractions..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--surface-default)] border border-[var(--border-default)] focus:border-[var(--color-primary)] focus:outline-none transition-colors text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selected.length > 0 && (
            <div className="flex items-center gap-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1.5 rounded-lg text-sm font-bold">
              <span>{selected.length} selected</span>
              <div className="w-px h-4 bg-[var(--color-primary)]/20 mx-1" />
              <button onClick={() => handleBulkTogglePublish(false)} className="hover:underline">Unpublish</button>
              <button onClick={() => handleBulkTogglePublish(true)} className="hover:underline">Publish</button>
              <button onClick={handleBulkDelete} className="text-[var(--color-error)] hover:underline ml-2">Delete</button>
            </div>
          )}
          
          <Link 
            href="/dashboard/b2c/attractions/new"
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity ml-auto"
          >
            <Plus className="w-4 h-4" />
            Add Attraction
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-hover)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-4 w-12">
                  <input 
                    type="checkbox" 
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-[var(--border-default)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                </th>
                <th className="p-4 font-bold">Attraction</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[var(--text-tertiary)]">
                    No attractions found.
                  </td>
                </tr>
              ) : (
                filtered.map(attraction => (
                  <tr key={attraction.id} className="hover:bg-[var(--surface-hover)]/50 transition-colors">
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        checked={selected.includes(attraction.id)}
                        onChange={() => toggleSelect(attraction.id)}
                        className="rounded border-[var(--border-default)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[var(--surface-active)] overflow-hidden shrink-0 border border-[var(--border-default)]">
                          {attraction.heroMediaUrl ? (
                            <img src={attraction.heroMediaUrl} alt={attraction.nameEn} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]">No Img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text-primary)]">{attraction.nameEn}</p>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{attraction.nameAr}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${attraction.isPublished ? 'bg-green-500/10 text-green-500' : 'bg-[var(--surface-active)] text-[var(--text-tertiary)]'}`}>
                        {attraction.isPublished ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {attraction.isPublished ? 'Published' : 'Draft'}
                      </span>
                      {attraction.isHidden && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--surface-active)] text-[var(--text-tertiary)] ml-2">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={`/en/b2c/attractions/${attraction.slug}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors rounded-lg hover:bg-[var(--surface-active)]"
                          title="View Live"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <Link 
                          href={`/dashboard/b2c/attractions/${attraction.id}/edit`}
                          className="p-2 text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors rounded-lg hover:bg-[var(--surface-active)]"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(attraction.id)}
                          className="p-2 text-[var(--text-secondary)] hover:text-[var(--color-error)] transition-colors rounded-lg hover:bg-[var(--surface-active)]"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
