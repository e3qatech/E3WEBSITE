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
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  CheckCircle,
  FileText,
  Star,
  Users2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminTheme } from "./AdminThemeProvider";
import { AdminStatusBadge } from "./AdminStatusBadge";

// Updated configuration mapping 17 domain modules
const sidebarConfig = [
  { label: "Command Center", icon: LayoutDashboard, href: "/dashboard", roles: ["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN", "STAFF", "CLIENT"] },
  { label: "B2B Portal", icon: Briefcase, href: "/dashboard/b2b/services", badge: 3, roles: ["SUPER_ADMIN", "SALES_ADMIN"], subItems: [
    { label: "Homepage Editor", href: "/dashboard/b2b/home" },
    { label: "About Us Editor", href: "/dashboard/b2b/about" },
    { label: "Contact Editor", href: "/dashboard/b2b/contact" },
    { label: "Services Page Editor", href: "/dashboard/b2b/services-page" },
    { label: "Service Manager", href: "/dashboard/b2b/services" },
    { label: "Project Microsites", href: "/dashboard/b2b/cases" },
    { label: "Team & Roster", href: "/dashboard/b2b/team" },
    { label: "Partners CMS", href: "/dashboard/b2b/partners" }
  ] },
  { label: "B2C Hub", icon: Users2, href: "/dashboard/b2c/attractions", badge: 4, roles: ["SUPER_ADMIN", "SUPPORT_ADMIN"], subItems: [
    { label: "Landing Editor", href: "/dashboard/b2c/landing" },
    { label: "Discover Editor", href: "/dashboard/b2c/discover" },
    { label: "Attractions", href: "/dashboard/b2c/attractions" },
    { label: "Calendar", href: "/dashboard/b2c/calendar" },
    { label: "Contact", href: "/dashboard/b2c/contact" }
  ] },
  { label: "Content & Media", icon: FileText, href: "/dashboard/cms/media", roles: ["SUPER_ADMIN", "STAFF", "SALES_ADMIN"], subItems: [
    { label: "Media Library", href: "/dashboard/cms/media" }
  ] },
  { label: "CRM & Pipelines", icon: Database, href: "/dashboard/crm/leads", roles: ["SUPER_ADMIN", "SALES_ADMIN"], subItems: [
    { label: "Sales Pipeline", href: "/dashboard/crm/leads" },
    { label: "Client Directory", href: "/dashboard/crm/clients" },
    { label: "Inquiries", href: "/dashboard/crm/inquiries" },
    { label: "Talent AI Parser", href: "/dashboard/crm/talent" },
    { label: "Subscribers", href: "/dashboard/crm/subscribers" }
  ] },
  { label: "Live Operations", icon: Activity, href: "/dashboard/operations/events", roles: ["SUPER_ADMIN"], subItems: [
    { label: "Hardware Status", href: "/dashboard/operations/events" },
    { label: "Recap Engine", href: "/dashboard/operations/recap" },
    { label: "Catalog Generator", href: "/dashboard/operations/catalog" },
    { label: "Rules & Sync", href: "/dashboard/operations/temporal-rules" },
    { label: "Broadcasts", href: "/dashboard/operations/broadcast" }
  ] },
  { label: "Settings", icon: Settings, href: "/dashboard/settings/general", roles: ["SUPER_ADMIN"], subItems: [
    { label: "Global", href: "/dashboard/settings/general" },
    { label: "Workflow Approvals", href: "/dashboard/settings/approvals" }, // Added for Draft/Review workflow
    { label: "Users & Roles", href: "/dashboard/settings/users" },
    { label: "SEO & Meta", href: "/dashboard/settings/seo" }
  ] },
];

const MotionLink = motion(Link);

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const { data: session } = useSession();
  const { resolvedTheme } = useAdminTheme();
  
  const userRole = (session?.user as any)?.role || "SUPER_ADMIN"; // Default to Super Admin for command center view if no session
  const userInitials = session?.user?.email?.substring(0, 2).toUpperCase() || "SU";
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || "System Admin";

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const SidebarContent = () => (
    <>
      <div className="p-4 flex items-center justify-between h-16 border-b border-border-default z-10 relative shrink-0">
        {(!collapsed || mobileOpen) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 w-full"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm tracking-tighter">E3</span>
            </div>
            <span className="font-bold text-text-primary tracking-tight text-sm flex-1 truncate">Command Center</span>
            
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1 rounded-md hover:bg-surface-active text-text-secondary transition-all shrink-0"
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
          return (
            <div key={item.href} className="flex flex-col relative z-10">
              <MotionLink
                href={item.href}
                whileHover={!isActive ? { x: 2 } : {}}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary font-medium",
                  collapsed && !mobileOpen ? "justify-center px-0" : ""
                )}
                title={collapsed && !mobileOpen ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-tab"
                    className="absolute start-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-e-sm"
                  />
                )}
                
                <item.icon size={18} className={cn("shrink-0 relative z-10", isActive ? "text-primary" : "")} />
                
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
                
                {collapsed && !mobileOpen && item.badge && (
                  <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-info" />
                )}
              </MotionLink>
              
              <AnimatePresence>
                {isActive && (!collapsed || mobileOpen) && (item as any).subItems && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col mt-1 ps-9 pe-2 overflow-hidden border-s border-border-default/50 ms-5"
                  >
                    {(item as any).subItems.map((sub: any) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <MotionLink
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            "text-sm py-2 px-3 rounded-md transition-colors relative flex items-center",
                            isSubActive 
                              ? "text-primary font-semibold" 
                              : "text-text-secondary hover:text-text-primary"
                          )}
                        >
                          {isSubActive && <span className="absolute -start-4 w-1.5 h-1.5 rounded-full bg-primary" />}
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
        <SidebarContent />
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed start-0 top-0 bottom-0 w-[260px] bg-surface-default z-50 flex flex-col md:hidden shadow-2xl border-e border-border-default"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      
      {/* Spacer is not needed anymore as we use standard flex layouts in layout.tsx */}
    </>
  );
}
