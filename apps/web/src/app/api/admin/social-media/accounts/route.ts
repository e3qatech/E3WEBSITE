import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const accounts = await db.socialAccount.findMany({
      include: {
        providerConfig: {
          select: { name: true, provider: true, enabled: true },
        },
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const sanitized = accounts.map((a: any) => ({
      ...a,
      encryptedAccessToken: undefined,
      encryptedRefreshToken: undefined,
      hasToken: Boolean(a.encryptedAccessToken),
      hasRefreshToken: Boolean(a.encryptedRefreshToken),
    }));

    return NextResponse.json({ success: true, data: sanitized });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, internalName, username, displayName, profileUrl, profileImageUrl, brandId, attractionId, portal } = body;

    const providerConfig = await db.socialProviderConfig.findUnique({
      where: { provider },
    });

    if (!providerConfig) {
      return NextResponse.json({ success: false, error: `Provider configuration for ${provider} does not exist.` }, { status: 400 });
    }

    const providerAccountId = `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const account = await db.socialAccount.create({
      data: {
        providerConfigId: providerConfig.id,
        provider,
        providerAccountId,
        internalName: internalName || `${providerConfig.name}: @${username || 'e3qatar'}`,
        username: username || 'e3qatar',
        displayName: displayName || 'E3 Qatar Official',
        profileUrl: profileUrl || `https://social.e3.qa/${username}`,
        profileImageUrl: profileImageUrl || undefined,
        brandId: brandId || undefined,
        attractionId: attractionId || undefined,
        portal: portal || 'SHARED',
        status: 'CONNECTED',
      },
    });

    await db.socialAuditLog.create({
      data: {
        action: 'ACCOUNT_CONNECT',
        targetType: 'SOCIAL_ACCOUNT',
        targetId: account.id,
        summary: `Created account record ${account.internalName}`,
      },
    });

    return NextResponse.json({ success: true, data: account });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, internalName, brandId, attractionId, portal, autoSyncEnabled, defaultModeration, defaultVisibility, isActive, internalNotes, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Account ID is required.' }, { status: 400 });
    }

    const updated = await db.socialAccount.update({
      where: { id },
      data: {
        ...(internalName !== undefined && { internalName }),
        ...(brandId !== undefined && { brandId: brandId || null }),
        ...(attractionId !== undefined && { attractionId: attractionId || null }),
        ...(portal !== undefined && { portal }),
        ...(autoSyncEnabled !== undefined && { autoSyncEnabled }),
        ...(defaultModeration !== undefined && { defaultModeration }),
        ...(defaultVisibility !== undefined && { defaultVisibility }),
        ...(isActive !== undefined && { isActive }),
        ...(internalNotes !== undefined && { internalNotes }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Account ID is required.' }, { status: 400 });
    }

    await db.socialAccount.delete({
      where: { id },
    });

    await db.socialAuditLog.create({
      data: {
        action: 'ACCOUNT_DISCONNECT',
        targetType: 'SOCIAL_ACCOUNT',
        targetId: id,
        summary: `Disconnected social account ID ${id}`,
      },
    });

    return NextResponse.json({ success: true, message: 'Account disconnected successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
