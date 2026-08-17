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

/**
 * Strict active attraction verification by current/target date
 */
export function isAttractionActiveByDate(item: any, targetDateInput?: Date | string | null | unknown): boolean {
  if (!item) return false
  const targetDate = typeof targetDateInput === 'string' || targetDateInput instanceof Date
    ? new Date(targetDateInput)
    : new Date()
  const now = isNaN(targetDate.getTime()) ? new Date() : targetDate

  // 1. Explicit Operational Status Check
  const status = item.operationalStatus || item.status || item.computedStatus
  if (status === 'ENDED' || status === 'INACTIVE' || status === 'PAST' || status === 'CLOSED' || status === 'TEMPORARILY_CLOSED') {
    return false
  }

  // 2. Temporal Override and Permanent Checks
  const temporal = item.temporalStatus || item.temporal || {}
  if (temporal.statusOverride) {
    if (temporal.statusOverride === 'FORCE_ACTIVE') return true
    if (temporal.statusOverride === 'FORCE_PAST' || temporal.statusOverride === 'FORCE_INCOMING') return false
  }

  if (temporal.adminStatusOverride) {
    const adminStatus = String(temporal.adminStatusOverride).toLowerCase().trim()
    if (adminStatus === 'closed' || adminStatus === 'archived' || adminStatus === 'inactive') return false
    if (adminStatus === 'live' || adminStatus === 'active') return true
  }

  if (temporal.isPermanent || temporal.isPermanentAttraction) return true

  // 3. Date Boundaries Verification (Start Date <= Target Date <= End Date)
  const startDateStr = temporal.startDate || item.startDate || item.operations?.startDate
  const endDateStr = temporal.endDate || item.endDate || item.operations?.endDate

  if (startDateStr) {
    const start = new Date(startDateStr)
    if (!isNaN(start.getTime()) && now < start) {
      return false // Not active yet (future event)
    }
  }

  if (endDateStr) {
    const end = new Date(endDateStr)
    if (!isNaN(end.getTime()) && now > end) {
      return false // Expired (past event)
    }
  }

  return true
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
  const mode: BookingMode = attraction?.bookingMode || (attraction?.bookingProductId ? 'BOOKINGQUBE_PRODUCT' : attraction?.bookingUrl ? 'EXTERNAL_URL' : 'INTERNAL_ROUTE')
  
  if (mode === 'BOOKINGQUBE_PRODUCT' && attraction?.bookingProductId) {
    return `/${locale}/b2c/tickets?product=${encodeURIComponent(attraction.bookingProductId)}`
  }
  
  if (mode === 'EXTERNAL_URL' && attraction?.bookingUrl) {
    const rawUrl = String(attraction.bookingUrl).trim()
    // Canonicalize any legacy slug or internal anchor to the current attraction route
    if (rawUrl.includes('urban-arena-doha-mall') || rawUrl.includes('/b2c/attractions/')) {
      return `/${locale}/b2c/attractions/${attraction.slug || 'urban-arena'}#pricing`
    }
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl
    }
    return rawUrl.startsWith('/') ? `/${locale}${rawUrl}` : `/${locale}/${rawUrl}`
  }

  const canonicalSlug = (attraction?.slug === 'urban-arena-doha-mall' ? 'urban-arena' : attraction?.slug) || 'urban-arena'

  if (mode === 'INTERNAL_ROUTE' || !attraction?.bookingMode) {
    return `/${locale}/b2c/attractions/${canonicalSlug}#pricing`
  }

  if (mode === 'CONTACT') {
    return `/${locale}/b2c/contact?subject=${encodeURIComponent(attraction?.nameEn || 'Booking Inquiry')}`
  }

  return `/${locale}/b2c/tickets?attraction=${encodeURIComponent(canonicalSlug || attraction?.id || '')}`
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
      },
      orderBy: { createdAt: 'desc' }
    })
    return records
  } catch (_e) {
    return []
  }
}
