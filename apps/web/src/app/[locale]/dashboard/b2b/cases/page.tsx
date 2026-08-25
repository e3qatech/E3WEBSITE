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

  let caseStudies: any[] = []
  try {
    caseStudies = await db.caseStudy.findMany({
      orderBy: { year: 'desc' }
    })
  } catch (error) {
    console.error("[CASES_PAGE_DB_ERROR]", error)
    try {
      caseStudies = await (db as any).$queryRawUnsafe(`SELECT * FROM "CaseStudy" ORDER BY "year" DESC`).catch(() => [])
    } catch (_fallbackErr) {
      caseStudies = []
    }
  }

  return <CasesListClient initialData={caseStudies || []} />
}
