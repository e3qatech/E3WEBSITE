"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Filter, FileText, UserCheck, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

type Talent = {
  id: string
  name: string
  email: string
  phone: string | null
  position: string | null
  department: string | null
  status: string
  rating: number | null
  appliedDate: string
  resumeUrl: string | null
  job: { title: string } | null
}

export function TalentList({ initialTalent }: { initialTalent: Talent[] }) {
  const router = useRouter()
  const [talent, setTalent] = useState(initialTalent)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

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
    if (!confirm("Delete this candidate?")) return
    try {
      const res = await fetch(`/api/crm/talent/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      
      setTalent(prev => prev.filter(t => t.id !== id))
      router.refresh()
    } catch {
      alert("Failed to delete candidate")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW": return <Badge variant="info">New</Badge>
      case "SCREENING": return <Badge variant="warning">Screening</Badge>
      case "INTERVIEW": return <Badge variant="info">Interview</Badge>
      case "OFFERED": return <Badge variant="success">Offered</Badge>
      case "HIRED": return <Badge variant="success" className="border-green-500">Hired</Badge>
      case "REJECTED": return <Badge variant="error">Rejected</Badge>
      default: return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Talent Acquisition</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage job applications and candidates.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Search candidates..." 
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
            <option value="SCREENING">Screening</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFERED">Offered</option>
            <option value="HIRED">Hired</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Candidate
          </Button>
        </div>
      </div>

      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-subtle)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Position / Job</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Applied</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-tertiary)]">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No candidates found.
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--text-primary)]">
                        <Link href={`/dashboard/crm/talent/${t.id}`} className="hover:text-[var(--color-primary)]">
                          {t.name}
                        </Link>
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)]">{t.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[var(--text-primary)]">{t.position || t.job?.title || "General Application"}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">{t.department || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(t.status)}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {new Date(t.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {t.rating ? (
                        <div className="flex text-yellow-500">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[var(--text-tertiary)]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <select 
                        value={t.status}
                        onChange={(e) => updateStatus(t.id, e.target.value)}
                        className="text-xs px-2 py-1.5 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded focus:outline-none"
                      >
                        <option value="NEW">New</option>
                        <option value="SCREENING">Screening</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="OFFERED">Offered</option>
                        <option value="HIRED">Hired</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                      {t.resumeUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={t.resumeUrl} target="_blank" rel="noopener noreferrer"><FileText className="w-4 h-4" /></a>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/crm/talent/${t.id}`}>View</Link>
                      </Button>
                      <button onClick={() => deleteTalent(t.id)} className="p-2 text-[var(--color-error)] hover:bg-[#EF444415] rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
