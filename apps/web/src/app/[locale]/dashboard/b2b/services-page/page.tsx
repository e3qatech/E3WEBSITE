import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { B2BServicesEditor } from "@/components/dashboard/b2b/B2BServicesEditor"
import { DEFAULT_B2B_SERVICES_CONTENT } from "@/lib/cms-default-pages"

export const metadata = {
  title: "B2B Services Page Editor | E3 Admin",
}

export default async function ServicesPageEditor() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    redirect("/login")
  }

  const [page, services, caseStudies] = await Promise.all([
    db.pages.findUnique({
      where: { slug: 'b2b-services' }
    }),
    db.service.findMany({
      orderBy: { titleEn: 'asc' },
      select: { id: true, slug: true, titleEn: true, titleAr: true, isVisible: true, isPublished: true, isFeatured: true }
    }),
    db.caseStudy.findMany({
      where: { isPublished: true },
      orderBy: { titleEn: 'asc' },
      select: { id: true, slug: true, titleEn: true, titleAr: true, year: true, clientName: true }
    })
  ])

  const rawContent = (page?.content as any) || {}
  const initialContent = {
    ...DEFAULT_B2B_SERVICES_CONTENT,
    ...rawContent,
    hero: { ...DEFAULT_B2B_SERVICES_CONTENT.hero, ...(rawContent.hero || {}) },
    capabilityCount: { ...DEFAULT_B2B_SERVICES_CONTENT.capabilityCount, ...(rawContent.capabilityCount || {}) },
    philosophy: { ...DEFAULT_B2B_SERVICES_CONTENT.philosophy, ...(rawContent.philosophy || {}) },
    navigator: { ...DEFAULT_B2B_SERVICES_CONTENT.navigator, ...(rawContent.navigator || {}) },
    featuredSpotlights: { ...DEFAULT_B2B_SERVICES_CONTENT.featuredSpotlights, ...(rawContent.featuredSpotlights || {}) },
    deliveryMethodology: { 
      ...DEFAULT_B2B_SERVICES_CONTENT.deliveryMethodology, 
      ...(rawContent.deliveryMethodology || {}),
      steps: (rawContent.deliveryMethodology?.steps && rawContent.deliveryMethodology.steps.length > 0)
        ? rawContent.deliveryMethodology.steps
        : DEFAULT_B2B_SERVICES_CONTENT.deliveryMethodology.steps
    },
    caseStudies: { ...DEFAULT_B2B_SERVICES_CONTENT.caseStudies, ...(rawContent.caseStudies || {}) },
    partnerRibbon: { ...DEFAULT_B2B_SERVICES_CONTENT.partnerRibbon, ...(rawContent.partnerRibbon || {}) },
    cta: { ...DEFAULT_B2B_SERVICES_CONTENT.cta, ...(rawContent.cta || {}) },
    seo: { ...DEFAULT_B2B_SERVICES_CONTENT.seo, ...(rawContent.seo || {}) }
  }

  return (
    <B2BServicesEditor 
      initialData={initialContent} 
      services={services}
      caseStudies={caseStudies}
    />
  )
}
