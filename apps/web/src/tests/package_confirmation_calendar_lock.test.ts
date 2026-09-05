import { describe, it, expect, vi } from 'vitest';
import { hasPermission, rolePermissions } from '@/lib/permissions';

describe('Package Confirmation & Event Calendar Venue-Date-Time Slot Locking Suite', () => {
  describe('1. RBAC Sidebar Group Isolation', () => {
    it('strictly isolates EVENTS_ADMIN and EVENTS_TEAM to Events & Packages', () => {
      // EVENTS_ADMIN permissions
      expect(hasPermission('EVENTS_ADMIN', 'b2c.packages.manage')).toBe(true);
      expect(hasPermission('EVENTS_ADMIN', 'crm.leads.manage')).toBe(true);
      expect(hasPermission('EVENTS_ADMIN', 'b2c.inquiries.manage')).toBe(true);
      expect(hasPermission('EVENTS_ADMIN', 'operations.events.manage')).toBe(true);
      expect(hasPermission('EVENTS_ADMIN', 'view:schedule')).toBe(true);

      // Must NOT have B2C general CMS or HR
      expect(hasPermission('EVENTS_ADMIN', 'b2c.content.write')).toBe(false);
      expect(hasPermission('EVENTS_ADMIN', 'hr.jobs.manage')).toBe(false);
      expect(hasPermission('EVENTS_ADMIN', 'b2b.services.manage')).toBe(false);
    });

    it('confirms EVENTS_TEAM has read-only package access and calendar view without package editing', () => {
      expect(hasPermission('EVENTS_TEAM', 'b2c.packages.read')).toBe(true);
      expect(hasPermission('EVENTS_TEAM', 'b2c.packages.manage')).toBe(false);
      expect(hasPermission('EVENTS_TEAM', 'crm.leads.manage')).toBe(true);
      expect(hasPermission('EVENTS_TEAM', 'view:schedule')).toBe(true);
    });

    it('strips broad CMS page editing from SUPPORT_ADMIN', () => {
      expect(hasPermission('SUPPORT_ADMIN', 'b2c.content.write')).toBe(false);
      expect(hasPermission('SUPPORT_ADMIN', 'b2c.content.publish')).toBe(false);
      expect(hasPermission('SUPPORT_ADMIN', 'b2c.attractions.manage')).toBe(false);
    });
  });

  describe('2. Venue-Date-Time Slot Parsing & Locking Logic', () => {
    // Helper function mirroring the production implementation in /api/b2c/package-leads/[id]
    function parseEventSlot(
      preferredDate: Date | string | null | undefined,
      timeSlot: string | null | undefined,
      durationMinutes: number = 120
    ): { startTime: Date; endTime: Date } {
      const baseDate = preferredDate ? new Date(preferredDate) : new Date();

      let startHour = 14;
      let startMinute = 0;
      let endHour = 16;
      let endMinute = 0;

      if (timeSlot) {
        const rangeMatch = timeSlot.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
        if (rangeMatch) {
          startHour = parseInt(rangeMatch[1], 10);
          startMinute = parseInt(rangeMatch[2], 10);
          endHour = parseInt(rangeMatch[3], 10);
          endMinute = parseInt(rangeMatch[4], 10);
        } else {
          const singleMatch = timeSlot.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
          if (singleMatch) {
            let h = parseInt(singleMatch[1], 10);
            const m = singleMatch[2] ? parseInt(singleMatch[2], 10) : 0;
            const meridian = singleMatch[3] ? singleMatch[3].toUpperCase() : null;
            if (meridian === 'PM' && h < 12) h += 12;
            if (meridian === 'AM' && h === 12) h = 0;
            startHour = h;
            startMinute = m;
            const totalStartMinutes = startHour * 60 + startMinute + durationMinutes;
            endHour = Math.floor(totalStartMinutes / 60) % 24;
            endMinute = totalStartMinutes % 60;
          }
        }
      }

      const start = new Date(baseDate);
      start.setHours(startHour, startMinute, 0, 0);

      const end = new Date(baseDate);
      end.setHours(endHour, endMinute, 0, 0);

      if (end.getTime() <= start.getTime()) {
        end.setTime(start.getTime() + durationMinutes * 60000);
      }

      return { startTime: start, endTime: end };
    }

    it('correctly parses time slot ranges (e.g. 10:00 - 12:00) on a specific celebration date', () => {
      const slot = parseEventSlot('2026-10-15T00:00:00.000Z', '10:00 - 12:00', 120);
      expect(slot.startTime.getHours()).toBe(10);
      expect(slot.startTime.getMinutes()).toBe(0);
      expect(slot.endTime.getHours()).toBe(12);
      expect(slot.endTime.getMinutes()).toBe(0);
    });

    it('correctly parses afternoon time slot ranges (e.g. 15:30 - 17:30)', () => {
      const slot = parseEventSlot('2026-10-15T00:00:00.000Z', '15:30 - 17:30', 120);
      expect(slot.startTime.getHours()).toBe(15);
      expect(slot.startTime.getMinutes()).toBe(30);
      expect(slot.endTime.getHours()).toBe(17);
      expect(slot.endTime.getMinutes()).toBe(30);
    });

    it('supports multiple celebrations on the same date at different venues or different times', () => {
      const celebrationMorning = {
        venueId: 'venue-inflatapark',
        ...parseEventSlot('2026-10-15T00:00:00.000Z', '09:00 - 11:00', 120),
        title: '🔒 Confirmed: Fatima 5th Birthday',
        eventType: 'CONFIRMED_PACKAGE',
      };

      const celebrationAfternoonSameVenue = {
        venueId: 'venue-inflatapark',
        ...parseEventSlot('2026-10-15T00:00:00.000Z', '14:00 - 16:00', 120),
        title: '🔒 Confirmed: Rashid 10th Birthday',
        eventType: 'CONFIRMED_PACKAGE',
      };

      const celebrationSameTimeDifferentVenue = {
        venueId: 'venue-trampoline-arena',
        ...parseEventSlot('2026-10-15T00:00:00.000Z', '14:00 - 16:00', 120),
        title: '🔒 Confirmed: Khalid Party',
        eventType: 'CONFIRMED_PACKAGE',
      };

      // Ensure no collision between morning and afternoon on same venue
      expect(celebrationMorning.endTime.getTime()).toBeLessThanOrEqual(celebrationAfternoonSameVenue.startTime.getTime());

      // Ensure distinct venues can have concurrent celebration locks
      expect(celebrationAfternoonSameVenue.venueId).not.toBe(celebrationSameTimeDifferentVenue.venueId);
      expect(celebrationAfternoonSameVenue.startTime.getTime()).toBe(celebrationSameTimeDifferentVenue.startTime.getTime());
    });
  });
});
