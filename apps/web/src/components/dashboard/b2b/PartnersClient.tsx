import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, Search, ExternalLink, Briefcase } from "lucide-react"
import { AdminButton } from "../ui/AdminButton"
import { AdminPageHeader } from "../ui/AdminPageHeader"
import { MediaUploader } from "@/components/shared/MediaUploader"

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
    <div className="flex flex-col gap-6 h-full p-6">
      <AdminPageHeader 
        title="Clients CMS"
        description="Manage corporate clients, government partners, and agencies."
        action={
          <AdminButton variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleAddNew}>
            Add Client
          </AdminButton>
        }
      />

      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search partners..."
          className="w-full bg-surface-default border border-border-default rounded-xl py-3 ps-10 pe-4 text-text-primary focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map(partner => (
          <div key={partner.id} className="bg-surface-default border border-border-default rounded-2xl overflow-hidden hover:border-primary/30 transition-colors flex flex-col group relative">
            <div className="aspect-[3/2] bg-surface-hover flex items-center justify-center p-6 relative border-b border-border-default">
              {partner.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partner.logoUrl} alt={partner.name} className="max-w-full max-h-full object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
              ) : (
                <div className="text-text-tertiary font-bold flex flex-col items-center gap-2">
                  <Briefcase className="w-8 h-8 opacity-50" />
                  <span>{partner.name}</span>
                </div>
              )}
              <div className="absolute top-3 end-3 flex items-center gap-2">
                {partner.isVisible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 bg-surface-active rounded-full" />
                ) : (
                  <XCircle className="w-5 h-5 text-text-tertiary bg-surface-active rounded-full" />
                )}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-bold text-text-primary line-clamp-1">{partner.name}</h3>
                  <div className="text-xs font-bold text-primary mt-1 tracking-wider uppercase">{partner.category.replace(/_/g, ' ')}</div>
                </div>
              </div>
              
              {partner.description && (
                <p className="text-sm text-text-secondary line-clamp-2 mt-2">{partner.description}</p>
              )}
              
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-border-default">
                {partner.website ? (
                  <a href={partner.website} target="_blank" rel="noreferrer" className="text-xs text-text-tertiary hover:text-primary flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Visit Site
                  </a>
                ) : <span />}
                
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(partner)} className="p-2 text-text-secondary hover:text-primary bg-surface-subtle hover:bg-primary/10 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(partner.id)} className="p-2 text-text-secondary hover:text-error bg-surface-subtle hover:bg-error/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredPartners.length === 0 && (
          <div className="col-span-full py-12 text-center text-text-tertiary border-2 border-dashed border-border-default rounded-2xl font-medium">
            No partners found. Click "Add Client" to get started.
          </div>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-default border border-border-default rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-surface-default/80 backdrop-blur-md border-b border-border-default px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-text-primary">
                {isEditing === "new" ? "Add Client" : "Edit Client"}
              </h2>
              <button onClick={() => setIsEditing(null)} className="p-2 text-text-tertiary hover:text-text-primary rounded-lg transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary">Name *</label>
                  <input 
                    type="text" 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-text-primary" 
                    placeholder="e.g. Qatar Tourism"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary">Category</label>
                  <select 
                    value={editForm.category} 
                    onChange={e => setEditForm({...editForm, category: e.target.value})}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-text-primary appearance-none"
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
                <label className="text-sm font-bold text-text-secondary">Logo Image</label>
                <div className="bg-surface-hover p-4 rounded-xl border border-border-default">
                  <MediaUploader 
                    value={editForm.logoUrl} 
                    onChange={(url) => setEditForm({...editForm, logoUrl: url})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary">Website URL (Optional)</label>
                <input 
                  type="url" 
                  value={editForm.website || ""} 
                  onChange={e => setEditForm({...editForm, website: e.target.value})}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-text-primary" 
                  placeholder="https://"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary">Description (Optional)</label>
                <textarea 
                  value={editForm.description || ""} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-text-primary resize-none" 
                  placeholder="Brief description about the partnership..."
                />
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-border-default">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editForm.isVisible} 
                    onChange={e => setEditForm({...editForm, isVisible: e.target.checked})}
                    className="w-5 h-5 rounded border-border-default text-primary focus:ring-primary bg-surface-hover"
                  />
                  <span className="text-sm font-bold text-text-primary">Visible on Website</span>
                </label>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-text-secondary">Order</label>
                  <input 
                    type="number" 
                    value={editForm.orderIndex} 
                    onChange={e => setEditForm({...editForm, orderIndex: parseInt(e.target.value) || 0})}
                    className="w-20 bg-surface-hover border border-border-default rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary text-text-primary" 
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-surface-default border-t border-border-default px-6 py-4 flex items-center justify-end gap-3 z-10">
              <AdminButton variant="secondary" onClick={() => setIsEditing(null)} disabled={isSaving}>
                Cancel
              </AdminButton>
              <AdminButton variant="primary" onClick={handleSave} isLoading={isSaving}>
                {isSaving ? "Saving..." : "Save Client"}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

