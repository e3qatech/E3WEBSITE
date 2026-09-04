import { NextResponse } from 'next/server';
import { requireClientOrganization, AppAuthError } from '@/lib/server-auth';
import db from '@/lib/db';

export async function PATCH(request: Request) {
  try {
    const { user, membership, client } = await requireClientOrganization();

    if (!client) {
      return NextResponse.json({ error: 'No active organization found' }, { status: 404 });
    }

    // Role guard: Only OWNER or ADMIN may update organizational details
    const role = (membership?.role || '').toUpperCase();
    const isAuthorized = role === 'OWNER' || role === 'ADMIN' || user.role === 'SUPER_ADMIN';

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden: You must be an organization Admin or Owner to modify credentials' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { company, industry, website } = body;

    const updated = await db.client.update({
      where: { id: client.id },
      data: {
        ...(company && typeof company === 'string' && company.trim() ? { company: company.trim() } : {}),
        ...(industry !== undefined ? { industry: typeof industry === 'string' ? industry.trim() : null } : {}),
        ...(website !== undefined ? { website: typeof website === 'string' ? website.trim() : null } : {}),
      },
    });

    return NextResponse.json({ success: true, client: updated });
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error updating client organization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
