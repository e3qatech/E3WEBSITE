import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetType = searchParams.get("targetType") || "ATTRACTION"

    const jobs = await db.importJob.findMany({
      where: targetType ? { targetType } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50
    })

    return NextResponse.json({ success: true, data: jobs })
  } catch (error: any) {
    console.error("[IMPORT_JOBS_GET_ERROR]", error)
    return NextResponse.json({ error: error.message || "Failed to fetch import jobs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 401 })
    }

    const body = await request.json()
    const { action, jobId } = body

    if (action === "ROLLBACK" && jobId) {
      const job = await db.importJob.findUnique({ where: { id: jobId } })
      if (!job) {
        return NextResponse.json({ error: "Import job not found" }, { status: 404 })
      }

      const appliedSlugs = Array.isArray(job.appliedRecordIds) ? (job.appliedRecordIds as string[]) : []

      // If records were created by this job and status was APPLIED, we can unpublish or revert them safely
      if (job.status === "APPLIED" && appliedSlugs.length > 0) {
        await db.attraction.updateMany({
          where: { slug: { in: appliedSlugs } },
          data: { isPublished: false }
        })
      }

      const updatedJob = await db.importJob.update({
        where: { id: jobId },
        data: { status: "ROLLED_BACK" }
      })

      return NextResponse.json({ success: true, message: `Batch ${job.batchNumber} has been rolled back successfully.`, job: updatedJob })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("[IMPORT_JOBS_ACTION_ERROR]", error)
    return NextResponse.json({ error: error.message || "Failed to execute import job action" }, { status: 500 })
  }
}
