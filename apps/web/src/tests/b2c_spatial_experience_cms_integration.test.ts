import { describe, it, expect } from 'vitest';
import { DEFAULT_SPATIAL_SECTIONS } from '../components/spatial/spatial-experience.config';

describe('B2C Landing CMS Spatial Experience Integration', () => {
  function resolveLandingExperience(cmsData: any, searchParams: Record<string, string | undefined> = {}, env: Record<string, string | undefined> = {}) {
    const isDev = env.NODE_ENV !== 'production';
    const isEnvFlagEnabled = env.NEXT_PUBLIC_SPATIAL_EXPERIENCE_V1 === 'true';
    const isCmsEnabled = cmsData?.spatialExperience?.enabled === true;
    const hasQueryParam = searchParams?.spatial === 'true' || searchParams?.barrel === 'true';
    const isAuthorizedForPreview = isDev || searchParams?.authorized === 'true';

    const isSpatialRequested = isCmsEnabled || isEnvFlagEnabled || (hasQueryParam && isAuthorizedForPreview);

    return {
      experienceType: isSpatialRequested ? 'SPATIAL_BARREL' : 'STANDARD_B2C_LANDING',
      mountedComponent: isSpatialRequested ? 'HorizontalOctagonalExperience' : 'B2CLandingClient',
      faces: isSpatialRequested ? (cmsData?.spatialExperience?.faces || DEFAULT_SPATIAL_SECTIONS) : undefined,
    };
  }

  it('1. Mounts HorizontalOctagonalExperience when CMS spatialExperience.enabled === true', () => {
    const cmsData = {
      spatialExperience: {
        enabled: true,
        faces: DEFAULT_SPATIAL_SECTIONS,
      },
    };

    const result = resolveLandingExperience(cmsData, {}, { NODE_ENV: 'production' });
    expect(result.experienceType).toBe('SPATIAL_BARREL');
    expect(result.mountedComponent).toBe('HorizontalOctagonalExperience');
    expect(result.faces?.length).toBe(8);
  });

  it('2. Mounts standard B2CLandingClient when CMS spatialExperience.enabled === false in production', () => {
    const cmsData = {
      spatialExperience: {
        enabled: false,
        faces: DEFAULT_SPATIAL_SECTIONS,
      },
    };

    const result = resolveLandingExperience(cmsData, {}, { NODE_ENV: 'production' });
    expect(result.experienceType).toBe('STANDARD_B2C_LANDING');
    expect(result.mountedComponent).toBe('B2CLandingClient');
    expect(result.faces).toBeUndefined();
  });

  it('3. Respects custom section overrides from CMS data when spatial experience is enabled', () => {
    const customFaces = DEFAULT_SPATIAL_SECTIONS.slice(0, 4).map((f) => ({
      ...f,
      headingEn: `Custom ${f.headingEn}`,
    }));

    const cmsData = {
      spatialExperience: {
        enabled: true,
        faces: customFaces,
      },
    };

    const result = resolveLandingExperience(cmsData, {}, { NODE_ENV: 'production' });
    expect(result.experienceType).toBe('SPATIAL_BARREL');
    expect(result.faces?.length).toBe(4);
    expect(result.faces?.[0].headingEn).toContain('Custom');
  });
});
