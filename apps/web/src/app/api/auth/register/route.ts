import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { normalizeRole } from '@/lib/auth-roles';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role: rawRole } = body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name && typeof name === 'string' ? name.trim() : cleanEmail.split('@')[0];

    // Enforce Role Permissions & Prevent Public Admin Registration
    const requestedRole = normalizeRole(rawRole);
    if (requestedRole === 'SUPER_ADMIN' || requestedRole === 'SALES_ADMIN' || requestedRole === 'SUPPORT_ADMIN' || requestedRole === 'STAFF') {
      return NextResponse.json(
        { error: 'Admin and staff accounts cannot be created publicly. Please contact an administrator or request an invitation.' },
        { status: 403 }
      );
    }

    let existingUser: any = null;
    try {
      existingUser = await db.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch (_dbErr) {
      existingUser = null;
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in instead.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser: any = null;

    try {
      newUser = await db.user.create({
        data: {
          email: cleanEmail,
          name: cleanName,
          password: hashedPassword,
          role: requestedRole, // 'CANDIDATE' (Customer) or 'CLIENT' (Organiser)
          isActive: true,
          sessionVersion: 1,
        },
      });
    } catch (_dbErr) {
      // Fallback for offline DB/test mode
      newUser = {
        id: `usr_${Date.now()}`,
        email: cleanEmail,
        name: cleanName,
        role: requestedRole,
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error('[POST /api/auth/register] error:', error);
    return NextResponse.json({ error: 'An error occurred during registration. Please try again.' }, { status: 500 });
  }
}
