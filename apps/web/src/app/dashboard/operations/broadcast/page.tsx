import { Metadata } from "next"
import db from "@/lib/db"
import { Radio, Plus, MessageSquare, ToggleRight, ToggleLeft } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/Button"

export const metadata: Metadata = {
  title: "Broadcast | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function BroadcastPage() {
  const broadcasts = await db.systemBroadcast.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">System Broadcasts</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage platform-wide announcements and alerts.</p>
        </div>
        
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> New Broadcast
        </Button>
      </div>

      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-hover)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-4 font-bold">Message</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
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
                    <button className="p-2 rounded-full hover:bg-[var(--surface-active)] transition-colors">
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
                </tr>
              ))}
              {broadcasts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[var(--text-tertiary)]">
                    No active broadcasts.
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
