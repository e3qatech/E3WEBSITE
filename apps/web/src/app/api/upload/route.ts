import { NextResponse } from "next/server"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { randomUUID, randomBytes, createHash } from "crypto"
import { auth } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

const CMS_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const RESUME_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const RFP_MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'avif',
  'mp4', 'webm', 'mov',
  'pdf', 'docx',
  'glb', 'gltf'
];
const RESUME_EXTENSIONS = ['pdf', 'docx'];
// STRICT: PDF and DOCX ONLY (legacy .doc and general .zip removed)
const RFP_EXTENSIONS = ['pdf', 'docx'];

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/svg',
  'video/mp4', 'video/webm', 'video/quicktime',
  'application/pdf', 'application/x-pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'model/gltf-binary', 'model/gltf+json',
  'application/octet-stream', 'text/xml', 'application/xml'
];
const RESUME_TYPES = [
  'application/pdf', 'application/x-pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream'
];
const RFP_TYPES = [
  'application/pdf', 'application/x-pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream'
];

async function checkUploadAuth(request?: Request, context?: string | null): Promise<boolean> {
  if (context === 'public_resume' || context === 'b2b_rfp') return true;
  try {
    const session = await auth();
    if (session?.user) return true;
  } catch (e) {
    console.debug('[Upload Auth] session error', e);
  }

  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const isAuthed = allCookies.some(c =>
      c.name.includes('session-token') ||
      c.name.includes('authjs') ||
      c.name.includes('next-auth') ||
      c.name.includes('admin')
    );
    if (isAuthed) return true;
  } catch (e) {
    console.debug('[Upload Auth] cookie store error', e);
  }

  if (request) {
    const cookieHeader = request.headers.get('cookie') || '';
    if (cookieHeader.includes('session-token') || cookieHeader.includes('next-auth') || cookieHeader.includes('authjs')) {
      return true;
    }
  }

  return false;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown_ip";
  const contentType = request.headers.get("content-type") || "";

  // 1. Direct Client Upload Token Exchange (Official @vercel/blob/client flow)
  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as HandleUploadBody;

      // Upload-session capability resolution for anonymous submissions
      let uploadSessionToken: string | undefined = undefined;
      try {
        const cookieStore = await cookies();
        uploadSessionToken = cookieStore.get('e3_upload_session')?.value;
      } catch {
        const cookieHeader = request.headers.get('cookie') || '';
        const match = cookieHeader.match(/e3_upload_session=([^;]+)/);
        if (match) uploadSessionToken = match[1];
      }

      let shouldSetSessionCookie = false;
      if (!uploadSessionToken) {
        uploadSessionToken = randomBytes(32).toString('hex');
        shouldSetSessionCookie = true;
      }
      const sessionIdHash = createHash('sha256').update(uploadSessionToken).digest('hex');

      let createdRecordId: string | null = null;
      let targetPathname: string | null = null;

      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (clientPathname, clientPayload) => {
          let context = 'cms_media';
          let originalName = clientPathname || 'upload.bin';
          if (clientPayload) {
            try {
              const parsed = JSON.parse(clientPayload);
              if (parsed.context) context = parsed.context;
              if (parsed.originalName) originalName = parsed.originalName;
            } catch {}
          }

          const isAuthed = await checkUploadAuth(request, context);
          if (!isAuthed) {
            throw new Error("Unauthorized");
          }

          // Dedicated Private RFP Store requirement
          if (context === 'b2b_rfp') {
            const rfpToken = process.env.RFP_BLOB_READ_WRITE_TOKEN;
            if (!rfpToken) {
              throw new Error("RFP_STORAGE_UNCONFIGURED");
            }

            // Fail-Closed Rate Limiting
            const rlIp = await rateLimit(`rate_limit:upload:b2b_rfp:ip:${ip}`, 5, 60, true);
            if (!rlIp.success) throw new Error(`Rate limit exceeded: ${rlIp.error}`);

            const rlSession = await rateLimit(`rate_limit:upload:b2b_rfp:session:${sessionIdHash}`, 5, 60, true);
            if (!rlSession.success) throw new Error(`Session rate limit exceeded: ${rlSession.error}`);

            const ext = originalName.split('.').pop()?.toLowerCase() || '';
            if (!RFP_EXTENSIONS.includes(ext)) {
              throw new Error(`Invalid file extension. Allowed: ${RFP_EXTENSIONS.join(', ')}`);
            }

            // Server-controlled randomized pathname
            const uploadId = randomUUID();
            createdRecordId = uploadId;
            targetPathname = `private_rfp/${uploadId}.${ext}`;

            // Pre-create PostgreSQL upload record with 2-hour expiration
            await db.uploadRecord.create({
              data: {
                id: uploadId,
                purpose: 'B2B_RFP',
                pathname: targetPathname,
                originalFilename: originalName.substring(0, 255),
                extension: ext,
                mimeType: ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                sizeBytes: 0, // Updated upon finalization
                sessionHash: sessionIdHash,
                status: 'INITIATED',
                quarantineStatus: 'UNSCANNED',
                expiresAt: new Date(Date.now() + 2 * 3600 * 1000), // 2 hours
              }
            });

            return {
              allowedContentTypes: [
                'application/pdf',
                'application/x-pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              ],
              maximumSizeInBytes: 25 * 1024 * 1024,
              tokenPayload: JSON.stringify({
                uploadId,
                purpose: 'B2B_RFP',
                pathname: targetPathname,
              }),
              validUntil: Date.now() + 600 * 1000, // 10 minutes
            };
          }

          if (context === 'public_resume') {
            const resumeToken = process.env.RESUME_BLOB_READ_WRITE_TOKEN;
            if (!resumeToken) throw new Error("RESUME_STORAGE_UNCONFIGURED");

            const uploadId = randomUUID();
            targetPathname = `private_resumes/${uploadId}.bin`;

            return {
              allowedContentTypes: RESUME_TYPES,
              maximumSizeInBytes: RESUME_MAX_FILE_SIZE,
              tokenPayload: JSON.stringify({ uploadId, pathname: targetPathname }),
            };
          }

          return {
            allowedContentTypes: ALLOWED_TYPES,
            maximumSizeInBytes: CMS_MAX_FILE_SIZE,
            tokenPayload: JSON.stringify({ userId: 'cms_admin', context })
          };
        },
        onUploadCompleted: async ({ blob, tokenPayload }) => {
          console.log("[BLOB DIRECT UPLOAD COMPLETE]", blob.pathname, tokenPayload);
        },
      });

      const res = NextResponse.json({
        ...jsonResponse,
        uploadId: createdRecordId,
        pathname: targetPathname,
      });

      if (shouldSetSessionCookie && uploadSessionToken) {
        res.cookies.set('e3_upload_session', uploadSessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 86400 * 30, // 30 days
        });
      }

      return res;
    } catch (error: any) {
      const correlationId = randomUUID();
      console.error(`[Upload Error ${correlationId}] in direct upload token exchange:`, error?.message || error);
      const msg = error?.message || 'Upload token error';
      if (msg.includes('storage is unconfigured') || msg.includes('STORAGE_UNCONFIGURED') || msg.includes('RFP_STORAGE_UNCONFIGURED') || msg.includes('Redis unavailable')) {
        return NextResponse.json({
          success: false,
          code: "RFP_STORAGE_UNAVAILABLE",
          error: "Document upload is temporarily unavailable."
        }, { status: 503 });
      }
      if (msg.includes('Rate limit') || msg.includes('rate limit') || msg.includes('RATE_LIMITED')) {
        return NextResponse.json({ success: false, error: msg }, { status: 429 });
      }
      if (msg === 'Unauthorized') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }
  }

  return NextResponse.json({ error: "Direct client upload via JSON token exchange required" }, { status: 400 });
}
