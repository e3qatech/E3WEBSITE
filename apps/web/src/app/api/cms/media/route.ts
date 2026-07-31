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

async function saveFileLocally(file: File, fileName: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fileName);
  const bytes = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(bytes));
  return `/uploads/${fileName}`;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    
    // Upload to Vercel Blob if token exists, fallback to local storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`uploads/${filename}`, file, {
          access: 'public',
          contentType: ext === 'svg' ? 'image/svg+xml' : file.type,
        })
        fileUrl = blob.url;
      } catch (blobError) {
        console.warn("[UPLOAD WARNING] Vercel Blob upload failed, falling back to local disk storage:", blobError);
        fileUrl = await saveFileLocally(file, filename);
      }
    } else {
      fileUrl = await saveFileLocally(file, filename);
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
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}
