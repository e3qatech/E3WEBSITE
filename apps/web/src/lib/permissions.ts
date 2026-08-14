export type Role =
  | 'SUPER_ADMIN'
  | 'SALES_ADMIN'
  | 'SUPPORT_ADMIN'
  | 'B2C_ADMIN'
  | 'B2B_ADMIN'
  | 'HR_ADMIN'
  | 'OPERATIONS_ADMIN'
  | 'STAFF'
  | 'CLIENT'
  | 'BUSINESS_USER'
  | 'CANDIDATE';

export type Capability =
  | '*'
  // B2C capabilities
  | 'b2c.content.read'
  | 'b2c.content.write'
  | 'b2c.content.publish'
  | 'b2c.attractions.manage'
  | 'b2c.packages.manage'
  | 'b2c.calendar.manage'
  | 'b2c.feedback.manage'
  | 'b2c.inquiries.manage'
  // B2B capabilities
  | 'b2b.content.read'
  | 'b2b.content.write'
  | 'b2b.content.publish'
  | 'b2b.services.manage'
  | 'b2b.cases.manage'
  | 'b2b.clients.manage'
  | 'b2b.rfp.manage'
  | 'b2b.feedback.manage'
  | 'b2b.faqs.manage'
  // HR capabilities
  | 'hr.team.manage'
  | 'hr.jobs.manage'
  | 'hr.applications.manage'
  | 'hr.talent.manage'
  | 'hr.cv.manage'
  // CRM & Sales
  | 'crm.leads.manage'
  | 'crm.clients.manage'
  | 'crm.inquiries.manage'
  | 'crm.subscribers.manage'
  // Operations
  | 'operations.events.manage'
  | 'operations.recap.manage'
  | 'operations.catalog.manage'
  | 'operations.rules.manage'
  | 'operations.broadcast.manage'
  // Settings & System
  | 'settings.general.manage'
  | 'settings.gateway.manage'
  | 'settings.seo.manage'
  | 'settings.approvals.manage'
  | 'rbac.manage'
  | 'audit.read'
  // Global Media
  | 'media.read'
  | 'media.write'
  | 'media.delete'
  // Portals
  | 'staff.schedule.own'
  | 'staff.meetings.own'
  | 'staff.profile.own'
  | 'client.rfp.own'
  | 'client.company.own'
  | 'client.documents.own'
  | 'candidate.profile.own'
  | 'candidate.applications.own'
  | 'candidate.documents.own';

/**
 * Granular capability-based RBAC matrix for E3 Qatar platform.
 */
export const rolePermissions: Record<Role, string[]> = {
  SUPER_ADMIN: ['*'],

  B2C_ADMIN: [
    'b2c.content.read',
    'b2c.content.write',
    'b2c.content.publish',
    'b2c.attractions.manage',
    'b2c.packages.manage',
    'b2c.calendar.manage',
    'b2c.feedback.manage',
    'b2c.inquiries.manage',
    'media.read',
    'media.write',
    'view:b2c',
    'manage:b2c',
    'publish:b2c',
    'manage:attractions',
    'manage:events',
    'manage:tickets',
    'manage:feedback',
  ],

  SUPPORT_ADMIN: [
    'b2c.content.read',
    'b2c.content.write',
    'b2c.content.publish',
    'b2c.attractions.manage',
    'b2c.packages.manage',
    'b2c.calendar.manage',
    'b2c.feedback.manage',
    'b2c.inquiries.manage',
    'media.read',
    'media.write',
    'view:b2c',
    'manage:b2c',
    'publish:b2c',
    'manage:attractions',
    'manage:events',
    'manage:tickets',
    'manage:feedback',
    'view:schedule',
  ],

  B2B_ADMIN: [
    'b2b.content.read',
    'b2b.content.write',
    'b2b.content.publish',
    'b2b.services.manage',
    'b2b.cases.manage',
    'b2b.clients.manage',
    'b2b.rfp.manage',
    'b2b.feedback.manage',
    'b2b.faqs.manage',
    'crm.leads.manage',
    'crm.clients.manage',
    'crm.inquiries.manage',
    'media.read',
    'media.write',
    'view:b2b',
    'manage:b2b',
    'publish:b2b',
    'view:crm',
    'manage:crm',
    'manage:clients',
  ],

  SALES_ADMIN: [
    'b2b.content.read',
    'b2b.content.write',
    'b2b.content.publish',
    'b2b.services.manage',
    'b2b.cases.manage',
    'b2b.clients.manage',
    'b2b.rfp.manage',
    'b2b.feedback.manage',
    'b2b.faqs.manage',
    'crm.leads.manage',
    'crm.clients.manage',
    'crm.inquiries.manage',
    'crm.subscribers.manage',
    'media.read',
    'media.write',
    'view:b2b',
    'manage:b2b',
    'publish:b2b',
    'view:crm',
    'manage:crm',
    'manage:clients',
    'view:schedule',
  ],

  HR_ADMIN: [
    'hr.team.manage',
    'hr.jobs.manage',
    'hr.applications.manage',
    'hr.talent.manage',
    'hr.cv.manage',
    'media.read',
    'media.write',
  ],

  OPERATIONS_ADMIN: [
    'operations.events.manage',
    'operations.recap.manage',
    'operations.catalog.manage',
    'operations.rules.manage',
    'operations.broadcast.manage',
    'media.read',
    'view:schedule',
  ],

  STAFF: [
    'staff.schedule.own',
    'staff.meetings.own',
    'staff.profile.own',
    'media.read',
    'view:schedule_own',
    'manage:schedule_own',
    'view:staff_dashboard',
    'view:staff_profile',
    'upload:staff_media',
  ],

  CLIENT: [
    'client.rfp.own',
    'client.company.own',
    'client.documents.own',
    'view:business_dashboard',
    'view:company',
    'manage:company_members',
    'view:projects',
    'create:requests',
    'view:files',
    'view:meetings',
    'request:meetings',
  ],

  BUSINESS_USER: [
    'client.rfp.own',
    'client.company.own',
    'client.documents.own',
    'view:business_dashboard',
    'view:company',
    'manage:company_members',
    'view:projects',
    'create:requests',
    'view:files',
    'view:meetings',
    'request:meetings',
  ],

  CANDIDATE: [
    'candidate.profile.own',
    'candidate.applications.own',
    'candidate.documents.own',
    'view:candidate_profile',
    'manage:candidate_profile',
    'view:candidate_applications',
    'create:candidate_applications',
    'manage:candidate_documents',
  ],
};

/**
 * Checks whether a given role holds a required capability or resource action.
 */
export function hasPermission(
  role: string | undefined | null,
  resourceOrCapability: string,
  action?: string
): boolean {
  if (!role) return false;

  const normalizedRole = role.trim().toUpperCase() as Role;
  const permissions = rolePermissions[normalizedRole] || [];

  if (permissions.includes('*')) return true;

  // 1. Direct match on capability (e.g. 'b2c.content.read')
  if (permissions.includes(resourceOrCapability)) return true;

  // 2. Action:Resource format (e.g. action="read", resource="b2c" -> "read:b2c")
  if (action) {
    const targetPermission = `${action}:${resourceOrCapability}`;
    if (permissions.includes(targetPermission)) return true;
    if (permissions.includes(`*:${resourceOrCapability}`) || permissions.includes(`${action}:*`)) {
      return true;
    }
  }

  // 3. Dot wildcard checks (e.g., 'b2c.*')
  const prefix = resourceOrCapability.split('.')[0];
  if (permissions.includes(`${prefix}.*`)) return true;

  return false;
}
