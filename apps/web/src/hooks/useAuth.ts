"use client";

import { useSession } from "next-auth/react";
import { hasPermission, Role } from "@/lib/permissions";

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const role = (user as any)?.role as Role | undefined;

  return {
    user,
    role,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}

export function useIsAuthenticated() {
  const { status } = useSession();
  return status === "authenticated";
}

export function useHasPermission(resource: string, action: string) {
  const { role } = useAuth();
  return hasPermission(role, resource, action);
}
