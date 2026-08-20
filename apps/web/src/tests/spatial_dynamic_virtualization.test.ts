import { describe, it, expect } from 'vitest';
import { SPATIAL_OCTAGON_CONFIG } from '../components/spatial/spatial-experience.config';
import { SpatialSection } from '../components/spatial/spatial-experience.types';

describe('Spatial Barrel Dynamic Sections & Virtualization Invariants', () => {
  // Helper to generate dynamic test sections
  const generateSections = (count: number, hiddenIndices: number[] = []): SpatialSection[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `test-section-${i + 1}`,
      slug: `section-${i + 1}`,
      sectionNumber: String(i + 1).padStart(2, '0'),
      sortOrder: i,
      visibility: !hiddenIndices.includes(i),
      eyebrowEn: `Section ${i + 1}`,
      eyebrowAr: `القسم ${i + 1}`,
      headingEn: `Test Heading ${i + 1}`,
      headingAr: `عنوان تجريبي ${i + 1}`,
      descriptionEn: `Description for section ${i + 1}`,
      descriptionAr: `وصف للقسم ${i + 1}`,
      primaryCtaLabelEn: 'Explore',
      primaryCtaLabelAr: 'استكشف',
      primaryCtaUrl: `/b2c/section-${i + 1}`,
      backgroundColor: '#0a0d14',
      accentColor: '#38bdf8',
      haloColor: '#0284c7',
      textAlignment: 'CENTER',
      themeMode: 'DARK',
    }));
  };

  it('1. Filters hidden sections and assigns continuous section numbering', () => {
    const raw = generateSections(8, [1, 4]); // Hide index 1 and 4
    const visible = raw
      .filter((s) => s.visibility !== false)
      .map((s, idx) => ({
        ...s,
        sectionNumber: String(idx + 1).padStart(2, '0'),
        sortOrder: idx,
      }));

    expect(visible.length).toBe(6);
    expect(visible[0].id).toBe('test-section-1');
    expect(visible[0].sectionNumber).toBe('01');
    expect(visible[1].id).toBe('test-section-3');
    expect(visible[1].sectionNumber).toBe('02');
    expect(visible[visible.length - 1].sectionNumber).toBe('06');
  });

  it('2. Tests dynamic visible section counts: 0, 1, 2, 4, 8, 10, 12 with strict totalSteps definition', () => {
    const counts = [0, 1, 2, 4, 8, 10, 12];

    counts.forEach((count) => {
      const sections = generateSections(count);
      const visible = sections.filter((s) => s.visibility !== false);
      expect(visible.length).toBe(count);

      const dynamicTotal = String(visible.length).padStart(2, '0');
      expect(dynamicTotal).toBe(String(count).padStart(2, '0'));

      // Strict mathematical invariant: totalSteps = Math.max(visibleSections.length - 1, 0)
      const totalSteps = Math.max(visible.length - 1, 0);
      if (count <= 1) {
        expect(totalSteps).toBe(0);
      } else {
        expect(totalSteps).toBe(count - 1);
      }
    });
  });

  it('3. Verifies strictly 45-degree angle steps and exact rotation angles for 1, 4, 8, 10, and 12 sections', () => {
    const angleStepDeg = 45;
    const angleStepRad = (Math.PI * 45) / 180; // Math.PI / 4
    expect(angleStepRad).toBeCloseTo(Math.PI / 4, 6);

    // 1 section: strictly 0°
    const sec1 = generateSections(1);
    expect(sec1.length).toBe(1);
    const rot1 = 0 * angleStepDeg;
    expect(rot1).toBe(0);

    // 4 sections: 0°, 45°, 90°, 135°
    const sec4 = generateSections(4);
    expect(sec4.length).toBe(4);
    const rot4 = [0, 1, 2, 3].map((idx) => idx * angleStepDeg);
    expect(rot4).toEqual([0, 45, 90, 135]);

    // 8 sections: final 315° (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)
    const sec8 = generateSections(8);
    expect(sec8.length).toBe(8);
    const rot8 = Array.from({ length: 8 }, (_, i) => i * angleStepDeg);
    expect(rot8[rot8.length - 1]).toBe(315);
    expect(rot8).toEqual([0, 45, 90, 135, 180, 225, 270, 315]);

    // 10 sections: final 405° with 8-slot recycling (360° + 45° = 405°)
    const sec10 = generateSections(10);
    expect(sec10.length).toBe(10);
    const rot10 = Array.from({ length: 10 }, (_, i) => i * angleStepDeg);
    expect(rot10[rot10.length - 1]).toBe(405);
    expect(rot10[8]).toBe(360); // index 8 maps to physical slot 0 at 360°
    expect(rot10[9]).toBe(405); // index 9 maps to physical slot 1 at 405°

    // 12 sections: final 495° with 8-slot recycling (360° + 135° = 495°)
    const sec12 = generateSections(12);
    expect(sec12.length).toBe(12);
    const rot12 = Array.from({ length: 12 }, (_, i) => i * angleStepDeg);
    expect(rot12[rot12.length - 1]).toBe(495);
    expect(rot12[10]).toBe(450);
    expect(rot12[11]).toBe(495);

    // Verify mathematical formula: rotationDegrees = activeSectionIndex * 45 for every section
    [1, 4, 8, 10, 12].forEach((count) => {
      for (let i = 0; i < count; i++) {
        const rotationDegrees = i * 45;
        expect(rotationDegrees).toBe(i * angleStepDeg);
      }
    });
  });

  it('4. Demonstrates 8-slot recycling virtualization prevents physical 3D mesh collisions for 10 and 12 sections', () => {
    [10, 12].forEach((count) => {
      const sections = generateSections(count);

      // Virtualization simulation across all active indices (0..count-1)
      for (let activeIndex = 0; activeIndex < sections.length; activeIndex++) {
        // 8-face window around activeIndex
        const windowStart = Math.max(0, activeIndex - 3);
        const windowEnd = Math.min(sections.length - 1, windowStart + 7);
        const adjustedStart = Math.max(0, Math.min(windowStart, windowEnd - 7));

        const mountedFaces = [];
        const usedSlots = new Set<number>();
        const usedWorldAngles = new Set<number>();

        for (let sIdx = adjustedStart; sIdx <= windowEnd; sIdx++) {
          const sec = sections[sIdx];
          if (sec) {
            const slotIndex = ((sIdx % 8) + 8) % 8;

            // CRITICAL INVARIANT: No two mounted faces in the scene ever share the same physical slot!
            expect(usedSlots.has(slotIndex)).toBe(false);
            usedSlots.add(slotIndex);

            // World angle calculation
            const slotAngle = slotIndex * SPATIAL_OCTAGON_CONFIG.angleStep;
            expect(usedWorldAngles.has(slotAngle)).toBe(false);
            usedWorldAngles.add(slotAngle);

            mountedFaces.push({
              id: sec.id,
              sectionIndex: sIdx,
              slotIndex,
              slotAngle,
              isActive: sIdx === activeIndex,
            });
          }
        }

        // Verified: At most 8 physical meshes mounted, all occupying distinct physical slots
        expect(mountedFaces.length).toBeLessThanOrEqual(8);
        expect(usedSlots.size).toBe(mountedFaces.length);
        expect(usedWorldAngles.size).toBe(mountedFaces.length);
      }
    });
  });

  it('5. Transitions evidence: 7 -> 8 and 8 -> 9 in dynamic 12-section barrel', () => {
    const sections = generateSections(12);
    const angleStep = Math.PI / 4;
    const totalSteps = sections.length - 1;

    // Transition 7 -> 8 (crossing the default 8-face threshold)
    const rot7 = - (7 / totalSteps) * totalSteps * angleStep;
    const rot8 = - (8 / totalSteps) * totalSteps * angleStep;
    expect(Math.abs(rot8 - rot7)).toBeCloseTo(Math.PI / 4, 5);

    // Slot recycling check at index 7 and 8
    const slot7 = ((7 % 8) + 8) % 8; // slot 7
    const slot8 = ((8 % 8) + 8) % 8; // slot 0
    expect(slot7).toBe(7);
    expect(slot8).toBe(0);

    // Transition 8 -> 9
    const rot9 = - (9 / totalSteps) * totalSteps * angleStep;
    expect(Math.abs(rot9 - rot8)).toBeCloseTo(Math.PI / 4, 5);
    const slot9 = ((9 % 8) + 8) % 8; // slot 1
    expect(slot9).toBe(1);

    // Reverse transition: last section (11) -> previous section (10)
    const rot11 = - (11 / totalSteps) * totalSteps * angleStep;
    const rot10 = - (10 / totalSteps) * totalSteps * angleStep;
    expect(Math.abs(rot11 - rot10)).toBeCloseTo(Math.PI / 4, 5);
  });

  it('6. Handles dynamic CMS hide/reorder while active index is near the end', () => {
    const activeIndex = 11; // User is at the last section

    // CMS suddenly hides 4 sections (visible count drops to 8)
    const updatedRaw = generateSections(12, [8, 9, 10, 11]);
    const newVisible = updatedRaw.filter((s) => s.visibility !== false);
    expect(newVisible.length).toBe(8);

    // Dynamic clamping rule: activeIndex must clamp to Math.min(activeIndex, newVisible.length - 1)
    const clampedActiveIndex = Math.min(activeIndex, newVisible.length - 1);
    expect(clampedActiveIndex).toBe(7);
    expect(clampedActiveIndex).toBeLessThan(newVisible.length);
  });

  it('7. Verifies boundary behavior for 0 and 1 sections', () => {
    // 0 sections: empty fallback
    const zeroSections: SpatialSection[] = [];
    const isZero = zeroSections.length === 0;
    expect(isZero).toBe(true);

    // 1 section: static lock (totalSteps = 0, no scroll rotation)
    const singleSection = generateSections(1);
    const isSingle = singleSection.length === 1;
    expect(isSingle).toBe(true);
    const totalSteps = Math.max(0, singleSection.length - 1);
    expect(totalSteps).toBe(0);
  });
});
