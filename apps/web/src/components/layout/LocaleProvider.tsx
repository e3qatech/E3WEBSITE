"use client";

import * as React from "react";

export type Locale = "en" | "ar";

interface LocaleProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

type LocaleProviderState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
};

const initialState: LocaleProviderState = {
  locale: "en",
  setLocale: () => null,
  dir: "ltr",
  t: (key) => key,
};

const LocaleProviderContext = React.createContext<LocaleProviderState>(initialState);

// Placeholder dictionary for translation (in a real app, this would be loaded asynchronously or passed down)
const dictionaries: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.attractions": "Attractions",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.events": "Calendar",
    "nav.discover": "Discover",
    "nav.tickets": "Tickets",
    "nav.faq": "FAQ",
    "nav.support": "Support",
    "nav.services": "Services",
    "nav.partners": "Partners",
    "nav.corporate": "Corporate",
    // Portals
    "portal.b2c": "B2C Portal",
    "portal.b2b": "B2B Portal",
    // Footer Notes
    "footer.quickLinks": "Quick Links",
    "footer.contact": "Contact Us",
    "footer.newsletter": "Stay Updated",
    "footer.subscribe": "Subscribe",
    "footer.rights": "All rights reserved.",
    // Administrative
    "admin.dashboard": "Dashboard",
    "admin.users": "User Management",
    "admin.settings": "Settings",
    "admin.analytics": "Analytics",
    "admin.reports": "Reports",
    "admin.logout": "Logout",
  },
  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.attractions": "التجارب",
    "nav.about": "معلومات عنا",
    "nav.contact": "اتصل بنا",
    "nav.events": "التقويم",
    "nav.discover": "استكشف",
    "nav.tickets": "التذاكر",
    "nav.faq": "الأسئلة الشائعة",
    "nav.support": "الدعم",
    "nav.services": "الخدمات",
    "nav.partners": "الشركاء",
    "nav.corporate": "الشركات",
    // Portals
    "portal.b2c": "بوابة الأفراد",
    "portal.b2b": "بوابة الشركات",
    // Footer Notes
    "footer.quickLinks": "روابط سريعة",
    "footer.contact": "اتصل بنا",
    "footer.newsletter": "ابق على اطلاع",
    "footer.subscribe": "اشترك",
    "footer.rights": "جميع الحقوق محفوظة.",
    // Administrative
    "admin.dashboard": "لوحة القيادة",
    "admin.users": "إدارة المستخدمين",
    "admin.settings": "الإعدادات",
    "admin.analytics": "التحليلات",
    "admin.reports": "التقارير",
    "admin.logout": "تسجيل خروج",
  }
};

export function LocaleProvider({
  children,
  defaultLocale = "en",
}: LocaleProviderProps) {
  const [locale, setLocaleState] = React.useState<Locale>(defaultLocale);

  React.useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale | null;
    if (savedLocale && (savedLocale === "en" || savedLocale === "ar")) {
      setLocaleState(savedLocale);
    }
  }, []);

  React.useEffect(() => {
    const root = window.document.documentElement;
    const dir = locale === "ar" ? "rtl" : "ltr";
    
    root.setAttribute("lang", locale);
    root.setAttribute("dir", dir);
  }, [locale]);

  const setLocale = React.useCallback((newLocale: Locale) => {
    localStorage.setItem("locale", newLocale);
    setLocaleState(newLocale);
  }, []);

  const t = React.useCallback(
    (key: string) => {
      // Very basic translation fn, falls back to key if not found
      return dictionaries[locale][key] || key;
    },
    [locale]
  );

  const value = React.useMemo(
    () => ({
      locale,
      setLocale,
      dir: locale === "ar" ? "rtl" : "ltr" as "rtl" | "ltr",
      t,
    }),
    [locale, setLocale, t]
  );

  return (
    <LocaleProviderContext.Provider value={value}>
      {children}
    </LocaleProviderContext.Provider>
  );
}

export const useLocale = () => {
  const context = React.useContext(LocaleProviderContext);
  if (context === undefined)
    throw new Error("useLocale must be used within a LocaleProvider");
  return context;
};
