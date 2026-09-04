"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Activity,
  Database,
  Settings,
  ChevronLeft,
  ChevronDown,
  LogOut,
  FileText,
  Star,
  Radio,
  Search,
  X,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminTheme } from "./AdminThemeProvider";
import { useLocale } from "@/components/layout/LocaleProvider";
import { E3Logo } from "@/components/shared/E3Logo";
import { hasPermission } from "@/lib/permissions";

interface NavSubItem {
  label: string;
  labelAr?: string;
  href: string;
  capability?: string;
  roles?: string[];
  badge?: string;
}

interface NavGroupItem {
  id: string;
  category: "all" | "b2c" | "b2b" | "ops" | "settings";
  label: string;
  labelAr?: string;
  icon: any;
  href: string;
  roles?: string[];
  capability?: string;
  badge?: string | number;
  subItems?: NavSubItem[];
}

// Scannable, user-friendly navigation configuration
const sidebarConfig: NavGroupItem[] = [
  {
    id: "command-center",
    category: "all",
    label: "Command Center",
    labelAr: "مركز القيادة",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: [
      "SUPER_ADMIN",
      "SALES_ADMIN",
      "SUPPORT_ADMIN",
      "B2C_ADMIN",
      "B2B_ADMIN",
      "HR_ADMIN",
      "OPERATIONS_ADMIN",
      "EVENTS_ADMIN",
      "EVENTS_TEAM",
      "STAFF",
      "CLIENT",
    ],
  },
  {
    id: "events-packages",
    category: "b2c",
    label: "Events & Packages",
    labelAr: "إدارة الفعاليات والباقات",
    icon: Star,
    href: "/dashboard/b2c/packages",
    roles: ["SUPER_ADMIN", "SUPPORT_ADMIN", "B2C_ADMIN", "EVENTS_ADMIN", "EVENTS_TEAM"],
    capability: "b2c.packages.manage",
    subItems: [
      { label: "Packages & Birthday CMS", labelAr: "دليل الباقات وأعياد الميلاد", href: "/dashboard/b2c/packages", capability: "b2c.packages.manage" },
      { label: "Package Leads & Inquiries", labelAr: "طلبات باقات الأفراد", href: "/dashboard/leads/packages", capability: "crm.leads.manage" },
    ],
  },
  {
    id: "b2c-pages",
    category: "b2c",
    label: "B2C Pages",
    labelAr: "صفحات B2C (الفعاليات)",
    icon: FileText,
    href: "/dashboard/b2c/landing",
    roles: ["SUPER_ADMIN", "SUPPORT_ADMIN", "B2C_ADMIN"],
    capability: "b2c.content.read",
    subItems: [
      { label: "Landing Page", labelAr: "الصفحة الرئيسية (B2C)", href: "/dashboard/b2c/landing", capability: "b2c.content.write" },
      { label: "Discover Universe", labelAr: "صفحة الاستكشاف", href: "/dashboard/b2c/discover", capability: "b2c.content.write" },
      { label: "Attractions Showcase", labelAr: "صفحة الوجهات والألعاب", href: "/dashboard/b2c/attractions-page", capability: "b2c.content.write" },
      { label: "Packages & Passes", labelAr: "صفحة الباقات والتذاكر", href: "/dashboard/b2c/packages-page", capability: "b2c.content.write" },
      { label: "Calendar & Events", labelAr: "صفحة جدول الفعاليات", href: "/dashboard/b2c/calendar-page", capability: "b2c.content.write" },
      { label: "Contact & Support", labelAr: "صفحة التواصل وخدمة الزوار", href: "/dashboard/b2c/contact", capability: "b2c.content.write" },
    ],
  },
  {
    id: "b2c-content",
    category: "b2c",
    label: "B2C Attractions & Media",
    labelAr: "محتوى الألعاب والوجهات",
    icon: Star,
    href: "/dashboard/b2c/attractions",
    roles: ["SUPER_ADMIN", "SUPPORT_ADMIN", "B2C_ADMIN", "EVENTS_ADMIN", "EVENTS_TEAM"],
    capability: "b2c.content.read",
    subItems: [
      { label: "Attractions Catalog", labelAr: "دليل الألعاب والوجهات", href: "/dashboard/b2c/attractions", capability: "b2c.attractions.manage" },
      { label: "Brand IP & Worlds", labelAr: "العوالم الترفيهية وحقوق الملكية", href: "/dashboard/brands", capability: "b2c.content.read" },
      { label: "Tickets & VIP Passes", labelAr: "الباقات وتذاكر VIP", href: "/dashboard/b2c/packages", capability: "b2c.packages.manage" },
      { label: "Location & Qatar GIS", labelAr: "المواقع والخرائط التفاعلية", href: "/dashboard/b2c/locations", capability: "b2c.content.read" },
      { label: "Story Discovery Stream", labelAr: "مسار الاستكشاف القصصي", href: "/dashboard/b2c/content/story-discovery", capability: "b2c.content.write" },
      { label: "Pulse Orbit (B2C)", labelAr: "محطة نبض الفعاليات (B2C)", href: "/dashboard/b2c/pulse-orbit", capability: "b2c.content.write" },
      { label: "Insights & Press Releases", labelAr: "الأخبار والمقالات الترفيهية", href: "/dashboard/insights", capability: "b2c.content.write" },
      { label: "Everlasting Memories", labelAr: "معرض الذكريات الخالدة", href: "/dashboard/b2c/content/memories", capability: "b2c.content.write" },
      { label: "Visitor Feedback & QA", labelAr: "تقييمات وآراء الزوار", href: "/dashboard/crm/inquiries", capability: "b2c.feedback.manage" },
    ],
  },
  {
    id: "b2b-pages",
    category: "b2b",
    label: "B2B Pages",
    labelAr: "صفحات B2B (الشركات)",
    icon: Building2,
    href: "/dashboard/b2b/home",
    roles: ["SUPER_ADMIN", "SALES_ADMIN", "B2B_ADMIN"],
    capability: "b2b.content.read",
    subItems: [
      { label: "Enterprise Homepage", labelAr: "الصفحة الرئيسية للشركات", href: "/dashboard/b2b/home", capability: "b2b.content.write" },
      { label: "Discover E3 Page", labelAr: "صفحة استكشف إي ثري", href: "/dashboard/b2b/discover", capability: "b2b.content.write" },
      { label: "Services & Solutions", labelAr: "صفحة الخدمات والحلول", href: "/dashboard/b2b/services-page", capability: "b2b.content.write" },
      { label: "Case Studies Portfolio", labelAr: "صفحة دراسات الحالة والمشاريع", href: "/dashboard/b2b/cases-page", capability: "b2b.content.write" },
      { label: "About E3 Enterprise", labelAr: "صفحة عن الشركة والمسيرة", href: "/dashboard/b2b/about", capability: "b2b.content.write" },
      { label: "Executive Leadership", labelAr: "صفحة القيادة التنفيذية", href: "/dashboard/b2b/leadership", capability: "b2b.content.write" },
      { label: "Careers & Talent", labelAr: "صفحة التوظيف والوظائف", href: "/dashboard/b2b/careers", capability: "b2b.content.write" },
      { label: "Clients & Strategic Partners", labelAr: "صفحة العملاء والشركاء", href: "/dashboard/b2b/clients-page", capability: "b2b.content.write" },
      { label: "Contact & RFP Intake", labelAr: "صفحة التواصل وطلبات العروض", href: "/dashboard/b2b/contact", capability: "b2b.content.write" },
      { label: "Enterprise FAQs", labelAr: "الأسئلة الشائعة للشركات", href: "/dashboard/b2b/faqs", capability: "b2b.faqs.manage" },
      { label: "Client Feedback Form", labelAr: "نموذج تقييم وملاحظات العملاء", href: "/dashboard/b2b/feedback", capability: "b2b.feedback.manage" },
    ],
  },
  {
    id: "b2b-content",
    category: "b2b",
    label: "B2B Solutions & Cases",
    labelAr: "محتوى الشركات والحلول",
    icon: Briefcase,
    href: "/dashboard/b2b/services",
    roles: ["SUPER_ADMIN", "SALES_ADMIN", "B2B_ADMIN"],
    capability: "b2b.content.read",
    subItems: [
      { label: "Services Directory", labelAr: "دليل الخدمات الهندسية", href: "/dashboard/b2b/services", capability: "b2b.services.manage" },
      { label: "Case Studies Directory", labelAr: "دليل المشاريع والإنجازات", href: "/dashboard/b2b/cases", capability: "b2b.cases.manage" },
      { label: "Clients & Logos", labelAr: "سجل العملاء والشعارات", href: "/dashboard/b2b/clients", capability: "b2b.clients.manage" },
      { label: "Pulse Orbit (B2B)", labelAr: "محطة نبض الشركات (B2B)", href: "/dashboard/b2b/pulse-orbit", capability: "b2b.content.write" },
    ],
  },
  {
    id: "global-media",
    category: "all",
    label: "Global Media & Hub",
    labelAr: "الوسائط والتواصل الاجتماعي",
    icon: Database,
    href: "/dashboard/cms/media",
    roles: ["SUPER_ADMIN", "STAFF", "SALES_ADMIN", "SUPPORT_ADMIN", "B2C_ADMIN", "B2B_ADMIN", "HR_ADMIN", "OPERATIONS_ADMIN", "EVENTS_ADMIN", "EVENTS_TEAM"],
    capability: "media.read",
    subItems: [
      { label: "Media Library & Folders", labelAr: "مكتبة الوسائط والمجلدات", href: "/dashboard/cms/media", capability: "media.read" },
      { label: "Social Media Automation", labelAr: "إدارة وأتمتة التواصل", href: "/dashboard/social-media", capability: "media.read" },
      { label: "CMS Pages Directory", labelAr: "فهرس صفحات النظام", href: "/dashboard/cms/pages", capability: "b2c.content.read" },
    ],
  },
  {
    id: "crm-sales",
    category: "ops",
    label: "CRM, Leads & Talent",
    labelAr: "المبيعات والتوظيف",
    icon: Activity,
    href: "/dashboard/crm/leads",
    roles: ["SUPER_ADMIN", "SALES_ADMIN", "B2B_ADMIN", "HR_ADMIN", "SUPPORT_ADMIN", "B2C_ADMIN", "EVENTS_ADMIN", "EVENTS_TEAM"],
    capability: "crm.leads.manage",
    subItems: [
      { label: "Sales Pipeline & Deals", labelAr: "مسار صفقات المبيعات", href: "/dashboard/crm/leads", capability: "crm.leads.manage" },
      { label: "Package Inquiries", labelAr: "طلبات باقات الأفراد", href: "/dashboard/leads/packages", capability: "crm.leads.manage" },
      { label: "Client Accounts", labelAr: "حسابات الشركات والعملاء", href: "/dashboard/crm/clients", capability: "crm.clients.manage" },
      { label: "Team Directory & HR", labelAr: "فريق العمل والكوادر", href: "/dashboard/team", capability: "hr.team.manage" },
      { label: "Job Postings", labelAr: "إعلانات الوظائف", href: "/dashboard/careers", capability: "hr.jobs.manage" },
      { label: "Job Applications", labelAr: "طلبات التوظيف والمتقدمين", href: "/dashboard/careers/applications", capability: "hr.applications.manage" },
      { label: "Talent AI Parser", labelAr: "محلل السير الذاتية بالذكاء الاصطناعي", href: "/dashboard/crm/talent", capability: "hr.talent.manage" },
      { label: "Newsletter Subscribers", labelAr: "المشتركون في النشرة", href: "/dashboard/crm/subscribers", capability: "crm.subscribers.manage" },
    ],
  },
  {
    id: "operations",
    category: "ops",
    label: "Operations & Rules",
    labelAr: "العمليات والجدولة",
    icon: Radio,
    href: "/dashboard/operations/events",
    roles: ["SUPER_ADMIN", "OPERATIONS_ADMIN"],
    capability: "operations.events.manage",
    subItems: [
      { label: "Schedules & Capacity", labelAr: "جداول المواعيد والسعة", href: "/dashboard/operations/events", capability: "operations.events.manage" },
      { label: "Catalog Generator", labelAr: "مولد الكتالوجات والمطبوعات", href: "/dashboard/operations/catalog", capability: "operations.catalog.manage" },
      { label: "System Broadcasts", labelAr: "البث والإشعارات المباشرة", href: "/dashboard/operations/broadcast", capability: "operations.broadcast.manage" },
    ],
  },
  {
    id: "settings",
    category: "settings",
    label: "System Settings",
    labelAr: "إعدادات النظام والتحكم",
    icon: Settings,
    href: "/dashboard/settings/general",
    roles: ["SUPER_ADMIN"],
    capability: "settings.general.manage",
    subItems: [
      { label: "Global General", labelAr: "الإعدادات العامة للشركة", href: "/dashboard/settings/general", capability: "settings.general.manage" },
      { label: "Global Footers (B2B & B2C)", labelAr: "تذييل الصفحات العام", href: "/dashboard/settings/footer", capability: "settings.general.manage" },
      { label: "Gateway Customization", labelAr: "تخصيص بوابة الدخول", href: "/dashboard/settings/gateway", capability: "settings.gateway.manage" },
      { label: "Pulse Orbit Hub", labelAr: "مركز نبض الأنظمة", href: "/dashboard/settings/pulse-orbit", capability: "settings.general.manage" },
      { label: "Users & RBAC Roles", labelAr: "المستخدمون وصلاحيات الأدوار", href: "/dashboard/settings/users", capability: "rbac.manage" },
      { label: "Workflow Approvals", labelAr: "موافقات سير العمل والاعتمادات", href: "/dashboard/settings/approvals", capability: "settings.approvals.manage" },
      { label: "SEO & Meta Settings", labelAr: "تهيئة محركات البحث والميتا", href: "/dashboard/settings/seo", capability: "settings.seo.manage" },
    ],
  },
];

const MotionLink = motion(Link);

export function AdminSidebar() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const currentLocale = pathname.startsWith("/ar") ? "ar" : locale || "en";
  const isAr = currentLocale === "ar";
  const cleanPathname = pathname.replace(/^\/(en|ar)/, "") || "/dashboard";

  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<"all" | "b2c" | "b2b" | "ops" | "settings">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Determine active group based on current pathname
  const initialActiveGroup = React.useMemo(() => {
    const found = sidebarConfig.find(
      (g) =>
        cleanPathname === g.href ||
        (g.subItems && g.subItems.some((s) => cleanPathname === s.href || cleanPathname.startsWith(`${s.href}/`)))
    );
    return found ? found.id : "command-center";
  }, [cleanPathname]);

  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({
    [initialActiveGroup]: true,
  });

  const { data: session } = useSession();
  const { resolvedTheme } = useAdminTheme();

  const rawUserRole = (session?.user as any)?.role || "SUPER_ADMIN";
  const userRole = String(rawUserRole).trim().toUpperCase();
  const userInitials = session?.user?.email?.substring(0, 2).toUpperCase() || "SU";
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "Admin";

  // Role pill color
  const roleBadgeColor = React.useMemo(() => {
    if (userRole.includes("SUPER")) return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    if (userRole.includes("EVENTS")) return "bg-violet-500/20 text-violet-300 border-violet-500/30";
    if (userRole.includes("B2B")) return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    if (userRole.includes("B2C")) return "bg-pink-500/20 text-pink-300 border-pink-500/30";
    return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  }, [userRole]);

  // Listen for mobile sidebar open trigger
  React.useEffect(() => {
    const handleToggleMobile = () => setMobileOpen((prev) => !prev);
    window.addEventListener("e3_toggle_mobile_sidebar", handleToggleMobile);
    return () => window.removeEventListener("e3_toggle_mobile_sidebar", handleToggleMobile);
  }, []);

  // Filter navigation items by role and capability (Deny-by-default)
  const isAuthorized = React.useCallback(
    (itemRoles?: string[], itemCapability?: string) => {
      if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") return true;
      if (itemRoles && itemRoles.includes(userRole)) return true;
      if (itemCapability && hasPermission(userRole, itemCapability)) return true;
      return false;
    },
    [userRole]
  );

  // Filter navigation by category and search query
  const filteredNavigation = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return sidebarConfig
      .map((group) => {
        if (!isAuthorized(group.roles, group.capability)) return null;

        // Domain category filter
        if (activeCategory !== "all" && group.category !== "all" && group.category !== activeCategory) {
          return null;
        }

        const accessibleSubItems = group.subItems
          ? group.subItems.filter((sub) => isAuthorized(sub.roles || group.roles, sub.capability || group.capability))
          : undefined;

        if (group.subItems && accessibleSubItems && accessibleSubItems.length === 0) {
          return null;
        }

        // Search matching
        if (q) {
          const groupTitleEn = group.label.toLowerCase();
          const groupTitleAr = (group.labelAr || "").toLowerCase();
          const matchesGroup = groupTitleEn.includes(q) || groupTitleAr.includes(q);

          const matchingSubItems = accessibleSubItems?.filter((sub) => {
            const subTitleEn = sub.label.toLowerCase();
            const subTitleAr = (sub.labelAr || "").toLowerCase();
            return subTitleEn.includes(q) || subTitleAr.includes(q);
          });

          if (!matchesGroup && (!matchingSubItems || matchingSubItems.length === 0)) {
            return null;
          }

          return {
            ...group,
            subItems: matchingSubItems && matchingSubItems.length > 0 ? matchingSubItems : accessibleSubItems,
          };
        }

        return {
          ...group,
          subItems: accessibleSubItems,
        };
      })
      .filter(Boolean) as NavGroupItem[];
  }, [isAuthorized, activeCategory, searchQuery]);

  const toggleSubMenu = (id: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categories = [
    { id: "all", label: "All", labelAr: "الكل" },
    { id: "b2c", label: "B2C", labelAr: "B2C" },
    { id: "b2b", label: "B2B", labelAr: "B2B" },
    { id: "ops", label: "Ops", labelAr: "العمليات" },
    { id: "settings", label: "Admin", labelAr: "النظام" },
  ];

  const sidebarContent = (
    <>
      {/* Header with Logo and Collapse Button */}
      <div className="p-3.5 flex items-center justify-between h-16 border-b border-[var(--border-level-1)] z-10 relative shrink-0">
        {(!collapsed || mobileOpen) && (
          <div className="flex items-center justify-between w-full">
            <Link href={`/${currentLocale}/dashboard`} className="flex items-center">
              <E3Logo isLight={resolvedTheme === "light"} size="md" showText={false} />
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-xl hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shrink-0 ms-auto cursor-pointer"
              title={isAr ? (collapsed ? "توسيع الشريط" : "طي الشريط") : (collapsed ? "Expand Sidebar" : "Collapse Sidebar")}
              aria-label={isAr ? (collapsed ? "توسيع الشريط" : "طي الشريط") : (collapsed ? "Expand Sidebar" : "Collapse Sidebar")}
            >
              <ChevronLeft size={16} className="rtl:rotate-180" />
            </button>
          </div>
        )}

        {collapsed && !mobileOpen && (
          <div className="w-full flex justify-center flex-col items-center">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-10 h-10 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] flex items-center justify-center hover:border-[var(--color-primary)] transition-all cursor-pointer group"
              title={isAr ? "توسيع الشريط" : "Expand Sidebar"}
            >
              <E3Logo isLight={resolvedTheme === "light"} size="sm" showText={false} />
            </button>
          </div>
        )}
      </div>

      {/* Quick Category Filter Pills & Search Input (Expanded Only) */}
      {(!collapsed || mobileOpen) && (
        <div className="px-3 pt-3 pb-1 border-b border-[var(--border-level-1)] space-y-2.5 shrink-0 bg-[var(--bg-level-1)]/50">
          {/* Realtime Instant Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "بحث سريع في الأقسام..." : "Quick search pages..."}
              className="w-full h-8 ps-8 pe-7 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 p-0.5 bg-[var(--surface-default)] rounded-xl border border-[var(--border-level-1)] overflow-x-auto scrollbar-none">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={cn(
                    "flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer text-center",
                    isSelected
                      ? "bg-[var(--color-primary)] text-white shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                  )}
                >
                  {isAr ? cat.labelAr : cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Links Scroll Container */}
      <div className="flex-1 overflow-y-auto py-2.5 px-2 flex flex-col gap-1 custom-scrollbar z-10 relative">
        {filteredNavigation.length === 0 && (!collapsed || mobileOpen) && (
          <div className="p-4 text-center text-xs text-[var(--text-tertiary)]">
            {isAr ? "لا توجد نتائج مطابقة" : "No matching pages found"}
          </div>
        )}

        {filteredNavigation.map((item) => {
          const isBaseActive =
            cleanPathname === item.href ||
            (item.href !== "/dashboard" && cleanPathname.startsWith(`${item.href}/`));
          const isSubItemActive = item.subItems
            ? item.subItems.some((sub) => cleanPathname === sub.href || cleanPathname.startsWith(`${sub.href}/`))
            : false;
          const isActive = isBaseActive || isSubItemActive;
          const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
          const isExpanded = openSubMenus[item.id] ?? isActive;
          const groupTitle = isAr ? item.labelAr || item.label : item.label;

          return (
            <div key={item.id} className="flex flex-col relative z-10 mb-0.5">
              <div className="flex items-center justify-between group">
                <MotionLink
                  href={`/${currentLocale}${item.href}`}
                  className={cn(
                    "relative flex items-center gap-2.5 px-2.5 h-[38px] rounded-xl transition-all duration-150 group flex-1 select-none",
                    isActive
                      ? "bg-[var(--surface-selected)] text-[var(--color-primary)] font-bold shadow-xs"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] font-medium",
                    collapsed && !mobileOpen ? "justify-center px-0 h-10 w-10 mx-auto" : ""
                  )}
                  title={collapsed && !mobileOpen ? groupTitle : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-tab"
                      className="absolute start-0 top-1.5 bottom-1.5 w-[3px] bg-[var(--color-primary)] rounded-r-md"
                    />
                  )}

                  <item.icon
                    size={17}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]"
                    )}
                  />

                  {(!collapsed || mobileOpen) && (
                    <span className="whitespace-nowrap flex-1 truncate text-xs">
                      {groupTitle}
                    </span>
                  )}

                  {(!collapsed || mobileOpen) && item.badge && (
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {item.badge}
                    </span>
                  )}
                </MotionLink>

                {hasSubItems && (!collapsed || mobileOpen) && (
                  <button
                    type="button"
                    onClick={() => toggleSubMenu(item.id)}
                    className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-transform cursor-pointer"
                    aria-label={`Toggle ${groupTitle} sub-items`}
                  >
                    <ChevronDown
                      size={13}
                      className={cn(
                        "transition-transform duration-200",
                        isExpanded ? "rotate-180" : "rotate-0"
                      )}
                    />
                  </button>
                )}
              </div>

              {/* Subitems Menu */}
              <AnimatePresence>
                {hasSubItems && isExpanded && (!collapsed || mobileOpen) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col mt-0.5 ps-6 pe-1 overflow-hidden border-s border-[var(--border-level-1)] ms-4.5 gap-0.5"
                  >
                    {item.subItems?.map((sub) => {
                      const isSubActive = cleanPathname === sub.href || cleanPathname.startsWith(`${sub.href}/`);
                      const subTitle = isAr ? sub.labelAr || sub.label : sub.label;
                      return (
                        <MotionLink
                          key={sub.href}
                          href={`/${currentLocale}${sub.href}`}
                          className={cn(
                            "text-[11px] py-1.5 px-2.5 rounded-lg transition-all duration-150 relative flex items-center group/sub",
                            isSubActive
                              ? "text-[var(--color-primary)] font-bold bg-[var(--surface-selected)]"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                          )}
                        >
                          {isSubActive && (
                            <span className="absolute -start-[15px] w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                          )}
                          <span className="truncate">{subTitle}</span>
                        </MotionLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* User Footer Profile & Sign Out */}
      <div className="p-2.5 border-t border-[var(--border-level-1)] flex flex-col gap-1.5 z-10 relative bg-[var(--bg-level-1)] shrink-0">
        {(!collapsed || mobileOpen) && (
          <div className="flex items-center gap-2.5 bg-[var(--surface-default)] p-2 rounded-xl border border-[var(--border-level-1)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
              {userInitials}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-bold text-[var(--text-primary)] truncate">{userName}</span>
              <span className={cn("text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase w-fit border", roleBadgeColor)}>
                {userRole.replace("_", " ")}
              </span>
            </div>
          </div>
        )}

        {collapsed && !mobileOpen && (
          <div className="w-full flex justify-center py-1">
            <div
              className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-xs"
              title={`${userName} (${userRole})`}
            >
              {userInitials}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login/admin" })}
          className={cn(
            "flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer w-full",
            collapsed && !mobileOpen ? "justify-center px-0" : ""
          )}
          title={collapsed && !mobileOpen ? (isAr ? "تسجيل الخروج" : "Sign Out") : undefined}
        >
          <LogOut size={14} className="rtl:rotate-180" />
          {(!collapsed || mobileOpen) && <span>{isAr ? "تسجيل الخروج" : "Sign Out"}</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 255 }}
        initial={false}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        className="hidden md:flex flex-col h-full bg-[var(--surface-default)] border-e border-[var(--border-level-1)] z-30 overflow-hidden shrink-0 w-[255px]"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 start-0 w-[270px] bg-[var(--surface-default)] shadow-2xl z-50 md:hidden flex flex-col border-e border-[var(--border-level-1)]"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
