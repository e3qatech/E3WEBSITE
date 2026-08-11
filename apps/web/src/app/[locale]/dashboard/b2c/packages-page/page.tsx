import { Metadata } from 'next'
import { PackagesPageEditor } from '@/components/dashboard/b2c/PackagesPageEditor'

export const metadata: Metadata = {
  title: 'Packages Page Editor | E3 CMS',
}

export default function PackagesPageEditorPage() {
  return <PackagesPageEditor />
}
