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
  LogOut,
  FileText,
  Star,
  Users2,
  ShieldCheck,
  Sliders
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminTheme } from "./AdminThemeProvider";
import { AdminStatusBadge } from "./AdminStatusBadge";
import { useMounted } from "@/hooks/useMounted";
import { E3Logo } from "@/components/shared/E3Logo";

// Updated configuration mapping 17 domain modules into refined logical buckets
const sidebarConfig = [
  { label: "Command Center", icon: LayoutDashboard, href: "/dashboard", roles: ["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN", "STAFF", "CLIENT"] },
  { label: "Auth Control & RBAC", icon: ShieldCheck, href: "/dashboard/crm/users", badge: "RBAC", roles: ["SUPER_ADMIN"], subItems: [
    { label: "Users & Permissions", href: "/dashboard/crm/users" },
    { label: "Client Memberships", href: "/dashboard/crm/clients" },
    { label: "Security & Sessions", href: "/dashboard/settings/users" }
  ] },
  { label: "Gateway Customization", icon: Sliders, href: "/dashboard/settings/gateway", badge: "CMS", roles: ["SUPER_ADMIN"], subItems: [
    { label: "Gateway Editor (EN/AR)", href: "/dashboard/settings/gateway" },
    { label: "Global Settings", href: "/dashboard/settings/general" },
    { label: "SEO & Meta Settings", href: "/dashboard/settings/seo" }
  ] },
  { label: "B2B Content", icon: Briefcase, href: "/dashboard/b2b/services", badge: 3, roles: ["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN"], subItems: [
    { label: "Service Manager", href: "/dashboard/b2b/services" },
    { label: "Case Studies", href: "/dashboard/b2b/cases" },
    { label: "Team Scheduling", href: "/dashboard/b2b/team" },
    { label: "Clients CMS", href: "/dashboard/b2b/clients" },
    { label: "Attractions", href: "/dashboard/b2b/attractions" }
  ] },
  { label: "B2B Pages", icon: FileText, href: "/dashboard/b2b/home", roles: ["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN"], subItems: [
    { label: "Homepage Editor", href: "/dashboard/b2b/home" },
    { label: "About Us Editor", href: "/dashboard/b2b/about" },
    { label: "Contact Editor", href: "/dashboard/b2b/contact" },
    { label: "Services Page", href: "/dashboard/b2b/services-page" },
    { label: "Cases Page", href: "/dashboard/b2b/cases-page" },
    { label: "Client Page Editor", href: "/dashboard/b2b/clients-page" },
    { label: "FAQs Editor", href: "/dashboard/b2b/faqs" },
    { label: "Feedback Form", href: "/dashboard/b2b/feedback" }
  ] },
  { label: "B2C Content", icon: Users2, href: "/dashboard/b2c/attractions", badge: 4, roles: ["SUPER_ADMIN", "SUPPORT_ADMIN"], subItems: [
    { label: "Attractions", href: "/dashboard/b2c/attractions" },
    { label: "Calendar", href: "/dashboard/b2c/calendar" },
    { label: "Contact", href: "/dashboard/b2c/contact" }
  ] },
  { label: "B2C Pages", icon: Star, href: "/dashboard/b2c/landing", roles: ["SUPER_ADMIN", "SUPPORT_ADMIN"], subItems: [
    { label: "Landing Editor", href: "/dashboard/b2c/landing" },
    { label: "Pulse Orbit CMS", href: "/dashboard/b2c/pulse-orbit" },
    { label: "Discover Editor", href: "/dashboard/b2c/discover" }
  ] },
  { label: "Global Media", icon: Database, href: "/dashboard/cms/media", roles: ["SUPER_ADMIN", "STAFF", "SALES_ADMIN"], subItems: [
    { label: "Media Library", href: "/dashboard/cms/media" },
    { label: "CMS Pages", href: "/dashboard/cms/pages" }
  ] },
  { label: "HR & Careers", icon: Briefcase, href: "/dashboard/team", roles: ["SUPER_ADMIN", "STAFF", "SALES_ADMIN", "SUPPORT_ADMIN"], subItems: [
    { label: "Team Profiles", href: "/dashboard/team" },
    { label: "Job Listings", href: "/dashboard/b2b/careers" },
    { label: "Applications", href: "/dashboard/careers/applications" }
  ] },
  { label: "CRM & Sales", icon: Users, href: "/dashboard/crm/leads", roles: ["SUPER_ADMIN", "SALES_ADMIN"], subItems: [
    { label: "Sales Pipeline", href: "/dashboard/crm/leads" },
    { label: "Client Directory", href: "/dashboard/crm/clients" },
    { label: "Users & Roles", href: "/dashboard/crm/users" },
    { label: "Inquiries", href: "/dashboard/crm/inquiries" },
    { label: "Talent AI Parser", href: "/dashboard/crm/talent" },
    { label: "Subscribers", href: "/dashboard/crm/subscribers" }
  ] },
  { label: "Operations", icon: Activity, href: "/dashboard/operations/events", roles: ["SUPER_ADMIN"], subItems: [
    { label: "Hardware Status", href: "/dashboard/operations/events" },
    { label: "Recap Engine", href: "/dashboard/operations/recap" },
    { label: "Catalog Generator", href: "/dashboard/operations/catalog" },
    { label: "Rules & Sync", href: "/dashboard/operations/temporal-rules" },
    { label: "Broadcasts", href: "/dashboard/operations/broadcast" }
  ] },
  { label: "Settings", icon: Settings, href: "/dashboard/settings/general", roles: ["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN"], subItems: [
    { label: "Auth Control & RBAC", href: "/dashboard/crm/users" },
    { label: "Gateway Customization", href: "/dashboard/settings/gateway" },
    { label: "Pulse Hub", href: "/dashboard/settings/pulse-orbit" },
    { label: "Global General", href: "/dashboard/settings/general" },
    { label: "Users & Roles", href: "/dashboard/settings/users" },
    { label: "Workflow Approvals", href: "/dashboard/settings/approvals" },
    { label: "SEO & Meta Settings", href: "/dashboard/settings/seo" }
  ] },
];

const MotionLink = motion(Link);

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({
    Settings: true, // Default Settings dropdown to open so Auth Control, Gateway & Pulse Hub are visible
  });

  const isClient = useMounted();
  const { data: session } = useSession();
  const {} = useAdminTheme();
  
  const userRole = (session?.user as any)?.role || "SUPER_ADMIN"; // Default to Super Admin for command center view if no session
  const userInitials = session?.user?.email?.substring(0, 2).toUpperCase() || "SU";
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || "System Admin";

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };
  
  const sidebarContent = (
    <>
      <div className="p-4 flex items-center justify-between h-16 border-b border-border-default z-10 relative shrink-0">
        {(!collapsed || mobileOpen) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 w-full"
          >
            <E3Logo isLight={false} size="sm" showText={true} />
            
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1 rounded-md hover:bg-surface-active text-text-secondary transition-all shrink-0 ms-auto"
            >
              <ChevronLeft size={16} className="icon-directional" />
            </button>
          </motion.div>
        )}
        
        {collapsed && !mobileOpen && (
          <div className="w-full flex justify-center flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
              <span className="text-white font-black text-sm tracking-tighter">E3</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 hide-scrollbar z-10 relative">
        {sidebarConfig.filter(item => item.roles.includes(userRole)).map((item) => {
          const isBaseActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isSubItemActive = item.subItems ? item.subItems.some(sub => pathname === sub.href || pathname.startsWith(`${sub.href}/`)) : false;
          const isActive = isBaseActive || isSubItemActive;
          const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
          const isExpanded = openSubMenus[item.label] ?? isActive;

          return (
            <div key={item.href} className="flex flex-col relative z-10">
              <div className="flex items-center justify-between">
                <MotionLink
                  href={item.href}
                  whileHover={!isActive ? { x: 2 } : {}}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group flex-1",
                    isActive 
                      ? "bg-surface-selected text-accent font-semibold shadow-sm" 
                      : "text-text-secondary hover:bg-surface-hover hover:text-text-primary font-medium",
                    collapsed && !mobileOpen ? "justify-center px-0" : ""
                  )}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-tab"
                      className="absolute start-0 top-1.5 bottom-1.5 w-[3px] bg-accent rounded-r-md"
                    />
                  )}
                  
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn("shrink-0 relative z-10 transition-colors", isActive ? "text-accent" : "")} />
                  
                  {(!collapsed || mobileOpen) && (
                    <span className="whitespace-nowrap flex-1 relative z-10 truncate text-sm">
                      {item.label}
                    </span>
                  )}

                  {(!collapsed || mobileOpen) && item.badge && (
                    <AdminStatusBadge variant="info" size="sm" dot={false} className="h-5 px-1.5 rounded text-[10px]">
                      {item.badge}
                    </AdminStatusBadge>
                  )}
                </MotionLink>

                {hasSubItems && (!collapsed || mobileOpen) && (
                  <button
                    type="button"
                    onClick={() => toggleSubMenu(item.label)}
                    className="p-2 text-slate-400 hover:text-white transition-transform cursor-pointer"
                    aria-label={`Toggle ${item.label} sub-items`}
                  >
                    <ChevronLeft
                      size={14}
                      className={cn(
                        "transition-transform duration-200",
                        isExpanded ? "-rotate-90" : "rotate-0"
                      )}
                    />
                  </button>
                )}
              </div>
              
              <AnimatePresence>
                {hasSubItems && isExpanded && (!collapsed || mobileOpen) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col mt-1 ps-8 pe-2 overflow-hidden border-s border-border-default/50 ms-5 gap-0.5"
                  >
                    {(item as any).subItems.map((sub: any) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <MotionLink
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            "text-[13px] py-1.5 px-3 rounded-md transition-all duration-200 relative flex items-center group/sub",
                            isSubActive 
                              ? "text-accent font-medium bg-surface-selected/50" 
                              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                          )}
                        >
                          {isSubActive && <span className="absolute -start-3 w-1.5 h-1.5 rounded-full bg-accent" />}
                          {!isSubActive && <span className="absolute -start-3 w-1.5 h-1.5 rounded-full bg-border-strong opacity-0 group-hover/sub:opacity-100 transition-opacity" />}
                          <span className="truncate">{sub.label}</span>
                        </MotionLink>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-border-default flex flex-col gap-2 z-10 relative bg-bg-level-1 shrink-0">
        {(!collapsed || mobileOpen) && (
          <div className="flex items-center gap-3 bg-surface-active p-2 rounded-lg border border-border-default">
            <div className="w-8 h-8 rounded-md bg-accent text-white flex items-center justify-center shrink-0 font-bold text-xs">
              {userInitials}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-bold text-text-primary truncate">{userName}</span>
              <span className="text-[10px] text-text-tertiary truncate uppercase font-medium">{userRole.replace('_', ' ')}</span>
            </div>
          </div>
        )}
        
        {collapsed && !mobileOpen && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-md bg-accent text-white flex items-center justify-center font-bold text-xs cursor-pointer" title={userName}>
              {userInitials}
            </div>
          </div>
        )}
        
        <MotionLink 
          href="#"
          onClick={(e) => { e.preventDefault(); signOut({ callbackUrl: "/auth/login" }) }}
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-md transition-colors",
            collapsed && !mobileOpen ? "justify-center px-0" : ""
          )} 
          title={collapsed && !mobileOpen ? "Logout" : undefined}
        >
          <LogOut size={16} className="icon-directional" />
          {(!collapsed || mobileOpen) && <span>Logout</span>}
        </MotionLink>
      </div>
    </>
  );

  if (!isClient) return null;

  return (
    <>
      {/* Mobile Top Bar Area Placeholder for spacing - actual mobile bar should be in TopBar.tsx, but sidebar handles the drawer overlay */}
      
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col h-full bg-surface-default border-e border-border-default z-40 overflow-hidden"
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
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 start-0 w-[260px] bg-surface-default shadow-xl z-50 md:hidden flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      
      {/* Spacer is not needed anymore as we use standard flex layouts in layout.tsx */}
    </>
  );
}
