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
  if (!session || !["SUPER_ADMIN", "SALES", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
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
    activities: lead.activities.map(a => ({
      ...a,
      timestamp: a.timestamp.toISOString()
    })),
    inquiries: lead.inquiries.map(i => ({
      ...i,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString()
    }))
  }

  return <LeadDetail initialLead={formattedLead as any} />
}
