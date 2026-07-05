"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Globe, Building2, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"

type Client = {
  id: string
  company: string
  type: string
  industry: string | null
  website: string | null
  assignedRepId: string | null
  createdAt: string
}

export function ClientsList({ initialClients }: { initialClients: Client[] }) {
  const router = useRouter()
  const [clients, setClients] = useState(initialClients)
  const [search, setSearch] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      company: formData.get("company"),
      type: formData.get("type"),
      industry: formData.get("industry"),
      website: formData.get("website")
    }

    try {
      const res = await fetch("/api/crm/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!res.ok) throw new Error()
      
      const newClient = await res.json()
      setClients(prev => [newClient, ...prev])
      setIsAdding(false)
      router.refresh()
    } catch {
      alert("Failed to add client")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return
    try {
      const res = await fetch(`/api/crm/clients/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()

      setClients(prev => prev.filter(c => c.id !== id))
      router.refresh()
    } catch {
      alert("Failed to delete client")
    }
  }

  const filtered = clients.filter(c => 
    c.company.toLowerCase().includes(search.toLowerCase()) || 
    (c.industry?.toLowerCase().includes(search.toLowerCase()) || false)
  )

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "B2B": return <Badge variant="info">B2B</Badge>
      case "GOVERNMENT": return <Badge variant="warning">Government</Badge>
      case "AGENCY": return <Badge variant="success">Agency</Badge>
      default: return <Badge variant="default">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Clients Database</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage accounts, agencies, and government partners.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ps-9 pe-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] w-full md:w-64"
            />
          </div>
          <Button className="gap-2" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" /> Add Client
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddClient}
            className="bg-[var(--surface-default)] rounded-2xl w-full max-w-lg p-6 border border-[var(--border-default)] shadow-xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">New Client</h2>
              <button type="button" onClick={() => setIsAdding(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Company Name *</label>
                <input required name="company" className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Type</label>
                  <select name="type" className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm">
                    <option value="B2B">B2B</option>
                    <option value="GOVERNMENT">Government</option>
                    <option value="AGENCY">Agency</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">Industry</label>
                  <input name="industry" className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Website</label>
                <input type="url" name="website" placeholder="https://" className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm" />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Create Client"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-subtle)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Industry</th>
                <th className="px-6 py-4 font-medium">Website</th>
                <th className="px-6 py-4 font-medium">Added On</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-tertiary)]">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No clients found.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--text-primary)]">{c.company}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(c.type)}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {c.industry || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {c.website ? (
                        <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[var(--color-primary)] hover:underline">
                          <Globe className="w-4 h-4" /> {c.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-[var(--text-tertiary)]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
