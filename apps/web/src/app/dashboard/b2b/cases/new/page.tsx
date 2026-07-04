import { CaseEditor } from "@/components/dashboard/b2b/CaseEditor"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "New Case Study | E3 Admin",
}

import { db } from "@/lib/db"

export default async function NewCasePage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const [attractions, teamMembersDb] = await Promise.all([
    db.attraction.findMany({
      select: { id: true, nameEn: true },
      orderBy: { nameEn: 'asc' }
    }),
    db.teamMember.findMany({
      select: { id: true, nameEn: true, roleTitleEn: true },
      orderBy: { nameEn: 'asc' }
    })
  ])

  return <CaseEditor attractions={attractions} teamMembers={teamMembersDb} />
}
