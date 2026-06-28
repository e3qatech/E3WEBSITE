"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MessageSquare, CheckCircle, UserPlus, X, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
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
      // 1. Create the lead
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

      // 2. Update the inquiry to point to the new lead and mark resolved
      const inqRes = await fetch(`/api/crm/inquiries/${inquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED", leadId: newLead.id })
      })
      if (!inqRes.ok) throw new Error("Failed to link inquiry")

      // 3. Refresh
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
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Inquiries Inbox</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage incoming requests and convert to leads.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] w-full md:w-64"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]"
          >
            <option value="ALL">All Status</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <div className={cn(
          "glass rounded-3xl border-gradient relative flex flex-col h-full overflow-hidden shadow-2xl",
          selected ? "hidden lg:flex lg:col-span-5" : "col-span-1 lg:col-span-12"
        )}>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
          <div className="overflow-y-auto flex-1 divide-y divide-zinc-800/30 custom-scrollbar relative z-10">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-tertiary)] flex flex-col items-center">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                <p>No inquiries found.</p>
              </div>
            ) : (
              filtered.map(inq => (
                <button 
                  key={inq.id}
                  onClick={() => setSelected(inq)}
                  className={cn(
                    "w-full text-left p-5 hover:bg-zinc-900/50 transition-all relative group",
                    selected?.id === inq.id ? "bg-zinc-900/80 border-l-2 border-[var(--color-primary)] shadow-inner" : "border-l-2 border-transparent"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-bold text-sm text-[var(--text-primary)] truncate pr-2">
                      {inq.name}
                    </div>
                    <Badge variant={inq.status === "NEW" ? "info" : inq.status === "RESOLVED" ? "success" : "warning"}>
                      {inq.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-2">
                    <span className="font-medium">{inq.type}</span>
                    <span>• {new Date(inq.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] line-clamp-2">
                    {inq.subject ? <span className="font-medium">{inq.subject}: </span> : null}
                    {inq.message}
                  </div>
                  {inq.lead && (
                    <div className="mt-2 text-xs text-[var(--color-primary)] font-medium">
                      Linked to Lead: {inq.lead.name}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {selected && (
          <div className="col-span-1 lg:col-span-7 glass rounded-3xl border-gradient shadow-2xl flex flex-col h-full animate-in slide-in-from-right-4 lg:slide-in-from-bottom-0 duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-950/40 shrink-0 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-lg">
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] leading-tight">{selected.name}</h3>
                  <a href={`mailto:${selected.email}`} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--color-primary)] transition-colors">
                    {selected.email}
                  </a>
                  {selected.phone && <span className="text-xs text-[var(--text-tertiary)] ml-2">({selected.phone})</span>}
                </div>
              </div>
              <button 
                onClick={() => setSelected(null)}
                className="p-2 text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="mb-6">
                <Badge variant="default" className="mb-2 bg-transparent border border-[var(--border-default)]">{selected.type}</Badge>
                {selected.subject && (
                  <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">{selected.subject}</h2>
                )}
                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>
            </div>

            <div className="p-6 bg-zinc-950/40 border-t border-zinc-800/50 flex items-center justify-between gap-4 shrink-0 relative z-10 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant={selected.status === "IN_PROGRESS" ? "primary" : "outline"}
                  onClick={() => updateStatus(selected.id, "IN_PROGRESS")}
                  disabled={selected.status === "IN_PROGRESS"}
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> In Progress
                </Button>
                <Button 
                  size="sm"
                  variant={selected.status === "RESOLVED" ? "primary" : "outline"}
                  onClick={() => updateStatus(selected.id, "RESOLVED")}
                  disabled={selected.status === "RESOLVED"}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Mark Resolved
                </Button>
                {!selected.lead && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => convertToLead(selected)}
                    className="ml-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90"
                  >
                    <UserPlus className="w-4 h-4 mr-2" /> Convert to Lead
                  </Button>
                )}
              </div>
              <Button size="sm" variant="outline" className="text-[var(--color-error)] border-transparent hover:bg-[#EF444415]" onClick={() => deleteInquiry(selected.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
