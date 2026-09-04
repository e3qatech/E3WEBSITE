import { NextResponse } from "next/server"
import db from "@/lib/db"
import { auth } from "@/lib/auth"

const ALLOWED_ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SUPPORT_ADMIN",
  "SALES_ADMIN",
  "B2C_ADMIN",
  "OPERATIONS",
  "MARKETING",
]

async function verifyAttractionAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session?.user || !ALLOWED_ADMIN_ROLES.includes(role)) {
    return false
  }
  return true
}

export async function DELETE(req: Request) {
  try {
    if (!await verifyAttractionAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { ids } = await req.json()
    
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    await db.attraction.deleteMany({
      where: { id: { in: ids } }
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    if (!await verifyAttractionAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { ids, isPublished } = await req.json()
    
    if (!ids || !Array.isArray(ids) || typeof isPublished !== 'boolean') {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    await db.attraction.updateMany({
      where: { id: { in: ids } },
      data: { isPublished }
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
