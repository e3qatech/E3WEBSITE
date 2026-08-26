"use client"

import { useState, useEffect } from "react"
import { 
  Search, Users, Phone, Mail, FileText, Download, Trash2,
  Calendar, Check, Sparkles, Tag, ArrowRight, Clock, PlusCircle
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"

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
  const [selectedLead, setSelectedLead] = useState<any | null>(null)

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/b2c/package-leads")
      const json = await res.json()
      setLeads(Array.isArray(json.data) ? json.data : [])
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

  const filtered = leads.filter(l => {
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter
    const matchesType = typeFilter === "ALL" || l.leadType === typeFilter
    const matchesSearch = 
      !search ||
      (l.referenceNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.companyOrOrg || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.phone || "").toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesType && matchesSearch
  })

  const exportCSV = () => {
    const headers = "Ref,Name,Company/Org,Type,Package,Status,Guest Count,Est Value,Phone,Email,Date\n"
    const rows = filtered.map(l => 
      `"${l.referenceNumber || l.id}","${l.customerName}","${l.companyOrOrg || ''}","${l.leadType}","${l.package?.titleEn || ''}","${l.status}",${l.expectedGuests},${l.estimatedValue || 0},"${l.phone || ''}","${l.email}",${l.createdAt}`
    ).join("\n")

    const blob = new Blob([headers + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `E3_Package_Leads_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const content = (
    <div className="space-y-6">
      {/* Header if not embedded */}
      {!isEmbedded && (
        <DashboardPageHeader
          title="Package Leads & Enquiries CRM"
          description="Track birthday bookings, school group field trips, and corporate team-building briefs."
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
          {["ALL", "NEW", "CONTACTED", "QUALIFIED", "QUOTATION_SENT", "CONFIRMED", "COMPLETED", "LOST"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer",
                statusFilter === s ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              )}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="relative flex-1 md:w-64">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input 
            type="text" 
            placeholder="Search by ref, name, email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full ps-9 pe-4 py-2 text-xs bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-1)] text-[var(--text-secondary)] animate-pulse">
          Loading Package Inquiries...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-1)] space-y-3">
          <FileText className="w-10 h-10 mx-auto text-[var(--text-tertiary)]" />
          <p className="text-sm font-bold text-[var(--text-primary)]">No inquiries found matching criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => (
            <div key={item.id} className="bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-1)] p-5 hover:border-[var(--color-primary)]/50 transition-all shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] font-bold text-[var(--color-primary)]">
                    {item.referenceNumber || item.id.slice(0, 8)}
                  </span>
                  <span className={cn(
                    "px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider",
                    item.status === "CONFIRMED" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" :
                    item.status === "NEW" ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30" : "bg-[var(--surface-active)] text-[var(--text-secondary)] border border-[var(--border-level-1)]"
                  )}>
                    {item.status}
                  </span>
                </div>

                <h3 className="font-bold text-base text-[var(--text-primary)] truncate">
                  {item.customerName}
                </h3>
                {item.companyOrOrg && (
                  <p className="text-xs text-[var(--text-secondary)] font-medium truncate">
                    {item.companyOrOrg}
                  </p>
                )}

                {item.package && (
                  <p className="text-xs font-bold text-[var(--color-primary)] mt-1 truncate">
                    Pkg: {item.package.titleEn}
                  </p>
                )}

                <div className="space-y-1 mt-3 pt-3 border-t border-[var(--border-level-1)] text-xs text-[var(--text-secondary)] font-mono">
                  {item.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> {item.phone}</div>}
                  {item.email && <div className="flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" /> <span className="truncate">{item.email}</span></div>}
                  <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> {item.expectedGuests} Guests</div>
                  {item.preferredDate && <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[var(--text-tertiary)]" /> {new Date(item.preferredDate).toLocaleDateString()}</div>}
                  {item.couponCode && <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><Tag className="w-3.5 h-3.5" /> Code: {item.couponCode}</div>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-level-1)] text-xs gap-2">
                <select
                  value={item.status}
                  onChange={e => handleStatusChange(item.id, e.target.value)}
                  className="bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-2.5 py-1 text-[11px] font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="QUOTATION_SENT">QUOTATION SENT</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="LOST">LOST</option>
                </select>

                <div className="flex items-center gap-1.5">
                  {onSelectLeadForQuotation && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectLeadForQuotation(item)}
                      className="h-7 px-2.5 text-[11px] gap-1 font-bold"
                      title="Build Quotation for Lead"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[var(--color-primary)]" />
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
            </div>
          ))}
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
