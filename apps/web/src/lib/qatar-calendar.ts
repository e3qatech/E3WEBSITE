/**
 * qatar-calendar.ts
 *
 * Dedicated Qatar Calendar logic, timezone boundary calculations,
 * event occurrence filtering, and safe booking URL resolution.
 */

export const QATAR_TIMEZONE = 'Asia/Qatar';
export const QATAR_UTC_OFFSET_HOURS = 3; // UTC+3 all year (No DST in Qatar)

export interface QatarDayBoundaries {
  qatarDateString: string; // YYYY-MM-DD in Qatar time
  startUtc: Date;          // Midnight in Qatar represented as UTC Date
  endUtc: Date;            // 23:59:59.999 in Qatar represented as UTC Date
  year: number;
  month: number;           // 1-12
  day: number;
  dayOfWeek: number;       // 0 (Sunday) to 6 (Saturday)
}

/**
 * Parses a date string (YYYY-MM-DD or ISO) or Date object and returns
 * the exact UTC start and end bounds for that full day in Qatar (Asia/Qatar, UTC+3).
 */
export function getQatarDayBoundaries(dateInput?: string | Date | null): QatarDayBoundaries {
  let y: number;
  let m: number; // 1-12
  let d: number;

  if (!dateInput) {
    // Current time in Qatar
    const now = new Date();
    const qatarNow = new Date(now.getTime() + QATAR_UTC_OFFSET_HOURS * 3600 * 1000);
    y = qatarNow.getUTCFullYear();
    m = qatarNow.getUTCMonth() + 1;
    d = qatarNow.getUTCDate();
  } else if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const parts = trimmed.slice(0, 10).split('-').map(Number);
      y = parts[0];
      m = parts[1];
      d = parts[2];
    } else {
      const parsed = new Date(trimmed);
      if (isNaN(parsed.getTime())) {
        return getQatarDayBoundaries(null);
      }
      const qatarParsed = new Date(parsed.getTime() + QATAR_UTC_OFFSET_HOURS * 3600 * 1000);
      y = qatarParsed.getUTCFullYear();
      m = qatarParsed.getUTCMonth() + 1;
      d = qatarParsed.getUTCDate();
    }
  } else {
    const qatarDate = new Date(dateInput.getTime() + QATAR_UTC_OFFSET_HOURS * 3600 * 1000);
    y = qatarDate.getUTCFullYear();
    m = qatarDate.getUTCMonth() + 1;
    d = qatarDate.getUTCDate();
  }

  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  const qatarDateString = `${y}-${mm}-${dd}`;

  // Midnight in Qatar (00:00:00.000 +03:00) is (Day - 3 hours) in UTC
  const startUtc = new Date(Date.UTC(y, m - 1, d, -QATAR_UTC_OFFSET_HOURS, 0, 0, 0));

  // End of day in Qatar (23:59:59.999 +03:00) is (Day + 20:59:59.999) in UTC
  const endUtc = new Date(Date.UTC(y, m - 1, d, 23 - QATAR_UTC_OFFSET_HOURS, 59, 59, 999));

  // Determine day of week in Qatar
  const qatarMidnightRef = new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0));
  const dayOfWeek = qatarMidnightRef.getUTCDay();

  return {
    qatarDateString,
    startUtc,
    endUtc,
    year: y,
    month: m,
    day: d,
    dayOfWeek,
  };
}

export interface BookingAction {
  type: 'BOOK_NOW' | 'VIEW_DETAILS' | 'SEND_INQUIRY';
  url: string;
  isExternal: boolean;
  labelEn: string;
  labelAr: string;
}

/**
 * Resolves safe booking action and prevents self-referencing calendar loops.
 */
export function resolveBookingAction(
  ticketingUrl?: string | null,
  attractionSlug?: string | null,
  locale: string = 'en',
  eventTitle?: string | null
): BookingAction {
  const currentLocale = locale === 'ar' ? 'ar' : 'en';
  const cleanUrl = ticketingUrl ? ticketingUrl.trim() : '';

  // 1. Detect if the ticketing URL is missing, invalid, or self-referencing to the calendar
  const isSelfCalendarLink =
    !cleanUrl ||
    cleanUrl === '#' ||
    cleanUrl === '/calendar' ||
    cleanUrl === '/events' ||
    cleanUrl === '/b2c/calendar' ||
    cleanUrl === '/b2c/events' ||
    cleanUrl === '/en/b2c/calendar' ||
    cleanUrl === '/ar/b2c/calendar' ||
    /^https?:\/\/[^/]+\/(en|ar)?\/?(b2c\/)?(calendar|events)(\/.*)?$/i.test(cleanUrl);

  if (!isSelfCalendarLink) {
    // Check if it is a valid external URL (https:// or http://)
    if (/^https?:\/\//i.test(cleanUrl)) {
      return {
        type: 'BOOK_NOW',
        url: cleanUrl,
        isExternal: true,
        labelEn: 'Book Now',
        labelAr: 'احجز الآن',
      };
    }

    // Check if it is a valid internal route (not calendar loop)
    if (cleanUrl.startsWith('/')) {
      const localizedUrl = cleanUrl.startsWith('/en/') || cleanUrl.startsWith('/ar/')
        ? cleanUrl
        : `/${currentLocale}${cleanUrl}`;

      return {
        type: 'BOOK_NOW',
        url: localizedUrl,
        isExternal: false,
        labelEn: 'Book Now',
        labelAr: 'احجز الآن',
      };
    }
  }

  // 2. Fallback when no valid booking URL exists:
  // If attraction slug exists, offer "View Details" to explore the venue / event page
  if (attractionSlug && attractionSlug.trim() !== '') {
    return {
      type: 'VIEW_DETAILS',
      url: `/${currentLocale}/b2c/attractions/${attractionSlug.trim()}`,
      isExternal: false,
      labelEn: 'View Details',
      labelAr: 'عرض التفاصيل',
    };
  }

  // Otherwise, fallback to localized contact inquiry
  const subjectParam = encodeURIComponent(eventTitle || 'Event Booking Inquiry');
  return {
    type: 'SEND_INQUIRY',
    url: `/${currentLocale}/b2c/contact?subject=${subjectParam}`,
    isExternal: false,
    labelEn: 'Send Inquiry',
    labelAr: 'إرسال استفسار',
  };
}

export interface EventOccurrenceCheckParams {
  startDate: Date | string;
  endDate: Date | string;
  status?: string | null;
  isPublished?: boolean | null;
  isHidden?: boolean | null;
  ruleType?: string | null;
  daysOfWeek?: number[] | null;
}

/**
 * Determines whether a scheduled event or occurrence is active on the given Qatar date.
 */
export function isEventActiveOnQatarDate(
  event: EventOccurrenceCheckParams,
  qatarDateInput: string | Date
): boolean {
  // 1. Check publication status
  if (event.isPublished === false || event.isHidden === true) {
    return false;
  }

  const rawStatus = event.status ? String(event.status).trim().toUpperCase() : 'PUBLISHED';
  if (
    rawStatus === 'DRAFT' ||
    rawStatus === 'UNPUBLISHED' ||
    rawStatus === 'CANCELLED' ||
    rawStatus === 'POSTPONED' ||
    rawStatus === 'ARCHIVED'
  ) {
    return false;
  }

  const bounds = getQatarDayBoundaries(qatarDateInput);

  const start = typeof event.startDate === 'string' ? new Date(event.startDate) : event.startDate;
  const end = typeof event.endDate === 'string' ? new Date(event.endDate) : event.endDate;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  // 2. Overlap check with the target Qatar day
  const overlaps = start <= bounds.endUtc && end >= bounds.startUtc;
  if (!overlaps) {
    return false;
  }

  // 3. If recurring days are specified (e.g. daysOfWeek array 0-6)
  if (event.daysOfWeek && Array.isArray(event.daysOfWeek) && event.daysOfWeek.length > 0) {
    if (!event.daysOfWeek.includes(bounds.dayOfWeek)) {
      return false;
    }
  }

  return true;
}
