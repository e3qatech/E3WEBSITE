"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Plus, Download, FileText, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"

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
  attachments?: {
    id: string
    originalFilename: string
    extension: string
    sizeBytes: number
    quarantineStatus: string
    sha256?: string | null
    createdAt: string
    attachedAt?: string | null
  }[]
}

export function LeadDetail({ initialLead }: { initialLead: Lead }) {
  const router = useRouter()
  const [lead, setLead] = useState(initialLead)
  const [isSaving, setIsSaving] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [selectedQuarantineDoc, setSelectedQuarantineDoc] = useState<any>(null)

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
    <DashboardPageShell variant="wide">
      {/* Header */}
      <DashboardPageHeader
        title={`Lead: ${lead.name}`}
        description={`Manage sales pipeline stages, corporate account details, interaction notes, and inquiry history (${lead.company || "Individual Lead"}).`}
        breadcrumbs={[
          { label: "CRM Leads", href: "/dashboard/crm/leads" },
          { label: lead.name },
        ]}
        badge={{
          label: lead.status,
          variant: lead.status === "WON" ? "success" : lead.status === "LOST" ? "error" : "warning",
        }}
        primaryAction={{
          label: isSaving ? "Saving..." : "Save Changes",
          onClick: handleSave,
          isLoading: isSaving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

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

          {/* Attached RFP & Proposal Documents with Antivirus Quarantine Warning */}
          {lead.attachments && lead.attachments.length > 0 && (
            <div className="bg-surface-default p-6 rounded-xl border border-border-default shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border-default pb-4">
                <h2 className="font-bold text-text-primary flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  Attached RFP Documents ({lead.attachments.length})
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Quarantine Active
                </span>
              </div>
              <div className="space-y-3">
                {lead.attachments.map(att => (
                  <div key={att.id} className="p-4 bg-surface-hover border border-border-default rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-text-primary">{att.originalFilename}</span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {att.extension}
                        </span>
                      </div>
                      <div className="text-xs text-text-tertiary flex items-center gap-3">
                        <span>{Math.round(att.sizeBytes / 1024)} KB</span>
                        <span>•</span>
                        <span>Attached {new Date(att.attachedAt || att.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={cn(
                          "font-medium",
                          att.quarantineStatus === 'UNSCANNED' ? "text-amber-400" : "text-emerald-400"
                        )}>
                          Status: {att.quarantineStatus}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQuarantineDoc(att)}
                      className="gap-2 shrink-0 border-amber-500/40 hover:bg-amber-500/10 hover:border-amber-500"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      Download Attachment
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {/* Real Visible Antivirus Confirmation & Security Modal */}
      {selectedQuarantineDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-zinc-950 border border-amber-500/40 rounded-xl p-6 shadow-2xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">Unscanned Attachment Warning</h3>
                <p className="text-sm text-zinc-300">
                  This document was uploaded by an external user and has not been antivirus scanned. Download only if you trust the sender.
                </p>
              </div>
            </div>

            {/* Document Metadata Details */}
            <div className="bg-zinc-900/70 rounded-lg p-4 border border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Filename:</span>
                <span className="text-zinc-200 font-bold truncate max-w-[240px]">{selectedQuarantineDoc.originalFilename}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>File Size:</span>
                <span className="text-zinc-200">{Math.round(selectedQuarantineDoc.sizeBytes / 1024)} KB</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Lead Reference:</span>
                <span className="text-zinc-200 truncate max-w-[240px]">{lead.name} ({lead.id})</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Quarantine Status:</span>
                <span className="text-amber-400 font-bold">{selectedQuarantineDoc.quarantineStatus}</span>
              </div>
              {selectedQuarantineDoc.sha256 && (
                <div className="flex justify-between text-zinc-400">
                  <span>SHA-256:</span>
                  <span className="text-zinc-400 truncate max-w-[200px]">{selectedQuarantineDoc.sha256}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
              <Button
                variant="outline"
                onClick={() => setSelectedQuarantineDoc(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-500 text-white gap-2 font-medium"
                onClick={() => {
                  const url = `/api/upload/download?uploadId=${selectedQuarantineDoc.id}`
                  window.location.href = url
                  setSelectedQuarantineDoc(null)
                }}
              >
                <Download className="w-4 h-4" />
                Confirm & Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageShell>
  )
}
