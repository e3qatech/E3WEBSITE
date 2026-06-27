"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Plus, MoreVertical, Phone, Mail, Building } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
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
  { id: "NEW", title: "New" },
  { id: "CONTACTED", title: "Contacted" },
  { id: "QUALIFIED", title: "Qualified" },
  { id: "PROPOSAL", title: "Proposal" },
  { id: "WON", title: "Won" },
  { id: "LOST", title: "Lost" }
]

export function LeadsBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [search, setSearch] = useState("")

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
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Sales Pipeline</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage your leads and track sales opportunities.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] w-full md:w-64"
            />
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Lead
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {COLUMNS.map(col => {
          const columnLeads = filteredLeads.filter(l => l.status === col.id)
          const totalValue = columnLeads.reduce((acc, l) => acc + (l.value || 0), 0)

          return (
            <div 
              key={col.id} 
              className="w-80 shrink-0 flex flex-col bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-default)]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{col.title}</h3>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {columnLeads.length} {columnLeads.length === 1 ? 'Lead' : 'Leads'} 
                    {totalValue > 0 && ` • QAR ${(totalValue).toLocaleString()}`}
                  </p>
                </div>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {columnLeads.map(lead => (
                  <div 
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="bg-[var(--surface-default)] p-4 rounded-lg border border-[var(--border-default)] shadow-sm cursor-grab active:cursor-grabbing hover:border-[var(--color-primary)] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/dashboard/crm/leads/${lead.id}`} className="font-bold text-sm hover:text-[var(--color-primary)] transition-colors">
                        {lead.name}
                      </Link>
                      {lead.value && (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {(lead.value / 1000).toFixed(1)}k
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {lead.company && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                          <Building className="w-3.5 h-3.5 opacity-70" />
                          <span className="truncate">{lead.company}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                        <Mail className="w-3.5 h-3.5 opacity-70" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--border-default)] flex justify-between items-center text-xs text-[var(--text-tertiary)]">
                      <span>
                        {lead.activities.length > 0 
                          ? new Date(lead.activities[0].timestamp).toLocaleDateString()
                          : new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                      <Link href={`/dashboard/crm/leads/${lead.id}`} className="hover:text-[var(--color-primary)]">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
