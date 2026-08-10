import { getMergedCMSPageContent } from '@/lib/cms-default-pages'
import db from '@/lib/db'
import { B2CLandingCMSView } from '@/components/dashboard/b2c/B2CLandingCMSView'

export const dynamic = 'force-dynamic'

export default async function DashboardB2CLandingCMSPage() {
  let rawContent = null
  try {
    const pageRecord = await (db as any).pages?.findUnique({
      where: { slug: 'b2c-landing' }
    })
    rawContent = pageRecord?.content || null
  } catch (err) {
    console.warn('[CMS Dashboard B2C Landing] Failed reading page record:', err)
  }

  const cmsData = getMergedCMSPageContent('b2c-landing', rawContent)

  return <B2CLandingCMSView initialData={cmsData} />
}
