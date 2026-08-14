/**
 * Gate 05F: Authenticated download proxy for private resume blobs.
 *
 * - Requires active user session with SUPER_ADMIN, STAFF, or SALES_ADMIN role
 * - Retrieves private blob server-side via @vercel/blob get()
 * - Streams with Content-Disposition: attachment (never inline)
 * - Sanitises filename; adds X-Content-Type-Options: nosniff
 *
 * In local development (no BLOB_READ_WRITE_TOKEN), serves from private/uploads/.
 */
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { isAdminRole } from '@/lib/auth-roles';

const ALLOWED_DOWNLOAD_ROLES = ['SUPER_ADMIN', 'STAFF', 'SALES_ADMIN', 'SUPPORT_ADMIN', 'HR_ADMIN'] as const;

function sanitizeFilename(raw: string): string {
  const basename = raw.replace(/\0/g, '').split(/[/\\]/).pop() || 'download';
  return basename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any;
  const isPrivileged = ALLOWED_DOWNLOAD_ROLES.includes(user.role) || isAdminRole(user.role);

  // 2. Get the pathname from query
  const { searchParams } = new URL(req.url);
  const blobPathname = searchParams.get('pathname');
  if (!blobPathname) {
    return NextResponse.json(
      { error: 'Missing pathname parameter' },
      { status: 400 }
    );
  }

  // Prevent path traversal
  if (blobPathname.includes('..') || blobPathname.includes('\0')) {
    return NextResponse.json({ error: 'Invalid pathname' }, { status: 400 });
  }

  // Enforce candidate ownership if not an admin/staff role
  if (!isPrivileged) {
    if (user.role === 'CANDIDATE' as any) {
      const ownsApplication = await db.jobApplication.findFirst({
        where: {
          cvUrl: { contains: blobPathname },
          OR: [
            { userId: user.id },
            ...(user.email ? [{ email: user.email }] : [])
          ]
        }
      });

      let ownsTalent = false;
      try {
        if ((db as any).talent) {
          const t = await (db as any).talent.findFirst({
            where: {
              resumeUrl: { contains: blobPathname },
              ...(user.email ? { email: user.email } : {})
            }
          });
          ownsTalent = Boolean(t);
        }
      } catch (_tErr) {
        ownsTalent = false;
      }

      if (!ownsApplication && !ownsTalent) {
        return NextResponse.json({ error: 'Forbidden: Access denied to other candidate documents' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  try {
    // 3a. Vercel Blob private retrieval (production)
    if (process.env.RESUME_BLOB_READ_WRITE_TOKEN) {
      // Dynamic import to avoid build errors when @vercel/blob is not configured
      const { get } = await import('@vercel/blob');
      const result = await get(blobPathname, { 
        access: 'private',
        token: process.env.RESUME_BLOB_READ_WRITE_TOKEN 
      } as any);

      if (!result) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      const filename = sanitizeFilename(
        blobPathname.split('/').pop() || 'resume'
      );

      // Stream the blob content
      const response = new Response((result as any).stream || (result as any).body, {
        headers: {
          'Content-Type':
            (result as any).contentType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'private, no-store',
        },
      });
      return response;
    }

    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Resume storage is unconfigured' }, { status: 503 });
    }

    // 3b. Local development fallback — serve from private/uploads/
    const filename = sanitizeFilename(
      blobPathname.split('/').pop() || 'resume'
    );
    const localPath = path.join(process.cwd(), 'private', 'uploads', filename);
    const fileBuffer = await fs.readFile(localPath);

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error: any) {
    console.error('[DOWNLOAD_PROXY]', error?.message);
    return NextResponse.json(
      { error: 'File not found or access denied' },
      { status: 404 }
    );
  }
}
