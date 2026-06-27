"use client"

import { useState } from "react"
import { Search, Globe, Building2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"

type Client = {
  id: string
  company: string
  type: string
  industry: string | null
  website: string | null
  assignedRepId: string | null
  createdAt: string
}

export function ClientsList({ initialClients }: { initialClients: Client[] }) {
  const [clients] = useState(initialClients)
  const [search, setSearch] = useState("")

  const filtered = clients.filter(c => 
    c.company.toLowerCase().includes(search.toLowerCase()) || 
    (c.industry?.toLowerCase().includes(search.toLowerCase()) || false)
  )

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "B2B": return <Badge variant="info">B2B</Badge>
      case "GOVERNMENT": return <Badge variant="warning">Government</Badge>
      case "AGENCY": return <Badge variant="success">Agency</Badge>
      default: return <Badge variant="default">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Clients Database</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage accounts, agencies, and government partners.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] w-full md:w-64"
            />
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Client
          </Button>
        </div>
      </div>

      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-subtle)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Industry</th>
                <th className="px-6 py-4 font-medium">Website</th>
                <th className="px-6 py-4 font-medium">Added On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-tertiary)]">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No clients found.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--text-primary)]">{c.company}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(c.type)}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {c.industry || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {c.website ? (
                        <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[var(--color-primary)] hover:underline">
                          <Globe className="w-4 h-4" /> {c.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-[var(--text-tertiary)]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      {new Date(c.createdAt).toLocaleDateString()}
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
