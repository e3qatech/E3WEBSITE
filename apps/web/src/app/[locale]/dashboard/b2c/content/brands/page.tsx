import { Metadata } from 'next'
import { OurBrandsManager } from '@/components/dashboard/b2c/content/OurBrandsManager'

export const metadata: Metadata = {
  title: 'Our Brands Content Manager | E3 CMS',
}

export default function OurBrandsPage() {
  return <OurBrandsManager />
}
