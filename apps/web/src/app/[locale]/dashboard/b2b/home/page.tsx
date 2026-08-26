import { Metadata } from "next"
import { B2BHomeEditor } from "@/components/dashboard/b2b/B2BHomeEditor"
import db from "@/lib/db"
import { getMergedCMSPageContent } from "@/lib/cms-default-pages"

export const metadata: Metadata = {
  title: "B2B Homepage Editor | E3 Command Center"
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardB2BHomePage() {
  let pageData: any = null
  let services: any[] = []
  let caseStudies: any[] = []

  try {
    const results = await Promise.all([
      db.pages.findUnique({
        where: { slug: 'b2b-home' }
      }),
      db.service.findMany({
        where: { isVisible: true },
        select: { id: true, slug: true, titleEn: true, titleAr: true }
      }),
      db.caseStudy.findMany({
        where: { isPublished: true },
        select: { id: true, slug: true, titleEn: true, titleAr: true }
      })
    ])
    pageData = results[0]
    services = results[1]
    caseStudies = results[2]
  } catch (error) {
    console.warn("[Dashboard B2B Home] Database load notice:", error)
  }

  const mergedContent = getMergedCMSPageContent("b2b-home", pageData?.content)
  const initialData = {
    slug: "b2b-home",
    content: mergedContent,
    seo: pageData?.seo || mergedContent?.seo || {}
  }

  return (
    <B2BHomeEditor 
      initialData={initialData} 
      services={services}
      caseStudies={caseStudies}
    />
  )
}
