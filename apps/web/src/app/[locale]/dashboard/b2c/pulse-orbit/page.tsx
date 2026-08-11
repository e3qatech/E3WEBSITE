import { Metadata } from "next"
import db from "@/lib/db"
import { getMergedCMSPageContent } from "@/lib/cms-default-pages"
import { PulseOrbitCMSView } from "@/components/dashboard/b2c/PulseOrbitCMSView"

export const metadata: Metadata = {
  title: "B2C Pulse Orbit CMS | E3 Admin",
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getRawCMSPageContentServer(slug: string) {
  let content: any = null
  try {
    const page = await db.pages.findUnique({ where: { slug } })
    content = page?.content
  } catch (_e) {
    content = null
  }

  if (!content && slug === 'b2c-pulse-orbit') {
    try {
      const legacyPage = await db.pages.findUnique({ where: { slug: "pulse-orbit" } })
      content = legacyPage?.content
    } catch (_e) {
      content = null
    }
  }

  if (!content) {
    try {
      const setting = await (db as any).siteSettings.findUnique({ where: { key: `cms_page_${slug}` } })
      content = setting?.value
    } catch (_e) {
      content = null
    }
  }

  if (!content) {
    const globalStore = (globalThis as any).__globalCMSPagesStore
    content = globalStore?.[slug]?.content
  }

  return content
}

export default async function B2CPulseOrbitCMSPage() {
  const b2cRawContent = await getRawCMSPageContentServer("b2c-pulse-orbit")
  const b2bRawContent = await getRawCMSPageContentServer("b2b-pulse-orbit")

  const initialB2CData = getMergedCMSPageContent("b2c-pulse-orbit", b2cRawContent)
  const initialB2BData = getMergedCMSPageContent("b2b-pulse-orbit", b2bRawContent)

  return (
    <PulseOrbitCMSView
      initialData={initialB2CData as any}
      initialB2BData={initialB2BData as any}
      defaultTab="B2C"
    />
  )
}
