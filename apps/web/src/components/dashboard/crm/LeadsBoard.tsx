"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Plus, Phone, Mail, Building, MoreVertical, XCircle, ArrowRight } from "lucide-react"
import { AdminPageHeader } from "@/components/dashboard/ui/AdminPageHeader"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import Link from "next/link"

type Lead = {
  id: string
  name: string
  company: string | null
  email: string
  phone: string | null
  status: string
  value: number | null
  createdAt: string
  activities: { timestamp: string }[]
}

const COLUMNS = [
  { id: "NEW", title: "New", color: "bg-blue-500", borderColor: "border-blue-500/30" },
  { id: "CONTACTED", title: "Contacted", color: "bg-amber-500", borderColor: "border-amber-500/30" },
  { id: "QUALIFIED", title: "Qualified", color: "bg-purple-500", borderColor: "border-purple-500/30" },
  { id: "PROPOSAL", title: "Proposal", color: "bg-indigo-500", borderColor: "border-indigo-500/30" },
  { id: "WON", title: "Won", color: "bg-emerald-500", borderColor: "border-emerald-500/30" },
  { id: "LOST", title: "Lost", color: "bg-red-500", borderColor: "border-red-500/30" }
]

export function LeadsBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [search, setSearch] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      company: formData.get("company"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      value: formData.get("value"),
      probability: formData.get("probability"),
    }

    try {
      const res = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!res.ok) throw new Error()
      
      const newLead = await res.json()
      setLeads(prev => [newLead, ...prev])
      setIsAdding(false)
      router.refresh()
    } catch {
      alert("Failed to add lead")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    (l.company && l.company.toLowerCase().includes(search.toLowerCase())) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("leadId", id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData("leadId")
    if (!leadId) return

    const lead = leads.find(l => l.id === leadId)
    if (!lead || lead.status === targetStatus) return

    // Optimistic UI update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: targetStatus } : l))

    // API Call
    try {
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus })
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      // Revert on error
      setLeads(initialLeads)
      alert("Failed to move lead")
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-bg-base overflow-hidden">
      <div className="px-8 pt-8 pb-4">
        <AdminPageHeader 
          title="Sales Pipeline" 
          description="Manage your B2B leads and track sales opportunities."
          action={
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input 
                  type="text" 
                  placeholder="Search leads..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="ps-9 pe-4 py-2 bg-surface-default border border-border-default rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent w-full md:w-64"
                />
              </div>
              <AdminButton variant="primary" onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4 me-2" /> Add Lead
              </AdminButton>
            </div>
          }
        />
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleAddLead}
            className="bg-surface-default rounded-2xl w-full max-w-xl border border-border-default shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-border-default">
              <h2 className="text-xl font-bold text-text-primary">New Lead</h2>
              <button type="button" onClick={() => setIsAdding(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Name *</label>
                  <input required name="name" className="w-full px-4 py-3 bg-surface-hover border border-border-default rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Company</label>
                  <input name="company" className="w-full px-4 py-3 bg-surface-hover border border-border-default rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email *</label>
                  <input required type="email" name="email" className="w-full px-4 py-3 bg-surface-hover border border-border-default rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Phone</label>
                  <input name="phone" className="w-full px-4 py-3 bg-surface-hover border border-border-default rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Value (QAR)</label>
                  <input type="number" name="value" className="w-full px-4 py-3 bg-surface-hover border border-border-default rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Probability (%)</label>
                  <input type="number" min="0" max="100" name="probability" className="w-full px-4 py-3 bg-surface-hover border border-border-default rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent" />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-bg-level-1 border-t border-border-default flex justify-end gap-3 rounded-b-2xl">
              <AdminButton type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</AdminButton>
              <AdminButton type="submit" variant="primary" isLoading={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Lead"}
              </AdminButton>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 flex gap-4 overflow-x-auto px-8 pb-8 custom-scrollbar">
        {COLUMNS.map(col => {
          const columnLeads = filteredLeads.filter(l => l.status === col.id)
          const totalValue = columnLeads.reduce((acc, l) => acc + (l.value || 0), 0)

          return (
            <div 
              key={col.id} 
              className={`w-[320px] shrink-0 flex flex-col bg-surface-default rounded-2xl border-t-[3px] border-x border-b border-border-default shadow-sm overflow-hidden`}
              style={{ borderTopColor: `var(--${col.color.split('-')[1]}-500, currentColor)` }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-4 border-b border-border-default flex items-center justify-between bg-surface-hover/50 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.color}`} />
                  <h3 className="font-bold text-text-primary">{col.title}</h3>
                  <span className="bg-bg-level-2 border border-border-default text-text-secondary text-xs px-2 py-0.5 rounded-full font-medium">
                    {columnLeads.length}
                  </span>
                </div>
                {totalValue > 0 && (
                  <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
                    QAR {(totalValue / 1000).toFixed(1)}k
                  </span>
                )}
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                {columnLeads.map(lead => (
                  <motion.div 
                    layout
                    layoutId={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    key={lead.id}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, lead.id)}
                    className="bg-bg-level-1 p-4 rounded-xl border border-border-default shadow-sm cursor-grab active:cursor-grabbing hover:border-accent/50 hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Link href={`/dashboard/crm/leads/${lead.id}`} className="font-bold text-sm text-text-primary hover:text-accent transition-colors line-clamp-1 flex-1">
                        {lead.name}
                      </Link>
                      {lead.value && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded whitespace-nowrap ml-2 uppercase tracking-wider">
                          {(lead.value / 1000).toFixed(1)}k
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {lead.company && (
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <Building className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                          <span className="truncate font-medium">{lead.company}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <Mail className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                        <span className="truncate font-medium">{lead.email}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-default flex justify-between items-center text-[11px] font-medium text-text-tertiary">
                      <span>
                        {lead.activities.length > 0 
                          ? new Date(lead.activities[0].timestamp).toLocaleDateString()
                          : new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                      <Link href={`/dashboard/crm/leads/${lead.id}`} className="flex items-center gap-1 text-text-tertiary group-hover:text-accent transition-colors">
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
