import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    const talent = await db.talent.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        department: data.department,
        experienceLevel: data.experienceLevel,
        skills: data.skills || [],
        languages: data.languages || [],
        education: data.education || [],
        certifications: data.certifications || []
      }
    })

    return NextResponse.json(talent)
  } catch (error) {
    console.error("Error creating talent:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const talents = await db.talent.findMany({
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(talents)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
