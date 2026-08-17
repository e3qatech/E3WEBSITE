import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  parseMasterWorkbook,
  validateMasterWorkbook,
  applyMasterWorkbook
} from "@/lib/attraction-master-workbook"

export async function POST(request: Request) {
  try {
    const session = await auth()
    const userRole = (session?.user as any)?.role
    const isAuthorized = session && ["SUPER_ADMIN", "B2C_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes(userRole)

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const dryRunParam = formData.get("dryRun")
    const isDryRun = dryRunParam !== "false" // default to true unless explicitly 'false'
    const saveAsDraft = formData.get("saveAsDraft") !== "false"

    if (!file) {
      return NextResponse.json({ error: "No spreadsheet file provided. Please upload an .xlsx or .csv workbook." }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const targetAttractionId = (formData.get("targetAttractionId") as string) || undefined
    const targetAttractionSlug = (formData.get("targetAttractionSlug") as string) || undefined

    // 1. Parse Master Workbook
    const parsedData = parseMasterWorkbook(buffer)

    if (
      parsedData.attractions.length === 0 &&
      parsedData.activities.length === 0 &&
      parsedData.pricing.length === 0
    ) {
      return NextResponse.json({
        error: "No valid rows found in the uploaded workbook. Ensure the sheet has 'Attraction', 'What’s Inside', or 'Pricing' tabs."
      }, { status: 400 })
    }

    // 2. Validate and produce diff report
    const validationReport = await validateMasterWorkbook(parsedData, {
      targetAttractionId,
      targetAttractionSlug
    })

    // 3. If live execution requested and valid, apply changes
    let applyResult: { success: boolean; appliedCount: number; errors: string[] } | null = null

    if (!isDryRun) {
      if (!validationReport.isValid) {
        return NextResponse.json({
          error: "Workbook contains validation errors. Resolve errors before applying.",
          validationReport
        }, { status: 422 })
      }

      applyResult = await applyMasterWorkbook(parsedData, {
        saveAsDraft,
        targetAttractionId,
        targetAttractionSlug
      })
    }

    return NextResponse.json({
      success: true,
      dryRun: isDryRun,
      fileName: file.name,
      fileSize: file.size,
      validationReport,
      applyResult
    })
  } catch (error: any) {
    console.error("[MASTER_WORKBOOK_IMPORT_ERROR]", error)
    return NextResponse.json({
      error: error.message || "Failed to process Master Workbook"
    }, { status: 500 })
  }
}
