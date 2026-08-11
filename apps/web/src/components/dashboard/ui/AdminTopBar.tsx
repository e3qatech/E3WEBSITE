"use client"

import * as React from "react"
import { Search, ChevronRight, Command, Sun, Moon, Laptop, Globe } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useAdminTheme } from "./AdminThemeProvider"
import { useLocale } from "@/components/layout/LocaleProvider"
import { cn } from "@/lib/utils"
import { NotificationDropdown } from "./NotificationDropdown"

export function AdminTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useAdminTheme();
  
  const [themeMenuOpen, setThemeMenuOpen] = React.useState(false);
  const themeMenuRef = React.useRef<HTMLDivElement>(null);

  // Determine current active locale from pathname or context
  const currentLocale = pathname.startsWith('/ar') ? 'ar' : (locale || 'en');

  // Strip locale prefix for breadcrumbs
  const rawPaths = pathname.split('/').filter(Boolean);
  const paths = rawPaths.filter((p) => p !== 'en' && p !== 'ar');

  // Close theme menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleLanguage = () => {
    const nextLocale = currentLocale === 'en' ? 'ar' : 'en';
    if (setLocale) setLocale(nextLocale);
    
    // Replace locale in current URL
    let newPathname = pathname;
    if (pathname.startsWith('/en') || pathname.startsWith('/ar')) {
      newPathname = pathname.replace(`/${currentLocale}`, `/${nextLocale}`);
    } else {
      newPathname = `/${nextLocale}${pathname}`;
    }
    router.push(newPathname);
  };
  
  return (
    <header className="flex h-16 bg-transparent items-center justify-between px-4 sm:px-6 shrink-0 z-20 sticky top-0 transition-colors">
      
      {/* Mobile Menu Toggle Placeholder */}
      <div className="md:hidden flex items-center gap-3">
      </div>

      {/* Breadcrumbs - Hidden on small screens */}
      <div className="hidden md:flex items-center gap-2 text-[13px] text-[var(--text-secondary)] font-medium tracking-wide">
        <span className="text-[var(--text-secondary)] hover:text-[var(--color-primary)] cursor-pointer transition-colors" onClick={() => router.push(`/${currentLocale}/dashboard`)}>
          {currentLocale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
        </span>
        {paths.length > 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--text-disabled)] icon-directional rtl:-scale-x-100" />}
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
          
          return (
            <div key={path} className="flex items-center gap-2">
              <span className={cn(
                "transition-colors",
                isLast ? "text-[var(--text-primary)] font-semibold" : "hover:text-[var(--color-primary)] cursor-pointer"
              )}>
                {formattedPath}
              </span>
              {!isLast && <ChevronRight className="w-3.5 h-3.5 text-[var(--text-disabled)] icon-directional rtl:-scale-x-100" />}
            </div>
          )
        })}
      </div>

      {/* Right Actions: Search, Language Switcher, Theme Toggle & Bell */}
      <div className="flex items-center gap-3 sm:gap-4 ms-auto md:ms-0">
        
        {/* Search */}
        <div className="relative hidden sm:block w-64 lg:w-80 group">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--color-primary)] transition-colors" />
          <input 
            type="text" 
            placeholder={currentLocale === 'ar' ? 'البحث في لوحة التحكم...' : 'Search Command Center...'}
            className="w-full ps-9 pe-12 h-9 bg-[var(--bg-level-2)] border border-[var(--border-level-1)] rounded-xl text-[13px] font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder:text-[var(--text-tertiary)] shadow-sm"
          />
          <div className="absolute end-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--surface-default)] px-1.5 py-0.5 rounded border border-[var(--border-level-1)] pointer-events-none">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
        
        {/* Mobile Search Button */}
        <button className="sm:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors">
          <Search className="w-5 h-5" />
        </button>

        {/* Dashboard Language Switcher (EN / AR) */}
        <button
          onClick={handleToggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--surface-default)] border border-[var(--border-level-1)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:border-[var(--color-primary)] transition-all shadow-sm focus-visible:outline-none cursor-pointer"
          title={currentLocale === 'en' ? 'التحويل إلى العربية' : 'Switch to English'}
        >
          <Globe className="w-3.5 h-3.5 text-[var(--color-primary)]" />
          <span>{currentLocale === 'en' ? 'العربية' : 'EN'}</span>
        </button>

        {/* Theme Toggle */}
        <div className="relative" ref={themeMenuRef}>
          <button 
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none cursor-pointer flex items-center gap-1"
            title="Toggle theme (Light, Dark, System)"
          >
            {theme === "light" && <Sun className="w-4 h-4 text-amber-500" strokeWidth={2.5} />}
            {theme === "dark" && <Moon className="w-4 h-4 text-cyan-400" strokeWidth={2.5} />}
            {theme === "system" && <Laptop className="w-4 h-4 text-blue-400" strokeWidth={2.5} />}
          </button>
          
          {themeMenuOpen && (
            <div className="absolute end-0 top-full mt-2 w-36 rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => { setTheme("light"); setThemeMenuOpen(false); }}
                className={cn("flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] transition-colors cursor-pointer", theme === "light" ? "bg-[var(--surface-selected)] text-[var(--color-primary)] font-semibold" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] font-medium")}
              >
                <Sun className="h-4 w-4 text-amber-500" /> Light
              </button>
              <button
                onClick={() => { setTheme("dark"); setThemeMenuOpen(false); }}
                className={cn("flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] transition-colors cursor-pointer", theme === "dark" ? "bg-[var(--surface-selected)] text-[var(--color-primary)] font-semibold" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] font-medium")}
              >
                <Moon className="h-4 w-4 text-cyan-400" /> Dark
              </button>
              <button
                onClick={() => { setTheme("system"); setThemeMenuOpen(false); }}
                className={cn("flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] transition-colors cursor-pointer", theme === "system" ? "bg-[var(--surface-selected)] text-[var(--color-primary)] font-semibold" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] font-medium")}
              >
                <Laptop className="h-4 w-4 text-blue-400" /> System
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <NotificationDropdown />
      </div>

    </header>
  )
}
