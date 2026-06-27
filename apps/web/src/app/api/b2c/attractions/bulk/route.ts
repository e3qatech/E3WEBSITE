import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json()
    
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    await db.attraction.deleteMany({
      where: { id: { in: ids } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { ids, isPublished } = await req.json()
    
    if (!ids || !Array.isArray(ids) || typeof isPublished !== 'boolean') {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    await db.attraction.updateMany({
      where: { id: { in: ids } },
      data: { isPublished }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
