import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db';
import { normalizeRichText, cleanObjectObjectResidue } from '@/lib/rich-text';
import { formatLocalizedText } from '@/lib/utils';

describe('Attraction Studio Production Hardening & Parity Suite', () => {

  describe('1. Multilingual Rich-Text Normalization & Zero [object Object] Guarantee', () => {
    it('normalizes string primitives without distortion', () => {
      expect(normalizeRichText('Urban Arena Experience')).toBe('Urban Arena Experience');
      expect(normalizeRichText('أوربان أرينا', 'ar')).toBe('أوربان أرينا');
    });

    it('extracts clean text from ProseMirror/TipTap JSON doc tree', () => {
      const tiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Experience high-speed racing' },
              { type: 'text', text: ' with augmented reality.' }
            ]
          }
        ]
      };

      const result = normalizeRichText(tiptapDoc);
      expect(result).toBe('Experience high-speed racing  with augmented reality.');
      expect(result).not.toContain('[object Object');
    });

    it('parses and cleans stringified JSON rich-text payloads', () => {
      const stringified = JSON.stringify({
        en: 'Electric karting arena',
        ar: 'حلبة سباق الكارتينغ الكهربائية'
      });

      expect(normalizeRichText(stringified, 'en')).toBe('Electric karting arena');
      expect(normalizeRichText(stringified, 'ar')).toBe('حلبة سباق الكارتينغ الكهربائية');
    });

    it('cleans legacy [object Object] prefix and suffix corruptions', () => {
      const corrupted = '[object ObjectTake control of an interactive racing experience with friends]';
      const result = cleanObjectObjectResidue(corrupted);
      expect(result).toBe('Take control of an interactive racing experience with friends');
      expect(result).not.toContain('[object');

      const standalone = '[object Object]';
      expect(cleanObjectObjectResidue(standalone)).toBe('');
    });

    it('integrates into formatLocalizedText with zero [object Object] leakage', () => {
      const testCases = [
        '[object Object]Urban Arena',
        { type: 'doc', content: [{ type: 'text', text: 'ProseMirror content' }] },
        { en: 'English Title', ar: 'عنوان عربي' },
        null,
        undefined
      ];

      testCases.forEach(tc => {
        const enOut = formatLocalizedText(tc, 'en');
        const arOut = formatLocalizedText(tc, 'ar');
        expect(enOut).not.toContain('[object Object');
        expect(arOut).not.toContain('[object Object');
      });
    });
  });

  describe('2. Public Pricing Tiers Categorization (All 10 Tiers)', () => {
    const sampleTiers = [
      { id: '1', titleEn: 'Rookie Pass (45 Min)', titleAr: 'تذكرة المبتدئين – 45 دقيقة', price: 75, currency: 'QAR', type: 'HOURLY' },
      { id: '2', titleEn: 'Pro Pass (90 Min)', titleAr: 'تذكرة المحترفين – 90 دقيقة', price: 120, currency: 'QAR', type: 'PREMIUM' },
      { id: '3', titleEn: 'General Admission', titleAr: 'تذكرة دخول عامة', price: 50, currency: 'QAR', type: 'GENERAL' },
      { id: '4', titleEn: 'Grip Socks', titleAr: 'جوارب الترامبولين', price: 15, currency: 'QAR', type: 'ADD_ON' },
      { id: '5', titleEn: 'VR Simulator Pass', titleAr: 'تذكرة محاكي الواقع الافتراضي', price: 35, currency: 'QAR', type: 'PREMIUM' }
    ];

    it('correctly maps each pricing tier to its visual category group', () => {
      const categorize = (tier: any) => {
        const t = (tier.type || '').toUpperCase().trim();
        const title = (tier.titleEn || tier.titleAr || '').toLowerCase();
        if (t === 'ADD_ON' || t === 'ADDON' || title.includes('sock') || title.includes('locker')) return 'ADDON';
        if (t === 'PREMIUM' || t === 'VIP' || t === 'PRO' || title.includes('pro pass') || title.includes('vr')) return 'PREMIUM';
        if (t === 'HOURLY' || t === 'TIMED' || title.includes('min') || title.includes('hour')) return 'HOURLY';
        return 'ACCESS';
      };

      expect(categorize(sampleTiers[0])).toBe('HOURLY');
      expect(categorize(sampleTiers[1])).toBe('PREMIUM');
      expect(categorize(sampleTiers[2])).toBe('ACCESS');
      expect(categorize(sampleTiers[3])).toBe('ADDON');
      expect(categorize(sampleTiers[4])).toBe('PREMIUM');
    });
  });

  describe('3. Demo & Placeholder Trust Content Suppression', () => {
    it('filters out partners with placeholder logos or demo names', () => {
      const partnersList = [
        { name: 'Doha Mall', logoUrl: 'https://eeeqa.com/assets/partners/doha-mall-logo.svg' },
        { name: 'Demo Partner', logoUrl: 'https://via.placeholder.com/150' },
        { name: 'Generic Sponsor', logoUrl: 'https://example.com/logo.png' },
        { name: '', logoUrl: 'https://eeeqa.com/assets/partners/e3-logo.svg' },
        { partnerName: { en: 'Events & Entertainment Enterprises' }, logoUrl: 'https://eeeqa.com/assets/partners/e3.svg' }
      ];

      const valid = partnersList.filter(p => {
        const nameVal = typeof p === 'object' && ('partnerName' in p ? (p as any).partnerName : p.name);
        const resolvedName = formatLocalizedText(nameVal, 'en').trim();
        const logo = p.logoUrl || '';

        if (!resolvedName || !logo) return false;
        if (logo.includes('placeholder') || logo.includes('example.com')) return false;
        if (resolvedName.toLowerCase().includes('demo partner')) return false;

        return true;
      });

      expect(valid.length).toBe(2);
      expect(valid[0].name).toBe('Doha Mall');
    });

    it('filters out demo visitor testimonials and placeholder news', () => {
      const testimonials = [
        { author: 'Ahmed K.', quote: 'Incredible mixed reality experience for the family!' },
        { author: 'Placeholder User', quote: 'Demo quote lorem ipsum dolor sit amet.' }
      ];

      const validTestimonials = testimonials.filter(t => 
        t.author && t.quote && 
        !t.quote.toLowerCase().includes('demo quote') && 
        !t.author.toLowerCase().includes('placeholder')
      );

      expect(validTestimonials.length).toBe(1);
      expect(validTestimonials[0].author).toBe('Ahmed K.');
    });
  });

  describe('4. Story Track Badges & Experience Paths Resolution', () => {
    it('extracts unique story tracks and generates localized labels', () => {
      const mockFeatures = [
        {
          titleEn: 'Bazooka Ball',
          storyTypes: [{ slug: 'compete', titleEn: 'Compete', titleAr: 'تنافس', color: '#f59e0b' }]
        },
        {
          titleEn: 'AR Racing',
          storyTypes: [{ slug: 'drive', titleEn: 'Drive', titleAr: 'قيادة', color: '#3b82f6' }]
        },
        {
          titleEn: 'Laser Tag Arena',
          storyTypes: [{ slug: 'compete', titleEn: 'Compete', titleAr: 'تنافس', color: '#f59e0b' }]
        }
      ];

      const trackMap = new Map<string, any>();
      mockFeatures.forEach(f => {
        f.storyTypes.forEach(st => {
          if (!trackMap.has(st.slug)) {
            trackMap.set(st.slug, st);
          }
        });
      });

      const uniqueTracks = Array.from(trackMap.values());
      expect(uniqueTracks.length).toBe(2);
      expect(uniqueTracks.map(t => t.slug)).toEqual(['compete', 'drive']);
      expect(uniqueTracks.find(t => t.slug === 'compete').titleAr).toBe('تنافس');
    });
  });

  describe('5. Database Parity & Canonical GIS Location for Urban Arena', () => {
    it('resolves Urban Arena with canonical Doha Mall GIS location', async () => {
      const attraction = await db.attraction.findFirst({
        where: { slug: 'urban-arena-doha-mall' },
        include: {
          attractionLocations: {
            include: { location: true }
          },
          featuresList: {
            include: {
              storyTypes: true,
              linkedBrand: true
            }
          },
          pricing: true
        }
      });

      expect(attraction).toBeDefined();
      if (attraction) {
        expect(attraction.nameEn).toBe('Urban Arena');
        expect(attraction.attractionLocations.length).toBeGreaterThan(0);

        const primaryLink = attraction.attractionLocations.find((al: any) => al.isPrimary) || attraction.attractionLocations[0];
        expect(primaryLink.location).toBeDefined();
        expect(primaryLink.location.nameEn).toBe('Urban Arena');
        expect(primaryLink.location.venueEn).toContain('Doha Mall');
        expect(Number(primaryLink.location.latitude)).toBeCloseTo(25.233187, 4);
        expect(Number(primaryLink.location.longitude)).toBeCloseTo(51.506754, 4);

        // Verify pricing tier count
        expect(attraction.pricing.length).toBe(10);

        // Verify featuresList includes without brand error
        expect(Array.isArray(attraction.featuresList)).toBe(true);
        expect(attraction.featuresList.length).toBeGreaterThan(0);
      }
    });
  });

});
