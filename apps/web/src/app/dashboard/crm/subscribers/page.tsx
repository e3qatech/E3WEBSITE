import { Metadata } from "next"
import db from "@/lib/db"
import { Users, Mail, Bell, CheckCircle, XCircle, Send, Phone } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/Button"

export const metadata: Metadata = {
  title: "Subscribers | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function SubscribersPage() {
  const subscribers = await db.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Subscribers</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage B2C newsletter subscribers and notification preferences.</p>
        </div>
        
        <Button>
          <Send className="w-4 h-4 mr-2" /> Send Broadcast
        </Button>
      </div>

      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-hover)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-4 font-bold">Contact</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Preferences</th>
                <th className="p-4 font-bold">Subscribed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {subscribers.map(sub => (
                <tr key={sub.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="p-4">
                    {sub.email && (
                      <div className="font-bold text-[var(--text-primary)] flex items-center">
                        <Mail className="w-3 h-3 mr-2 text-[var(--text-secondary)]" /> {sub.email}
                      </div>
                    )}
                    {sub.phone && (
                      <div className="text-xs text-[var(--text-secondary)] flex items-center mt-1">
                        <Phone className="w-3 h-3 mr-2 text-[var(--text-tertiary)]" /> {sub.phone}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {sub.isVerified ? (
                      <span className="inline-flex items-center text-green-500 font-bold text-xs bg-green-500/10 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3 mr-1" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-amber-500 font-bold text-xs bg-amber-500/10 px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3 mr-1" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {sub.preferences ? Object.keys(sub.preferences as Record<string,any>).map(pref => (
                        <span key={pref} className="px-2 py-0.5 bg-[var(--surface-active)] text-[var(--text-secondary)] text-[10px] font-bold rounded-md uppercase">
                          {pref}
                        </span>
                      )) : <span className="text-[var(--text-tertiary)] text-xs italic">All Updates</span>}
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-tertiary)] text-xs">
                    {format(new Date(sub.createdAt), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[var(--text-tertiary)]">
                    No subscribers found.
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
