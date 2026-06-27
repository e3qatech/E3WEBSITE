"use client"

import React, { ReactNode } from "react"
import { useAuth, useHasPermission } from "@/hooks/useAuth"

interface AuthorizeProps {
  children: ReactNode
  action?: string
  resource: string
  fallback?: ReactNode
}

/**
 * UI Wrapper that conditionally renders children based on the user's role
 * and the E3 Permission Matrix.
 */
export function Authorize({ 
  children, 
  action = 'READ', 
  resource, 
  fallback = null 
}: AuthorizeProps) {
  const { isAuthenticated } = useAuth();
  const isAllowed = useHasPermission(resource, action);
  
  if (!isAuthenticated) {
    return <>{fallback}</>
  }

  if (!isAllowed) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
