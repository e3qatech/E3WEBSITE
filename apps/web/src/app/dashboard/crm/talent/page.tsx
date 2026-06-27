import { db } from "@/lib/db"
import { TalentList } from "@/components/dashboard/crm/TalentList"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Talent Acquisition | CRM | E3 Admin",
}

export default async function TalentPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "HR", "SUPPORT_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const talent = await db.talent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      job: { select: { title: true } }
    }
  })

  // Format dates for client
  const formattedTalent = talent.map(t => ({
    ...t,
    appliedDate: t.appliedDate.toISOString(),
  }))

  return <TalentList initialTalent={formattedTalent as any} />
}
