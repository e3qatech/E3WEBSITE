"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Filter, 
  MessageSquare,
  CheckCircle,
  Clock,
  Star,
  Eye,
  Trash2,
  X
} from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

type Feedback = {
  id: string
  name: string | null
  email: string | null
  title: string | null
  message: string
  rating: number | null
  status: string
  isFeatured: boolean
  createdAt: string
  attraction: { nameEn: string } | null
}

export function FeedbackInbox({ initialFeedback }: { initialFeedback: Feedback[] }) {
  const router = useRouter()
  const [feedback, setFeedback] = useState(initialFeedback)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)

  const filtered = feedback.filter(f => {
    const matchesSearch = 
      (f.name?.toLowerCase().includes(search.toLowerCase()) || false) || 
      (f.email?.toLowerCase().includes(search.toLowerCase()) || false) || 
      (f.title?.toLowerCase().includes(search.toLowerCase()) || false) ||
      f.message.toLowerCase().includes(search.toLowerCase())
      
    const matchesStatus = statusFilter === "ALL" || f.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/b2c/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error()
      
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f))
      if (selectedFeedback?.id === id) {
        setSelectedFeedback({ ...selectedFeedback, status: newStatus })
      }
      router.refresh()
    } catch {
      alert("Failed to update status")
    }
  }

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const res = await fetch(`/api/b2c/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured })
      })
      if (!res.ok) throw new Error()
      
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, isFeatured } : f))
      if (selectedFeedback?.id === id) {
        setSelectedFeedback({ ...selectedFeedback, isFeatured })
      }
      router.refresh()
    } catch {
      alert("Failed to update feature status")
    }
  }

  const deleteFeedback = async (id: string) => {
    if (!confirm("Delete this feedback? This cannot be undone.")) return
    try {
      const res = await fetch(`/api/b2c/feedback/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      
      setFeedback(prev => prev.filter(f => f.id !== id))
      setSelectedFeedback(null)
      router.refresh()
    } catch {
      alert("Failed to delete feedback")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW": return <Badge variant="info">New</Badge>
      case "REVIEWED": return <Badge variant="warning">Reviewed</Badge>
      case "RESOLVED": return <Badge variant="success">Resolved</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Customer Feedback</h1>
          <p className="text-sm text-[var(--text-secondary)]">Review and manage attraction ratings and feedback.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Search feedback..." 
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
            <option value="REVIEWED">Reviewed</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative h-[600px]">
        {/* Inbox List */}
        <div className={cn(
          "glass rounded-3xl border-gradient flex flex-col h-full overflow-hidden shadow-2xl relative",
          selectedFeedback ? "hidden lg:flex lg:col-span-5" : "col-span-1 lg:col-span-12"
        )}>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
          <div className="overflow-y-auto flex-1 divide-y divide-zinc-800/30 relative z-10 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-tertiary)] flex flex-col items-center">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                <p>No feedback found.</p>
              </div>
            ) : (
              filtered.map(f => (
                <button 
                  key={f.id}
                  onClick={() => setSelectedFeedback(f)}
                  className={cn(
                    "w-full text-left p-5 hover:bg-zinc-900/50 transition-all relative group",
                    selectedFeedback?.id === f.id ? "bg-zinc-900/80 border-l-2 border-[var(--color-primary)] shadow-inner" : "border-l-2 border-transparent"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-bold text-sm text-[var(--text-primary)] truncate pr-2">
                      {f.name || "Anonymous User"}
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(f.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-2">
                    {f.rating && (
                      <span className="flex items-center gap-0.5 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" /> {f.rating}
                      </span>
                    )}
                    {f.attraction && <span>• {f.attraction.nameEn}</span>}
                    <span>• {new Date(f.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] line-clamp-2">
                    {f.title ? <span className="font-medium">{f.title}: </span> : null}
                    {f.message}
                  </div>
                  {f.isFeatured && (
                    <Star className="w-3 h-3 text-[var(--color-warning)] fill-current absolute bottom-4 right-4" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedFeedback && (
          <div className="col-span-1 lg:col-span-7 glass rounded-3xl border-gradient shadow-2xl overflow-hidden flex flex-col h-full animate-in slide-in-from-right-4 lg:slide-in-from-bottom-0 duration-300 relative">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
            <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-950/40 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-lg">
                  {selectedFeedback.name ? selectedFeedback.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] leading-tight">{selectedFeedback.name || "Anonymous"}</h3>
                  <a href={`mailto:${selectedFeedback.email}`} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--color-primary)] transition-colors">
                    {selectedFeedback.email || "No email provided"}
                  </a>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFeedback(null)}
                className="p-2 text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-[var(--border-default)]">
                {selectedFeedback.rating && (
                  <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-md font-bold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("w-4 h-4", i < selectedFeedback.rating! ? "fill-current" : "opacity-30")} />
                    ))}
                  </div>
                )}
                {selectedFeedback.attraction && (
                  <Badge variant="default">{selectedFeedback.attraction.nameEn}</Badge>
                )}
                <span className="text-xs text-[var(--text-tertiary)]">
                  {new Date(selectedFeedback.createdAt).toLocaleString()}
                </span>
              </div>

              <div>
                {selectedFeedback.title && (
                  <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">{selectedFeedback.title}</h2>
                )}
                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {selectedFeedback.message}
                </p>
              </div>
            </div>

            <div className="p-6 bg-zinc-950/40 border-t border-zinc-800/50 flex items-center justify-between gap-4 relative z-10 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant={selectedFeedback.status === "REVIEWED" ? "primary" : "outline"}
                  onClick={() => updateStatus(selectedFeedback.id, "REVIEWED")}
                  disabled={selectedFeedback.status === "REVIEWED"}
                >
                  <Eye className="w-4 h-4 mr-2" /> Mark Reviewed
                </Button>
                <Button 
                  size="sm"
                  variant={selectedFeedback.status === "RESOLVED" ? "primary" : "outline"}
                  onClick={() => updateStatus(selectedFeedback.id, "RESOLVED")}
                  disabled={selectedFeedback.status === "RESOLVED"}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Mark Resolved
                </Button>
                <Button
                  size="sm"
                  variant={selectedFeedback.isFeatured ? "primary" : "outline"}
                  onClick={() => toggleFeatured(selectedFeedback.id, !selectedFeedback.isFeatured)}
                  title={selectedFeedback.isFeatured ? "Remove from Testimonials" : "Feature as Testimonial"}
                >
                  <Star className={cn("w-4 h-4", selectedFeedback.isFeatured ? "fill-current" : "")} />
                </Button>
              </div>
              <Button size="sm" variant="outline" className="text-[var(--color-error)] border-transparent hover:bg-[#EF444415]" onClick={() => deleteFeedback(selectedFeedback.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
