import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [providers, accounts, syncJobs, syncErrors, globalSettings] = await Promise.all([
      db.socialProviderConfig.findMany({ select: { id: true, provider: true, enabled: true, appId: true, apiVersion: true, updatedAt: true } }),
      db.socialAccount.findMany({ select: { id: true, provider: true, internalName: true, username: true, status: true, autoSyncEnabled: true, lastSuccessfulSync: true, lastSyncAttempt: true, tokenExpiresAt: true } }),
      db.socialSyncJob.findMany({ take: 10, orderBy: { startTime: 'desc' }, select: { id: true, provider: true, status: true, startTime: true, durationMs: true, recordsCreated: true, recordsUpdated: true, recordsFailed: true } }),
      db.socialSyncError.findMany({ take: 10, orderBy: { createdAt: 'desc' }, select: { id: true, provider: true, errorMessage: true, isResolved: true, createdAt: true } }),
      db.socialGlobalSettings.findUnique({ where: { id: 'default' } }),
    ]);

    const report = {
      systemTimestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      globalSettings: globalSettings || { syncIntervalMinutes: 30, publicFeedsEnabled: true },
      summary: {
        totalProviders: providers.length,
        enabledProviders: providers.filter((p: any) => p.enabled).length,
        totalAccounts: accounts.length,
        healthyAccounts: accounts.filter((a: any) => a.status === 'HEALTHY' || a.status === 'CONNECTED').length,
        errorAccounts: accounts.filter((a: any) => a.status === 'ERROR' || a.status === 'ACTION_REQUIRED').length,
        recentErrorsCount: syncErrors.filter((e: any) => !e.isResolved).length,
      },
      providers: providers.map((p: any) => ({
        provider: p.provider,
        enabled: p.enabled,
        appIdSet: Boolean(p.appId),
        apiVersion: p.apiVersion,
        lastConfigUpdate: p.updatedAt,
      })),
      accounts,
      recentSyncJobs: syncJobs,
      activeErrors: syncErrors,
    };

    return NextResponse.json({ success: true, data: report });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
