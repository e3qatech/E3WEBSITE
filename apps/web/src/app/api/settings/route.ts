import { NextResponse } from "next/server";
import { auth } from '@/lib/auth';
import db from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import {
  resolvePublicSiteSettings,
  getMaskedAdminSettings,
  isSensitiveKey,
  isMaskedOrBlankSecretSubmission,
  revalidateSettingsCache,
  BOOKINGQUBE_CANONICAL_KEY,
  BOOKINGQUBE_LEGACY_KEY_ALIASES,
} from "@/lib/settings/public-settings";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
  }

  const userRole = (session.user as any)?.role;
  const isAuthorized = hasPermission(userRole, 'settings.general.manage');

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
  }

  try {
    const { key, value, type } = await req.json();

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const settingModel = (db as any).siteSettings || (db as any).setting;
    if (!settingModel) {
      return NextResponse.json({ error: "Database model not available" }, { status: 500 });
    }

    // 1. Reject direct writes using any legacy alias
    if ((BOOKINGQUBE_LEGACY_KEY_ALIASES as readonly string[]).includes(key)) {
      return NextResponse.json(
        {
          error: `Direct writes to legacy alias "${key}" are prohibited. Use the canonical key "${BOOKINGQUBE_CANONICAL_KEY}".`,
          action: 'REJECTED_LEGACY_ALIAS',
        },
        { status: 400 }
      );
    }

    // 2. Canonical BookingQube Credential Storage Decision Matrix
    if (key === BOOKINGQUBE_CANONICAL_KEY) {
      if (isMaskedOrBlankSecretSubmission(value)) {
        return NextResponse.json({
          success: true,
          action: 'PRESERVED',
          message: `Existing credential for "${key}" preserved.`,
        });
      }

      const allBqKeys = [BOOKINGQUBE_CANONICAL_KEY, ...BOOKINGQUBE_LEGACY_KEY_ALIASES];
      const existingRows = await settingModel.findMany({
        where: {
          key: { in: allBqKeys },
        },
      });

      // Case C: Multiple representations exist -> return 409 Conflict with zero mutations
      if (existingRows.length > 1) {
        return NextResponse.json(
          {
            error: 'Multiple conflicting BookingQube credential records exist in storage. Manual administrative review required.',
            conflict: true,
            action: 'REVIEW_REQUIRED',
          },
          { status: 409 }
        );
      }

      // Case B: Exactly 1 legacy row exists (and canonical is absent) -> update legacy row in place
      if (existingRows.length === 1 && existingRows[0].key !== BOOKINGQUBE_CANONICAL_KEY) {
        const legacyTargetKey = existingRows[0].key;
        const setting = await settingModel.update({
          where: { key: legacyTargetKey },
          data: { value: String(value).trim(), type: type || existingRows[0].type || "INTEGRATION" },
        });

        await revalidateSettingsCache();
        return NextResponse.json({
          success: true,
          action: 'UPDATED',
          setting: { key: legacyTargetKey, type: setting.type, updatedAt: setting.updatedAt },
        });
      }

      // Case A: Exactly 1 canonical row exists -> update canonical row
      if (existingRows.length === 1 && existingRows[0].key === BOOKINGQUBE_CANONICAL_KEY) {
        const setting = await settingModel.update({
          where: { key: BOOKINGQUBE_CANONICAL_KEY },
          data: { value: String(value).trim(), type: type || existingRows[0].type || "INTEGRATION" },
        });

        await revalidateSettingsCache();
        return NextResponse.json({
          success: true,
          action: 'UPDATED',
          setting: { key: setting.key, type: setting.type, updatedAt: setting.updatedAt },
        });
      }

      // Case D: Zero rows exist -> create canonical row
      const setting = await settingModel.create({
        data: { key: BOOKINGQUBE_CANONICAL_KEY, value: String(value).trim(), type: type || "INTEGRATION" },
      });

      await revalidateSettingsCache();
      return NextResponse.json({
        success: true,
        action: 'UPDATED',
        setting: { key: setting.key, type: setting.type, updatedAt: setting.updatedAt },
      });
    }

    // 3. Generic Sensitive Secret Write-Only Replacement
    if (isSensitiveKey(key)) {
      if (isMaskedOrBlankSecretSubmission(value)) {
        return NextResponse.json({
          success: true,
          action: 'PRESERVED',
          message: `Existing credential for "${key}" preserved.`,
        });
      }

      const setting = await settingModel.upsert({
        where: { key },
        update: { value: String(value).trim(), type: type || "INTEGRATION" },
        create: { key, value: String(value).trim(), type: type || "INTEGRATION" },
      });

      await revalidateSettingsCache();
      return NextResponse.json({
        success: true,
        action: 'UPDATED',
        setting: { key: setting.key, type: setting.type, updatedAt: setting.updatedAt },
      });
    }

    // 4. Standard public/presentation setting update
    const setting = await settingModel.upsert({
      where: { key },
      update: { value, type: type || "GENERAL" },
      create: { key, value, type: type || "GENERAL" },
    });

    await revalidateSettingsCache();

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error("Error saving setting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const adminMode = searchParams.get('admin') === 'true';

    // 1. Admin / Manager View: Enforce strict auth and capability check
    if (adminMode) {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
      }

      const userRole = (session.user as any)?.role;
      const isAuthorized = hasPermission(userRole, 'settings.general.manage');

      if (!isAuthorized) {
        return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
      }

      const settingModel = (db as any).siteSettings || (db as any).setting;
      let settings: any[] = [];
      if (settingModel) {
        if (type) {
          settings = await settingModel.findMany({ where: { type: type as any } });
        } else {
          settings = await settingModel.findMany();
        }
      }

      const maskedData = getMaskedAdminSettings(settings || []);
      return NextResponse.json({
        success: true,
        data: maskedData,
        isAuthorized: true,
      });
    }

    // 2. Canonical Public View (Strict allowlist DTO only)
    const settingModel = (db as any).siteSettings || (db as any).setting;
    let settings: any[] = [];
    if (settingModel) {
      if (type) {
        settings = await settingModel.findMany({ where: { type: type as any } });
      } else {
        settings = await settingModel.findMany();
      }
    }

    const publicData = resolvePublicSiteSettings(settings || []);

    return NextResponse.json({
      success: true,
      data: publicData,
      settings: Object.entries(publicData).map(([key, value]) => ({ key, value })),
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
