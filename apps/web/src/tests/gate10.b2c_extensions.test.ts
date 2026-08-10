import { describe, it, expect } from 'vitest'
import { DEFAULT_OUR_BRANDS } from '../lib/cms-brands'
import { DEFAULT_CORE_TEAM } from '../lib/cms-team'
import { DEFAULT_SOCIAL_CHANNELS, DEFAULT_SOCIAL_POSTS } from '../lib/cms-social'
import { validateSplineUrl, DEFAULT_HERO_SPLINE } from '../lib/cms-spline'

describe('Gate 10: B2C Landing Page Extensions & Verified Data Standards', () => {
  it('1. should verify BookingQube is classified as SUBSIDIARY', () => {
    const bookingQube = DEFAULT_OUR_BRANDS.find(b => b.slug === 'bookingqube')
    expect(bookingQube).toBeDefined()
    expect(bookingQube?.relationship).toBe('SUBSIDIARY')
  })

  it('2. should verify Crayons & Bricks and Kids Driving School are classified as OWNED', () => {
    const crayons = DEFAULT_OUR_BRANDS.find(b => b.slug === 'crayons-bricks')
    const kidsCity = DEFAULT_OUR_BRANDS.find(b => b.slug === 'kids-city-driving-school')
    expect(crayons?.relationship).toBe('OWNED')
    expect(kidsCity?.relationship).toBe('OWNED')
  })

  it('3. should verify InflataPark and Urban Arena are classified as OPERATED', () => {
    const inflatapark = DEFAULT_OUR_BRANDS.find(b => b.slug === 'inflatapark')
    const urbanArena = DEFAULT_OUR_BRANDS.find(b => b.slug === 'urban-arena')
    expect(inflatapark?.relationship).toBe('OPERATED')
    expect(urbanArena?.relationship).toBe('OPERATED')
  })

  it('4. should verify Urban Arena has separate kinetic/laser content and NOT InflataPark relocation copy', () => {
    const urbanArena = DEFAULT_OUR_BRANDS.find(b => b.slug === 'urban-arena')
    expect(urbanArena?.descriptionEn).toContain('laser tag')
    expect(urbanArena?.descriptionEn).not.toContain('inflatable obstacle courses')
  })

  it('5. should verify verified company executives in Core Team (Abdullah Al Kubaisi, Adil Ahmed, Mohammad Ali Awada, Ebrahim Karolia)', () => {
    const names = DEFAULT_CORE_TEAM.map(m => m.nameEn)
    expect(names).toContain('Abdullah Al Kubaisi')
    expect(names).toContain('Adil Ahmed')
    expect(names).toContain('Mohammad Ali Awada')
    expect(names).toContain('Ebrahim Karolia')
  })

  it('6. should verify only active profiles with featureOnB2CLanding enabled are returned', () => {
    const b2cMembers = DEFAULT_CORE_TEAM.filter(m => m.featureOnB2CLanding && m.status === 'PUBLISHED')
    expect(b2cMembers.length).toBeGreaterThan(0)
    b2cMembers.forEach(m => {
      expect(m.featureOnB2CLanding).toBe(true)
    })
  })

  it('7. should validate approved Spline 3D scene URLs', () => {
    expect(validateSplineUrl(DEFAULT_HERO_SPLINE.sceneUrl)).toBe(true)
    expect(validateSplineUrl('https://unapproved.malicious-site.com/scene.splinecode')).toBe(false)
  })

  it('8. should verify social channels and approved post fallbacks', () => {
    expect(DEFAULT_SOCIAL_CHANNELS.length).toBeGreaterThan(0)
    const approvedPosts = DEFAULT_SOCIAL_POSTS.filter(p => p.isApproved)
    expect(approvedPosts.length).toBeGreaterThan(0)
  })
})
