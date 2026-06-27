import { NextResponse } from "next/server"

// MOCK: AI CV Parser
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("resume") as File
    
    if (!file) {
      return NextResponse.json({ error: "No resume provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 })
    }
    
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 })
    }

    // Simulate AI parsing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Return mock structured data
    return NextResponse.json({
      name: "Mock Applicant",
      email: "mock.applicant@example.com",
      phone: "+974 5555 1234",
      position: "Senior Event Manager",
      department: "Operations",
      experienceLevel: "Senior",
      skills: ["Event Planning", "Budget Management", "Vendor Negotiation", "Team Leadership"],
      languages: [
        { language: "English", level: "Native" },
        { language: "Arabic", level: "Professional" }
      ],
      education: [
        { degree: "BSc Business Administration", institution: "Qatar University", year: 2018 }
      ],
      certifications: ["PMP", "Certified Meeting Professional (CMP)"]
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
