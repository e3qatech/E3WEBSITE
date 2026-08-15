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
const DEFAULT_FALLBACK_API_KEY = process.env.BOOKINGQUBE_API_KEY || 'mock_api_key';

/**
 * Canonical BookingQube API Key resolution with deterministic read-only fallback to legacy aliases.
 * Does not copy, rewrite, or duplicate stored records.
 */
export async function resolveBookingQubeApiKey(): Promise<string> {
  const secret = await getServerSecretSetting('bookingQubeApiKey');
  return secret || DEFAULT_FALLBACK_API_KEY;
}

/**
 * Checks live ticket availability using Next.js fetch cache (30 seconds).
 * Protected server-side execution only.
 */
export async function checkAvailability(attractionId: string, date: string): Promise<TimeSlot[]> {
  try {
    const apiKey = await resolveBookingQubeApiKey();
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
