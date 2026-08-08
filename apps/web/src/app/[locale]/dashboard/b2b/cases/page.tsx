import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { CasesListClient } from "@/components/dashboard/b2b/CasesListClient"

export const metadata = {
  title: "B2B Case Studies | E3 Admin",
}

export default async function CasesPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const caseStudies = await db.caseStudy.findMany({
    orderBy: { year: 'desc' }
  })

  return <CasesListClient initialData={caseStudies} />
}
