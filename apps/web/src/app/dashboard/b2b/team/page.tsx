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

  const teamMembers = await db.employeeProfile.findMany({
    orderBy: { order: "asc" },
    include: {
      availability: {
        orderBy: { startTime: "asc" }
      }
    }
  })

  // Safe type formatting
  const formattedMembers = teamMembers.map(m => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    firstNameAr: m.firstNameAr,
    lastNameAr: m.lastNameAr,
    designation: m.designation,
    designationAr: m.designationAr,
    aboutSummary: m.aboutSummary,
    aboutSummaryAr: m.aboutSummaryAr,
    profileImage: m.profileImage,
    availability: m.availability.map(slot => ({
      id: slot.id,
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      isBooked: slot.isBooked
    }))
  }))

  return <TeamManager initialMembers={formattedMembers} />
}
