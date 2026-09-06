import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { checkInfluencerAuth } from '@/lib/influencer/auth-check';
import { validateCreatorToken } from '@/lib/influencer/tokens';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params;

  // 1. Fetch document record
  const doc = await (db as any).influencerDocument.findUnique({
    where: { id: documentId },
    include: {
      influencer: true,
    },
  });

  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  // 2. Authorization check: Staff RBAC or Creator Portal Token
  let isAuthorized = false;

  // Check Staff session
  const requiredCap = doc.documentType === 'COMMERCIAL_AGREEMENT' || doc.documentType === 'INVOICE' || doc.documentType === 'RATE_CARD'
    ? 'influencer.viewCommercial'
    : 'influencer.viewSensitive';

  const staffAuth = await checkInfluencerAuth(req, requiredCap);
  if (staffAuth.isAuthed) {
    isAuthorized = true;
  } else {
    // If not staff, check Creator Token
    const tokenHeader = req.headers.get('x-creator-token') || req.headers.get('authorization')?.replace('Bearer ', '');
    if (tokenHeader) {
      const tokenVal = await validateCreatorToken(tokenHeader);
      if (tokenVal.isValid && tokenVal.tokenRecord?.influencerId === doc.influencerId) {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Forbidden: You do not have permission to download this sensitive document' },
      { status: 403 }
    );
  }

  // 3. Document download response with strict security headers
  const assetId = doc.mediaAssetId;
  const filename = `influencer-doc-${doc.documentType.toLowerCase()}-${doc.id.substring(0, 8)}.pdf`;

  // Return protected asset redirect or attachment
  return NextResponse.json({
    documentId: doc.id,
    documentType: doc.documentType,
    mediaAssetId: assetId,
    filename,
    downloadUrl: `/api/media/${assetId}`,
    isSensitive: doc.isSensitive,
  }, {
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
