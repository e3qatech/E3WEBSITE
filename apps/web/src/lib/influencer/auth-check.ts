import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission, type Capability } from '@/lib/permissions';

export interface InfluencerAuthContext {
  isAuthed: boolean;
  userId?: string;
  userEmail?: string;
  userName?: string;
  role?: string;
  permissions?: string[];
  user?: any;
}

/**
 * Server-side RBAC authorization check for Influencer & Creator Management API routes and actions.
 * Enforces deny-by-default logic.
 */
export async function checkInfluencerAuth(
  req?: NextRequest,
  requiredCapability: Capability = 'influencer.read'
): Promise<InfluencerAuthContext> {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { isAuthed: false };
    }

    const rawRole = (session.user as any).role || 'CLIENT';
    const userRole = String(rawRole).trim().toUpperCase();

    // SUPER_ADMIN has full platform capabilities
    if (userRole === 'SUPER_ADMIN') {
      return {
        isAuthed: true,
        userId: session.user.id,
        userEmail: session.user.email || undefined,
        userName: session.user.name || undefined,
        role: userRole,
        permissions: ['*'],
        user: session.user,
      };
    }

    // Check capability against user role
    const permitted = hasPermission(userRole, requiredCapability);
    if (!permitted) {
      return {
        isAuthed: false,
        userId: session.user.id,
        userEmail: session.user.email || undefined,
        userName: session.user.name || undefined,
        role: userRole,
        user: session.user,
      };
    }

    return {
      isAuthed: true,
      userId: session.user.id,
      userEmail: session.user.email || undefined,
      userName: session.user.name || undefined,
      role: userRole,
      user: session.user,
    };
  } catch (error) {
    console.error('[Influencer Auth Check Exception]', error);
    return { isAuthed: false };
  }
}
