import { auth } from "./auth";
import db from "./db";
import { rolePermissions } from "./permissions";
import type { RoleType } from "@prisma/client";
import { normalizeRole, isAdminRole, isStaffRole, PortalKey, isAuthorizedForPortal } from "./auth-roles";

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
    if (process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_ADMIN_BYPASS === 'true') {
      return {
        id: 'dev-admin-user',
        name: 'Dev Super Admin',
        email: 'admin@e3.qa',
        role: 'SUPER_ADMIN' as RoleType,
        rawRole: 'SUPER_ADMIN',
        sessionVersion: 1,
        permissions: ['*']
      };
    }
    throw new AppAuthError(401, "Unauthorized: No valid session");
  }

  let user: any = null;
  try {
    user = await db.user.findUnique({
      where: { id: session.user.id }
    });
  } catch (err) {
    console.error('[SERVER AUTH DB ERROR]', err);
  }

  if (!user) {
    if (normalizeRole((session.user as any)?.role) === 'SUPER_ADMIN') {
      return {
        id: session.user.id,
        name: session.user.name || 'Super Admin',
        email: session.user.email || 'admin@e3.qa',
        role: 'SUPER_ADMIN' as RoleType,
        rawRole: 'SUPER_ADMIN',
        sessionVersion: 1,
        permissions: ['*']
      };
    }
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

  let canonicalRole = user.role ? String(user.role).trim().toUpperCase() : "CLIENT";
  try {
    const { getCustomRolesMap, resolveUserPlatformRole } = await import("./custom-roles");
    const customRoles = await getCustomRolesMap();
    canonicalRole = resolveUserPlatformRole(user.email || user.id, canonicalRole, customRoles);
  } catch (_err) {
    // Fallback to user.role
  }

  const normalizedUserRole = normalizeRole(canonicalRole);
  const cleanRawRole = String(canonicalRole).trim().toUpperCase();
  const permissions = (cleanRawRole in rolePermissions)
    ? (rolePermissions as any)[cleanRawRole]
    : rolePermissions[normalizedUserRole] || [];

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: cleanRawRole as any,
    rawRole: cleanRawRole,
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
    const client = await db.client.findUnique({ where: { id: clientId } });
    if (!client) throw new AppAuthError(404, "Client entity not found");
    return { user, membership: null, client };
  }

  const membership = await db.clientMembership.findUnique({
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

export async function requireClientOrganization(targetClientId?: string) {
  const user = await requireCurrentUser();
  const isPrivileged = isAdminRole(user.role) || isStaffRole(user.role);

  if (isPrivileged) {
    if (targetClientId) {
      const client = await db.client.findUnique({ where: { id: targetClientId } });
      if (!client) throw new AppAuthError(404, "Organization not found");
      return { user, membership: null, client };
    }
    return { user, membership: null, client: null };
  }

  // Regular CLIENT user must have an active membership
  const membership = await db.clientMembership.findFirst({
    where: {
      userId: user.id,
      isActive: true,
    },
    include: { client: true },
  });

  if (!membership || !membership.client) {
    throw new AppAuthError(403, "No active organization membership found for this account");
  }

  // Cross-tenant prevention: If a specific organization ID was requested, strictly ensure it matches
  if (targetClientId && membership.clientId !== targetClientId) {
    throw new AppAuthError(403, "Access denied: You do not have permission to access another organization");
  }

  return { user, membership, client: membership.client };
}

export function sanitizeLeadForClient(lead: any) {
  if (!lead) return null;
  // Strip internal staff notes, probability scores, margins, and internal-only activities
  const clientActivities = Array.isArray(lead.activities)
    ? lead.activities
        .filter((act: any) => act.type !== 'INTERNAL_NOTE' && act.type !== 'STAFF_NOTE')
        .map((act: any) => ({
          id: act.id,
          type: act.type,
          description: act.description,
          timestamp: act.timestamp,
        }))
    : [];

  const clientInquiries = Array.isArray(lead.inquiries)
    ? lead.inquiries.map((inq: any) => ({
        id: inq.id,
        type: inq.type,
        subject: inq.subject,
        message: inq.message,
        status: inq.status,
        createdAt: inq.createdAt,
      }))
    : [];

  const clientUploads = Array.isArray(lead.uploads)
    ? lead.uploads.map((u: any) => ({
        id: u.id,
        originalFileName: u.originalFileName,
        mimeType: u.mimeType,
        fileSize: u.fileSize,
        pathname: u.pathname,
        createdAt: u.createdAt,
      }))
    : [];

  return {
    id: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    value: lead.value,
    interestServices: lead.interestServices,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    inquiries: clientInquiries,
    activities: clientActivities,
    uploads: clientUploads,
  };
}

export async function requireClientRfpAccess(rfpId: string) {
  const user = await requireCurrentUser();
  const isPrivileged = isAdminRole(user.role) || isStaffRole(user.role);

  const lead = await db.lead.findUnique({
    where: { id: rfpId },
    include: {
      inquiries: { orderBy: { createdAt: 'desc' } },
      activities: { orderBy: { timestamp: 'desc' } },
    },
  });

  if (!lead) {
    throw new AppAuthError(404, "RFP record not found");
  }

  // Fetch attached documents/deliverables
  let uploads: any[] = [];
  try {
    uploads = await db.rfpUpload.findMany({
      where: { leadId: rfpId, status: 'ATTACHED' },
      orderBy: { createdAt: 'desc' },
    });
  } catch (_e) {
    uploads = [];
  }
  lead.uploads = uploads;

  if (isPrivileged) {
    return { user, membership: null, client: null, lead: sanitizeLeadForClient(lead) };
  }

  // For client users, resolve organization and enforce multi-tenant match
  const { membership, client } = await requireClientOrganization();

  const isCompanyMatch =
    client &&
    lead.company &&
    lead.company.trim().toLowerCase() === client.company.trim().toLowerCase();

  const isEmailMatch =
    user.email &&
    lead.email &&
    lead.email.trim().toLowerCase() === user.email.trim().toLowerCase();

  if (!isCompanyMatch && !isEmailMatch) {
    throw new AppAuthError(404, "RFP record not found or access denied");
  }

  return {
    user,
    membership,
    client,
    lead: sanitizeLeadForClient(lead),
  };
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

  return { user };
}

export async function requireCandidateApplication(applicationId: string) {
  const user = await requireCurrentUser();
  const isPrivileged = ['SUPER_ADMIN', 'SALES_ADMIN', 'SUPPORT_ADMIN', 'STAFF', 'HR_ADMIN'].includes(user.role) || isAdminRole(user.role);

  if (isPrivileged) {
    const application = await (db as any).jobApplication.findUnique({ where: { id: applicationId } });
    if (!application) throw new AppAuthError(404, "Application not found");
    return { user, application };
  }

  const application = await (db as any).jobApplication.findFirst({
    where: {
      id: applicationId,
      OR: [
        { userId: user.id },
        ...(user.email ? [{ email: user.email }] : [])
      ]
    }
  });

  if (!application) {
    throw new AppAuthError(404, "Application not found or not owned by candidate");
  }

  return { user, application };
}
