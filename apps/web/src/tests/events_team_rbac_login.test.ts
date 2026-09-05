import { describe, it, expect } from 'vitest';
import {
  isAuthorizedForPortal,
  allowedRolesForPortal,
  isAdminRole,
  isEventsRole,
  normalizeRole,
  VALID_PORTAL_KEYS,
} from '../lib/auth-roles';
import {
  getAuthorizedLandingRoute,
  resolveServerLandingDestination,
  sanitizeCallbackUrl,
} from '../lib/landing-route';
import { hasPermission, rolePermissions } from '../lib/permissions';
import { PORTAL_CONFIGS } from '../components/auth/PortalConfigs';

describe('Events Team RBAC, Package Management & Portal Login Suite', () => {
  describe('1. Portal Authorization & Roles Verification', () => {
    it('recognizes "events" as a valid portal key', () => {
      expect(VALID_PORTAL_KEYS).toContain('events');
      expect(PORTAL_CONFIGS.events).toBeDefined();
      expect(PORTAL_CONFIGS.events.portalKey).toBe('events');
      expect(PORTAL_CONFIGS.events.defaultLanding).toBe('/dashboard/b2c/packages');
    });

    it('authorizes EVENTS_ADMIN for events portal', () => {
      expect(isAuthorizedForPortal('EVENTS_ADMIN', 'events')).toBe(true);
    });

    it('authorizes EVENTS_TEAM for events portal', () => {
      expect(isAuthorizedForPortal('EVENTS_TEAM', 'events')).toBe(true);
    });

    it('authorizes SUPPORT_ADMIN for events portal', () => {
      expect(isAuthorizedForPortal('SUPPORT_ADMIN', 'events')).toBe(true);
    });

    it('authorizes SUPER_ADMIN for events portal', () => {
      expect(isAuthorizedForPortal('SUPER_ADMIN', 'events')).toBe(true);
    });

    it('rejects unauthorized roles from events portal (STAFF, CLIENT, CANDIDATE)', () => {
      expect(isAuthorizedForPortal('STAFF', 'events')).toBe(false);
      expect(isAuthorizedForPortal('CLIENT', 'events')).toBe(false);
      expect(isAuthorizedForPortal('CANDIDATE', 'events')).toBe(false);
    });

    it('allows EVENTS_ADMIN and EVENTS_TEAM into the administrative command center', () => {
      expect(isAuthorizedForPortal('EVENTS_ADMIN', 'admin')).toBe(true);
      expect(isAuthorizedForPortal('EVENTS_TEAM', 'admin')).toBe(true);
      expect(allowedRolesForPortal('events')).toContain('EVENTS_ADMIN');
      expect(allowedRolesForPortal('events')).toContain('EVENTS_TEAM');
    });

    it('correctly categorizes events roles as administrative', () => {
      expect(isAdminRole('EVENTS_ADMIN')).toBe(true);
      expect(isAdminRole('EVENTS_TEAM')).toBe(true);
      expect(isEventsRole('EVENTS_ADMIN')).toBe(true);
      expect(isEventsRole('EVENTS_TEAM')).toBe(true);
      expect(isEventsRole('SUPPORT_ADMIN')).toBe(true);
      expect(isEventsRole('CLIENT')).toBe(false);
    });

    it('normalizes events roles to SUPPORT_ADMIN for safe Prisma DB execution', () => {
      expect(normalizeRole('EVENTS_ADMIN')).toBe('SUPPORT_ADMIN');
      expect(normalizeRole('EVENTS_TEAM')).toBe('SUPPORT_ADMIN');
      expect(normalizeRole('EVENTS')).toBe('SUPPORT_ADMIN');
    });
  });

  describe('2. Capability Matrix & Package RBAC Privileges', () => {
    it('grants EVENTS_ADMIN capability to manage packages (create, edit, delete, publish)', () => {
      expect(hasPermission('EVENTS_ADMIN', 'b2c.packages.manage')).toBe(true);
      expect(hasPermission('EVENTS_ADMIN', 'b2c.packages.read')).toBe(true);
      expect(rolePermissions.EVENTS_ADMIN).toContain('b2c.packages.manage');
      expect(rolePermissions.EVENTS_ADMIN).toContain('b2c.packages.read');
    });

    it('grants EVENTS_ADMIN capability to create quotes and manage CRM leads', () => {
      expect(hasPermission('EVENTS_ADMIN', 'crm.leads.manage')).toBe(true);
      expect(hasPermission('EVENTS_ADMIN', 'b2c.inquiries.manage')).toBe(true);
      expect(rolePermissions.EVENTS_ADMIN).toContain('crm.leads.manage');
    });

    it('grants EVENTS_ADMIN media library upload privileges for flyers, logos and galleries', () => {
      expect(hasPermission('EVENTS_ADMIN', 'media.read')).toBe(true);
      expect(hasPermission('EVENTS_ADMIN', 'media.write')).toBe(true);
    });

    it('grants EVENTS_TEAM package read and lead privileges while denying package editing', () => {
      expect(hasPermission('EVENTS_TEAM', 'b2c.packages.read')).toBe(true);
      expect(hasPermission('EVENTS_TEAM', 'b2c.packages.manage')).toBe(false);
      expect(hasPermission('EVENTS_TEAM', 'crm.leads.manage')).toBe(true);
    });

    it('confirms SUPPORT_ADMIN maintains read-only packages privileges while EVENTS_ADMIN has manage', () => {
      expect(hasPermission('SUPPORT_ADMIN', 'b2c.packages.read')).toBe(true);
      expect(hasPermission('SUPPORT_ADMIN', 'b2c.packages.manage')).toBe(false);
      expect(hasPermission('EVENTS_ADMIN', 'b2c.packages.manage')).toBe(true);
    });

    it('strictly denies EVENTS_ADMIN access to unrelated sensitive modules (RBAC, B2B services)', () => {
      expect(hasPermission('EVENTS_ADMIN', 'rbac.manage')).toBe(false);
      expect(hasPermission('EVENTS_ADMIN', 'b2b.services.manage')).toBe(false);
      expect(hasPermission('EVENTS_ADMIN', 'hr.jobs.manage')).toBe(false);
    });
  });

  describe('3. Landing Navigation & Redirection Security', () => {
    it('resolves events portal login directly to /dashboard/b2c/packages', () => {
      const res = resolveServerLandingDestination({
        user: { role: 'EVENTS_ADMIN', isActive: true },
        portal: 'events',
        locale: 'en',
      });
      expect(res.authorized).toBe(true);
      expect(res.destination).toBe('/en/dashboard/b2c/packages');
    });

    it('resolves Arabic events portal login directly to /ar/dashboard/b2c/packages', () => {
      const res = resolveServerLandingDestination({
        user: { role: 'EVENTS_ADMIN', isActive: true },
        portal: 'events',
        locale: 'ar',
      });
      expect(res.authorized).toBe(true);
      expect(res.destination).toBe('/ar/dashboard/b2c/packages');
    });

    it('returns /dashboard/b2c/packages as canonical route for EVENTS_ADMIN', () => {
      expect(getAuthorizedLandingRoute({ role: 'EVENTS_ADMIN' }, 'en')).toBe('/en/dashboard/b2c/packages');
      expect(getAuthorizedLandingRoute({ role: 'EVENTS_TEAM' }, 'en')).toBe('/en/dashboard/b2c/packages');
    });

    it('allows valid packages and leads callback destinations for EVENTS_ADMIN', () => {
      const safePackagesUrl = sanitizeCallbackUrl('/en/dashboard/b2c/packages', { role: 'EVENTS_ADMIN' }, 'en');
      expect(safePackagesUrl).toBe('/en/dashboard/b2c/packages');

      const safeLeadsUrl = sanitizeCallbackUrl('/en/dashboard/leads/packages', { role: 'EVENTS_ADMIN' }, 'en');
      expect(safeLeadsUrl).toBe('/en/dashboard/leads/packages');
    });

    it('redirects EVENTS_ADMIN away from B2B enterprise workspace if attempted via callback', () => {
      const redirectedUrl = sanitizeCallbackUrl('/en/dashboard/b2b', { role: 'EVENTS_ADMIN' }, 'en');
      expect(redirectedUrl).toBe('/en/dashboard/b2c/packages');
    });

    it('rejects inactive events user and sends them back to login', () => {
      const res = resolveServerLandingDestination({
        user: { role: 'EVENTS_ADMIN', isActive: false },
        portal: 'events',
        locale: 'en',
      });
      expect(res.authorized).toBe(false);
      expect(res.destination).toContain('/login/events?error=inactive');
    });
  });
});
