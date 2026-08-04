"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
}

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
}: ThemeProviderProps) {
  const theme = React.useSyncExternalStore(
    (callback) => {
      window.addEventListener('storage', callback);
      return () => window.removeEventListener('storage', callback);
    },
    () => (typeof window !== "undefined" ? window.localStorage.getItem("theme") as Theme | null : null) || defaultTheme,
    () => defaultTheme
  );

  const setThemeState = React.useCallback((newTheme: Theme) => {
    window.localStorage.setItem("theme", newTheme);
    window.dispatchEvent(new Event('storage'));
  }, []);

  const setTheme = setThemeState;

  React.useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme class/data-attribute
    root.removeAttribute("data-theme");
    
    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      
      // We don't set data-theme for system if it falls back to prefers-color-scheme 
      // based on our globals.css design, but explicitly setting it helps with JS logic.
      root.setAttribute("data-theme", systemTheme);
      return;
    }

    root.setAttribute("data-theme", theme);
  }, [theme, enableSystem]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme: (theme: Theme) => {
        localStorage.setItem("theme", theme);
        setTheme(theme);
      },
    }),
    [theme, setTheme]
  );

  return (
    <ThemeProviderContext.Provider value={value}>

      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
