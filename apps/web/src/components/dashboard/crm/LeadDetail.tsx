"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Mail, Phone, Building, Briefcase, Plus, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"

type Lead = {
  id: string
  name: string
  company: string | null
  email: string
  phone: string | null
  status: string
  value: number | null
  probability: number | null
  notes: string | null
  activities: { id: string; type: string; description: string; author: string; timestamp: string }[]
  inquiries: { id: string; subject: string | null; message: string; createdAt: string }[]
}

export function LeadDetail({ initialLead }: { initialLead: Lead }) {
  const router = useRouter()
  const [lead, setLead] = useState(initialLead)
  const [isSaving, setIsSaving] = useState(false)
  const [newNote, setNewNote] = useState("")

  const [form, setForm] = useState({
    name: lead.name,
    company: lead.company || "",
    email: lead.email,
    phone: lead.phone || "",
    status: lead.status,
    value: lead.value || "",
    probability: lead.probability || ""
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/crm/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: form.value === "" ? null : Number(form.value),
          probability: form.probability === "" ? null : Number(form.probability)
        })
      })
      if (!res.ok) throw new Error()
      router.refresh()
      alert("Lead updated successfully")
    } catch {
      alert("Failed to update lead")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    try {
      const res = await fetch(`/api/crm/leads/${lead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "NOTE",
          description: newNote
        })
      })
      if (!res.ok) throw new Error()
      const addedActivity = await res.json()
      setLead({ ...lead, activities: [addedActivity, ...lead.activities] })
      setNewNote("")
      router.refresh()
    } catch {
      alert("Failed to add note")
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between bg-surface-default p-4 rounded-xl border border-border-default shadow-sm sticky top-6 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard/crm/leads")}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors text-text-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Lead: {lead.name}</h1>
            <p className="text-xs text-text-secondary">{lead.company || "Individual"}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-default p-6 rounded-xl border border-border-default shadow-sm space-y-6">
            <h2 className="font-bold text-text-primary border-b border-border-default pb-4">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary">Full Name</label>
                <input 
                  type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2.5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary">Company</label>
                <input 
                  type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2.5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary">Email</label>
                <input 
                  type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2.5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary">Phone</label>
                <input 
                  type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2.5"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-default p-6 rounded-xl border border-border-default shadow-sm space-y-6">
            <h2 className="font-bold text-text-primary border-b border-border-default pb-4">Opportunity Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary">Status</label>
                <select 
                  value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2.5"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL">Proposal</option>
                  <option value="WON">Won</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary">Estimated Value (QAR)</label>
                <input 
                  type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2.5"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary">Probability (%)</label>
                <input 
                  type="number" value={form.probability} onChange={e => setForm({...form, probability: e.target.value})}
                  className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-2.5"
                  placeholder="50" min="0" max="100"
                />
              </div>
            </div>
          </div>

          {/* Connected Inquiries */}
          {lead.inquiries.length > 0 && (
            <div className="bg-surface-default p-6 rounded-xl border border-border-default shadow-sm space-y-4">
              <h2 className="font-bold text-text-primary border-b border-border-default pb-4">Original Inquiries</h2>
              <div className="space-y-4">
                {lead.inquiries.map(inq => (
                  <div key={inq.id} className="p-4 bg-surface-hover border border-border-default rounded-lg text-sm">
                    {inq.subject && <div className="font-bold mb-2">{inq.subject}</div>}
                    <div className="text-text-secondary whitespace-pre-wrap">{inq.message}</div>
                    <div className="mt-2 text-xs text-text-tertiary">{new Date(inq.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Activities */}
        <div className="space-y-6">
          <div className="bg-surface-default p-6 rounded-xl border border-border-default shadow-sm h-full flex flex-col">
            <h2 className="font-bold text-text-primary border-b border-border-default pb-4 mb-4">Activity Timeline</h2>
            
            <div className="space-y-4 mb-6">
              <textarea 
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Log a call, meeting, or internal note..."
                className="w-full bg-surface-hover border border-border-default rounded-lg px-4 py-3 text-sm resize-y"
                rows={3}
              />
              <Button onClick={handleAddNote} className="w-full gap-2" disabled={!newNote.trim()}>
                <Plus className="w-4 h-4" /> Add Note
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pe-2">
              {lead.activities.map(activity => (
                <div key={activity.id} className="relative ps-6 border-s-2 border-border-default pb-4 last:pb-0">
                  <div className="absolute w-3 h-3 bg-accent rounded-full -start-[7px] top-1" />
                  <div className="bg-surface-hover p-3 rounded-lg border border-border-default">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-xs text-text-primary">{activity.author}</span>
                      <span className="text-xs text-text-tertiary">{new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
