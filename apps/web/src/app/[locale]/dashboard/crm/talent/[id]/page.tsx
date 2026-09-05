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
  if (!session?.user) {
    redirect("/login")
  }
  const role = (session.user as any)?.role;
  if (!["SUPER_ADMIN", "ADMIN", "HR", "HR_ADMIN"].includes(role)) {
    redirect("/dashboard/b2c/packages");
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
