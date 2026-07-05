"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MessageSquare, CheckCircle, UserPlus, X, Trash2, Clock, CheckCircle2, ChevronRight, XCircle, ArrowRight, Mail, Phone } from "lucide-react"
import { AdminPageHeader } from "@/components/dashboard/ui/AdminPageHeader"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { AdminStatusBadge } from "@/components/dashboard/ui/AdminStatusBadge"
import { cn } from "@/lib/utils"

type Inquiry = {
  id: string
  type: string
  subject: string | null
  name: string
  email: string
  phone: string | null
  message: string
  status: string
  createdAt: string
  lead: { id: string; name: string } | null
}

export function InquiriesInbox({ initialInquiries }: { initialInquiries: Inquiry[] }) {
  const router = useRouter()
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selected, setSelected] = useState<Inquiry | null>(null)

  const filtered = inquiries.filter(i => {
    const matchesSearch = 
      i.name.toLowerCase().includes(search.toLowerCase()) || 
      i.email.toLowerCase().includes(search.toLowerCase()) || 
      (i.subject?.toLowerCase().includes(search.toLowerCase()) || false) ||
      i.message.toLowerCase().includes(search.toLowerCase())
      
    const matchesStatus = statusFilter === "ALL" || i.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/crm/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error()
      
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
      if (selected?.id === id) setSelected({ ...selected, status: newStatus })
      router.refresh()
    } catch {
      alert("Failed to update status")
    }
  }

  const convertToLead = async (inquiry: Inquiry) => {
    try {
      const leadRes = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
        })
      })
      if (!leadRes.ok) throw new Error("Failed to create lead")
      const newLead = await leadRes.json()

      const inqRes = await fetch(`/api/crm/inquiries/${inquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED", leadId: newLead.id })
      })
      if (!inqRes.ok) throw new Error("Failed to link inquiry")

      router.push(`/dashboard/crm/leads/${newLead.id}`)
    } catch (err: any) {
      alert(err.message || "Failed to convert to lead")
    }
  }

  const deleteInquiry = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return
    try {
      const res = await fetch(`/api/crm/inquiries/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      
      setInquiries(prev => prev.filter(i => i.id !== id))
      setSelected(null)
      router.refresh()
    } catch {
      alert("Failed to delete inquiry")
    }
  }

  return (
    <div className="flex flex-col h-full bg-bg-base overflow-hidden">
      <div className="px-8 pt-8 pb-4 shrink-0">
        <AdminPageHeader 
          title="Inquiries Inbox" 
          description="Manage incoming requests, contact forms, and convert them to leads."
          action={
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input 
                  type="text" 
                  placeholder="Search inquiries..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="ps-9 pe-4 py-2 bg-surface-default border border-border-default rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent w-full md:w-64"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-surface-default border border-border-default rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          }
        />
      </div>

      <div className="flex-1 flex overflow-hidden px-8 pb-8 gap-6">
        {/* Inbox List Pane */}
        <div className={cn(
          "flex flex-col bg-bg-level-1 border border-border-default rounded-2xl overflow-hidden shadow-sm h-full transition-all duration-300",
          selected ? "w-1/3 hidden lg:flex" : "w-full"
        )}>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-text-tertiary flex flex-col items-center justify-center h-full">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                <p>No inquiries found.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-default">
                {filtered.map(inq => (
                  <button 
                    key={inq.id}
                    onClick={() => setSelected(inq)}
                    className={cn(
                      "w-full text-left p-5 hover:bg-surface-hover transition-all relative group flex flex-col gap-2",
                      selected?.id === inq.id ? "bg-surface-active" : ""
                    )}
                  >
                    {selected?.id === inq.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full" />
                    )}
                    
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-sm text-text-primary truncate pe-2">
                        {inq.name}
                      </div>
                      <AdminStatusBadge 
                        variant={inq.status === "NEW" ? "info" : inq.status === "RESOLVED" ? "success" : "warning"}
                      >
                        {inq.status}
                      </AdminStatusBadge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[11px] text-text-secondary font-medium tracking-wide uppercase">
                      <span>{inq.type}</span>
                      <span className="w-1 h-1 rounded-full bg-border-strong" />
                      <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="text-sm text-text-secondary line-clamp-2 mt-1">
                      {inq.subject ? <span className="font-medium text-text-primary mr-1">{inq.subject}</span> : null}
                      {inq.message}
                    </div>
                    
                    {inq.lead && (
                      <div className="mt-2 text-[11px] font-bold text-accent bg-accent/10 px-2 py-1 rounded-md self-start flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Linked to Lead: {inq.lead.name}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Pane */}
        {selected && (
          <div className="flex-1 flex flex-col bg-bg-level-1 border border-border-default rounded-2xl shadow-lg h-full overflow-hidden animate-in slide-in-from-right-8 duration-300">
            <div className="p-6 border-b border-border-default flex items-center justify-between bg-surface-default shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xl uppercase">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-primary leading-tight">{selected.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-text-secondary">
                    <a href={`mailto:${selected.email}`} className="hover:text-accent transition-colors flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {selected.email}
                    </a>
                    {selected.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> {selected.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelected(null)}
                className="p-2 text-text-tertiary hover:bg-surface-hover rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-bg-base">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-surface-default border border-border-default rounded-lg text-xs font-bold text-text-secondary uppercase tracking-wider">
                    {selected.type}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
                    <Clock className="w-3.5 h-3.5" />
                    Received {new Date(selected.createdAt).toLocaleString()}
                  </span>
                </div>

                {selected.subject && (
                  <h2 className="text-2xl font-bold text-text-primary mb-4 leading-snug">{selected.subject}</h2>
                )}
                
                <div className="bg-surface-default border border-border-default rounded-xl p-6 shadow-sm">
                  <p className="text-text-primary text-[15px] leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-surface-default border-t border-border-default flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <AdminButton 
                  size="sm" 
                  variant={selected.status === "IN_PROGRESS" ? "primary" : "outline"}
                  onClick={() => updateStatus(selected.id, "IN_PROGRESS")}
                  disabled={selected.status === "IN_PROGRESS"}
                >
                  <MessageSquare className="w-4 h-4 me-2" /> In Progress
                </AdminButton>
                <AdminButton 
                  size="sm"
                  variant={selected.status === "RESOLVED" ? "primary" : "outline"}
                  onClick={() => updateStatus(selected.id, "RESOLVED")}
                  disabled={selected.status === "RESOLVED"}
                >
                  <CheckCircle className="w-4 h-4 me-2" /> Mark Resolved
                </AdminButton>
                
                {!selected.lead && (
                  <>
                    <div className="w-px h-6 bg-border-default mx-2 hidden sm:block" />
                    <AdminButton
                      size="sm"
                      variant="primary"
                      onClick={() => convertToLead(selected)}
                    >
                      <UserPlus className="w-4 h-4 me-2" /> Convert to Lead
                    </AdminButton>
                  </>
                )}
              </div>
              <AdminButton 
                size="sm" 
                variant="outline" 
                className="text-error hover:bg-error/10 hover:border-error/30" 
                onClick={() => deleteInquiry(selected.id)}
              >
                <Trash2 className="w-4 h-4 me-2" /> Delete
              </AdminButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
