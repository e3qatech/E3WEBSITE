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

async function saveFileLocally(file: File, fileName: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fileName);
  const bytes = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(bytes));
  return `/uploads/${fileName}`;
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
          const isAdmin = session?.user && ((session.user as any).role === 'SUPER_ADMIN' || (session.user as any).role === 'SALES_ADMIN' || (session.user as any).role === 'SUPPORT_ADMIN');
          let context = null;
          if (clientPayload) {
            try { context = JSON.parse(clientPayload).context; } catch (e) {}
          }
          if (!isAdmin && context !== 'public_resume') {
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
    const isAdmin = session?.user && ((session.user as any).role === 'SUPER_ADMIN' || (session.user as any).role === 'SALES_ADMIN' || (session.user as any).role === 'SUPPORT_ADMIN');

    if (!isAdmin && context !== 'public_resume') {
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
        console.warn("[UPLOAD WARNING] Vercel Blob upload failed, falling back to local disk storage:", blobError);
        fileUrl = await saveFileLocally(file, fileName);
      }
    } else {
      fileUrl = await saveFileLocally(file, fileName);
    }

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      fileName: file.name
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
