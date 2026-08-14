"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  locale?: string;
  className?: string;
  portal?: 'admin' | 'staff' | 'business' | 'careers';
  callbackUrl?: string;
}

export function LogoutButton({ 
  locale = "en", 
  className = "", 
  portal, 
  callbackUrl 
}: LogoutButtonProps) {
  const isAr = locale === "ar";

  const resolvedCallback = callbackUrl || (portal ? `/${locale}/login/${portal}` : `/${locale}/login/careers`);

  const handleLogout = async () => {
    await signOut({ callbackUrl: resolvedCallback });
  };

  return (
    <button
      onClick={handleLogout}
      className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 rounded-xl transition-all ${className}`}
      title={isAr ? "تسجيل الخروج" : "Sign Out"}
    >
      <LogOut className="w-3.5 h-3.5 rtl:rotate-180" />
      <span>{isAr ? "تسجيل الخروج" : "Sign Out"}</span>
    </button>
  );
}
