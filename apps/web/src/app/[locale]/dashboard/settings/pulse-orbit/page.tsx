import { Metadata } from "next"
import db from "@/lib/db"
import { getMergedCMSPageContent } from "@/lib/cms-default-pages"
import { PulseOrbitCMSView } from "@/components/dashboard/b2c/PulseOrbitCMSView"

export const metadata: Metadata = {
  title: "Pulse Orbit Settings | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function PulseOrbitSettingsPage() {
  let rawContent: any = null
  try {
    const page = await db.pages.findUnique({
      where: { slug: "pulse-orbit" }
    })
    rawContent = page?.content
  } catch (_e) {
    rawContent = null
  }

  if (!rawContent) {
    try {
      const b2cPage = await db.pages.findUnique({
        where: { slug: "b2c-pulse-orbit" }
      })
      rawContent = b2cPage?.content
    } catch (_e) {
      rawContent = null
    }
  }

  const initialData = getMergedCMSPageContent("pulse-orbit", rawContent)

  return <PulseOrbitCMSView initialData={initialData as any} />
}
