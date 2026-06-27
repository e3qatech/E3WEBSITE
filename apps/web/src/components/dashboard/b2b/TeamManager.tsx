"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, Calendar, Clock, Plus, Trash2, Edit2, Check, 
  ChevronRight, CalendarDays, ShieldAlert, Sparkles, CheckCircle2 
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { useRouter } from "next/navigation"

interface TeamMember {
  id: string
  nameEn: string
  nameAr: string
  roleTitleEn: string
  roleTitleAr: string
  bioEn?: string | null
  bioAr?: string | null
  imageUrl?: string | null
  availability: {
    id: string
    startTime: string
    endTime: string
    isBooked: boolean
  }[]
}

interface TeamManagerProps {
  initialMembers: TeamMember[]
}

export function TeamManager({ initialMembers }: TeamManagerProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [selectedMemberId, setSelectedMemberId] = useState<string>(initialMembers[0]?.id || "")
  const [activeTab, setActiveTab] = useState<"roster" | "availability" | "meetings">("roster")
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // New Member State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMember, setNewMember] = useState({
    nameEn: "",
    nameAr: "",
    roleTitleEn: "",
    roleTitleAr: "",
    bioEn: "",
    bioAr: "",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120"
  })

  // Slot Config State
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]) // Mon-Fri
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [duration, setDuration] = useState(30)
  const [buffer, setBuffer] = useState(15)

  const handleAddMember = async () => {
    if (!newMember.nameEn || !newMember.roleTitleEn) return
    setIsSaving(true)

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember)
      })

      if (!res.ok) throw new Error()
      const data = await res.json()
      setMembers(prev => [...prev, { ...data, availability: [] }])
      setSelectedMemberId(data.id)
      setShowAddModal(false)
      setNewMember({
        nameEn: "",
        nameAr: "",
        roleTitleEn: "",
        roleTitleAr: "",
        bioEn: "",
        bioAr: "",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120"
      })
      router.refresh()
    } catch {
      alert("Failed to add team member")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return
    
    try {
      const res = await fetch(`/api/team?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setMembers(prev => prev.filter(m => m.id !== id))
      if (selectedMemberId === id) {
        setSelectedMemberId(members.find(m => m.id !== id)?.id || "")
      }
      router.refresh()
    } catch {
      alert("Failed to delete team member")
    }
  }

  const handleGenerateSlots = async () => {
    if (!selectedMemberId) return
    setIsSaving(true)

    try {
      const res = await fetch(`/api/team/${selectedMemberId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daysOfWeek,
          startTime,
          endTime,
          duration,
          buffer
        })
      })

      if (!res.ok) throw new Error()
      alert("Slots generated successfully for the upcoming 7 days!")
      router.refresh()
    } catch {
      alert("Failed to generate availability slots")
    } finally {
      setIsSaving(false)
    }
  }

  const selectedMember = members.find(m => m.id === selectedMemberId)

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-6 bg-[var(--background)]">
      
      {/* Sidebar - Roster Registry */}
      <div className="w-80 border-r border-[var(--border-default)] bg-[var(--surface-default)] p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)]">Roster Directory</h2>
            <p className="text-xs text-[var(--text-secondary)]">Event Engineering Roster</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {members.map(member => {
            const isSelected = selectedMemberId === member.id
            return (
              <div
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3
                  ${isSelected 
                    ? 'bg-[var(--surface-hover)] border-[var(--color-primary)] shadow-sm' 
                    : 'border-[var(--border-default)] hover:bg-[var(--surface-hover)]'
                  }
                `}
              >
                <img 
                  src={member.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120"} 
                  alt={member.nameEn} 
                  className="w-10 h-10 rounded-full object-cover border border-[var(--border-default)]"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[var(--text-primary)] truncate">{member.nameEn}</div>
                  <div className="text-xs text-[var(--text-secondary)] truncate">{member.roleTitleEn}</div>
                </div>
                <ChevronRight className={`w-4 h-4 text-[var(--text-tertiary)] ${isSelected ? 'translate-x-1' : ''} transition-transform`} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Console */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedMember ? (
          <>
            {/* Header / Sub-Nav */}
            <div className="border-b border-[var(--border-default)] bg-[var(--surface-default)] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedMember.imageUrl || ""} 
                  alt={selectedMember.nameEn} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-[var(--color-primary)]"
                />
                <div>
                  <h1 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-2">
                    {selectedMember.nameEn}
                    <span className="text-sm font-medium text-[var(--text-tertiary)]" dir="rtl">{selectedMember.nameAr}</span>
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)]">{selectedMember.roleTitleEn} • <span dir="rtl">{selectedMember.roleTitleAr}</span></p>
                </div>
              </div>

              <div className="flex gap-1.5 p-1 bg-[var(--surface-subtle)] rounded-lg border border-[var(--border-default)]">
                {(["roster", "availability", "meetings"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-wider
                      ${activeTab === tab 
                        ? 'bg-[var(--surface-default)] text-[var(--text-primary)] shadow-sm' 
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }
                    `}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Tabs */}
            <div className="flex-1 overflow-y-auto p-8 bg-[var(--background)]">
              {activeTab === "roster" && (
                <div className="max-w-2xl space-y-6">
                  <div className="bg-[var(--surface-default)] p-6 rounded-xl border border-[var(--border-default)] space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
                      <h3 className="font-black text-xs text-[var(--text-secondary)] uppercase tracking-wider">Biography & Experience</h3>
                      <button 
                        onClick={() => handleDeleteMember(selectedMember.id)}
                        className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Staff
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">Bio (English)</div>
                        <p className="text-sm text-[var(--text-primary)] bg-[var(--surface-subtle)] p-3 rounded-lg border border-[var(--border-default)]">
                          {selectedMember.bioEn || "No English biography set."}
                        </p>
                      </div>
                      <div dir="rtl">
                        <div className="text-xs font-bold text-[var(--text-secondary)] text-right mb-1">السيرة الذاتية (عربي)</div>
                        <p className="text-sm text-[var(--text-primary)] bg-[var(--surface-subtle)] p-3 rounded-lg border border-[var(--border-default)] text-right">
                          {selectedMember.bioAr || "لا توجد سيرة ذاتية بالعربية."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "availability" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Configuration */}
                  <div className="bg-[var(--surface-default)] p-6 rounded-xl border border-[var(--border-default)] space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-[var(--text-primary)] mb-1">Configure Slot Matrix</h3>
                      <p className="text-xs text-[var(--text-secondary)]">Define standard working parameters to generate upcoming slots.</p>
                    </div>

                    {/* Weekday Selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-secondary)]">Working Days</label>
                      <div className="flex justify-between gap-1 bg-[var(--surface-subtle)] p-2 rounded-lg border border-[var(--border-default)]">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => {
                          const isSelected = daysOfWeek.includes(idx)
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setDaysOfWeek(prev => 
                                  prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]
                                )
                              }}
                              className={`w-8 h-8 rounded-full text-xs font-bold transition-all
                                ${isSelected 
                                  ? 'bg-[var(--color-primary)] text-white' 
                                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                                }
                              `}
                            >
                              {day}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Hours Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--text-secondary)]">Start Time</label>
                        <input 
                          type="time" 
                          value={startTime}
                          onChange={e => setStartTime(e.target.value)}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-2.5 text-sm outline-none text-[var(--text-primary)]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--text-secondary)]">End Time</label>
                        <input 
                          type="time" 
                          value={endTime}
                          onChange={e => setEndTime(e.target.value)}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-2.5 text-sm outline-none text-[var(--text-primary)]"
                        />
                      </div>
                    </div>

                    {/* Duration / Buffer */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--text-secondary)]">Slot Duration (Mins)</label>
                        <select 
                          value={duration}
                          onChange={e => setDuration(parseInt(e.target.value))}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-2.5 text-sm outline-none text-[var(--text-primary)]"
                        >
                          <option value={15}>15 mins</option>
                          <option value={30}>30 mins</option>
                          <option value={45}>45 mins</option>
                          <option value={60}>60 mins</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--text-secondary)]">Post-Meeting Buffer (Mins)</label>
                        <select 
                          value={buffer}
                          onChange={e => setBuffer(parseInt(e.target.value))}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-2.5 text-sm outline-none text-[var(--text-primary)]"
                        >
                          <option value={0}>No buffer</option>
                          <option value={10}>10 mins</option>
                          <option value={15}>15 mins</option>
                          <option value={30}>30 mins</option>
                        </select>
                      </div>
                    </div>

                    <Button 
                      className="w-full gap-2" 
                      onClick={handleGenerateSlots}
                      disabled={isSaving}
                    >
                      <Clock className="w-4 h-4" /> 
                      {isSaving ? "Generating..." : "Generate 7-Day Slot Matrix"}
                    </Button>
                  </div>

                  {/* Active Slots Preview */}
                  <div className="bg-[var(--surface-default)] p-6 rounded-xl border border-[var(--border-default)] space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-[var(--text-primary)] mb-1">Active Slots Preview</h3>
                      <p className="text-xs text-[var(--text-secondary)]">Currently generated slots for the upcoming week.</p>
                    </div>

                    {selectedMember.availability.length === 0 ? (
                      <div className="border border-dashed border-[var(--border-default)] rounded-lg p-8 text-center bg-[var(--surface-subtle)]">
                        <CalendarDays className="w-8 h-8 mx-auto text-[var(--text-tertiary)] mb-2" />
                        <p className="text-xs font-bold text-[var(--text-secondary)]">No active availability slots found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                        {selectedMember.availability.map(slot => (
                          <div 
                            key={slot.id} 
                            className={`p-2.5 rounded-lg border text-xs flex justify-between items-center font-mono
                              ${slot.isBooked 
                                ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                                : 'bg-green-500/10 border-green-500/20 text-green-600'
                              }
                            `}
                          >
                            <div>
                              <div className="font-bold">
                                {new Date(slot.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                              </div>
                              <div>
                                {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            <Badge variant={slot.isBooked ? 'error' : 'success'} className="text-[10px] uppercase font-bold tracking-wider">
                              {slot.isBooked ? 'Booked' : 'Free'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "meetings" && (
                <div className="bg-[var(--surface-default)] p-6 rounded-xl border border-[var(--border-default)] space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-[var(--text-primary)] mb-1">Conflict-Prevention Grid</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Visual validation of consultations against staff vectors.</p>
                  </div>

                  <div className="border border-dashed border-[var(--border-default)] rounded-xl p-12 text-center bg-[var(--surface-subtle)]">
                    <Calendar className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-4" />
                    <p className="text-sm font-bold text-[var(--text-primary)] mb-1">Double-Booking Engine Active</p>
                    <p className="text-xs text-[var(--text-secondary)] mb-4">All meetings are automatically locked on staff availability matrices.</p>
                    <div className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1.5 rounded-full text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Real-time Prevention Guard Online
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Users className="w-12 h-12 text-[var(--text-tertiary)] mb-4" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Roster Empty</h2>
            <p className="text-sm text-[var(--text-secondary)]">Add a staff member to begin scheduling.</p>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-[var(--border-default)]">
                <h3 className="text-lg font-black text-[var(--text-primary)]">Add Team Member</h3>
                <p className="text-xs text-[var(--text-secondary)]">Incorporate event engineers & consultants into roster</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Name (English)</label>
                    <input 
                      type="text" 
                      value={newMember.nameEn}
                      onChange={e => setNewMember(prev => ({ ...prev, nameEn: e.target.value }))}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-2.5 text-sm outline-none text-[var(--text-primary)]"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-1" dir="rtl">
                    <label className="text-xs font-bold text-[var(--text-secondary)] text-right block">الاسم (عربي)</label>
                    <input 
                      type="text" 
                      value={newMember.nameAr}
                      onChange={e => setNewMember(prev => ({ ...prev, nameAr: e.target.value }))}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-2.5 text-sm outline-none text-[var(--text-primary)] text-right"
                      placeholder="الاسم بالعربية"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Designation (English)</label>
                    <input 
                      type="text" 
                      value={newMember.roleTitleEn}
                      onChange={e => setNewMember(prev => ({ ...prev, roleTitleEn: e.target.value }))}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-2.5 text-sm outline-none text-[var(--text-primary)]"
                      placeholder="e.g. Technical Director"
                    />
                  </div>
                  <div className="space-y-1" dir="rtl">
                    <label className="text-xs font-bold text-[var(--text-secondary)] text-right block">المنصب (عربي)</label>
                    <input 
                      type="text" 
                      value={newMember.roleTitleAr}
                      onChange={e => setNewMember(prev => ({ ...prev, roleTitleAr: e.target.value }))}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-2.5 text-sm outline-none text-[var(--text-primary)] text-right"
                      placeholder="المنصب بالعربية"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)]">Biography (English)</label>
                    <textarea 
                      rows={3}
                      value={newMember.bioEn}
                      onChange={e => setNewMember(prev => ({ ...prev, bioEn: e.target.value }))}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-2.5 text-sm outline-none text-[var(--text-primary)] resize-none"
                    />
                  </div>
                  <div className="space-y-1" dir="rtl">
                    <label className="text-xs font-bold text-[var(--text-secondary)] text-right block">السيرة (عربي)</label>
                    <textarea 
                      rows={3}
                      value={newMember.bioAr}
                      onChange={e => setNewMember(prev => ({ ...prev, bioAr: e.target.value }))}
                      className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg p-2.5 text-sm outline-none text-[var(--text-primary)] text-right resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[var(--surface-subtle)] border-t border-[var(--border-default)] flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleAddMember} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Add Member"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
