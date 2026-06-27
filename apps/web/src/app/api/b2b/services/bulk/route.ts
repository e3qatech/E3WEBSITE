import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json()
    
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    await db.service.deleteMany({
      where: {
        id: { in: ids }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error bulk deleting services:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { ids, isVisible } = await req.json()
    
    if (!ids || !Array.isArray(ids) || typeof isVisible !== 'boolean') {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    await db.service.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        isVisible
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error bulk updating services:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
