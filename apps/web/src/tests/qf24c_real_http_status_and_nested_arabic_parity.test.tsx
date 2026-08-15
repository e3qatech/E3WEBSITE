import { describe, it, expect } from 'vitest';
import db from '@/lib/db';
import {
  resolvePublicTeamMember,
  translateDurationToArabic,
} from '@/lib/team/team-resolver';
import B2BTeamMemberPage from '@/app/[locale]/b2b/team/[slug]/page';
import B2CTeamMemberPage from '@/app/[locale]/b2c/team/[slug]/page';

// Helper regex to detect forbidden English prose sentences (3+ consecutive English words)
// while allowing Latin proper names/acronyms/cert codes (e.g., 'E3', 'FIFA', 'PMP', 'Meta', 'Google', 'AZ-104')
const FORBIDDEN_ENGLISH_PROSE_REGEX = /\b(the|and|or|in|on|at|to|for|with|by|from|about|into|through|during|before|after|above|below|between|under|over|management|operations|marketing|development|director|manager|lead|coordinator|supervisor|engineer|specialist|officer|associate|architect|analyst|strategist|assistant|intern|experience|project|portfolio|description|responsibilities|deliverables|achievements|present|ongoing|current)\b/i;

describe('QF-24-C — REAL HTTP STATUS & NESTED ARABIC PROFILE PARITY', () => {
  describe('1. Legacy CUID Resolution & Real Next.js Permanent Redirect', () => {
    it('B2B page triggers permanent redirect (HTTP 308) to canonical slug when given a legacy CUID', async () => {
      // Find an active member to get id and slug
      const sample = await db.employeeProfile.findFirst({
        where: { isActive: true, slug: 'ahmad-faraz' },
      });
      expect(sample).toBeDefined();
      if (!sample) return;

      try {
        await B2BTeamMemberPage({
          params: Promise.resolve({ locale: 'en', slug: sample.id }),
        });
        expect.fail('Should have thrown NEXT_REDIRECT');
      } catch (error: any) {
        expect(error.message).toBe('NEXT_REDIRECT');
        // Next.js permanentRedirect sets digest with permanent redirect marker and destination
        expect(error.digest).toContain(`/en/b2b/team/${sample.slug}`);
      }

      // Test Arabic route as well
      try {
        await B2BTeamMemberPage({
          params: Promise.resolve({ locale: 'ar', slug: sample.id }),
        });
        expect.fail('Should have thrown NEXT_REDIRECT');
      } catch (error: any) {
        expect(error.message).toBe('NEXT_REDIRECT');
        expect(error.digest).toContain(`/ar/b2b/team/${sample.slug}`);
      }
    });

    it('B2C page triggers permanent redirect (HTTP 308) to canonical slug when given a legacy CUID', async () => {
      const sample = await db.employeeProfile.findFirst({
        where: { isActive: true, slug: 'abdulla-alkuwari' },
      });
      expect(sample).toBeDefined();
      if (!sample) return;

      try {
        await B2CTeamMemberPage({
          params: Promise.resolve({ locale: 'en', slug: sample.id }),
        });
        expect.fail('Should have thrown NEXT_REDIRECT');
      } catch (error: any) {
        expect(error.message).toBe('NEXT_REDIRECT');
        expect(error.digest).toContain(`/en/b2c/team/${sample.slug}`);
      }

      try {
        await B2CTeamMemberPage({
          params: Promise.resolve({ locale: 'ar', slug: sample.id }),
        });
        expect.fail('Should have thrown NEXT_REDIRECT');
      } catch (error: any) {
        expect(error.message).toBe('NEXT_REDIRECT');
        expect(error.digest).toContain(`/ar/b2c/team/${sample.slug}`);
      }
    });

    it('B2B and B2C pages throw NEXT_NOT_FOUND (HTTP 404) for unknown, inactive, or malformed slugs', async () => {
      // 1. Unknown slug
      try {
        await B2BTeamMemberPage({
          params: Promise.resolve({ locale: 'en', slug: 'non-existent-person-xyz' }),
        });
        expect.fail('Should have thrown NEXT_NOT_FOUND');
      } catch (error: any) {
        expect(
          error.message === 'NEXT_NOT_FOUND' ||
          error.message === 'NEXT_HTTP_ERROR_FALLBACK;404' ||
          (error.digest && error.digest.includes('404'))
        ).toBe(true);
      }

      try {
        await B2CTeamMemberPage({
          params: Promise.resolve({ locale: 'en', slug: 'non-existent-person-xyz' }),
        });
        expect.fail('Should have thrown NEXT_NOT_FOUND');
      } catch (error: any) {
        expect(
          error.message === 'NEXT_NOT_FOUND' ||
          error.message === 'NEXT_HTTP_ERROR_FALLBACK;404' ||
          (error.digest && error.digest.includes('404'))
        ).toBe(true);
      }
    });
  });

  describe('2. Timeline and Duration Arabic Normalization', () => {
    it('translateDurationToArabic correctly translates Present, Ongoing, and date ranges', () => {
      expect(translateDurationToArabic('Present')).toBe('حتى الآن');
      expect(translateDurationToArabic('present')).toBe('حتى الآن');
      expect(translateDurationToArabic('Ongoing')).toBe('مستمر');
      expect(translateDurationToArabic('2024 - Present')).toBe('2024 - حتى الآن');
      expect(translateDurationToArabic('2025-present')).toBe('2025 - حتى الآن');
      expect(translateDurationToArabic('2023 - 2025')).toBe('2023 - 2025');
      expect(translateDurationToArabic(null)).toBe('');
    });
  });

  describe('3. Regression Fixtures: Mohasin, Abdulla, Sarah, and Ahmad', () => {
    it('Ahmad Faraz (ahmad-faraz) fixture: zero English prose residue in Arabic mode', async () => {
      const raw = await db.employeeProfile.findUnique({
        where: { slug: 'ahmad-faraz' },
      });
      expect(raw).toBeDefined();
      if (!raw) return;

      const publicAr = resolvePublicTeamMember(raw, 'ar');
      expect(publicAr.designation).toBe('رئيس التسويق الإبداعي');
      expect(publicAr.department).toBe('التسويق');

      // Assert nested skills / tags
      publicAr.expertiseTags.forEach((tag) => {
        expect(tag).not.toMatch(FORBIDDEN_ENGLISH_PROSE_REGEX);
      });

      // Assert nested experience
      publicAr.experience.forEach((exp: any) => {
        expect(exp.duration).not.toContain('Present');
        expect(exp.duration).not.toContain('present');
        expect(exp.description).not.toMatch(FORBIDDEN_ENGLISH_PROSE_REGEX);
      });

      // Assert nested projects
      publicAr.projects.forEach((p: any) => {
        expect(p.description).not.toMatch(FORBIDDEN_ENGLISH_PROSE_REGEX);
      });
    });

    it('Abdulla Al-Kuwari (abdulla-alkuwari) fixture: zero English prose residue in Arabic mode', async () => {
      const raw = await db.employeeProfile.findUnique({
        where: { slug: 'abdulla-alkuwari' },
      });
      expect(raw).toBeDefined();
      if (!raw) return;

      const publicAr = resolvePublicTeamMember(raw, 'ar');
      expect(publicAr.name).toBe('عبدالله الكواري');
      expect(publicAr.designation).toBe('الرئيس التنفيذي');
      expect(publicAr.department).toBe('الإدارة التنفيذية');

      publicAr.expertiseTags.forEach((tag) => {
        expect(tag).not.toMatch(FORBIDDEN_ENGLISH_PROSE_REGEX);
      });

      publicAr.experience.forEach((exp: any) => {
        expect(exp.duration).not.toContain('Present');
        expect(exp.description).not.toMatch(FORBIDDEN_ENGLISH_PROSE_REGEX);
      });
    });

    it('Sarah Haddad (sarah-haddad) fixture: zero English prose residue in Arabic mode', async () => {
      const raw = await db.employeeProfile.findUnique({
        where: { slug: 'sarah-haddad' },
      });
      expect(raw).toBeDefined();
      if (!raw) return;

      const publicAr = resolvePublicTeamMember(raw, 'ar');
      expect(publicAr.name).toBe('سارة حداد');
      expect(publicAr.designation).toBe('رئيس قسم التصميم التجريبي');
      expect(publicAr.department).toBe('التصميم والإبداع');

      publicAr.expertiseTags.forEach((tag) => {
        expect(tag).not.toMatch(FORBIDDEN_ENGLISH_PROSE_REGEX);
      });
    });

    it('Second Mohasin (mohasin-mohammadaly-parayil) fixture: distinct identity and zero English residue', async () => {
      const raw = await db.employeeProfile.findUnique({
        where: { slug: 'mohasin-mohammadaly-parayil' },
      });
      expect(raw).toBeDefined();
      if (!raw) return;

      const publicAr = resolvePublicTeamMember(raw, 'ar');
      expect(publicAr.slug).toBe('mohasin-mohammadaly-parayil');
      expect(publicAr.name).toBe('محاسن محمد علي بارييل');
      expect(publicAr.department).toBe('التصميم والإبداع');

      publicAr.expertiseTags.forEach((tag) => {
        expect(tag).not.toMatch(FORBIDDEN_ENGLISH_PROSE_REGEX);
      });
    });
  });

  describe('4. Full Audit: All 22 Active Database Profiles Contain 0 Prohibited English Prose in Arabic', () => {
    it('audits all 22 profiles in Arabic mode', async () => {
      const allMembers = await db.employeeProfile.findMany({
        where: { isActive: true },
        orderBy: [{ order: 'asc' }, { lastName: 'asc' }, { firstName: 'asc' }],
      });

      expect(allMembers.length).toBe(22);

      const residueReport: Record<string, string[]> = {};

      for (const m of allMembers) {
        const ar = resolvePublicTeamMember(m, 'ar');
        const violations: string[] = [];

        // 1. Tagline & About Summary
        if (ar.aboutSummary && FORBIDDEN_ENGLISH_PROSE_REGEX.test(ar.aboutSummary)) {
          violations.push(`aboutSummary: "${ar.aboutSummary}"`);
        }

        // 2. Expertise Tags
        ar.expertiseTags.forEach((tag: string) => {
          if (FORBIDDEN_ENGLISH_PROSE_REGEX.test(tag)) {
            violations.push(`expertiseTag: "${tag}"`);
          }
        });

        // 3. Core Competencies
        ar.coreCompetencies.forEach((comp: string) => {
          if (FORBIDDEN_ENGLISH_PROSE_REGEX.test(comp)) {
            violations.push(`coreCompetency: "${comp}"`);
          }
        });

        // 4. Experience Timeline
        ar.experience.forEach((exp: any, idx: number) => {
          if (exp.duration && /\bPresent\b/i.test(exp.duration)) {
            violations.push(`experience[${idx}].duration contains "Present": "${exp.duration}"`);
          }
          if (exp.description && FORBIDDEN_ENGLISH_PROSE_REGEX.test(exp.description)) {
            violations.push(`experience[${idx}].description: "${exp.description}"`);
          }
        });

        // 5. Projects
        ar.projects.forEach((proj: any, idx: number) => {
          if (proj.description && FORBIDDEN_ENGLISH_PROSE_REGEX.test(proj.description)) {
            violations.push(`project[${idx}].description: "${proj.description}"`);
          }
        });

        if (violations.length > 0) {
          residueReport[m.slug] = violations;
        }
      }

      const totalViolatingProfiles = Object.keys(residueReport).length;
      if (totalViolatingProfiles > 0) {
        console.error('Violations detected:', JSON.stringify(residueReport, null, 2));
      }
      expect(totalViolatingProfiles).toBe(0);
    });
  });

  describe('5. Preservation of English Presentation', () => {
    it('English output remains pristine and unchanged', async () => {
      const raw = await db.employeeProfile.findUnique({
        where: { slug: 'ahmad-faraz' },
      });
      expect(raw).toBeDefined();
      if (!raw) return;

      const publicEn = resolvePublicTeamMember(raw, 'en');
      expect(publicEn.name).toBe('Ahmad Faraz');
      expect(publicEn.designation).toBe('Creative Marketing Lead');
      expect(publicEn.department).toBe('Marketing');
      expect(publicEn.aboutSummary).toContain('Ahmad Faraz drives the digital pulse of E3');
      expect(publicEn.expertiseTags).toContain('Digital Campaigns');
      expect(publicEn.experience.length).toBeGreaterThan(0);
      expect(publicEn.projects.length).toBeGreaterThan(0);
    });
  });
});
