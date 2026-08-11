import { Metadata } from 'next'
import { LiveFeedManager } from '@/components/dashboard/b2c/content/LiveFeedManager'

export const metadata: Metadata = {
  title: 'Live Feed Content Manager | E3 CMS',
}

export default function LiveFeedPage() {
  return <LiveFeedManager />
}
