import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { hasPermission } from "@/lib/permissions"
import db from "@/lib/db"
import { getMergedCMSPageContent } from "@/lib/cms-default-pages"
import { PulseOrbitCMSView } from "@/components/dashboard/b2c/PulseOrbitCMSView"

export const metadata: Metadata = {
  title: "Pulse Orbit Settings | E3 Admin",
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

export default async function PulseOrbitSettingsPage({
  params,
}: {
  params?: Promise<{ locale: string }>
}) {
  const session = await auth()
  const resolvedParams = params ? await params : { locale: 'en' }
  const locale = resolvedParams.locale || 'en'

  if (!session?.user && process.env.NODE_ENV === 'production') {
    redirect(`/${locale}/login`)
  }

  const userRole = (session?.user as any)?.role

  // Super admins or users with settings.general.manage access the cross-portal hub
  const canManageSettings =
    userRole && (hasPermission(userRole, 'settings.general.manage') || userRole === 'SUPER_ADMIN')

  if (!canManageSettings) {
    // If user has B2C access only, deep link to B2C Pulse Orbit
    const hasB2C =
      userRole &&
      (hasPermission(userRole, 'b2c.content.read') || hasPermission(userRole, 'b2c.content.write'))
    const hasB2B =
      userRole &&
      (hasPermission(userRole, 'b2b.content.read') || hasPermission(userRole, 'b2b.content.write'))

    if (hasB2C && !hasB2B) {
      redirect(`/${locale}/dashboard/b2c/pulse-orbit`)
    } else if (hasB2B && !hasB2C) {
      redirect(`/${locale}/dashboard/b2b/pulse-orbit`)
    } else {
      redirect(`/${locale}/dashboard`)
    }
  }

  const b2cRawContent = await getRawCMSPageContentServer("b2c-pulse-orbit")
  const b2bRawContent = await getRawCMSPageContentServer("b2b-pulse-orbit")

  const initialB2CData = getMergedCMSPageContent("b2c-pulse-orbit", b2cRawContent)
  const initialB2BData = getMergedCMSPageContent("b2b-pulse-orbit", b2bRawContent)

  return (
    <PulseOrbitCMSView
      initialData={initialB2CData as any}
      initialB2BData={initialB2BData as any}
      scopedPortal="ALL"
      allowedTabs={['B2C', 'B2B']}
      defaultTab="B2C"
    />
  )
}
