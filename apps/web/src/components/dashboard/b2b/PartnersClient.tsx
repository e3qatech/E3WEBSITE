"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, Search, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MediaUploader } from "@/components/ui/MediaUploader"

export function PartnersClient({ initialData }: { initialData: any[] }) {
  const router = useRouter()
  const [partners, setPartners] = useState(initialData)
  const [search, setSearch] = useState("")
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddNew = () => {
    setEditForm({
      name: "",
      website: "",
      category: "TECHNOLOGY",
      description: "",
      logoUrl: "",
      isVisible: true,
      orderIndex: 0
    })
    setIsEditing("new")
  }

  const handleEdit = (partner: any) => {
    setEditForm({ ...partner })
    setIsEditing(partner.id)
  }

  const handleSave = async () => {
    if (!editForm.name) {
      alert("Name is required")
      return
    }

    setIsSaving(true)
    try {
      const isNew = isEditing === "new"
      const url = isNew ? `/api/b2b/partners` : `/api/b2b/partners/${isEditing}`
      const method = isNew ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })

      if (!res.ok) throw new Error("Failed to save")

      const data = await res.json()
      
      if (isNew) {
        setPartners([...partners, data.partner])
      } else {
        setPartners(partners.map(p => p.id === isEditing ? data.partner : p))
      }

      setIsEditing(null)
      router.refresh()
    } catch (error) {
      alert("Failed to save partner")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner?")) return

    try {
      const res = await fetch(`/api/b2b/partners/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      
      setPartners(partners.filter(p => p.id !== id))
      router.refresh()
    } catch (error) {
      alert("Failed to delete partner")
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Clients CMS</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage corporate clients, government partners, and agencies.</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2 rounded-xl">
          <Plus className="w-4 h-4" /> Add Client
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search partners..."
          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl py-3 ps-10 pe-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map(partner => (
          <div key={partner.id} className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden hover:border-[var(--color-primary)]/30 transition-colors flex flex-col group">
            <div className="aspect-[3/2] bg-zinc-950 flex items-center justify-center p-6 relative border-b border-[var(--border-default)]">
              {partner.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partner.logoUrl} alt={partner.name} className="max-w-full max-h-full object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
              ) : (
                <div className="text-[var(--text-tertiary)] font-bold text-xl">{partner.name}</div>
              )}
              <div className="absolute top-3 end-3 flex items-center gap-2">
                {partner.isVisible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-zinc-950/50 rounded-full" />
                ) : (
                  <XCircle className="w-5 h-5 text-zinc-500 bg-zinc-950/50 rounded-full" />
                )}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] line-clamp-1">{partner.name}</h3>
                  <div className="text-xs font-bold text-[var(--color-primary)] mt-1 tracking-wider uppercase">{partner.category.replace(/_/g, ' ')}</div>
                </div>
              </div>
              
              {partner.description && (
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mt-2">{partner.description}</p>
              )}
              
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--border-default)]">
                {partner.website ? (
                  <a href={partner.website} target="_blank" rel="noreferrer" className="text-xs text-[var(--text-tertiary)] hover:text-[var(--color-primary)] flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Visit Site
                  </a>
                ) : <span />}
                
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(partner)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--color-primary)] bg-[var(--surface-subtle)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(partner.id)} className="p-2 text-[var(--text-secondary)] hover:text-red-500 bg-[var(--surface-subtle)] hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredPartners.length === 0 && (
          <div className="col-span-full py-12 text-center text-[var(--text-tertiary)] border-2 border-dashed border-[var(--border-default)] rounded-2xl font-medium">
            No partners found. Click "Add Partner" to get started.
          </div>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-[var(--surface-default)]/80 backdrop-blur-md border-b border-[var(--border-default)] px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {isEditing === "new" ? "Add Partner" : "Edit Partner"}
              </h2>
              <button onClick={() => setIsEditing(null)} className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-lg transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-secondary)]">Name *</label>
                  <input 
                    type="text" 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]" 
                    placeholder="e.g. Qatar Tourism"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-secondary)]">Category</label>
                  <select 
                    value={editForm.category} 
                    onChange={e => setEditForm({...editForm, category: e.target.value})}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] appearance-none"
                  >
                    <option value="GOVERNMENT">Government & Tourism</option>
                    <option value="CORPORATE">Corporate & Brands</option>
                    <option value="VENUE">Venues & Destinations</option>
                    <option value="AGENCY">Agencies</option>
                    <option value="TECHNOLOGY">Technology</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-secondary)]">Logo Image</label>
                <div className="bg-[var(--surface-subtle)] p-4 rounded-xl border border-[var(--border-default)]">
                  <MediaUploader 
                    value={editForm.logoUrl} 
                    onChange={(url) => setEditForm({...editForm, logoUrl: url})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-secondary)]">Website URL (Optional)</label>
                <input 
                  type="url" 
                  value={editForm.website || ""} 
                  onChange={e => setEditForm({...editForm, website: e.target.value})}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]" 
                  placeholder="https://"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-secondary)]">Description (Optional)</label>
                <textarea 
                  value={editForm.description || ""} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] resize-none" 
                  placeholder="Brief description about the partnership..."
                />
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-[var(--border-default)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editForm.isVisible} 
                    onChange={e => setEditForm({...editForm, isVisible: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-sm font-bold text-[var(--text-primary)]">Visible on Website</span>
                </label>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-[var(--text-secondary)]">Order</label>
                  <input 
                    type="number" 
                    value={editForm.orderIndex} 
                    onChange={e => setEditForm({...editForm, orderIndex: parseInt(e.target.value) || 0})}
                    className="w-20 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[var(--color-primary)]" 
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-[var(--surface-default)] border-t border-[var(--border-default)] px-6 py-4 flex items-center justify-end gap-3 z-10">
              <Button type="button" variant="outline" onClick={() => setIsEditing(null)} disabled={isSaving} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="rounded-xl">
                {isSaving ? "Saving..." : "Save Partner"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
