import { describe, it, expect } from 'vitest';
import {
  isValidCoordinate,
  isValidQatarCoordinate,
  isEligiblePublicLocation,
  resolveQatarMapPins,
} from '../lib/qatar-map-resolver';

describe('QF-08: Canonical Locations/GIS and Qatar Map Pins', () => {
  const mockLocations = [
    {
      id: 'loc-1',
      slug: 'inflatarun-lusail',
      nameEn: 'InflataRUN Lusail',
      nameAr: 'إنفلاتا ران لوسيل',
      venueEn: 'Lusail Boulevard',
      venueAr: 'شارع لوسيل التجاري',
      addressEn: 'Lusail Boulevard, Qatar',
      addressAr: 'شارع لوسيل التجاري، قطر',
      latitude: 25.418,
      longitude: 51.53,
      locationType: 'PERMANENT_ATTRACTION',
      operationalStatus: 'OPEN',
      publicationStatus: 'PUBLISHED',
      isPublished: true,
      mapVisible: true,
      featured: true,
      displayOrder: 1,
      pinColorToken: 'CYAN',
      directionsUrl: 'https://maps.google.com/?q=25.418,51.53',
      ticketingUrl: '/en/b2c/calendar',
    },
    {
      id: 'loc-2',
      slug: 'cyberdome-doha',
      nameEn: 'Cyberdome Arena',
      nameAr: 'قبة سايبردوم الدوحة',
      venueEn: 'Doha Festival City',
      venueAr: 'دوحة فستيفال سيتي',
      addressEn: 'Doha Festival City, Qatar',
      addressAr: 'دوحة فستيفال سيتي، قطر',
      latitude: 25.358,
      longitude: 51.442,
      locationType: 'SEASONAL_ATTRACTION',
      operationalStatus: 'OPEN',
      publicationStatus: 'PUBLISHED',
      isPublished: true,
      mapVisible: true,
      featured: false,
      displayOrder: 2,
      pinColorToken: 'PURPLE',
      directionsUrl: 'https://maps.google.com/?q=25.358,51.442',
      ticketingUrl: '/en/b2c/calendar',
    },
    {
      id: 'loc-3',
      slug: 'desert-safari-camp',
      nameEn: 'Dune Sound Arena',
      nameAr: 'ميدان الكثبان الصوتية',
      venueEn: 'Sealine Qatar',
      venueAr: 'سيلين قطر',
      addressEn: 'Sealine, Qatar',
      addressAr: 'سيلين، قطر',
      latitude: 24.85,
      longitude: 51.51,
      locationType: 'EVENT',
      operationalStatus: 'COMING_SOON',
      publicationStatus: 'PUBLISHED',
      isPublished: true,
      mapVisible: true,
      featured: false,
      displayOrder: 3,
      pinColorToken: 'AMBER',
    },
  ];

  // 1. Selection and custom ordering from Landing Settings
  it('1. Selection and ordering: custom selectedLocationIds preserves exact order and applies presentation overrides', () => {
    const settings = {
      selectedLocationIds: ['loc-3', 'loc-1'],
      presentationOverrides: {
        'loc-3': { pinColorToken: 'GOLD', featured: true },
      },
    };

    const { pins } = resolveQatarMapPins({
      settings,
      dbLocations: mockLocations,
      locale: 'en',
    });

    expect(pins.length).toBe(2);
    // Preserves order: loc-3 first, then loc-1
    expect(pins[0].id).toBe('loc-3');
    expect(pins[1].id).toBe('loc-1');

    // Applied presentation override without mutating canonical coordinates or name
    expect(pins[0].pinColorToken).toBe('GOLD');
    expect(pins[0].featured).toBe(true);
    expect(pins[0].nameEn).toBe('Dune Sound Arena');
    expect(pins[0].latitude).toBe(24.85);
    expect(pins[0].longitude).toBe(51.51);
  });

  // 2. Invalid coordinates rejection
  it('2. Invalid coordinates: rejects NaN, out-of-range, and Null Island coordinates', () => {
    expect(isValidCoordinate(25.418, 51.53)).toBe(true);
    expect(isValidCoordinate('25.418', '51.53')).toBe(true);

    // Out of global GIS range
    expect(isValidCoordinate(95, 51.53)).toBe(false);
    expect(isValidCoordinate(-95, 51.53)).toBe(false);
    expect(isValidCoordinate(25.418, 190)).toBe(false);
    expect(isValidCoordinate(25.418, -190)).toBe(false);

    // NaN / missing
    expect(isValidCoordinate(NaN, 51.53)).toBe(false);
    expect(isValidCoordinate(undefined, 51.53)).toBe(false);
    expect(isValidCoordinate(null, null)).toBe(false);

    // Null Island (0, 0)
    expect(isValidCoordinate(0, 0)).toBe(false);

    // Qatar bounding box validator
    expect(isValidQatarCoordinate(25.418, 51.53)).toBe(true);
    expect(isValidQatarCoordinate(48.8566, 2.3522)).toBe(false); // Paris
  });

  // 3. Hidden and Unpublished exclusion
  it('3. Hidden and unpublished exclusion: excludes mapVisible: false, DRAFT, and ARCHIVED records', () => {
    const mixedLocations = [
      { id: 'loc-pub', isPublished: true, publicationStatus: 'PUBLISHED', mapVisible: true, latitude: 25.4, longitude: 51.5 },
      { id: 'loc-draft', isPublished: false, publicationStatus: 'DRAFT', mapVisible: true, latitude: 25.4, longitude: 51.5 },
      { id: 'loc-archived', isPublished: false, publicationStatus: 'ARCHIVED', mapVisible: true, latitude: 25.4, longitude: 51.5 },
      { id: 'loc-hidden', isPublished: true, publicationStatus: 'PUBLISHED', mapVisible: false, latitude: 25.4, longitude: 51.5 },
      { id: 'loc-invalid-coord', isPublished: true, publicationStatus: 'PUBLISHED', mapVisible: true, latitude: NaN, longitude: 51.5 },
    ];

    expect(isEligiblePublicLocation(mixedLocations[0])).toBe(true);
    expect(isEligiblePublicLocation(mixedLocations[1])).toBe(false);
    expect(isEligiblePublicLocation(mixedLocations[2])).toBe(false);
    expect(isEligiblePublicLocation(mixedLocations[3])).toBe(false);
    expect(isEligiblePublicLocation(mixedLocations[4])).toBe(false);

    const { pins } = resolveQatarMapPins({
      dbLocations: mixedLocations,
      locale: 'en',
    });

    expect(pins.length).toBe(1);
    expect(pins[0].id).toBe('loc-pub');
  });

  // 4. Legacy CMS fallback compatibility
  it('4. Legacy CMS fallback: safely parses legacy venues/pinPoints when database has no records', () => {
    const legacySettings = {
      headlineEn: 'Legacy Map Section',
      headlineAr: 'قسم الخريطة القديم',
      venues: [
        {
          id: 'v-legacy-1',
          nameEn: 'Old Mall Activation',
          nameAr: 'فعالية المجمع القديمة',
          lat: 25.32,
          lng: 51.48,
          locationLabelEn: 'Villaggio Mall',
          locationLabelAr: 'فيلاجيو مول',
          mediaUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176',
        },
        {
          id: 'v-legacy-invalid',
          nameEn: 'Broken Venue',
          lat: 'not-a-number',
          lng: 51.48,
        },
      ],
    };

    const { pins, headlineEn } = resolveQatarMapPins({
      settings: legacySettings,
      dbLocations: [],
      locale: 'en',
    });

    expect(headlineEn).toBe('Legacy Map Section');
    expect(pins.length).toBe(1);
    expect(pins[0].nameEn).toBe('Old Mall Activation');
    expect(pins[0].latitude).toBe(25.32);
    expect(pins[0].longitude).toBe(51.48);
  });

  // 5. Public API & GeoJSON FeatureCollection consistency
  it('5. GeoJSON consistency: produces valid FeatureCollection with [lng, lat] coordinate ordering', () => {
    const { geoJson } = resolveQatarMapPins({
      dbLocations: mockLocations,
      locale: 'en',
    });

    expect(geoJson.type).toBe('FeatureCollection');
    expect(geoJson.features.length).toBe(3);

    const feat0 = geoJson.features[0];
    expect(feat0.type).toBe('Feature');
    expect(feat0.geometry.type).toBe('Point');
    // Standard GeoJSON Point coordinates: [longitude, latitude]
    expect(feat0.geometry.coordinates[0]).toBe(51.53);
    expect(feat0.geometry.coordinates[1]).toBe(25.418);
    expect(feat0.properties.name).toBe('InflataRUN Lusail');
    expect(feat0.properties.operationalStatus).toBe('OPEN');
  });

  // 6. Bilingual localization EN/AR
  it('6. Bilingual localization: maps Arabic names, venues, and RTL direction correctly', () => {
    const { pins: arPins, headlineAr } = resolveQatarMapPins({
      dbLocations: mockLocations,
      locale: 'ar',
    });

    expect(headlineAr).toBe('استكشف إي ثري عبر أنحاء قطر');
    expect(arPins[0].name).toBe('إنفلاتا ران لوسيل');
    expect(arPins[0].venue).toBe('شارع لوسيل التجاري');
    expect(arPins[0].address).toBe('شارع لوسيل التجاري، قطر');

    const { pins: enPins } = resolveQatarMapPins({
      dbLocations: mockLocations,
      locale: 'en',
    });

    expect(enPins[0].name).toBe('InflataRUN Lusail');
    expect(enPins[0].venue).toBe('Lusail Boulevard');
    expect(enPins[0].address).toBe('Lusail Boulevard, Qatar');
  });
});
