export type AvailabilitySource = 'NONE' | 'MANUAL' | 'BOOKINGQUBE' | 'SENSOR' | 'OTHER_VERIFIED_API'
export type BookingMode = 'NONE' | 'BOOKINGQUBE_PRODUCT' | 'EXTERNAL_URL' | 'INTERNAL_ROUTE' | 'CONTACT'

export interface ResolvedAvailability {
  isFresh: boolean
  displayLabelEn: string
  displayLabelAr: string
  percentage?: number
  currentCount?: number
  maxCapacity?: number
  statusTagEn: string
  statusTagAr: string
  isOpen: boolean
}

export interface AttractionFilterParams {
  search?: string
  story?: string
  category?: string
  age?: string
  indoorOutdoor?: string
  venueId?: string
  openNow?: boolean
  happeningToday?: boolean
  bookingAvailable?: boolean
  sortBy?: 'relevance' | 'soonest' | 'name'
}

export function parseFlexibleDate(dateInput?: string | Date | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;
  if (typeof dateInput !== 'string') return null;

  const trimmed = dateInput.trim();
  if (!trimmed) return null;

  // DD-MM-YYYY or DD/MM/YYYY (e.g. 13-08-2025 or 13/08/2025)
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day, 23, 59, 59, 999);
    if (!isNaN(d.getTime())) return d;
  }

  // YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day, 23, 59, 59, 999);
    if (!isNaN(d.getTime())) return d;
  }

  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    if (trimmed.length <= 10) {
      d.setHours(23, 59, 59, 999);
    }
    return d;
  }
  return null;
}

/**
 * Strict active attraction verification by current/target date
 * Excludes drafts, inactive/closed attractions, and past/expired events.
 */
export function isAttractionActiveByDate(item: any, targetDateInput?: Date | string | null | unknown): boolean {
  if (!item) return false;

  // 1. Explicit Published & Draft Checks
  if (item.isPublished === false) return false;
  if (item.isHidden === true) return false;

  const status = String(item.operationalStatus || item.status || item.computedStatus || item.lifecycleStatus || '').toUpperCase().trim();
  if (['ENDED', 'INACTIVE', 'PAST', 'CLOSED', 'TEMPORARILY_CLOSED', 'DRAFT', 'ARCHIVED'].includes(status)) {
    return false;
  }

  const targetDate = typeof targetDateInput === 'string' || targetDateInput instanceof Date
    ? new Date(targetDateInput)
    : new Date();
  const now = isNaN(targetDate.getTime()) ? new Date() : targetDate;

  // 2. Temporal Status / Override Checks
  const temporal = item.temporalStatus || item.temporal || {};
  if (temporal.statusOverride) {
    if (temporal.statusOverride === 'FORCE_ACTIVE') return true;
    if (temporal.statusOverride === 'FORCE_PAST' || temporal.statusOverride === 'FORCE_INCOMING') return false;
  }

  if (temporal.adminStatusOverride) {
    const adminStatus = String(temporal.adminStatusOverride).toLowerCase().trim();
    if (['closed', 'archived', 'inactive', 'draft'].includes(adminStatus)) return false;
    if (['live', 'active'].includes(adminStatus)) return true;
  }

  // 3. Date Boundaries (Check Event Schedule, Session Settings, Temporal, Operations)
  const eventDetails = item.eventDetails || {};
  const operations = item.operations || {};

  const rawStartDate = eventDetails.startDate || temporal.startDate || item.startDate || operations.startDate || eventDetails.date;
  const rawEndDate = eventDetails.endDate || temporal.endDate || item.endDate || operations.endDate;

  const parsedStart = parseFlexibleDate(rawStartDate);
  const parsedEnd = parseFlexibleDate(rawEndDate);

  // If Start Date is in the future for current view
  if (parsedStart && now < parsedStart) {
    return false; // Not active yet
  }

  // If End Date has passed (Expired / Past event)
  if (parsedEnd && now > parsedEnd) {
    return false; // Expired / Past event
  }

  // If seasonal / pop-up / event duration model without dates or has expired
  const durationModel = String(item.durationModel || temporal.lifespanType || '').toUpperCase().trim();
  const entityType = String(item.entityType || '').toUpperCase().trim();

  if (durationModel === 'SEASONAL' || durationModel === 'TEMPORARY' || durationModel === 'POPUP' || entityType === 'EVENT' || entityType === 'ACTIVATION') {
    if (parsedEnd && now > parsedEnd) {
      return false;
    }
  }

  // 4. Permanent Attraction Weekly Schedules & Special Date Overrides
  if (temporal.isPermanent || temporal.isPermanentAttraction || temporal.lifespanType === 'PERMANENT' || durationModel === 'PERMANENT') {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    if (Array.isArray(temporal.specialDates)) {
      const specialOverride = temporal.specialDates.find((s: any) => s.date === dateStr);
      if (specialOverride && specialOverride.isClosed) {
        return false;
      }
    }

    const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = DAYS[now.getDay()];
    if (temporal.weeklySchedule && temporal.weeklySchedule[dayKey] && temporal.weeklySchedule[dayKey].isOpen === false) {
      return false;
    }

    return true;
  }

  return true;
}

/**
 * Calculates availability freshness and honest public display text
 */
export function resolveAvailabilityStatus(attraction: any): ResolvedAvailability {
  const source: AvailabilitySource = attraction?.availabilitySource || 'NONE'
  const maxCapacity = attraction?.capacity || attraction?.maxCapacity || 0
  const currentCount = attraction?.currentOccupancy || attraction?.currentCount || 0
  const lastUpdated = attraction?.lastUpdatedTime ? new Date(attraction.lastUpdatedTime) : null
  const freshnessMinutes = attraction?.freshnessThresholdMinutes || 60

  const now = new Date()
  const isFresh = lastUpdated ? (now.getTime() - lastUpdated.getTime()) / (1000 * 60) <= freshnessMinutes : false
  const isOpen = attraction?.status === 'ACTIVE' || attraction?.status === 'OPEN' || attraction?.isOpen === true

  if (!isOpen) {
    return {
      isFresh: true,
      displayLabelEn: 'Temporarily Closed',
      displayLabelAr: 'مغلق حالياً',
      statusTagEn: 'CLOSED',
      statusTagAr: 'مغلق',
      isOpen: false
    }
  }

  if (isFresh && source !== 'NONE' && maxCapacity > 0) {
    const percentage = Math.min(100, Math.round((currentCount / maxCapacity) * 100))
    const statusTagEn = percentage >= 95 ? 'FULL' : percentage >= 80 ? 'BUSY' : 'AVAILABLE'
    const statusTagAr = percentage >= 95 ? 'مكتمل' : percentage >= 80 ? 'مزدحم' : 'متوفر'

    return {
      isFresh: true,
      percentage,
      currentCount,
      maxCapacity,
      displayLabelEn: `${percentage}% Capacity`,
      displayLabelAr: `السعة ${percentage}%`,
      statusTagEn,
      statusTagAr,
      isOpen: true
    }
  }

  // Honest fallbacks when live data is unavailable or stale
  return {
    isFresh: false,
    displayLabelEn: 'Check Availability',
    displayLabelAr: 'التحقق من التوفر',
    statusTagEn: 'OPEN TODAY',
    statusTagAr: 'مفتوح اليوم',
    isOpen: true
  }
}

/**
 * Resolves canonical booking URL across CTAs, cards, tickets, and microsites
 */
export function resolveBookingUrl(attraction: any, locale: string = 'en'): string {
  const mode: BookingMode = attraction?.bookingMode || (attraction?.bookingProductId ? 'BOOKINGQUBE_PRODUCT' : (attraction?.ticketingUrl || attraction?.bookingUrl) ? 'EXTERNAL_URL' : 'INTERNAL_ROUTE')
  
  if (mode === 'BOOKINGQUBE_PRODUCT' && attraction?.bookingProductId) {
    return `/${locale}/b2c/tickets?product=${encodeURIComponent(attraction.bookingProductId)}`
  }
  
  if (mode === 'CONTACT') {
    return `/${locale}/b2c/contact?subject=${encodeURIComponent(attraction?.nameEn || 'Booking Inquiry')}`
  }

  if (mode === 'INTERNAL_ROUTE') {
    const canonicalSlug = (attraction?.slug === 'urban-arena-doha-mall' ? 'urban-arena' : attraction?.slug) || 'urban-arena'
    return `/${locale}/b2c/attractions/${canonicalSlug}#pricing`
  }

  let directUrl = (attraction?.ticketingUrl || attraction?.bookingUrl || '').trim()
  if (directUrl.includes('urban-arena-doha-mall')) {
    directUrl = directUrl.replace('urban-arena-doha-mall', 'urban-arena')
  }

  if (directUrl) {
    if (directUrl.startsWith('http://') || directUrl.startsWith('https://')) {
      return directUrl
    }
    if (directUrl.startsWith('/')) {
      return `/${locale}${directUrl}`
    }
    if (directUrl.startsWith('#')) {
      return directUrl
    }
  }

  const canonicalSlug = (attraction?.slug === 'urban-arena-doha-mall' ? 'urban-arena' : attraction?.slug) || 'urban-arena'

  return `/${locale}/b2c/attractions/${canonicalSlug}#pricing`
}

/**
 * Filters published attractions by URL query parameters
 */
export function filterAttractionsByUrlParams(attractions: any[], params: AttractionFilterParams): any[] {
  return attractions.filter((attr) => {
    // Search query
    if (params.search) {
      const q = params.search.toLowerCase()
      const nameEn = (attr.nameEn || attr.name?.en || '').toLowerCase()
      const nameAr = (attr.nameAr || attr.name?.ar || '').toLowerCase()
      const descEn = (attr.descriptionEn || attr.description?.en || '').toLowerCase()
      if (!nameEn.includes(q) && !nameAr.includes(q) && !descEn.includes(q)) {
        return false
      }
    }

    // Story filter
    if (params.story) {
      const s = params.story.toLowerCase()
      const storyTypes: string[] = Array.isArray(attr.storyTypes) ? attr.storyTypes : attr.storyType ? [attr.storyType] : []
      const match = storyTypes.some(st => st.toLowerCase() === s)
      if (!match && attr.slug !== s) return false
    }

    // Category filter
    if (params.category && params.category !== 'ALL') {
      const c = params.category.toLowerCase()
      const attrCat = (attr.category || attr.attractionCategory || '').toLowerCase()
      if (attrCat !== c) return false
    }

    // Indoor / Outdoor
    if (params.indoorOutdoor && params.indoorOutdoor !== 'ALL') {
      const io = params.indoorOutdoor.toUpperCase()
      if (attr.indoorOutdoor && attr.indoorOutdoor !== io) return false
    }

    // Open Now
    if (params.openNow) {
      const avail = resolveAvailabilityStatus(attr)
      if (!avail.isOpen) return false
    }

    // Booking Available
    if (params.bookingAvailable) {
      const mode = attr.bookingMode || 'BOOKINGQUBE_PRODUCT'
      if (mode === 'NONE') return false
    }

    return true
  })
}

/**
 * Server-side canonical attraction query
 */
export async function getCanonicalAttractions() {
  if (typeof window !== 'undefined') return []
  try {
    const { default: db } = await import('@/lib/db')
    const records = await db.attraction.findMany({
      where: { isPublished: true },
      include: {
        gallery: { orderBy: { orderIndex: 'asc' } },
        pricing: { orderBy: { price: 'asc' } },
        offers: true,
        featuresList: { orderBy: { orderIndex: 'asc' } },
        attractionLocations: {
          include: {
            location: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    const activeRecords = records.filter((r: any) => isAttractionActiveByDate(r))
    return activeRecords.length > 0 ? activeRecords : records.filter((r: any) => r.isPublished !== false)
  } catch (_e) {
    return []
  }
}
