import { Metadata } from "next"
import db from "@/lib/db"
import { Mail, Phone, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"

export const metadata: Metadata = {
  title: "Inquiries | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function InquiriesPage() {
  const inquiries = await db.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "NEW": return <AlertCircle className="w-4 h-4 text-blue-500" />
      case "IN_PROGRESS": return <Clock className="w-4 h-4 text-amber-500" />
      case "RESOLVED": return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Inquiries</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage general contact submissions and support tickets.</p>
        </div>
      </div>

      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-hover)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-4 font-bold">Sender</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Message Preview</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {inquiries.map(inq => (
                <tr key={inq.id} className="hover:bg-[var(--surface-hover)] transition-colors cursor-pointer">
                  <td className="p-4">
                    <div className="font-bold text-[var(--text-primary)]">{inq.name}</div>
                    <div className="text-xs text-[var(--text-secondary)] flex items-center mt-1">
                      <Mail className="w-3 h-3 mr-1" /> {inq.email}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-[var(--surface-active)] text-[var(--text-secondary)]">
                      {inq.type}
                    </span>
                  </td>
                  <td className="p-4 max-w-xs truncate text-[var(--text-secondary)]">
                    {inq.subject ? <div className="font-bold text-[var(--text-primary)] mb-1">{inq.subject}</div> : null}
                    {inq.message}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(inq.status)}
                      <span className="font-bold text-[var(--text-secondary)] text-xs">{inq.status}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-tertiary)] text-xs">
                    {format(new Date(inq.createdAt), 'MMM d, yyyy h:mm a')}
                  </td>
                </tr>
              ))}
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-tertiary)]">
                    No inquiries found.
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
