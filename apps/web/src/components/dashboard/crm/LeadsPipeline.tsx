"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List,
  MoreVertical,
  Building,
  Mail,
  Phone,
  Calendar,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { format } from "date-fns"

const STAGES = [
  { id: "NEW", label: "New Leads", color: "bg-blue-600" },
  { id: "CONTACTED", label: "Contacted", color: "bg-amber-600" },
  { id: "QUALIFIED", label: "Qualified", color: "bg-accent" },
  { id: "PROPOSAL", label: "Proposal", color: "bg-orange-600" },
  { id: "WON", label: "Won", color: "bg-[var(--color-success)]" },
  { id: "LOST", label: "Lost", color: "bg-error" }
]

function SortableLeadCard({ lead }: { lead: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`bg-surface-default border border-border-default p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-accent transition-colors ${isDragging ? 'shadow-xl scale-105 z-50 relative' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-text-primary text-sm">{lead.name}</h4>
        <Link href={`/dashboard/crm/leads/${lead.id}`} className="p-1 hover:bg-surface-hover rounded-md text-text-tertiary" onPointerDown={(e) => e.stopPropagation()}>
          <EyeIcon />
        </Link>
      </div>
      {lead.company && (
        <div className="flex items-center text-xs text-text-secondary mb-1">
          <Building className="w-3 h-3 me-1" /> {lead.company}
        </div>
      )}
      <div className="flex items-center text-xs text-text-secondary mb-3">
        <Mail className="w-3 h-3 me-1" /> {lead.email}
      </div>
      <div className="flex justify-between items-center text-xs border-t border-border-default pt-2 mt-2">
        <span className="font-bold text-accent">
          {lead.value ? `${lead.value.toLocaleString()} QAR` : '---'}
        </span>
        <span className="text-text-tertiary">{format(new Date(lead.createdAt), 'MMM d, yyyy')}</span>
      </div>
    </div>
  )
}

function EyeIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
}

export function LeadsPipeline({ initialLeads }: { initialLeads: any[] }) {
  const router = useRouter()
  const [view, setView] = useState<"kanban" | "table">("kanban")
  const [leads, setLeads] = useState(initialLeads)
  const [search, setSearch] = useState("")

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    (l.company && l.company.toLowerCase().includes(search.toLowerCase())) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over) return

    const leadId = active.id
    const overId = over.id // This could be another lead ID or a column ID

    // Find current lead and determine new status
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return

    let newStatus = lead.status

    if (STAGES.find(s => s.id === overId)) {
      // Dropped directly on a column
      newStatus = overId
    } else {
      // Dropped on another card, adopt its column
      const overLead = leads.find(l => l.id === overId)
      if (overLead) newStatus = overLead.status
    }

    if (lead.status !== newStatus) {
      // Optimistic update
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
      
      // Persist
      await fetch(`/api/crm/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      router.refresh()
    }
  }

  // Group leads for Kanban
  const getLeadsByStage = (stageId: string) => filteredLeads.filter(l => l.status === stageId)

  return (
    <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 md:p-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary">Lead Pipeline</h1>
          <p className="text-text-secondary mt-1">Manage inbound inquiries and track conversion progress.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-9 pe-4 py-2 rounded-xl bg-surface-default border border-border-default focus:outline-none focus:border-accent text-sm"
            />
          </div>
          <div className="flex bg-surface-default rounded-xl border border-border-default p-1">
            <button onClick={() => setView('kanban')} className={`p-1.5 rounded-lg transition-colors ${view === 'kanban' ? 'bg-surface-hover text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setView('table')} className={`p-1.5 rounded-lg transition-colors ${view === 'table' ? 'bg-surface-hover text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`}><List className="w-4 h-4" /></button>
          </div>
          <Button asChild>
            <Link href="/dashboard/crm/leads/new"><Plus className="w-4 h-4 me-2" /> Add Lead</Link>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        {view === "kanban" ? (
          <div className="h-full overflow-x-auto pb-4">
            <div className="flex gap-4 h-full min-w-max">
              <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                {STAGES.map(stage => (
                  <div key={stage.id} className="flex flex-col w-72 bg-surface-hover rounded-2xl border border-border-default shrink-0 max-h-full">
                    <div className="p-4 border-b border-border-default flex items-center justify-between sticky top-0 bg-surface-hover z-10 rounded-t-2xl">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                        <h3 className="font-bold text-sm text-text-primary">{stage.label}</h3>
                      </div>
                      <span className="bg-surface-active text-text-secondary text-xs font-bold px-2 py-0.5 rounded-full">
                        {getLeadsByStage(stage.id).length}
                      </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      <SortableContext items={getLeadsByStage(stage.id).map(l => l.id)} strategy={verticalListSortingStrategy}>
                        {getLeadsByStage(stage.id).map(lead => (
                          <SortableLeadCard key={lead.id} lead={lead} />
                        ))}
                      </SortableContext>
                    </div>
                  </div>
                ))}
              </DndContext>
            </div>
          </div>
        ) : (
          <div className="bg-surface-default border border-border-default rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface-hover border-b border-border-default text-text-secondary">
                  <tr>
                    <th className="p-4 font-bold">Name</th>
                    <th className="p-4 font-bold">Company</th>
                    <th className="p-4 font-bold">Email</th>
                    <th className="p-4 font-bold">Stage</th>
                    <th className="p-4 font-bold text-right">Value</th>
                    <th className="p-4 font-bold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-surface-hover transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/crm/leads/${lead.id}`)}>
                      <td className="p-4 font-bold text-text-primary">{lead.name}</td>
                      <td className="p-4 text-text-secondary">{lead.company || '-'}</td>
                      <td className="p-4 text-text-secondary">{lead.email}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-surface-active text-text-secondary">
                          {STAGES.find(s => s.id === lead.status)?.label}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono text-xs">{lead.value ? `${lead.value.toLocaleString()} QAR` : '-'}</td>
                      <td className="p-4 text-text-tertiary text-xs">{format(new Date(lead.createdAt), 'MMM d, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
