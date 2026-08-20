import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { del } from "@vercel/blob";
import { compareSignatures } from "@/lib/security";

export async function POST(req: NextRequest) {
  // 1. Authoritative timing-safe authentication check for scheduled cron runner
  const authHeader = req.headers.get('authorization') || '';
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const expectedHeader = `Bearer ${cronSecret}`;
    if (!compareSignatures(authHeader, expectedHeader)) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }
  }

  const rfpToken = process.env.RFP_BLOB_READ_WRITE_TOKEN;
  const now = new Date();
  const oneHourAgo = new Date(Date.now() - 3600 * 1000);
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 3600 * 1000);

  const retentionDays = parseInt(process.env.RFP_ATTACHMENT_RETENTION_DAYS || '90', 10);
  const retentionCutoff = new Date(Date.now() - retentionDays * 24 * 3600 * 1000);

  const results = {
    orphansFound: 0,
    blobsDeleted: 0,
    recordsMarkedDeleted: 0,
    retainedPurged: 0,
    errors: [] as string[],
  };

  try {
    // 2. Find unattached orphan records:
    // - INITIATED / EXPIRED where expiresAt < now
    // - Stale VALIDATING where updatedAt < oneHourAgo
    // - Unattached VALIDATED where createdAt < twentyFourHoursAgo
    // - REJECTED records
    const expiredOrphans = await db.uploadRecord.findMany({
      where: {
        leadId: null,
        OR: [
          { status: { in: ['INITIATED', 'EXPIRED'] }, expiresAt: { lt: now } },
          { status: 'VALIDATING', updatedAt: { lt: oneHourAgo } },
          { status: 'VALIDATED', createdAt: { lt: twentyFourHoursAgo } },
          { status: 'REJECTED' },
        ],
      },
      take: 100, // Batch limit per execution
    });

    results.orphansFound = expiredOrphans.length;

    for (const orphan of expiredOrphans) {
      try {
        // Delete blob from private storage
        if (rfpToken && orphan.pathname) {
          await del(orphan.pathname, { token: rfpToken });
          results.blobsDeleted++;
        }

        // Mark record as DELETED in PostgreSQL
        await db.uploadRecord.update({
          where: { id: orphan.id },
          data: {
            status: 'DELETED',
            quarantineStatus: 'REJECTED',
          },
        });

        results.recordsMarkedDeleted++;
      } catch (err: any) {
        console.error(`[ORPHAN_CLEANUP] Error cleaning upload ${orphan.id}:`, err);
        results.errors.push(`Upload ${orphan.id}: ${err?.message || 'Deletion error'}`);
      }
    }

    // 3. Attached document retention is strictly DISABLED by default until E3 formally approves a retention policy.
    const enableAttachedRetention = process.env.ENABLE_ATTACHED_RFP_RETENTION === 'true';
    const retentionDays = parseInt(process.env.RFP_ATTACHMENT_RETENTION_DAYS || '0', 10);

    if (enableAttachedRetention && retentionDays > 0) {
      const retentionCutoff = new Date(Date.now() - retentionDays * 24 * 3600 * 1000);
      const expiredAttached = await db.uploadRecord.findMany({
        where: {
          status: 'ATTACHED',
          attachedAt: { lt: retentionCutoff },
        },
        take: 50,
      });

      for (const attachedRec of expiredAttached) {
        try {
          if (rfpToken && attachedRec.pathname) {
            await del(attachedRec.pathname, { token: rfpToken });
          }
          await db.uploadRecord.update({
            where: { id: attachedRec.id },
            data: { status: 'DELETED' },
          });
          results.retainedPurged++;
        } catch (err: any) {
          console.error(`[RETENTION_PURGE] Error purging attached upload ${attachedRec.id}:`, err);
          results.errors.push(`Purge ${attachedRec.id}: ${err?.message || 'Purge error'}`);
        }
      }
    }

    // 4. Audit log cleanup job completion
    await db.systemLog.create({
      data: {
        action: "ORPHAN_UPLOADS_CLEANED",
        entity: "UploadRecord",
        metadata: {
          timestamp: now.toISOString(),
          orphansFound: results.orphansFound,
          blobsDeleted: results.blobsDeleted,
          recordsMarkedDeleted: results.recordsMarkedDeleted,
          retainedPurged: results.retainedPurged,
          errorCount: results.errors.length,
        },
      },
    });

    return NextResponse.json({ success: true, ...results });

  } catch (error: any) {
    console.error('[ORPHAN_CLEANUP_JOB_ERROR]', error);
    return NextResponse.json({ error: "Internal Server Error in orphan cleanup" }, { status: 500 });
  }
}
