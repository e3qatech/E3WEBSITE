import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()
    
    const talent = await db.talent.update({
      where: { id: params.id },
      data
    })

    return NextResponse.json(talent)
  } catch (error) {
    console.error("Error updating talent:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const talent = await db.talent.findUnique({
      where: { id: params.id }
    })
    
    if (!talent) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(talent)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
