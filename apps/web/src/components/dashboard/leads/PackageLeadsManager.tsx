"use client"

import { useState, useEffect } from "react"
import { 
  Search, Filter, Check, Clock, User, Users, Building2, Phone, Mail, MessageSquare, 
  Calendar, FileText, Download, ShieldCheck, Eye, Trash2, ArrowUpRight, Tag
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui"

export function PackageLeadsManager() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [search, setSearch] = useState("")
  const [selectedLead, setSelectedLead] = useState<any | null>(null)

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/b2c/package-leads")
      const json = await res.json()
      setLeads(Array.isArray(json.data) ? json.data : [])
    } catch (e) {
      console.error(e)
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
    } catch (e) {
      alert("Failed to update lead status")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return
    try {
      await fetch(`/api/b2c/package-leads/${id}`, { method: "DELETE" })
      if (selectedLead?.id === id) setSelectedLead(null)
      fetchLeads()
    } catch (e) {
      alert("Failed to delete lead")
    }
  }

  const filtered = leads.filter(l => {
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter
    const matchesType = typeFilter === "ALL" || l.leadType === typeFilter
    const matchesSearch = 
      !search ||
      (l.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.companyOrOrg || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.phone || "").toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesType && matchesSearch
  })

  const exportCSV = () => {
    const headers = "Lead ID,Name,Company/Org,Type,Package,Status,Guest Count,Est Value,Phone,Email,Date\n"
    const rows = filtered.map(l => 
      `"${l.id}","${l.customerName}","${l.companyOrOrg || ''}","${l.leadType}","${l.package?.titleEn || ''}","${l.status}",${l.expectedGuests},${l.estimatedValue || 0},"${l.phone || ''}","${l.email}",${l.createdAt}`
    ).join("\n")

    const blob = new Blob([headers + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `E3_Package_Leads_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <DashboardPageShell variant="wide">
      {/* Header */}
      <DashboardPageHeader
        title="Package Leads & Enquiries"
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

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-default)] overflow-x-auto">
          {["ALL", "NEW", "CONTACTED", "QUALIFIED", "QUOTATION_SENT", "CONFIRMED", "COMPLETED", "LOST"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer",
                statusFilter === s ? "bg-[var(--surface-default)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)]"
              )}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="relative flex-1 md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input 
            type="text" 
            placeholder="Search leads by name, email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] text-[var(--text-tertiary)] animate-pulse">
          Loading Package Leads...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] space-y-3">
          <FileText className="w-10 h-10 mx-auto text-[var(--text-tertiary)] opacity-40" />
          <p className="text-base font-bold text-[var(--text-primary)]">No leads found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div key={item.id} className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-5 hover:border-[var(--color-primary)] transition-all shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider bg-purple-500/10 text-purple-600 border border-purple-500/20">
                    {item.leadType}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider",
                    item.status === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-600" :
                    item.status === "NEW" ? "bg-blue-500/10 text-blue-600" : "bg-gray-500/10 text-gray-500"
                  )}>
                    {item.status}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                  {item.customerName}
                </h3>
                {item.companyOrOrg && (
                  <p className="text-xs text-[var(--text-secondary)] font-medium">
                    {item.companyOrOrg}
                  </p>
                )}

                {item.package && (
                  <p className="text-xs font-bold text-[var(--color-primary)] mt-1">
                    Pkg: {item.package.titleEn}
                  </p>
                )}

                <div className="space-y-1 mt-3 pt-3 border-t border-[var(--border-default)]/60 text-xs text-[var(--text-secondary)] font-mono">
                  {item.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {item.phone}</div>}
                  {item.email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {item.email}</div>}
                  <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {item.expectedGuests} Guests</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)] text-xs">
                <select
                  value={item.status}
                  onChange={e => handleStatusChange(item.id, e.target.value)}
                  className="bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-2 py-1 text-[11px] font-bold text-[var(--text-primary)]"
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="QUOTATION_SENT">QUOTATION SENT</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="LOST">LOST</option>
                </select>

                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardPageShell>
  )
}
