import { Metadata } from "next"
import db from "@/lib/db"
import { LeadsPipeline } from "@/components/dashboard/crm/LeadsPipeline"

export const metadata: Metadata = {
  title: "Leads | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
  })

  return <LeadsPipeline initialLeads={leads} />
}
