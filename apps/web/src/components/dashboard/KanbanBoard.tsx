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
import { MoreHorizontal, Plus, X, Calendar, DollarSign, Percent, MessageSquare, ArrowRight, Save } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost"

export interface Lead {
  id: string
  name: string
  company: string
  value: string
  status: LeadStatus
  assigneeAvatar?: string
  probability?: number
}

interface KanbanBoardProps {
  initialLeads: Lead[]
}

const COLUMNS: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"]

// --- Draggable Card Component ---
function KanbanCard({ lead, isOverlay, onClick }: { lead: Lead, isOverlay?: boolean, onClick?: () => void }) {
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
      onClick={(e) => {
        // Prevent click if we dragged
        if (!isDragging && onClick) onClick();
      }}
      className={`
        bg-[var(--surface-default)] p-4 rounded-xl border border-[var(--border-default)] shadow-sm cursor-grab active:cursor-grabbing
        hover:border-[var(--color-primary)]/50 transition-colors relative
        ${isDragging ? 'opacity-50' : ''}
        ${isOverlay ? 'shadow-2xl rotate-2 scale-105 opacity-100 z-50' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-[var(--text-primary)] text-sm line-clamp-2 pe-6">{lead.name}</h4>
        <button 
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] absolute top-4 end-4"
          onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
        >
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
function KanbanColumn({ id, title, leads, onLeadClick }: { id: LeadStatus, title: string, leads: Lead[], onLeadClick: (lead: Lead) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div 
      ref={setNodeRef}
      className={`
        flex-shrink-0 w-80 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-2xl flex flex-col max-h-full
        transition-all duration-300
        ${isOver ? 'bg-[var(--surface-hover)] border-[var(--color-primary)] shadow-[0_0_15px_rgba(5,150,105,0.15)]' : ''}
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
          <KanbanCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
        ))}
      </div>
    </div>
  )
}

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
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
      
      router.refresh() 
    } catch (error) {
      console.error(error)
      setLeads(previousLeads)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-[var(--text-primary)]">Live Pipeline</h2>
          <p className="text-sm text-[var(--text-secondary)]">Drag and drop leads to update status</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4 me-2" />
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
                onLeadClick={(lead) => setSelectedLead(lead)}
              />
            </div>
          ))}
          
          <DragOverlay>
            {activeLead ? <KanbanCard lead={activeLead} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-40"
              onClick={() => setSelectedLead(null)}
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 15, stiffness: 400 }}
              className="fixed top-0 end-0 bottom-0 w-full max-w-md bg-[var(--surface-default)] shadow-2xl z-50 flex flex-col border-s border-[var(--border-default)]"
            >
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-default)]">
                <div>
                  <h2 className="text-xl font-black text-[var(--text-primary)]">{selectedLead.name}</h2>
                  <p className="text-sm text-[var(--text-secondary)]">{selectedLead.company}</p>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="p-2 bg-[var(--surface-hover)] rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                <section>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[var(--color-primary)]" /> Financial Diagnostics
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Project Valuation (QAR)</label>
                      <input 
                        type="text" 
                        defaultValue={selectedLead.value.replace(/[^0-9.]/g, '')}
                        className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-md px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Conversion Probability</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          min="0" max="100" 
                          defaultValue={selectedLead.probability || 50}
                          className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-md px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] pe-8"
                        />
                        <Percent className="w-3 h-3 absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                      </div>
                    </div>
                    <Button size="sm" className="w-full gap-2 mt-2">
                      <Save className="w-4 h-4" /> Update Financials
                    </Button>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-[var(--color-primary)]" /> Consulting Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full justify-start text-xs">
                      <Calendar className="w-4 h-4 mr-2" /> Schedule Meeting
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10">
                      Convert to Client
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-xs border-red-500/30 text-red-500 hover:bg-red-500/10 col-span-2">
                      Mark as Lost
                    </Button>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[var(--color-primary)]" /> Activity Timeline
                  </h3>
                  
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--border-level-2)] before:to-transparent">
                    
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--color-primary)] shadow shrink-0 z-10 font-bold text-xs">
                        AM
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-[var(--text-primary)] text-sm">Initial Call Scheduled</div>
                          <time className="text-xs text-[var(--text-tertiary)]">2 hrs ago</time>
                        </div>
                        <div className="text-[var(--text-secondary)] text-xs">Admin scheduled a discovery call with {selectedLead.name}.</div>
                      </div>
                    </div>

                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--text-secondary)] shadow shrink-0 z-10 font-bold text-xs">
                        SYS
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-[var(--text-primary)] text-sm">Lead Created</div>
                          <time className="text-xs text-[var(--text-tertiary)]">Oct 24</time>
                        </div>
                        <div className="text-[var(--text-secondary)] text-xs">Lead entered the pipeline automatically via web form.</div>
                      </div>
                    </div>

                  </div>
                </section>
                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
