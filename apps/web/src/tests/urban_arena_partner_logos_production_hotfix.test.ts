import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { resolvePartnerLogoUrl } from '../lib/partners/partner-resolver'
import { normalizeLegacyPartnerUrl, repairJsonPartnerUrls } from '../scripts/repair-partner-urls'

describe('Urban Arena Partner Logos Production Hotfix & Parity Suite', () => {

  // --------------------------------------------------------------------------
  // 1. CANONICAL RESOLVER REWRITES LEGACY EEEQA.COM URLS
  // --------------------------------------------------------------------------
  describe('1. Partner Resolver Legacy URL Normalization', () => {
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

    it('rewrites HTTP legacy URLs to relative asset paths', () => {
      const input = 'http://eeeqa.com/assets/partners/place-vendome-logo.svg'
      const resolved = resolvePartnerLogoUrl(input)
      expect(resolved).toBe('/assets/partners/place-vendome-logo.svg')
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
  // 2. IDEMPOTENT REPAIR SCRIPT FUNCTIONS
  // --------------------------------------------------------------------------
  describe('2. Idempotent Repair Script Logic', () => {
    it('normalizes legacy URLs to relative public paths', () => {
      expect(normalizeLegacyPartnerUrl('https://eeeqa.com/assets/partners/e3-logo.svg')).toBe('/assets/partners/e3-logo.svg')
      expect(normalizeLegacyPartnerUrl('https://eeeqa.com/assets/partners/doha-mall-logo.svg')).toBe('/assets/partners/doha-mall-logo.svg')
    })

    it('repairs JSON structures containing legacy partner URLs', () => {
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

      const { modified, result } = repairJsonPartnerUrls(sampleUrbanArenaPartners)
      expect(modified).toBe(true)
      expect(result[0].logoUrl).toBe('/assets/partners/e3-logo.svg')
      expect(result[1].logoUrl).toBe('/assets/partners/doha-mall-logo.svg')

      // Second run is idempotent and does not modify
      const secondRun = repairJsonPartnerUrls(result)
      expect(secondRun.modified).toBe(false)
      expect(secondRun.result[0].logoUrl).toBe('/assets/partners/e3-logo.svg')
    })
  })

  // --------------------------------------------------------------------------
  // 3. PHYSICAL SVG ASSET INTEGRITY
  // --------------------------------------------------------------------------
  describe('3. Partner SVG Asset Integrity (Physical Files)', () => {
    const publicDir = path.resolve(__dirname, '../../public')

    it('e3-logo.svg exists and contains valid XML SVG vector definitions', () => {
      const filePath = path.join(publicDir, 'assets/partners/e3-logo.svg')
      expect(fs.existsSync(filePath)).toBe(true)
      const content = fs.readFileSync(filePath, 'utf-8')
      expect(content).toContain('<svg')
      expect(content).toContain('viewBox="0 0 400 120"')
      expect(content).toContain('E3 QATAR')
      expect(content).not.toContain('<script')
    })

    it('doha-mall-logo.svg exists and contains valid XML SVG vector definitions with Arabic typography', () => {
      const filePath = path.join(publicDir, 'assets/partners/doha-mall-logo.svg')
      expect(fs.existsSync(filePath)).toBe(true)
      const content = fs.readFileSync(filePath, 'utf-8')
      expect(content).toContain('<svg')
      expect(content).toContain('viewBox="0 0 400 120"')
      expect(content).toContain('DOHA MALL')
      expect(content).toContain('دوحة مول')
      expect(content).not.toContain('<script')
    })
  })

  // --------------------------------------------------------------------------
  // 4. LIVE ATTRACTION DATA PARITY & ZERO EEEQA.COM OCCURRENCES
  // --------------------------------------------------------------------------
  describe('4. Urban Arena Live Data & Seed File Parity', () => {
    it('seed file e3_live_activations_bilingual_seed.json has zero eeeqa.com/assets/partners/ occurrences', () => {
      const seedFilePath = path.resolve(__dirname, '../../prisma/data/e3_live_activations_bilingual_seed.json')
      const content = fs.readFileSync(seedFilePath, 'utf-8')
      expect(content).not.toContain('https://eeeqa.com/assets/partners/')
      expect(content).not.toContain('http://eeeqa.com/assets/partners/')
      expect(content).toContain('/assets/partners/e3-logo.svg')
      expect(content).toContain('/assets/partners/doha-mall-logo.svg')
    })
  })
})
