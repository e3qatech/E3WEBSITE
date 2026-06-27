import { db } from "@/lib/db"
import { CasesList } from "@/components/dashboard/b2b/CasesList"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Case Studies | E3 Admin",
}

export default async function B2BCasesPage() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const caseStudies = await db.caseStudy.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      titleEn: true,
      titleAr: true,
      clientName: true,
      category: true,
      year: true,
      isPublished: true,
      isFeatured: true
    }
  })

  // Safe type conversion for Client Side
  const formattedCases = caseStudies.map(c => ({
    id: c.id,
    slug: c.slug,
    title: {
      en: c.titleEn,
      ar: c.titleAr
    },
    clientName: c.clientName,
    category: [c.category],
    year: c.year,
    isPublished: c.isPublished,
    isFeatured: c.isFeatured
  }))

  return (
    <div className="p-6">
      <CasesList initialCases={formattedCases} />
    </div>
  )
}
