import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { isValidMagicBytes } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";
import { cookies } from "next/headers";

const CMS_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const RESUME_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const RFP_MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'avif',
  'mp4', 'webm', 'mov',
  'pdf', 'doc', 'docx',
  'glb', 'gltf'
];
const RESUME_EXTENSIONS = ['pdf', 'doc', 'docx'];
const RFP_EXTENSIONS = ['pdf', 'doc', 'docx'];

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/svg',
  'video/mp4', 'video/webm', 'video/quicktime',
  'application/pdf', 'application/x-pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'model/gltf-binary', 'model/gltf+json',
  'application/octet-stream', 'text/xml', 'application/xml'
];
const RESUME_TYPES = [
  'application/pdf', 'application/x-pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream'
];
const RFP_TYPES = [
  'application/pdf', 'application/x-pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream'
];

async function checkUploadAuth(request?: Request, context?: string | null): Promise<boolean> {
  if (context === 'public_resume' || context === 'public_rfp' || context === 'rfp_document' || context === 'public_attachment') {
    return true;
  }
  try {
    const session = await auth();
    if (session?.user) return true;
  } catch (e) {
    console.debug('[Upload Auth] session error', e);
  }

  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const isAuthed = allCookies.some(c =>
      c.name.includes('session-token') ||
      c.name.includes('authjs') ||
      c.name.includes('next-auth') ||
      c.name.includes('admin')
    );
    if (isAuthed) return true;
  } catch (e) {
    console.debug('[Upload Auth] cookie store error', e);
  }

  if (request) {
    const cookieHeader = request.headers.get('cookie') || '';
    if (cookieHeader.includes('session-token') || cookieHeader.includes('next-auth') || cookieHeader.includes('authjs')) {
      return true;
    }
  }

  return false;
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
          let context = null;
          if (clientPayload) {
            try { context = JSON.parse(clientPayload).context; } catch {}
          }
          const isAuthed = await checkUploadAuth(request, context);
          if (!isAuthed) {
            throw new Error("Unauthorized");
          }
          
          if (context === 'public_resume' || context === 'public_rfp' || context === 'rfp_document' || context === 'public_attachment') {
            const rl = await rateLimit(`rate_limit:upload:${ip}`, 5, 60, false);
            if (!rl.success) throw new Error(rl.error);
          }

          let maxSize = CMS_MAX_FILE_SIZE;
          let allowedTypes = ALLOWED_TYPES;

          if (context === 'public_resume') {
            maxSize = RESUME_MAX_FILE_SIZE;
            allowedTypes = RESUME_TYPES;
          } else if (context === 'public_rfp' || context === 'rfp_document') {
            maxSize = RFP_MAX_FILE_SIZE;
            allowedTypes = RFP_TYPES;
          }

          return {
            allowedContentTypes: allowedTypes,
            maximumSizeInBytes: maxSize,
            tokenPayload: JSON.stringify({ userId: 'cms_admin', context })
          };
        },
        onUploadCompleted: async ({ blob }) => {
          console.log("Blob upload completed", blob.url);
        },
      });
      return NextResponse.json(jsonResponse);
    } catch (error) {
      console.error('Error in handleUpload:', error);
      return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
  }

  // 2. Handle Direct FormData file uploads (FormData request)
  try {
    const data = await request.formData();
    const context = data.get('context') as string | null;

    const isAuthed = await checkUploadAuth(request, context);
    const isPublicResume = context === 'public_resume';
    const isPublicRfp = context === 'public_rfp' || context === 'rfp_document';
    const isPublicAttachment = context === 'public_attachment';

    if (!isAuthed && !isPublicResume && !isPublicRfp && !isPublicAttachment) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
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

    if (isPublicResume) {
      maxSize = RESUME_MAX_FILE_SIZE;
      validExtensions = RESUME_EXTENSIONS;
    } else if (isPublicRfp) {
      maxSize = RFP_MAX_FILE_SIZE;
      validExtensions = RFP_EXTENSIONS;
    } else if (isPublicAttachment) {
      maxSize = RESUME_MAX_FILE_SIZE;
      validExtensions = RESUME_EXTENSIONS;
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

    if (!isValidMagicBytes(buffer, ext)) {
      return NextResponse.json({ success: false, error: 'Invalid file signature' }, { status: 400 });
    }

    // Force unique naming with UUID
    const fileName = `${randomUUID()}.${ext || 'bin'}`;
    let fileUrl = "";

    const rfpToken = process.env.RFP_BLOB_READ_WRITE_TOKEN || process.env.RESUME_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
    const resumeToken = process.env.RESUME_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
    const publicToken = process.env.BLOB_READ_WRITE_TOKEN;

    const storageToken = isPublicRfp ? rfpToken : (isPublicResume || isPublicAttachment) ? resumeToken : publicToken;

    if (isPublicRfp && !rfpToken) {
      return NextResponse.json({
        success: false,
        error: 'RFP document storage is unconfigured on the server.',
      }, { status: 503 });
    }

    if ((isPublicResume || isPublicAttachment) && !resumeToken) {
      return NextResponse.json({
        success: false,
        error: 'Private document storage is unconfigured on the server.',
      }, { status: 503 });
    }

    if (!isPublicResume && !isPublicRfp && !isPublicAttachment && !publicToken) {
      return NextResponse.json({
        success: false,
        error: 'Public media storage is unconfigured: BLOB_READ_WRITE_TOKEN is missing.',
      }, { status: 500 });
    }

    const isPrivate = isPublicResume || isPublicRfp || isPublicAttachment;
    const prefix = isPublicResume ? 'private_resumes' : isPublicRfp ? 'private_rfps' : isPublicAttachment ? 'private_attachments' : 'uploads';
    const blobAccess = isPrivate ? 'private' : 'public';

    try {
      const blob = await put(`${prefix}/${fileName}`, file, {
        access: blobAccess as any,
        contentType: ext === 'svg' ? 'image/svg+xml' : file.type,
        token: storageToken,
      });
      // Private blobs: return pathname for download proxy, not public URL
      fileUrl = isPrivate ? blob.pathname : blob.url;
    } catch (blobError: any) {
      console.error("[UPLOAD ERROR] Vercel Blob upload failed:", blobError);
      return NextResponse.json({
        success: false,
        error: `Object storage upload failed: ${blobError?.message || 'Upload error'}`,
      }, { status: 500 });
    }

    // Sanitize original filename — strip path components and null bytes
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
      url: fileUrl,
      pathname: isPrivate ? `${prefix}/${fileName}` : undefined,
      fileName: safeOriginalName,
      fileSize: buffer.byteLength,
      status: 'VALIDATED',
      downloadUrl: isPrivate ? `/api/upload/download?pathname=${encodeURIComponent(`${prefix}/${fileName}`)}` : fileUrl,
    }, { headers });

  } catch (error) {
    console.error('[Upload API Exception]', error);
    return NextResponse.json({ success: false, error: 'Internal upload processing error' }, { status: 500 });
  }
}
