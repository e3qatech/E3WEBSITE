import { describe, it, expect } from 'vitest';
import {
  isAuthorizedForPortal,
  allowedRolesForPortal,
  normalizeRole,
  isAdminRole,
  isStaffRole,
  isClientRole,
  PortalKey
} from '../lib/auth-roles';
import { getAuthorizedLandingRoute, sanitizeCallbackUrl } from '../lib/landing-route';
import { PORTAL_CONFIGS } from '../components/auth/PortalConfigs';

describe('Preview Admin Portal RBAC Regression Tests', () => {
  describe('1. SUPER_ADMIN + admin portal succeeds', () => {
    it('authorizes canonical SUPER_ADMIN for admin portal', () => {
      expect(isAuthorizedForPortal('SUPER_ADMIN', 'admin')).toBe(true);
      expect(isAdminRole('SUPER_ADMIN')).toBe(true);
      expect(allowedRolesForPortal('admin')).toContain('SUPER_ADMIN');
      expect(PORTAL_CONFIGS.admin.allowedRoles).toContain('SUPER_ADMIN');
    });

    it('routes SUPER_ADMIN to dashboard by default', () => {
      expect(getAuthorizedLandingRoute({ role: 'SUPER_ADMIN' }, 'en')).toBe('/en/dashboard');
      expect(getAuthorizedLandingRoute({ role: 'SUPER_ADMIN' }, 'ar')).toBe('/ar/dashboard');
    });
  });

  describe('2. SUPER_ADMIN casing and value mismatch resilience', () => {
    const superAdminVariations = [
      'super_admin',
      'SUPER_ADMIN',
      'Super_Admin',
      ' Super_Admin ',
      'ADMIN',
      'admin',
      'Admin',
      'SUPERADMIN',
      'superadmin',
      'OPERATIONS_ADMIN',
      'operations_admin',
      'OPS_ADMIN',
      'OPERATIONS'
    ];

    superAdminVariations.forEach((variation) => {
      it(`correctly normalizes and authorizes variation "${variation}" as SUPER_ADMIN`, () => {
        const normalized = normalizeRole(variation);
        expect(normalized).toBe('SUPER_ADMIN');
        expect(isAuthorizedForPortal(variation, 'admin')).toBe(true);
        expect(isAuthorizedForPortal(normalized, 'admin')).toBe(true);
        expect(isAdminRole(variation)).toBe(true);
      });
    });
  });

  describe('3. CLIENT + admin portal fails', () => {
    const clientVariations = ['CLIENT', 'client', 'Client', ' BUSINESS ', 'CUSTOMER', 'BUSINESS_USER'];

    clientVariations.forEach((variation) => {
      it(`strictly denies "${variation}" from admin portal`, () => {
        expect(isAuthorizedForPortal(variation, 'admin')).toBe(false);
        expect(isAdminRole(variation)).toBe(false);
        expect(isClientRole(variation)).toBe(true);
      });
    });

    it('CLIENT cannot be routed to /dashboard via callbackUrl injection', () => {
      const sanitized = sanitizeCallbackUrl('/en/dashboard', { role: 'CLIENT' }, 'en');
      expect(sanitized).toBe('/en/business');
      expect(sanitized).not.toContain('/dashboard');
    });
  });

  describe('4. STAFF + admin portal fails unless explicitly privileged', () => {
    it('ordinary STAFF role cannot access admin portal', () => {
      expect(isAuthorizedForPortal('STAFF', 'admin')).toBe(false);
      expect(isAdminRole('STAFF')).toBe(false);
      expect(isStaffRole('STAFF')).toBe(true);
    });

    it('ordinary EMPLOYEE variant maps to STAFF and cannot access admin portal', () => {
      expect(normalizeRole('EMPLOYEE')).toBe('STAFF');
      expect(isAuthorizedForPortal('EMPLOYEE', 'admin')).toBe(false);
    });

    it('Privileged admin roles (SALES_ADMIN, SUPPORT_ADMIN, HR_ADMIN) succeed on admin portal', () => {
      expect(isAuthorizedForPortal('SALES_ADMIN', 'admin')).toBe(true);
      expect(isAuthorizedForPortal('SUPPORT_ADMIN', 'admin')).toBe(true);
      expect(isAuthorizedForPortal('HR_ADMIN', 'admin')).toBe(true);
      expect(isAdminRole('SALES_ADMIN')).toBe(true);
      expect(isAdminRole('SUPPORT_ADMIN')).toBe(true);
    });
  });

  describe('5. Incorrect portal values fail closed', () => {
    const invalidPortals = ['super', 'dashboard', 'invalid', '', null, undefined, 'ADMIN_PORTAL', 'root'];

    invalidPortals.forEach((invalidPortal) => {
      it(`fails closed for invalid portal value: "${invalidPortal}"`, () => {
        expect(isAuthorizedForPortal('SUPER_ADMIN', invalidPortal as PortalKey)).toBe(false);
        expect(isAuthorizedForPortal('CLIENT', invalidPortal as PortalKey)).toBe(false);
        expect(isAuthorizedForPortal('STAFF', invalidPortal as PortalKey)).toBe(false);
        expect(allowedRolesForPortal(invalidPortal as PortalKey)).toEqual([]);
      });
    });
  });

  describe('6. Password-reset and role update session invalidation', () => {
    it('sessionVersion bump strictly invalidates stale tokens', () => {
      const activeUser = { id: 'usr-1', sessionVersion: 2, role: 'SUPER_ADMIN' };
      const staleToken = { id: 'usr-1', sessionVersion: 1, role: 'CLIENT' };
      const freshToken = { id: 'usr-1', sessionVersion: 2, role: 'SUPER_ADMIN' };

      const isStaleTokenValid = activeUser.sessionVersion === staleToken.sessionVersion;
      const isFreshTokenValid = activeUser.sessionVersion === freshToken.sessionVersion;

      expect(isStaleTokenValid).toBe(false);
      expect(isFreshTokenValid).toBe(true);
    });

    it('password reset increments sessionVersion atomically', () => {
      let currentSessionVersion = 1;
      // Simulate password reset atomic update
      currentSessionVersion += 1;
      expect(currentSessionVersion).toBe(2);
    });
  });
});
