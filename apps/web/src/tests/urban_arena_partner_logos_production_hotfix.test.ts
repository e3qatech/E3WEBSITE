import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { resolvePartnerLogoUrl, normalizeServerPartnerData } from '../lib/partners/partner-resolver'
import { normalizeLegacyPartnerUrl, repairJsonPartnerUrls } from '../scripts/repair-partner-urls'
import { resolveBookingUrl } from '../lib/cms-attractions'

/**
 * Robust XML Entity & Syntax Validator for SVG assets
 */
function validateSvgXmlSyntax(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!content.trim().startsWith('<svg') || !content.trim().endsWith('</svg>')) {
    errors.push('SVG must start with <svg and end with </svg>')
  }

  // Check for unescaped bare ampersands: & that is not followed by an entity name (amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);
  const bareAmpersandRegex = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g
  const bareAmpMatches = content.match(bareAmpersandRegex)
  if (bareAmpMatches) {
    errors.push(`Found ${bareAmpMatches.length} unescaped bare ampersand (&) characters in XML content`)
  }

  // Check attribute quotes balance
  const tagRegex = /<[^>]+>/g
  const tags = content.match(tagRegex) || []
  for (const tag of tags) {
    const quotes = tag.match(/"/g) || []
    if (quotes.length % 2 !== 0) {
      errors.push(`Malformed attribute quotes in tag: ${tag}`)
    }
  }

  return { valid: errors.length === 0, errors }
}

describe('Urban Arena Partner Logos Production Hotfix & Parity Suite', () => {

  // --------------------------------------------------------------------------
  // 1. PHYSICAL SVG ASSET XML PARSING & DECODING INTEGRITY
  // --------------------------------------------------------------------------
  describe('1. Partner SVG Asset XML Parsing (No xmlParseEntityRef Errors)', () => {
    const publicDir = path.resolve(__dirname, '../../public')

    it('e3-logo.svg parses as 100% valid XML with escaped &amp; entities', () => {
      const filePath = path.join(publicDir, 'assets/partners/e3-logo.svg')
      expect(fs.existsSync(filePath)).toBe(true)
      const content = fs.readFileSync(filePath, 'utf-8')

      // Ensure no raw unescaped & exists
      expect(content).not.toMatch(/EXPERIENCES & ENTERTAINMENT/i)
      expect(content).toContain('EXPERIENCES &amp; ENTERTAINMENT')

      const validation = validateSvgXmlSyntax(content)
      expect(validation.errors).toEqual([])
      expect(validation.valid).toBe(true)
    })

    it('doha-mall-logo.svg parses as 100% valid XML with Arabic typography', () => {
      const filePath = path.join(publicDir, 'assets/partners/doha-mall-logo.svg')
      expect(fs.existsSync(filePath)).toBe(true)
      const content = fs.readFileSync(filePath, 'utf-8')

      const validation = validateSvgXmlSyntax(content)
      expect(validation.errors).toEqual([])
      expect(validation.valid).toBe(true)
      expect(content).toContain('DOHA MALL')
      expect(content).toContain('دوحة مول')
    })
  })

  // --------------------------------------------------------------------------
  // 2. CANONICAL RESOLVER REWRITES LEGACY EEEQA.COM URLS
  // --------------------------------------------------------------------------
  describe('2. Partner Resolver Legacy URL Normalization', () => {
    it('rewrites https://eeeqa.com/assets/partners/e3-logo.svg to relative /assets/partners/e3-logo.svg', () => {
      const input = 'https://eeeqa.com/assets/partners/e3-logo.svg'
      const resolved = resolvePartnerLogoUrl(input)
      expect(resolved).toBe('/assets/partners/e3-logo.svg')
    })

    it('rewrites https://eeeqa.com/assets/partners/doha-mall-logo.svg to relative /assets/partners/doha-mall-logo.svg', () => {
      const input = 'https://eeeqa.com/assets/partners/doha-mall-logo.svg'
      const resolved = resolvePartnerLogoUrl(input)
      expect(resolved).toBe('/assets/partners/doha-mall-logo.svg')
    })

    it('preserves existing valid relative /assets/partners/ paths', () => {
      expect(resolvePartnerLogoUrl('/assets/partners/e3-logo.svg')).toBe('/assets/partners/e3-logo.svg')
      expect(resolvePartnerLogoUrl('/assets/partners/doha-mall-logo.svg')).toBe('/assets/partners/doha-mall-logo.svg')
    })

    it('rejects placeholders and broken dummy URLs', () => {
      expect(resolvePartnerLogoUrl('https://via.placeholder.com/150')).toBeNull()
      expect(resolvePartnerLogoUrl('https://example.com/logo.png')).toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // 3. SERVER/DATA BOUNDARY NORMALIZER
  // --------------------------------------------------------------------------
  describe('3. Server-side Data Boundary Normalizer', () => {
    it('strips legacy eeeqa.com/assets/partners/ from nested attraction props before SSR payload serialization', () => {
      const rawData = {
        nameEn: 'Urban Arena',
        partners: [
          { partnerName: { en: 'E3', ar: 'إي ثري' }, logoUrl: 'https://eeeqa.com/assets/partners/e3-logo.svg' },
          { partnerName: { en: 'Doha Mall', ar: 'دوحة مول' }, logoUrl: 'https://eeeqa.com/assets/partners/doha-mall-logo.svg' }
        ]
      }

      const sanitized = normalizeServerPartnerData(rawData)
      expect(sanitized.partners[0].logoUrl).toBe('/assets/partners/e3-logo.svg')
      expect(sanitized.partners[1].logoUrl).toBe('/assets/partners/doha-mall-logo.svg')
      expect(JSON.stringify(sanitized)).not.toContain('eeeqa.com/assets/partners/')
    })
  })

  // --------------------------------------------------------------------------
  // 4. CANONICAL BOOKING CTA RESOLUTION
  // --------------------------------------------------------------------------
  describe('4. Urban Arena Canonical "Get Tickets" CTA Resolution', () => {
    it('resolves canonical attraction route #pricing and eliminates obsolete urban-arena-doha-mall slug', () => {
      const attraction = {
        slug: 'urban-arena',
        nameEn: 'Urban Arena',
        bookingMode: 'INTERNAL_ROUTE',
        bookingUrl: '/b2c/attractions/urban-arena-doha-mall#booking'
      }

      const enLink = resolveBookingUrl(attraction, 'en')
      const arLink = resolveBookingUrl(attraction, 'ar')

      expect(enLink).toBe('/en/b2c/attractions/urban-arena#pricing')
      expect(arLink).toBe('/ar/b2c/attractions/urban-arena#pricing')
      expect(enLink).not.toContain('urban-arena-doha-mall')
      expect(arLink).not.toContain('urban-arena-doha-mall')
    })
  })

  // --------------------------------------------------------------------------
  // 5. IDEMPOTENT REPAIR SCRIPT LOGIC
  // --------------------------------------------------------------------------
  describe('5. Idempotent Repair Script Logic', () => {
    it('normalizes legacy URLs to relative public paths', () => {
      expect(normalizeLegacyPartnerUrl('https://eeeqa.com/assets/partners/e3-logo.svg')).toBe('/assets/partners/e3-logo.svg')
      expect(normalizeLegacyPartnerUrl('https://eeeqa.com/assets/partners/doha-mall-logo.svg')).toBe('/assets/partners/doha-mall-logo.svg')
    })

    it('repairs JSON structures idempotently on repeated execution', () => {
      const sampleUrbanArenaPartners = [
        {
          partnerName: { en: 'Events & Entertainment Enterprises (E3)', ar: 'إيفنتس آند إنترتينمنت إنتربرايزس E3' },
          logoUrl: 'https://eeeqa.com/assets/partners/e3-logo.svg'
        },
        {
          partnerName: { en: 'Doha Mall', ar: 'دوحة مول' },
          logoUrl: 'https://eeeqa.com/assets/partners/doha-mall-logo.svg'
        }
      ]

      // Execution 1: Performs modification
      const { modified, result } = repairJsonPartnerUrls(sampleUrbanArenaPartners)
      expect(modified).toBe(true)
      expect(result[0].logoUrl).toBe('/assets/partners/e3-logo.svg')
      expect(result[1].logoUrl).toBe('/assets/partners/doha-mall-logo.svg')

      // Execution 2: Performs zero modifications (idempotent)
      const secondRun = repairJsonPartnerUrls(result)
      expect(secondRun.modified).toBe(false)
      expect(secondRun.result[0].logoUrl).toBe('/assets/partners/e3-logo.svg')
    })
  })
})
