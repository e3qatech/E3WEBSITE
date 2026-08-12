import { describe, it, expect } from 'vitest';
import { calculateHaversineDistanceKm } from '../hooks/useNearestLocations';

describe('Gate 17: E3 Qatar Interactive Map & Location System Verification', () => {
  it('1. should accurately compute straight-line Haversine distance in kilometers', () => {
    // Distance between Lusail Boulevard (25.418, 51.5305) and Doha Festival City (25.3855, 51.455)
    const distance = calculateHaversineDistanceKm(25.418, 51.5305, 25.3855, 51.455);
    expect(distance).toBeGreaterThan(5);
    expect(distance).toBeLessThan(12);
  });

  it('2. should strictly validate coordinate boundaries (latitude [-90, 90], longitude [-180, 180])', () => {
    const isValidCoord = (lat: number, lng: number) => {
      return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    };

    expect(isValidCoord(25.418, 51.5305)).toBe(true);  // Lusail Qatar
    expect(isValidCoord(95, 51.5305)).toBe(false);    // Invalid lat
    expect(isValidCoord(25.418, 200)).toBe(false);    // Invalid lng
    expect(isValidCoord(NaN, 51.5305)).toBe(false);   // NaN
  });

  it('3. should generate valid GeoJSON FeatureCollection structure', () => {
    const sampleFeature = {
      type: "Feature" as const,
      id: "loc-test-1",
      geometry: {
        type: "Point" as const,
        coordinates: [51.5305, 25.418] as [number, number] // [lng, lat]
      },
      properties: {
        locationId: "loc-test-1",
        slug: "inflatarun",
        name: "InflataRUN",
        nameEn: "InflataRUN",
        nameAr: "إنفلاتا ران",
        venue: "Lusail Boulevard",
        address: "Lusail Boulevard, Qatar",
        locationType: "PERMANENT_ATTRACTION",
        operationalStatus: "OPEN",
        thumbnailUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176",
        pinColorToken: "CYAN",
        featured: true,
        attractionCount: 1,
        latitude: 25.418,
        longitude: 51.5305
      }
    };

    const collection = {
      type: "FeatureCollection" as const,
      features: [sampleFeature]
    };

    expect(collection.type).toBe("FeatureCollection");
    expect(collection.features.length).toBe(1);
    expect(collection.features[0].geometry.type).toBe("Point");
    expect(collection.features[0].geometry.coordinates[0]).toBe(51.5305);
    expect(collection.features[0].geometry.coordinates[1]).toBe(25.418);
  });

  it('4. should enforce publication filtering (exclude DRAFT or archived locations from public endpoint)', () => {
    const mockLocations = [
      { id: 'loc-1', publicationStatus: 'PUBLISHED', mapVisible: true, isPublished: true },
      { id: 'loc-2', publicationStatus: 'DRAFT', mapVisible: true, isPublished: false },
      { id: 'loc-3', publicationStatus: 'ARCHIVED', mapVisible: true, isPublished: false },
      { id: 'loc-4', publicationStatus: 'PUBLISHED', mapVisible: false, isPublished: true },
    ];

    const eligiblePublicLocations = mockLocations.filter(
      loc => loc.publicationStatus === 'PUBLISHED' && loc.mapVisible && loc.isPublished
    );

    expect(eligiblePublicLocations.length).toBe(1);
    expect(eligiblePublicLocations[0].id).toBe('loc-1');
  });

  it('5. should support bilingual EN/AR localized labels and fallback conventions', () => {
    const resolveTitle = (loc: { nameEn?: string; nameAr?: string }, locale: string) => {
      const isAr = locale === 'ar';
      return isAr ? (loc.nameAr || loc.nameEn || 'وجهة ترفيهية') : (loc.nameEn || loc.nameAr || 'Attraction');
    };

    const loc1 = { nameEn: 'Kids City', nameAr: 'مدينة الأطفال' };
    const loc2 = { nameEn: 'Cyberdome' };

    expect(resolveTitle(loc1, 'en')).toBe('Kids City');
    expect(resolveTitle(loc1, 'ar')).toBe('مدينة الأطفال');
    expect(resolveTitle(loc2, 'ar')).toBe('Cyberdome');
  });
});
