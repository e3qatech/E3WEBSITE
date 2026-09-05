import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireCurrentUser, AppAuthError } from "@/lib/server-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { normalizeRole } from "@/lib/auth-roles";

const createUserSchema = z.object({
  name: z.string().max(100).optional().nullable(),
  email: z.string().email("Valid email address is required").max(255),
  password: z.string().min(8, "Password must be at least 8 characters long").optional().nullable(),
  role: z.string().min(1, "Role is required"),
}).strict();

export async function GET(request: Request) {
  try {
    const user = await requireCurrentUser();
    const isAuthorized =
      user.role === "SUPER_ADMIN" ||
      user.permissions.includes("rbac.manage") ||
      user.permissions.includes("crm.leads.manage") ||
      user.permissions.includes("*");

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: Insufficient permissions to view users directory" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawSearch = searchParams.get("search") || "";
    const rawRole = searchParams.get("role") || "";

    // Sanitize search string against improper injections
    const search = rawSearch.trim().slice(0, 100);
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (rawRole && rawRole !== "ALL") {
      where.role = normalizeRole(rawRole);
    }

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        sessionVersion: true,
        createdAt: true,
        updatedAt: true,
        clientMemberships: {
          select: {
            id: true,
            role: true,
            clientId: true,
            client: {
              select: {
                id: true,
                company: true,
              },
            },
          },
        },
      },
      take: 100,
    });

    return NextResponse.json(users);
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const isAuthorized =
      user.role === "SUPER_ADMIN" ||
      user.permissions.includes("rbac.manage") ||
      user.permissions.includes("*");

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin and RBAC managers can create user accounts" },
        { status: 403 }
      );
    }

    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    // Prototype pollution defense
    if (
      Object.prototype.hasOwnProperty.call(rawBody, "__proto__") ||
      Object.prototype.hasOwnProperty.call(rawBody, "constructor") ||
      Object.prototype.hasOwnProperty.call(rawBody, "prototype")
    ) {
      return NextResponse.json({ error: "Malformed request payload" }, { status: 400 });
    }

    const parseResult = createUserSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();
    const normalizedTargetRole = normalizeRole(role);

    // Privilege escalation protection: Only Super Admin can create Super Admin accounts
    const isCallerSuperAdmin = user.role === "SUPER_ADMIN" || user.permissions.includes("*");
    if (normalizedTargetRole === "SUPER_ADMIN" && !isCallerSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin can create Super Admin accounts" },
        { status: 403 }
      );
    }

    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const newUser = await db.user.create({
      data: {
        name: name?.trim() || null,
        email: cleanEmail,
        password: hashedPassword,
        role: normalizedTargetRole,
        isActive: true,
        sessionVersion: 1,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        sessionVersion: true,
        createdAt: true,
      },
    });

    // Record audit log
    try {
      await db.systemLog.create({
        data: {
          action: "USER_CREATED",
          entity: "User",
          entityId: newUser.id,
          userId: user.id,
          metadata: {
            createdEmail: newUser.email,
            createdRole: newUser.role,
          },
        },
      });
    } catch (_auditErr) {
      // Non-blocking
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status });
  }
}
