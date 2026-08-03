import { auth } from "./auth";
import { db } from "./db";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export interface SessionUser {
  id: string;
  email: string | null;
  role: string;
  isActive: boolean;
  name: string | null;
}

/**
 * Validates session and checks if the user is active.
 * Used in Server Components/Pages where redirecting is appropriate.
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, isActive: true, name: true }
  });

  if (!user || !user.isActive) {
    // If user doesn't exist or is deactivated, force logout/redirect
    redirect("/auth/login");
  }

  return user as SessionUser;
}

/**
 * Validates session, checks if active, and checks if user has one of the allowed roles.
 * Used in Server Components/Pages.
 */
export async function requireRole(allowedRoles: string[]): Promise<SessionUser> {
  const user = await requireSession();
  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }
  return user;
}

/**
 * Validates session and checks if the user is active for API routes.
 * Returns an object with either an error/status or the verified user.
 */
export async function requireApiSession(): Promise<{ error: string; status: number } | { user: SessionUser }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, isActive: true, name: true }
  });

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  if (!user.isActive) {
    return { error: "Account is inactive", status: 403 };
  }

  return { user: user as SessionUser };
}

/**
 * Validates session, active status, and allowed roles for API routes.
 * Returns an object with either an error/status or the verified user.
 */
export async function requireApiRole(allowedRoles: string[]): Promise<{ error: string; status: number } | { user: SessionUser }> {
  const result = await requireApiSession();
  if ("error" in result) {
    return result;
  }
  if (!allowedRoles.includes(result.user.role)) {
    return { error: "Forbidden", status: 403 };
  }
  return { user: result.user };
}
