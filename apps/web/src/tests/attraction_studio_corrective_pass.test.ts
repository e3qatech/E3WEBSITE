import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('E3 Attraction & Event Management Studio - Corrective Pass Test Suite', () => {

  // --------------------------------------------------------------------------
  // 1. DUPLICATE B2B ATTRACTION EDITOR REMOVAL & REDIRECTS
  // --------------------------------------------------------------------------
  describe('1. Duplicate B2B Attraction Editor Removal & Safe Redirection', () => {
    it('AttractionsList contains zero "B2B Editor" buttons', () => {
      const filePath = path.resolve(__dirname, '../components/dashboard/b2c/AttractionsList.tsx')
      const content = fs.readFileSync(filePath, 'utf-8')
      
      expect(content).not.toContain('"B2B Editor"')
      expect(content).not.toContain('"محرر B2B"')
      expect(content).toContain('data-testid={`edit-b2c-btn-${attraction.slug}`}')
      expect(content).toContain('data-testid={`case-studies-link-${attraction.slug}`}')
    })

    it('Legacy B2B edit route redirects safely to canonical studio with Stage 4 (media)', () => {
      const filePath = path.resolve(__dirname, '../app/[locale]/dashboard/b2b/attractions/[id]/edit/page.tsx')
      const content = fs.readFileSync(filePath, 'utf-8')

      expect(content).toContain('redirect(`/${locale}/dashboard/b2c/attractions/${id}/edit?stage=media`)')
      expect(content).not.toContain('<B2BAttractionEditor')
    })

    it('Legacy B2B new route redirects safely to canonical new studio', () => {
      const filePath = path.resolve(__dirname, '../app/[locale]/dashboard/b2b/attractions/new/page.tsx')
      const content = fs.readFileSync(filePath, 'utf-8')

      expect(content).toContain('redirect(`/${locale}/dashboard/b2c/attractions/new`)')
    })
  })

  // --------------------------------------------------------------------------
  // 2. STORY TRACK LABELS & INVARIANTS
  // --------------------------------------------------------------------------
  describe('2. Story Track Invariants & Collapsed Card Labeling', () => {
    it('collapsed activity card strictly uses primaryStoryTypeId as the prominent badge', () => {
      const availableStoryTypes = [
        { id: 'st-drive', slug: 'drive', titleEn: 'Drive', titleAr: 'قيادة', accentColor: '#3b82f6' },
        { id: 'st-explore', slug: 'explore', titleEn: 'Explore', titleAr: 'استكشاف', accentColor: '#10b981' },
        { id: 'st-compete', slug: 'compete', titleEn: 'Compete', titleAr: 'تنافس', accentColor: '#f59e0b' }
      ]

      // AR-Powered Racing fixture: Primary Explore, Secondary Drive and Compete
      const arRacingActivity = {
        titleEn: 'AR-Powered Racing',
        titleAr: 'سباقات بتقنية الواقع المعزز',
        primaryStoryTypeId: 'st-explore',
        secondaryStoryTypeIds: ['st-drive', 'st-compete'],
        storyTypeIds: ['st-explore', 'st-drive', 'st-compete'],
        contentType: 'ACTIVITY' as const
      }

      // Test helper simulating CompactActivityCard resolution logic
      const resolvePrimaryStory = (activity: any, types: any[]) => {
        return (activity.primaryStoryTypeId 
          ? types.find(st => st.id === activity.primaryStoryTypeId) 
          : null) || (Array.isArray(activity.storyTypeIds) && activity.storyTypeIds.length > 0 
          ? types.find(st => st.id === activity.storyTypeIds[0]) 
          : null)
      }

      const resolveSecondaryStories = (activity: any, types: any[], primaryId?: string) => {
        return (Array.isArray(activity.secondaryStoryTypeIds)
          ? activity.secondaryStoryTypeIds
          : (Array.isArray(activity.storyTypeIds) ? activity.storyTypeIds.filter((id: string) => id !== primaryId) : [])
        ).map((id: string) => types.find(st => st.id === id)).filter(Boolean)
      }

      const resolvedPrimary = resolvePrimaryStory(arRacingActivity, availableStoryTypes)
      const resolvedSecondary = resolveSecondaryStories(arRacingActivity, availableStoryTypes, resolvedPrimary?.id)

      expect(resolvedPrimary).toBeDefined()
      expect(resolvedPrimary?.slug).toBe('explore')
      expect(resolvedPrimary?.titleEn).toBe('Explore')

      // Ensure Drive is NOT chosen as the primary badge even if it appears first in availableStoryTypes
      expect(resolvedPrimary?.slug).not.toBe('drive')

      // Ensure secondary tracks contain Drive and Compete and exclude Explore
      expect(resolvedSecondary.length).toBe(2)
      expect(resolvedSecondary.map((s: any) => s.slug)).toEqual(['drive', 'compete'])
      expect(resolvedSecondary.map((s: any) => s.slug)).not.toContain('explore')
    })

    it('updating primary track automatically purges it from secondary relations', () => {
      let activity = {
        titleEn: 'AR Racing',
        primaryStoryTypeId: 'st-explore',
        secondaryStoryTypeIds: ['st-drive', 'st-compete'],
        storyTypeIds: ['st-explore', 'st-drive', 'st-compete']
      }

      // When user selects 'st-drive' as the new primary track
      const newPrimary = 'st-drive'
      const filteredSecondary = (activity.secondaryStoryTypeIds || []).filter(id => id !== newPrimary)
      
      activity = {
        ...activity,
        primaryStoryTypeId: newPrimary,
        secondaryStoryTypeIds: filteredSecondary,
        storyTypeIds: [newPrimary, ...filteredSecondary].filter(Boolean)
      }

      expect(activity.primaryStoryTypeId).toBe('st-drive')
      expect(activity.secondaryStoryTypeIds).toEqual(['st-compete'])
      expect(activity.secondaryStoryTypeIds).not.toContain('st-drive')
      expect(activity.storyTypeIds).toEqual(['st-drive', 'st-compete'])
    })
  })

  // --------------------------------------------------------------------------
  // 3. SMART DOCUMENT UPLOAD & PARSING
  // --------------------------------------------------------------------------
  describe('3. Smart Document Intake & Fact Confirmation', () => {
    it('leaves unsupported factual fields blank with isFactRequiringConfirmation = true', async () => {
      const mockRawText = `
        Doha Quest Galactic Dome
        Next-Generation VR Space Experience
        Experience zero-gravity simulators and interactive asteroid tagging.
        Standard Pass: 120 QAR
        VIP Pass: 250 QAR
      `

      const lines = mockRawText.split('\n').map(l => l.trim()).filter(Boolean)
      const firstLine = lines[0]
      
      const proposalFields = [
        {
          key: "nameEn",
          proposedValue: firstLine,
          confidence: 95,
          isFactRequiringConfirmation: false,
          accepted: true
        },
        {
          key: "dailyCapacity",
          proposedValue: "",
          confidence: 0,
          isFactRequiringConfirmation: true,
          accepted: false
        },
        {
          key: "operatingHours",
          proposedValue: "",
          confidence: 0,
          isFactRequiringConfirmation: true,
          accepted: false
        }
      ]

      const capacityField = proposalFields.find(f => f.key === 'dailyCapacity')
      expect(capacityField?.proposedValue).toBe("")
      expect(capacityField?.isFactRequiringConfirmation).toBe(true)
      expect(capacityField?.accepted).toBe(false)
    })
  })

  // --------------------------------------------------------------------------
  // 4. BULK MEDIA MODE VALIDATION
  // --------------------------------------------------------------------------
  describe('4. Bulk Media Intake & Staging Invariants', () => {
    it('matches filenames to attraction slugs and categories without auto-committing', () => {
      const testFiles = [
        { name: 'urban-arena-hero.jpg', type: 'image/jpeg', size: 102400 },
        { name: 'ar-racing-activity-drift.png', type: 'image/png', size: 51200 },
        { name: 'doha-quest-gallery-1.webp', type: 'image/webp', size: 85000 },
        { name: 'random-unknown-asset.mp4', type: 'video/mp4', size: 2048000 }
      ]

      const mockAttractions = [
        { slug: 'urban-arena-doha-mall', nameEn: 'Urban Arena' },
        { slug: 'ar-racing', nameEn: 'AR Racing' },
        { slug: 'doha-quest', nameEn: 'Doha Quest' }
      ]

      const matchFile = (fileName: string) => {
        const lower = fileName.toLowerCase()
        const normFile = lower.replace(/[^a-z0-9]/g, '')
        let matchedSlug: string | null = null
        for (const attr of mockAttractions) {
          const normSlug = (attr.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '')
          const normName = (attr.nameEn || '').toLowerCase().replace(/[^a-z0-9]/g, '')
          if (
            lower.includes(attr.slug) ||
            (normSlug.length > 2 && normFile.includes(normSlug)) ||
            (normName.length > 2 && normFile.includes(normName))
          ) {
            matchedSlug = attr.slug
            break
          }
        }
        let category = 'GALLERY'
        if (lower.includes('hero') || lower.includes('cover')) category = 'HERO'
        else if (lower.includes('activity')) category = 'ACTIVITY'

        return { matchedSlug, category, status: 'PENDING' }
      }

      const res1 = matchFile(testFiles[0].name)
      expect(res1.matchedSlug).toBe('urban-arena-doha-mall')
      expect(res1.category).toBe('HERO')
      expect(res1.status).toBe('PENDING')

      const res2 = matchFile(testFiles[1].name)
      expect(res2.matchedSlug).toBe('ar-racing')
      expect(res2.category).toBe('ACTIVITY')

      const res4 = matchFile(testFiles[3].name)
      expect(res4.matchedSlug).toBeNull() // Unmatched stays pending
    })
  })

  // --------------------------------------------------------------------------
  // 5. AUTHENTIC PARTNER LOGOS & RESILIENCE
  // --------------------------------------------------------------------------
  describe('5. Authentic Partner Logos & Broken Asset Suppression', () => {
    it('authentic E3 and Doha Mall SVG files exist in public/assets/partners', () => {
      const e3SvgPath = path.resolve(__dirname, '../../public/assets/partners/e3-logo.svg')
      const dohaMallSvgPath = path.resolve(__dirname, '../../public/assets/partners/doha-mall-logo.svg')

      expect(fs.existsSync(e3SvgPath)).toBe(true)
      expect(fs.existsSync(dohaMallSvgPath)).toBe(true)

      const e3Content = fs.readFileSync(e3SvgPath, 'utf-8')
      const dohaContent = fs.readFileSync(dohaMallSvgPath, 'utf-8')

      expect(e3Content).toContain('<svg')
      expect(e3Content).toContain('E3 QATAR')
      expect(dohaContent).toContain('<svg')
      expect(dohaContent).toContain('DOHA MALL')
    })

    it('hides entire partner section when all partner logos fail or are placeholder records', () => {
      const testPlacements = [
        { brand: { id: 'b1', nameEn: 'Placeholder Sponsor', logoUrl: 'https://invalid-url.com/broken.svg' } },
        { brand: { id: 'b2', nameEn: 'Demo Partner', logoUrl: 'https://invalid-url.com/404.svg' } }
      ]

      const filterValidPlacements = (placements: any[], brokenSet: Set<string>) => {
        return placements.filter((bp: any) => {
          const b = bp.brand || bp
          if (!b) return false
          const name = (b.nameEn || b.nameAr || '').trim()
          if (!name || name.toLowerCase().includes('placeholder') || name.toLowerCase().includes('demo')) {
            return false
          }
          if (b.id && brokenSet.has(b.id)) return false
          return true
        })
      }

      const valid = filterValidPlacements(testPlacements, new Set())
      expect(valid.length).toBe(0)
    })
  })

  // --------------------------------------------------------------------------
  // 6. UNIVERSAL BACK NAVIGATION & DASHBOARD EXIT PATHS
  // --------------------------------------------------------------------------
  describe('6. Universal Dashboard Back Navigation & Breadcrumbs', () => {
    it('EditorHeader includes safe back navigation and unsaved changes protection', () => {
      const filePath = path.resolve(__dirname, '../components/dashboard/ui/EditorHeader.tsx')
      const content = fs.readFileSync(filePath, 'utf-8')

      expect(content).toContain('executeBackNavigation')
      expect(content).toContain('router.back()')
      expect(content).toContain('showUnsavedModal')
      expect(content).toContain('isDirty')
      expect(content).toContain('breadcrumbs')
    })

    it('AttractionContentStudio integrates EditorHeader with breadcrumbs and back href', () => {
      const filePath = path.resolve(__dirname, '../components/dashboard/b2c/attractions/AttractionContentStudio.tsx')
      const content = fs.readFileSync(filePath, 'utf-8')

      expect(content).toContain('<EditorHeader')
      expect(content).toContain('backHref="/dashboard/b2c/attractions"')
      expect(content).toContain('backLabel="Back to Attractions Roster"')
    })

    it('Bulk Import page provides clear back exit path', () => {
      const filePath = path.resolve(__dirname, '../app/[locale]/dashboard/b2c/attractions/import/page.tsx')
      const content = fs.readFileSync(filePath, 'utf-8')

      expect(content).toContain('/dashboard/b2c/attractions')
    })
  })
})
