import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { randomUUID } from "crypto"
import { auth } from "@/lib/auth"
import fs from "fs/promises"
import path from "path"
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

import db from "@/lib/db";

async function saveFileOrDataUrl(file: File, fileName: string, ext?: string, isPrivate: boolean = false): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Try saving to public/uploads directory first (local dev / writable disk)
  try {
    const uploadDir = path.join(process.cwd(), isPrivate ? "private" : "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    return isPrivate ? `/private/uploads/${fileName}` : `/uploads/${fileName}`;
  } catch (fsErr) {
    console.warn("[UPLOAD NOTICE] Disk storage is read-only. Persisting media binary in PostgreSQL database:", fsErr);
    if (isPrivate) {
        throw new Error("Private storage unavailable on read-only system without valid blob setup.");
    }
    
    let mime = file.type;
    if (ext === 'svg' || !mime || mime === 'application/octet-stream') {
      if (ext === 'svg') mime = 'image/svg+xml';
      else if (ext === 'png') mime = 'image/png';
      else if (ext === 'jpg' || ext === 'jpeg') mime = 'image/jpeg';
      else if (ext === 'webp') mime = 'image/webp';
      else if (ext === 'gif') mime = 'image/gif';
      else if (ext === 'pdf') mime = 'application/pdf';
      else if (ext === 'mp4') mime = 'video/mp4';
      else if (ext === 'webm') mime = 'video/webm';
    }

    let mediaType: any = 'IMAGE';
    if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'm4v', 'mkv'].includes(ext || '')) mediaType = 'VIDEO';
    else if (mime.includes('pdf') || ['pdf', 'doc', 'docx'].includes(ext || '')) mediaType = 'DOCUMENT';
    else if (['glb', 'gltf'].includes(ext || '')) mediaType = 'MODEL_3D';

    const base64Data = buffer.toString('base64');

    try {
      // Create database record with binary payload stored in metadata
      const mediaRecord = await db.media.create({
        data: {
          url: '',
          type: mediaType,
          mimeType: mime || 'application/octet-stream',
          size: file.size,
          alt: { en: fileName || 'Media', ar: fileName || 'Media' },
          metadata: {
            data: base64Data,
            fileName,
          }
        }
      });

      const streamableUrl = `/api/media/${mediaRecord.id}`;
      await db.media.update({
        where: { id: mediaRecord.id },
        data: { url: streamableUrl }
      });

      return streamableUrl;
    } catch (dbErr) {
      console.warn("[UPLOAD NOTICE] db.media.create skipped (Media table not found in production DB), using Data URL fallback:", dbErr);
      return `data:${mime || 'application/octet-stream'};base64,${base64Data}`;
    }
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
          const session = await auth();
          let context = null;
          if (clientPayload) {
            try { context = JSON.parse(clientPayload).context; } catch {}
          }
          if (!session?.user && context !== 'public_resume') {
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
            tokenPayload: JSON.stringify({ userId: session?.user?.id || 'anonymous' })
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

    const session = await auth();
    const isPublicResume = context === 'public_resume';

    if (!session?.user && !isPublicResume) {
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
      return NextResponse.json({ success: false, error: 'Resume storage is unconfigured' }, { status: 503 });
    }

    if (isPublicResume ? hasResumeToken : hasPublicToken) {
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
      } catch (blobError) {
        console.warn("[UPLOAD WARNING] Vercel Blob upload failed, falling back to disk/DataURL:", blobError);
        fileUrl = await saveFileOrDataUrl(file, fileName, ext, isPublicResume);
      }
    } else {
      fileUrl = await saveFileOrDataUrl(file, fileName, ext, isPublicResume);
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
