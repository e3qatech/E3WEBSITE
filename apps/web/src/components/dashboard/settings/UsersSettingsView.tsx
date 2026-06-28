"use client"

import { useState } from "react"
import { Users, UserPlus, Shield, Check, X, ShieldAlert, Key } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { format } from "date-fns"

export function UsersSettingsView({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteData, setInviteData] = useState({ name: "", email: "", role: "STAFF" })

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/settings/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteData)
      })

      if (!res.ok) throw new Error("Failed to invite user")

      const newUser = await res.json()
      setUsers([newUser, ...users])
      setShowInviteForm(false)
      setInviteData({ name: "", email: "", role: "STAFF" })
      alert(`Invitation sent and user created for ${inviteData.email}`)
    } catch (error) {
      alert("Failed to invite user.")
      console.error(error)
    }
  }

  const ROLES = ["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN", "STAFF", "CLIENT"]
  const MATRIX = [
    { resource: "Attractions", actions: ["SUPER_ADMIN", "STAFF"] },
    { resource: "CRM Leads", actions: ["SUPER_ADMIN", "SALES_ADMIN"] },
    { resource: "B2B Services", actions: ["SUPER_ADMIN", "SALES_ADMIN"] },
    { resource: "Feedback & Inquiries", actions: ["SUPER_ADMIN", "SUPPORT_ADMIN", "STAFF"] },
    { resource: "System Settings", actions: ["SUPER_ADMIN"] },
  ]

  return (
    <div className="flex flex-col h-full w-full max-w-[1400px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">User Management</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage staff access, roles, and permissions.</p>
        </div>
        
        <Button onClick={() => setShowInviteForm(!showInviteForm)} className="gap-2">
          <UserPlus className="w-4 h-4" /> Invite User
        </Button>
      </div>

      {showInviteForm && (
        <form onSubmit={handleInvite} className="glass rounded-3xl border-gradient p-6 mb-8 relative overflow-hidden shadow-xl group">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center relative z-10">
            <UserPlus className="w-5 h-5 mr-2 text-[var(--color-primary)]" /> Send Invitation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end relative z-10">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Name</label>
              <input required type="text" value={inviteData.name} onChange={e => setInviteData({...inviteData, name: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Email</label>
              <input required type="email" value={inviteData.email} onChange={e => setInviteData({...inviteData, email: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Role</label>
              <select value={inviteData.role} onChange={e => setInviteData({...inviteData, role: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors">
                {ROLES.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <Button type="submit" className="w-full">Send Invite</Button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Users Table */}
        <div className="xl:col-span-2 glass rounded-3xl border-gradient overflow-hidden shadow-xl relative group">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
          <div className="p-4 border-b border-zinc-800/50 bg-zinc-950/40 relative z-10">
            <h2 className="font-bold text-[var(--text-primary)] flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" /> System Users
            </h2>
          </div>
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-950/60 border-b border-zinc-800/50 text-[var(--text-secondary)]">
                <tr>
                  <th className="p-4 font-bold">User</th>
                  <th className="p-4 font-bold">Role</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Joined</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[var(--text-primary)]">{user.name || "Unknown"}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-bold bg-[var(--surface-active)] text-[var(--text-secondary)]">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center text-green-500 text-xs font-bold"><Check className="w-3 h-3 mr-1" /> Active</span>
                      ) : (
                        <span className="inline-flex items-center text-red-500 text-xs font-bold"><X className="w-3 h-3 mr-1" /> Inactive</span>
                      )}
                    </td>
                    <td className="p-4 text-[var(--text-tertiary)] text-xs">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">Disable</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="xl:col-span-1 glass rounded-3xl border-gradient overflow-hidden shadow-xl flex flex-col relative group">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
          <div className="p-4 border-b border-zinc-800/50 bg-zinc-950/40 relative z-10">
            <h2 className="font-bold text-[var(--text-primary)] flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-amber-500" /> Permission Matrix
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Resource access by role.</p>
          </div>
          <div className="p-4 flex-1 overflow-auto relative z-10">
            <div className="space-y-4">
              {MATRIX.map(row => (
                <div key={row.resource} className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-3">
                  <h3 className="font-bold text-sm text-[var(--text-primary)] mb-2">{row.resource}</h3>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.filter(r => r !== "CLIENT").map(role => (
                      <span key={role} className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold ${row.actions.includes(role) ? 'bg-green-500/10 text-green-500' : 'bg-[var(--surface-active)] text-[var(--text-tertiary)]'}`}>
                        {row.actions.includes(role) ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                        {role.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
