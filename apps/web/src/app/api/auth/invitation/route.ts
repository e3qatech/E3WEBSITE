import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/server-auth';
import { normalizeRole } from '@/lib/auth-roles';
import crypto from 'crypto';

// POST /api/auth/invitation
// Handles both creating invitations (Admin) and accepting invitations (User)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, token, password, name, email, role, clientId, clientRole, employeeProfileId } = body;

    // Action 1: Accept single-use expiring invitation
    if (action === 'accept') {
      if (!token || !password) {
        return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
      }

      const invRecord = await (db as any).invitationToken.findUnique({
        where: { token: String(token).trim() }
      });

      if (!invRecord || invRecord.usedAt || invRecord.expiresAt < new Date()) {
        return NextResponse.json({ error: 'Invalid, expired, or already used invitation token' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user account
      const user = await db.user.create({
        data: {
          email: invRecord.email,
          name: name || invRecord.email.split('@')[0],
          password: hashedPassword,
          role: invRecord.role,
          isActive: true,
          sessionVersion: 1
        }
      });

      // Handle STAFF link
      if (invRecord.role === 'STAFF' && invRecord.employeeProfileId) {
        await (db as any).employeeProfile.update({
          where: { id: invRecord.employeeProfileId },
          data: { userId: user.id }
        });
      }

      // Handle CLIENT membership creation
      if (invRecord.role === 'CLIENT' && invRecord.clientId) {
        await (db as any).clientMembership.create({
          data: {
            userId: user.id,
            clientId: invRecord.clientId,
            role: invRecord.clientRole || 'MEMBER',
            isActive: true
          }
        });
      }

      // Mark token as used
      await (db as any).invitationToken.update({
        where: { id: invRecord.id },
        data: { usedAt: new Date() }
      });

      // Calculate localized portal login URL
      let portalLogin = '/en/login/admin';
      if (invRecord.role === 'STAFF') portalLogin = '/en/login/staff';
      if (invRecord.role === 'CLIENT') portalLogin = '/en/login/business';

      return NextResponse.json({
        success: true,
        message: 'Account setup complete. You may now log in.',
        redirectUrl: portalLogin
      });
    }

    // Action 2: Create invitation (Admin restricted)
    if (action === 'create') {
      const adminUser = await requireAdmin();

      if (!email || !role) {
        return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
      }

      const normRole = normalizeRole(role);
      const invTokenStr = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const invitation = await (db as any).invitationToken.create({
        data: {
          token: invTokenStr,
          email: email.trim().toLowerCase(),
          role: normRole,
          clientId: clientId || null,
          clientRole: clientRole || null,
          employeeProfileId: employeeProfileId || null,
          createdById: adminUser.id,
          expiresAt
        }
      });

      return NextResponse.json({
        success: true,
        data: invitation,
        invitationToken: invTokenStr,
        inviteUrl: `/en/auth/accept-invitation?token=${invTokenStr}`
      });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('[INVITATION_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
