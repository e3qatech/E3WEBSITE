export type Role = 'SUPER_ADMIN' | 'SALES_ADMIN' | 'SUPPORT_ADMIN' | 'STAFF' | 'CLIENT' | 'CANDIDATE';

// Hardcoded permission matrix for granular RBAC policy enforcement
export const rolePermissions: Record<Role, string[]> = {
  SUPER_ADMIN: ['*'],
  SALES_ADMIN: [
    'view:b2b', 'manage:b2b', 'publish:b2b',
    'view:crm', 'manage:crm', 'manage:clients',
    'view:schedule'
  ],
  SUPPORT_ADMIN: [
    'view:b2c', 'manage:b2c', 'publish:b2c',
    'manage:attractions', 'manage:events', 'manage:tickets', 'manage:feedback',
    'view:schedule'
  ],
  STAFF: [
    'view:schedule_own', 'manage:schedule_own',
    'view:staff_dashboard', 'view:staff_profile',
    'upload:staff_media'
  ],
  CLIENT: [
    'view:business_dashboard', 'view:company', 'manage:company_members',
    'view:projects', 'create:requests', 'view:files',
    'view:meetings', 'request:meetings'
  ],
  CANDIDATE: [
    'view:candidate_profile', 'manage:candidate_profile',
    'view:candidate_applications', 'create:candidate_applications',
    'manage:candidate_documents'
  ]
};

export function hasPermission(role: Role | undefined | null, resource: string, action: string): boolean {
  if (!role) return false;
  
  const permissions = rolePermissions[role] || [];
  
  if (permissions.includes('*')) return true;
  
  const targetPermission = `${action}:${resource}`;
  
  // Explicit check
  if (permissions.includes(targetPermission)) return true;
  
  // Wildcard action on resource (e.g., 'manage:*' or '*:b2b')
  if (permissions.includes(`*:${resource}`) || permissions.includes(`${action}:*`)) return true;

  return false;
}
