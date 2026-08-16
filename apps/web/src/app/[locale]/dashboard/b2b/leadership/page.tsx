import { Metadata } from 'next'
import { B2BLeadershipEditor } from '@/components/dashboard/b2b/B2BLeadershipEditor'

export const metadata: Metadata = {
  title: 'Leadership Page Editor | E3 CMS',
}

export default function B2BLeadershipEditorPage() {
  return <B2BLeadershipEditor />
}
