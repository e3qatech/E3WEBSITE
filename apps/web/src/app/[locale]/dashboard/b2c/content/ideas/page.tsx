import { Metadata } from 'next'
import { IdeasToLifeManager } from '@/components/dashboard/b2c/content/IdeasToLifeManager'

export const metadata: Metadata = {
  title: 'Ideas to Life Content Manager | E3 CMS',
}

export default function IdeasToLifePage() {
  return <IdeasToLifeManager />
}
