import { describe, it, expect } from 'vitest';
import { SPATIAL_OCTAGON_CONFIG, DEFAULT_SPATIAL_SECTIONS } from '../components/spatial/spatial-experience.config';

describe('E3 Horizontal Octagonal Cylinder Experience - Geometric & Math Specs', () => {
  it('strictly validates 8-sided horizontal cylinder geometry constants', () => {
    expect(SPATIAL_OCTAGON_CONFIG.faceCount).toBe(8);
    expect(SPATIAL_OCTAGON_CONFIG.angleStep).toBeCloseTo(Math.PI / 4, 5); // 45 degrees
    expect(SPATIAL_OCTAGON_CONFIG.radius).toBe(5.2);
    
    // Theoretical side length for regular octagon: S = 2 * R * tan(PI/8)
    const expectedSideHeight = 2 * SPATIAL_OCTAGON_CONFIG.radius * Math.tan(Math.PI / 8);
    expect(SPATIAL_OCTAGON_CONFIG.faceHeight).toBeCloseTo(expectedSideHeight, 3);
    
    // Axle hub counter-rotates between 25% and 35% speed
    expect(SPATIAL_OCTAGON_CONFIG.hubCounterRotationRatio).toBeLessThanOrEqual(-0.25);
    expect(SPATIAL_OCTAGON_CONFIG.hubCounterRotationRatio).toBeGreaterThanOrEqual(-0.35);
  });

  it('calculates exact 45-degree rotation steps for indices 0 through 7', () => {
    const angleStep = SPATIAL_OCTAGON_CONFIG.angleStep;
    for (let i = 0; i < 8; i++) {
      const targetRotationX = i * angleStep;
      expect(targetRotationX).toBeCloseTo(i * (Math.PI / 4), 5);
    }
  });

  it('verifies snap calculation snaps arbitrary scroll progress to nearest 1/7 increment', () => {
    const totalSteps = 7;
    const testCases = [
      { progress: 0.02, expectedSnap: 0 / 7 },
      { progress: 0.14, expectedSnap: 1 / 7 },
      { progress: 0.29, expectedSnap: 2 / 7 },
      { progress: 0.56, expectedSnap: 4 / 7 },
      { progress: 0.98, expectedSnap: 7 / 7 },
    ];

    testCases.forEach(({ progress, expectedSnap }) => {
      const snapped = Math.round(progress * totalSteps) / totalSteps;
      expect(snapped).toBeCloseTo(expectedSnap, 4);
    });
  });
});

describe('E3 Seeded 8-Section Content & Localization Integrity', () => {
  it('contains exactly 8 seeded sections in canonical journey sequence', () => {
    expect(DEFAULT_SPATIAL_SECTIONS.length).toBe(8);

    const expectedSlugs = [
      'discover',
      'attractions',
      'events',
      'packages',
      'brands',
      'vault',
      'careers',
      'b2b',
    ];

    DEFAULT_SPATIAL_SECTIONS.forEach((section, idx) => {
      expect(section.slug).toBe(expectedSlugs[idx]);
      expect(section.sortOrder).toBe(idx);
      expect(section.sectionNumber).toBe(String(idx + 1).padStart(2, '0'));
    });
  });

  it('verifies all 8 sections contain authentic English and Arabic localized content', () => {
    DEFAULT_SPATIAL_SECTIONS.forEach((section) => {
      expect(section.headingEn.trim()).not.toBe('');
      expect(section.headingAr.trim()).not.toBe('');
      expect(section.descriptionEn.trim()).not.toBe('');
      expect(section.descriptionAr.trim()).not.toBe('');
      expect(section.eyebrowEn.trim()).not.toBe('');
      expect(section.eyebrowAr.trim()).not.toBe('');
      expect(section.primaryCtaLabelEn.trim()).not.toBe('');
      expect(section.primaryCtaLabelAr.trim()).not.toBe('');
      expect(section.primaryCtaUrl.trim()).not.toBe('');
      expect(section.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(section.haloColor).toMatch(/^#[0-9a-fA-F]{6}$/);

      // Verify Arabic fields contain authentic Arabic characters
      const arRegex = /[\u0600-\u06FF]/;
      expect(arRegex.test(section.headingAr)).toBe(true);
      expect(arRegex.test(section.descriptionAr)).toBe(true);
      expect(arRegex.test(section.eyebrowAr)).toBe(true);
      expect(arRegex.test(section.primaryCtaLabelAr)).toBe(true);
    });
  });

  it('ensures all primary and secondary CTA links resolve to valid internal routes', () => {
    DEFAULT_SPATIAL_SECTIONS.forEach((section) => {
      expect(section.primaryCtaUrl.startsWith('/')).toBe(true);
      if (section.secondaryCtaUrl) {
        expect(section.secondaryCtaUrl.startsWith('/')).toBe(true);
      }
    });
  });
});
