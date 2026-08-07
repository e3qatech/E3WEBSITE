import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import {
  GatewayCustomizationPayload,
  DEFAULT_GATEWAY_CMS_PAYLOAD,
  MediaHolderConfig,
} from '@/types/gateway-cms';

const ALLOWED_IFRAME_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
  'spline.design',
  'prod.spline.design',
  'my.spline.design',
  'booking.e3.qa',
  'cdn.e3.qa',
  'e3.qa',
  'images.unsplash.com',
  'public.blob.vercel-storage.com',
];

function validateMediaHolder(media: MediaHolderConfig, name: string): string | null {
  if (!media.fallbackImageUrl) {
    return `${name}: Mandatory fallback image URL is required.`;
  }

  if (media.mediaType === 'IFRAME') {
    if (!media.mediaUrl.startsWith('https://')) {
      return `${name}: Iframe media URL must use HTTPS protocol.`;
    }
    try {
      const parsedUrl = new URL(media.mediaUrl);
      const host = parsedUrl.hostname.toLowerCase();
      const isAllowed = ALLOWED_IFRAME_DOMAINS.some(
        (domain) => host === domain || host.endsWith(`.${domain}`)
      );
      if (!isAllowed) {
        return `${name}: Iframe domain "${host}" is not in the approved domain allowlist.`;
      }
    } catch (_e) {
      return `${name}: Invalid iframe URL.`;
    }
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'published'; // 'published' | 'draft'

    const key = mode === 'draft' ? 'gateway_customization_draft' : 'gateway_customization_published';

    const record = await db.setting.findUnique({
      where: { key },
    });

    if (record && record.value) {
      const payload = record.value as unknown as GatewayCustomizationPayload;
      // Merge safe defaults for new living threshold features
      const mergedPayload: GatewayCustomizationPayload = {
        ...DEFAULT_GATEWAY_CMS_PAYLOAD,
        ...payload,
        experienceConfig: { ...DEFAULT_GATEWAY_CMS_PAYLOAD.experienceConfig, ...(payload.experienceConfig || {}) } as any,
        waterAndSandPhysics: { ...DEFAULT_GATEWAY_CMS_PAYLOAD.waterAndSandPhysics, ...(payload.waterAndSandPhysics || {}) } as any,
        atmospherePresets: payload.atmospherePresets || DEFAULT_GATEWAY_CMS_PAYLOAD.atmospherePresets,
        weatherRules: payload.weatherRules || DEFAULT_GATEWAY_CMS_PAYLOAD.weatherRules,
        campaigns: payload.campaigns || DEFAULT_GATEWAY_CMS_PAYLOAD.campaigns,
        announcements: payload.announcements || DEFAULT_GATEWAY_CMS_PAYLOAD.announcements,
      };

      return NextResponse.json({
        success: true,
        data: mergedPayload,
      });
    }

    return NextResponse.json({
      success: true,
      data: DEFAULT_GATEWAY_CMS_PAYLOAD,
    });
  } catch (error) {
    console.error('[GATEWAY_SETTINGS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!session?.user || !['SUPER_ADMIN', 'SALES_ADMIN', 'SUPPORT_ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const body = await req.json();
    const { action, payload } = body as {
      action: 'save_draft' | 'publish';
      payload: GatewayCustomizationPayload;
    };

    if (!payload || !payload.english || !payload.arabic) {
      return NextResponse.json({ error: 'Invalid payload: missing English or Arabic content' }, { status: 400 });
    }

    // Validate media holders
    const b2cDeskErr = validateMediaHolder(payload.b2cDesktopMedia, 'B2C Desktop Media');
    if (b2cDeskErr) return NextResponse.json({ error: b2cDeskErr }, { status: 400 });

    const b2cMobErr = validateMediaHolder(payload.b2cMobileMedia, 'B2C Mobile Media');
    if (b2cMobErr) return NextResponse.json({ error: b2cMobErr }, { status: 400 });

    const b2bDeskErr = validateMediaHolder(payload.b2bDesktopMedia, 'B2B Desktop Media');
    if (b2bDeskErr) return NextResponse.json({ error: b2bDeskErr }, { status: 400 });

    const b2bMobErr = validateMediaHolder(payload.b2bMobileMedia, 'B2B Mobile Media');
    if (b2bMobErr) return NextResponse.json({ error: b2bMobErr }, { status: 400 });

    // Enforce safety limits in code
    if (payload.waterAndSandPhysics) {
      payload.waterAndSandPhysics.waterMaxHeightPercent = Math.min(
        payload.waterAndSandPhysics.waterMaxHeightPercent || 15,
        40
      );
      payload.waterAndSandPhysics.sandMaxHeightPercent = Math.min(
        payload.waterAndSandPhysics.sandMaxHeightPercent || 10,
        30
      );
    }

    const updatedAt = new Date().toISOString();
    const updatedPayload: GatewayCustomizationPayload = {
      ...payload,
      updatedAt,
    };

    // Save Draft
    await db.setting.upsert({
      where: { key: 'gateway_customization_draft' },
      update: {
        value: { ...updatedPayload, status: 'DRAFT' } as any,
        type: 'UI',
      },
      create: {
        key: 'gateway_customization_draft',
        value: { ...updatedPayload, status: 'DRAFT' } as any,
        type: 'UI',
      },
    });

    if (action === 'publish') {
      await db.setting.upsert({
        where: { key: 'gateway_customization_published' },
        update: {
          value: { ...updatedPayload, status: 'PUBLISHED' } as any,
          type: 'UI',
        },
        create: {
          key: 'gateway_customization_published',
          value: { ...updatedPayload, status: 'PUBLISHED' } as any,
          type: 'UI',
        },
      });

      // Append version snapshot to gateway_experience_versions
      try {
        const versionRecord = await db.setting.findUnique({ where: { key: 'gateway_experience_versions' } });
        const existingVersions = versionRecord?.value ? (versionRecord.value as any[]) : [];
        const nextVersionNumber = existingVersions.length + 1;

        const newVersionSnapshot = {
          version: nextVersionNumber,
          publishedAt: updatedAt,
          publishedBy: session.user.email || 'Admin',
          releaseNotes: `Published version ${nextVersionNumber} via Gateway Experience Composer CMS`,
          snapshot: updatedPayload,
        };

        const updatedVersions = [newVersionSnapshot, ...existingVersions].slice(0, 20); // Keep last 20

        await db.setting.upsert({
          where: { key: 'gateway_experience_versions' },
          update: { value: updatedVersions as any, type: 'UI' },
          create: { key: 'gateway_experience_versions', value: updatedVersions as any, type: 'UI' },
        });
      } catch (_e) {
        console.warn('[GATEWAY_VERSION_SNAPSHOT_NOTICE]', _e);
      }
    }

    return NextResponse.json({
      success: true,
      action,
      data: action === 'publish' ? { ...updatedPayload, status: 'PUBLISHED' } : { ...updatedPayload, status: 'DRAFT' },
    });
  } catch (error) {
    console.error('[GATEWAY_SETTINGS_POST_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update gateway customization' }, { status: 500 });
  }
}
