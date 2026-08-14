/**
 * WebGL and WebGL2 capability detection utility for E3 Qatar.
 * Executes strictly in browser environments and safely releases test contexts.
 */

let mockWebGL2Support: boolean | null = null;
let mockWebGLSupport: boolean | null = null;

/**
 * Override WebGL support for unit and integration testing.
 */
export function setMockWebGLSupport(supported: boolean | null, isWebGL2: boolean = true) {
  if (isWebGL2) {
    mockWebGL2Support = supported;
  } else {
    mockWebGLSupport = supported;
  }
}

/**
 * Resets all test mocks to default browser detection.
 */
export function resetMockWebGLSupport() {
  mockWebGL2Support = null;
  mockWebGLSupport = null;
}

/**
 * Checks if WebGL2 is supported and can create an active context.
 */
export function isWebGL2Supported(): boolean {
  if (mockWebGL2Support !== null) {
    return mockWebGL2Support;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');

    if (!gl) {
      return false;
    }

    // Safely lose context to avoid GPU context leak
    const loseContext = gl.getExtension('WEBGL_lose_context');
    if (loseContext) {
      loseContext.loseContext();
    }

    return true;
  } catch (_e) {
    return false;
  }
}

/**
 * Checks if WebGL (v1 or v2) is supported.
 */
export function isWebGLSupported(): boolean {
  if (mockWebGLSupport !== null) {
    return mockWebGLSupport;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      return false;
    }

    const loseContext = (gl as any).getExtension('WEBGL_lose_context');
    if (loseContext) {
      loseContext.loseContext();
    }

    return true;
  } catch (_e) {
    return false;
  }
}

/**
 * Comprehensive check for MapLibre GL requirement (WebGL or WebGL2 context).
 */
export function isMapLibreSupported(): boolean {
  return isWebGL2Supported() || isWebGLSupported();
}

/**
 * Validates geographical coordinates (longitude: -180..180, latitude: -90..90).
 */
export function isValidLngLat(lng: unknown, lat: unknown): boolean {
  if (typeof lng !== 'number' || typeof lat !== 'number') return false;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return false;
  if (lng < -180 || lng > 180) return false;
  if (lat < -90 || lat > 90) return false;
  return true;
}
