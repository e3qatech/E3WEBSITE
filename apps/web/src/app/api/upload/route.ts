import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { randomUUID } from "crypto";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { isValidMagicBytes, isValidDocxOoxml } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";
import db from "@/lib/db";

const CMS_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const RESUME_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const RFP_MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'avif',
  'mp4', 'webm', 'mov',
  'pdf', 'docx',
  'glb', 'gltf'
];
const RESUME_EXTENSIONS = ['pdf', 'docx'];
const RFP_EXTENSIONS = ['pdf', 'docx'];

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/svg',
  'video/mp4', 'video/webm', 'video/quicktime',
  'application/pdf', 'application/x-pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'model/gltf-binary', 'model/gltf+json',
  'application/octet-stream', 'text/xml', 'application/xml'
];
const RESUME_TYPES = [
  'application/pdf', 'application/x-pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream'
];

const KNOWN_CONTEXTS = [
  'public_resume',
  'public_rfp',
  'public_attachment',
  'cms_media',
  'brand_logo',
  'general_upload',
] as const;

async function checkUploadAuth(context?: string | null): Promise<boolean> {
  // 1. Strictly enumerated public upload contexts do not require session auth
  if (context === 'public_resume' || context === 'public_rfp' || context === 'public_attachment') {
    return true;
  }

  // 2. Private/CMS upload contexts require a valid, verified server session
  try {
    const session = await auth();
    if (!session?.user) return false;

    const userRole = (session.user as any)?.role;
    if (!userRole) return false;

    // Direct role allowlist for all admin/staff roles
    const adminRoles = [
      'SUPER_ADMIN',
      'ADMIN',
      'SUPPORT_ADMIN',
      'SALES_ADMIN',
      'B2C_ADMIN',
      'B2B_ADMIN',
      'HR_ADMIN',
      'OPERATIONS_ADMIN',
      'MARKETING_DIRECTOR',
      'STAFF'
    ];

    if (adminRoles.includes(userRole)) {
      return true;
    }

    return (
      hasPermission(userRole, 'media.write') ||
      hasPermission(userRole, 'media.read') ||
      hasPermission(userRole, 'b2c.content.write') ||
      hasPermission(userRole, 'b2c.attractions.manage') ||
      hasPermission(userRole, 'b2b.content.write')
    );
  } catch (e) {
    console.error('[Upload Auth Exception]', e);
    return false;
  }
}

/**
 * Cleanup expired unattached RFP documents and orphaned storage blobs.
 * Never deletes ATTACHED records.
 */
export async function cleanupExpiredUnattachedRfps(): Promise<{ deletedCount: number }> {
  const rfpToken = process.env.RFP_BLOB_READ_WRITE_TOKEN;
  if (!rfpToken) return { deletedCount: 0 };

  try {
    const expiredUploads = await (db as any).rfpUpload.findMany({
      where: {
        purpose: 'B2B_RFP',
        status: { in: ['INITIATED', 'VALIDATING', 'VALIDATED', 'EXPIRED'] },
        leadId: null,
        expiresAt: { lt: new Date() },
      },
      select: { id: true, pathname: true },
      take: 50,
    });

    if (!expiredUploads || expiredUploads.length === 0) return { deletedCount: 0 };

    let deletedCount = 0;
    for (const item of expiredUploads) {
      try {
        if (item.pathname) {
          await del(item.pathname, { token: rfpToken });
        }
        await (db as any).rfpUpload.delete({ where: { id: item.id } });
        deletedCount++;
      } catch (_delErr) {
        // Continue to next item
      }
    }

    return { deletedCount };
  } catch (err) {
    console.error('[CLEANUP_EXPIRED_RFPS_ERROR]', err);
    return { deletedCount: 0 };
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown_ip";
  const contentType = request.headers.get("content-type") || "";

  // 1. Handle Vercel Blob client token generation (JSON request)
  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as HandleUploadBody;
      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          let context: string | null = null;
          if (clientPayload) {
            try { context = JSON.parse(clientPayload).context; } catch {}
          }

          // Strict rejection: B2B RFP uploads MUST use the direct FormData workflow
          if (context === 'public_rfp') {
            throw new Error("RFP uploads must use direct multipart form upload workflow");
          }

          if (context && !(KNOWN_CONTEXTS as readonly string[]).includes(context)) {
            throw new Error("Invalid upload context");
          }

          const isAuthed = await checkUploadAuth(context);
          if (!isAuthed) {
            throw new Error("Unauthorized");
          }

          if (context === 'public_resume' || context === 'public_attachment') {
            const rl = await rateLimit(`rate_limit:upload:${ip}`, 5, 60, false);
            if (!rl.success) throw new Error(rl.error);
          }

          let maxSize = CMS_MAX_FILE_SIZE;
          let allowedTypes = ALLOWED_TYPES;

          if (context === 'public_resume' || context === 'public_attachment') {
            maxSize = RESUME_MAX_FILE_SIZE;
            allowedTypes = RESUME_TYPES;
          }

          return {
            allowedContentTypes: allowedTypes,
            maximumSizeInBytes: maxSize,
            tokenPayload: JSON.stringify({ userId: 'cms_admin', context }),
          };
        },
        onUploadCompleted: async ({ blob }) => {
          console.log("[Blob Upload Completed]", blob.pathname);
        },
      });
      return NextResponse.json(jsonResponse);
    } catch (error) {
      console.error('[Upload Token Error]', error);
      return NextResponse.json({ success: false, error: 'Upload authorization failed' }, { status: 400 });
    }
  }

  // 2. Handle Direct FormData file uploads
  try {
    const data = await request.formData();
    const context = data.get('context') as string | null;

    // Validate upload context against strict allowlist
    if (context && !(KNOWN_CONTEXTS as readonly string[]).includes(context)) {
      return NextResponse.json({ success: false, error: 'Unknown upload context' }, { status: 400 });
    }

    const isAuthed = await checkUploadAuth(context);
    const isPublicResume = context === 'public_resume';
    const isPublicRfp = context === 'public_rfp';
    const isPublicAttachment = context === 'public_attachment';

    if (!isAuthed && !isPublicResume && !isPublicRfp && !isPublicAttachment) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    if (isPublicResume || isPublicRfp || isPublicAttachment) {
      const rl = await rateLimit(`rate_limit:upload:${ip}`, 5, 60, false);
      if (!rl.success) return NextResponse.json({ success: false, error: rl.error }, { status: 429 });
    }

    const file: File | null = data.get('file') as unknown as File;
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    let maxSize = CMS_MAX_FILE_SIZE;
    let validExtensions = ALLOWED_EXTENSIONS;

    if (isPublicResume || isPublicAttachment) {
      maxSize = RESUME_MAX_FILE_SIZE;
      validExtensions = RESUME_EXTENSIONS;
    } else if (isPublicRfp) {
      maxSize = RFP_MAX_FILE_SIZE;
      validExtensions = RFP_EXTENSIONS;
    }

    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: `File size exceeds limit of ${Math.round(maxSize / (1024 * 1024))}MB`,
      }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isAllowedExt = validExtensions.includes(ext);

    if (!isAllowedExt) {
      return NextResponse.json({
        success: false,
        error: `Invalid file extension .${ext}. Allowed: ${validExtensions.join(', ')}`,
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength !== file.size) {
      return NextResponse.json({ success: false, error: 'Streamed byte length mismatch' }, { status: 400 });
    }

    if (!isValidMagicBytes(buffer, ext) || (ext === 'docx' && !isValidDocxOoxml(buffer))) {
      return NextResponse.json({ success: false, error: 'Invalid file signature or corrupted document structure' }, { status: 400 });
    }

    // Force unique randomized naming with UUID
    const fileName = `${randomUUID()}.${ext || 'bin'}`;

    // Dedicated Storage Token Resolution
    if (isPublicRfp) {
      const rfpToken = process.env.RFP_BLOB_READ_WRITE_TOKEN;
      if (!rfpToken) {
        const correlationId = randomUUID();
        console.error(`[RFP_STORAGE_CONFIG_ERROR] Correlation ID: ${correlationId} - RFP_BLOB_READ_WRITE_TOKEN is unconfigured.`);
        return NextResponse.json({
          success: false,
          code: "RFP_STORAGE_UNAVAILABLE",
          error: "Document upload is temporarily unavailable.",
        }, { status: 503 });
      }

      // Generate single-use cryptographic claim credential
      const rawClaimToken = crypto.randomBytes(32).toString('hex');
      const claimTokenHash = crypto.createHash('sha256').update(rawClaimToken).digest('hex');

      let uploadedBlobPathname: string | null = null;

      try {
        const blob = await put(`private_rfps/${fileName}`, file, {
          access: 'private',
          contentType: ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          token: rfpToken,
        });
        uploadedBlobPathname = blob.pathname;

        const safeOriginalName = (file.name || 'rfp_document')
          .replace(/\0/g, '')
          .split(/[/\\]/).pop()
          ?.replace(/[^a-zA-Z0-9._-]/g, '_')
          .substring(0, 255) || 'rfp_document';

        // Persist upload state in database
        const uploadRecord = await (db as any).rfpUpload.create({
          data: {
            purpose: 'B2B_RFP',
            pathname: blob.pathname,
            originalFileName: safeOriginalName,
            mimeType: file.type || (ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
            fileSize: buffer.byteLength,
            claimTokenHash,
            status: 'VALIDATED',
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours expiry
          },
        });

        const headers: Record<string, string> = {
          'X-Upload-Status': 'validated',
          'X-Content-Type-Options': 'nosniff',
        };

        // Return opaque upload ID + single-use claim token — NEVER expose Blob URL or pathname
        return NextResponse.json({
          success: true,
          uploadId: uploadRecord.id,
          claimToken: rawClaimToken,
          fileName: safeOriginalName,
          fileSize: buffer.byteLength,
          status: 'VALIDATED',
        }, { headers });

      } catch (blobError) {
        // Storage Failure Cleanup: If Blob was uploaded but DB record creation failed, delete orphaned Blob
        if (uploadedBlobPathname) {
          try {
            await del(uploadedBlobPathname, { token: rfpToken });
          } catch (cleanupErr) {
            console.error('[RFP_ORPHAN_BLOB_CLEANUP_ERROR]', cleanupErr);
          }
        }
        console.error('[RFP Upload Processing Error]', blobError);
        return NextResponse.json({ success: false, error: 'Document upload failed' }, { status: 500 });
      }
    }

    // Public Candidate Resumes & Support Attachments
    const isPrivate = isPublicResume || isPublicAttachment;
    const storageToken = isPrivate
      ? (process.env.RESUME_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN)
      : process.env.BLOB_READ_WRITE_TOKEN;

    if (!storageToken) {
      return NextResponse.json({
        success: false,
        error: isPrivate ? 'Document storage is unconfigured on the server.' : 'Public media storage is unconfigured.',
      }, { status: 503 });
    }

    const prefix = isPublicResume ? 'private_resumes' : isPublicAttachment ? 'private_attachments' : 'uploads';
    const blobAccess = isPrivate ? 'private' : 'public';

    try {
      const blob = await put(`${prefix}/${fileName}`, file, {
        access: blobAccess as any,
        contentType: ext === 'svg' ? 'image/svg+xml' : file.type,
        token: storageToken,
      });

      const safeOriginalName = (file.name || 'upload')
        .replace(/\0/g, '')
        .split(/[/\\]/).pop()
        ?.replace(/[^a-zA-Z0-9._-]/g, '_')
        .substring(0, 255) || 'upload';

      const headers: Record<string, string> = {
        'X-Upload-Status': 'validated',
        'X-Content-Type-Options': 'nosniff',
      };

      return NextResponse.json({
        success: true,
        url: isPrivate ? blob.pathname : blob.url,
        pathname: isPrivate ? `${prefix}/${fileName}` : undefined,
        fileName: safeOriginalName,
        fileSize: buffer.byteLength,
        status: 'VALIDATED',
        downloadUrl: isPrivate ? `/api/upload/download?pathname=${encodeURIComponent(`${prefix}/${fileName}`)}` : blob.url,
      }, { headers });
    } catch (blobError) {
      console.error("[UPLOAD ERROR] Storage operation failed:", blobError);
      return NextResponse.json({
        success: false,
        error: 'File upload processing failed',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[Upload API Exception]', error);
    return NextResponse.json({ success: false, error: 'Internal upload processing error' }, { status: 500 });
  }
}
