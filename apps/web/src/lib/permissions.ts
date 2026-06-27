export type Role = 'SUPER_ADMIN' | 'SALES_ADMIN' | 'SUPPORT_ADMIN' | 'STAFF' | 'CLIENT';

// Hardcoded permission matrix until DB-seeded permissions are fully integrated
const rolePermissions: Record<Role, string[]> = {
  SUPER_ADMIN: ['*'],
  SALES_ADMIN: [
    'view:b2b', 'manage:b2b',
    'view:crm', 'manage:crm',
    'view:schedule'
  ],
  SUPPORT_ADMIN: [
    'view:b2c', 'manage:b2c',
    'view:schedule'
  ],
  STAFF: [
    'view:schedule', 'manage:schedule_own'
  ],
  CLIENT: [
    'view:schedule_own', 'manage:schedule_own'
  ]
};

export function hasPermission(role: Role | undefined | null, resource: string, action: string): boolean {
  if (!role) return false;
  
  const permissions = rolePermissions[role] || [];
  
  if (permissions.includes('*')) return true;
  
  const targetPermission = `${action}:${resource}`;
  
  // Explicit check
  if (permissions.includes(targetPermission)) return true;
  
  // Wildcard action on resource (e.g., 'manage:*' or '*:b2b') - though not explicitly in matrix now, good practice
  if (permissions.includes(`*:${resource}`) || permissions.includes(`${action}:*`)) return true;

  return false;
}
