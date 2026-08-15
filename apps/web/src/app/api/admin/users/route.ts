import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireCurrentUser, AppAuthError } from "@/lib/server-auth";
import bcrypt from "bcryptjs";

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
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
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

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const newUser = await db.user.create({
      data: {
        name: name?.trim() || null,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role as any,
        isActive: true,
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

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status });
  }
}
