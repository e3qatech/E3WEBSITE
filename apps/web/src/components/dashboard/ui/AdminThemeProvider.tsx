"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMounted } from "@/hooks/useMounted";

type Theme = "dark" | "light" | "system";

interface AdminThemeContextType {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(
    (callback) => {
      window.addEventListener('storage', callback);
      return () => window.removeEventListener('storage', callback);
    },
    () => (typeof window !== "undefined" ? window.localStorage.getItem("e3-admin-theme") as Theme | null : null) || "system",
    () => "system" as Theme
  );
  
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");
  const mounted = useMounted();

  const setThemeState = React.useCallback((newTheme: Theme) => {
    window.localStorage.setItem("e3-admin-theme", newTheme);
    window.dispatchEvent(new Event('storage'));
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.setAttribute("data-portal", "dashboard");

    const getSystemTheme = () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    const effectiveTheme = theme === "system" ? getSystemTheme() : theme;
    
    root.setAttribute("data-theme", effectiveTheme);
    root.style.colorScheme = effectiveTheme;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Expected pattern for hydration
    setResolvedTheme(effectiveTheme as "dark" | "light");
    try {
      localStorage.setItem("e3-admin-theme", theme);
    } catch (_e) {}
  }, [theme, mounted]);

  // Listen for system theme changes if set to system
  useEffect(() => {
    if (theme !== "system" || !mounted) return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const nextTheme = mediaQuery.matches ? "dark" : "light";
      setResolvedTheme(nextTheme);
      const root = window.document.documentElement;
      root.setAttribute("data-theme", nextTheme);
      root.style.colorScheme = nextTheme;
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  return (
    <AdminThemeContext.Provider value={{ theme, resolvedTheme, setTheme: setThemeState }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  }
  return context;
}
