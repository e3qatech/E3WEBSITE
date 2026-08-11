import { Metadata } from 'next'
import { StoryDiscoveryManager } from '@/components/dashboard/b2c/content/StoryDiscoveryManager'

export const metadata: Metadata = {
  title: 'Story Discovery Content Manager | E3 CMS',
}

export default function StoryDiscoveryPage() {
  return <StoryDiscoveryManager />
}
