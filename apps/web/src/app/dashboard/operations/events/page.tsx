import { Metadata } from "next"
import db from "@/lib/db"
import { Calendar, Plus, MapPin, Clock, Edit } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/Button"

export const metadata: Metadata = {
  title: "Events Manager | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function EventsManagerPage() {
  const events = await db.calendarEvent.findMany({
    orderBy: { startDate: "desc" },
    include: {
      attraction: { select: { nameEn: true } },
      timeSlots: true
    }
  })

  return (
    <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Events Manager</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage B2C events and specialized time slots.</p>
        </div>
        
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> New Event
        </Button>
      </div>

      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-hover)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-4 font-bold">Event Details</th>
                <th className="p-4 font-bold">Location</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Time Slots</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {events.map(ev => (
                <tr key={ev.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[var(--text-primary)] mb-1">{ev.title}</div>
                    <div className="text-xs text-[var(--text-secondary)] flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(ev.startDate), 'MMM d')} - {format(new Date(ev.endDate), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)] flex items-center mt-2">
                    {ev.attraction ? (
                      <><MapPin className="w-4 h-4 mr-1 text-[var(--color-primary)]" /> {ev.attraction.nameEn}</>
                    ) : (
                      "No specific location"
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold ${ev.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500' : 'bg-[var(--surface-active)] text-[var(--text-secondary)]'}`}>
                      {ev.status}
                    </span>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)] flex items-center mt-2">
                    <Clock className="w-4 h-4 mr-1" /> {ev.timeSlots.length} slots configured
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="outline" size="sm" className="gap-2"><Edit className="w-3 h-3" /> Edit</Button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-tertiary)]">
                    No events found. Create a new event to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
