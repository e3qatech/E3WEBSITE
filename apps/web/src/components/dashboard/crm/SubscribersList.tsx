"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Mail, Phone, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"

type Subscriber = {
  id: string
  email: string | null
  phone: string | null
  isVerified: boolean
  verifiedAt: string | null
  preferences: any | null
  createdAt: string
}

export function SubscribersList({ initialSubscribers }: { initialSubscribers: Subscriber[] }) {
  const router = useRouter()
  const [subscribers, setSubscribers] = useState(initialSubscribers)
  const [search, setSearch] = useState("")

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return
    try {
      const res = await fetch(`/api/crm/subscribers/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()

      setSubscribers(prev => prev.filter(s => s.id !== id))
      router.refresh()
    } catch {
      alert("Failed to delete subscriber")
    }
  }

  const filtered = subscribers.filter(s => 
    (s.email?.toLowerCase().includes(search.toLowerCase()) || false) || 
    (s.phone?.includes(search) || false)
  )

  const renderPreferences = (prefs: any) => {
    if (!prefs) return <span className="text-text-tertiary">-</span>
    let parsed: any = {}
    if (typeof prefs === "string") {
      try { parsed = JSON.parse(prefs) } catch { parsed = {} }
    } else {
      parsed = prefs
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(parsed).map(([key, val]) => (
          val ? <Badge key={key} variant="default" className="text-[10px] bg-transparent border border-border-default">{key}</Badge> : null
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Subscribers</h1>
          <p className="text-sm text-text-secondary">Manage newsletter and event subscribers.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input 
              type="text" 
              placeholder="Search email/phone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ps-9 pe-4 py-2 bg-surface-default border border-border-default rounded-lg text-sm focus:outline-none focus:border-accent w-full md:w-64"
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={() => {
            const csv = [
              ["Email", "Phone", "Verified", "Verified At", "Preferences", "Subscribed On"].join(","),
              ...subscribers.map(s => [
                s.email || "",
                s.phone || "",
                s.isVerified ? "Yes" : "No",
                s.verifiedAt ? new Date(s.verifiedAt).toLocaleDateString() : "",
                s.preferences ? JSON.stringify(s.preferences).replace(/,/g, ";") : "",
                new Date(s.createdAt).toLocaleDateString()
              ].join(","))
            ].join("\n")
            const blob = new Blob([csv], { type: "text/csv" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "subscribers.csv"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-surface-default border border-border-default rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-hover border-b border-border-default text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Verification</th>
                <th className="px-6 py-4 font-medium">Preferences</th>
                <th className="px-6 py-4 font-medium">Subscribed On</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-tertiary">
                    No subscribers found.
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4">
                      {s.email && (
                        <div className="flex items-center gap-2 text-text-primary font-medium">
                          <Mail className="w-4 h-4 text-text-tertiary" /> {s.email}
                        </div>
                      )}
                      {s.phone && (
                        <div className="flex items-center gap-2 text-text-primary font-medium mt-1">
                          <Phone className="w-4 h-4 text-text-tertiary" /> {s.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {s.isVerified ? (
                        <div className="flex items-center gap-1.5 text-[var(--color-success)]">
                          <CheckCircle className="w-4 h-4" /> Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-text-tertiary">
                          <XCircle className="w-4 h-4" /> Unverified
                        </div>
                      )}
                      {s.verifiedAt && <div className="text-xs text-text-tertiary mt-1">{new Date(s.verifiedAt).toLocaleDateString()}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {renderPreferences(s.preferences)}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
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
