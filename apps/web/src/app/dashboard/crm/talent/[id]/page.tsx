import { Metadata } from "next"
import { notFound } from "next/navigation"
import db from "@/lib/db"
import { TalentDetailView } from "@/components/dashboard/crm/TalentDetailView"

export const metadata: Metadata = {
  title: "Talent Details | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function TalentDetailPage({ params }: { params: { id: string } }) {
  const talent = await db.talent.findUnique({
    where: { id: params.id },
  })

  if (!talent) {
    notFound()
  }

  const team = await db.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "SALES_ADMIN", "STAFF"] }, isActive: true },
    select: { id: true, name: true, email: true }
  })

  return <TalentDetailView initialData={talent} team={team} />
}
