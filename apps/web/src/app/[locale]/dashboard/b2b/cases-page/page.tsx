import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { B2BCasesEditor } from "@/components/dashboard/b2b/B2BCasesEditor"
import { DEFAULT_B2B_CASES_CONTENT } from "@/lib/cms-default-pages"

export const metadata = {
  title: "B2B Case Studies Page Editor | E3 Admin",
}

export default async function CasesPageEditor() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const [page, caseStudies, services, employeeProfiles] = await Promise.all([
    db.pages.findUnique({
      where: { slug: 'b2b-cases' }
    }),
    db.caseStudy.findMany({
      orderBy: { titleEn: 'asc' },
      select: { id: true, slug: true, titleEn: true, titleAr: true, clientName: true, year: true, category: true, isPublished: true, isFeatured: true }
    }),
    db.service.findMany({
      orderBy: { titleEn: 'asc' },
      select: { id: true, slug: true, titleEn: true, titleAr: true }
    }),
    db.employeeProfile.findMany({
      orderBy: { firstName: 'asc' },
      select: { id: true, firstName: true, lastName: true, designation: true }
    })
  ])

  const rawContent = (page?.content as any) || {}
  const initialContent = {
    ...DEFAULT_B2B_CASES_CONTENT,
    ...rawContent,
    hero: { ...DEFAULT_B2B_CASES_CONTENT.hero, ...(rawContent.hero || {}) },
    showreel: { ...DEFAULT_B2B_CASES_CONTENT.showreel, ...(rawContent.showreel || {}) },
    factStream: { ...DEFAULT_B2B_CASES_CONTENT.factStream, ...(rawContent.factStream || {}) },
    featuredCases: { ...DEFAULT_B2B_CASES_CONTENT.featuredCases, ...(rawContent.featuredCases || {}) },
    archive: { ...DEFAULT_B2B_CASES_CONTENT.archive, ...(rawContent.archive || {}) },
    teamStories: { ...DEFAULT_B2B_CASES_CONTENT.teamStories, ...(rawContent.teamStories || {}) },
    timeline: { ...DEFAULT_B2B_CASES_CONTENT.timeline, ...(rawContent.timeline || {}) },
    transformations: { ...DEFAULT_B2B_CASES_CONTENT.transformations, ...(rawContent.transformations || {}) },
    impactOverview: { ...DEFAULT_B2B_CASES_CONTENT.impactOverview, ...(rawContent.impactOverview || {}) },
    servicesSection: { ...DEFAULT_B2B_CASES_CONTENT.servicesSection, ...(rawContent.servicesSection || {}) },
    cta: { ...DEFAULT_B2B_CASES_CONTENT.cta, ...(rawContent.cta || {}) },
    seo: { ...DEFAULT_B2B_CASES_CONTENT.seo, ...(rawContent.seo || {}) }
  }

  return (
    <B2BCasesEditor 
      initialData={initialContent} 
      caseStudies={caseStudies}
      services={services}
      employeeProfiles={employeeProfiles}
    />
  )
}
