import { db } from "@/lib/db"
import { CaseEditor } from "@/components/dashboard/b2b/CaseEditor"
import { auth } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"

interface EditProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: "Edit Case Study | E3 Admin",
}

export default async function EditCasePage({ params }: EditProps) {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const { id } = await params
  const caseStudy = await db.caseStudy.findUnique({
    where: { id },
    include: {
      teamMembers: true
    }
  })

  if (!caseStudy) {
    notFound()
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
