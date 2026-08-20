import { NextResponse } from "next/server"

/**
 * Gate 05E / Security Freeze: Master Workbook Import is disabled at the server boundary
 * to eliminate runtime reachability of vulnerable XLSX spreadsheet parsing.
 */
export async function POST(_request: Request) {
  return NextResponse.json(
    {
      error: "Workbook import is temporarily unavailable while the spreadsheet processor is being upgraded.",
      code: "WORKBOOK_IMPORT_DISABLED"
    },
    { status: 503 }
  )
}
