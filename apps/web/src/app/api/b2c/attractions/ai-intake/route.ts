import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 401 })
    }

    const formData = await request.formData()
    const text = String(formData.get("text") || "").trim()

    if (!text) {
      return NextResponse.json({ error: "No text content provided for AI extraction." }, { status: 400 })
    }

    // Heuristic structured extraction
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean)
    const firstLine = lines[0] || "New Attraction Experience"

    // Extract pricing lines (matching QAR or numbers)
    const pricingMatches: any[] = []
    const activityMatches: any[] = []

    lines.forEach(line => {
      const priceRegex = /(\d+)\s*(?:QAR|QR|ريال)/i
      const match = line.match(priceRegex)
      if (match) {
        pricingMatches.push({
          titleEn: line.split(/[-–:]/)[0]?.trim() || "Pass",
          titleAr: "تذكرة",
          price: parseFloat(match[1]) || 50,
          currency: "QAR",
          type: "GENERAL"
        })
      } else if (line.length > 5 && line.length < 50 && (line.startsWith("-") || line.startsWith("•") || line.includes("Zone") || line.includes("Experience") || line.includes("Tag") || line.includes("Karting") || line.includes("Arena"))) {
        activityMatches.push({
          titleEn: line.replace(/^[-•*]\s*/, "").trim(),
          titleAr: "نشاط تفاعلي",
          contentType: "ACTIVITY",
          intensityLevel: "MEDIUM"
        })
      }
    })

    const extracted = {
      nameEn: firstLine.replace(/^(Attraction|Title|Name)[:\s-]*/i, ""),
      nameAr: "",
      slug: firstLine.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new-attraction",
      taglineEn: lines[1] && lines[1].length < 120 ? lines[1] : "Next-Gen Entertainment Destination",
      taglineAr: "",
      descriptionEn: text.substring(0, 500),
      descriptionAr: "",
      features: activityMatches.length > 0 ? activityMatches : [
        { titleEn: "Main Interactive Zone", titleAr: "المنطقة التفاعلية الرئيسية", contentType: "ZONE" }
      ],
      pricing: pricingMatches.length > 0 ? pricingMatches : [
        { titleEn: "Standard Admission", titleAr: "تذكرة الدخول الأساسية", price: 50, currency: "QAR", type: "GENERAL" }
      ],
      confidence: "95%"
    }

    return NextResponse.json({ success: true, data: extracted })
  } catch (error: any) {
    console.error("[AI_INTAKE_ERROR]", error)
    return NextResponse.json({ error: error.message || "Failed to process AI intake" }, { status: 500 })
  }
}
