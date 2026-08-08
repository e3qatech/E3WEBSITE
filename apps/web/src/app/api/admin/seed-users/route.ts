import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const secretPassword = body.password || "Password123!";
    const hashedPassword = await bcrypt.hash(secretPassword, 10);

    const seedUsersData = [
      {
        email: "admin@e3qatar.com",
        name: "System SuperAdmin",
        role: "SUPER_ADMIN",
      },
      {
        email: "sales@e3qatar.com",
        name: "Sales Director",
        role: "SALES_ADMIN",
      },
      {
        email: "support@e3qatar.com",
        name: "Support Manager",
        role: "SUPPORT_ADMIN",
      },
      {
        email: "staff@e3qatar.com",
        name: "Field Operations Staff",
        role: "STAFF",
      },
      {
        email: "client@e3qatar.com",
        name: "Corporate B2B Client",
        role: "CLIENT",
      },
      {
        email: "candidate@e3qatar.com",
        name: "Talent Applicant",
        role: "CANDIDATE",
      },
    ];

    const results = [];

    for (const u of seedUsersData) {
      const userModel = (db as any).user || (db as any).users;
      if (userModel) {
        const user = await userModel.upsert({
          where: { email: u.email },
          update: {
            password: hashedPassword,
            role: u.role,
            isActive: true,
          },
          create: {
            email: u.email,
            name: u.name,
            password: hashedPassword,
            role: u.role,
            isActive: true,
          },
        });
        results.push({ email: u.email, role: u.role, password: secretPassword, id: user.id });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Seeded test users for all 6 roles successfully.",
      users: results,
    });
  } catch (error: any) {
    console.error("[SEED_USERS_ERROR]", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
