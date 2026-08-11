import { Metadata } from "next"
import db from "@/lib/db"
import { getMergedCMSPageContent } from "@/lib/cms-default-pages"
import { PulseOrbitCMSView } from "@/components/dashboard/b2c/PulseOrbitCMSView"

export const metadata: Metadata = {
  title: "B2C Pulse Orbit CMS | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function B2CPulseOrbitCMSPage() {
  let b2cRawContent: any = null
  let b2bRawContent: any = null

  try {
    const page = await db.pages.findUnique({
      where: { slug: "b2c-pulse-orbit" }
    }) || await db.pages.findUnique({
      where: { slug: "pulse-orbit" }
    })
    b2cRawContent = page?.content
  } catch (_e) {
    b2cRawContent = null
  }

  try {
    const b2bPage = await db.pages.findUnique({
      where: { slug: "b2b-pulse-orbit" }
    })
    b2bRawContent = b2bPage?.content
  } catch (_e) {
    b2bRawContent = null
  }

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
