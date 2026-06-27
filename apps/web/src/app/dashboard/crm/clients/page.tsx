import { Metadata } from "next"
import db from "@/lib/db"
import { Building, Globe, Mail, Briefcase } from "lucide-react"

export const metadata: Metadata = {
  title: "Clients | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const clients = await db.client.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Clients</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage B2B partners, agencies, and government clients.</p>
        </div>
      </div>

      <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-hover)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
              <tr>
                <th className="p-4 font-bold">Company</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Industry</th>
                <th className="p-4 font-bold">Website</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-[var(--surface-hover)] transition-colors cursor-pointer">
                  <td className="p-4 font-bold text-[var(--text-primary)] flex items-center">
                    <Building className="w-4 h-4 mr-2 text-[var(--text-tertiary)]" /> {client.company}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-[var(--surface-active)] text-[var(--text-secondary)]">
                      {client.type}
                    </span>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">{client.industry || "-"}</td>
                  <td className="p-4 text-blue-500 hover:underline">
                    {client.website ? (
                      <a href={client.website} target="_blank" rel="noreferrer" className="flex items-center">
                        <Globe className="w-4 h-4 mr-1" /> Visit
                      </a>
                    ) : "-"}
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[var(--text-tertiary)]">
                    No clients found. When leads are marked as WON, they should appear here.
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
