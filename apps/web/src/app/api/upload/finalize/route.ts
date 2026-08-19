import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { isValidMagicBytes, isValidDocxStructure } from "@/lib/security";
import { get, del } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uploadId } = body;

    if (!uploadId) {
      return NextResponse.json({ error: "Missing uploadId parameter" }, { status: 400 });
    }

    // Resolve upload session token
    let sessionToken: string | undefined = undefined;
    try {
      const cookieStore = await cookies();
      sessionToken = cookieStore.get('e3_upload_session')?.value;
    } catch {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/e3_upload_session=([^;]+)/);
      if (match) sessionToken = match[1];
    }

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized upload session" }, { status: 401 });
    }

    const expectedSessionHash = createHash('sha256').update(sessionToken).digest('hex');

    // 1. Atomic conditional state claim: INITIATED -> VALIDATING
    const claimResult = await db.uploadRecord.updateMany({
      where: {
        id: uploadId,
        sessionHash: expectedSessionHash,
        status: 'INITIATED',
        expiresAt: { gt: new Date() },
      },
      data: {
        status: 'VALIDATING',
      }
    });

    if (claimResult.count !== 1) {
      // Check if it's already validated or expired
      const existing = await db.uploadRecord.findUnique({ where: { id: uploadId } });
      if (!existing) {
        return NextResponse.json({ error: "Upload record not found" }, { status: 404 });
      }
      if (existing.sessionHash !== expectedSessionHash) {
        return NextResponse.json({ error: "Upload session mismatch" }, { status: 403 });
      }
      if (existing.status === 'VALIDATING' || existing.status === 'VALIDATED') {
        return NextResponse.json({ error: "Upload is already being processed or validated" }, { status: 409 });
      }
      return NextResponse.json({ error: `Upload is not in a finalizable state (${existing.status})` }, { status: 400 });
    }

    // 2. Load authoritative record and server-controlled pathname
    const record = await db.uploadRecord.findUnique({
      where: { id: uploadId },
    });

    if (!record) {
      return NextResponse.json({ error: "Upload record not found" }, { status: 404 });
    }

    const authoritativePathname = record.pathname;

    const rfpToken = process.env.RFP_BLOB_READ_WRITE_TOKEN;
    if (!rfpToken) {
      await db.uploadRecord.update({
        where: { id: uploadId },
        data: { status: 'REJECTED' },
      });
      return NextResponse.json({ error: "Dedicated private RFP storage is unconfigured" }, { status: 503 });
    }

    // 3. Retrieve private blob from dedicated store
    let blobData: any = null;
    try {
      blobData = await get(authoritativePathname, {
        access: 'private',
        token: rfpToken,
      } as any);
    } catch (fetchErr) {
      console.error('[FINALIZE] Failed to retrieve blob from storage:', fetchErr);
      await db.uploadRecord.update({
        where: { id: uploadId },
        data: { status: 'REJECTED' },
      });
      return NextResponse.json({ error: "Failed to retrieve uploaded file from private store" }, { status: 502 });
    }

    const stream = blobData?.stream || blobData?.body;
    if (!blobData || !stream) {
      await db.uploadRecord.update({
        where: { id: uploadId },
        data: { status: 'REJECTED' },
      });
      return NextResponse.json({ error: "Uploaded blob not found in private store" }, { status: 404 });
    }

    // Authoritative size check (25MB limit)
    const declaredSize = blobData?.blob?.size || blobData?.size || 0;
    if (declaredSize > 25 * 1024 * 1024) {
      try {
        await del(authoritativePathname, { token: rfpToken });
      } catch (delErr) {
        console.warn('[FINALIZE] Oversized cleanup deletion notice:', delErr);
      }
      await db.uploadRecord.update({
        where: { id: uploadId },
        data: { status: 'REJECTED' },
      });
      return NextResponse.json({ error: "File size exceeds 25MB limit" }, { status: 400 });
    }

    // 4. Read buffer and perform deep validation
    const arrayBuffer = await new Response(stream).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > 25 * 1024 * 1024) {
      try {
        await del(authoritativePathname, { token: rfpToken });
      } catch (delErr) {
        console.warn('[FINALIZE] Oversized buffer cleanup notice:', delErr);
      }
      await db.uploadRecord.update({
        where: { id: uploadId },
        data: { status: 'REJECTED' },
      });
      return NextResponse.json({ error: "File size exceeds 25MB limit" }, { status: 400 });
    }

    const ext = record.extension.toLowerCase();

    // Validate magic bytes
    if (!isValidMagicBytes(buffer, ext)) {
      try {
        await del(authoritativePathname, { token: rfpToken });
      } catch (delErr) {
        console.warn('[FINALIZE] Cleanup deletion notice:', delErr);
      }

      await db.uploadRecord.update({
        where: { id: uploadId },
        data: { status: 'REJECTED' },
      });

      return NextResponse.json({ error: "File validation failed: invalid file signature" }, { status: 400 });
    }

    // Deep DOCX validation with JSZip
    if (ext === 'docx') {
      const docxCheck = await isValidDocxStructure(buffer);
      if (!docxCheck.valid) {
        try {
          await del(authoritativePathname, { token: rfpToken });
        } catch (delErr) {
          console.warn('[FINALIZE] Cleanup deletion notice:', delErr);
        }

        await db.uploadRecord.update({
          where: { id: uploadId },
          data: { status: 'REJECTED' },
        });

        return NextResponse.json({ error: `File validation failed: ${docxCheck.error}` }, { status: 400 });
      }
    }

    const sha256Hash = createHash('sha256').update(buffer).digest('hex');

    // 5. Update DB record: VALIDATING -> VALIDATED
    const updated = await db.uploadRecord.update({
      where: { id: uploadId },
      data: {
        status: 'VALIDATED',
        quarantineStatus: 'UNSCANNED',
        sizeBytes: buffer.length,
        sha256: sha256Hash,
      },
    });

    return NextResponse.json({
      success: true,
      uploadId: updated.id,
      fileName: updated.originalFilename,
      fileSize: updated.sizeBytes,
      sha256: updated.sha256,
      quarantineStatus: 'UNSCANNED',
    });

  } catch (error: any) {
    console.error('[FINALIZE ERROR]', error);
    return NextResponse.json({ error: "Internal Server Error during file finalization" }, { status: 500 });
  }
}
