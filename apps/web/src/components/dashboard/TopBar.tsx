"use client"

import { Search, Bell, ChevronRight, Command } from "lucide-react"
import { usePathname } from "next/navigation"

export function TopBar() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);
  
  return (
    <header className="hidden md:flex h-16 glass rounded-2xl mx-6 mt-4 items-center justify-between px-6 shrink-0 z-20 sticky top-4 transition-colors duration-300 shadow-lg border-gradient">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-medium">
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
          
          return (
            <div key={path} className="flex items-center gap-2">
              <span className={isLast ? "text-[var(--text-primary)] font-black tracking-tight" : "hover:text-[var(--text-primary)] cursor-pointer transition-colors"}>
                {formattedPath}
              </span>
              {!isLast && <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />}
            </div>
          )
        })}
      </div>

      {/* Right Actions: Search & Bell */}
      <div className="flex items-center gap-6">
        <div className="relative w-72 group">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--color-primary)] transition-colors" />
          <input 
            type="text" 
            placeholder="Search leads, projects..."
            className="w-full ps-9 pe-12 py-2.5 bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all placeholder:text-[var(--text-tertiary)] shadow-sm"
          />
          <div className="absolute end-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--surface-default)] px-1.5 py-0.5 rounded border border-[var(--border-level-1)]">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        <button className="relative p-2.5 rounded-xl bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--surface-active)] hover:text-[var(--color-primary)] transition-all hover:scale-105 active:scale-95 border border-[var(--border-level-1)] shadow-sm">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 end-2 w-2.5 h-2.5 rounded-full bg-[var(--color-error)] border-2 border-[var(--surface-hover)] animate-pulse-glow" />
        </button>
      </div>

    </header>
  )
}
