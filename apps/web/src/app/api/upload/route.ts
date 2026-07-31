import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { randomUUID } from "crypto"
import { auth } from "@/lib/auth"
import fs from "fs/promises"
import path from "path"

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'avif',
  'mp4', 'webm', 'mov',
  'pdf', 'doc', 'docx',
  'glb', 'gltf'
];

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/svg',
  'video/mp4', 'video/webm', 'video/quicktime',
  'application/pdf', 'application/x-pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'model/gltf-binary', 'model/gltf+json',
  'application/octet-stream', 'text/xml', 'application/xml'
];

async function saveFileOrDataUrl(file: File, fileName: string, ext?: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Try saving to public/uploads directory first (local dev / writable disk)
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  } catch (fsErr) {
    console.warn("[UPLOAD WARNING] Disk storage failed (read-only filesystem), converting to Data URL fallback:", fsErr);
    
    let mime = file.type;
    if (ext === 'svg' || !mime || mime === 'application/octet-stream') {
      if (ext === 'svg') mime = 'image/svg+xml';
      else if (ext === 'png') mime = 'image/png';
      else if (ext === 'jpg' || ext === 'jpeg') mime = 'image/jpeg';
      else if (ext === 'webp') mime = 'image/webp';
      else if (ext === 'gif') mime = 'image/gif';
      else if (ext === 'pdf') mime = 'application/pdf';
    }

    const base64 = buffer.toString('base64');
    return `data:${mime || 'application/octet-stream'};base64,${base64}`;
  }
}

export async function POST(request: Request) {
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
            try { context = JSON.parse(clientPayload).context; } catch (e) {}
          }
          if (!session?.user && context !== 'public_resume') {
            throw new Error("Unauthorized");
          }
          return {
            allowedContentTypes: ALLOWED_TYPES,
            maximumSizeInBytes: MAX_FILE_SIZE,
            tokenPayload: JSON.stringify({ userId: session?.user?.id || 'anonymous' })
          };
        },
        onUploadCompleted: async ({ blob, tokenPayload }) => {
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

    if (!session?.user && context !== 'public_resume') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = ext && ALLOWED_EXTENSIONS.includes(ext);

    if (!isAllowedExt && !ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 });
    }

    const fileName = `${randomUUID()}.${ext || 'bin'}`;
    let fileUrl = "";

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`uploads/${fileName}`, file, {
          access: 'public',
          contentType: ext === 'svg' ? 'image/svg+xml' : file.type,
        });
        fileUrl = blob.url;
      } catch (blobError) {
        console.warn("[UPLOAD WARNING] Vercel Blob upload failed, falling back to disk/DataURL:", blobError);
        fileUrl = await saveFileOrDataUrl(file, fileName, ext);
      }
    } else {
      fileUrl = await saveFileOrDataUrl(file, fileName, ext);
    }

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      fileName: file.name
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
