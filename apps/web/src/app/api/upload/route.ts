import { NextResponse } from "next/server"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
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
    const body = (await request.json()) as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await auth();
        const isAdmin = session?.user && ((session.user as any).role === 'SUPER_ADMIN' || (session.user as any).role === 'SALES_ADMIN' || (session.user as any).role === 'SUPPORT_ADMIN');
        
        // You could pass context in clientPayload if needed, but for now we'll allow public_resume via a check if needed.
        // Assuming clientPayload is stringified if provided.
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
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('Error in handleUpload:', error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 })
  }
}
