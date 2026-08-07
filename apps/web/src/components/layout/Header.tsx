"use client";

import * as React from "react";
import Link from "next/link";
import { Sun, Moon, LogIn, Compass, Layers } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useLocale } from "./LocaleProvider";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { E3Logo } from "@/components/shared/E3Logo";
import { AtelierRail } from "@/components/navigation/AtelierRail";
import { PulseOrbit } from "@/components/navigation/PulseOrbit";
import { WorldStackMobile } from "@/components/navigation/WorldStackMobile";
import { cn } from "@/lib/utils";

interface HeaderProps {
  portal: "b2c" | "b2b";
  lightLogoUrl?: string;
  darkLogoUrl?: string;
}

const navConfig = {
  b2c: [
    { label: "nav.discover", href: "/b2c/discover" },
    { label: "nav.team", href: "/b2c/team" },
    { label: "nav.attractions", href: "/b2c" },
    { label: "nav.events", href: "/b2c/calendar" },
    { label: "nav.contact", href: "/b2c/contact" },
  ],
  b2b: [
    { label: "nav.home", href: "/b2b" },
    { label: "nav.services", href: "/b2b/services" },
    { label: "nav.partners", href: "/b2b/partners" },
    { label: "nav.contact", href: "/b2b/contact" },
  ],
};

export function Header({ portal, lightLogoUrl, darkLogoUrl }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const [scrolled, setScrolled] = React.useState(false);

  const [atelierOpen, setAtelierOpen] = React.useState(false);
  const [pulseOpen, setPulseOpen] = React.useState(false);
  const [mobileStackOpen, setMobileStackOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = navConfig[portal] || navConfig.b2c;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 start-0 end-0 z-40 transition-all duration-300",
          scrolled 
            ? "bg-[var(--surface-default)]/80 backdrop-blur-md border-b border-[var(--border-level-2)] shadow-sm py-3" 
            : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/${portal}`} className="relative z-50 flex items-center gap-2">
              <E3Logo
                isLight={theme === "light"}
                lightLogoUrl={lightLogoUrl}
                darkLogoUrl={darkLogoUrl}
                size="md"
              />
            </Link>

            <button
              onClick={() => (portal === "b2b" ? setAtelierOpen(true) : setPulseOpen(true))}
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider relative z-50 transition-colors border",
                portal === "b2c"
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black"
              )}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{portal === "b2b" ? (isAr ? "دليل القائمة المعمارية" : "Atelier Spatial Menu") : (isAr ? "دليل الفعاليات والاستكشاف" : "Pulse Orbit Menu")}</span>
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4 relative z-50">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <LanguageSwitcher variant="full" />

            <Link
              href={`/${locale}/login/admin`}
              className="hidden sm:flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-full text-sm font-medium hover:brightness-110 transition-all"
            >
              <LogIn size={16} />
              {t("nav.login")}
            </Link>

            {/* Mobile Menu Button with Visible 'Menu' Label */}
            <button
              onClick={() => setMobileStackOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-colors"
              aria-label="Open Mobile Menu"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? "القائمة" : "Menu"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Atelier Rail (B2B Full-Screen Navigation) */}
      <AtelierRail isOpen={atelierOpen} onClose={() => setAtelierOpen(false)} />

      {/* Pulse Orbit (B2C Discovery Ring) */}
      <PulseOrbit isOpen={pulseOpen} onClose={() => setPulseOpen(false)} />

      {/* World Stack Mobile Navigation */}
      <WorldStackMobile isOpen={mobileStackOpen} onClose={() => setMobileStackOpen(false)} />
    </>
  );
}
