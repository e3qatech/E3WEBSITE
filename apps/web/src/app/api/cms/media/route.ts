import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { auth } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';
import { isValidMagicBytes } from '@/lib/security';
import { DEFAULT_B2C_LANDING_CONTENT } from '@/lib/cms-default-pages';

// Helper function to extract all media URLs recursively from any JSON structure
function extractMediaUrlsFromObject(obj: any, urls = new Set<string>()): Set<string> {
  if (!obj) return urls;
  if (typeof obj === 'string') {
    if (obj.match(/^https?:\/\/.*\.(jpg|jpeg|png|webp|gif|svg|avif|mp4|webm|mov)(\?.*)?$/i) || obj.startsWith('/uploads/') || obj.startsWith('/images/')) {
      urls.add(obj);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(item => extractMediaUrlsFromObject(item, urls));
  } else if (typeof obj === 'object') {
    Object.values(obj).forEach(val => extractMediaUrlsFromObject(val, urls));
  }
  return urls;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '200');

    let media: any[] = [];
    let total = 0;

    // 1. Fetch DB media items
    try {
      const dbMedia = await db.media.findMany({
        where: type ? { type: type as any } : {},
        orderBy: { createdAt: 'desc' },
      });
      media = dbMedia;
      total = dbMedia.length;
    } catch (dbErr) {
      console.warn("[CMS MEDIA GET NOTICE] db.media query notice:", dbErr);
    }

    // 2. Extract all site-wide used media from default seed & DB pages to ensure complete global media list
    const usedUrls = new Set<string>();
    extractMediaUrlsFromObject(DEFAULT_B2C_LANDING_CONTENT, usedUrls);

    try {
      const pages = await db.pages.findMany({ take: 50 });
      pages.forEach((p: any) => extractMediaUrlsFromObject(p.content, usedUrls));
    } catch (_e) {
      // Ignore Pages table query error
    }

    // Convert extracted URLs into synthetic Media items if not already present in media array
    const existingUrls = new Set(media.map(m => m.url));
    const syntheticMedia: any[] = [];

    usedUrls.forEach((url) => {
      if (!existingUrls.has(url)) {
        let isVideo = false;
        let isDoc = false;
        let is3D = false;

        if (url.match(/\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i)) isVideo = true;
        else if (url.match(/\.(pdf|doc|docx)(\?.*)?$/i)) isDoc = true;
        else if (url.match(/\.(glb|gltf)(\?.*)?$/i)) is3D = true;

        const mediaType = isVideo ? 'VIDEO' : isDoc ? 'DOCUMENT' : is3D ? 'MODEL_3D' : 'IMAGE';
        if (!type || type === 'ALL' || type === mediaType) {
          syntheticMedia.push({
            id: `site-used-${Math.abs(url.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0))}`,
            url,
            type: mediaType,
            mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
            size: 0,
            alt: { en: 'Website Media Asset', ar: 'ملف وسائط في الموقع' },
            createdAt: new Date().toISOString(),
            isSiteUsed: true
          });
        }
      }
    });

    const combinedMedia = [...media, ...syntheticMedia];
    const filteredMedia = type && type !== 'ALL' ? combinedMedia.filter(m => m.type === type) : combinedMedia;

    return NextResponse.json({
      data: filteredMedia,
      meta: {
        total: filteredMedia.length,
        page,
        limit,
        totalPages: Math.ceil(filteredMedia.length / limit),
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
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  } catch (fsErr) {
    console.warn("[UPLOAD WARNING] Disk storage failed, converting to Data URL fallback:", fsErr);
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
    if (!session?.user && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    // Handle JSON body for direct URL registration
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

    // Handle FormData for single & bulk uploads
    const formData = await request.formData();
    const uploadedFiles: File[] = [];

    const fileEntries = formData.getAll('file');
    const filesEntries = formData.getAll('files');

    [...fileEntries, ...filesEntries].forEach(f => {
      if (f && typeof f === 'object' && 'arrayBuffer' in f) {
        uploadedFiles.push(f as File);
      }
    });
    
    if (uploadedFiles.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const createdMediaItems: any[] = [];

    for (const file of uploadedFiles) {
      if (file.size > MAX_FILE_SIZE) continue;

      const ext = file.name.split('.').pop()?.toLowerCase();
      const isAllowedExt = ext && ALLOWED_EXTENSIONS.includes(ext);

      if (!isAllowedExt && !ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      if (!isValidMagicBytes(buffer, ext || '')) {
        continue;
      }

      const filename = `${randomUUID()}.${ext || 'bin'}`;
      let fileUrl = "";
      
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const blob = await put(`uploads/${filename}`, buffer, {
            access: 'public',
            contentType: ext === 'svg' ? 'image/svg+xml' : file.type,
          });
          fileUrl = blob.url;
        } catch (blobError) {
          fileUrl = await saveFileOrDataUrl(buffer, file.type, filename, ext);
        }
      } else {
        fileUrl = await saveFileOrDataUrl(buffer, file.type, filename, ext);
      }
      
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

      createdMediaItems.push(media);
    }

    if (createdMediaItems.length === 1) {
      return NextResponse.json(createdMediaItems[0], { status: 201 });
    }

    return NextResponse.json({ data: createdMediaItems, success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload media' },
      { status: 500 }
    );
  }
}
