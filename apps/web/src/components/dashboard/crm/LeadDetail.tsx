"use client"

import { useState } from "react"
import { 
  Building2, Mail, Phone, Globe, Calendar, DollarSign, Percent, 
  User, CheckCircle2, XCircle, Trash2, Plus, MessageSquare, PhoneCall
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Tabs, TabsContent } from "@/components/dashboard/ui/Tabs"

export interface LeadData {
  id: string
  name: string
  company: string
  email: string
  phone: string
  website: string
  value: number
  probability: number
  status: string
  source: string
  assignedTo: string
  services: string[]
  notes: string
  nextFollowUp?: string
  activities: {
    id: string
    type: "call" | "email" | "meeting" | "note"
    desc: string
    author: string
    timestamp: string
  }[]
}

export function LeadDetail({ initialData }: { initialData: LeadData }) {
  const [data, setData] = useState<LeadData>(initialData)
  const [activeTab, setActiveTab] = useState("activity")
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Profile */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">{data.name}</h1>
          <div className="flex items-center gap-2 text-[var(--text-secondary)] mt-1">
            <Building2 className="w-4 h-4" />
            <span>{data.company}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <span className="text-xs font-bold px-2 py-1 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-md text-[var(--text-tertiary)] uppercase">
              {data.source}
            </span>
            {data.services.map(s => (
              <span key={s} className="text-xs font-bold px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-md">
                {s}
              </span>
            ))}
          </div>
        </div>
        
        <select 
          value={data.status}
          onChange={async (e) => {
            const newStatus = e.target.value;
            setData({...data, status: newStatus});
            try {
              await fetch(`/api/leads/${data.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
              });
            } catch (err) {
              console.error(err);
            }
          }}
          className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-2 font-bold text-sm focus:border-[var(--color-primary)] focus:outline-none"
        >
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal">Proposal</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-hover)]">
          <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase flex items-center gap-1 mb-1">
            <DollarSign className="w-3 h-3" /> Deal Value
          </p>
          <p className="text-xl font-black text-[var(--text-primary)]">${data.value.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-hover)]">
          <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase flex items-center gap-1 mb-1">
            <Percent className="w-3 h-3" /> Probability
          </p>
          <p className="text-xl font-black text-[var(--text-primary)]">{data.probability}%</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-3 p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)]">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-[var(--text-tertiary)]" />
          <a href={`mailto:${data.email}`} className="text-[var(--text-primary)] hover:text-[var(--color-primary)]">{data.email}</a>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone className="w-4 h-4 text-[var(--text-tertiary)]" />
          <a href={`tel:${data.phone}`} className="text-[var(--text-primary)] hover:text-[var(--color-primary)]">{data.phone}</a>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Globe className="w-4 h-4 text-[var(--text-tertiary)]" />
          <a href={data.website} target="_blank" rel="noreferrer" className="text-[var(--text-primary)] hover:text-[var(--color-primary)]">{data.website}</a>
        </div>
        <div className="flex items-center gap-3 text-sm border-t border-[var(--border-default)] pt-3 mt-1">
          <User className="w-4 h-4 text-[var(--text-tertiary)]" />
          <span className="text-[var(--text-secondary)]">Assigned to: <strong className="text-[var(--text-primary)]">{data.assignedTo}</strong></span>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div>
        <Tabs 
          tabs={[
            { id: "activity", label: "Activity" },
            { id: "notes", label: "Notes" }
          ]} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
        />
        
        <TabsContent value="activity" activeTab={activeTab}>
          <div className="space-y-6">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 gap-2"><PhoneCall className="w-4 h-4" /> Log Call</Button>
              <Button size="sm" variant="outline" className="flex-1 gap-2"><Mail className="w-4 h-4" /> Log Email</Button>
              <Button size="sm" variant="outline" className="flex-1 gap-2"><Calendar className="w-4 h-4" /> Meeting</Button>
            </div>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:ms-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--border-default)] before:to-transparent">
              {data.activities.map((act) => (
                <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--text-secondary)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-sm">
                    {act.type === 'call' && <PhoneCall className="w-4 h-4" />}
                    {act.type === 'email' && <Mail className="w-4 h-4" />}
                    {act.type === 'meeting' && <Calendar className="w-4 h-4" />}
                    {act.type === 'note' && <MessageSquare className="w-4 h-4" />}
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-default)] shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-[var(--text-primary)] capitalize">{act.type}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">{act.timestamp}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">{act.desc}</p>
                    <p className="text-xs text-[var(--text-tertiary)] font-medium">— {act.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes" activeTab={activeTab}>
          <div className="space-y-4">
            <textarea 
              className="w-full p-4 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl min-h-[150px] focus:outline-none focus:border-[var(--color-primary)] text-sm"
              placeholder="Add notes here..."
              value={data.notes}
              onChange={e => setData({...data, notes: e.target.value})}
            />
            <Button 
              className="w-full"
              disabled={isSavingNotes}
              onClick={async () => {
                setIsSavingNotes(true);
                try {
                  await fetch(`/api/leads/${data.id}/notes`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notes: data.notes })
                  });
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsSavingNotes(false);
                }
              }}
            >
              {isSavingNotes ? "Saving..." : "Save Notes"}
            </Button>
          </div>
        </TabsContent>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col gap-3 pt-6 border-t border-[var(--border-default)]">
        <Button className="w-full bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 gap-2">
          <CheckCircle2 className="w-4 h-4" /> Convert to Client
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 gap-2">
            <XCircle className="w-4 h-4" /> Mark Lost
          </Button>
          <Button variant="outline" className="flex-1 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 hover:border-[var(--color-error)] gap-2">
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>
      
    </div>
  )
}
