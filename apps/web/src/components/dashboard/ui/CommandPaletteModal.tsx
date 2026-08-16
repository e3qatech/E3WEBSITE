"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Layers,
  Sparkles,
  Briefcase,
  Users,
  Compass,
  Calendar,
  Package,
  Inbox,
  UserCheck,
  Radio,
  Sliders,
  Shield,
  CornerDownLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  titleEn: string;
  titleAr: string;
  category: "b2b" | "b2c" | "crm" | "operations" | "settings";
  categoryLabelEn: string;
  categoryLabelAr: string;
  href: string;
  icon: React.ReactNode;
  keywords?: string[];
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  locale = "en",
}: CommandPaletteModalProps) {
  const router = useRouter();
  const isAr = locale === "ar";
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dynamicServices, setDynamicServices] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Mount tracking for React Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Body scroll lock while modal is open
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Pre-indexed Command Center routes
  const staticItems: CommandItem[] = useMemo(
    () => [
      // --- B2B MODULES ---
      {
        id: "b2b-services",
        titleEn: "B2B Services Catalog",
        titleAr: "دليل خدمات الشركات والفعاليات",
        category: "b2b",
        categoryLabelEn: "B2B Content",
        categoryLabelAr: "محتوى B2B",
        href: `/${locale}/dashboard/b2b/services`,
        icon: <Layers className="w-4 h-4 text-cyan-500" />,
        keywords: ["services", "catalog", "offerings", "engineering", "b2b", "خدمات", "دليل"],
      },
      {
        id: "b2b-service-new",
        titleEn: "Add New B2B Service",
        titleAr: "إضافة خدمة مؤسسية جديدة",
        category: "b2b",
        categoryLabelEn: "B2B Content",
        categoryLabelAr: "محتوى B2B",
        href: `/${locale}/dashboard/b2b/services/new`,
        icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
        keywords: ["new service", "create service", "add service", "إضافة خدمة"],
      },
      {
        id: "b2b-cases",
        titleEn: "Case Studies Portfolio",
        titleAr: "محفظة دراسات الحالة والمشاريع",
        category: "b2b",
        categoryLabelEn: "B2B Content",
        categoryLabelAr: "محتوى B2B",
        href: `/${locale}/dashboard/b2b/cases`,
        icon: <Briefcase className="w-4 h-4 text-violet-500" />,
        keywords: ["cases", "portfolio", "projects", "activations", "دراسات الحالة", "مشاريع"],
      },
      {
        id: "b2b-clients",
        titleEn: "Corporate Client Accounts",
        titleAr: "حسابات وشركاء الشركات",
        category: "b2b",
        categoryLabelEn: "B2B Content",
        categoryLabelAr: "محتوى B2B",
        href: `/${locale}/dashboard/b2b/clients`,
        icon: <Users className="w-4 h-4 text-blue-500" />,
        keywords: ["clients", "partners", "corporate", "عملاء", "شركات"],
      },
      {
        id: "b2b-team",
        titleEn: "Team & Leadership Directory",
        titleAr: "دليل فريق العمل والقيادات",
        category: "b2b",
        categoryLabelEn: "B2B Content",
        categoryLabelAr: "محتوى B2B",
        href: `/${locale}/dashboard/b2b/team`,
        icon: <UserCheck className="w-4 h-4 text-emerald-500" />,
        keywords: ["team", "employees", "leadership", "staff", "فريق", "موظفين", "قيادة"],
      },
      {
        id: "b2b-leadership",
        titleEn: "B2B Leadership & Team Page Editor",
        titleAr: "محرر صفحة القيادة وفريق العمل",
        category: "b2b",
        categoryLabelEn: "B2B Content",
        categoryLabelAr: "محتوى B2B",
        href: `/${locale}/dashboard/b2b/leadership`,
        icon: <Users className="w-4 h-4 text-emerald-400" />,
        keywords: ["leadership", "team page", "executives", "constellation hero", "ceo desk", "قيادة", "فريق العمل"],
      },
      {
        id: "b2b-home",
        titleEn: "B2B Homepage CMS Editor",
        titleAr: "محرر الصفحة الرئيسية للشركات",
        category: "b2b",
        categoryLabelEn: "B2B Content",
        categoryLabelAr: "محتوى B2B",
        href: `/${locale}/dashboard/b2b/home`,
        icon: <Sliders className="w-4 h-4 text-cyan-500" />,
        keywords: ["homepage", "b2b cms", "hero editor", "الرئيسية"],
      },

      // --- B2C MODULES ---
      {
        id: "b2c-attractions",
        titleEn: "Attractions & Experiences",
        titleAr: "الوجهات والتجارب الترفيهية",
        category: "b2c",
        categoryLabelEn: "B2C Experiences",
        categoryLabelAr: "تجارب B2C",
        href: `/${locale}/dashboard/b2c/attractions`,
        icon: <Compass className="w-4 h-4 text-amber-500" />,
        keywords: ["attractions", "experiences", "b2c", "rides", "وجهات", "تجارب"],
      },
      {
        id: "b2c-calendar",
        titleEn: "Experience Calendar & Timetable",
        titleAr: "جدول المواعيد والفعاليات",
        category: "b2c",
        categoryLabelEn: "B2C Experiences",
        categoryLabelAr: "تجارب B2C",
        href: `/${locale}/dashboard/b2c/calendar`,
        icon: <Calendar className="w-4 h-4 text-purple-500" />,
        keywords: ["calendar", "schedule", "events", "dates", "تقويم", "مواعيد"],
      },
      {
        id: "b2c-packages",
        titleEn: "Packages & Access Passes",
        titleAr: "الباقات وبطاقات الدخول",
        category: "b2c",
        categoryLabelEn: "B2C Experiences",
        categoryLabelAr: "تجارب B2C",
        href: `/${locale}/dashboard/b2c/packages`,
        icon: <Package className="w-4 h-4 text-emerald-500" />,
        keywords: ["packages", "passes", "tickets", "pricing", "باقات", "تذاكر"],
      },
      {
        id: "b2c-live-feed",
        titleEn: "Live Social Feed & Media",
        titleAr: "البث الحي وموجز التواصل",
        category: "b2c",
        categoryLabelEn: "B2C Experiences",
        categoryLabelAr: "تجارب B2C",
        href: `/${locale}/dashboard/b2c/content/live-feed`,
        icon: <Radio className="w-4 h-4 text-rose-500" />,
        keywords: ["social", "feed", "instagram", "media", "live", "بث", "تواصل"],
      },

      // --- CRM & LEADS ---
      {
        id: "crm-inquiries",
        titleEn: "Client Inquiries & Bookings",
        titleAr: "استفسارات وحجوزات العملاء",
        category: "crm",
        categoryLabelEn: "CRM & Ingestion",
        categoryLabelAr: "إدارة العملاء",
        href: `/${locale}/dashboard/crm/inquiries`,
        icon: <Inbox className="w-4 h-4 text-indigo-500" />,
        keywords: ["inquiries", "bookings", "rfp", "requests", "استفسارات", "طلبات"],
      },
      {
        id: "crm-leads",
        titleEn: "Sales Leads & Opportunities",
        titleAr: "فرص المبيعات والعملاء المحتملين",
        category: "crm",
        categoryLabelEn: "CRM & Ingestion",
        categoryLabelAr: "إدارة العملاء",
        href: `/${locale}/dashboard/crm/leads`,
        icon: <Sparkles className="w-4 h-4 text-amber-500" />,
        keywords: ["leads", "sales", "deals", "pipeline", "مبيعات", "فرص"],
      },
      {
        id: "crm-talent",
        titleEn: "Talent & Job Applications",
        titleAr: "طلبات التوظيف والمواهب",
        category: "crm",
        categoryLabelEn: "CRM & Ingestion",
        categoryLabelAr: "إدارة العملاء",
        href: `/${locale}/dashboard/crm/talent`,
        icon: <UserCheck className="w-4 h-4 text-teal-500" />,
        keywords: ["talent", "careers", "applications", "resumes", "jobs", "توظيف", "وظائف"],
      },

      // --- OPERATIONS & SYSTEMS ---
      {
        id: "ops-broadcast",
        titleEn: "Operations Broadcast Center",
        titleAr: "مركز البث والتعميمات التشغيلية",
        category: "operations",
        categoryLabelEn: "Operations",
        categoryLabelAr: "العمليات",
        href: `/${locale}/dashboard/operations/broadcast`,
        icon: <Radio className="w-4 h-4 text-orange-500" />,
        keywords: ["broadcast", "announcements", "operations", "alerts", "بث", "تنبيهات"],
      },
      {
        id: "ops-rules",
        titleEn: "Temporal & Operating Rules",
        titleAr: "القواعد الزمنية وجداول التشغيل",
        category: "operations",
        categoryLabelEn: "Operations",
        categoryLabelAr: "العمليات",
        href: `/${locale}/dashboard/operations/temporal-rules`,
        icon: <Sliders className="w-4 h-4 text-blue-500" />,
        keywords: ["temporal", "rules", "schedule rules", "operating hours", "قواعد"],
      },

      // --- SETTINGS ---
      {
        id: "settings-general",
        titleEn: "General Command Settings",
        titleAr: "الإعدادات العامة للوحة التحكم",
        category: "settings",
        categoryLabelEn: "Settings",
        categoryLabelAr: "الإعدادات",
        href: `/${locale}/dashboard/settings/general`,
        icon: <Sliders className="w-4 h-4 text-slate-400" />,
        keywords: ["settings", "general", "config", "إعدادات"],
      },
      {
        id: "settings-gateway",
        titleEn: "Payment Gateway & Pass Settings",
        titleAr: "بوابة الدفع وإعدادات البطاقات",
        category: "settings",
        categoryLabelEn: "Settings",
        categoryLabelAr: "الإعدادات",
        href: `/${locale}/dashboard/settings/gateway`,
        icon: <Shield className="w-4 h-4 text-emerald-500" />,
        keywords: ["gateway", "payment", "passes", "stripe", "دفع", "بوابة"],
      },
      {
        id: "settings-seo",
        titleEn: "SEO & Search Engine Metadata",
        titleAr: "إعدادات تحسين محركات البحث SEO",
        category: "settings",
        categoryLabelEn: "Settings",
        categoryLabelAr: "الإعدادات",
        href: `/${locale}/dashboard/settings/seo`,
        icon: <Search className="w-4 h-4 text-cyan-500" />,
        keywords: ["seo", "meta", "search engines", "sitemap", "محركات البحث"],
      },
    ],
    [locale]
  );

  // Fetch live B2B services dynamically to allow direct search to specific services
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    fetch("/api/b2b/services")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        const list = Array.isArray(data) ? data : data.services || [];
        setDynamicServices(list);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Combine static and dynamic service items
  const allItems: CommandItem[] = useMemo(() => {
    const serviceItems: CommandItem[] = dynamicServices.map((s: any) => ({
      id: `service-${s.id || s.slug}`,
      titleEn: s.titleEn || s.title || "Service",
      titleAr: s.titleAr || s.titleEn || "خدمة",
      category: "b2b",
      categoryLabelEn: "B2B Services",
      categoryLabelAr: "خدمات B2B",
      href: `/${locale}/dashboard/b2b/services/${s.slug}`,
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      keywords: [
        "service",
        s.slug || "",
        s.category || "",
        s.shortDescriptionEn || "",
        "خدمة",
      ],
    }));

    return [...staticItems, ...serviceItems];
  }, [staticItems, dynamicServices, locale]);

  // Filter items by active category and search query
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();

    return allItems.filter((item) => {
      // 1. Category filter
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }

      // 2. Query filter
      if (!q) return true;

      const titleEnMatch = item.titleEn.toLowerCase().includes(q);
      const titleArMatch = item.titleAr.includes(q);
      const categoryMatch =
        item.categoryLabelEn.toLowerCase().includes(q) ||
        item.categoryLabelAr.includes(q);
      const keywordMatch =
        item.keywords &&
        item.keywords.some((k) => k.toLowerCase().includes(q));

      return titleEnMatch || titleArMatch || categoryMatch || keywordMatch;
    });
  }, [allItems, activeCategory, query]);

  // Reset selected index when query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
    }
  }, [isOpen]);

  // Select item action
  const handleSelectItem = useCallback(
    (item: CommandItem) => {
      onClose();
      router.push(item.href);
    },
    [onClose, router]
  );

  // Keyboard navigation within command palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
      } else if (e.key === "Enter" && filteredItems.length > 0) {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          handleSelectItem(selected);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose, handleSelectItem]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(
      `[data-command-index="${selectedIndex}"]`
    ) as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const categories = [
    { key: "all", labelEn: "All Modules", labelAr: "الكل" },
    { key: "b2b", labelEn: "B2B Services", labelAr: "خدمات B2B" },
    { key: "b2c", labelEn: "B2C Experiences", labelAr: "تجارب B2C" },
    { key: "crm", labelEn: "CRM & Leads", labelAr: "العملاء" },
    { key: "operations", labelEn: "Operations", labelAr: "العمليات" },
    { key: "settings", labelEn: "Settings", labelAr: "الإعدادات" },
  ];

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isAr ? "شريط البحث والتنقل السريع" : "Command Center Search"}
      data-testid="command-palette-modal"
      className="fixed inset-0 z-[99999] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#111622] text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-[80vh] transition-all animate-in zoom-in-95 duration-200"
        dir={isAr ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================ */}
        {/* 1. SEARCH INPUT HEADER                                       */}
        {/* ============================================================ */}
        <div className="relative flex items-center px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-[#0c101a]">
          <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 me-3 opacity-90" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isAr
                ? "ابحث عن خدمة، دراسة حالة، وجهة، أو إعدادات..."
                : "Search services, cases, attractions, leads, or settings..."
            }
            data-testid="command-palette-input"
            className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer me-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 rounded-lg text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* ============================================================ */}
        {/* 2. CATEGORY FILTER PILLS                                     */}
        {/* ============================================================ */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-zinc-800/80 bg-slate-100 dark:bg-[#0e131f]">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                data-testid={`command-category-${cat.key}`}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                  isActive
                    ? "bg-cyan-600 dark:bg-cyan-500 text-white shadow-sm"
                    : "bg-white dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700/80"
                )}
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* 3. SCROLLABLE RESULTS LIST (SOLID OPAQUE SURFACE)            */}
        {/* ============================================================ */}
        <div
          ref={listRef}
          data-testid="command-palette-results"
          className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 max-h-[420px] bg-white dark:bg-[#111622]"
        >
          {filteredItems.map((item, index) => {
            const isSelected = index === selectedIndex;

            return (
              <div
                key={item.id}
                data-command-index={index}
                data-testid={`command-item-${item.id}`}
                onClick={() => handleSelectItem(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "flex items-center justify-between px-3 sm:px-4 py-3 rounded-2xl cursor-pointer transition-all",
                  isSelected
                    ? "bg-cyan-50/90 dark:bg-cyan-950/40 border border-cyan-500/40 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-colors",
                      isSelected
                        ? "bg-white dark:bg-zinc-800 border-cyan-500/50 shadow-sm"
                        : "bg-slate-100 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700"
                    )}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div
                      className={cn(
                        "text-xs sm:text-sm font-bold truncate",
                        isSelected
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-800 dark:text-zinc-200"
                      )}
                    >
                      {isAr ? item.titleAr : item.titleEn}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <span>{isAr ? item.categoryLabelAr : item.categoryLabelEn}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px] truncate max-w-[200px]">
                        {item.href}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 ms-3">
                  {isSelected && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                      <CornerDownLeft className="w-3 h-3" />
                      <span>{isAr ? "انتقال" : "Jump"}</span>
                    </span>
                  )}
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 text-slate-400 dark:text-zinc-500",
                      isAr && "rotate-180"
                    )}
                  />
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="py-12 px-4 text-center">
              <Search className="w-8 h-8 text-slate-400 dark:text-zinc-600 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {isAr ? "لم يتم العثور على نتائج" : "No results found"}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {isAr
                  ? `لا توجد خدمات أو أقسام تطابق "${query}"`
                  : `No commands or services matching "${query}"`}
              </p>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 4. FOOTER HELPER (SOLID OPAQUE SURFACE)                      */}
        {/* ============================================================ */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-[#0c101a] flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-mono text-[10px]">
                ↓
              </kbd>
              <span>{isAr ? "للتنقل" : "Navigate"}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-mono text-[10px]">
                ↵
              </kbd>
              <span>{isAr ? "للاختيار" : "Select"}</span>
            </span>
          </div>
          <span className="font-mono text-[10px]">
            {filteredItems.length} {isAr ? "نتيجة" : "items"}
          </span>
        </div>
      </div>
    </div>
  );

  // Portal to document.body in browser environment to escape all parent stacking contexts
  if (typeof document !== "undefined" && mounted) {
    return createPortal(modalContent, document.body);
  }

  // SSR / testing fallback
  return modalContent;
}
