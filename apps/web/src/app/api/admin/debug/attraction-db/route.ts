import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await auth()
  if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  let variableUsed = "NONE"
  if (process.env.DATABASE_URL) variableUsed = "DATABASE_URL"
  else if (process.env.POSTGRES_PRISMA_URL) variableUsed = "POSTGRES_PRISMA_URL"
  else if (process.env.POSTGRES_URL) variableUsed = "POSTGRES_URL"
  else if (process.env.POSTGRES_URL_NON_POOLING) variableUsed = "POSTGRES_URL_NON_POOLING"

  const rawDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || ""

  let host = "not-configured"
  let dbName = "not-configured"
  try {
    if (rawDbUrl) {
      const parsed = new URL(rawDbUrl)
      host = parsed.hostname
      dbName = parsed.pathname.replace(/^\//, "")
    }
  } catch (_e) {
    host = rawDbUrl.split("@")[1]?.split("/")[0] || "parse-error"
  }

  const envSummary = {
    DATABASE_URL: {
      configured: Boolean(process.env.DATABASE_URL),
      host: parseSafeHost(process.env.DATABASE_URL),
      database: parseSafeDb(process.env.DATABASE_URL)
    },
    POSTGRES_PRISMA_URL: {
      configured: Boolean(process.env.POSTGRES_PRISMA_URL),
      host: parseSafeHost(process.env.POSTGRES_PRISMA_URL),
      database: parseSafeDb(process.env.POSTGRES_PRISMA_URL)
    },
    POSTGRES_URL: {
      configured: Boolean(process.env.POSTGRES_URL),
      host: parseSafeHost(process.env.POSTGRES_URL),
      database: parseSafeDb(process.env.POSTGRES_URL)
    }
  }

  let totalAttractions = 0
  let b2bVisible = 0
  let b2bHidden = 0
  let sampleSlugs: any[] = []
  let queryError: string | null = null

  try {
    totalAttractions = await db.attraction.count()
    b2bVisible = await db.attraction.count({ where: { isB2bVisible: true } })
    b2bHidden = await db.attraction.count({ where: { isB2bVisible: false } })
    sampleSlugs = await db.attraction.findMany({
      select: { slug: true, isB2bVisible: true, isPublished: true },
      take: 10
    })
  } catch (err: any) {
    queryError = err.message || String(err)
  }

  return NextResponse.json({
    databaseHost: host,
    databaseName: dbName,
    databaseVariableUsed: variableUsed,
    envSummary,
    totalAttractions,
    b2bVisible,
    b2bHidden,
    sampleSlugs,
    queryError
  })
}

function parseSafeHost(urlStr?: string): string {
  if (!urlStr) return "not-set"
  try {
    return new URL(urlStr).hostname
  } catch {
    return urlStr.split("@")[1]?.split("/")[0] || "invalid-url"
  }
}

function parseSafeDb(urlStr?: string): string {
  if (!urlStr) return "not-set"
  try {
    return new URL(urlStr).pathname.replace(/^\//, "")
  } catch {
    return "invalid-url"
  }
}
