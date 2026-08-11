import { Metadata } from 'next'
import { ExploreQatarManager } from '@/components/dashboard/b2c/content/ExploreQatarManager'

export const metadata: Metadata = {
  title: 'Explore E3 Across Qatar Content Manager | E3 CMS',
}

export default function ExploreQatarPage() {
  return <ExploreQatarManager />
}
