import { FALLBACK_ATTRACTIONS } from './fallback-attractions';
import { isAttractionActiveByDate } from './cms-attractions';

/**
 * Standard Qatar geographical bounding box.
 * Qatar territory spans approximately 24.2° N to 26.3° N latitude and 50.7° E to 51.7° E longitude.
 * We allow a safe margin of [24.0, 27.0] latitude and [50.0, 52.5] longitude.
 */
export const QATAR_GEO_BOUNDS = {
  MIN_LAT: 24.0,
  MAX_LAT: 27.0,
  MIN_LNG: 50.0,
  MAX_LNG: 52.5,
};

/**
 * Validates coordinate numbers against standard GIS boundaries and Qatar geographical range.
 */
export function isValidCoordinate(lat: any, lng: any): boolean {
  const numLat = typeof lat === 'number' ? lat : parseFloat(lat);
  const numLng = typeof lng === 'number' ? lng : parseFloat(lng);

  if (isNaN(numLat) || isNaN(numLng)) return false;
  if (numLat < -90 || numLat > 90) return false;
  if (numLng < -180 || numLng > 180) return false;
  if (numLat === 0 && numLng === 0) return false; // Null island rejection

  return true;
}

/**
 * Validates that coordinates fall within the Qatar territorial bounding box.
 */
export function isValidQatarCoordinate(lat: any, lng: any): boolean {
  if (!isValidCoordinate(lat, lng)) return false;

  const numLat = typeof lat === 'number' ? lat : parseFloat(lat);
  const numLng = typeof lng === 'number' ? lng : parseFloat(lng);

  return (
    numLat >= QATAR_GEO_BOUNDS.MIN_LAT &&
    numLat <= QATAR_GEO_BOUNDS.MAX_LAT &&
    numLng >= QATAR_GEO_BOUNDS.MIN_LNG &&
    numLng <= QATAR_GEO_BOUNDS.MAX_LNG
  );
}

/**
 * Checks if a location record is eligible for public map display.
 * Must be published, non-hidden (mapVisible !== false), and have valid coordinates.
 */
export function isEligiblePublicLocation(loc: any): boolean {
  if (!loc) return false;

  // Publication check
  const isPub = loc.isPublished !== false && loc.publicationStatus !== 'DRAFT' && loc.publicationStatus !== 'ARCHIVED';
  if (!isPub) return false;

  // Map visibility check
  if (loc.mapVisible === false) return false;

  // Coordinates check
  const lat = loc.latitude ?? loc.lat;
  const lng = loc.longitude ?? loc.lng;
  if (!isValidCoordinate(lat, lng)) return false;

  return true;
}

export interface CanonicalMapPin {
  id: string;
  locationId: string;
  slug: string;
  name: string;
  nameEn: string;
  nameAr: string;
  venue: string;
  venueEn?: string;
  venueAr?: string;
  address: string;
  addressEn?: string;
  addressAr?: string;
  latitude: number;
  longitude: number;
  operationalStatus: string;
  locationType: string;
  pinColorToken: string;
  featured: boolean;
  thumbnailUrl: string;
  directionsUrl: string;
  googleMapsUrl: string;
  ticketingUrl: string;
  shortDescription?: string;
  attractionCount?: number;
  attractions?: Array<{
    id: string;
    nameEn: string;
    nameAr: string;
    slug: string;
    heroMediaUrl?: string;
    ticketingUrl?: string;
  }>;
}

export interface ResolveQatarMapOptions {
  settings?: any;
  dbLocations?: any[];
  locale?: string;
  activeOnly?: boolean;
  typeFilter?: string | null;
  statusFilter?: string | null;
  featuredOnly?: boolean;
  openNowOnly?: boolean;
}

/**
 * Canonical Resolver for Qatar Map Pins.
 *
 * Enforces:
 * 1. db.location is the single canonical source of truth.
 * 2. Filters only published, non-hidden locations with valid coordinates.
 * 3. Applies landing settings ordering / selection overrides by location ID only.
 * 4. Never allows settings to mutate or duplicate canonical coordinates, operational statuses, or directions.
 * 5. Provides backward-compatible fallback for legacy CMS pin payloads.
 */
export function resolveQatarMapPins({
  settings = {},
  dbLocations = [],
  locale = 'en',
  activeOnly = false,
  typeFilter = null,
  statusFilter = null,
  featuredOnly = false,
  openNowOnly = false,
}: ResolveQatarMapOptions): {
  pins: CanonicalMapPin[];
  geoJson: { type: 'FeatureCollection'; features: any[] };
  headlineEn: string;
  headlineAr: string;
  subtextEn: string;
  subtextAr: string;
} {
  const isAr = locale === 'ar';

  const headlineEn = settings?.headlineEn || settings?.titleEn || 'Explore E3 Across Qatar';
  const headlineAr = settings?.headlineAr || settings?.titleAr || 'استكشف إي ثري عبر أنحاء قطر';
  const subtextEn =
    settings?.subtextEn || "Discover E3's permanent attraction worlds and temporary event arenas across Doha.";
  const subtextAr =
    settings?.subtextAr || 'استكشف وجهات إي ثري الترفيهية وصالات الفعاليات في كافة مناطق الدوحة.';

  // 1. Filter eligible canonical locations from database
  let eligibleLocations = (dbLocations || []).filter(isEligiblePublicLocation);

  // Apply search/query filters
  if (typeFilter && typeFilter !== 'ALL') {
    eligibleLocations = eligibleLocations.filter((l) => l.locationType === typeFilter);
  }
  if (statusFilter && statusFilter !== 'ALL') {
    eligibleLocations = eligibleLocations.filter((l) => l.operationalStatus === statusFilter);
  }
  if (featuredOnly) {
    eligibleLocations = eligibleLocations.filter((l) => Boolean(l.featured));
  }
  if (openNowOnly) {
    eligibleLocations = eligibleLocations.filter((l) => l.operationalStatus === 'OPEN');
  }

  // 2. Resolve Selection & Ordering from Landing Settings
  const selectedIds: string[] = Array.isArray(settings?.selectedLocationIds)
    ? settings.selectedLocationIds
    : Array.isArray(settings?.locationIds)
    ? settings.locationIds
    : [];

  const presentationOverrides: Record<string, any> = settings?.presentationOverrides || {};

  let orderedLocations: any[] = [];

  if (selectedIds.length > 0) {
    // Index eligible locations by ID and slug for fast lookup
    const locMap = new Map<string, any>();
    eligibleLocations.forEach((l) => {
      if (l.id) locMap.set(l.id, l);
      if (l.slug) locMap.set(l.slug, l);
    });

    // Preserve exact ordering from selectedLocationIds
    for (const id of selectedIds) {
      const loc = locMap.get(id);
      if (loc && !orderedLocations.includes(loc)) {
        orderedLocations.push(loc);
      }
    }
  }

  // If no selectedLocationIds or none matched, use all eligible canonical locations
  if (orderedLocations.length === 0 && eligibleLocations.length > 0) {
    orderedLocations = [...eligibleLocations].sort((a, b) => {
      if (Boolean(b.featured) !== Boolean(a.featured)) {
        return Boolean(b.featured) ? 1 : -1;
      }
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    });
  }

  // 3. Legacy CMS payload fallback (if database has 0 locations)
  if (orderedLocations.length === 0) {
    const legacyVenues = Array.isArray(settings?.venues)
      ? settings.venues
      : Array.isArray(settings?.pinPoints)
      ? settings.pinPoints
      : [];

    if (legacyVenues.length > 0) {
      orderedLocations = legacyVenues
        .filter((v: any) => isValidCoordinate(v.lat ?? v.latitude, v.lng ?? v.longitude))
        .map((v: any, idx: number) => ({
          id: v.id || `loc-legacy-${idx}`,
          slug: v.slug || `legacy-venue-${idx}`,
          nameEn: v.nameEn || v.name || 'Qatar Venue',
          nameAr: v.nameAr || v.name || 'وجهة قطر',
          venueEn: v.locationLabelEn || v.venueEn || 'Doha, Qatar',
          venueAr: v.locationLabelAr || v.venueAr || 'الدوحة، قطر',
          addressEn: v.addressEn || v.locationLabelEn || 'Doha, Qatar',
          addressAr: v.addressAr || v.locationLabelAr || 'الدوحة، قطر',
          latitude: typeof v.lat === 'number' ? v.lat : parseFloat(v.latitude || v.lat),
          longitude: typeof v.lng === 'number' ? v.lng : parseFloat(v.longitude || v.lng),
          locationType: v.locationType || 'PERMANENT_ATTRACTION',
          operationalStatus: v.operationalStatus || 'OPEN',
          publicationStatus: 'PUBLISHED',
          isPublished: true,
          mapVisible: true,
          pinColorToken: v.pinColorToken || 'CYAN',
          featured: Boolean(v.featured),
          coverMediaUrl: v.mediaUrl || v.coverMediaUrl,
          ticketingUrl: v.ticketingUrl || `/${locale}/b2c/calendar`,
          directionsUrl: v.directionsUrl || `https://maps.google.com/?q=${v.lat || 25.2854},${v.lng || 51.531}`,
        }));
    }
  }

  // 4. Default Fallback Attractions (if still empty)
  if (orderedLocations.length === 0) {
    orderedLocations = FALLBACK_ATTRACTIONS.map((attr: any, idx: number) => ({
      id: `loc-${attr.id || idx}`,
      slug: attr.slug || 'attraction',
      nameEn: attr.nameEn,
      nameAr: attr.nameAr,
      venueEn: attr.operations?.locationNameEn || 'Qatar',
      venueAr: attr.operations?.locationNameAr || 'قطر',
      addressEn: attr.operations?.locationNameEn || 'Qatar',
      addressAr: attr.operations?.locationNameAr || 'قطر',
      latitude: attr.operations?.lat || attr.coordinates?.lat || 25.418,
      longitude: attr.operations?.lng || attr.coordinates?.lng || 51.53,
      locationType: (attr as any).category === 'WATER & SPLASH' ? 'SEASONAL_ATTRACTION' : 'PERMANENT_ATTRACTION',
      operationalStatus: attr.operations?.openingSoon ? 'COMING_SOON' : 'OPEN',
      pinColorToken: 'CYAN',
      featured: true,
      mapVisible: true,
      publicationStatus: 'PUBLISHED',
      isPublished: true,
      coverMediaUrl: attr.heroMediaUrl,
      ticketingUrl: attr.ticketingUrl || `/${locale}/b2c/calendar`,
      attraction: attr,
    }));
  }

  // 5. Convert to canonical pin DTOs and GeoJSON features
  const pins: CanonicalMapPin[] = [];
  const features: any[] = [];

  for (const loc of orderedLocations) {
    const lat = typeof loc.latitude === 'number' ? loc.latitude : parseFloat(loc.latitude ?? loc.lat);
    const lng = typeof loc.longitude === 'number' ? loc.longitude : parseFloat(loc.longitude ?? loc.lng);

    if (!isValidCoordinate(lat, lng)) continue;

    // Collect associated attraction records
    const linkedAttrObjs: any[] = [];
    if (loc.attraction) {
      linkedAttrObjs.push(loc.attraction);
    }
    if (loc.attractionLinks && Array.isArray(loc.attractionLinks)) {
      loc.attractionLinks.forEach((link: any) => {
        if (link.attraction && link.mapVisible !== false) {
          linkedAttrObjs.push(link.attraction);
        }
      });
    }

    const primaryAttr = linkedAttrObjs[0] || {};

    // Active by date check
    if (activeOnly) {
      const isDateActive =
        isAttractionActiveByDate(loc) ||
        (linkedAttrObjs.length > 0 && linkedAttrObjs.some(isAttractionActiveByDate));
      if (!isDateActive) continue;
    }

    // Presentation override (colors / badges from landing settings only)
    const override = presentationOverrides[loc.id] || presentationOverrides[loc.slug] || {};

    const nameEn = loc.nameEn || primaryAttr.nameEn || 'Attraction';
    const nameAr = loc.nameAr || primaryAttr.nameAr || 'وجهة ترفيهية';
    const name = isAr ? nameAr : nameEn;

    const venueEn = loc.venueEn || primaryAttr.venueEn || 'Qatar';
    const venueAr = loc.venueAr || primaryAttr.venueAr || 'قطر';
    const venue = isAr ? venueAr : venueEn;

    const addressEn = loc.addressEn || venueEn;
    const addressAr = loc.addressAr || venueAr;
    const address = isAr ? addressAr : addressEn;

    const thumbnailUrl =
      loc.coverMediaUrl ||
      primaryAttr.heroMediaUrl ||
      primaryAttr.heroThumbnailUrl ||
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop';

    const ticketingUrl = loc.ticketingUrl || primaryAttr.ticketingUrl || `/${locale}/b2c/calendar`;
    const directionsUrl =
      loc.directionsUrl ||
      loc.googleMapsUrl ||
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    const pinColorToken = override.pinColorToken || loc.pinColorToken || (loc.featured ? 'GOLD' : 'CYAN');

    const pinDto: CanonicalMapPin = {
      id: loc.id,
      locationId: loc.id,
      slug: loc.slug || primaryAttr.slug || loc.id,
      name,
      nameEn,
      nameAr,
      venue,
      venueEn,
      venueAr,
      address,
      addressEn,
      addressAr,
      latitude: lat,
      longitude: lng,
      operationalStatus: loc.operationalStatus || primaryAttr.operationalStatus || 'OPEN',
      locationType: loc.locationType || 'PERMANENT_ATTRACTION',
      pinColorToken,
      featured: Boolean(override.featured ?? loc.featured),
      thumbnailUrl,
      directionsUrl,
      googleMapsUrl: loc.googleMapsUrl || directionsUrl,
      ticketingUrl,
      shortDescription: isAr
        ? loc.shortDescriptionAr || primaryAttr.taglineAr
        : loc.shortDescriptionEn || primaryAttr.taglineEn,
      attractionCount: Math.max(1, linkedAttrObjs.length),
      attractions: linkedAttrObjs.map((a) => ({
        id: a.id,
        nameEn: a.nameEn,
        nameAr: a.nameAr,
        slug: a.slug,
        heroMediaUrl: a.heroMediaUrl,
        ticketingUrl: a.ticketingUrl || `/${locale}/b2c/calendar`,
      })),
    };

    pins.push(pinDto);

    features.push({
      type: 'Feature',
      id: loc.id,
      geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      properties: pinDto,
    });
  }

  return {
    pins,
    geoJson: {
      type: 'FeatureCollection',
      features,
    },
    headlineEn,
    headlineAr,
    subtextEn,
    subtextAr,
  };
}
