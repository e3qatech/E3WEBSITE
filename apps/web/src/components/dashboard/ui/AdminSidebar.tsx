/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Activity, 
  Database, 
  Settings,
  ChevronLeft,
  ChevronDown,
  LogOut,
  FileText,
  Star,
  ShieldCheck,
  Globe,
  Radio,
  Layers,
  Sparkles,
  Sliders,
  Calendar,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminTheme } from "./AdminThemeProvider";
import { useMounted } from "@/hooks/useMounted";
import { E3Logo } from "@/components/shared/E3Logo";
import { hasPermission } from "@/lib/permissions";

interface NavSubItem {
  label: string;
  href: string;
  capability?: string;
  roles?: string[];
}

interface NavGroupItem {
  label: string;
  icon: any;
  href: string;
  roles?: string[];
  capability?: string;
  badge?: string | number;
  subItems?: NavSubItem[];
}

// 10 standard navigation groups mapped with capability and role checks
const sidebarConfig: NavGroupItem[] = [
  {
    label: "Command Center",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: ["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN", "B2C_ADMIN", "B2B_ADMIN", "HR_ADMIN", "OPERATIONS_ADMIN", "STAFF", "CLIENT"],
  },
  {
    label: "B2C Pages",
    icon: FileText,
    href: "/dashboard/b2c/landing",
    roles: ["SUPER_ADMIN", "SUPPORT_ADMIN", "B2C_ADMIN"],
    capability: "b2c.content.read",
    subItems: [
      { label: "Landing Page Editor", href: "/dashboard/b2c/landing", capability: "b2c.content.write" },
      { label: "Discover Page Editor", href: "/dashboard/b2c/discover", capability: "b2c.content.write" },
      { label: "Contact Page Editor", href: "/dashboard/b2c/contact", capability: "b2c.content.write" },
      { label: "Attractions Page Editor", href: "/dashboard/b2c/attractions-page", capability: "b2c.content.write" },
      { label: "Packages Page Editor", href: "/dashboard/b2c/packages-page", capability: "b2c.content.write" },
      { label: "Events & Calendar Editor", href: "/dashboard/b2c/calendar-page", capability: "b2c.content.write" },
    ],
  },
  {
    label: "B2C Content",
    icon: Star,
    href: "/dashboard/b2c/attractions",
    roles: ["SUPER_ADMIN", "SUPPORT_ADMIN", "B2C_ADMIN"],
    capability: "b2c.content.read",
    subItems: [
      { label: "Attractions Roster", href: "/dashboard/b2c/attractions", capability: "b2c.attractions.manage" },
      { label: "Packages & Birthdays", href: "/dashboard/b2c/packages", capability: "b2c.packages.manage" },
      { label: "Events & Calendar", href: "/dashboard/b2c/calendar", capability: "b2c.calendar.manage" },
      { label: "Locations & Map GIS", href: "/dashboard/b2c/locations", capability: "b2c.content.read" },
      { label: "Pulse Orbit (B2C)", href: "/dashboard/b2c/pulse-orbit", capability: "b2c.content.write" },
      { label: "Everlasting Memories", href: "/dashboard/b2c/content/memories", capability: "b2c.content.write" },
      { label: "Visitor Feedback", href: "/dashboard/crm/inquiries", capability: "b2c.feedback.manage" },
    ],
  },
  {
    label: "B2B Pages",
    icon: FileText,
    href: "/dashboard/b2b/home",
    roles: ["SUPER_ADMIN", "SALES_ADMIN", "B2B_ADMIN"],
    capability: "b2b.content.read",
    subItems: [
      { label: "Homepage Editor", href: "/dashboard/b2b/home", capability: "b2b.content.write" },
      { label: "About Us Editor", href: "/dashboard/b2b/about", capability: "b2b.content.write" },
      { label: "Contact & RFP Editor", href: "/dashboard/b2b/contact", capability: "b2b.content.write" },
      { label: "Services Landing Page", href: "/dashboard/b2b/services-page", capability: "b2b.content.write" },
      { label: "Case Studies Page", href: "/dashboard/b2b/cases-page", capability: "b2b.content.write" },
      { label: "Clients Page Editor", href: "/dashboard/b2b/clients-page", capability: "b2b.content.write" },
      { label: "FAQs Editor", href: "/dashboard/b2b/faqs", capability: "b2b.faqs.manage" },
      { label: "Feedback Form Editor", href: "/dashboard/b2b/feedback", capability: "b2b.feedback.manage" },
    ],
  },
  {
    label: "B2B Content",
    icon: Briefcase,
    href: "/dashboard/b2b/services",
    roles: ["SUPER_ADMIN", "SALES_ADMIN", "B2B_ADMIN"],
    capability: "b2b.content.read",
    subItems: [
      { label: "Services Catalog", href: "/dashboard/b2b/services", capability: "b2b.services.manage" },
      { label: "Case Studies Portfolio", href: "/dashboard/b2b/cases", capability: "b2b.cases.manage" },
      { label: "Clients Directory", href: "/dashboard/b2b/clients", capability: "b2b.clients.manage" },
      { label: "Team Page Editor", href: "/dashboard/b2b/team-page", capability: "b2b.content.write" },
      { label: "Pulse Orbit (B2B)", href: "/dashboard/b2b/pulse-orbit", capability: "b2b.content.write" },
    ],
  },
  {
    label: "Global Media",
    icon: Database,
    href: "/dashboard/cms/media",
    roles: ["SUPER_ADMIN", "STAFF", "SALES_ADMIN", "SUPPORT_ADMIN", "B2C_ADMIN", "B2B_ADMIN"],
    capability: "media.read",
    subItems: [
      { label: "Media Library", href: "/dashboard/cms/media", capability: "media.read" },
      { label: "CMS Pages Index", href: "/dashboard/cms/pages", capability: "b2c.content.read" },
    ],
  },
  {
    label: "HR & Careers",
    icon: Users,
    href: "/dashboard/team",
    roles: ["SUPER_ADMIN", "HR_ADMIN", "STAFF"],
    capability: "hr.team.manage",
    subItems: [
      { label: "Team Profiles", href: "/dashboard/team", capability: "hr.team.manage" },
      { label: "Job Listings", href: "/dashboard/careers", capability: "hr.jobs.manage" },
      { label: "Job Applications", href: "/dashboard/careers/applications", capability: "hr.applications.manage" },
      { label: "Talent AI Parser", href: "/dashboard/crm/talent", capability: "hr.talent.manage" },
    ],
  },
  {
    label: "CRM & Sales",
    icon: Activity,
    href: "/dashboard/crm/leads",
    roles: ["SUPER_ADMIN", "SALES_ADMIN", "B2B_ADMIN"],
    capability: "crm.leads.manage",
    subItems: [
      { label: "Sales Pipeline", href: "/dashboard/crm/leads", capability: "crm.leads.manage" },
      { label: "Package Leads", href: "/dashboard/leads/packages", capability: "crm.leads.manage" },
      { label: "Client Accounts", href: "/dashboard/crm/clients", capability: "crm.clients.manage" },
      { label: "Inquiries & Inbound", href: "/dashboard/crm/inquiries", capability: "crm.inquiries.manage" },
      { label: "Newsletter Subscribers", href: "/dashboard/crm/subscribers", capability: "crm.subscribers.manage" },
    ],
  },
  {
    label: "Operations",
    icon: Radio,
    href: "/dashboard/operations/events",
    roles: ["SUPER_ADMIN", "OPERATIONS_ADMIN"],
    capability: "operations.events.manage",
    subItems: [
      { label: "Hardware & Capacity", href: "/dashboard/operations/events", capability: "operations.events.manage" },
      { label: "Recap Engine", href: "/dashboard/operations/recap", capability: "operations.recap.manage" },
      { label: "Catalog Generator", href: "/dashboard/operations/catalog", capability: "operations.catalog.manage" },
      { label: "Rules & Sync", href: "/dashboard/operations/temporal-rules", capability: "operations.rules.manage" },
      { label: "System Broadcasts", href: "/dashboard/operations/broadcast", capability: "operations.broadcast.manage" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings/general",
    roles: ["SUPER_ADMIN"],
    capability: "settings.general.manage",
    subItems: [
      { label: "Global General", href: "/dashboard/settings/general", capability: "settings.general.manage" },
      { label: "Gateway Customization", href: "/dashboard/settings/gateway", capability: "settings.gateway.manage" },
      { label: "Pulse Orbit Hub", href: "/dashboard/settings/pulse-orbit", capability: "settings.general.manage" },
      { label: "Users & RBAC Roles", href: "/dashboard/settings/users", capability: "rbac.manage" },
      { label: "Workflow Approvals", href: "/dashboard/settings/approvals", capability: "settings.approvals.manage" },
      { label: "SEO & Meta Settings", href: "/dashboard/settings/seo", capability: "settings.seo.manage" },
    ],
  },
];

const MotionLink = motion(Link);

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({
    "B2C Pages": true,
    "B2B Pages": true,
    Settings: true,
  });

  const isClient = useMounted();
  const { data: session } = useSession();
  const { resolvedTheme } = useAdminTheme();

  const rawUserRole = (session?.user as any)?.role || "SUPER_ADMIN";
  const userRole = String(rawUserRole).trim().toUpperCase();
  const userInitials = session?.user?.email?.substring(0, 2).toUpperCase() || "SU";
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "System Admin";

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

      // 1. Role list check
      if (itemRoles && itemRoles.includes(userRole)) return true;

      // 2. Capability check
      if (itemCapability && hasPermission(userRole, itemCapability)) return true;

      return false;
    },
    [userRole]
  );

  const filteredNavigation = React.useMemo(() => {
    return sidebarConfig
      .map((group) => {
        if (!isAuthorized(group.roles, group.capability)) return null;

        const accessibleSubItems = group.subItems
          ? group.subItems.filter((sub) => isAuthorized(sub.roles || group.roles, sub.capability || group.capability))
          : undefined;

        // If group has subitems array but 0 are accessible, hide the group
        if (group.subItems && accessibleSubItems && accessibleSubItems.length === 0) {
          return null;
        }

        return {
          ...group,
          subItems: accessibleSubItems,
        };
      })
      .filter(Boolean) as NavGroupItem[];
  }, [isAuthorized]);

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const sidebarContent = (
    <>
      {/* Header with Logo and Collapse Button */}
      <div className="p-4 flex items-center justify-between h-16 border-b border-[var(--border-level-1)] z-10 relative shrink-0">
        {(!collapsed || mobileOpen) && (
          <div className="flex items-center justify-between w-full">
            <Link href="/dashboard" className="flex items-center">
              <E3Logo isLight={resolvedTheme === "light"} size="md" showText={false} />
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-xl hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shrink-0 ms-auto cursor-pointer"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
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
              title="Expand Sidebar"
            >
              <E3Logo isLight={resolvedTheme === "light"} size="sm" showText={false} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Links Scroll Container */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 flex flex-col gap-1 custom-scrollbar z-10 relative">
        {filteredNavigation.map((item) => {
          const isBaseActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          const isSubItemActive = item.subItems
            ? item.subItems.some((sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`))
            : false;
          const isActive = isBaseActive || isSubItemActive;
          const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
          const isExpanded = openSubMenus[item.label] ?? isActive;

          return (
            <div key={item.label} className="flex flex-col relative z-10">
              <div className="flex items-center justify-between group">
                <MotionLink
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3 h-[42px] rounded-xl transition-all duration-200 group flex-1 select-none",
                    isActive
                      ? "bg-[var(--surface-selected)] text-[var(--color-primary)] font-bold shadow-sm"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] font-medium",
                    collapsed && !mobileOpen ? "justify-center px-0" : ""
                  )}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-tab"
                      className="absolute start-0 top-2 bottom-2 w-[3px] bg-[var(--color-primary)] rounded-r-md"
                    />
                  )}

                  <item.icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive ? "text-[var(--color-primary)]" : "text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]"
                    )}
                  />

                  {(!collapsed || mobileOpen) && (
                    <span className="whitespace-nowrap flex-1 truncate text-xs">
                      {item.label}
                    </span>
                  )}

                  {(!collapsed || mobileOpen) && item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {item.badge}
                    </span>
                  )}
                </MotionLink>

                {hasSubItems && (!collapsed || mobileOpen) && (
                  <button
                    type="button"
                    onClick={() => toggleSubMenu(item.label)}
                    className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-transform cursor-pointer"
                    aria-label={`Toggle ${item.label} sub-items`}
                  >
                    <ChevronDown
                      size={14}
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
                    className="flex flex-col mt-0.5 ps-7 pe-1 overflow-hidden border-s border-[var(--border-level-1)] ms-5 gap-0.5"
                  >
                    {item.subItems?.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <MotionLink
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            "text-xs py-1.5 px-3 rounded-lg transition-all duration-150 relative flex items-center group/sub",
                            isSubActive
                              ? "text-[var(--color-primary)] font-bold bg-[var(--surface-selected)]"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                          )}
                        >
                          {isSubActive && (
                            <span className="absolute -start-[17px] w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                          )}
                          <span className="truncate">{sub.label}</span>
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
      <div className="p-3 border-t border-[var(--border-level-1)] flex flex-col gap-2 z-10 relative bg-[var(--bg-level-1)] shrink-0">
        {(!collapsed || mobileOpen) && (
          <div className="flex items-center gap-3 bg-[var(--surface-default)] p-2.5 rounded-xl border border-[var(--border-level-1)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-sm">
              {userInitials}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-bold text-[var(--text-primary)] truncate">{userName}</span>
              <span className="text-[10px] text-purple-400 truncate uppercase font-mono font-semibold">
                {userRole.replace("_", " ")}
              </span>
            </div>
          </div>
        )}

        {collapsed && !mobileOpen && (
          <div className="w-full flex justify-center">
            <div
              className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-sm"
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
            "flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer w-full",
            collapsed && !mobileOpen ? "justify-center px-0" : ""
          )}
          title={collapsed && !mobileOpen ? "Sign Out" : undefined}
        >
          <LogOut size={15} className="rtl:rotate-180" />
          {(!collapsed || mobileOpen) && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  if (!isClient) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 74 : 260 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="hidden md:flex flex-col h-full bg-[var(--surface-default)] border-e border-[var(--border-level-1)] z-30 overflow-hidden"
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
