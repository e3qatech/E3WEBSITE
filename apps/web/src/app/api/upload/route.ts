import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { randomUUID } from "crypto"
import { auth } from "@/lib/auth"
import { promises as _fs } from 'fs';
import _path from 'path';
import { isValidMagicBytes } from "@/lib/security"
import { rateLimit } from "@/lib/rate-limit"

const CMS_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const RESUME_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'avif',
  'mp4', 'webm', 'mov',
  'pdf', 'doc', 'docx',
  'glb', 'gltf'
];
const RESUME_EXTENSIONS = ['pdf', 'doc', 'docx'];

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

// Note: All public website uploads require Vercel Blob object storage (BLOB_READ_WRITE_TOKEN).
// Private resume uploads require RESUME_BLOB_READ_WRITE_TOKEN.
// Database base64 binary fallbacks have been removed to preserve object storage architecture.

import { cookies } from "next/headers"

async function checkUploadAuth(request?: Request, context?: string | null): Promise<boolean> {
  if (context === 'public_resume') return true;
  try {
    const session = await auth();
    if (session?.user) return true;
  } catch (_e) {}

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
  } catch (_e) {}

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
          
          if (context === 'public_resume') {
             const rl = await rateLimit(`rate_limit:upload:${ip}`, 5, 60, false);
             if (!rl.success) throw new Error(rl.error);
          }

          const maxSize = context === 'public_resume' ? RESUME_MAX_FILE_SIZE : CMS_MAX_FILE_SIZE;
          const allowedTypes = context === 'public_resume' ? RESUME_TYPES : ALLOWED_TYPES;

          return {
            allowedContentTypes: allowedTypes,
            maximumSizeInBytes: maxSize,
            tokenPayload: JSON.stringify({ userId: 'cms_admin' })
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

    if (!isAuthed && !isPublicResume) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    if (isPublicResume) {
       const rl = await rateLimit(`rate_limit:upload:${ip}`, 5, 60, false);
       if (!rl.success) return NextResponse.json({ success: false, error: rl.error }, { status: 429 });
    }

    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const maxSize = isPublicResume ? RESUME_MAX_FILE_SIZE : CMS_MAX_FILE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: `File size exceeds limit` }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const validExtensions = isPublicResume ? RESUME_EXTENSIONS : ALLOWED_EXTENSIONS;
    const isAllowedExt = validExtensions.includes(ext);

    if (!isAllowedExt) {
      return NextResponse.json({ success: false, error: 'Invalid file extension' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isValidMagicBytes(buffer, ext)) {
      return NextResponse.json({ success: false, error: 'Invalid file signature' }, { status: 400 });
    }

    // Force unique naming
    const fileName = `${randomUUID()}.${ext || 'bin'}`;
    let fileUrl = "";

    const hasResumeToken = !!process.env.RESUME_BLOB_READ_WRITE_TOKEN;
    const hasPublicToken = !!process.env.BLOB_READ_WRITE_TOKEN;

    if (isPublicResume && !hasResumeToken) {
      return NextResponse.json({ success: false, error: 'Private resume storage is unconfigured: RESUME_BLOB_READ_WRITE_TOKEN is missing.' }, { status: 503 });
    }

    if (!isPublicResume && !hasPublicToken) {
      return NextResponse.json({ success: false, error: 'Public media storage is unconfigured: BLOB_READ_WRITE_TOKEN is missing.' }, { status: 500 });
    }

    try {
      const prefix = isPublicResume ? 'private_resumes' : 'uploads';
      const blobAccess = isPublicResume ? 'private' : 'public';
      const uploadToken = isPublicResume ? process.env.RESUME_BLOB_READ_WRITE_TOKEN : process.env.BLOB_READ_WRITE_TOKEN;
      
      const blob = await put(`${prefix}/${fileName}`, file, {
        access: blobAccess as any,
        contentType: ext === 'svg' ? 'image/svg+xml' : file.type,
        token: uploadToken
      });
      // Private blobs: return pathname for download proxy, not public URL
      fileUrl = isPublicResume ? blob.pathname : blob.url;
    } catch (blobError: any) {
      console.error("[UPLOAD ERROR] Vercel Blob upload failed:", blobError);
      return NextResponse.json({ success: false, error: `Object storage upload failed: ${blobError?.message || 'Upload error'}` }, { status: 500 });
    }

    // Sanitize original filename — strip path components and null bytes
    const safeOriginalName = (file.name || 'upload')
      .replace(/\0/g, '')
      .split(/[/\\]/).pop()
      ?.replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 255) || 'upload';

    const headers: Record<string, string> = {
      'X-Upload-Status': 'unscanned', // No malware scanner — see Gate 05 malware policy
    };

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      fileName: safeOriginalName,
      ...(isPublicResume ? { downloadUrl: `/api/upload/download?pathname=${encodeURIComponent(fileUrl)}` } : {}),
    }, { headers });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
