import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireCurrentUser, AppAuthError } from "@/lib/server-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { normalizeRole } from "@/lib/auth-roles";

const patchUserSchema = z.object({
  name: z.string().max(100).optional().nullable(),
  email: z.string().email("Invalid email address format").max(255).optional(),
  role: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8, "Password must be at least 8 characters long").optional(),
  revokeSessions: z.boolean().optional(),
}).strict();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCurrentUser();
    const isAuthorized =
      user.role === "SUPER_ADMIN" ||
      user.permissions.includes("rbac.manage") ||
      user.permissions.includes("*");

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin and RBAC managers can update user credentials or roles" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    // Reject prototype pollution attempts
    if (
      Object.prototype.hasOwnProperty.call(rawBody, "__proto__") ||
      Object.prototype.hasOwnProperty.call(rawBody, "constructor") ||
      Object.prototype.hasOwnProperty.call(rawBody, "prototype")
    ) {
      return NextResponse.json({ error: "Malformed request payload" }, { status: 400 });
    }

    const parseResult = patchUserSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { name, email, role, isActive, password, revokeSessions } = parseResult.data;

    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isCallerSuperAdmin = user.role === "SUPER_ADMIN" || user.permissions.includes("*");

    // Privilege escalation protection: Non-superadmins cannot modify Super Admins
    if (!isCallerSuperAdmin && existingUser.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin can modify another Super Admin account" },
        { status: 403 }
      );
    }

    // Privilege escalation protection: Non-superadmins cannot promote anyone to Super Admin
    if (role && normalizeRole(role) === "SUPER_ADMIN" && !isCallerSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin can assign the Super Admin role" },
        { status: 403 }
      );
    }

    // Prevent self-role demotion or self-freeze if last active Super Admin
    if (existingUser.id === user.id && ((role && normalizeRole(role) !== "SUPER_ADMIN") || isActive === false)) {
      const superAdminsCount = await db.user.count({ where: { role: "SUPER_ADMIN", isActive: true } });
      if (superAdminsCount <= 1) {
        return NextResponse.json(
          { error: "Forbidden: Cannot demote or freeze the last remaining active Super Admin account" },
          { status: 403 }
        );
      }
    }

    const data: any = {};

    if (name !== undefined) {
      data.name = name ? String(name).trim() : null;
    }

    if (email !== undefined && email.toLowerCase().trim() !== existingUser.email?.toLowerCase().trim()) {
      const cleanEmail = email.toLowerCase().trim();
      const duplicate = await db.user.findUnique({ where: { email: cleanEmail } });
      if (duplicate && duplicate.id !== id) {
        return NextResponse.json({ error: "An account with this email address already exists" }, { status: 409 });
      }
      data.email = cleanEmail;
    }

    if (role !== undefined) {
      data.role = normalizeRole(role);
    }

    if (isActive !== undefined) {
      const newActive = Boolean(isActive);
      data.isActive = newActive;
      // Freezing account automatically increments sessionVersion to revoke all active tokens immediately
      if (!newActive) {
        data.sessionVersion = (existingUser.sessionVersion || 1) + 1;
      }
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10);
      data.sessionVersion = (existingUser.sessionVersion || 1) + 1;
    }

    if (revokeSessions && !data.sessionVersion) {
      data.sessionVersion = (existingUser.sessionVersion || 1) + 1;
    }

    const updatedUser = await db.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        sessionVersion: true,
        updatedAt: true,
      },
    });

    // Record audit telemetry
    try {
      let auditAction = "USER_UPDATED";
      if (isActive === false && existingUser.isActive === true) auditAction = "USER_FROZEN";
      if (isActive === true && existingUser.isActive === false) auditAction = "USER_UNFROZEN";
      if (password) auditAction = "USER_PASSWORD_RESET_ADMIN";

      await db.systemLog.create({
        data: {
          action: auditAction,
          entity: "User",
          entityId: id,
          userId: user.id,
          metadata: {
            targetEmail: updatedUser.email,
            targetRole: updatedUser.role,
            isActive: updatedUser.isActive,
            sessionVersion: updatedUser.sessionVersion,
          },
        },
      });
    } catch (_auditErr) {
      // Non-blocking audit failure
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireCurrentUser();
    const isAuthorized =
      currentUser.role === "SUPER_ADMIN" ||
      currentUser.permissions.includes("rbac.manage") ||
      currentUser.permissions.includes("*");

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin and RBAC managers can delete user accounts" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Guard against self-deletion
    if (existingUser.id === currentUser.id) {
      return NextResponse.json(
        { error: "Forbidden: You cannot delete your own active account" },
        { status: 403 }
      );
    }

    const isCallerSuperAdmin = currentUser.role === "SUPER_ADMIN" || currentUser.permissions.includes("*");

    // 2. Guard against non-superadmin deleting a Super Admin
    if (existingUser.role === "SUPER_ADMIN" && !isCallerSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only a Super Admin can delete a Super Admin account" },
        { status: 403 }
      );
    }

    // 3. Guard against deleting the last remaining Super Admin
    if (existingUser.role === "SUPER_ADMIN") {
      const superAdminsCount = await db.user.count({ where: { role: "SUPER_ADMIN" } });
      if (superAdminsCount <= 1) {
        return NextResponse.json(
          { error: "Forbidden: Cannot delete the only remaining Super Admin account" },
          { status: 403 }
        );
      }
    }

    // 4. Atomic deletion with foreign key safety cleanup
    await (db as any).$transaction(async (tx: any) => {
      // Cascade-delete dependent authentication & membership records
      await tx.account.deleteMany({ where: { userId: id } });
      await tx.session.deleteMany({ where: { userId: id } });
      await tx.clientMembership.deleteMany({ where: { userId: id } });

      // Unlink optional user foreign keys
      await tx.systemLog.updateMany({ where: { userId: id }, data: { userId: null } });
      await tx.jobApplication.updateMany({ where: { userId: id }, data: { userId: null } });
      await tx.packageLead.updateMany({ where: { assignedToId: id }, data: { assignedToId: null } });
      await tx.invitationToken.deleteMany({ where: { createdById: id } });

      // Clean verification tokens matching user email
      if (existingUser.email) {
        await tx.verificationToken.deleteMany({
          where: { identifier: { contains: existingUser.email } },
        });
      }

      // Finally delete the user record
      await tx.user.delete({ where: { id } });
    });

    // 5. Record audit telemetry
    try {
      await db.systemLog.create({
        data: {
          action: "USER_DELETED",
          entity: "User",
          entityId: id,
          userId: currentUser.id,
          metadata: {
            deletedEmail: existingUser.email,
            deletedName: existingUser.name,
            deletedRole: existingUser.role,
          },
        },
      });
    } catch (_auditErr) {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: `User account ${existingUser.email} has been permanently deleted.`,
      id,
    });
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("[DELETE /api/admin/users/[id]] Error:", error?.message || error);
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Failed to delete user account" }, { status });
  }
}
