import { auth } from "./auth";
import db from "./db";
import { rolePermissions } from "./permissions";
import type { RoleType } from "@prisma/client";
import { normalizeRole, isAdminRole, PortalKey, isAuthorizedForPortal } from "./auth-roles";

export class AppAuthError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AppAuthError";
    this.statusCode = statusCode;
  }
}

export async function requireCurrentUser() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new AppAuthError(401, "Unauthorized: No valid session");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    throw new AppAuthError(401, "Unauthorized: User not found");
  }

  if (!user.isActive) {
    throw new AppAuthError(403, "Forbidden: Account is inactive");
  }

  const dbSessionVersion = (user as any).sessionVersion ?? 1;
  const tokenSessionVersion = (session.user as any).sessionVersion ?? 1;

  if (dbSessionVersion !== tokenSessionVersion) {
    throw new AppAuthError(403, "Forbidden: Session revoked or stale");
  }

  const normalizedUserRole = normalizeRole(user.role);
  const permissions = rolePermissions[normalizedUserRole] || [];

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizedUserRole,
    rawRole: user.role,
    sessionVersion: dbSessionVersion,
    permissions
  };
}

export async function requirePermission(action: string) {
  const user = await requireCurrentUser();
  if (!user.permissions.includes('*') && !user.permissions.includes(action)) {
    throw new AppAuthError(403, "Forbidden: Insufficient permissions");
  }
  return user;
}

export async function requireRole(allowedRoles: (RoleType | string)[]) {
  const user = await requireCurrentUser();
  const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));
  if (!normalizedAllowed.includes(user.role)) {
    throw new AppAuthError(403, "Forbidden: Insufficient role");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireCurrentUser();
  if (!isAdminRole(user.role)) {
    throw new AppAuthError(403, "Forbidden: Admin role required");
  }
  return user;
}

export async function requirePortalAccess(portal: PortalKey) {
  const user = await requireCurrentUser();
  if (!isAuthorizedForPortal(user.role, portal)) {
    throw new AppAuthError(403, "This account is not authorized for this portal.");
  }

  // Double check membership for business portal
  if (portal === 'business' && user.role === 'CLIENT') {
    const membership = await (db as any).clientMembership.findFirst({
      where: { userId: user.id, isActive: true }
    });
    if (!membership) {
      throw new AppAuthError(403, "This account is not authorized for this portal.");
    }
  }

  // Double check staff profile link for staff portal
  if (portal === 'staff' && user.role === 'STAFF') {
    const profile = await (db as any).employeeProfile.findUnique({
      where: { userId: user.id }
    });
    if (!profile) {
      throw new AppAuthError(403, "This account is not authorized for this portal.");
    }
  }

  return user;
}

export async function requireStaffProfile() {
  const user = await requireCurrentUser();
  if (user.role !== 'STAFF' && !isAdminRole(user.role)) {
    throw new AppAuthError(403, "Forbidden: Staff role required");
  }

  const profile = await (db as any).employeeProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile && user.role === 'STAFF') {
    throw new AppAuthError(403, "Staff profile not linked to user account");
  }

  return { user, profile };
}

export async function requireStaffAssignment(resourceId: string) {
  const { user, profile } = await requireStaffProfile();
  if (user.role === 'SUPER_ADMIN') return { user, profile };

  const assignment = await (db as any).availabilitySlot.findFirst({
    where: { id: resourceId, employeeProfileId: profile?.id }
  });

  if (!assignment) {
    throw new AppAuthError(404, "Assignment not found or not assigned to staff member");
  }

  return { user, profile, assignment };
}

export async function requireClientMembership(clientId: string) {
  const user = await requireCurrentUser();
  if (user.role === 'SUPER_ADMIN') {
    const client = await (db as any).client.findUnique({ where: { id: clientId } });
    if (!client) throw new AppAuthError(404, "Client entity not found");
    return { user, membership: null, client };
  }

  const membership = await (db as any).clientMembership.findUnique({
    where: {
      userId_clientId: {
        userId: user.id,
        clientId: clientId
      }
    },
    include: { client: true }
  });

  if (!membership || !membership.isActive || !membership.client) {
    throw new AppAuthError(404, "Company membership not found or inactive");
  }

  return { user, membership, client: membership.client };
}

export async function requireClientPermission(clientId: string, requiredRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER') {
  const { user, membership, client } = await requireClientMembership(clientId);
  if (user.role === 'SUPER_ADMIN') return { user, membership, client };

  const roleHierarchy: Record<string, number> = {
    OWNER: 4,
    ADMIN: 3,
    MEMBER: 2,
    VIEWER: 1
  };

  const userRank = roleHierarchy[membership?.role || 'VIEWER'] || 0;
  const requiredRank = roleHierarchy[requiredRole] || 1;

  if (userRank < requiredRank) {
    throw new AppAuthError(403, "Forbidden: Insufficient membership role");
  }

  return { user, membership, client };
}

export async function requireCandidateProfile() {
  const user = await requireCurrentUser();
  if (user.role !== ('CANDIDATE' as any) && !isAdminRole(user.role)) {
    throw new AppAuthError(403, "Forbidden: Candidate role required");
  }

  const talent = await (db as any).talent.findUnique({
    where: { userId: user.id }
  });

  return { user, talent };
}

export async function requireCandidateApplication(applicationId: string) {
  const user = await requireCurrentUser();
  if (user.role === 'SUPER_ADMIN') {
    const application = await (db as any).jobApplication.findUnique({ where: { id: applicationId } });
    if (!application) throw new AppAuthError(404, "Application not found");
    return { user, application };
  }

  const application = await (db as any).jobApplication.findFirst({
    where: { id: applicationId, userId: user.id }
  });

  if (!application) {
    throw new AppAuthError(404, "Application not found or not owned by candidate");
  }

  return { user, application };
}
