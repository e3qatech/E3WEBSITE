"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Search,
  Plus
} from "lucide-react"

type ServiceSummary = {
  id: string
  slug: string
  titleEn: string
  titleAr: string
  thumbnail: string | null
  isVisible: boolean
  isFeatured: boolean
  createdAt: Date
}

export function ServicesTable({ services }: { services: ServiceSummary[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  
  const filtered = services.filter(s => 
    s.titleEn.toLowerCase().includes(search.toLowerCase()) || 
    s.titleAr.includes(search)
  )

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) setSelected([])
    else setSelected(filtered.map(s => s.id))
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return
    
    // Call delete API or server action here
    await fetch(`/api/b2b/services/${id}`, { method: "DELETE" })
    router.refresh()
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} services?`)) return
    
    await fetch(`/api/b2b/services/bulk`, { 
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected })
    })
    setSelected([])
    router.refresh()
  }

  const handleBulkToggleVisibility = async (isVisible: boolean) => {
    await fetch(`/api/b2b/services/bulk`, { 
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, isVisible })
    })
    setSelected([])
    router.refresh()
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search services..." 
            className="w-full ps-10 pe-4 py-2 rounded-xl bg-surface-default border border-border-default focus:border-accent focus:outline-none transition-colors text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selected.length > 0 && (
            <div className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-lg text-sm font-bold">
              <span>{selected.length} selected</span>
              <div className="w-px h-4 bg-accent/20 mx-1" />
              <button onClick={() => handleBulkToggleVisibility(false)} className="hover:underline">Hide</button>
              <button onClick={() => handleBulkToggleVisibility(true)} className="hover:underline">Show</button>
              <button onClick={handleBulkDelete} className="text-error hover:underline ms-2">Delete</button>
            </div>
          )}
          
          <Link 
            href="/dashboard/b2b/services/new"
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity ms-auto"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-default border border-border-default rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-hover border-b border-border-default text-text-secondary">
              <tr>
                <th className="p-4 w-12">
                  <input 
                    type="checkbox" 
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border-default text-accent focus:ring-accent"
                  />
                </th>
                <th className="p-4 font-bold">Service</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Featured</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-tertiary">
                    No services found.
                  </td>
                </tr>
              ) : (
                filtered.map(service => (
                  <tr key={service.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        checked={selected.includes(service.id)}
                        onChange={() => toggleSelect(service.id)}
                        className="rounded border-border-default text-accent focus:ring-accent"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-surface-active overflow-hidden shrink-0 border border-border-default">
                          {service.thumbnail ? (
                            <img src={service.thumbnail} alt={service.titleEn} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-tertiary">No Img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-text-primary">{service.titleEn}</p>
                          <p className="text-xs text-text-secondary mt-0.5">{service.titleAr}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${service.isVisible ? 'bg-green-500/10 text-green-500' : 'bg-surface-active text-text-tertiary'}`}>
                        {service.isVisible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {service.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-4">
                      {service.isFeatured ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent">
                          Featured
                        </span>
                      ) : (
                        <span className="text-text-tertiary">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={`/en/b2b/services/${service.slug}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-text-secondary hover:text-accent transition-colors rounded-lg hover:bg-surface-active"
                          title="View Live"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <Link 
                          href={`/dashboard/b2b/services/${service.id}/edit`}
                          className="p-2 text-text-secondary hover:text-accent transition-colors rounded-lg hover:bg-surface-active"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(service.id)}
                          className="p-2 text-text-secondary hover:text-error transition-colors rounded-lg hover:bg-surface-active"
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
