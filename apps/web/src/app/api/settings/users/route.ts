import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole, AuthError } from "@/lib/server-auth"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function GET() {
  try {
    await requireRole(["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"])

    const users = await db.users.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json(users)
  } catch (error: any) {
    console.error("[USERS_GET_ERROR]", error)
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN", "SUPPORT_ADMIN"])

    const body = await request.json()
    const { name, email, role } = body

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const rawPassword = crypto.randomBytes(16).toString('hex')
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    const user = await db.users.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json({ ...user, tempPassword: rawPassword })
  } catch (error: any) {
    console.error("[USERS_POST_ERROR]", error)
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
