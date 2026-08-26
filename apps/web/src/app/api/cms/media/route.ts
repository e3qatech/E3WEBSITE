import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { isValidMagicBytes } from '@/lib/security';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

// Helper function to extract all media URLs recursively from any JSON structure
function _extractMediaUrlsFromObject(obj: any, urls = new Set<string>()): Set<string> {
  if (!obj) return urls;
  if (typeof obj === 'string') {
    if (obj.match(/^https?:\/\/.*\.(jpg|jpeg|png|webp|gif|svg|avif|mp4|webm|mov)(\?.*)?$/i) || obj.startsWith('/uploads/') || obj.startsWith('/images/')) {
      urls.add(obj);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach(item => _extractMediaUrlsFromObject(item, urls));
  } else if (typeof obj === 'object') {
    Object.values(obj).forEach(val => _extractMediaUrlsFromObject(val, urls));
  }
  return urls;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        where: type && type !== 'ALL' ? { type: type as any } : {},
        orderBy: { createdAt: 'desc' },
      });
      media = dbMedia.map((m: any) => {
        const metadata = typeof m.metadata === 'object' && m.metadata ? m.metadata : {};
        const altObj = typeof m.alt === 'object' && m.alt ? m.alt : {};
        const altStr = typeof m.alt === 'string' ? m.alt : '';
        const urlFileName = m.url ? m.url.split('/').pop()?.split('?')[0] : '';
        const fileName = metadata.fileName 
          || metadata.originalName 
          || altObj.en 
          || altObj.ar 
          || altStr 
          || urlFileName 
          || 'Media File';

        return {
          id: m.id,
          url: m.url,
          thumbnailUrl: m.thumbnailUrl,
          type: m.type,
          mimeType: m.mimeType,
          size: m.size,
          fileName,
          alt: m.alt,
          metadata: m.metadata,
          uploadedBy: m.uploadedBy,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt
        };
      });
      total = media.length;
    } catch (dbErr) {
      console.warn("[CMS MEDIA GET NOTICE] db.media query notice:", dbErr);
    }

    return NextResponse.json({
      data: media,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
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

// Note: All public media uploads require Vercel Blob object storage (BLOB_READ_WRITE_TOKEN).
// Database binary / base64 fallbacks have been removed to preserve storage architecture standards.

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      try {
        const dbUser = await db.user.findUnique({ where: { id: session.user.id } });
        if (dbUser) {
          if (!dbUser.isActive) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }
          if (dbUser.role === 'CLIENT' || dbUser.role === 'SALES_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }
        }
      } catch (_e) {}
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

      const fileName = name || url.split('/').pop()?.split('?')[0] || 'Media File';

      let media: any = null;
      try {
        media = await db.media.create({
          data: {
            url,
            type: mediaType as any,
            mimeType: mimeType || 'application/octet-stream',
            size: size || 0,
            alt: { en: fileName, ar: fileName },
            metadata: { fileName, originalName: fileName, fileSize: size || 0 },
          },
        });
        media = { ...media, fileName };
      } catch (_dbErr) {
        media = {
          id: randomUUID(),
          url,
          type: mediaType,
          mimeType: mimeType || 'application/octet-stream',
          size: size || 0,
          name: fileName,
          fileName,
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

      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json({
          error: "Missing required public object storage environment configuration: BLOB_READ_WRITE_TOKEN. Public media uploads are rejected to prevent data loss.",
          code: "MISSING_BLOB_READ_WRITE_TOKEN"
        }, { status: 500 });
      }

      const filename = `${randomUUID()}.${ext || 'bin'}`;
      let fileUrl = "";
      
      try {
        const blob = await put(`uploads/${filename}`, buffer, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
          contentType: ext === 'svg' ? 'image/svg+xml' : (file.type || 'application/octet-stream'),
        });
        fileUrl = blob.url;
      } catch (blobError: any) {
        console.error("[CMS MEDIA BLOB UPLOAD ERROR]", blobError);
        return NextResponse.json({
          error: `Vercel Blob upload failed: ${blobError?.message || 'Object storage error'}. Check BLOB_READ_WRITE_TOKEN configuration.`,
          code: "BLOB_UPLOAD_FAILED"
        }, { status: 500 });
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
            metadata: { fileName: file.name, originalName: file.name, fileSize: file.size },
          },
        });
        media = { ...media, fileName: file.name };
      } catch (_dbErr) {
        media = {
          id: randomUUID(),
          url: fileUrl,
          type: mediaType,
          mimeType: ext === 'svg' ? 'image/svg+xml' : (file.type || 'application/octet-stream'),
          size: file.size,
          name: file.name,
          fileName: file.name,
          createdAt: new Date().toISOString()
        };
      }

      createdMediaItems.push(media);
    }

    if (createdMediaItems.length === 1) {
      return NextResponse.json(createdMediaItems[0], { status: 201 });
    }

    return NextResponse.json({ data: createdMediaItems, success: true, count: createdMediaItems.length }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload media' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { mediaIds, folder, tags, alt, fileName } = body;

    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json({ error: 'mediaIds array is required' }, { status: 400 });
    }

    const updated: any[] = [];
    for (const id of mediaIds) {
      try {
        const existing = await db.media.findUnique({ where: { id } });
        if (!existing) continue;

        const currentMetadata = typeof existing.metadata === 'object' && existing.metadata ? (existing.metadata as any) : {};
        const newMetadata = {
          ...currentMetadata,
          ...(folder !== undefined ? { folder } : {}),
          ...(tags !== undefined ? { tags } : {}),
          ...(fileName !== undefined ? { fileName } : {}),
        };

        const res = await db.media.update({
          where: { id },
          data: {
            metadata: newMetadata,
            ...(alt !== undefined ? { alt } : {}),
          },
        });
        updated.push(res);
      } catch (_e) {}
    }

    return NextResponse.json({ success: true, count: updated.length, data: updated });
  } catch (error: any) {
    console.error('Error updating media items:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update media' }, { status: 500 });
  }
}

