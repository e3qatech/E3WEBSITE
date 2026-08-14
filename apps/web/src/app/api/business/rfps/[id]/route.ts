import { NextResponse } from 'next/server';
import { requireClientRfpAccess } from '@/lib/server-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { lead, client, membership } = await requireClientRfpAccess(id);

    return NextResponse.json({
      success: true,
      rfp: lead,
      organization: client,
      membership: membership ? { role: membership.role } : null,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
  }
}
