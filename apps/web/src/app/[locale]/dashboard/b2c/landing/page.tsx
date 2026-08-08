import { Metadata } from "next"
import db from "@/lib/db"
import { getMergedCMSPageContent } from "@/lib/cms-default-pages"
import { B2CLandingCMSView } from "@/components/dashboard/b2c/B2CLandingCMSView"

export const metadata: Metadata = {
  title: "B2C Landing Page CMS | E3 Admin",
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function B2CLandingPage() {
  let rawContent: any = null
  try {
    const page = await db.pages.findUnique({
      where: { slug: "b2c-landing" }
    })
    rawContent = page?.content
  } catch (_e) {
    const globalStore = (globalThis as any).__globalCMSPagesStore
    rawContent = globalStore?.["b2c-landing"]?.content
  }

  if (!rawContent) {
    const globalStore = (globalThis as any).__globalCMSPagesStore
    rawContent = globalStore?.["b2c-landing"]?.content
  }

  const initialData = getMergedCMSPageContent("b2c-landing", rawContent)

  return <B2CLandingCMSView initialData={initialData as any} />
}
