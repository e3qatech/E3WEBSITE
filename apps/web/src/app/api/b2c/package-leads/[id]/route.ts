import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { requirePermission, AppAuthError } from "@/lib/server-auth"

async function enforceLeadPermission() {
  try {
    return await requirePermission("crm.leads.manage")
  } catch {
    return await requirePermission("b2c.packages.manage")
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    try {
      await enforceLeadPermission()
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const lead = await db.packageLead.findFirst({
      where: {
        OR: [{ id }, { leadId: id }]
      },
      include: {
        package: true,
        assignedTo: true,
        quotations: { include: { items: true } }
      }
    })

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    return NextResponse.json({ data: lead })
  } catch (error: any) {
    console.error("[GET /api/b2c/package-leads/[id]] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    let user: any = null
    try {
      user = await enforceLeadPermission()
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const {
      status,
      priority,
      assignedToId,
      internalNotes,
      tasks,
      activityNote,
      estimatedValue,
      ...rest
    } = body

    const existing = await db.packageLead.findFirst({
      where: { OR: [{ id }, { leadId: id }] }
    })
    if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

    // Append to activity log
    const activityLog = Array.isArray(existing.activityLog) ? [...existing.activityLog] : []
    if (activityNote) {
      activityLog.push({
        id: `act-${Date.now()}`,
        action: "NOTE_ADDED",
        timestamp: new Date().toISOString(),
        details: String(activityNote).slice(0, 500),
        user: user?.name || "Staff"
      })
    }
    if (status && status !== existing.status) {
      activityLog.push({
        id: `act-${Date.now()}`,
        action: "STATUS_CHANGED",
        timestamp: new Date().toISOString(),
        details: `Status changed from ${existing.status} to ${status}`,
        user: user?.name || "Staff"
      })
    }
    if (assignedToId && assignedToId !== existing.assignedToId) {
      activityLog.push({
        id: `act-${Date.now()}`,
        action: "ASSIGNED",
        timestamp: new Date().toISOString(),
        details: `Assigned to user ID ${assignedToId}`,
        user: user?.name || "Staff"
      })
    }

    const updated = await db.packageLead.update({
      where: { id: existing.id },
      data: {
        status: status !== undefined ? status : undefined,
        priority: priority !== undefined ? priority : undefined,
        assignedToId: assignedToId !== undefined ? (assignedToId || null) : undefined,
        internalNotes: internalNotes !== undefined ? internalNotes : undefined,
        tasks: tasks !== undefined ? tasks : undefined,
        estimatedValue: estimatedValue !== undefined ? parseFloat(estimatedValue) : undefined,
        activityLog,
        ...rest
      },
      include: {
        package: true,
        assignedTo: true,
        quotations: true
      }
    })

    return NextResponse.json({ data: updated })
  } catch (error: any) {
    console.error("[PUT /api/b2c/package-leads/[id]] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    try {
      await enforceLeadPermission()
    } catch (err: any) {
      if (err instanceof AppAuthError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existing = await db.packageLead.findFirst({
      where: { OR: [{ id }, { leadId: id }] }
    })
    if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

    await db.packageLead.delete({ where: { id: existing.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[DELETE /api/b2c/package-leads/[id]] Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 })
  }
}
