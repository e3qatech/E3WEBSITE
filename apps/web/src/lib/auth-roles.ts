import type { RoleType } from '@prisma/client';

export type PortalKey = 'admin' | 'staff' | 'business' | 'careers';

export type AdminRoleName =
  | 'SUPER_ADMIN'
  | 'SALES_ADMIN'
  | 'SUPPORT_ADMIN'
  | 'B2C_ADMIN'
  | 'B2B_ADMIN'
  | 'HR_ADMIN'
  | 'OPERATIONS_ADMIN';

/**
 * Canonical role normalization utility across E3 Qatar monorepo.
 * Normalizes role strings into valid Prisma RoleType values or mapped admin roles.
 */
export function normalizeRole(role?: string | null): RoleType {
  if (!role) return 'CLIENT';
  const clean = String(role).trim().toUpperCase();

  if (clean === 'ADMIN' || clean === 'SUPER_ADMIN' || clean === 'SUPERADMIN') {
    return 'SUPER_ADMIN';
  }
  if (clean === 'B2C_ADMIN' || clean === 'B2CADMIN') {
    return 'SUPPORT_ADMIN'; // Maps to SUPPORT_ADMIN in Prisma enum
  }
  if (clean === 'B2B_ADMIN' || clean === 'B2BADMIN') {
    return 'SALES_ADMIN'; // Maps to SALES_ADMIN in Prisma enum
  }
  if (clean === 'HR_ADMIN' || clean === 'HRADMIN' || clean === 'HR') {
    return 'STAFF'; // Has HR capabilities
  }
  if (clean === 'OPERATIONS_ADMIN' || clean === 'OPS_ADMIN' || clean === 'OPERATIONS') {
    return 'SUPER_ADMIN';
  }
  if (clean === 'SALES' || clean === 'SALES_ADMIN' || clean === 'SALESADMIN') {
    return 'SALES_ADMIN';
  }
  if (clean === 'SUPPORT' || clean === 'SUPPORT_ADMIN' || clean === 'SUPPORTADMIN') {
    return 'SUPPORT_ADMIN';
  }
  if (clean === 'STAFF' || clean === 'EMPLOYEE') {
    return 'STAFF';
  }
  if (clean === 'CANDIDATE' || clean === 'APPLICANT' || clean === 'TALENT') {
    return 'CANDIDATE' as any;
  }
  if (clean === 'CLIENT' || clean === 'BUSINESS' || clean === 'BUSINESS_USER' || clean === 'CUSTOMER') {
    return 'CLIENT';
  }
  return 'CLIENT';
}

/**
 * Returns allowed RoleType values for a specific portal key.
 */
export function allowedRolesForPortal(portal: PortalKey): string[] {
  switch (portal) {
    case 'admin':
      return ['SUPER_ADMIN', 'SALES_ADMIN', 'SUPPORT_ADMIN', 'B2C_ADMIN', 'B2B_ADMIN', 'HR_ADMIN', 'OPERATIONS_ADMIN'];
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
  if (!role) return false;
  const clean = String(role).trim().toUpperCase();
  const normRole = normalizeRole(role);
  const allowed = allowedRolesForPortal(portal);
  return allowed.includes(clean) || allowed.includes(normRole);
}

export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const clean = String(role).trim().toUpperCase();
  const adminRoles = [
    'SUPER_ADMIN',
    'ADMIN',
    'SALES_ADMIN',
    'SUPPORT_ADMIN',
    'B2C_ADMIN',
    'B2B_ADMIN',
    'HR_ADMIN',
    'OPERATIONS_ADMIN'
  ];
  return adminRoles.includes(clean) || normalizeRole(role) === 'SUPER_ADMIN' || normalizeRole(role) === 'SALES_ADMIN' || normalizeRole(role) === 'SUPPORT_ADMIN';
}

export function isStaffRole(role?: string | null): boolean {
  return normalizeRole(role) === 'STAFF';
}

export function isClientRole(role?: string | null): boolean {
  return normalizeRole(role) === 'CLIENT';
}

export function isCandidateRole(role?: string | null): boolean {
  return normalizeRole(role) === ('CANDIDATE' as any);
}

export type AppPermission =
  | 'CRM_RFP_DOCUMENT_READ'
  | 'CRM_LEADS_MANAGE'
  | 'CMS_PAGES_EDIT'
  | 'SETTINGS_VIEW';

const PERMISSION_ROLE_MAP: Record<AppPermission, string[]> = {
  CRM_RFP_DOCUMENT_READ: ['SUPER_ADMIN', 'SALES_ADMIN', 'B2B_ADMIN', 'CRM_MANAGER', 'ADMIN'],
  CRM_LEADS_MANAGE: ['SUPER_ADMIN', 'SALES_ADMIN', 'B2B_ADMIN', 'CRM_MANAGER', 'ADMIN'],
  CMS_PAGES_EDIT: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN', 'B2C_ADMIN', 'B2B_ADMIN'],
  SETTINGS_VIEW: ['SUPER_ADMIN', 'ADMIN'],
};

/**
 * Authoritative server permission verification.
 * Evaluates whether a user's role grants a specific fine-grained permission.
 */
export function hasPermission(role: string | null | undefined, permission: AppPermission): boolean {
  if (!role) return false;
  const norm = normalizeRole(role);
  const clean = String(role).trim().toUpperCase();
  const allowed = PERMISSION_ROLE_MAP[permission] || [];
  return allowed.includes(clean) || allowed.includes(norm);
}

/**
 * Authoritative check for CRM lead / RFP document read permissions.
 * Maps to canonical permission CRM_RFP_DOCUMENT_READ.
 */
export function canAccessB2BRFPDocuments(role?: string | null): boolean {
  return hasPermission(role, 'CRM_RFP_DOCUMENT_READ');
}
