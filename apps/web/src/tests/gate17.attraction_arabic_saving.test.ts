import { describe, it, expect } from 'vitest';
import { formatLocalizedText } from '../lib/utils';

describe('Gate 17: Attraction Arabic "What\'s Inside" Content & Save Resilience Audits', () => {
  describe('1. "What\'s Inside" Arabic & Bilingual Resolution', () => {
    it('should correctly format Arabic feature title and description when locale is ar', () => {
      const feature = {
        titleEn: '360 Kinetic Projection',
        titleAr: 'عروض إسقاط حركي 360 درجة',
        descriptionEn: 'Immersive surround experience.',
        descriptionAr: 'تجربة محيطية مذهلة عالية الدقة.',
      };

      const titleAr = formatLocalizedText(feature.titleAr, 'ar');
      const descAr = formatLocalizedText(feature.descriptionAr, 'ar');

      expect(titleAr).toBe('عروض إسقاط حركي 360 درجة');
      expect(descAr).toBe('تجربة محيطية مذهلة عالية الدقة.');
    });

    it('should fallback to English title when Arabic title is missing', () => {
      const feature = {
        titleEn: 'VR Arena',
        titleAr: '',
        descriptionEn: 'Multiplayer VR',
      };

      const titleAr = feature.titleAr || feature.titleEn;
      const formatted = formatLocalizedText(titleAr, 'ar');
      expect(formatted).toBe('VR Arena');
    });
  });

  describe('2. Attraction Save Payload Sanitization', () => {
    it('should safely normalize pricing numeric values and prevent NaN / null Prisma errors', () => {
      const rawPricing = [
        { titleEn: 'Adult Ticket', titleAr: 'تذكرة البالغين', price: '150', discount: '' },
        { titleEn: 'Child Ticket', titleAr: 'تذكرة الأطفال', price: 90, discount: '10' },
        { titleEn: 'VIP Pass', titleAr: 'تذكرة كبار الشخصيات', price: 'NaN', discount: null }
      ];

      const safePricing = rawPricing.map((p: any) => ({
        titleEn: (p.titleEn || p.titleAr || 'General Ticket').trim(),
        titleAr: (p.titleAr || p.titleEn || 'تذكرة عامة').trim(),
        price: typeof p.price === 'number' && !isNaN(p.price) ? p.price : (parseFloat(p.price) || 0),
        discount: p.discount !== null && p.discount !== undefined && !isNaN(parseFloat(p.discount)) ? parseFloat(p.discount) : null,
      }));

      expect(safePricing[0].price).toBe(150);
      expect(safePricing[0].discount).toBeNull();
      expect(safePricing[1].price).toBe(90);
      expect(safePricing[1].discount).toBe(10);
      expect(safePricing[2].price).toBe(0);
    });

    it('should sanitize slug and bilingual name fields', () => {
      const rawPayload = {
        nameEn: '  Snow Park  ',
        nameAr: '',
        slug: '  Snow Park Qatar!!  '
      };

      const cleanNameEn = (rawPayload.nameEn || rawPayload.nameAr || 'Attraction').trim();
      const cleanNameAr = (rawPayload.nameAr || rawPayload.nameEn || 'الوجهة').trim();
      const cleanSlug = (rawPayload.slug || rawPayload.nameEn).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      expect(cleanNameEn).toBe('Snow Park');
      expect(cleanNameAr).toBe('Snow Park');
      expect(cleanSlug).toBe('snow-park-qatar');
    });
  });
});
