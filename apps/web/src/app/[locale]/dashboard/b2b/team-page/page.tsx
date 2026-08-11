import { Metadata } from 'next'
import { B2BTeamPageEditor } from '@/components/dashboard/b2b/B2BTeamPageEditor'

export const metadata: Metadata = {
  title: 'Team Page Editor | E3 CMS',
}

export default function B2BTeamPageEditorPage() {
  return <B2BTeamPageEditor />
}
