import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { auth } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where = type ? { type: type as any } : {};

    const [media, total] = await Promise.all([
      db.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.media.count({ where }),
    ]);

    return NextResponse.json({
      data: media,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

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

import { requireApiRole } from '@/lib/auth-helpers';

export async function POST(request: Request) {
  try {
    const authResult = await requireApiRole(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SALES_ADMIN']);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = ext && ALLOWED_EXTENSIONS.includes(ext);

    if (!isAllowedExt && !ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const filename = `${randomUUID()}.${ext || 'bin'}`
    let fileUrl = "";
    
    // Upload to Vercel Blob if token exists, fallback to local storage / Data URL
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`uploads/${filename}`, file, {
          access: 'public',
          contentType: ext === 'svg' ? 'image/svg+xml' : file.type,
        })
        fileUrl = blob.url;
      } catch (blobError) {
        console.warn("[UPLOAD WARNING] Vercel Blob upload failed, falling back to disk/DataURL:", blobError);
        fileUrl = await saveFileOrDataUrl(file, filename, ext);
      }
    } else {
      fileUrl = await saveFileOrDataUrl(file, filename, ext);
    }
    
    // Determine MediaType based on mimeType
    let mediaType = 'IMAGE';
    if (file.type.startsWith('video/')) mediaType = 'VIDEO';
    else if (file.type.includes('pdf') || file.type.includes('document')) mediaType = 'DOCUMENT';
    else if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) mediaType = 'MODEL_3D';

    const media = await db.media.create({
      data: {
        url: fileUrl,
        type: mediaType as any,
        mimeType: ext === 'svg' ? 'image/svg+xml' : (file.type || 'application/octet-stream'),
        size: file.size,
        alt: JSON.stringify({ en: file.name, ar: file.name }),
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload media' },
      { status: 500 }
    );
  }
}
