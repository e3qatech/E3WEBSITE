import { db } from "@/lib/db"
import { TeamManager } from "@/components/dashboard/b2b/TeamManager"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Team & Scheduler | E3 Admin",
}

export default async function B2BTeamPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const teamMembers = await db.teamMember.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      availability: {
        orderBy: { startTime: "asc" }
      }
    }
  })

  // Safe type formatting
  const formattedMembers = teamMembers.map(m => ({
    id: m.id,
    nameEn: m.nameEn,
    nameAr: m.nameAr,
    roleTitleEn: m.roleTitleEn,
    roleTitleAr: m.roleTitleAr,
    bioEn: m.bioEn,
    bioAr: m.bioAr,
    imageUrl: m.imageUrl,
    availability: m.availability.map(slot => ({
      id: slot.id,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      isBooked: slot.isBooked
    }))
  }))

  return <TeamManager initialMembers={formattedMembers} />
}
