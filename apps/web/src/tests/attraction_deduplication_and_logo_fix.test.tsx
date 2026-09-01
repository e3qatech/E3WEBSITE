import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import fs from 'fs'
import path from 'path'
import { WhatsInside } from '@/components/attractions/detail/WhatsInside'

describe('Attraction Deduplication and Logo Fix Verification', () => {
  it('ensures API route api/b2c/attractions/[id]/full/route.ts has no duplicate createMany', () => {
    const routePath = path.resolve(__dirname, '../app/api/b2c/attractions/[id]/full/route.ts')
    const content = fs.readFileSync(routePath, 'utf8')

    // Must NOT call createMany on safeFeatures inside the transaction
    expect(content).not.toContain('tx.attractionFeature.createMany')
    // Must call tx.attractionFeature.create in loop
    expect(content).toContain('await tx.attractionFeature.create')
  })

  it('deduplicates duplicate features in WhatsInside and renders exactly 3 distinct cards', () => {
    const duplicateFeatures = [
      {
        id: 'feat-1',
        titleEn: 'Kids City Driving Track',
        titleAr: 'مضمار قيادة مدينة الأطفال',
        descriptionEn: 'Learn to drive on a realistic miniature track.',
        imageUrl: '/test-driving.jpg',
        storyTypes: [{ slug: 'active-play', titleEn: 'Active Play', color: '#10b981' }]
      },
      {
        id: 'feat-2',
        titleEn: 'Kids City Driving Track', // DUPLICATE TITLE
        titleAr: 'مضمار قيادة مدينة الأطفال',
        descriptionEn: 'Learn to drive on a realistic miniature track.',
        imageUrl: '/test-driving.jpg',
        storyTypes: [{ slug: 'active-play', titleEn: 'Active Play', color: '#10b981' }]
      },
      {
        id: 'feat-3',
        titleEn: 'Kids City Hospital',
        titleAr: 'مستشفى مدينة الأطفال',
        descriptionEn: 'Roleplay as young doctors and nurses.',
        imageUrl: '/test-hospital.jpg',
        storyTypes: [{ slug: 'roleplay', titleEn: 'Roleplay', color: '#38bdf8' }]
      },
      {
        id: 'feat-4',
        titleEn: 'Kids City Hospital', // DUPLICATE TITLE
        titleAr: 'مستشفى مدينة الأطفال',
        descriptionEn: 'Roleplay as young doctors and nurses.',
        imageUrl: '/test-hospital.jpg',
        storyTypes: [{ slug: 'roleplay', titleEn: 'Roleplay', color: '#38bdf8' }]
      },
      {
        id: 'feat-5',
        titleEn: 'Kids City Police Station',
        titleAr: 'مركز شرطة مدينة الأطفال',
        descriptionEn: 'Solve community mysteries.',
        imageUrl: '/test-police.jpg',
        storyTypes: [{ slug: 'roleplay', titleEn: 'Roleplay', color: '#38bdf8' }]
      }
    ]

    const html = renderToStaticMarkup(
      <WhatsInside
        description="Experience the ultimate kids edutainment world."
        features={duplicateFeatures}
        imageUrl="/hero.jpg"
        locale="en"
      />
    )

    // Should display total 3 activities badge
    expect(html).toContain('All Activities')
    expect(html).toContain('>3</span>')

    // Exactly 3 h3 headings should be rendered in the grid
    const h3DrivingMatches = (html.match(/<h3[^>]*>Kids City Driving Track<\/h3>/g) || []).length
    const h3HospitalMatches = (html.match(/<h3[^>]*>Kids City Hospital<\/h3>/g) || []).length
    const h3PoliceMatches = (html.match(/<h3[^>]*>Kids City Police Station<\/h3>/g) || []).length

    expect(h3DrivingMatches).toBe(1)
    expect(h3HospitalMatches).toBe(1)
    expect(h3PoliceMatches).toBe(1)
  })

  it('ensures E3LivingHero accepts and displays logoUrl', () => {
    const heroPath = path.resolve(__dirname, '../components/b2c/hero/E3LivingHero.tsx')
    const heroContent = fs.readFileSync(heroPath, 'utf8')

    expect(heroContent).toContain('logoUrl?: string | null')
    expect(heroContent).toContain('logoUrl && (')
    expect(heroContent).toContain('alt="Brand Emblem"')
  })

  it('ensures HeroViewer passes logoUrl into E3LivingHero', () => {
    const heroViewerPath = path.resolve(__dirname, '../components/attractions/detail/HeroViewer.tsx')
    const heroViewerContent = fs.readFileSync(heroViewerPath, 'utf8')

    expect(heroViewerContent).toContain('logoUrl={logoUrl}')
  })

  it('ensures Attraction detail page resolves and passes logoUrl to HeroViewer and StickyNav', () => {
    const pagePath = path.resolve(__dirname, '../app/[locale]/b2c/attractions/[slug]/page.tsx')
    const pageContent = fs.readFileSync(pagePath, 'utf8')

    expect(pageContent).toContain('resolvedLogoUrl')
    expect(pageContent).toContain('seenFeatureKeys')
    expect(pageContent).toContain('where: { slug: normalizedSlug }')
  })
})
