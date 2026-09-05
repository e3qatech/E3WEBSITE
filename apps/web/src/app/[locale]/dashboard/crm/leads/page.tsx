import { db } from "@/lib/db"
import { LeadsBoard } from "@/components/dashboard/crm/LeadsBoard"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Sales Pipeline | CRM | E3 Admin",
}

export default async function LeadsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }
  const role = (session.user as any)?.role;
  if (!["SUPER_ADMIN", "ADMIN", "SALES", "SALES_ADMIN", "B2B_ADMIN"].includes(role)) {
    redirect("/dashboard/leads/packages");
  }

  const leads = await db.lead.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      activities: {
        orderBy: { timestamp: "desc" },
        take: 1
      }
    }
  })

  // Format dates for client
  const formattedLeads = leads.map((l: any) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
    activities: l.activities.map((a: any) => ({
      ...a,
      timestamp: a.timestamp.toISOString()
    }))
  }))

  return <LeadsBoard initialLeads={formattedLeads as any} />
}
