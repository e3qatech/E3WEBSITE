import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin, AppAuthError } from "@/lib/server-auth";
import { normalizeRole } from "@/lib/auth-roles";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const adminUser = await requireAdmin();
    if (adminUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Forbidden: Only Super Admin can modify user accounts" }, { status: 403 });
    }

    const params = await context.params;
    const targetUserId = params.id;

    const body = await request.json();
    const { role, isActive, password, revokeSessions, employeeProfileId, clientId, clientRole, removeClientId } = body;

    const targetUser = await db.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-role elevation or self-deactivation if last super admin
    if (targetUser.id === adminUser.id && ((role && role !== targetUser.role) || isActive === false)) {
      const superAdminsCount = await db.user.count({ where: { role: "SUPER_ADMIN", isActive: true } });
      if (superAdminsCount <= 1) {
        return NextResponse.json({ error: "Cannot modify last active SUPER_ADMIN" }, { status: 403 });
      }
    }

    const dataToUpdate: any = {};
    let shouldIncrementSessionVersion = false;

    if (role !== undefined && role !== targetUser.role) {
      dataToUpdate.role = normalizeRole(role);
      shouldIncrementSessionVersion = true;
    }

    if (isActive !== undefined && isActive !== targetUser.isActive) {
      dataToUpdate.isActive = isActive;
      shouldIncrementSessionVersion = true;
    }

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
      shouldIncrementSessionVersion = true;
    }

    if (revokeSessions) {
      shouldIncrementSessionVersion = true;
    }

    if (shouldIncrementSessionVersion) {
      dataToUpdate.sessionVersion = { increment: 1 };
    }

    const updatedUser = await db.user.update({
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
    });

    // Handle EmployeeProfile link/unlink
    if (employeeProfileId !== undefined) {
      if (employeeProfileId) {
        await (db as any).employeeProfile.update({
          where: { id: employeeProfileId },
          data: { userId: targetUserId }
        });
      } else {
        await (db as any).employeeProfile.updateMany({
          where: { userId: targetUserId },
          data: { userId: null }
        });
      }
    }

    // Handle ClientMembership addition/removal
    if (clientId) {
      await (db as any).clientMembership.upsert({
        where: {
          userId_clientId: {
            userId: targetUserId,
            clientId: clientId
          }
        },
        create: {
          userId: targetUserId,
          clientId: clientId,
          role: clientRole || 'MEMBER',
          isActive: true
        },
        update: {
          role: clientRole || 'MEMBER',
          isActive: true
        }
      });
    }

    if (removeClientId) {
      await (db as any).clientMembership.deleteMany({
        where: {
          userId: targetUserId,
          clientId: removeClientId
        }
      });
      // Increment session version so revoked client membership takes effect immediately
      await db.user.update({
        where: { id: targetUserId },
        data: { sessionVersion: { increment: 1 } }
      });
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    console.error("[USER_PATCH_ERROR]", error);
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
