"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Calendar, 
  Settings,
  X,
  Target
} from "lucide-react"
import { Button } from "@/components/ui/Button"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const links = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/dashboard/projects", icon: Briefcase },
    { name: "Leads", href: "/dashboard/leads", icon: Target },
    { name: "Team", href: "/dashboard/team", icon: Users },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 start-0 z-50 w-64 bg-[var(--surface-default)] border-e border-[var(--border-default)]
        transform transition-transform duration-300 ease-in-out flex flex-col
        lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-default)] shrink-0">
          <span className="text-2xl font-black text-[var(--color-primary)]">E3 Admin</span>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-sg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${isActive 
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                  }
                `}
              >
                <link.icon className={`w-5 h-5 ${isActive ? "text-[var(--color-primary)]" : "text-[var(--text-tertiary)]"}`} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* User Info (Bottom) */}
        <div className="p-4 border-t border-[var(--border-default)] shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center font-bold text-[var(--color-primary)]">
              AD
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">Admin User</p>
              <p className="text-xs text-[var(--text-tertiary)]">Super Admin</p>
            </div>
          </div>
        </div>

      </aside>
    </>
  )
}
