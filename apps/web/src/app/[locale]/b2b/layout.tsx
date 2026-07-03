import React from 'react'
import { B2BLayout } from '@/components/b2b/layout/B2BLayout'
import db from "@/lib/db"

export const metadata = {
  title: 'E3 Corporate - Events & Entertainment Enterprises',
  description: 'E3 turns ideas into landmark experiences through creative design, fabrication, ticketing, staffing, operations, and measurable delivery.',
}

export default async function RootB2BLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <B2BLayout>
      {children}
    </B2BLayout>
  )
}
