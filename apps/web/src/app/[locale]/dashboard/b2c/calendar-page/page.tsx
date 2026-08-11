import { Metadata } from 'next'
import { CalendarPageEditor } from '@/components/dashboard/b2c/CalendarPageEditor'

export const metadata: Metadata = {
  title: 'Calendar Page Editor | E3 CMS',
}

export default function CalendarPageEditorPage() {
  return <CalendarPageEditor />
}
