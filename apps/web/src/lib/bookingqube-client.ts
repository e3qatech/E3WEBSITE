/**
 * Client-Safe BookingQube Integration Helper.
 * Pure, dependency-free utility for generating checkout URLs.
 * Zero database, zero Redis, zero secret-loaders, zero server-environment dependencies.
 */

const BOOKINGQUBE_BASE_URL = process.env.NEXT_PUBLIC_BOOKINGQUBE_URL || 'https://booking.e3.qa';

export interface TimeSlot {
  timeSlot: string;
  available: boolean;
  total: number;
  price: number;
}

/**
 * Generates a deep link to the BookingQube checkout flow.
 * Client-safe, zero server secret dependencies.
 */
export function generateTicketUrl(
  attractionId: string,
  ticketTypeId: string,
  quantity: number = 1,
  date?: string
): string {
  const url = new URL(`${BOOKINGQUBE_BASE_URL}/book`);
  url.searchParams.set('attraction', attractionId);
  url.searchParams.set('ticket', ticketTypeId);
  url.searchParams.set('qty', quantity.toString());

  if (date) {
    url.searchParams.set('date', date);
  }

  return url.toString();
}
