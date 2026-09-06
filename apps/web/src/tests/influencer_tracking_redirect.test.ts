import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveTrackingLinkRedirect } from '@/lib/influencer/attribution-service';
import { GET as getRedirect } from '@/app/api/influencer/t/[shortCode]/route';
import { NextRequest } from 'next/server';

// Mock database
vi.mock('@/lib/db', () => {
  const store = new Map<string, any>();
  return {
    default: {
      trackingLink: {
        findUnique: vi.fn(async ({ where }: { where: { shortCode: string } }) => {
          return store.get(where.shortCode) || null;
        }),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const items = Array.from(store.values());
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.id === where.id) {
              if (data.clickCount?.increment) {
                item.clickCount += data.clickCount.increment;
              }
              return item;
            }
          }
          return null;
        }),
      },
      __store: store,
    },
    db: {
      trackingLink: {
        findUnique: vi.fn(async ({ where }: { where: { shortCode: string } }) => {
          return store.get(where.shortCode) || null;
        }),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const items = Array.from(store.values());
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.id === where.id) {
              if (data.clickCount?.increment) {
                item.clickCount += data.clickCount.increment;
              }
              return item;
            }
          }
          return null;
        }),
      },
    }
  };
});

describe('Tracking Link Redirect & Click Attribution', () => {
  let dbModule: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    dbModule = await import('@/lib/db');
    dbModule.default.__store.clear();

    // Populate mock tracking link
    dbModule.default.__store.set('E3SUMMER26', {
      id: 'trk_123',
      shortCode: 'E3SUMMER26',
      campaignId: 'camp_456',
      campaignCreatorId: 'cc_789',
      destinationUrl: 'https://e3.qa/en/tickets?eventId=ev_99',
      utmSource: 'influencer',
      utmMedium: 'creator',
      utmCampaign: 'summer_carnival_2026',
      utmContent: 'dana_story_1',
      clickCount: 15,
      campaign: { id: 'camp_456', titleEn: 'Summer Carnival 2026' },
      campaignCreator: { id: 'cc_789', influencer: { displayName: 'Dana Al-Ansari' } },
    });
  });

  it('resolves valid shortCode, increments clickCount, and appends UTM parameters', async () => {
    const result = await resolveTrackingLinkRedirect('E3SUMMER26');
    expect(result.found).toBe(true);
    expect(result.redirectUrl).toBeDefined();

    const parsed = new URL(result.redirectUrl!);
    expect(parsed.origin).toBe('https://e3.qa');
    expect(parsed.pathname).toBe('/en/tickets');
    expect(parsed.searchParams.get('eventId')).toBe('ev_99');
    expect(parsed.searchParams.get('utm_source')).toBe('influencer');
    expect(parsed.searchParams.get('utm_medium')).toBe('creator');
    expect(parsed.searchParams.get('utm_campaign')).toBe('summer_carnival_2026');
    expect(parsed.searchParams.get('utm_content')).toBe('dana_story_1');
    expect(parsed.searchParams.get('ref_code')).toBe('E3SUMMER26');

    // Verify clickCount incremented
    const stored = dbModule.default.__store.get('E3SUMMER26');
    expect(stored.clickCount).toBe(16);
  });

  it('handles case-insensitivity on shortCode', async () => {
    const result = await resolveTrackingLinkRedirect('  e3summer26  ');
    expect(result.found).toBe(true);
    expect(result.link.id).toBe('trk_123');
  });

  it('returns found: false when shortCode does not exist', async () => {
    const result = await resolveTrackingLinkRedirect('UNKNOWN_CODE');
    expect(result.found).toBe(false);
    expect(result.redirectUrl).toBeNull();
  });

  it('API route returns 307 redirect on valid short link', async () => {
    const req = new NextRequest('https://e3.qa/api/influencer/t/E3SUMMER26');
    const response = await getRedirect(req, { params: Promise.resolve({ shortCode: 'E3SUMMER26' }) });

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toContain('https://e3.qa/en/tickets');
    expect(location).toContain('utm_campaign=summer_carnival_2026');
  });

  it('API route returns 404 on missing short link', async () => {
    const req = new NextRequest('https://e3.qa/api/influencer/t/NOT_FOUND');
    const response = await getRedirect(req, { params: Promise.resolve({ shortCode: 'NOT_FOUND' }) });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Tracking link not found');
  });
});
