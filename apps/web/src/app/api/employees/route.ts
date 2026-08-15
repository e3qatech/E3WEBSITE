import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { isTeamAuthorized } from "@/lib/team/team-resolver";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  if (!isTeamAuthorized((session.user as any)?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await req.json();
    const employee = await prisma.employeeProfile.create({
      data: {
        ...data,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : false,
      },
    });
    return NextResponse.json(employee, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create employee:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
