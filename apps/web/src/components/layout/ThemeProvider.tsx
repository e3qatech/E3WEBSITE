"use client";

import * as React from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemePreference;
}

type ThemeProviderState = {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (pref: ThemePreference) => void;
  // Legacy compatibility helpers
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
};

const initialState: ThemeProviderState = {
  themePreference: "system",
  resolvedTheme: "dark",
  setThemePreference: () => null,
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [themePreference, setThemePreferenceState] = React.useState<ThemePreference>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("themePreference") || localStorage.getItem("theme");
      if (saved === "light" || saved === "dark" || saved === "system") {
        return saved as ThemePreference;
      }
    }
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>("dark");

  // Determine system theme and update resolved theme dynamically
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const computeResolvedTheme = (pref: ThemePreference): ResolvedTheme => {
      if (pref === "system") {
        return mediaQuery.matches ? "dark" : "light";
      }
      return pref;
    };

    const currentResolved = computeResolvedTheme(themePreference);
// eslint-disable-next-line react-hooks/set-state-in-effect
    setResolvedTheme(currentResolved);

    // Apply data-theme attribute directly on document root
    const root = document.documentElement;
    root.setAttribute("data-theme", currentResolved);
    root.style.colorScheme = currentResolved;

    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (themePreference === "system") {
        const newSystemTheme: ResolvedTheme = e.matches ? "dark" : "light";
        setResolvedTheme(newSystemTheme);
        root.setAttribute("data-theme", newSystemTheme);
        root.style.colorScheme = newSystemTheme;
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, [themePreference]);

  const setThemePreference = React.useCallback((newPref: ThemePreference) => {
    setThemePreferenceState(newPref);
    if (typeof window !== "undefined") {
      localStorage.setItem("themePreference", newPref);
      localStorage.setItem("theme", newPref);
      window.dispatchEvent(new Event("storage"));
    }
  }, []);

  const value = React.useMemo(
    () => ({
      themePreference,
      resolvedTheme,
      setThemePreference,
      theme: themePreference,
      setTheme: setThemePreference,
    }),
    [themePreference, resolvedTheme, setThemePreference]
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
