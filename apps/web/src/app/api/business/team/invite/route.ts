import { NextResponse } from 'next/server';
import { requireClientOrganization, AppAuthError } from '@/lib/server-auth';
import db from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { user, membership, client } = await requireClientOrganization();

    if (!client) {
      return NextResponse.json({ error: 'No active organization found' }, { status: 404 });
    }

    // Role check: Only OWNER or ADMIN may invite colleagues
    const role = (membership?.role || '').toUpperCase();
    const isAuthorized = role === 'OWNER' || role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden: You must be an organization Admin or Owner to invite team members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, clientRole } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user is already a member
    const existingUser = await db.user.findUnique({
      where: { email: cleanEmail },
      include: {
        clientMemberships: {
          where: { clientId: client.id, isActive: true },
        },
      },
    });

    if (existingUser && existingUser.clientMemberships && existingUser.clientMemberships.length > 0) {
      return NextResponse.json(
        { error: 'This user is already an active member of your organization' },
        { status: 409 }
      );
    }

    const invTokenStr = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await (db as any).invitationToken.create({
      data: {
        token: invTokenStr,
        email: cleanEmail,
        role: 'CLIENT',
        clientId: client.id,
        clientRole: clientRole || 'MEMBER',
        createdById: user.id,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      data: invitation,
      inviteUrl: `/en/auth/accept-invitation?token=${invTokenStr}`,
    });
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error inviting client team member:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
