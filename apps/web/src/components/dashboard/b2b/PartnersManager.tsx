"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Building2, Plus, Globe, ArrowUp, ArrowDown, Trash2, 
  ToggleLeft, ToggleRight, Check, AlertCircle, RefreshCw 
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { useRouter } from "next/navigation"

interface Partner {
  id: string
  name: string
  website?: string | null
  category: string
  description?: string | null
  logoUrl?: string | null
  isVisible: boolean
  orderIndex: number
}

interface PartnersManagerProps {
  initialPartners: Partner[]
}

const CATEGORIES = [
  "SPONSOR", "VENUE", "TECHNOLOGY", "MEDIA", "GOVERNMENT", "VENDOR"
]

export function PartnersManager({ initialPartners }: PartnersManagerProps) {
  const [partners, setPartners] = useState<Partner[]>(
    [...initialPartners].sort((a, b) => a.orderIndex - b.orderIndex)
  )
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newPartner, setNewPartner] = useState({
    name: "",
    website: "",
    category: "SPONSOR",
    description: "",
    logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=120&auto=format&fit=crop",
    isVisible: true
  })
  const router = useRouter()

  const handleToggleVisibility = async (id: string, currentVal: boolean) => {
    setPartners(prev => prev.map(p => p.id === id ? { ...p, isVisible: !currentVal } : p))
    
    try {
      const res = await fetch(`/api/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentVal })
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setPartners(prev => prev.map(p => p.id === id ? { ...p, isVisible: currentVal } : p))
      alert("Failed to update visibility")
    }
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= partners.length) return

    const newPartners = [...partners]
    const temp = newPartners[index]
    newPartners[index] = newPartners[nextIndex]
    newPartners[nextIndex] = temp

    // Re-index
    const updatedPartners = newPartners.map((p, idx) => ({ ...p, orderIndex: idx }))
    setPartners(updatedPartners)

    try {
      const res = await fetch("/api/partners/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders: updatedPartners.map(p => ({ id: p.id, orderIndex: p.orderIndex }))
        })
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      alert("Failed to save new order index")
    }
  }

  const handleAddPartner = async () => {
    if (!newPartner.name) return
    setIsSaving(true)

    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPartner,
          orderIndex: partners.length
        })
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPartners(prev => [...prev, data].sort((a, b) => a.orderIndex - b.orderIndex))
      setShowAddModal(false)
      setNewPartner({
        name: "",
        website: "",
        category: "SPONSOR",
        description: "",
        logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=120&auto=format&fit=crop",
        isVisible: true
      })
      router.refresh()
    } catch {
      alert("Failed to add partner")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePartner = async (id: string) => {
    if (!confirm("Are you sure you want to remove this partner?")) return

    try {
      const res = await fetch(`/api/partners/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setPartners(prev => prev.filter(p => p.id !== id))
      router.refresh()
    } catch {
      alert("Failed to delete partner")
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Corporate Partners Directory</h1>
          <p className="text-sm text-text-secondary">Manage relationships and marketing logos for sponsors and venue hosts.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Add Partner Link
        </Button>
      </div>

      {partners.length === 0 ? (
        <div className="border border-dashed border-border-default rounded-xl p-12 text-center bg-surface-default">
          <Building2 className="w-12 h-12 mx-auto text-text-tertiary mb-4" />
          <p className="text-sm font-bold text-text-primary mb-1">No partners added</p>
          <p className="text-xs text-text-secondary">Add corporate entities like Qatar Tourism or UDC to begin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Re-order & Quick Control Roster (Left/2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-surface-default rounded-xl border border-border-default shadow-sm overflow-hidden">
              <div className="p-4 bg-surface-hover border-b border-border-default flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Priority Sorting & Status</span>
                <Badge variant="default" className="font-mono text-xs">{partners.length} Entities</Badge>
              </div>

              <div className="divide-y divide-border-default">
                {partners.map((partner, idx) => (
                  <div key={partner.id} className="p-4 flex items-center gap-4 hover:bg-surface-hover transition-colors">
                    {/* Re-order controls */}
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 text-text-tertiary hover:text-accent disabled:opacity-30 rounded hover:bg-surface-hover"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === partners.length - 1}
                        className="p-1 text-text-tertiary hover:text-accent disabled:opacity-30 rounded hover:bg-surface-hover"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Logo & Info */}
                    <img 
                      src={partner.logoUrl || "/placeholder-logo.png"} 
                      alt={partner.name} 
                      className="w-12 h-12 rounded-lg object-contain bg-surface-hover p-2 border border-border-default"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-text-primary truncate">{partner.name}</span>
                        <Badge className="text-[10px] font-black uppercase tracking-wider">{partner.category}</Badge>
                      </div>
                      <div className="text-xs text-text-secondary truncate">{partner.website || "No website listed"}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      {/* Publish Switch */}
                      <button 
                        onClick={() => handleToggleVisibility(partner.id, partner.isVisible)}
                        className="flex items-center gap-1 text-text-secondary hover:text-text-primary"
                      >
                        {partner.isVisible ? (
                          <ToggleRight className="w-9 h-9 text-green-500 transition-colors" />
                        ) : (
                          <ToggleLeft className="w-9 h-9 text-text-tertiary transition-colors" />
                        )}
                      </button>

                      {/* Delete */}
                      <button 
                        onClick={() => handleDeletePartner(partner.id)}
                        className="p-2 text-text-tertiary hover:text-red-500 rounded-lg hover:bg-surface-hover transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Public Ribbons Preview (Right/1 Col) */}
          <div className="space-y-6">
            <div className="bg-surface-default p-6 rounded-xl border border-border-default space-y-4">
              <h3 className="font-black text-xs text-text-secondary uppercase tracking-wider border-b border-border-default pb-2">
                Public Ribbon Preview
              </h3>
              <p className="text-xs text-text-secondary">Simulated public site footer ribbon showing only visible partners sorted by priority index.</p>
              
              <div className="p-4 bg-surface-hover rounded-lg border border-border-default flex flex-wrap gap-3 items-center justify-center min-h-24">
                {partners.filter(p => p.isVisible).map(p => (
                  <img 
                    key={p.id}
                    src={p.logoUrl || ""}
                    alt={p.name}
                    className="h-8 max-w-20 object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                    title={p.name}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-default border border-border-default rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-border-default">
              <h3 className="text-lg font-black text-text-primary">Add Corporate Partner</h3>
              <p className="text-xs text-text-secondary">Create sponsor, venue, or media links</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary">Company Name</label>
                <input 
                  type="text" 
                  value={newPartner.name}
                  onChange={e => setNewPartner(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-surface-hover border border-border-default rounded-lg p-2.5 text-sm outline-none text-text-primary"
                  placeholder="e.g. Qatar Tourism"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary">Website URL</label>
                <input 
                  type="text" 
                  value={newPartner.website}
                  onChange={e => setNewPartner(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full bg-surface-hover border border-border-default rounded-lg p-2.5 text-sm outline-none text-text-primary"
                  placeholder="https://example.qa"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary">Category</label>
                <select 
                  value={newPartner.category}
                  onChange={e => setNewPartner(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-surface-hover border border-border-default rounded-lg p-2.5 text-sm outline-none text-text-primary"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary">Logo URL</label>
                <input 
                  type="text" 
                  value={newPartner.logoUrl}
                  onChange={e => setNewPartner(prev => ({ ...prev, logoUrl: e.target.value }))}
                  className="w-full bg-surface-hover border border-border-default rounded-lg p-2.5 text-sm outline-none text-text-primary font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary">Description</label>
                <textarea 
                  rows={2}
                  value={newPartner.description}
                  onChange={e => setNewPartner(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-surface-hover border border-border-default rounded-lg p-2.5 text-sm outline-none text-text-primary resize-none"
                  placeholder="Short description of partnership..."
                />
              </div>
            </div>

            <div className="p-6 bg-surface-hover border-t border-border-default flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleAddPartner} disabled={isSaving}>
                {isSaving ? "Saving..." : "Add Partner"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
