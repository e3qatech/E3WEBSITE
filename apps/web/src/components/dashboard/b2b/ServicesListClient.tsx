"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit2, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/Button"

export function ServicesListClient({ initialData }: { initialData: any[] }) {
  const router = useRouter()
  const [services, setServices] = useState(initialData)
  const [search, setSearch] = useState("")

  const filteredServices = services.filter(s => 
    s.titleEn.toLowerCase().includes(search.toLowerCase()) || 
    s.slug.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    try {
      const res = await fetch(`/api/b2b/services/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      
      setServices(services.filter(s => s.id !== id))
      router.refresh()
    } catch (error) {
      alert("Failed to delete service")
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">B2B Services</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage corporate services and offerings.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/b2b/services/new")} className="gap-2 rounded-xl">
          <Plus className="w-4 h-4" /> Add Service
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search services..."
          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl py-3 pl-10 pr-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />
      </div>

      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--surface-subtle)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Service</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {filteredServices.map(service => (
                <tr key={service.id} className="hover:bg-[var(--surface-hover)] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      {service.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={service.thumbnail} alt={service.titleEn} className="w-12 h-12 rounded-xl object-cover border border-[var(--border-default)]" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-[var(--border-default)] flex items-center justify-center text-zinc-600">
                          <Settings className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">{service.titleEn}</div>
                        <div className="text-xs text-[var(--text-tertiary)] mt-0.5">/{service.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {service.isVisible ? (
                        <span className="inline-flex w-fit px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold tracking-wider uppercase">Visible</span>
                      ) : (
                        <span className="inline-flex w-fit px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-500 text-[10px] font-bold tracking-wider uppercase">Hidden</span>
                      )}
                      {service.isFeatured && (
                        <span className="inline-flex w-fit px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold tracking-wider uppercase">Featured</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button onClick={() => router.push(`/dashboard/b2b/services/${service.slug}`)} variant="outline" size="sm" className="h-8 gap-2 rounded-lg">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <button onClick={() => handleDelete(service.id)} className="p-2 text-[var(--text-secondary)] hover:text-red-500 bg-[var(--surface-subtle)] hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-[var(--text-tertiary)] font-medium">
                    No services found. Click "Add Service" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
