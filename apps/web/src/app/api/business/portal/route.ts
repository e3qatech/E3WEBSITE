import { NextResponse } from 'next/server';
import { requireClientOrganization, sanitizeLeadForClient } from '@/lib/server-auth';
import db from '@/lib/db';

export async function GET() {
  try {
    const { user, membership, client } = await requireClientOrganization();

    const organizationData = client || {
      id: 'org-default',
      company: 'E3 Enterprise Partner',
      type: 'B2B',
    };

    let members: any[] = [];
    if (client?.id) {
      members = await db.clientMembership.findMany({
        where: { clientId: client.id, isActive: true },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    const rawLeads = await db.lead.findMany({
      where: client?.company
        ? {
            OR: [
              { company: { equals: client.company, mode: 'insensitive' } },
              ...(user?.email ? [{ email: { equals: user.email, mode: 'insensitive' } }] : []),
            ],
          }
        : user?.email
        ? { email: { equals: user.email, mode: 'insensitive' } }
        : {},
      include: {
        inquiries: { orderBy: { createdAt: 'desc' } },
        activities: { orderBy: { timestamp: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rfps = (rawLeads || []).map(sanitizeLeadForClient);

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      membership: membership ? { id: membership.id, role: membership.role } : null,
      organization: organizationData,
      members,
      rfps,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
  }
}
