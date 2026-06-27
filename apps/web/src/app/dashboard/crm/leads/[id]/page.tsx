import { Metadata } from "next"
import { notFound } from "next/navigation"
import db from "@/lib/db"
import { LeadDetailView } from "@/components/dashboard/crm/LeadDetailView"

export const metadata: Metadata = {
  title: "Lead Details | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await db.lead.findUnique({
    where: { id: params.id },
    include: {
      activities: { orderBy: { timestamp: "desc" } },
      inquiries: { orderBy: { createdAt: "desc" } }
    }
  })

  if (!lead) {
    notFound()
  }

  // Find users for the assignment dropdown
  const salesTeam = await db.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "SALES_ADMIN"] }, isActive: true },
    select: { id: true, name: true, email: true }
  })

  return <LeadDetailView initialLead={lead} salesTeam={salesTeam} />
}
