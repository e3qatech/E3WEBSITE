import type { RoleType } from '@prisma/client';

export type PortalKey = 'admin' | 'staff' | 'business' | 'careers';

/**
 * Canonical role normalization utility across E3 Qatar monorepo.
 * Normalizes role strings into valid Prisma RoleType values.
 */
export function normalizeRole(role?: string | null): RoleType {
  if (!role) return 'CLIENT';
  const clean = String(role).trim().toUpperCase();

  if (clean === 'ADMIN' || clean === 'SUPER_ADMIN' || clean === 'SUPERADMIN') {
    return 'SUPER_ADMIN';
  }
  if (clean === 'SALES' || clean === 'SALES_ADMIN' || clean === 'SALESADMIN') {
    return 'SALES_ADMIN';
  }
  if (clean === 'SUPPORT' || clean === 'SUPPORT_ADMIN' || clean === 'SUPPORTADMIN') {
    return 'SUPPORT_ADMIN';
  }
  if (clean === 'STAFF') {
    return 'STAFF';
  }
  if (clean === 'CANDIDATE' || clean === 'APPLICANT' || clean === 'TALENT') {
    return 'CANDIDATE';
  }
  if (clean === 'CLIENT' || clean === 'BUSINESS' || clean === 'CUSTOMER') {
    return 'CLIENT';
  }
  return 'CLIENT';
}

/**
 * Returns allowed RoleType values for a specific portal key.
 */
export function allowedRolesForPortal(portal: PortalKey): RoleType[] {
  switch (portal) {
    case 'admin':
      return ['SUPER_ADMIN', 'SALES_ADMIN', 'SUPPORT_ADMIN'];
    case 'staff':
      return ['STAFF'];
    case 'business':
      return ['CLIENT'];
    case 'careers':
      return ['CANDIDATE'];
    default:
      return [];
  }
}

/**
 * Checks if a given user role is authorized for a specific portal key.
 */
export function isAuthorizedForPortal(role: string | null | undefined, portal: PortalKey): boolean {
  const normRole = normalizeRole(role);
  const allowed = allowedRolesForPortal(portal);
  return allowed.includes(normRole);
}

export function isAdminRole(role?: string | null): boolean {
  const norm = normalizeRole(role);
  return norm === 'SUPER_ADMIN' || norm === 'SALES_ADMIN' || norm === 'SUPPORT_ADMIN';
}

export function isStaffRole(role?: string | null): boolean {
  return normalizeRole(role) === 'STAFF';
}

export function isClientRole(role?: string | null): boolean {
  return normalizeRole(role) === 'CLIENT';
}

export function isCandidateRole(role?: string | null): boolean {
  return normalizeRole(role) === 'CANDIDATE';
}
