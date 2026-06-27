"use client"

import { useState } from "react"
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  useDraggable
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { MoreHorizontal, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost"

export interface Lead {
  id: string
  name: string
  company: string
  value: string
  status: LeadStatus
  assigneeAvatar?: string
}

interface KanbanBoardProps {
  initialLeads: Lead[]
}

const COLUMNS: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"]

// --- Draggable Card Component ---
function KanbanCard({ lead, isOverlay }: { lead: Lead, isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { ...lead }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-[var(--surface-default)] p-4 rounded-xl border border-[var(--border-default)] shadow-sm cursor-grab active:cursor-grabbing
        hover:border-[var(--color-primary)]/50 transition-colors
        ${isDragging ? 'opacity-50' : ''}
        ${isOverlay ? 'shadow-2xl rotate-2 scale-105 opacity-100 z-50' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-[var(--text-primary)] text-sm line-clamp-1">{lead.name}</h4>
        <button className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-1">{lead.company}</p>
      
      <div className="flex justify-between items-center mt-auto">
        <span className="text-sm font-black text-[var(--color-primary)]">{lead.value}</span>
        {lead.assigneeAvatar && (
          <img src={lead.assigneeAvatar} alt="Assignee" className="w-6 h-6 rounded-full border border-[var(--border-default)]" />
        )}
      </div>
    </div>
  )
}

// --- Droppable Column Component ---
function KanbanColumn({ id, title, leads }: { id: LeadStatus, title: string, leads: Lead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div 
      ref={setNodeRef}
      className={`
        flex-shrink-0 w-80 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-2xl flex flex-col max-h-full
        transition-colors duration-200
        ${isOver ? 'bg-[var(--surface-hover)] border-[var(--color-primary)]/50' : ''}
      `}
    >
      <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between shrink-0">
        <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
          {title}
          <span className="text-xs font-bold bg-[var(--surface-default)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full border border-[var(--border-default)]">
            {leads.length}
          </span>
        </h3>
        <button className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-default)] transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-3 overflow-y-auto flex-1 flex flex-col gap-3 min-h-[150px]">
        {leads.map(lead => (
          <KanbanCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  )
}


export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const lead = leads.find(l => l.id === active.id)
    if (lead) setActiveLead(lead)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveLead(null)
    const { active, over } = event

    if (!over) return

    const leadId = active.id as string
    const newStatus = over.id as LeadStatus

    const lead = leads.find(l => l.id === leadId)
    if (!lead || lead.status === newStatus) return

    // Optimistic update
    const previousLeads = [...leads]
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
    
    // Sync to backend
    setIsSyncing(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!res.ok) {
        throw new Error('Failed to update lead status')
      }
      
      router.refresh() // Refresh the server components to update Stats Grid
    } catch (error) {
      console.error(error)
      // Revert on error
      setLeads(previousLeads)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-[var(--text-primary)]">Live Pipeline</h2>
          <p className="text-sm text-[var(--text-secondary)]">Drag and drop leads to update status</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Create Lead
        </Button>
      </div>

      <div className="flex overflow-x-auto pb-6 gap-6 min-h-[600px] snap-x">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map(columnId => (
            <div key={columnId} className="snap-start">
              <KanbanColumn 
                id={columnId} 
                title={columnId} 
                leads={leads.filter(l => l.status === columnId)} 
              />
            </div>
          ))}
          
          <DragOverlay>
            {activeLead ? <KanbanCard lead={activeLead} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
