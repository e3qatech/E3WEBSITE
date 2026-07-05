import { NextResponse } from "next/server"
import { auth } from '@/lib/auth';
import db from "@/lib/db"

// Mock Redis client for invalidation
const redis = {
  del: async (key: string) => {
    console.log(`[Redis Mock] Cleared cache key: ${key}`)
    return 1
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== 'SUPER_ADMIN' && (session.user as any).role !== 'SALES_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { key, value, type } = await req.json()

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const setting = await db.setting.upsert({
      where: { key },
      update: { value, type: type || "GENERAL" },
      create: { key, value, type: type || "GENERAL" }
    })

    // Mock Redis cache clear based on the type or key
    await redis.del(`settings:${key}`)
    if (type) {
      await redis.del(`settings:type:${type}`)
    }

    return NextResponse.json({ success: true, setting })
  } catch (error) {
    console.error("Error saving setting:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== 'SUPER_ADMIN' && (session.user as any).role !== 'SALES_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    
    let settings
    if (type) {
      settings = await db.setting.findMany({ where: { type } })
    } else {
      settings = await db.setting.findMany()
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
