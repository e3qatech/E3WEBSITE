import 'server-only';
/**
 * BookingQube Server Integration Library.
 * Protected server-only module for live availability requests and authenticated provider communication.
 * Strictly protected with 'server-only'. Never importable by client components.
 */
import { getServerSecretSetting } from '@/lib/settings/public-settings';
import type { TimeSlot } from './bookingqube-client';

export type { TimeSlot };

const BOOKINGQUBE_BASE_URL = process.env.NEXT_PUBLIC_BOOKINGQUBE_URL || 'https://booking.e3.qa';

/**
 * Canonical BookingQube API Key resolution with deterministic read-only fallback to legacy aliases.
 * Does not copy, rewrite, or duplicate stored records.
 * Fails closed with null if no credential is configured.
 */
export async function resolveBookingQubeApiKey(): Promise<string | null> {
  const secret = await getServerSecretSetting('bookingQubeApiKey');
  return secret || null;
}

/**
 * Checks live ticket availability using Next.js fetch cache (30 seconds).
 * Protected server-side execution only.
 * Fails closed without making any provider fetch request if no protected credential resolves.
 */
export async function checkAvailability(attractionId: string, date: string): Promise<TimeSlot[]> {
  try {
    const apiKey = await resolveBookingQubeApiKey();
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      // Fail closed: no network request, safe unavailable result
      return [];
    }

    const response = await fetch(
      `${BOOKINGQUBE_BASE_URL}/api/v1/availability?attraction=${encodeURIComponent(attractionId)}&date=${encodeURIComponent(date)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      console.error(`[BOOKINGQUBE_API_ERROR] Status: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.timeSlots || [];
  } catch (error) {
    console.error('[BOOKINGQUBE_AVAILABILITY_ERROR] Failed to fetch availability:', error);
    return [];
  }
}
