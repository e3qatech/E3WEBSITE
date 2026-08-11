import { Metadata } from "next"
import db from "@/lib/db"
import { getMergedCMSPageContent } from "@/lib/cms-default-pages"
import { PulseOrbitCMSView } from "@/components/dashboard/b2c/PulseOrbitCMSView"

export const metadata: Metadata = {
  title: "B2B Pulse Orbit CMS | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function B2BPulseOrbitCMSPage() {
  let b2bRawContent: any = null
  let b2cRawContent: any = null

  try {
    const b2bPage = await db.pages.findUnique({
      where: { slug: "b2b-pulse-orbit" }
    })
    b2bRawContent = b2bPage?.content
  } catch (_e) {
    b2bRawContent = null
  }

  try {
    const b2cPage = await db.pages.findUnique({
      where: { slug: "b2c-pulse-orbit" }
    }) || await db.pages.findUnique({
      where: { slug: "pulse-orbit" }
    })
    b2cRawContent = b2cPage?.content
  } catch (_e) {
    b2cRawContent = null
  }

  const initialB2BData = getMergedCMSPageContent("b2b-pulse-orbit", b2bRawContent)
  const initialB2CData = getMergedCMSPageContent("b2c-pulse-orbit", b2cRawContent)

  return (
    <PulseOrbitCMSView
      initialData={initialB2CData as any}
      initialB2BData={initialB2BData as any}
      defaultTab="B2B"
    />
  )
}
