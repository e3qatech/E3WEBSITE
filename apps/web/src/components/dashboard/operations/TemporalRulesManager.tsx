"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Clock, AlertTriangle, CalendarDays, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { format } from "date-fns"

export function TemporalRulesManager({ 
  initialRules,
  attractions
}: { 
  initialRules: any[]
  attractions: any[]
}) {
  const router = useRouter()
  const [rules, setRules] = useState(initialRules)
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [attractionId, setAttractionId] = useState(attractions[0]?.id || "")
  const [ruleType, setRuleType] = useState("CLOSURE")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [openTime, setOpenTime] = useState("")
  const [closeTime, setCloseTime] = useState("")
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([])

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'RECURRING': return <Clock className="w-5 h-5 text-[var(--color-primary)]" />;
      case 'CLOSURE': return <AlertTriangle className="w-5 h-5 text-[var(--color-error)]" />;
      case 'OVERRIDE': return <CalendarDays className="w-5 h-5 text-yellow-500" />;
      default: return <Clock className="w-5 h-5" />;
    }
  }

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/temporal-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attractionId,
          ruleType,
          startDate: startDate || null,
          endDate: endDate || null,
          openTime: openTime || null,
          closeTime: closeTime || null,
          daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : null
        })
      })

      if (!res.ok) throw new Error("Failed to create rule")
      
      const newRule = await res.json()
      
      // We need to fetch the attraction details so it displays correctly
      const attraction = attractions.find(a => a.id === attractionId)
      newRule.attraction = attraction
      
      setRules(prev => [newRule, ...prev])
      setIsAdding(false)
      
      // Reset form
      setStartDate("")
      setEndDate("")
      setOpenTime("")
      setCloseTime("")
      setDaysOfWeek([])
      
      router.refresh()
    } catch (err) {
      alert("Failed to add temporal rule.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return
    try {
      const res = await fetch(`/api/temporal-rules/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")

      setRules(prev => prev.filter(r => r.id !== id))
      router.refresh()
    } catch {
      alert("Failed to delete temporal rule.")
    }
  }

  const handleDayToggle = (day: number) => {
    setDaysOfWeek(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    )
  }

  const days = [
    { label: "Sun", value: 0 },
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 }
  ]

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Temporal Rules</h1>
          <p className="text-[var(--text-secondary)]">Manage opening hours, seasonal closures, and special events.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4" /> Create Rule</>}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddRule} className="bg-[var(--surface-default)] p-6 rounded-xl border border-[var(--border-default)] shadow-sm space-y-6 animate-in fade-in zoom-in duration-200">
          <h2 className="font-bold text-[var(--text-primary)]">New Temporal Rule</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="text-xs font-bold text-[var(--text-secondary)]">Rule Type</label>
              <select 
                value={ruleType} onChange={e => setRuleType(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
                required
              >
                <option value="CLOSURE">Closure</option>
                <option value="RECURRING">Recurring Hours</option>
                <option value="OVERRIDE">Special Override</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Start Date (Optional)</label>
              <input 
                type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">End Date (Optional)</label>
              <input 
                type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Open Time (Optional)</label>
              <input 
                type="time" value={openTime} onChange={e => setOpenTime(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Close Time (Optional)</label>
              <input 
                type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-secondary)]">Days of Week (Optional)</label>
            <div className="flex flex-wrap gap-2">
              {days.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => handleDayToggle(d.value)}
                  className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                    daysOfWeek.includes(d.value) 
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' 
                      : 'bg-[var(--surface-subtle)] border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Rule"}
            </Button>
          </div>
        </form>
      )}

      {/* Rules List */}
      <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--surface-hover)] border-b border-[var(--border-default)]">
                <th className="p-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Attraction</th>
                <th className="p-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Schedule</th>
                <th className="p-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Dates</th>
                <th className="p-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {rules.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">
                    No temporal rules configured yet.
                  </td>
                </tr>
              )}
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-[var(--surface-hover)]/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getRuleIcon(rule.ruleType)}
                      <span className="font-bold text-sm text-[var(--text-primary)]">{rule.ruleType}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-[var(--text-primary)]">
                    {rule.attraction?.nameEn || "Global"}
                  </td>
                  <td className="p-4 text-sm text-[var(--text-secondary)]">
                    {rule.openTime && rule.closeTime ? `${rule.openTime} - ${rule.closeTime}` : "All Day"}
                    {rule.daysOfWeek && rule.daysOfWeek.length > 0 && (
                      <div className="mt-1 text-xs text-[var(--text-tertiary)]">
                        Days: {(rule.daysOfWeek as number[]).join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-[var(--text-secondary)]">
                    {rule.startDate ? format(new Date(rule.startDate), "MMM dd, yyyy") : "Always"} 
                    {rule.endDate ? ` to ${format(new Date(rule.endDate), "MMM dd, yyyy")}` : ""}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
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
