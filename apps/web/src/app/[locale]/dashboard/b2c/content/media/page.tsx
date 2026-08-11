import { Metadata } from 'next'
import { B2CMediaManager } from '@/components/dashboard/b2c/content/B2CMediaManager'

export const metadata: Metadata = {
  title: 'Media Manager | E3 CMS',
}

export default function MediaManagerPage() {
  return <B2CMediaManager />
}
