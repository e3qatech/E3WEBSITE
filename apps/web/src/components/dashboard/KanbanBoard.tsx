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

const COLUMN_CONFIG: Record<LeadStatus, {
  label: string;
  labelAr: string;
  badge: string;
  dotColor: string;
}> = {
  New: {
    label: "New",
    labelAr: "جديد",
    badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    dotColor: "bg-sky-500",
  },
  Contacted: {
    label: "Contacted",
    labelAr: "تم التواصل",
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    dotColor: "bg-purple-500",
  },
  Qualified: {
    label: "Qualified",
    labelAr: "مؤهل",
    badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    dotColor: "bg-indigo-500",
  },
  Proposal: {
    label: "Proposal",
    labelAr: "عرض سعر",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  Negotiation: {
    label: "Negotiation",
    labelAr: "تفاوض",
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    dotColor: "bg-violet-500",
  },
  Won: {
    label: "Won",
    labelAr: "تم التعاقد",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  Lost: {
    label: "Lost",
    labelAr: "خسارة",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dotColor: "bg-rose-500",
  },
}

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
      onClick={(_e) => {
        if (!isDragging && onClick) onClick();
      }}
      className={`
        bg-[var(--surface-default)] p-3.5 rounded-xl border border-[var(--border-level-1)] shadow-sm cursor-grab active:cursor-grabbing
        hover:border-[var(--color-primary)]/50 hover:shadow-md transition-all relative group
        ${isDragging ? 'opacity-40 scale-95' : ''}
        ${isOverlay ? 'shadow-2xl rotate-1 scale-105 opacity-100 z-50 ring-2 ring-[var(--color-primary)]' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-1.5 gap-2">
        <h4 className="font-bold text-[var(--text-primary)] text-xs sm:text-sm line-clamp-2">{lead.name}</h4>
        <button 
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 rounded-md hover:bg-[var(--surface-hover)] transition-colors shrink-0"
          onClick={(e) => { e.stopPropagation(); onClick?.(); }}
          title="Lead details"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-1 font-medium">{lead.company}</p>
      
      <div className="flex justify-between items-center pt-2 border-t border-[var(--border-level-1)]/60 text-xs">
        <span className="font-extrabold text-[var(--color-primary)] font-mono">{lead.value}</span>
        {lead.assigneeAvatar ? (
          <img src={lead.assigneeAvatar} alt="Assignee" className="w-5 h-5 rounded-full border border-[var(--border-level-1)] object-cover" />
        ) : (
          <span className="w-5 h-5 rounded-full bg-[var(--surface-active)] text-[var(--text-tertiary)] text-[9px] font-bold flex items-center justify-center border border-[var(--border-level-1)]">
            {lead.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  )
}

// --- Droppable Column Component ---
function KanbanColumn({ id, leads, onLeadClick, onAddLead }: { id: LeadStatus, leads: Lead[], onLeadClick: (lead: Lead) => void, onAddLead?: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const config = COLUMN_CONFIG[id] || COLUMN_CONFIG.New

  return (
    <div 
      ref={setNodeRef}
      className={`
        flex-shrink-0 w-72 sm:w-76 bg-[var(--bg-level-1)] border rounded-2xl flex flex-col max-h-[580px]
        transition-all duration-200
        ${isOver 
          ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-md bg-[var(--surface-hover)]/70' 
          : 'border-[var(--border-level-1)]'
        }
      `}
    >
      {/* Column Header */}
      <div className="p-3.5 border-b border-[var(--border-level-1)] flex items-center justify-between shrink-0 bg-[var(--surface-default)]/40 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
          <h3 className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
            {config.label}
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badge}`}>
            {leads.length}
          </span>
        </div>
        
        {onAddLead && (
          <button 
            onClick={onAddLead}
            className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            title={`Add lead to ${config.label}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      
      {/* Column Cards Container */}
      <div className="p-2.5 overflow-y-auto flex-1 flex flex-col gap-2.5 min-h-[140px] custom-scrollbar">
        {leads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center border border-dashed border-[var(--border-level-1)] rounded-xl my-1 bg-[var(--surface-default)]/20">
            <p className="text-xs text-[var(--text-tertiary)] font-medium">No leads in this stage</p>
          </div>
        ) : (
          leads.map(lead => (
            <KanbanCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
          ))
        )}
      </div>
    </div>
  )
}

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [_isSyncing] = useState(false)
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
    }
  }

  return (
    <div className="w-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Active Inquiries & Pipeline</h2>
          <p className="text-xs text-[var(--text-secondary)] font-medium">Drag and drop leads between stages to update status in real time</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => router.push("/dashboard/crm/leads")}
            variant="outline"
            size="sm"
            className="gap-1 h-9 px-3 rounded-xl font-semibold border-[var(--border-level-1)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            View All
          </Button>
          <Button 
            onClick={() => router.push("/dashboard/crm/leads/new")}
            size="sm" 
            className="gap-1.5 h-9 px-3.5 rounded-xl font-bold bg-[var(--color-primary)] text-white shadow-sm hover:opacity-95 text-xs"
          >
            <Plus className="w-3.5 h-3.5 me-1" />
            Create Lead
          </Button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-4 min-h-[340px] max-h-[580px] snap-x custom-scrollbar">
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
                leads={leads.filter(l => l.status === columnId)} 
                onLeadClick={(lead) => setSelectedLead(lead)}
                onAddLead={() => router.push("/dashboard/crm/leads/new")}
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
                    <ArrowRight className="w-4 h-4 text-[var(--color-primary)] rtl:-scale-x-100" /> Consulting Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full justify-start text-xs">
                      <Calendar className="w-4 h-4 me-2" /> Schedule Meeting
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
                  
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ms-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--border-level-2)] before:to-transparent">
                    
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
