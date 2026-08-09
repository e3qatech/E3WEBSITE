import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { auth } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';
import { isValidMagicBytes } from '@/lib/security';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where = type ? { type: type as any } : {};

    let media: any[] = [];
    let total = 0;

    try {
      const [dbMedia, dbTotal] = await Promise.all([
        db.media.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        db.media.count({ where }),
      ]);
      media = dbMedia;
      total = dbTotal;
    } catch (dbErr) {
      console.warn("[CMS MEDIA GET NOTICE] Media table missing or inaccessible in production DB:", dbErr);
    }

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
      { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 } },
      { status: 200 }
    );
  }
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'avif',
  'mp4', 'webm', 'mov', 'm4v', 'avi', 'mkv',
  'pdf', 'doc', 'docx',
  'glb', 'gltf'
];

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/svg',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/avi', 'video/x-msvideo',
  'application/pdf', 'application/x-pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'model/gltf-binary', 'model/gltf+json',
  'application/octet-stream', 'text/xml', 'application/xml'
];

async function saveFileOrDataUrl(buffer: Buffer, fileType: string, fileName: string, ext?: string): Promise<string> {

  // Try saving to public/uploads directory first (local dev / writable disk)
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  } catch (fsErr) {
    console.warn("[UPLOAD WARNING] Disk storage failed (read-only filesystem), converting to Data URL fallback:", fsErr);
    
    let mime = fileType;
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
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await db.user.findUnique({ where: { id: (session.user as any).id } });
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Account inactive or unauthorized' }, { status: 401 });
    }
    if (!['SUPER_ADMIN', 'SUPPORT_ADMIN', 'STAFF'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const contentType = request.headers.get('content-type') || '';

    // Handle JSON body for client-uploaded files (e.g. via @vercel/blob/client)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { url, type, mimeType, size, name } = body;
      
      if (!url) {
        return NextResponse.json({ error: 'Media URL is required' }, { status: 400 });
      }

      let mediaType = type || 'IMAGE';
      if (!type) {
        if (mimeType?.startsWith('video/') || url.match(/\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i)) mediaType = 'VIDEO';
        else if (mimeType?.includes('pdf') || url.match(/\.(pdf|doc|docx)(\?.*)?$/i)) mediaType = 'DOCUMENT';
        else if (url.match(/\.(glb|gltf)(\?.*)?$/i)) mediaType = 'MODEL_3D';
      }

      let media: any = null;
      try {
        media = await db.media.create({
          data: {
            url,
            type: mediaType as any,
            mimeType: mimeType || 'application/octet-stream',
            size: size || 0,
            alt: { en: name || 'Media', ar: name || 'Media' },
          },
        });
      } catch (dbErr) {
        console.warn("[CMS MEDIA NOTICE] db.media.create skipped (Media table not found in production DB):", dbErr);
        media = {
          id: randomUUID(),
          url,
          type: mediaType,
          mimeType: mimeType || 'application/octet-stream',
          size: size || 0,
          name: name || 'Media',
          createdAt: new Date().toISOString()
        };
      }

      return NextResponse.json(media, { status: 201 });
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

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isValidMagicBytes(buffer, ext || '')) {
      return NextResponse.json({ error: 'Invalid file signature' }, { status: 400 });
    }

    const filename = `${randomUUID()}.${ext || 'bin'}`
    let fileUrl = "";
    
    // Upload to Vercel Blob if token exists, fallback to local storage / Data URL
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`uploads/${filename}`, buffer, {
          access: 'public',
          contentType: ext === 'svg' ? 'image/svg+xml' : file.type,
        })
        fileUrl = blob.url;
      } catch (blobError) {
        console.warn("[UPLOAD WARNING] Vercel Blob upload failed, falling back to disk/DataURL:", blobError);
        fileUrl = await saveFileOrDataUrl(buffer, file.type, filename, ext);
      }
    } else {
      fileUrl = await saveFileOrDataUrl(buffer, file.type, filename, ext);
    }
    
    // Determine MediaType based on mimeType
    let mediaType = 'IMAGE';
    if (file.type.startsWith('video/')) mediaType = 'VIDEO';
    else if (file.type.includes('pdf') || file.type.includes('document')) mediaType = 'DOCUMENT';
    else if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) mediaType = 'MODEL_3D';

    let media: any = null;
    try {
      media = await db.media.create({
        data: {
          url: fileUrl,
          type: mediaType as any,
          mimeType: ext === 'svg' ? 'image/svg+xml' : (file.type || 'application/octet-stream'),
          size: file.size,
          alt: { en: file.name, ar: file.name },
        },
      });
    } catch (dbErr) {
      console.warn("[CMS MEDIA NOTICE] db.media.create skipped (Media table missing in production DB):", dbErr);
      media = {
        id: randomUUID(),
        url: fileUrl,
        type: mediaType,
        mimeType: ext === 'svg' ? 'image/svg+xml' : (file.type || 'application/octet-stream'),
        size: file.size,
        name: file.name,
        createdAt: new Date().toISOString()
      };
    }

    return NextResponse.json(media, { status: 201 });

    return NextResponse.json(media, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload media' },
      { status: 500 }
    );
  }
}
