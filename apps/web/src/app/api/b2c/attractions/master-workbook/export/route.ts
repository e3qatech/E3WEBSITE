import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { generateMasterWorkbook } from "@/lib/attraction-master-workbook"

export async function GET(request: Request) {
  try {
    const session = await auth()
    const userRole = (session?.user as any)?.role
    const isAuthorized = session && ["SUPER_ADMIN", "B2C_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes(userRole)

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const attractionSlug = searchParams.get("slug") || searchParams.get("attractionId") || undefined
    const isTemplateOnly = searchParams.get("template") === "true"

    const buffer = await generateMasterWorkbook({
      attractionIdOrSlug: attractionSlug,
      templateOnly: isTemplateOnly
    })

    const filename = isTemplateOnly
      ? "E3_Attraction_Master_Workbook_Template.xlsx"
      : attractionSlug
        ? `E3_Attraction_Master_Workbook_${attractionSlug}.xlsx`
        : "E3_Attraction_Master_Workbook_All.xlsx"

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    })
  } catch (error: any) {
    console.error("[MASTER_WORKBOOK_EXPORT_ERROR]", error)
    return NextResponse.json({ error: error.message || "Failed to generate master workbook export" }, { status: 500 })
  }
}
