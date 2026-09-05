import { db } from "@/lib/db"
import { ClientsList } from "@/components/dashboard/crm/ClientsList"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Clients Database | CRM | E3 Admin",
}

export default async function ClientsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }
  const role = (session.user as any)?.role;
  if (!["SUPER_ADMIN", "ADMIN", "SALES", "SALES_ADMIN", "B2B_ADMIN"].includes(role)) {
    redirect("/dashboard/leads/packages");
  }

  const clients = await db.client.findMany({
    orderBy: { company: "asc" }
  })

  // Format dates for client
  const formattedClients = clients.map((c: any) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }))

  return <ClientsList initialClients={formattedClients as any} />
}
