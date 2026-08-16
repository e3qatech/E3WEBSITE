import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getCalendarRoute } from '@/app/api/calendar/route';
import { db } from '@/lib/db';

describe('Calendar Attraction Visibility & Schedule Resolution', () => {
  it('returns active published attractions on any queried date', async () => {
    const req = new NextRequest('http://localhost/api/calendar?startDate=2026-08-16&endDate=2026-08-16&locale=en');
    const res = await getCalendarRoute(req);
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    // Verify properties of active attraction schedule items
    const item = data[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('attractionId');
    expect(item).toHaveProperty('attractionNameEn');
    expect(item).toHaveProperty('attractionNameAr');
    expect(item).toHaveProperty('title');
    expect(item).toHaveProperty('startTime');
    expect(item).toHaveProperty('endTime');
    expect(item).toHaveProperty('eventType');
    expect(item).toHaveProperty('bookingAction');
    expect(item.bookingAction).toHaveProperty('url');
  });

  it('provides full Arabic localization when locale=ar is specified', async () => {
    const req = new NextRequest('http://localhost/api/calendar?startDate=2026-08-16&endDate=2026-08-16&locale=ar');
    const res = await getCalendarRoute(req);
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.length).toBeGreaterThan(0);

    // Check Arabic titles and booking actions
    const hasArabicTitle = data.some((d: any) => d.title && /[\u0600-\u06FF]/.test(d.title));
    expect(hasArabicTitle).toBe(true);

    const first = data[0];
    expect(first.bookingAction.labelAr).toBeDefined();
    expect(/[\u0600-\u06FF]/.test(first.bookingAction.labelAr)).toBe(true);
  });

  it('filters active attractions by attraction ID', async () => {
    // First get all
    const allReq = new NextRequest('http://localhost/api/calendar?startDate=2026-08-16&endDate=2026-08-16');
    const allRes = await getCalendarRoute(allReq);
    const allData = await allRes.json();
    expect(allData.length).toBeGreaterThan(1);

    const targetAttractionId = allData[0].attractionId;

    // Filter by target attraction
    const filterReq = new NextRequest(`http://localhost/api/calendar?startDate=2026-08-16&endDate=2026-08-16&attractions=${encodeURIComponent(targetAttractionId)}`);
    const filterRes = await getCalendarRoute(filterReq);
    const filterData = await filterRes.json();

    expect(filterData.length).toBeGreaterThanOrEqual(1);
    expect(filterData.every((d: any) => d.attractionId === targetAttractionId)).toBe(true);
  });

  it('never returns 500 when database throws an error (cold start / offline recovery)', async () => {
    vi.spyOn(db.calendarEvent, 'findMany').mockRejectedValue(new Error('Connection terminated'));
    vi.spyOn(db.eventSchedule, 'findMany').mockRejectedValue(new Error('Connection terminated'));
    vi.spyOn(db.attraction, 'findMany').mockRejectedValue(new Error('Connection terminated'));

    const req = new NextRequest('http://localhost/api/calendar?startDate=2026-08-16&endDate=2026-08-16');
    const res = await getCalendarRoute(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });
});
