import db from '@/lib/db'

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
    return attraction.bookingUrl
  }

  if (mode === 'INTERNAL_ROUTE' && attraction?.slug) {
    return `/${locale}/b2c/attractions/${attraction.slug}#booking`
  }

  if (mode === 'CONTACT') {
    return `/${locale}/b2c/contact?subject=${encodeURIComponent(attraction?.nameEn || 'Booking Inquiry')}`
  }

  return `/${locale}/b2c/tickets?attraction=${encodeURIComponent(attraction?.slug || attraction?.id || '')}`
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
  try {
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
