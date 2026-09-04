"use client"

import { useState, useEffect } from "react"
import { 
  Search, Users, Phone, Mail, FileText, Download, Trash2,
  Calendar, Check, Sparkles, Tag, ArrowRight, Clock, PlusCircle,
  Cake, MessageSquare, AlertCircle, X, ChevronRight, Send,
  Sliders, ExternalLink, Award, PhoneCall, History
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"

const CRM_STAGES = [
  { id: "ALL", label: "All Enquiries" },
  { id: "NEW", label: "New" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "QUALIFIED", label: "Qualified" },
  { id: "QUOTATION_SENT", label: "Quote Sent" },
  { id: "NEGOTIATION", label: "Negotiation" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "WON", label: "Won" },
  { id: "LOST", label: "Lost" },
  { id: "ANNIVERSARY_REENGAGEMENT", label: "🎂 Anniversary / Next Year" }
]

const QUICK_CALL_TAGS = [
  "Called — Spoke to Parent",
  "WhatsApp Proposal Sent",
  "Requested Extra Guests Add-on",
  "Follow-up Call Scheduled",
  "Deposit Payment Link Shared",
  "No Answer — Left Voicemail"
]

export function PackageLeadsManager({
  onSelectLeadForQuotation,
  isEmbedded = false
}: {
  onSelectLeadForQuotation?: (lead: any) => void
  isEmbedded?: boolean
}) {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [typeFilter, _setTypeFilter] = useState("ALL")
  const [search, setSearch] = useState("")
  const [anniversaryOnly, setAnniversaryOnly] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any | null>(null)

  // Remark drawer state
  const [remarkText, setRemarkText] = useState("")
  const [remarkTag, setRemarkTag] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [savingRemark, setSavingRemark] = useState(false)

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/b2c/package-leads")
      const json = await res.json()
      const data = Array.isArray(json.data) ? json.data : []
      setLeads(data)
      if (selectedLead) {
        const updated = data.find((l: any) => l.id === selectedLead.id)
        if (updated) setSelectedLead(updated)
      }
    } catch (_e) {
      console.error(_e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/b2c/package-leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      fetchLeads()
    } catch (_e) {
      alert("Failed to update lead status")
    }
  }

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead || !remarkText.trim()) return

    setSavingRemark(true)
    try {
      const noteEntry = {
        id: `rem-${Date.now()}`,
        text: remarkText.trim(),
        tag: remarkTag || undefined,
        followUpDate: followUpDate || undefined,
        author: "Event Coordinator",
        timestamp: new Date().toISOString()
      }

      const existingNotes = Array.isArray(selectedLead.internalNotes) 
        ? [...selectedLead.internalNotes] 
        : (typeof selectedLead.internalNotes === "object" && selectedLead.internalNotes !== null ? [selectedLead.internalNotes] : [])

      const updatedNotes = [noteEntry, ...existingNotes]

      const res = await fetch(`/api/b2c/package-leads/${selectedLead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internalNotes: updatedNotes,
          activityNote: `Added remark: "${remarkText.trim().slice(0, 50)}..."`
        })
      })

      if (!res.ok) throw new Error("Failed to save remark")

      setRemarkText("")
      setRemarkTag("")
      setFollowUpDate("")
      fetchLeads()
    } catch {
      alert("Failed to save remark")
    } finally {
      setSavingRemark(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return
    try {
      await fetch(`/api/b2c/package-leads/${id}`, { method: "DELETE" })
      if (selectedLead?.id === id) setSelectedLead(null)
      fetchLeads()
    } catch (_e) {
      alert("Failed to delete lead")
    }
  }

  const getNextAnniversary = (dateStr?: string | null) => {
    if (!dateStr) return null
    const eventDate = new Date(dateStr)
    if (isNaN(eventDate.getTime())) return null

    const now = new Date()
    const nextAnniversary = new Date(now.getFullYear(), eventDate.getMonth(), eventDate.getDate())
    if (nextAnniversary.getTime() < now.getTime()) {
      nextAnniversary.setFullYear(now.getFullYear() + 1)
    }

    const diffDays = Math.ceil((nextAnniversary.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return {
      date: nextAnniversary,
      diffDays,
      isUpcoming: diffDays <= 45
    }
  }

  const filtered = leads.filter(l => {
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter
    const matchesType = typeFilter === "ALL" || l.leadType === typeFilter
    const matchesSearch = 
      !search ||
      (l.referenceNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.companyOrOrg || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.celebrationName || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.phone || "").toLowerCase().includes(search.toLowerCase())

    const ann = getNextAnniversary(l.preferredDate)
    const matchesAnniversary = !anniversaryOnly || (ann && ann.isUpcoming)

    return matchesStatus && matchesType && matchesSearch && matchesAnniversary
  })

  const exportCSV = () => {
    const headers = "Ref,Customer,Celebration Name,Event Date,Next Anniversary,Status,Guests,Phone,Email\n"
    const rows = filtered.map(l => {
      const ann = getNextAnniversary(l.preferredDate)
      return `"${l.referenceNumber || l.id}","${l.customerName}","${l.celebrationName || ''}","${l.preferredDate ? new Date(l.preferredDate).toLocaleDateString() : ''}","${ann ? ann.date.toLocaleDateString() : ''}","${l.status}",${l.expectedGuests},"${l.phone || ''}","${l.email}"`
    }).join("\n")

    const blob = new Blob([headers + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `E3_Package_Leads_CRM_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const content = (
    <div className="space-y-6">
      {/* Header if not embedded */}
      {!isEmbedded && (
        <DashboardPageHeader
          title="Package Leads & Enquiries CRM"
          description="Track birthday celebrations, log staff call remarks, and trigger next-year anniversary re-engagement."
          breadcrumbs={[
            { label: "B2C Management", href: "/dashboard/b2c/packages" },
            { label: "Package Enquiries" },
          ]}
          badge={{ label: `${leads.length} Leads`, variant: "indigo" }}
          primaryAction={{
            label: "Export CSV",
            onClick: exportCSV,
            variant: "secondary",
            icon: <Download className="w-4 h-4" />
          }}
        />
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-level-1)] overflow-x-auto scrollbar-none">
          {CRM_STAGES.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setStatusFilter(s.id)
                if (s.id !== "ANNIVERSARY_REENGAGEMENT") setAnniversaryOnly(false)
              }}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer",
                statusFilter === s.id && !anniversaryOnly
                  ? "bg-[var(--color-primary)] text-white shadow-sm" 
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              )}
            >
              {s.label}
            </button>
          ))}

          <button
            onClick={() => setAnniversaryOnly(!anniversaryOnly)}
            className={cn(
              "px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1",
              anniversaryOnly 
                ? "bg-amber-500 text-white shadow-sm" 
                : "text-amber-500 hover:bg-amber-500/10 border border-amber-500/30"
            )}
          >
            <Cake className="w-3.5 h-3.5" />
            <span>Next 45 Days Anniversaries</span>
          </button>
        </div>

        <div className="relative flex-1 md:w-64">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input 
            type="text" 
            placeholder="Search celebrant, parent, ref, phone..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full ps-9 pe-4 py-2 text-xs bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-1)] text-[var(--text-secondary)] animate-pulse">
          Loading Package Inquiries & Celebrations...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-1)] space-y-3">
          <FileText className="w-10 h-10 mx-auto text-[var(--text-tertiary)]" />
          <p className="text-sm font-bold text-[var(--text-primary)]">No enquiries found matching criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => {
            const ann = getNextAnniversary(item.preferredDate)
            const remarksCount = Array.isArray(item.internalNotes) ? item.internalNotes.length : (item.internalNotes ? 1 : 0)

            return (
              <div 
                key={item.id} 
                className="bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-1)] p-5 hover:border-[var(--color-primary)]/50 transition-all shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold text-[var(--color-primary)]">
                      {item.referenceNumber || item.id.slice(0, 8)}
                    </span>
                    <span className={cn(
                      "px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider",
                      item.status === "CONFIRMED" || item.status === "WON" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" :
                      item.status === "NEW" ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30" :
                      item.status === "ANNIVERSARY_REENGAGEMENT" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30" :
                      "bg-[var(--surface-active)] text-[var(--text-secondary)] border border-[var(--border-level-1)]"
                    )}>
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[var(--text-primary)] truncate">
                    {item.customerName}
                  </h3>

                  {item.celebrationName && (
                    <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">For: {item.celebrationName}</span>
                    </div>
                  )}

                  {item.package && (
                    <p className="text-xs font-bold text-[var(--color-primary)] mt-1 truncate">
                      Pkg: {item.package.titleEn}
                    </p>
                  )}

                  {/* Birthday & Next Year Re-engagement Banner */}
                  {item.preferredDate && (
                    <div className="mt-3 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <Cake className="w-3.5 h-3.5" />
                          Celebration Date:
                        </span>
                        <span className="font-mono">{new Date(item.preferredDate).toLocaleDateString()}</span>
                      </div>
                      {ann && (
                        <div className="text-[10px] text-[var(--text-secondary)] flex items-center justify-between">
                          <span>🎂 Next Anniversary:</span>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                            {ann.date.toLocaleDateString()} ({ann.diffDays}d away)
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1 mt-3 pt-3 border-t border-[var(--border-level-1)] text-xs text-[var(--text-secondary)] font-mono">
                    {item.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> {item.phone}</div>}
                    {item.email && <div className="flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" /> <span className="truncate">{item.email}</span></div>}
                    <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> {item.expectedGuests} Guests</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-level-1)] text-xs gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedLead(item)}
                    className="h-8 text-xs font-bold gap-1.5 flex-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>Manage CRM</span>
                    {remarksCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)] text-[10px] font-mono">
                        {remarksCount}
                      </span>
                    )}
                  </Button>

                  {onSelectLeadForQuotation && (
                    <Button
                      size="sm"
                      onClick={() => onSelectLeadForQuotation(item)}
                      className="h-8 px-3 text-xs gap-1 font-bold bg-[var(--color-primary)] text-white"
                      title="Build Quotation for Lead"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Quote
                    </Button>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-[var(--text-tertiary)] hover:text-rose-500 rounded-lg cursor-pointer transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* LEAD DETAILS & REMARKS CRM DRAWER / MODAL */}
      {selectedLead && (
        <div 
          onClick={() => setSelectedLead(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-end animate-in fade-in duration-200"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-xl h-full bg-[var(--surface-default)] border-s border-[var(--border-level-2)] shadow-2xl flex flex-col overflow-hidden text-[var(--text-primary)]"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[var(--border-level-2)] flex items-start justify-between gap-4 bg-[var(--surface-hover)]/30">
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--color-primary)] font-bold">
                  {selectedLead.referenceNumber || selectedLead.id}
                </span>
                <h3 className="text-xl font-black">{selectedLead.customerName}</h3>
                {selectedLead.celebrationName && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                    Celebration: {selectedLead.celebrationName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 rounded-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
              {/* Stage Pipeline Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase font-bold text-[var(--text-secondary)] block">
                  Enquiry Stage / Pipeline Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CRM_STAGES.filter(s => s.id !== "ALL").map(stage => (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => handleStatusChange(selectedLead.id, stage.id)}
                      className={cn(
                        "p-2 rounded-xl text-xs font-bold border transition-all text-start cursor-pointer",
                        selectedLead.status === stage.id
                          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                          : "bg-[var(--surface-hover)]/50 border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      {stage.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birthday Retention & Next-Year Re-engagement Card */}
              {selectedLead.preferredDate && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3">
                  <div className="flex items-center justify-between font-bold text-amber-600 dark:text-amber-400">
                    <div className="flex items-center gap-2">
                      <Cake className="w-4 h-4" />
                      <span>Birthday Retention & Next-Year Conversion</span>
                    </div>
                    <span className="font-mono">
                      {new Date(selectedLead.preferredDate).toLocaleDateString()}
                    </span>
                  </div>

                  {(() => {
                    const ann = getNextAnniversary(selectedLead.preferredDate)
                    if (!ann) return null
                    return (
                      <div className="space-y-2">
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                          Celebrated event date is recorded. The system calculates the next annual anniversary to trigger timely repeat booking outreach.
                        </p>
                        <div className="p-3 rounded-xl bg-[var(--surface-default)] border border-amber-500/20 font-mono text-[11px] flex items-center justify-between">
                          <span>🎂 Next Anniversary Date:</span>
                          <strong className="text-amber-500">{ann.date.toLocaleDateString()}</strong>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-[var(--text-tertiary)]">
                            Recommended Call Window: 30 days prior
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(selectedLead.id, "ANNIVERSARY_REENGAGEMENT")}
                            className="h-7 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            Mark for Next-Year Rebooking
                          </Button>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Add Staff Remark & Call Log Form */}
              <form onSubmit={handleAddRemark} className="p-4 rounded-2xl bg-[var(--surface-hover)]/40 border border-[var(--border-level-2)] space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <PhoneCall className="w-4 h-4 text-emerald-500" />
                  <span>Log Call Outcome & Staff Remarks</span>
                </div>

                <textarea
                  required
                  rows={2}
                  value={remarkText}
                  onChange={e => setRemarkText(e.target.value)}
                  placeholder="Type internal remarks, parent notes, or call outcomes..."
                  className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl p-3 text-xs text-[var(--text-primary)]"
                />

                {/* Quick Tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {QUICK_CALL_TAGS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setRemarkTag(t)
                        setRemarkText(prev => prev ? `${prev} • ${t}` : t)
                      }}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      +{t}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Follow-up Reminder Date</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={e => setFollowUpDate(e.target.value)}
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={savingRemark}
                      className="w-full h-8 text-xs font-bold gap-1.5 bg-[var(--color-primary)] text-white"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {savingRemark ? "Saving..." : "Add Remark to Log"}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Timeline of Remarks and Logs */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-[var(--text-secondary)] flex items-center gap-1.5">
                  <History className="w-4 h-4" />
                  <span>Call Logs & Remarks Timeline</span>
                </h4>

                {Array.isArray(selectedLead.internalNotes) && selectedLead.internalNotes.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLead.internalNotes.map((note: any, idx: number) => (
                      <div key={note.id || idx} className="p-3 rounded-xl bg-[var(--surface-hover)]/30 border border-[var(--border-level-2)] space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)] font-mono">
                          <span className="font-bold text-[var(--text-secondary)]">{note.author || "Staff"}</span>
                          <span>{note.timestamp ? new Date(note.timestamp).toLocaleString() : ""}</span>
                        </div>
                        <p className="text-[var(--text-primary)] leading-relaxed">
                          {typeof note === "string" ? note : note.text}
                        </p>
                        {note.followUpDate && (
                          <div className="text-[10px] text-sky-500 font-mono flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            Follow-up: {new Date(note.followUpDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-tertiary)] p-4 rounded-xl border border-dashed border-[var(--border-level-2)] text-center">
                    No internal remarks recorded yet. Add your first call outcome above.
                  </p>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[var(--border-level-2)] bg-[var(--surface-hover)]/30 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLead(null)}
              >
                Close Drawer
              </Button>
              {onSelectLeadForQuotation && (
                <Button
                  size="sm"
                  onClick={() => {
                    onSelectLeadForQuotation(selectedLead)
                    setSelectedLead(null)
                  }}
                  className="gap-1.5 font-bold bg-[var(--color-primary)] text-white"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Quotation for Lead
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (isEmbedded) {
    return content
  }

  return (
    <DashboardPageShell variant="wide">
      {content}
    </DashboardPageShell>
  )
}
