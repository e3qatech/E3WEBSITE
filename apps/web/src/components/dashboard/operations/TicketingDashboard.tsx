"use client"

import { useState } from "react"
import { Users, Ticket, TrendingUp, Calendar as CalendarIcon, Activity, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/Badge"

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

export function TicketingDashboard({ schedules }: { schedules: EventSchedule[] }) {
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0])

  const filteredSchedules = schedules.filter(s => s.startTime.startsWith(filterDate))
  
  const totalCapacity = filteredSchedules.reduce((acc, s) => acc + s.capacityGate, 0)
  const totalBooked = filteredSchedules.reduce((acc, s) => acc + s.currentCount, 0)
  const utilization = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Ticketing Overview</h1>
          <p className="text-sm text-[var(--text-secondary)]">Monitor capacity and booking velocity across attractions.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface-default)] p-5 rounded-xl border border-[var(--border-default)] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg">
              <Ticket className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[var(--text-secondary)] text-sm">Tickets Booked</h3>
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)]">{totalBooked.toLocaleString()}</div>
        </div>

        <div className="bg-[var(--surface-default)] p-5 rounded-xl border border-[var(--border-default)] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[var(--text-secondary)] text-sm">Total Capacity</h3>
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)]">{totalCapacity.toLocaleString()}</div>
        </div>

        <div className="bg-[var(--surface-default)] p-5 rounded-xl border border-[var(--border-default)] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[var(--text-secondary)] text-sm">Utilization</h3>
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)]">{utilization.toFixed(1)}%</div>
        </div>

        <div className="bg-[var(--surface-default)] p-5 rounded-xl border border-[var(--border-default)] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--color-warning)]/10 text-[var(--color-warning)] rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[var(--text-secondary)] text-sm">Active Events</h3>
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)]">{filteredSchedules.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attraction Capacity Breakdown */}
        <div className="lg:col-span-2 bg-[var(--surface-default)] rounded-xl border border-[var(--border-default)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border-default)]">
            <h2 className="font-bold text-[var(--text-primary)]">Capacity by Attraction</h2>
          </div>
          <div className="p-5 space-y-6">
            {filteredSchedules.length === 0 ? (
              <div className="text-center text-[var(--text-tertiary)] py-8">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                No operational schedules found for this date.
              </div>
            ) : (
              filteredSchedules.map(s => {
                const fillPercentage = (s.currentCount / s.capacityGate) * 100
                const isOverbookWarning = fillPercentage >= 95
                return (
                  <div key={s.id} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="font-bold text-[var(--text-primary)] text-sm">{s.attraction.nameEn}</div>
                        <div className="text-xs text-[var(--text-tertiary)]">
                          {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="mx-2">•</span>
                          {s.eventType}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-sm ${isOverbookWarning ? 'text-[var(--color-error)]' : 'text-[var(--text-primary)]'}`}>
                          {s.currentCount} / {s.capacityGate}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)]">{fillPercentage.toFixed(1)}% full</div>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-[var(--surface-subtle)] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isOverbookWarning ? 'bg-[var(--color-error)]' : fillPercentage > 75 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-success)]'}`}
                        style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Real-time Webhook Activity Mock Log */}
        <div className="bg-[var(--surface-default)] rounded-xl border border-[var(--border-default)] shadow-sm flex flex-col h-[500px]">
          <div className="p-5 border-b border-[var(--border-default)] flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-primary)]">BookingQube Feed</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-success)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]"></span>
              </span>
              Live Sync
            </div>
          </div>
          <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
            {/* We will mock some recent events just for display purposes */}
            <div className="text-xs text-[var(--text-tertiary)] text-center pb-2 border-b border-[var(--border-default)] mb-4">
              Awaiting new webhook events...
            </div>
            
            {/* Static mock data to show how it looks */}
            <div className="border-l-2 border-[var(--color-success)] pl-3">
              <div className="text-xs font-bold text-[var(--color-success)] mb-0.5">Ticket Purchased</div>
              <div className="text-xs text-[var(--text-primary)]">InflataPark FEC (General Admission)</div>
              <div className="text-[10px] text-[var(--text-tertiary)] mt-1">2 mins ago • ID: BQ-928471</div>
            </div>
            
            <div className="border-l-2 border-[var(--color-success)] pl-3">
              <div className="text-xs font-bold text-[var(--color-success)] mb-0.5">Ticket Purchased</div>
              <div className="text-xs text-[var(--text-primary)]">InflataPark FEC (General Admission)</div>
              <div className="text-[10px] text-[var(--text-tertiary)] mt-1">5 mins ago • ID: BQ-928470</div>
            </div>

            <div className="border-l-2 border-[var(--color-error)] pl-3">
              <div className="text-xs font-bold text-[var(--color-error)] mb-0.5">Ticket Cancelled</div>
              <div className="text-xs text-[var(--text-primary)]">Doha Balloon Parade</div>
              <div className="text-[10px] text-[var(--text-tertiary)] mt-1">12 mins ago • ID: BQ-928412</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
