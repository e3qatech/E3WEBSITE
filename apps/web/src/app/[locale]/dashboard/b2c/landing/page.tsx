import { getMergedCMSPageContent } from '@/lib/cms-default-pages'
import db from '@/lib/db'
import { B2CLandingCMSView } from '@/components/dashboard/b2c/B2CLandingCMSView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getRawCMSPageContentServer(slug: string) {
  let content: any = null
  try {
    const pageRecord = await (db as any).pages?.findUnique({
      where: { slug }
    })
    content = pageRecord?.content || null
  } catch (_err) {
    content = null
  }

  if (!content) {
    try {
      const settingRecord = await (db as any).siteSettings?.findUnique({
        where: { key: `cms_page_${slug}` }
      })
      content = settingRecord?.value || null
    } catch (_err) {
      content = null
    }
  }

  if (!content) {
    const globalStore = (globalThis as any).__globalCMSPagesStore
    content = globalStore?.[slug]?.content || null
  }

  return content
}

export default async function DashboardB2CLandingCMSPage() {
  const rawContent = await getRawCMSPageContentServer('b2c-landing')
  const cmsData = getMergedCMSPageContent('b2c-landing', rawContent)

  return <B2CLandingCMSView initialData={cmsData} />
}
