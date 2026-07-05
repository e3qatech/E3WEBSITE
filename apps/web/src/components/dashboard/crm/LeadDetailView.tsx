"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  Plus, 
  MessageSquare,
  PhoneCall,
  Mail as MailIcon,
  Video,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { format } from "date-fns"
import { useSession } from "next-auth/react"

const STAGES = [
  { id: "NEW", label: "New Leads", color: "bg-blue-600" },
  { id: "CONTACTED", label: "Contacted", color: "bg-amber-600" },
  { id: "QUALIFIED", label: "Qualified", color: "bg-accent" },
  { id: "PROPOSAL", label: "Proposal", color: "bg-orange-600" },
  { id: "WON", label: "Won", color: "bg-[var(--color-success)]" },
  { id: "LOST", label: "Lost", color: "bg-error" }
]

export function LeadDetailView({ initialLead, salesTeam }: { initialLead: any, salesTeam: any[] }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [lead, setLead] = useState(initialLead)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const [activityType, setActivityType] = useState("NOTE")
  const [activityDesc, setActivityDesc] = useState("")

  const handleUpdate = async (data: any) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/crm/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        const { lead: updatedLead } = await res.json()
        setLead(updatedLead)
        router.refresh()
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activityDesc.trim()) return

    await handleUpdate({
      activity: {
        type: activityType,
        description: activityDesc,
        author: session?.user?.name || "Unknown User"
      }
    })
    
    setActivityDesc("")
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "EMAIL": return <Mail className="w-4 h-4 text-blue-500" />
      case "CALL": return <Phone className="w-4 h-4 text-green-500" />
      case "MEETING": return <Video className="w-4 h-4 text-accent" />
      case "NOTE": return <FileText className="w-4 h-4 text-amber-500" />
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 md:p-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/crm/leads" className="p-2 hover:bg-surface-hover rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-text-primary">{lead.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-text-secondary text-sm">
            {lead.company && <span className="flex items-center"><Building className="w-4 h-4 me-1" /> {lead.company}</span>}
            <span className="flex items-center"><Mail className="w-4 h-4 me-1" /> {lead.email}</span>
            {lead.phone && <span className="flex items-center"><Phone className="w-4 h-4 me-1" /> {lead.phone}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Details & Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-default border border-border-default rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-text-primary mb-4">Lead Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Stage</label>
                <select 
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                  value={lead.status}
                  onChange={(e) => handleUpdate({ status: e.target.value })}
                  disabled={isUpdating}
                >
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Assigned To</label>
                <select 
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                  value={lead.assignedToId || ""}
                  onChange={(e) => handleUpdate({ assignedToId: e.target.value || null })}
                  disabled={isUpdating}
                >
                  <option value="">Unassigned</option>
                  {salesTeam.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Value (QAR)</label>
                  <input 
                    type="number"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                    defaultValue={lead.value || ""}
                    onBlur={(e) => handleUpdate({ value: e.target.value })}
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Probability (%)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                    defaultValue={lead.probability || ""}
                    onBlur={(e) => handleUpdate({ probability: e.target.value })}
                    disabled={isUpdating}
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="bg-surface-default border border-border-default rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-text-primary mb-4">Original Inquiries</h3>
            {lead.inquiries?.length > 0 ? (
              <div className="space-y-3">
                {lead.inquiries.map((inq: any) => (
                  <div key={inq.id} className="p-3 bg-surface-hover rounded-xl text-sm text-text-secondary">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-text-primary">{inq.type}</span>
                      <span className="text-xs">{format(new Date(inq.createdAt), "MMM d")}</span>
                    </div>
                    <p className="line-clamp-2">{inq.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-tertiary italic">No inquiries linked to this lead.</p>
            )}
          </div>
        </div>

        {/* Right Col: Activity Timeline */}
        <div className="lg:col-span-2 flex flex-col h-[700px]">
          <div className="bg-surface-default border border-border-default rounded-2xl flex flex-col h-full shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border-default bg-surface-hover">
              <h3 className="font-bold text-text-primary">Activity Timeline</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {lead.activities?.length > 0 ? (
                lead.activities.map((activity: any, index: number) => (
                  <div key={activity.id} className="flex gap-4 relative">
                    {index !== lead.activities.length - 1 && (
                      <div className="absolute top-8 bottom-[-24px] start-[15px] w-[2px] bg-border-default" />
                    )}
                    <div className="w-8 h-8 rounded-full bg-surface-hover border border-border-default flex items-center justify-center shrink-0 z-10">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="bg-surface-hover p-4 rounded-xl flex-1 border border-border-default">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm text-text-primary">{activity.author}</span>
                        <span className="text-xs text-text-tertiary">{format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                      <p className="text-sm text-text-secondary whitespace-pre-wrap">{activity.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                  <p>No activity recorded yet.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border-default bg-surface-hover">
              <form onSubmit={handleAddActivity} className="flex flex-col gap-3">
                <div className="flex gap-2">
                  {["NOTE", "CALL", "EMAIL", "MEETING"].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActivityType(type)}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${activityType === type ? 'bg-accent text-white' : 'bg-surface-default text-text-secondary hover:bg-surface-active'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Log an activity..."
                    value={activityDesc}
                    onChange={(e) => setActivityDesc(e.target.value)}
                    className="flex-1 bg-surface-default border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                  />
                  <Button type="submit" disabled={isUpdating || !activityDesc.trim()}>
                    <Plus className="w-4 h-4 me-2" /> Log
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
