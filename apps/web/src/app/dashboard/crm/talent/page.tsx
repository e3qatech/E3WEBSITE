import { Metadata } from "next"
import db from "@/lib/db"
import { TalentTable } from "@/components/dashboard/crm/TalentTable"

export const metadata: Metadata = {
  title: "Talent Pool | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function TalentPage() {
  const talents = await db.talent.findMany({
    orderBy: { createdAt: "desc" },
  })

  return <TalentTable initialData={talents} />
}
