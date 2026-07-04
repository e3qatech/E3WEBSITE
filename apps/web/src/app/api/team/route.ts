import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, firstNameAr, lastNameAr, designation, designationAr, department, yearsOfExperience, tagline, aboutSummary, aboutSummaryAr, profileImage } = body

    const slug = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now().toString().slice(-4)

    const member = await db.employeeProfile.create({
      data: {
        slug,
        firstName,
        lastName,
        firstNameAr,
        lastNameAr,
        designation,
        designationAr,
        department: department || "General",
        yearsOfExperience: yearsOfExperience || 0,
        tagline: tagline || "",
        aboutSummary: aboutSummary || "",
        aboutSummaryAr,
        profileImage,
        careerJourney: "",
        keyStrengths: "",
        expertiseTags: [],
        coreCompetencies: [],
        experience: [],
        projects: [],
        certifications: [],
        education: [],
        awards: [],
        skillsMatrix: [],
        mediaGallery: [],
        testimonials: []
      }
    })

    return NextResponse.json(member)
  } catch (error: any) {
    console.error("[TEAM_POST_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await db.employeeProfile.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: "Member deleted" })
  } catch (error: any) {
    console.error("[TEAM_DELETE_ERROR]", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
