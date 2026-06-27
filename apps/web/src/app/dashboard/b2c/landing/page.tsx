import { Metadata } from "next"
import db from "@/lib/db"
import { B2CLandingCMSView } from "@/components/dashboard/b2c/B2CLandingCMSView"

export const metadata: Metadata = {
  title: "B2C Landing Page CMS | E3 Admin",
}

export const dynamic = 'force-dynamic'

export default async function B2CLandingPage() {
  const landingSetting = await db.setting.findUnique({
    where: { key: "B2C_LANDING_PAGE" }
  })
  
  const initialData = landingSetting?.value || {}

  return <B2CLandingCMSView initialData={initialData as any} />
}
