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
  { label: "B2B Management", icon: Briefcase, href: "/dashboard/b2b", badge: 12, roles: ["SUPER_ADMIN", "SALES_ADMIN"] },
  { label: "B2C Management", icon: Users, href: "/dashboard/b2c", badge: 4, roles: ["SUPER_ADMIN", "SUPPORT_ADMIN"] },
  { label: "Operations", icon: Activity, href: "/dashboard/operations", roles: ["SUPER_ADMIN"] },
  { label: "CRM", icon: Database, href: "/dashboard/crm", roles: ["SUPER_ADMIN", "SALES_ADMIN"] },
  { label: "Settings", icon: Settings, href: "/dashboard/settings", roles: ["SUPER_ADMIN"] },
];

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
      <div className="p-4 flex items-center justify-between h-20 border-b border-[var(--border-level-2)]">
        {(!collapsed || mobileOpen) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-sg bg-[var(--color-primary)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">E3</span>
            </div>
            <span className="font-bold text-[var(--text-primary)]">Admin</span>
          </motion.div>
        )}
        
        {collapsed && !mobileOpen && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-sg bg-[var(--color-primary)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">E3</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] transition-colors absolute -end-3 top-6 bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-sm z-50"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2 hide-scrollbar">
        {sidebarConfig.filter(item => item.roles.includes(userRole)).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-sg transition-all group",
                isActive 
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" 
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
                collapsed && !mobileOpen ? "justify-center px-0" : ""
              )}
              title={collapsed && !mobileOpen ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="active-sidebar-tab"
                  className="absolute start-0 top-1.5 bottom-1.5 w-1 bg-[var(--color-primary)] rounded-e-md"
                />
              )}
              
              <item.icon size={20} className={cn("shrink-0", isActive ? "text-[var(--color-primary)]" : "")} />
              
              {(!collapsed || mobileOpen) && (
                <span className="font-medium text-sm whitespace-nowrap flex-1">{item.label}</span>
              )}

              {(!collapsed || mobileOpen) && item.badge && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold">
                  {item.badge}
                </span>
              )}
              
              {collapsed && !mobileOpen && item.badge && (
                <span className="absolute top-1 end-1 w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[var(--border-level-2)] flex flex-col gap-4">
        {(!collapsed || mobileOpen) && (
          <div className="flex items-center gap-3 bg-[var(--surface-active)] p-2.5 rounded-sg">
            <div className="w-9 h-9 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center shrink-0 border border-[var(--color-accent)]/30">
              {userInitials}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{userName}</span>
              <span className="text-xs text-[var(--text-tertiary)] truncate">{userRole.replace('_', ' ')}</span>
            </div>
          </div>
        )}
        
        {collapsed && !mobileOpen && (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center border border-[var(--color-accent)]/30" title={userName}>
              {userInitials}
            </div>
          </div>
        )}
        
        <button 
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className={cn(
          "flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[var(--color-error)] hover:bg-[#EF444410] rounded-sg transition-colors",
          collapsed && !mobileOpen ? "justify-center px-0" : ""
        )} title={collapsed && !mobileOpen ? "Logout" : undefined}>
          <LogOut size={18} />
          {(!collapsed || mobileOpen) && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  if (!isClient) return null;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 start-0 end-0 h-16 bg-[var(--surface-default)] border-b border-[var(--border-level-2)] z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sg bg-[var(--color-primary)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">E3</span>
          </div>
          <span className="font-bold text-[var(--text-primary)]">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-full">
            <Bell size={20} />
          </button>
          <button 
            onClick={() => setMobileOpen(true)}
            className="p-2 text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-full"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col fixed start-0 top-0 bottom-0 bg-[var(--surface-default)] border-e border-[var(--border-level-2)] z-40"
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
              className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed start-0 top-0 bottom-0 w-[260px] bg-[var(--surface-default)] z-50 flex flex-col md:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      
      {/* Spacer for desktop layout */}
      <div className={cn("hidden md:block shrink-0 transition-all duration-300", collapsed ? "w-[80px]" : "w-[260px]")} />
    </>
  );
}
