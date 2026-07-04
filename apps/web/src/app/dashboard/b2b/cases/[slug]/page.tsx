import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { CaseEditor } from "@/components/dashboard/b2b/CaseEditor"

export const metadata = {
  title: "Case Study Editor | E3 Admin",
}

export default async function EditCasePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const { slug } = await params
  
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

  if (slug === "new") {
    return <CaseEditor attractions={attractions} teamMembers={teamMembersDb} />
  }

  const caseStudy = await db.caseStudy.findUnique({
    where: { slug },
    include: {
      teamMembers: true
    }
  })

  if (!caseStudy) {
    notFound()
  }

  // Parse JSON fields safely for Editor UI
  const testimonials = (caseStudy.testimonials as any[]) || []
  const metrics = (caseStudy.metrics as any[]) || []
  const gallery = (caseStudy.gallery as any[]) || []
  const technicalSpecs = (caseStudy.technicalSpecs as any[]) || []
  const servicesUsed = (caseStudy.servicesUsed as any[]) || []

  const formattedData = {
    id: caseStudy.id,
    slug: caseStudy.slug,
    titleEn: caseStudy.titleEn || "",
    titleAr: caseStudy.titleAr || "",
    clientName: caseStudy.clientName || "",
    category: caseStudy.category || "Corporate",
    year: caseStudy.year || 2024,
    challengeEn: caseStudy.challengeEn || "",
    challengeAr: caseStudy.challengeAr || "",
    solutionEn: caseStudy.solutionEn || "",
    solutionAr: caseStudy.solutionAr || "",
    heroMediaType: caseStudy.heroMediaType || "IMAGE",
    heroImageUrl: caseStudy.heroImageUrl || "",
    thumbnailMediaType: caseStudy.thumbnailMediaType || "IMAGE",
    thumbnailUrl: caseStudy.thumbnailUrl || "",
    clientLogoUrl: caseStudy.clientLogoUrl || "",
    isPublished: caseStudy.isPublished,
    isFeatured: caseStudy.isFeatured,
    attractionId: caseStudy.attractionId || "",
    metrics,
    testimonials,
    gallery,
    technicalSpecs,
    servicesUsed,
    teamMembers: caseStudy.teamMembers.map(tm => ({
      teamMemberId: tm.teamMemberId,
      roleEn: tm.roleEn || "",
      roleAr: tm.roleAr || ""
    }))
  }

  return <CaseEditor initialData={formattedData} attractions={attractions} teamMembers={teamMembersDb} />
}
