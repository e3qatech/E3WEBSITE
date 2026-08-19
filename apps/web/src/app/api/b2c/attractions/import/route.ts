import { NextResponse } from "next/server"

/**
 * Gate 05E / Security Freeze: Attraction Spreadsheet Import is disabled at the server boundary
 * to eliminate runtime reachability of vulnerable XLSX prototype pollution and ReDoS attack vectors.
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
