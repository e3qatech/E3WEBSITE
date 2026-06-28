import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
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
