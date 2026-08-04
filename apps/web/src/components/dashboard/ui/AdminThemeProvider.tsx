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
    root.removeAttribute("data-theme");

    const getSystemTheme = () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

    const effectiveTheme = theme === "system" ? getSystemTheme() : theme;
    
    // In our Tailwind v4 setup, we use data-theme for explicit overrides
    if (theme !== "system") {
      root.setAttribute("data-theme", effectiveTheme);
    }
    
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Expected pattern for hydration
    setResolvedTheme(effectiveTheme as "dark" | "light");
    localStorage.setItem("e3-admin-theme", theme);
  }, [theme, mounted]);

  // Listen for system theme changes if set to system
  useEffect(() => {
    if (theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setResolvedTheme(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Prevent hydration mismatch flash by hiding content until theme is resolved
  // but we MUST provide the context to avoid SSR errors from children using the hook.
  return (
    <AdminThemeContext.Provider value={{ theme, resolvedTheme, setTheme: setThemeState }}>
      {!mounted ? (
        <div style={{ visibility: "hidden" }}>{children}</div>
      ) : (
        children
      )}
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
