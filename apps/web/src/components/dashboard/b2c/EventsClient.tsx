"use client"

import { useState } from "react"
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, Clock, Users, X } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/Button"

export function EventsClient({ initialEvents, attractions }: { initialEvents: any[], attractions: any[] }) {
  const [events, setEvents] = useState(initialEvents)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    attractionId: "",
    title: "",
    description: "",
    heroMediaType: "IMAGE",
    heroMediaUrl: "",
    startTime: "",
    endTime: "",
    eventType: "REGULAR",
    capacityGate: 100,
    currentCount: 0
  })

  const openModal = (evt: any = null) => {
    if (evt) {
      setEditingEvent(evt)
      setFormData({
        attractionId: evt.attractionId || "",
        title: evt.title || "",
        description: evt.description || "",
        heroMediaType: evt.heroMediaType || "IMAGE",
        heroMediaUrl: evt.heroMediaUrl || "",
        startTime: format(new Date(evt.startTime), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date(evt.endTime), "yyyy-MM-dd'T'HH:mm"),
        eventType: evt.eventType || "REGULAR",
        capacityGate: evt.capacityGate || 100,
        currentCount: evt.currentCount || 0
      })
    } else {
      setEditingEvent(null)
      setFormData({
        attractionId: attractions[0]?.id || "",
        title: "",
        description: "",
        heroMediaType: "IMAGE",
        heroMediaUrl: "",
        startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date(Date.now() + 2 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
        eventType: "REGULAR",
        capacityGate: 100,
        currentCount: 0
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingEvent(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isEditing = !!editingEvent
    const url = isEditing ? `/api/b2c/events/${editingEvent.id}` : `/api/b2c/events`
    const method = isEditing ? "PATCH" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error("Failed to save event")
      
      const saved = await res.json()
      
      if (isEditing) {
        setEvents(events.map(ev => ev.id === saved.id ? { ...saved, attraction: attractions.find(a => a.id === saved.attractionId) } : ev))
      } else {
        setEvents([{ ...saved, attraction: attractions.find(a => a.id === saved.attractionId) }, ...events])
      }
      closeModal()
    } catch (err) {
      console.error(err)
      alert("Error saving event")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return
    try {
      const res = await fetch(`/api/b2c/events/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete event")
      setEvents(events.filter(ev => ev.id !== id))
    } catch (err) {
      console.error(err)
      alert("Error deleting event")
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Events Management</h1>
          <p className="text-[var(--text-secondary)]">Manage schedules and special events for B2C attractions.</p>
        </div>
        <Button onClick={() => openModal()} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Add Event
        </Button>
      </div>

      <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-hover)] border-b border-[var(--border-default)]">
              <tr>
                <th className="px-4 py-3 font-bold text-[var(--text-secondary)]">Attraction</th>
                <th className="px-4 py-3 font-bold text-[var(--text-secondary)]">Type</th>
                <th className="px-4 py-3 font-bold text-[var(--text-secondary)]">Start Time</th>
                <th className="px-4 py-3 font-bold text-[var(--text-secondary)]">End Time</th>
                <th className="px-4 py-3 font-bold text-[var(--text-secondary)]">Capacity</th>
                <th className="px-4 py-3 font-bold text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                    No events scheduled.
                  </td>
                </tr>
              ) : events.map(ev => (
                <tr key={ev.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                    {ev.attraction?.nameEn || "Unknown"}
                    {ev.title && <div className="text-xs text-amber-500 font-bold">{ev.title}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-white/10 text-xs font-bold rounded">
                      {ev.eventType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                    {format(new Date(ev.startTime), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                    {format(new Date(ev.endTime), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {ev.currentCount} / {ev.capacityGate}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(ev)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(ev.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {editingEvent ? "Edit Event" : "Create Event"}
              </h2>
              <button onClick={closeModal} className="p-2 text-[var(--text-secondary)] hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Attraction</label>
                  <select 
                    required
                    value={formData.attractionId}
                    onChange={e => setFormData({ ...formData, attractionId: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]"
                  >
                    <option value="" disabled>Select an attraction</option>
                    {attractions.map(a => (
                      <option key={a.id} value={a.id}>{a.nameEn}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Event Type</label>
                  <select 
                    required
                    value={formData.eventType}
                    onChange={e => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]"
                  >
                    <option value="REGULAR">REGULAR</option>
                    <option value="SPECIAL">SPECIAL</option>
                    <option value="FESTIVAL">FESTIVAL</option>
                    <option value="PRIVATE">PRIVATE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Custom Title (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. DJ Night Special"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Description (Optional)</label>
                <textarea 
                  placeholder="Describe the event details..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Hero Media Type</label>
                  <select 
                    value={formData.heroMediaType}
                    onChange={e => setFormData({ ...formData, heroMediaType: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="MODEL_3D">3D Model</option>
                    <option value="IFRAME">Iframe (YouTube, etc.)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Hero Media URL</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    value={formData.heroMediaUrl}
                    onChange={e => setFormData({ ...formData, heroMediaUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Start Time</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">End Time</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Capacity</label>
                  <input 
                    type="number" 
                    required min={1}
                    value={formData.capacityGate}
                    onChange={e => setFormData({ ...formData, capacityGate: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Current Booked</label>
                  <input 
                    type="number" 
                    required min={0}
                    value={formData.currentCount}
                    onChange={e => setFormData({ ...formData, currentCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border-default)]">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit">{editingEvent ? "Save Changes" : "Create Event"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
