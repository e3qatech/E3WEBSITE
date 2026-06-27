"use client"

import { Search, Bell, ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"

export function TopBar() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);
  
  return (
    <header className="hidden md:flex h-16 bg-[var(--surface-default)] border-b border-[var(--border-level-2)] items-center justify-between px-6 shrink-0 z-20 sticky top-0">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
          
          return (
            <div key={path} className="flex items-center gap-2">
              <span className={isLast ? "text-[var(--text-primary)] font-bold" : ""}>
                {formattedPath}
              </span>
              {!isLast && <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />}
            </div>
          )
        })}
      </div>

      {/* Right Actions: Search & Bell */}
      <div className="flex items-center gap-6">
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input 
            type="text" 
            placeholder="Search leads, projects..."
            className="w-full ps-9 pe-4 py-2 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]/50 focus:bg-[var(--surface-default)] transition-colors"
          />
        </div>

        <button className="relative p-2 rounded-sg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-[var(--color-error)] border-2 border-[var(--surface-default)]" />
        </button>
      </div>

    </header>
  )
}
