import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const count = await db.service.count()
    return NextResponse.json({ 
      databaseUrl: process.env.DATABASE_URL,
      serviceCount: count
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
