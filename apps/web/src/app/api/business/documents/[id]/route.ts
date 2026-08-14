import { NextResponse } from 'next/server';
import { requireClientOrganization, requireCurrentUser, AppAuthError } from '@/lib/server-auth';
import { isAdminRole, isStaffRole } from '@/lib/auth-roles';
import db from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireCurrentUser();
    const isPrivileged = isAdminRole(user.role) || isStaffRole(user.role);

    // If caller is regular CLIENT, enforce active organization membership
    if (!isPrivileged) {
      const { client } = await requireClientOrganization();
      if (!client) {
        throw new AppAuthError(403, "Forbidden: No verified organization membership");
      }
    }

    // Check if document exists as Media or Lead attachment
    const media = await db.media.findUnique({
      where: { id },
    });

    if (media) {
      return NextResponse.json({
        success: true,
        document: {
          id: media.id,
          url: media.url,
          mimeType: media.mimeType,
          size: media.size,
          alt: media.alt,
          createdAt: media.createdAt,
        },
      });
    }

    // If id is an RFP lead ID, generate document metadata for that RFP
    const lead = await db.lead.findUnique({
      where: { id },
    });

    if (lead) {
      if (!isPrivileged) {
        const { client } = await requireClientOrganization();
        if (client.company.toLowerCase() !== (lead.company || '').toLowerCase() && user.email !== lead.email) {
          throw new AppAuthError(404, "Document not found or access denied");
        }
      }

      return NextResponse.json({
        success: true,
        document: {
          id: lead.id,
          title: `RFP-Specification-${lead.id.slice(-6).toUpperCase()}.pdf`,
          company: lead.company,
          status: lead.status,
          generatedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
  }
}
