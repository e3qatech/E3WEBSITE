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
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarConfig = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard", roles: ["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN", "STAFF", "CLIENT"] },
  { label: "B2B Management", icon: Briefcase, href: "/dashboard/b2b/services", badge: 12, roles: ["SUPER_ADMIN", "SALES_ADMIN"], subItems: [
    { label: "Services CMS", href: "/dashboard/b2b/services" },
    { label: "Case Studies", href: "/dashboard/b2b/cases" },
    { label: "Team & Roster", href: "/dashboard/b2b/team" },
    { label: "Partners", href: "/dashboard/b2b/partners" }
  ] },
  { label: "B2C Management", icon: Users, href: "/dashboard/b2c/attractions", badge: 4, roles: ["SUPER_ADMIN", "SUPPORT_ADMIN"], subItems: [
    { label: "Landing Page", href: "/dashboard/b2c/landing" },
    { label: "Attractions", href: "/dashboard/b2c/attractions" },
    { label: "Events Calendar", href: "/dashboard/b2c/calendar" },
    { label: "Discover Page", href: "/dashboard/b2c/discover" },
    { label: "Feedback", href: "/dashboard/b2c/feedback" }
  ] },
  { label: "Operations", icon: Activity, href: "/dashboard/operations/events", roles: ["SUPER_ADMIN"], subItems: [
    { label: "Events", href: "/dashboard/operations/events" },
    { label: "Temporal Rules", href: "/dashboard/operations/temporal-rules" },
    { label: "Broadcast", href: "/dashboard/operations/broadcast" }
  ] },
  { label: "Team CMS", icon: Users, href: "/dashboard/team", roles: ["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN"] },
  { label: "CRM", icon: Database, href: "/dashboard/crm/leads", roles: ["SUPER_ADMIN", "SALES_ADMIN"], subItems: [
    { label: "Leads Funnel", href: "/dashboard/crm/leads" },
    { label: "Clients", href: "/dashboard/crm/clients" },
    { label: "Inquiries", href: "/dashboard/crm/inquiries" },
    { label: "Talent AI", href: "/dashboard/crm/talent" },
    { label: "Subscribers", href: "/dashboard/crm/subscribers" }
  ] },
  { label: "Settings", icon: Settings, href: "/dashboard/settings/general", roles: ["SUPER_ADMIN"], subItems: [
    { label: "General", href: "/dashboard/settings/general" },
    { label: "SEO", href: "/dashboard/settings/seo" },
    { label: "UI", href: "/dashboard/settings/ui" },
    { label: "Users", href: "/dashboard/settings/users" }
  ] },
];

const MotionLink = motion(Link);

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "CLIENT";
  const userInitials = session?.user?.email?.substring(0, 2).toUpperCase() || "US";
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || "User";

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const SidebarContent = () => (
    <>
      <div className="p-4 flex items-center justify-between h-20 border-b border-[var(--border-level-2)] z-10 relative">
        {(!collapsed || mobileOpen) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center glow shadow-lg">
              <span className="text-white font-black text-lg tracking-tighter">E3</span>
            </div>
            <span className="font-black text-[var(--text-primary)] tracking-tight text-lg">Admin</span>
          </motion.div>
        )}
        
        {collapsed && !mobileOpen && (
          <div className="w-full flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center glow shadow-lg">
              <span className="text-white font-black text-lg tracking-tighter">E3</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-full hover:bg-[var(--surface-active)] text-[var(--text-secondary)] transition-all absolute -end-3 top-7 bg-[var(--bg-level-1)] border border-[var(--border-level-2)] shadow-md hover:shadow-lg z-50 hover:scale-110"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2 hide-scrollbar z-10 relative">
        {sidebarConfig.filter(item => item.roles.includes(userRole)).map((item) => {
          const isBaseActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isSubItemActive = item.subItems ? item.subItems.some(sub => pathname === sub.href || pathname.startsWith(`${sub.href}/`)) : false;
          const isActive = isBaseActive || isSubItemActive;
          return (
            <div key={item.href} className="flex flex-col relative z-10">
              <MotionLink
                href={item.href}
                whileHover={!isActive ? { x: 4 } : {}}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all group overflow-hidden",
                  isActive 
                    ? "glass bg-[var(--surface-selected)] border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(0,0,0,0.05)] text-[var(--color-primary)]" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] border border-transparent",
                  collapsed && !mobileOpen ? "justify-center px-0" : ""
                )}
                title={collapsed && !mobileOpen ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-tab"
                    className="absolute start-0 top-2 bottom-2 w-1.5 bg-[var(--color-primary)] rounded-e-md glow"
                  />
                )}
                
                <item.icon size={20} className={cn("shrink-0 relative z-10", isActive ? "text-[var(--color-primary)]" : "")} />
                
                {(!collapsed || mobileOpen) && (
                  <span className={cn(
                    "whitespace-nowrap flex-1 relative z-10 transition-all",
                    isActive ? "font-bold" : "font-medium"
                  )}>{item.label}</span>
                )}

                {(!collapsed || mobileOpen) && item.badge && (
                  <span className="relative z-10 flex items-center justify-center px-2 h-5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-black shadow-md">
                    {item.badge}
                  </span>
                )}
                
                {collapsed && !mobileOpen && item.badge && (
                  <span className="absolute top-2 end-2 w-2.5 h-2.5 border-2 border-[var(--bg-level-1)] rounded-full bg-[var(--color-primary)] shadow-sm" />
                )}
              </MotionLink>
              
              <AnimatePresence>
                {isActive && (!collapsed || mobileOpen) && (item as any).subItems && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-1 mt-2 ps-9 pe-2 overflow-hidden"
                  >
                    {(item as any).subItems.map((sub: any) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <MotionLink
                          key={sub.href}
                          href={sub.href}
                          whileHover={!isSubActive ? { x: 2 } : {}}
                          className={cn(
                            "text-sm py-2 px-3 rounded-lg transition-colors relative flex items-center",
                            isSubActive 
                              ? "bg-[var(--surface-active)] text-[var(--color-primary)] font-bold shadow-inner" 
                              : "text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] font-medium"
                          )}
                        >
                          {isSubActive && <span className="absolute start-0 top-2.5 bottom-2.5 w-1 bg-[var(--color-primary)]/60 rounded-e-md" />}
                          {sub.label}
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

      <div className="p-4 border-t border-[var(--border-level-2)] flex flex-col gap-4 z-10 relative bg-[var(--bg-level-1)]">
        {(!collapsed || mobileOpen) && (
          <div className="flex items-center gap-3 glass bg-[var(--surface-active)] p-3 rounded-2xl border-gradient">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] text-white flex items-center justify-center shrink-0 shadow-md font-bold">
              {userInitials}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-black text-[var(--text-primary)] truncate tracking-tight">{userName}</span>
              <span className="text-xs text-[var(--text-tertiary)] truncate font-medium">{userRole.replace('_', ' ')}</span>
            </div>
          </div>
        )}
        
        {collapsed && !mobileOpen && (
          <div className="w-full flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] text-white flex items-center justify-center shadow-md font-bold" title={userName}>
              {userInitials}
            </div>
          </div>
        )}
        
        <MotionLink 
          href="#"
          onClick={(e) => { e.preventDefault(); signOut({ callbackUrl: "/auth/login" }) }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-[var(--color-error)] hover:bg-[#EF444415] rounded-xl transition-colors border border-transparent hover:border-[var(--color-error)]/20",
            collapsed && !mobileOpen ? "justify-center px-0" : ""
          )} 
          title={collapsed && !mobileOpen ? "Logout" : undefined}
        >
          <LogOut size={18} />
          {(!collapsed || mobileOpen) && <span>Logout</span>}
        </MotionLink>
      </div>
    </>
  );

  if (!isClient) return null;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 start-0 end-0 h-16 glass z-30 flex items-center justify-between px-4 border-b border-[var(--border-level-2)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center glow">
            <span className="text-white font-black text-sm tracking-tighter">E3</span>
          </div>
          <span className="font-black text-[var(--text-primary)] tracking-tight">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 end-2.5 w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse-glow" />
          </button>
          <button 
            onClick={() => setMobileOpen(true)}
            className="p-2 text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-full transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col fixed start-0 top-0 bottom-0 bg-[var(--bg-level-1)] noise-bg border-e border-[var(--border-level-2)] z-40 overflow-hidden shadow-[2px_0_20px_rgba(0,0,0,0.02)]"
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
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed start-0 top-0 bottom-0 w-[280px] bg-[var(--bg-level-1)] noise-bg z-50 flex flex-col md:hidden shadow-2xl border-e border-[var(--border-level-2)]"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      
      {/* Spacer for desktop layout */}
      <div className={cn("hidden md:block shrink-0 transition-all duration-300", collapsed ? "w-[80px]" : "w-[280px]")} />
    </>
  );
}
