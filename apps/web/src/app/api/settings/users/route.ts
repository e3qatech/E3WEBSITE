import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin, AppAuthError } from "@/lib/server-auth";
import { normalizeRole } from "@/lib/auth-roles";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await requireAdmin();

    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        sessionVersion: true,
        createdAt: true,
        employeeProfile: {
          select: { id: true, firstName: true, lastName: true, designation: true }
        },
        clientMemberships: {
          select: { id: true, clientId: true, role: true, client: { select: { company: true } } }
        },
        talentProfile: {
          select: { id: true, position: true, status: true }
        }
      }
    });

    return NextResponse.json(users);
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("[USERS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminUser = await requireAdmin();
    if (adminUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Forbidden: Only Super Admin can create/invite users" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, role, password, employeeProfileId, clientId, clientRole } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normRole = normalizeRole(role);
    const hashedPassword = await bcrypt.hash(password || "E3DefaultTemp2026!", 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        role: normRole,
        password: hashedPassword,
        isActive: true,
        sessionVersion: 1
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        sessionVersion: true,
        createdAt: true
      }
    });

    if (employeeProfileId && normRole === 'STAFF') {
      await (db as any).employeeProfile.update({
        where: { id: employeeProfileId },
        data: { userId: user.id }
      });
    }

    if (clientId && normRole === 'CLIENT') {
      await (db as any).clientMembership.create({
        data: {
          userId: user.id,
          clientId: clientId,
          role: clientRole || 'MEMBER',
          isActive: true
        }
      });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("[USERS_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
