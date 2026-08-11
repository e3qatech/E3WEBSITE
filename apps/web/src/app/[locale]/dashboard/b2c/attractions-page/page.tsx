import { Metadata } from 'next'
import { AttractionsPageEditor } from '@/components/dashboard/b2c/AttractionsPageEditor'

export const metadata: Metadata = {
  title: 'Attractions Page Editor | E3 CMS',
}

export default function AttractionsPageEditorPage() {
  return <AttractionsPageEditor />
}
