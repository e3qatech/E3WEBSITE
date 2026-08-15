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

    // Write-Only Replacement Semantics for Sensitive Credentials:
    // If a secret is submitted with empty, whitespace, or masked placeholder, retain the existing stored secret.
    if (isSensitiveKey(key)) {
      if (isMaskedOrBlankSecretSubmission(value)) {
        return NextResponse.json({
          success: true,
          action: 'PRESERVED',
          message: `Existing credential for "${key}" preserved.`,
        });
      }

      // New credential provided: update securely in storage
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

    // Standard public/presentation setting update
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
