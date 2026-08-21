/**
 * Authenticated download proxy for private documents (RFPs and Candidate Resumes).
 *
 * - Strict role-based access control per document purpose.
 * - RFPs require CRM_RFP_DOCUMENT_READ permission (SUPER_ADMIN, ADMIN, MARKETING_DIRECTOR, B2B_SALES_REP, SALES_ADMIN).
 * - STAFF, SUPPORT, and HR roles are strictly prohibited from downloading B2B RFP proposals.
 * - Streams with Content-Disposition: attachment (never inline)
 * - Sanitises filename; adds X-Content-Type-Options: nosniff and Cache-Control: private, no-store
 */
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { hasPermission } from '@/lib/permissions';

const RFP_ALLOWED_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'MARKETING_DIRECTOR',
  'B2B_SALES_REP',
  'SALES_ADMIN',
] as const;

const RESUME_ALLOWED_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'HR_MANAGER',
  'HR_ADMIN',
  'STAFF',
] as const;

function sanitizeFilename(raw: string): string {
  const basename = raw.replace(/\0/g, '').split(/[/\\]/).pop() || 'download';
  return basename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
  }

  const user = session.user as any;
  const userRole = user.role;

  const { searchParams } = new URL(req.url);
  const uploadId = searchParams.get('uploadId') || searchParams.get('id');
  let blobPathname = searchParams.get('pathname');
  let originalFilename = 'document';

  // 1. Authoritative RFP Upload ID resolution
  if (uploadId) {
    try {
      const rfpRecord = await (db as any).rfpUpload.findUnique({
        where: { id: uploadId },
      });

      if (!rfpRecord) {
        return NextResponse.json({ error: 'RFP document record not found' }, { status: 404 });
      }

      const isRfpAuthorized =
        (RFP_ALLOWED_ROLES as readonly string[]).includes(userRole) ||
        hasPermission(userRole, 'crm.leads.manage');

      if (!isRfpAuthorized) {
        return NextResponse.json({ error: 'Forbidden: Insufficient privileges to access RFP documents' }, { status: 403 });
      }

      blobPathname = rfpRecord.pathname;
      originalFilename = rfpRecord.originalFileName;
    } catch (_dbErr) {
      return NextResponse.json({ error: 'Failed to resolve document record' }, { status: 500 });
    }
  }

  if (!blobPathname) {
    return NextResponse.json({ error: 'Missing document reference parameter' }, { status: 400 });
  }

  // Prevent path traversal
  if (blobPathname.includes('..') || blobPathname.includes('\0')) {
    return NextResponse.json({ error: 'Invalid document reference' }, { status: 400 });
  }

  const isRfp = blobPathname.startsWith('private_rfps/') || Boolean(uploadId);

  // 2. Role Authorization Check
  if (isRfp) {
    const isRfpAuthorized =
      (RFP_ALLOWED_ROLES as readonly string[]).includes(userRole) ||
      hasPermission(userRole, 'crm.leads.manage');

    if (!isRfpAuthorized) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges for B2B RFP proposals' }, { status: 403 });
    }
  } else {
    // Resume document check
    const isResumeAuthorized = (RESUME_ALLOWED_ROLES as readonly string[]).includes(userRole);
    if (!isResumeAuthorized) {
      return NextResponse.json({ error: 'Forbidden: Access denied to candidate documents' }, { status: 403 });
    }
  }

  try {
    // 3. Storage Retrieval
    const storageToken = isRfp
      ? process.env.RFP_BLOB_READ_WRITE_TOKEN
      : (process.env.RESUME_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN);

    if (storageToken) {
      const { get } = await import('@vercel/blob');
      const result = await get(blobPathname, {
        access: 'private',
        token: storageToken,
      } as any);

      if (!result || !result.stream) {
        return NextResponse.json({ error: 'File not found in secure storage' }, { status: 404 });
      }

      const safeFilename = sanitizeFilename(originalFilename !== 'document' ? originalFilename : blobPathname);
      const isPdf = safeFilename.toLowerCase().endsWith('.pdf');
      const isDocx = safeFilename.toLowerCase().endsWith('.docx');
      const contentType = isPdf
        ? 'application/pdf'
        : isDocx
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/octet-stream';

      const responseHeaders = new Headers();
      responseHeaders.set('Content-Type', contentType);
      responseHeaders.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');

      return new NextResponse(result.stream as any, {
        status: 200,
        headers: responseHeaders,
      });
    }

    // Local development fallback from disk
    const filename = path.basename(blobPathname);
    const localDir = isRfp ? 'private_rfps' : 'private_resumes';
    const localPath = path.join(process.cwd(), 'private', localDir, filename);

    try {
      const fileBuffer = await fs.readFile(localPath);
      const safeFilename = sanitizeFilename(originalFilename !== 'document' ? originalFilename : filename);
      const isPdf = safeFilename.toLowerCase().endsWith('.pdf');

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': isPdf ? 'application/pdf' : 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${safeFilename}"`,
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
        },
      });
    } catch {
      return NextResponse.json({ error: 'File not found in local storage' }, { status: 404 });
    }

  } catch (error) {
    console.error('[Download API Exception]', error);
    return NextResponse.json({ error: 'Internal document download error' }, { status: 500 });
  }
}
