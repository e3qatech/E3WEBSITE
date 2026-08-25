import { describe, it, expect } from 'vitest'
import { isAttractionActiveByDate, parseFlexibleDate } from '@/lib/cms-attractions'
import { calculateQatarOperatingStatus } from '@/lib/operating-schedule-helper'

describe('QF-31: Past Events and Draft Attraction Isolation', () => {
  it('should correctly parse flexible date formats (DD-MM-YYYY and YYYY-MM-DD)', () => {
    const d1 = parseFlexibleDate('13-08-2025')
    expect(d1).not.toBeNull()
    expect(d1?.getFullYear()).toBe(2025)
    expect(d1?.getMonth()).toBe(7) // August (0-indexed)
    expect(d1?.getDate()).toBe(13)

    const d2 = parseFlexibleDate('2025-08-13')
    expect(d2).not.toBeNull()
    expect(d2?.getFullYear()).toBe(2025)
    expect(d2?.getMonth()).toBe(7)
    expect(d2?.getDate()).toBe(13)
  })

  it('should exclude past events whose eventDetails.endDate has passed', () => {
    const pastActivation = {
      id: 'inflatacity-2025',
      nameEn: 'InflataCity 2025',
      slug: 'inflatacity-2025',
      isPublished: true,
      durationModel: 'SEASONAL',
      entityType: 'ACTIVATION',
      eventDetails: {
        startDate: '14-07-2025',
        endDate: '13-08-2025',
        dailyCapacity: 5000
      }
    }

    // Checking against 2026 (current year) -> Must be inactive
    const isActive = isAttractionActiveByDate(pastActivation, new Date('2026-08-25T12:00:00Z'))
    expect(isActive).toBe(false)

    // Checking against a date during the event in 2025 -> Must be active
    const wasActiveIn2025 = isAttractionActiveByDate(pastActivation, new Date('2025-07-20T12:00:00Z'))
    expect(wasActiveIn2025).toBe(true)
  })

  it('should strictly exclude draft attractions (isPublished = false)', () => {
    const draftAttraction = {
      id: 'draft-attraction-1',
      nameEn: 'New Secret Zone',
      slug: 'secret-zone',
      isPublished: false,
      temporalStatus: {
        isPermanent: true
      }
    }

    const isActive = isAttractionActiveByDate(draftAttraction)
    expect(isActive).toBe(false)
  })

  it('should allow active permanent attractions', () => {
    const activePerm = {
      id: 'kidz-driving-school',
      nameEn: 'Kidz Driving School',
      slug: 'kidz-driving-school-city-center-doha',
      isPublished: true,
      temporalStatus: {
        isPermanent: true
      }
    }

    const isActive = isAttractionActiveByDate(activePerm)
    expect(isActive).toBe(true)
  })

  it('should mark past event status as SEASON CONCLUDED in Qatar operating status', () => {
    const status = calculateQatarOperatingStatus({
      eventDetails: {
        startDate: '14-07-2025',
        endDate: '13-08-2025'
      }
    }, new Date('2026-08-25T12:00:00Z'))

    expect(status.isOpen).toBe(false)
    expect(status.statusTextEn).toBe('SEASON CONCLUDED')
    expect(status.statusTextAr).toBe('انتهى الموسم')
  })
})
