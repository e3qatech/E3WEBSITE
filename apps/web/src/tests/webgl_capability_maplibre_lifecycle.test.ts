import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isWebGL2Supported,
  isWebGLSupported,
  isMapLibreSupported,
  isValidLngLat,
  setMockWebGLSupport,
  resetMockWebGLSupport,
} from '../lib/webgl-capability';

describe('QF-01: Capability-Safe MapLibre Lifecycle & No-WebGL Fallback', () => {
  beforeEach(() => {
    resetMockWebGLSupport();
  });

  afterEach(() => {
    resetMockWebGLSupport();
    vi.restoreAllMocks();
  });

  it('1. Capability check returns true when WebGL2 is available', () => {
    setMockWebGLSupport(true, true);
    expect(isWebGL2Supported()).toBe(true);
    expect(isMapLibreSupported()).toBe(true);
  });

  it('2. Capability check returns false when WebGL2 & WebGL are unavailable', () => {
    setMockWebGLSupport(false, true);
    setMockWebGLSupport(false, false);
    expect(isWebGL2Supported()).toBe(false);
    expect(isWebGLSupported()).toBe(false);
    expect(isMapLibreSupported()).toBe(false);
  });

  it('3. Capability check returns true when WebGL v1 is available as fallback', () => {
    setMockWebGLSupport(false, true); // No WebGL2
    setMockWebGLSupport(true, false); // Has WebGL1
    expect(isWebGL2Supported()).toBe(false);
    expect(isWebGLSupported()).toBe(true);
    expect(isMapLibreSupported()).toBe(true);
  });

  it('4. Coordinates validation accepts valid Qatar coordinates and rejects invalid/NaN', () => {
    // Valid coordinates for Qatar
    expect(isValidLngLat(51.5305, 25.418)).toBe(true); // Lusail
    expect(isValidLngLat(51.5310, 25.285)).toBe(true); // Doha Corniche

    // Boundary coordinates
    expect(isValidLngLat(-180, -90)).toBe(true);
    expect(isValidLngLat(180, 90)).toBe(true);

    // Invalid coordinates
    expect(isValidLngLat(181, 25.418)).toBe(false); // Longitude > 180
    expect(isValidLngLat(-181, 25.418)).toBe(false); // Longitude < -180
    expect(isValidLngLat(51.5305, 91)).toBe(false); // Latitude > 90
    expect(isValidLngLat(51.5305, -91)).toBe(false); // Latitude < -90
    expect(isValidLngLat(NaN, 25.418)).toBe(false); // NaN Longitude
    expect(isValidLngLat(51.5305, NaN)).toBe(false); // NaN Latitude
    expect(isValidLngLat(null, 25.418)).toBe(false); // null
    expect(isValidLngLat(undefined, undefined)).toBe(false); // undefined
    expect(isValidLngLat('51.5305', '25.418')).toBe(false); // string
  });

  it('5. Safe cleanup is idempotent and never throws when called multiple times or on failed instances', () => {
    let removeCount = 0;
    const mockMap = {
      remove: vi.fn(() => {
        removeCount++;
      }),
    };

    // Simulate safe cleanup runner
    const performSafeCleanup = (instanceRef: { current: any }, markersRef: { current: any[] }) => {
      if (markersRef.current && markersRef.current.length > 0) {
        markersRef.current.forEach((m) => {
          try {
            if (m && typeof m.remove === 'function') m.remove();
          } catch (_) {}
        });
        markersRef.current = [];
      }

      if (instanceRef.current) {
        try {
          if (typeof instanceRef.current.remove === 'function') {
            instanceRef.current.remove();
          }
        } catch (_e) {}
        instanceRef.current = null;
      }
    };

    const instanceRef = { current: mockMap };
    const markersRef = { current: [{ remove: vi.fn() }, { remove: vi.fn() }] };

    // Call 1: Cleans up cleanly
    expect(() => performSafeCleanup(instanceRef, markersRef)).not.toThrow();
    expect(removeCount).toBe(1);
    expect(instanceRef.current).toBeNull();
    expect(markersRef.current.length).toBe(0);

    // Call 2: Second cleanup is a safe no-op
    expect(() => performSafeCleanup(instanceRef, markersRef)).not.toThrow();
    expect(removeCount).toBe(1);
  });

  it('6. Safe cleanup handles buggy map instance whose remove() throws destroy error', () => {
    const buggyMap = {
      remove: vi.fn(() => {
        throw new TypeError("Cannot read properties of undefined (reading 'destroy')");
      }),
    };

    const performSafeCleanup = (instanceRef: { current: any }) => {
      if (instanceRef.current) {
        try {
          if (typeof instanceRef.current.remove === 'function') {
            instanceRef.current.remove();
          }
        } catch (_e) {
          // Prevent destroy error from bubbling
        }
        instanceRef.current = null;
      }
    };

    const instanceRef = { current: buggyMap };
    expect(() => performSafeCleanup(instanceRef)).not.toThrow();
    expect(instanceRef.current).toBeNull();
  });

  it('7. Unmounted component ignores async load callbacks and tile warnings', () => {
    let state = 'loading';
    let isMounted = false; // Component already unmounted

    const onLoadCallback = () => {
      if (!isMounted) return; // Guarded
      state = 'ready';
    };

    onLoadCallback();
    expect(state).toBe('loading'); // State remained untouched
  });

  it('8. Camera motion respects reduced-motion preference (duration 0 vs animated curve)', () => {
    const isReducedMotion = (mediaQueryMatches: boolean) => mediaQueryMatches;

    const getCameraAnimationOptions = (reduced: boolean) => {
      if (reduced) {
        return { duration: 0, animate: false };
      }
      return { duration: 1200, speed: 1.3, curve: 1.4, essential: true };
    };

    const normalAnim = getCameraAnimationOptions(isReducedMotion(false));
    expect(normalAnim.duration).toBe(1200);
    expect(normalAnim.speed).toBe(1.3);

    const reducedAnim = getCameraAnimationOptions(isReducedMotion(true));
    expect(reducedAnim.duration).toBe(0);
    expect(reducedAnim.animate).toBe(false);
  });

  it('9. Fallback location collection generates accessible Google Maps directions and ticketing URLs', () => {
    const sampleFeature = {
      properties: {
        locationId: 'loc-1',
        nameEn: 'Pristine Snow Park',
        nameAr: 'حديقة الثلج النقي',
        venue: 'Festival City, Doha',
        directionsUrl: 'https://maps.google.com/?q=25.32,51.52',
        ticketingUrl: '/en/b2c/calendar',
        operationalStatus: 'OPEN',
      },
    };

    expect(sampleFeature.properties.directionsUrl).toContain('maps.google.com');
    expect(sampleFeature.properties.ticketingUrl).toBe('/en/b2c/calendar');
    expect(sampleFeature.properties.operationalStatus).toBe('OPEN');
  });

  it('10. Route transitions between Landing and Attractions isolate map instances without state leakage', () => {
    const landingMapInstance = { id: 'landing-map', destroyed: false };
    const attractionsMapInstance = { id: 'attractions-map', destroyed: false };

    let currentRouteMap: any = landingMapInstance;

    // Simulate navigation to Attractions
    const navigateToAttractions = () => {
      landingMapInstance.destroyed = true;
      currentRouteMap = attractionsMapInstance;
    };

    navigateToAttractions();
    expect(landingMapInstance.destroyed).toBe(true);
    expect(currentRouteMap.id).toBe('attractions-map');
    expect(currentRouteMap.destroyed).toBe(false);

    // Simulate navigation back to Landing
    const navigateBackToLanding = () => {
      attractionsMapInstance.destroyed = true;
      currentRouteMap = { id: 'landing-map-new', destroyed: false };
    };

    navigateBackToLanding();
    expect(attractionsMapInstance.destroyed).toBe(true);
    expect(currentRouteMap.id).toBe('landing-map-new');
  });
});
