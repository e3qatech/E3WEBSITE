import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { randomUUID } from "crypto"
import { auth } from "@/lib/auth"

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/quicktime',
  'application/pdf', 'application/x-pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'model/gltf-binary', 'model/gltf+json',
  'application/octet-stream'
];

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const context = data.get('context') as string | null

    const session = await auth();
    const isAdmin = session?.user && ((session.user as any).role === 'SUPER_ADMIN' || (session.user as any).role === 'SALES_ADMIN' || (session.user as any).role === 'SUPPORT_ADMIN');

    if (!isAdmin && context !== 'public_resume') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = ext && ['pdf', 'doc', 'docx'].includes(ext);

    if (!isAllowedExt && !ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 });
    }

    const fileName = `${randomUUID()}.${ext || 'bin'}`

    // Upload to Vercel Blob
    const blob = await put(`uploads/${fileName}`, file, {
      access: 'public',
    })

    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      fileName: file.name
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
