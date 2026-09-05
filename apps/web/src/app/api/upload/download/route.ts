/**
 * Authenticated download proxy for private documents (RFPs and Candidate Resumes).
 *
 * - Strict role-based capability check: RFPs require canonical 'crm.rfp.documents.read' capability.
 * - Record-ID-only access for RFP proposals (direct pathname access to private_rfps/ is strictly forbidden).
 * - Authoritative state check: RFP records must be in purpose='B2B_RFP', status='ATTACHED', leadId!=null.
 * - Streams with Content-Disposition: attachment (never inline).
 * - Adds X-Content-Type-Options: nosniff and Cache-Control: private, no-store.
 */
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { hasPermission } from '@/lib/permissions';

const RESUME_ALLOWED_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
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
  const rawPathname = searchParams.get('pathname');

  // 1. Direct pathname targeting private_rfps/ is strictly rejected
  if (rawPathname && rawPathname.startsWith('private_rfps/')) {
    return NextResponse.json({ error: 'RFP documents must be accessed via uploadId' }, { status: 400 });
  }

  // 2. Handle RFP Proposal Download (Record-ID-Only)
  if (uploadId) {
    // Canonical Capability Check
    const hasRfpPermission = hasPermission(userRole, 'crm.rfp.documents.read');
    if (!hasRfpPermission) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges for B2B RFP documents' }, { status: 403 });
    }

    try {
      const rfpRecord = await (db as any).rfpUpload.findUnique({
        where: { id: uploadId },
      });

      if (!rfpRecord) {
        return NextResponse.json({ error: 'RFP document record not found' }, { status: 404 });
      }

      // Authoritative State Verification
      if (
        rfpRecord.purpose !== 'B2B_RFP' ||
        rfpRecord.status !== 'ATTACHED' ||
        !rfpRecord.leadId
      ) {
        return NextResponse.json({ error: 'RFP document is not available for download' }, { status: 404 });
      }

      const rfpToken = process.env.RFP_BLOB_READ_WRITE_TOKEN;
      const safeFilename = sanitizeFilename(rfpRecord.originalFileName || 'rfp_document');
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

      if (rfpToken) {
        const { get } = await import('@vercel/blob');
        const result = await get(rfpRecord.pathname, {
          access: 'private',
          token: rfpToken,
        } as any);

        if (!result || !result.stream) {
          return NextResponse.json({ error: 'File not found in secure storage' }, { status: 404 });
        }

        return new NextResponse(result.stream as any, {
          status: 200,
          headers: responseHeaders,
        });
      }

      // Local development fallback
      const filename = path.basename(rfpRecord.pathname);
      const localPath = path.join(process.cwd(), 'private', 'private_rfps', filename);
      try {
        const fileBuffer = await fs.readFile(localPath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: responseHeaders,
        });
      } catch {
        return NextResponse.json({ error: 'File not found in local storage' }, { status: 404 });
      }
    } catch (dbErr) {
      console.error('[Download RFP DB Error]', dbErr);
      return NextResponse.json({ error: 'Failed to retrieve RFP record' }, { status: 500 });
    }
  }

  const isInline = searchParams.get('inline') === '1' || searchParams.get('inline') === 'true';
  const applicationId = searchParams.get('applicationId');

  // 3. Handle Candidate Resume Download / Inline Preview
  let targetPathname = rawPathname;
  let customFilename = '';

  if (applicationId) {
    const isResumeAuthorized = (RESUME_ALLOWED_ROLES as readonly string[]).includes(userRole);
    if (!isResumeAuthorized) {
      return NextResponse.json({ error: 'Forbidden: Access denied to candidate documents' }, { status: 403 });
    }

    try {
      let app = await db.jobApplication.findUnique({
        where: { id: applicationId },
        select: { cvUrl: true, firstName: true, lastName: true, jobTitle: true },
      });

      if (app && app.cvUrl) {
        targetPathname = app.cvUrl;
        customFilename = `${app.firstName || ''}_${app.lastName || ''}_CV.pdf`.replace(/\s+/g, '_');
      } else {
        // Fallback to db.talent
        const talent = await db.talent.findUnique({
          where: { id: applicationId },
          select: { resumeUrl: true, name: true, position: true },
        });

        if (talent && talent.resumeUrl) {
          targetPathname = talent.resumeUrl;
          customFilename = `${talent.name.replace(/\s+/g, '_')}_CV.pdf`;
        } else {
          return NextResponse.json({ error: 'Candidate application or CV document not found' }, { status: 404 });
        }
      }
    } catch (_appErr) {
      return NextResponse.json({ error: 'Failed to resolve application document' }, { status: 500 });
    }
  }

  if (!targetPathname) {
    return NextResponse.json({ error: 'Missing document reference parameter' }, { status: 400 });
  }

  // Prevent path traversal
  if (targetPathname.includes('..') || targetPathname.includes('\0')) {
    return NextResponse.json({ error: 'Invalid document reference' }, { status: 400 });
  }

  // If candidate CV is an external URL, redirect directly to it
  if (targetPathname.startsWith('http://') || targetPathname.startsWith('https://')) {
    return NextResponse.redirect(targetPathname, { status: 307 });
  }

  const isResumeAuthorized = (RESUME_ALLOWED_ROLES as readonly string[]).includes(userRole);
  if (!isResumeAuthorized) {
    return NextResponse.json({ error: 'Forbidden: Access denied to candidate documents' }, { status: 403 });
  }

  try {
    const resumeToken = process.env.RESUME_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
    const safeFilename = sanitizeFilename(customFilename || path.basename(targetPathname));
    const isPdf = safeFilename.toLowerCase().endsWith('.pdf') || targetPathname.toLowerCase().endsWith('.pdf');

    const dispositionType = isInline ? 'inline' : 'attachment';
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', isPdf ? 'application/pdf' : 'application/octet-stream');
    responseHeaders.set('Content-Disposition', `${dispositionType}; filename="${safeFilename}"`);
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');

    if (isInline) {
      responseHeaders.set('X-Frame-Options', 'SAMEORIGIN');
    }

    if (resumeToken) {
      const { get } = await import('@vercel/blob');
      const result = await get(targetPathname, {
        access: 'private',
        token: resumeToken,
      } as any);

      if (!result || !result.stream) {
        return NextResponse.json({ error: 'File not found in secure storage' }, { status: 404 });
      }

      return new NextResponse(result.stream as any, {
        status: 200,
        headers: responseHeaders,
      });
    }

    const localPath = path.join(process.cwd(), 'private', 'private_resumes', path.basename(targetPathname));
    try {
      const fileBuffer = await fs.readFile(localPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: responseHeaders,
      });
    } catch {
      return NextResponse.json({ error: 'File not found in local storage' }, { status: 404 });
    }
  } catch (error) {
    console.error('[Download API Exception]', error);
    return NextResponse.json({ error: 'Internal document download error' }, { status: 500 });
  }
}
