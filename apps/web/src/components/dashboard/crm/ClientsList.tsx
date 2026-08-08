"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Globe, Building2, Plus, Trash2, Users, UserPlus, ShieldCheck } from "lucide-react"
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

type Member = {
  id: string
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
  isActive: boolean
  user: {
    id: string
    name: string | null
    email: string
    role: string
    isActive: boolean
  }
}

export function ClientsList({ initialClients }: { initialClients: Client[] }) {
  const router = useRouter()
  const [clients, setClients] = useState(initialClients)
  const [search, setSearch] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Tenant Membership Modal state
  const [activeClient, setActiveClient] = useState<Client | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [memberEmail, setMemberEmail] = useState("")
  const [memberRole, setMemberRole] = useState<"OWNER" | "ADMIN" | "MEMBER" | "VIEWER">("MEMBER")
  const [isAddingMember, setIsAddingMember] = useState(false)

  const handleAddClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      company: formData.get("company"),
      type: formData.get("type"),
      industry: formData.get("industry"),
      website: formData.get("website")
    }

    try {
      const res = await fetch("/api/crm/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!res.ok) throw new Error()
      
      const newClient = await res.json()
      setClients(prev => [newClient, ...prev])
      setIsAdding(false)
      router.refresh()
    } catch {
      alert("Failed to add client")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return
    try {
      const res = await fetch(`/api/crm/clients/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()

      setClients(prev => prev.filter(c => c.id !== id))
      router.refresh()
    } catch {
      alert("Failed to delete client")
    }
  }

  const handleOpenMembers = async (client: Client) => {
    setActiveClient(client)
    setIsLoadingMembers(true)
    try {
      const res = await fetch(`/api/admin/clients/${client.id}/members`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (_e) {
      alert("Failed to load company members")
    } finally {
      setIsLoadingMembers(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeClient || !memberEmail) return
    setIsAddingMember(true)

    try {
      const res = await fetch(`/api/admin/clients/${activeClient.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: memberEmail, role: memberRole })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to add member")

      setMembers(prev => [data, ...prev.filter(m => m.id !== data.id)])
      setMemberEmail("")
    } catch (err: any) {
      alert(err.message || "Failed to add member to client tenant")
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleMemberRoleChange = async (memberId: string, newRole: string) => {
    if (!activeClient) return
    try {
      const res = await fetch(`/api/admin/clients/${activeClient.id}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      })
      const updated = await res.json()
      if (!res.ok) throw new Error(updated.error)

      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: updated.role } : m))
    } catch (err: any) {
      alert(err.message || "Failed to update member role")
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!activeClient || !confirm("Remove this member from the company tenant?")) return
    try {
      const res = await fetch(`/api/admin/clients/${activeClient.id}/members/${memberId}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error()

      setMembers(prev => prev.filter(m => m.id !== memberId))
    } catch {
      alert("Failed to remove member")
    }
  }

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
          <h1 className="text-2xl font-black text-text-primary">Clients & Multi-Tenant Directory</h1>
          <p className="text-sm text-text-secondary">Manage accounts, agencies, government partners, and tenant memberships.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ps-9 pe-4 py-2 bg-surface-default border border-border-default rounded-lg text-sm focus:outline-none focus:border-accent w-full md:w-64"
            />
          </div>
          <Button className="gap-2" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" /> Add Client
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddClient}
            className="bg-surface-default rounded-2xl w-full max-w-lg p-6 border border-border-default shadow-xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">New Client Entity</h2>
              <button type="button" onClick={() => setIsAdding(false)} className="text-text-tertiary hover:text-text-primary">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary">Company Name *</label>
                <input required name="company" className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Type</label>
                  <select name="type" className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm">
                    <option value="B2B">B2B</option>
                    <option value="GOVERNMENT">Government</option>
                    <option value="AGENCY">Agency</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary">Industry</label>
                  <input name="industry" className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary">Website</label>
                <input type="url" name="website" placeholder="https://" className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm" />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Create Client"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tenant Memberships Management Modal */}
      {activeClient && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-default rounded-2xl w-full max-w-2xl p-6 border border-border-default shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-border-default pb-4">
              <div>
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-accent" /> {activeClient.company}
                </h2>
                <p className="text-xs text-text-tertiary mt-0.5">Manage user tenant access and membership permissions for this company.</p>
              </div>
              <button onClick={() => setActiveClient(null)} className="text-text-tertiary hover:text-text-primary">
                ✕
              </button>
            </div>

            {/* Add Member Form */}
            <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3 bg-surface-hover p-4 rounded-xl border border-border-default">
              <div className="flex-1">
                <input
                  type="email"
                  required
                  placeholder="User email address..."
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-default border border-border-default rounded-lg text-sm"
                />
              </div>
              <select
                value={memberRole}
                onChange={e => setMemberRole(e.target.value as any)}
                className="px-3 py-2 bg-surface-default border border-border-default rounded-lg text-sm"
              >
                <option value="OWNER">Tenant Owner</option>
                <option value="ADMIN">Tenant Admin</option>
                <option value="MEMBER">Member</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <Button type="submit" disabled={isAddingMember} className="gap-1.5 shrink-0">
                <UserPlus className="w-4 h-4" /> {isAddingMember ? "Adding..." : "Add Member"}
              </Button>
            </form>

            {/* Members List Table */}
            <div className="border border-border-default rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface-hover text-text-secondary text-xs">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Global Role</th>
                    <th className="px-4 py-3 font-medium">Tenant Role</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {isLoadingMembers ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-text-tertiary">
                        Loading tenant members...
                      </td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-text-tertiary">
                        No members assigned to this client tenant yet.
                      </td>
                    </tr>
                  ) : (
                    members.map(m => (
                      <tr key={m.id} className="hover:bg-surface-hover">
                        <td className="px-4 py-3">
                          <div className="font-bold text-text-primary text-xs">{m.user.name || "User"}</div>
                          <div className="text-[11px] text-text-tertiary">{m.user.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-text-secondary">{m.user.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={m.role}
                            onChange={e => handleMemberRoleChange(m.id, e.target.value)}
                            className="text-xs bg-surface-default border border-border-default rounded px-2 py-1 font-semibold text-accent"
                          >
                            <option value="OWNER">OWNER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="MEMBER">MEMBER</option>
                            <option value="VIEWER">VIEWER</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(m.id)} className="text-red-400 hover:bg-red-400/10">
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-border-default">
              <Button variant="outline" onClick={() => setActiveClient(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-surface-default border border-border-default rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-hover border-b border-border-default text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Industry</th>
                <th className="px-6 py-4 font-medium">Website</th>
                <th className="px-6 py-4 font-medium">Added On</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-tertiary">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No clients found.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-text-primary">{c.company}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(c.type)}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {c.industry || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {c.website ? (
                        <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-accent hover:underline">
                          <Globe className="w-4 h-4" /> {c.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-text-tertiary">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenMembers(c)} className="gap-1.5 text-xs">
                        <Users className="w-3.5 h-3.5" /> Members
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
