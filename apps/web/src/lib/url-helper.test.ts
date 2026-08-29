import { describe, it, expect } from 'vitest';
import {
  canonicalizeRoute,
  isExternalUrl,
  normalizeExternalUrl,
  localizeHref,
  getSafeAnchorProps,
} from './url-helper';

describe('url-helper unit tests', () => {
  describe('canonicalizeRoute', () => {
    it('maps legacy B2B case-studies aliases to /b2b/case-studies', () => {
      expect(canonicalizeRoute('/b2b/cases')).toBe('/b2b/case-studies');
      expect(canonicalizeRoute('/cases')).toBe('/b2b/case-studies');
      expect(canonicalizeRoute('/case-studies')).toBe('/b2b/case-studies');
      expect(canonicalizeRoute('/b2b/cases/digital-transform')).toBe('/b2b/case-studies/digital-transform');
      expect(canonicalizeRoute('/cases/digital-transform')).toBe('/b2b/case-studies/digital-transform');
    });

    it('maps legacy service FEC aliases to canonical FEC service route', () => {
      expect(canonicalizeRoute('/services/fec')).toBe('/b2b/services/fec-development');
      expect(canonicalizeRoute('/b2b/services/fec')).toBe('/b2b/services/fec-development');
    });

    it('maps legacy contact aliases to /b2b/contact', () => {
      expect(canonicalizeRoute('/partners-contact')).toBe('/b2b/contact');
      expect(canonicalizeRoute('/b2b/rfp')).toBe('/b2b/contact');
      expect(canonicalizeRoute('/contact/b2b')).toBe('/b2b/contact');
    });

    it('maps legacy attractions and events aliases', () => {
      expect(canonicalizeRoute('/attractions')).toBe('/b2c/attractions');
      expect(canonicalizeRoute('/attractions/doha-quest')).toBe('/b2c/attractions/doha-quest');
      expect(canonicalizeRoute('/calendar')).toBe('/b2c/calendar');
      expect(canonicalizeRoute('/events')).toBe('/b2c/calendar');
    });

    it('preserves query params and hash during canonicalization', () => {
      expect(canonicalizeRoute('/partners-contact?utm_source=hero#contact-form')).toBe(
        '/b2b/contact?utm_source=hero#contact-form'
      );
      expect(canonicalizeRoute('/en/cases/slug?ref=123')).toBe('/en/b2b/case-studies/slug?ref=123');
    });
  });

  describe('isExternalUrl', () => {
    it('identifies standard external schemes', () => {
      expect(isExternalUrl('https://example.com')).toBe(true);
      expect(isExternalUrl('http://example.com')).toBe(true);
      expect(isExternalUrl('mailto:info@e3.qa')).toBe(true);
      expect(isExternalUrl('tel:+97444000000')).toBe(true);
      expect(isExternalUrl('sms:+97444000000')).toBe(true);
    });

    it('identifies schemeless social and domain patterns', () => {
      expect(isExternalUrl('www.youtube.com/user/e3')).toBe(true);
      expect(isExternalUrl('facebook.com/e3qatar')).toBe(true);
      expect(isExternalUrl('instagram.com/e3')).toBe(true);
      expect(isExternalUrl('Snapchat.com/add/e3')).toBe(true);
    });

    it('returns false for internal relative paths', () => {
      expect(isExternalUrl('/b2b/services')).toBe(false);
      expect(isExternalUrl('/en/b2c')).toBe(false);
      expect(isExternalUrl('#features')).toBe(false);
    });
  });

  describe('normalizeExternalUrl', () => {
    it('prepends https:// to schemeless external domains', () => {
      expect(normalizeExternalUrl('www.youtube.com/user/e3')).toBe('https://www.youtube.com/user/e3');
      expect(normalizeExternalUrl('facebook.com/e3qatar')).toBe('https://facebook.com/e3qatar');
      expect(normalizeExternalUrl('Snapchat.com/add/e3')).toBe('https://Snapchat.com/add/e3');
    });

    it('neutralizes malicious protocols', () => {
      expect(normalizeExternalUrl('javascript:alert(1)')).toBe('');
      expect(normalizeExternalUrl('data:text/html,<script>alert(1)</script>')).toBe('');
      expect(normalizeExternalUrl('vbscript:msgbox(1)')).toBe('');
    });

    it('keeps mailto:, tel:, sms: intact', () => {
      expect(normalizeExternalUrl('mailto:contact@e3.qa')).toBe('mailto:contact@e3.qa');
      expect(normalizeExternalUrl('tel:+97444000000')).toBe('tel:+97444000000');
    });
  });

  describe('localizeHref', () => {
    it('prefixes english internal links with /en', () => {
      expect(localizeHref('/b2b/services', 'en')).toBe('/en/b2b/services');
      expect(localizeHref('/b2c/attractions', 'en')).toBe('/en/b2c/attractions');
    });

    it('prefixes arabic internal links with /ar', () => {
      expect(localizeHref('/b2b/services', 'ar')).toBe('/ar/b2b/services');
      expect(localizeHref('/b2c/attractions', 'ar')).toBe('/ar/b2c/attractions');
    });

    it('prevents duplicate locale prefixes', () => {
      expect(localizeHref('/en/b2b/services', 'en')).toBe('/en/b2b/services');
      expect(localizeHref('/ar/b2b/services', 'ar')).toBe('/ar/b2b/services');
      expect(localizeHref('/en/b2b/services', 'ar')).toBe('/ar/b2b/services');
    });

    it('preserves query strings and hashes', () => {
      expect(localizeHref('/b2b/contact?subject=rfp#form', 'en')).toBe('/en/b2b/contact?subject=rfp#form');
      expect(localizeHref('#section-1', 'ar')).toBe('#section-1');
    });

    it('does not touch external links', () => {
      expect(localizeHref('https://youtube.com', 'en')).toBe('https://youtube.com');
      expect(localizeHref('www.facebook.com', 'ar')).toBe('https://www.facebook.com');
    });
  });

  describe('getSafeAnchorProps', () => {
    it('returns target="_blank" and rel="noopener noreferrer" for external links', () => {
      const props = getSafeAnchorProps('www.youtube.com/e3', 'en');
      expect(props.href).toBe('https://www.youtube.com/e3');
      expect(props.target).toBe('_blank');
      expect(props.rel).toBe('noopener noreferrer');
    });

    it('does not add target="_blank" for mailto or tel', () => {
      const props = getSafeAnchorProps('mailto:info@e3.qa', 'en');
      expect(props.href).toBe('mailto:info@e3.qa');
      expect(props.target).toBeUndefined();
      expect(props.rel).toBeUndefined();
    });

    it('returns simple localized href for internal links', () => {
      const props = getSafeAnchorProps('/b2b/contact', 'ar');
      expect(props.href).toBe('/ar/b2b/contact');
      expect(props.target).toBeUndefined();
    });
  });
});
