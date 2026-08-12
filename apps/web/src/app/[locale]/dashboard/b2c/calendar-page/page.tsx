import { Metadata } from 'next'
import { CalendarPageManager } from '@/components/dashboard/b2c/CalendarPageManager'

export const metadata: Metadata = {
  title: 'Calendar Page Settings | E3 CMS',
}

export default function CalendarPageEditorPage() {
  return <CalendarPageManager />
}
