"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, FileText, UserCheck, Trash2, XCircle, ArrowRight, Star } from "lucide-react"
import { AdminPageHeader } from "@/components/dashboard/ui/AdminPageHeader"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { AdminStatusBadge } from "@/components/dashboard/ui/AdminStatusBadge"
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "@/components/dashboard/ui/AdminTable"
import { SlideOver } from "@/components/dashboard/ui/SlideOver"
import { TalentDetail, type Talent } from "./TalentDetail"

export function TalentList({ initialTalent }: { initialTalent: Talent[] }) {
  const router = useRouter()
  const [talent, setTalent] = useState(initialTalent)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTalentId, setSelectedTalentId] = useState<string | null>(null)

  const handleAddCandidate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      position: formData.get("position"),
      department: formData.get("department"),
      experienceLevel: formData.get("experienceLevel")
    }

    try {
      const res = await fetch("/api/crm/talent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!res.ok) throw new Error()
      
      const newCandidate = await res.json()
      setTalent(prev => [newCandidate, ...prev])
      setIsAdding(false)
      router.refresh()
    } catch {
      alert("Failed to add candidate")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = talent.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      (t.position && t.position.toLowerCase().includes(search.toLowerCase()))
      
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/crm/talent/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error()
      
      setTalent(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
      router.refresh()
    } catch {
      alert("Failed to update status")
    }
  }

  const deleteTalent = async (id: string) => {
    if (!confirm("Delete this candidate permanently?")) return
    try {
      const res = await fetch(`/api/crm/talent/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      
      setTalent(prev => prev.filter(t => t.id !== id))
      router.refresh()
    } catch {
      alert("Failed to delete candidate")
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "NEW": return "info"
      case "SCREENING": return "warning"
      case "INTERVIEW": return "info"
      case "OFFERED": return "success"
      case "HIRED": return "success"
      case "REJECTED": return "error"
      default: return "default"
    }
  }

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <AdminPageHeader 
        title="Talent Acquisition" 
        description="Manage job applications, candidates, and hiring pipeline."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input 
                type="text" 
                placeholder="Search candidates..." 
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
              <option value="SCREENING">Screening</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OFFERED">Offered</option>
              <option value="HIRED">Hired</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <AdminButton variant="primary" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 me-2" /> Add Candidate
            </AdminButton>
          </div>
        }
      />

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleAddCandidate}
            className="bg-surface-default rounded-2xl w-full max-w-xl border border-border-default shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-border-default">
              <h2 className="text-xl font-bold text-text-primary">New Candidate</h2>
              <button type="button" onClick={() => setIsAdding(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Name *</label>
                  <input required name="name" className="w-full px-4 py-3 bg-surface-hover border border-border-default rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email *</label>
                  <input required type="email" name="email" className="w-full px-4 py-3 bg-surface-hover border border-border-default rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Phone</label>
                  <input name="phone" className="w-full px-4 py-3 bg-surface-hover border border-border-default rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Position</label>
                  <input name="position" className="w-full px-4 py-3 bg-surface-hover border border-border-default rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Department</label>
                  <input name="department" className="w-full px-4 py-3 bg-surface-hover border border-border-default rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Experience Level</label>
                  <select name="experienceLevel" className="w-full px-4 py-3 bg-surface-hover border border-border-default rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent appearance-none">
                    <option value="">Select...</option>
                    <option value="JUNIOR">Junior</option>
                    <option value="MID">Mid-Level</option>
                    <option value="SENIOR">Senior</option>
                    <option value="LEAD">Lead/Manager</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-bg-level-1 border-t border-border-default flex justify-end gap-3 rounded-b-2xl">
              <AdminButton type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</AdminButton>
              <AdminButton type="submit" variant="primary" isLoading={isSubmitting}>
                {isSubmitting ? "Saving..." : "Add Candidate"}
              </AdminButton>
            </div>
          </form>
        </div>
      )}

      <div className="p-8 flex-1 overflow-y-auto">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Candidate</AdminTableHead>
              <AdminTableHead>Position / Job</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead>Applied</AdminTableHead>
              <AdminTableHead>Rating</AdminTableHead>
              <AdminTableHead className="text-right">Actions</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {filtered.length === 0 ? (
              <AdminTableRow>
                <AdminTableCell colSpan={6} className="h-32 text-center text-text-tertiary">
                  <div className="flex flex-col items-center justify-center">
                    <UserCheck className="w-8 h-8 mb-3 opacity-20" />
                    No candidates found.
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ) : (
              filtered.map(t => (
                <AdminTableRow key={t.id} className="cursor-pointer group" onClick={() => setSelectedTalentId(t.id)}>
                  <AdminTableCell>
                    <div className="font-bold text-text-primary group-hover:text-accent transition-colors">
                      {t.name}
                    </div>
                    <div className="text-xs text-text-tertiary mt-0.5">{t.email}</div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="text-text-primary font-medium">{t.position || t.job?.title || "General Application"}</div>
                    <div className="text-xs text-text-secondary mt-0.5">{t.department || "N/A"}</div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusBadge variant={getStatusVariant(t.status) as any}>{t.status}</AdminStatusBadge>
                  </AdminTableCell>
                  <AdminTableCell className="text-text-secondary text-sm">
                    {new Date(t.appliedDate).toLocaleDateString()}
                  </AdminTableCell>
                  <AdminTableCell>
                    {t.rating ? (
                      <div className="flex gap-0.5 text-accent">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    ) : (
                      <span className="text-text-tertiary">-</span>
                    )}
                  </AdminTableCell>
                  <AdminTableCell className="text-right">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <select 
                        value={t.status}
                        onChange={(e) => updateStatus(t.id, e.target.value)}
                        className="text-xs px-2 py-1.5 bg-surface-default border border-border-default rounded-md focus:outline-none focus:border-accent text-text-primary"
                      >
                        <option value="NEW">New</option>
                        <option value="SCREENING">Screening</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="OFFERED">Offered</option>
                        <option value="HIRED">Hired</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                      
                      {t.resumeUrl && (
                        <AdminButton variant="outline" size="sm" onClick={() => window.open(t.resumeUrl!, "_blank")}>
                          <FileText className="w-3.5 h-3.5" />
                        </AdminButton>
                      )}
                      
                      <button 
                        onClick={() => deleteTalent(t.id)} 
                        className="p-1.5 text-text-tertiary hover:text-error hover:bg-error/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))
            )}
          </AdminTableBody>
        </AdminTable>
      </div>

      <SlideOver
        isOpen={!!selectedTalentId}
        onClose={() => setSelectedTalentId(null)}
        title="Candidate Details"
      >
        {selectedTalentId && (
          <TalentDetail 
            key={selectedTalentId}
            initialTalent={talent.find(t => t.id === selectedTalentId)!}
            onClose={() => setSelectedTalentId(null)}
          />
        )}
      </SlideOver>
    </div>
  )
}
