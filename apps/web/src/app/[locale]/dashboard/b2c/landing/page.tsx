import { getCMSPageContentServer } from '@/lib/cms-server'
import { B2CLandingCMSView } from '@/components/dashboard/b2c/B2CLandingCMSView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardB2CLandingCMSPage() {
  const cmsData = await getCMSPageContentServer('b2c-landing')
  return <B2CLandingCMSView initialData={cmsData} />
}
