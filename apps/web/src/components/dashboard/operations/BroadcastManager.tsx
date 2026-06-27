"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, ToggleRight, ToggleLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { format } from "date-fns"

export function BroadcastManager({ initialBroadcasts }: { initialBroadcasts: any[] }) {
  const router = useRouter()
  const [broadcasts, setBroadcasts] = useState(initialBroadcasts)
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [titleEn, setTitleEn] = useState("")
  const [titleAr, setTitleAr] = useState("")
  const [messageEn, setMessageEn] = useState("")
  const [messageAr, setMessageAr] = useState("")
  const [type, setType] = useState("INFO")
  const [isActive, setIsActive] = useState(true)

  const handleAddBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/operations/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn,
          titleAr,
          messageEn,
          messageAr,
          type,
          isActive
        })
      })

      if (!res.ok) throw new Error("Failed to create broadcast")
      
      const newBroadcast = await res.json()
      setBroadcasts(prev => [newBroadcast, ...prev])
      setIsAdding(false)
      
      // Reset form
      setTitleEn("")
      setTitleAr("")
      setMessageEn("")
      setMessageAr("")
      setType("INFO")
      setIsActive(true)

      router.refresh()
    } catch (err) {
      alert("Failed to add broadcast.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setBroadcasts(prev => prev.map(b => b.id === id ? { ...b, isActive: !currentStatus } : b))
    
    try {
      const res = await fetch(`/api/operations/broadcasts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!res.ok) throw new Error("Failed to toggle")
      router.refresh()
    } catch {
      // Revert on failure
      setBroadcasts(prev => prev.map(b => b.id === id ? { ...b, isActive: currentStatus } : b))
      alert("Failed to update broadcast status.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this broadcast?")) return
    try {
      const res = await fetch(`/api/operations/broadcasts/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")

      setBroadcasts(prev => prev.filter(b => b.id !== id))
      router.refresh()
    } catch {
      alert("Failed to delete broadcast.")
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">System Broadcasts</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage platform-wide announcements and alerts.</p>
        </div>
        
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4" /> New Broadcast</>}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddBroadcast} className="bg-[var(--surface-default)] p-6 rounded-xl border border-[var(--border-default)] shadow-sm mb-8 space-y-6 animate-in fade-in zoom-in duration-200">
          <h2 className="font-bold text-[var(--text-primary)]">New Broadcast Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Title (English) *</label>
                <input 
                  type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Message (English) *</label>
                <textarea 
                  value={messageEn} onChange={e => setMessageEn(e.target.value)} rows={3}
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm resize-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Title (Arabic)</label>
                <input 
                  type="text" value={titleAr} onChange={e => setTitleAr(e.target.value)} dir="rtl"
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
                  placeholder="Leave blank to use English"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Message (Arabic)</label>
                <textarea 
                  value={messageAr} onChange={e => setMessageAr(e.target.value)} rows={3} dir="rtl"
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm resize-none"
                  placeholder="Leave blank to use English"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[var(--border-default)]">
            <div className="space-y-1.5 flex-1 max-w-xs">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Type *</label>
              <select 
                value={type} onChange={e => setType(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
                required
              >
                <option value="INFO">Information</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Critical / Error</option>
              </select>
            </div>
            
            <div className="space-y-1.5 flex flex-col justify-center">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Active Immediately</label>
              <button 
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="p-1 rounded-full hover:bg-[var(--surface-active)] transition-colors self-start"
              >
                {isActive ? (
                  <ToggleRight className="w-8 h-8 text-[var(--color-primary)]" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-[var(--text-tertiary)]" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Broadcast"}
            </Button>
          </div>
        </form>
      )}

      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-hover)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-4 font-bold">Message</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Created</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {broadcasts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-tertiary)]">
                    No active broadcasts.
                  </td>
                </tr>
              )}
              {broadcasts.map(msg => (
                <tr key={msg.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="p-4 max-w-sm truncate">
                    <div className="font-bold text-[var(--text-primary)] mb-1">{msg.titleEn}</div>
                    <div className="text-xs text-[var(--text-secondary)] truncate">{msg.messageEn}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold ${msg.type === 'INFO' ? 'bg-blue-500/10 text-blue-500' : msg.type === 'WARNING' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                      {msg.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleToggle(msg.id, msg.isActive)}
                      className="p-2 -ml-2 rounded-full hover:bg-[var(--surface-active)] transition-colors"
                    >
                      {msg.isActive ? (
                        <ToggleRight className="w-6 h-6 text-[var(--color-primary)]" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-[var(--text-tertiary)]" />
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-[var(--text-tertiary)] text-xs">
                    {format(new Date(msg.createdAt), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(msg.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
