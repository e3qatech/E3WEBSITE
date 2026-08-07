import { db } from "@/lib/db"
import { ClientsList } from "@/components/dashboard/crm/ClientsList"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Clients Database | CRM | E3 Admin",
}

export default async function ClientsPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SALES", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const clients = await db.client.findMany({
    orderBy: { company: "asc" }
  })

  // Format dates for client
  const formattedClients = clients.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }))

  return <ClientsList initialClients={formattedClients as any} />
}
