import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole, requireCurrentUser, AuthError } from "@/lib/server-auth"
import bcrypt from "bcryptjs"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["SUPER_ADMIN"])
    const params = await context.params
    const targetUserId = params.id

    const body = await request.json()
    const { role, isActive, password, revokeSessions } = body

    const targetUser = await db.users.findUnique({
      where: { id: targetUserId }
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent self-role elevation or self-deactivation if last super admin
    if (targetUser.id === user.id && (role && role !== targetUser.role || isActive === false)) {
      const superAdminsCount = await db.users.count({ where: { role: "SUPER_ADMIN", isActive: true } })
      if (superAdminsCount <= 1) {
        return NextResponse.json({ error: "Cannot modify last active SUPER_ADMIN" }, { status: 403 })
      }
    }

    const dataToUpdate: any = {}
    let shouldIncrementSessionVersion = false

    if (role !== undefined && role !== targetUser.role) {
      dataToUpdate.role = role
      shouldIncrementSessionVersion = true
    }

    if (isActive !== undefined && isActive !== targetUser.isActive) {
      dataToUpdate.isActive = isActive
      shouldIncrementSessionVersion = true
    }

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10)
      shouldIncrementSessionVersion = true
    }

    if (revokeSessions) {
      shouldIncrementSessionVersion = true
    }

    if (shouldIncrementSessionVersion) {
      dataToUpdate.sessionVersion = { increment: 1 }
    }

    const updatedUser = await db.users.update({
      where: { id: targetUserId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        sessionVersion: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error("[USER_PATCH_ERROR]", error)
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
