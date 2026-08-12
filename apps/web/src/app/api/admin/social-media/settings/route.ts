import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let settings = await db.socialGlobalSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await db.socialGlobalSettings.create({
        data: { id: 'default' },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const updated = await db.socialGlobalSettings.upsert({
      where: { id: 'default' },
      update: {
        ...(body.syncIntervalMinutes !== undefined && { syncIntervalMinutes: Number(body.syncIntervalMinutes) }),
        ...(body.defaultModeration !== undefined && { defaultModeration: body.defaultModeration }),
        ...(body.defaultFeedMode !== undefined && { defaultFeedMode: body.defaultFeedMode }),
        ...(body.defaultMaxPosts !== undefined && { defaultMaxPosts: Number(body.defaultMaxPosts) }),
        ...(body.dataRetentionDays !== undefined && { dataRetentionDays: Number(body.dataRetentionDays) }),
        ...(body.showEngagementMetrics !== undefined && { showEngagementMetrics: body.showEngagementMetrics }),
        ...(body.notifyOnSyncFailure !== undefined && { notifyOnSyncFailure: body.notifyOnSyncFailure }),
        ...(body.notifyOnTokenExpiry !== undefined && { notifyOnTokenExpiry: body.notifyOnTokenExpiry }),
        ...(body.publicFeedsEnabled !== undefined && { publicFeedsEnabled: body.publicFeedsEnabled }),
        ...(body.enableManualEmbeds !== undefined && { enableManualEmbeds: body.enableManualEmbeds }),
      },
      create: {
        id: 'default',
        ...body,
      },
    });

    await db.socialAuditLog.create({
      data: {
        action: 'SETTINGS_UPDATE',
        targetType: 'GLOBAL_SETTINGS',
        targetId: 'default',
        summary: 'Updated global social media feed settings',
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
