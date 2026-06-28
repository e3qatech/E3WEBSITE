"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Users, Plus, Trash2, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"

type Attraction = {
  id: string
  nameEn: string
}

type EventSchedule = {
  id: string
  attractionId: string
  startTime: string
  endTime: string
  eventType: string
  capacityGate: number
  currentCount: number
  attraction: { nameEn: string }
}

export function EventScheduleManager({ 
  initialSchedules,
  attractions
}: { 
  initialSchedules: EventSchedule[]
  attractions: Attraction[]
}) {
  const router = useRouter()
  const [schedules, setSchedules] = useState(initialSchedules)
  const [isAdding, setIsAdding] = useState(false)

  // Form state
  const [attractionId, setAttractionId] = useState(attractions[0]?.id || "")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [eventType, setEventType] = useState("REGULAR")
  const [capacity, setCapacity] = useState(100)

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !startTime || !endTime) return

    const startDateTime = new Date(`${date}T${startTime}:00`)
    const endDateTime = new Date(`${date}T${endTime}:00`)

    try {
      const res = await fetch("/api/operations/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attractionId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          eventType,
          capacityGate: capacity
        })
      })

      if (!res.ok) throw new Error()
      
      const newSchedule = await res.json()
      setSchedules(prev => [...prev, newSchedule].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()))
      setIsAdding(false)
      router.refresh()
    } catch {
      alert("Failed to add schedule")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this schedule?")) return
    try {
      // In a real app we'd have a DELETE endpoint. Since we didn't write it, 
      // let's assume we can hide it or we should add the DELETE endpoint.
      // For now we'll do an optimistic delete. 
      // Wait, let's create the DELETE endpoint next!
      const res = await fetch(`/api/operations/schedules/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()

      setSchedules(prev => prev.filter(s => s.id !== id))
      router.refresh()
    } catch {
      alert("Failed to delete schedule. Please make sure the API route is implemented.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Event Schedules & Capacity</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage attraction opening hours, special events, and capacity gates.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4" /> Add Schedule</>}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSchedule} className="glass rounded-3xl p-6 border-gradient relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
          <div className="relative z-10 space-y-4">
          <h2 className="font-bold text-[var(--text-primary)]">New Schedule Block</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Attraction</label>
              <select 
                value={attractionId} onChange={e => setAttractionId(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
                required
              >
                {attractions.map(a => <option key={a.id} value={a.id}>{a.nameEn}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Date</label>
              <input 
                type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Type</label>
              <select 
                value={eventType} onChange={e => setEventType(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
              >
                <option value="REGULAR">Regular Opening</option>
                <option value="SPECIAL">Special Event</option>
                <option value="FESTIVAL">Festival</option>
                <option value="PRIVATE">Private Booking</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Start Time</label>
              <input 
                type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">End Time</label>
              <input 
                type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Capacity Gate (Max Tickets)</label>
              <input 
                type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
                min="1" required
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit">Create Schedule</Button>
          </div>
          </div>
        </form>
      )}

      <div className="glass rounded-3xl border-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
        <div className="relative z-10 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
            <thead className="bg-zinc-950/50 border-b border-zinc-800/50 text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <tr>
              <th className="px-6 py-4 font-medium">Attraction</th>
              <th className="px-6 py-4 font-medium">Date & Time</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Capacity</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-tertiary)]">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  No schedules created yet.
                </td>
              </tr>
            ) : (
              schedules.map(s => {
                const start = new Date(s.startTime)
                const end = new Date(s.endTime)
                const fillPercentage = (s.currentCount / s.capacityGate) * 100

                return (
                  <tr key={s.id} className="hover:bg-zinc-900/50 transition-colors group cursor-pointer border-b border-zinc-800/30">
                    <td className="px-6 py-4 font-bold text-[var(--text-primary)]">
                      {s.attraction.nameEn}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[var(--text-primary)] mb-1">
                        <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
                        {start.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                        <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default" className="bg-transparent border border-[var(--border-default)]">{s.eventType}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 w-32">
                        <div className="flex justify-between text-xs">
                          <span className="text-[var(--text-secondary)] flex items-center gap-1"><Users className="w-3 h-3"/> {s.currentCount}</span>
                          <span className="text-[var(--text-tertiary)]">/ {s.capacityGate}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--surface-subtle)] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${fillPercentage >= 100 ? 'bg-[var(--color-error)]' : fillPercentage > 80 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-success)]'}`}
                            style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(s.id)} className="p-2 text-[var(--color-error)] hover:bg-[#EF444415] rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
