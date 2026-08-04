import { auth } from "./auth";
import db from "./db";
import { rolePermissions } from "./permissions";
import type { RoleType } from "@prisma/client";

export class AuthError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export async function requireCurrentUser() {
  const session = await auth();
  if (!session || !session.user) {
    throw new AuthError(401, "Unauthorized: No valid session");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    throw new AuthError(401, "Unauthorized: User not found");
  }

  if (!user.isActive) {
    throw new AuthError(403, "Forbidden: Account is inactive");
  }

  if (user.sessionVersion !== session.user.sessionVersion) {
    throw new AuthError(403, "Forbidden: Session revoked or stale");
  }

  const permissions = rolePermissions[user.role as RoleType] || [];

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    sessionVersion: user.sessionVersion,
    permissions
  };
}

export async function requirePermission(action: string) {
  const user = await requireCurrentUser();
  if (!user.permissions.includes('*') && !user.permissions.includes(action)) {
    throw new AuthError(403, "Forbidden: Insufficient permissions");
  }
  return user;
}

export async function requireRole(allowedRoles: RoleType[]) {
  const user = await requireCurrentUser();
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError(403, "Forbidden: Insufficient role");
  }
  return user;
}
