import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireCurrentUser } from '@/lib/server-auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const currentUser = await requireCurrentUser();
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: currentUser.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    // Verify current password if user has a password set
    if (user.password) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
      }
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const newVersion = (user.sessionVersion || 1) + 1;

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        sessionVersion: newVersion
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. Older sessions have been revoked.'
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status });
  }
}
