import { NextResponse } from "next/server";
import { auth } from '@/lib/auth';
import prisma from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== 'SUPER_ADMIN' && (session.user as any).role !== 'SALES_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const employee = await prisma.employeeProfile.create({
      data: { ...data }
    });
    return NextResponse.json(employee);
  } catch (error: any) {
    console.error("Failed to create employee:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
