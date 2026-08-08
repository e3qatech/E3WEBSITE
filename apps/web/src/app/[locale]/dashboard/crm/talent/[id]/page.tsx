import { db } from "@/lib/db"
import { TalentDetail } from "@/components/dashboard/crm/TalentDetail"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"

export const metadata = {
  title: "Candidate Details | CRM | E3 Admin",
}

export default async function TalentDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "HR", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const { id } = await params
  
  const talent = await db.talent.findUnique({
    where: { id },
    include: {
      job: { select: { title: true } }
    }
  })

  if (!talent) {
    notFound()
  }

  const formattedTalent = {
    ...talent,
    appliedDate: talent.appliedDate.toISOString(),
    createdAt: talent.createdAt.toISOString(),
    updatedAt: talent.updatedAt.toISOString(),
  }

  return <TalentDetail initialTalent={formattedTalent as any} />
}
