import { db } from "@/lib/db"
import { LeadDetail } from "@/components/dashboard/crm/LeadDetail"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"

export const metadata = {
  title: "Lead Details | CRM | E3 Admin",
}

export default async function LeadDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }
  const role = (session.user as any)?.role;
  if (!["SUPER_ADMIN", "ADMIN", "SALES", "SALES_ADMIN", "B2B_ADMIN"].includes(role)) {
    redirect("/dashboard/leads/packages");
  }

  const { id } = await params
  
  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      activities: {
        orderBy: { timestamp: "desc" }
      },
      inquiries: {
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!lead) {
    notFound()
  }

  const formattedLead = {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    activities: lead.activities.map((a: any) => ({
      ...a,
      timestamp: a.timestamp.toISOString()
    })),
    inquiries: lead.inquiries.map((i: any) => ({
      ...i,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString()
    }))
  }

  return <LeadDetail initialLead={formattedLead as any} />
}
