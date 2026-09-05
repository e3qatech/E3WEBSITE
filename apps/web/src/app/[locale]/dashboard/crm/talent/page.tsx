import { db } from "@/lib/db"
import { TalentList } from "@/components/dashboard/crm/TalentList"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Talent Acquisition | CRM | E3 Admin",
}

export default async function TalentPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }
  const role = (session.user as any)?.role;
  if (!["SUPER_ADMIN", "ADMIN", "HR", "HR_ADMIN"].includes(role)) {
    redirect("/dashboard/b2c/packages");
  }

  const talent = await db.talent.findMany({
    orderBy: { appliedDate: "desc" }
  })

  // Format dates for client
  const formattedTalent = talent.map((t: any) => ({
    ...t,
    appliedDate: t.appliedDate.toISOString(),
  }))

  return <TalentList initialTalent={formattedTalent as any} />
}
