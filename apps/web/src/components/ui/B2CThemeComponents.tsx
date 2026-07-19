"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MapPin, Calendar, Clock, Ticket, Users, AlertCircle, Search, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

// ==========================================
// 1. Theme Provider & Context
// ==========================================

type Theme = "light" | "dark";

interface B2CThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  locale: string;
  isAr: boolean;
}

const B2CThemeContext = createContext<B2CThemeContextType | undefined>(undefined);

export function B2CThemeProvider({
  children,
  locale = "en",
}: {
  children: React.ReactNode;
  locale?: string;
}) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const isAr = locale === "ar";

  useEffect(() => {
    // Sync with existing theme provider storage/attributes if present
    const root = window.document.documentElement;
    const currentTheme = root.getAttribute("data-theme") as Theme | null;
    if (currentTheme === "light" || currentTheme === "dark") {
      setThemeState(currentTheme);
    }

    // Set up observer to watch for theme changes on html attribute
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          const updated = root.getAttribute("data-theme") as Theme | null;
          if (updated === "light" || updated === "dark") {
            setThemeState(updated);
          }
        }
      });
    });

    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const setTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <B2CThemeContext.Provider value={{ theme, setTheme, toggleTheme, locale, isAr }}>
      <div className={cn("b2c-theme w-full min-h-screen text-[var(--text-primary)] bg-[var(--bg-level-1)] transition-colors duration-300", isAr ? "rtl" : "ltr")} dir={isAr ? "rtl" : "ltr"}>
        {children}
      </div>
    </B2CThemeContext.Provider>
  );
}

export function useB2CTheme() {
  const context = useContext(B2CThemeContext);
  if (!context) {
    throw new Error("useB2CTheme must be used within a B2CThemeProvider");
  }
  return context;
}

// ==========================================
// 2. Reusable Layout Components
// ==========================================

export function B2CPageShell({
  children,
  className,
  showBgOrbs = true,
}: {
  children: React.ReactNode;
  className?: string;
  showBgOrbs?: boolean;
}) {
  const { theme } = useB2CTheme();

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      {/* Background Cinematic Orbs (Dark Mode ONLY) */}
      {showBgOrbs && theme === "dark" && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              x: [0, 80, 0],
              y: [0, -40, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -start-40 w-[600px] h-[600px] bg-[var(--e3-purple)] rounded-full mix-blend-screen filter blur-[128px] opacity-[0.15]"
          />
          <motion.div
            animate={{
              scale: [1.1, 0.95, 1.1],
              x: [0, -60, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-40 -end-40 w-[600px] h-[600px] bg-[var(--e3-royal-blue)] rounded-full mix-blend-screen filter blur-[128px] opacity-[0.15]"
          />
        </div>
      )}

      {/* Background Soft Gradients (Light Mode ONLY) */}
      {showBgOrbs && theme === "light" && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#EBF0FF]/40 to-transparent" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[var(--e3-soft-border)]/20 rounded-full filter blur-[80px]" />
        </div>
      )}

      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}

export function B2CSection({
  children,
  className,
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className={cn("py-12 md:py-20 px-4 md:px-8 max-w-7xl mx-auto w-full", className)}>
      {(title || subtitle || action) && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
          <div className="flex-1">
            {title && (
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3 text-[var(--text-primary)] font-display uppercase">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base md:text-lg text-[var(--text-secondary)] font-medium max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function B2CHero({
  title,
  subtitle,
  mediaUrl,
  mediaType = "IMAGE",
  cta,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  mediaUrl?: string;
  mediaType?: "IMAGE" | "VIDEO";
  cta?: React.ReactNode;
  className?: string;
}) {
  const { theme } = useB2CTheme();

  return (
    <div className={cn("relative min-h-[60vh] md:min-h-[75vh] flex items-center justify-start overflow-hidden py-20 px-4 md:px-8 border-b border-[var(--border-level-1)]", className)}>
      {/* Background Media & Cinematic Overlay */}
      <div className="absolute inset-0 z-0">
        {mediaUrl ? (
          mediaType === "VIDEO" ? (
            <video src={mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={mediaUrl} alt="Hero Background" className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--e3-deep-blue)]/10 via-[var(--e3-midnight)] to-[var(--e3-purple)]/10" />
        )}

        {/* Gradient Overlay inspired by E3 logo */}
        {theme === "dark" ? (
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--e3-midnight)] via-[var(--e3-midnight)]/70 to-transparent" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--e3-light-bg)] via-[var(--e3-light-bg)]/80 to-transparent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-level-1)] via-[var(--bg-level-1)]/50 to-transparent" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10 w-full">
        <div className="max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-none text-[var(--text-primary)] mb-6 font-display uppercase"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 100, damping: 20 }}
              className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 max-w-2xl font-medium leading-relaxed"
            >
              {subtitle}
            </motion.p>
          )}
          {cta && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              {cta}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. UI Presentation Components
// ==========================================

export function B2CCard({
  children,
  className,
  onClick,
  hoverable = true,
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  glow?: boolean;
}) {
  const { theme } = useB2CTheme();
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={cn(
        "rounded-2xl border text-start overflow-hidden transition-all duration-300",
        theme === "dark"
          ? "bg-[rgba(8,10,42,0.6)] backdrop-blur-md border-[rgba(75,0,143,0.35)] hover:border-[var(--e3-purple)] text-[var(--e3-white)] shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          : "bg-[var(--e3-card-white)] border-[var(--e3-soft-border)] hover:border-[var(--e3-royal-blue)] text-[var(--e3-ink)] shadow-[0_4px_16px_rgba(23,23,138,0.04)]",
        hoverable && (theme === "dark" 
          ? "hover:shadow-[0_0_30px_rgba(75,0,143,0.25)] hover:-translate-y-1" 
          : "hover:shadow-[0_12px_24px_rgba(23,23,138,0.08)] hover:-translate-y-1"),
        glow && theme === "dark" && "shadow-[0_0_20px_rgba(26,31,214,0.15)]",
        onClick && "cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-[var(--e3-royal-blue)]/50",
        className
      )}
    >
      {children}
    </Tag>
  );
}

interface B2CButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function B2CButton({
  children,
  className,
  variant = "primary",
  size = "md",
  href,
  ...props
}: B2CButtonProps) {
  const { theme } = useB2CTheme();

  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide rounded-xl cursor-pointer transition-all duration-300 select-none active:scale-[0.98] outline-none focus:ring-2 focus:ring-[var(--e3-royal-blue)]/50";
  
  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const themeVariantStyles = {
    dark: {
      primary: "bg-[var(--e3-white)] text-[var(--e3-midnight)] hover:bg-[var(--e3-soft-white)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]",
      secondary: "bg-[var(--e3-royal-blue)] text-[var(--e3-white)] hover:bg-[var(--e3-royal-blue)]/90 hover:shadow-[0_0_20px_rgba(26,31,214,0.4)]",
      outline: "border border-[var(--e3-purple)] bg-transparent text-[var(--e3-white)] hover:bg-[rgba(75,0,143,0.15)] hover:border-[var(--e3-magenta)]",
      ghost: "bg-transparent text-[var(--e3-white)] hover:bg-[rgba(255,255,255,0.05)]",
    },
    light: {
      primary: "bg-gradient-to-r from-[var(--e3-royal-blue)] to-[var(--e3-purple)] text-[var(--e3-white)] hover:shadow-[0_4px_15px_rgba(26,31,214,0.3)]",
      secondary: "bg-[var(--e3-purple)] text-[var(--e3-white)] hover:bg-[var(--e3-purple)]/90 hover:shadow-[0_4px_15px_rgba(75,0,143,0.25)]",
      outline: "border border-[var(--e3-soft-border)] bg-transparent text-[var(--e3-blue-text)] hover:bg-[var(--e3-soft-border)]/30 hover:border-[var(--e3-royal-blue)]",
      ghost: "bg-transparent text-[var(--e3-blue-text)] hover:bg-[var(--e3-soft-border)]/20",
    }
  };

  const currentStyles = cn(
    baseStyles,
    sizeStyles[size],
    themeVariantStyles[theme][variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={currentStyles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={currentStyles} {...props}>
      {children}
    </button>
  );
}

export function B2CBadge({
  children,
  className,
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "accent" | "outline";
}) {
  const badgeStyles = {
    primary: "bg-[var(--e3-royal-blue)]/10 text-[var(--e3-royal-blue)] border-[var(--e3-royal-blue)]/20",
    secondary: "bg-[var(--e3-purple)]/10 text-[var(--e3-purple)] border-[var(--e3-purple)]/20",
    accent: "bg-[var(--e3-magenta)]/10 text-[var(--e3-magenta)] border-[var(--e3-magenta)]/20",
    outline: "bg-transparent text-[var(--text-secondary)] border-[var(--border-level-2)]",
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wider uppercase", badgeStyles[variant], className)}>
      {children}
    </span>
  );
}

export function B2CStatusBadge({
  status,
  className,
}: {
  status: "ACTIVE" | "COMING SOON" | "UPCOMING" | "CLOSED" | "MAINTENANCE" | "PAST" | string;
  className?: string;
}) {
  const normStatus = status.toUpperCase();
  
  let label = status;
  let style = "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

  if (normStatus === "ACTIVE" || normStatus === "ACTIVE NOW") {
    label = "Live / Active";
    style = "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.15)]";
  } else if (normStatus === "COMING SOON" || normStatus === "UPCOMING") {
    label = "Coming Soon";
    style = "bg-[var(--e3-royal-blue)]/10 text-[var(--e3-royal-blue)] border-[var(--e3-royal-blue)]/20";
  } else if (normStatus === "CLOSED" || normStatus === "PAST") {
    label = "Closed";
    style = "bg-red-500/10 text-red-400 border-red-500/20";
  } else if (normStatus === "MAINTENANCE") {
    label = "Maintenance";
    style = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider", style, className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current me-1.5 animate-pulse" />
      {label}
    </span>
  );
}

// ==========================================
// 4. Form & Filter Elements
// ==========================================

export function B2CTabs({
  tabs,
  activeTab,
  onChange,
  className,
}: {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
  className?: string;
}) {
  const { theme } = useB2CTheme();

  return (
    <div className={cn("flex flex-wrap items-center gap-2 p-1.5 rounded-2xl w-fit", 
      theme === "dark" ? "bg-[rgba(8,10,42,0.4)] border border-[rgba(75,0,143,0.2)]" : "bg-zinc-100 border border-[var(--e3-soft-border)]", 
      className)}
    >
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer focus:outline-none select-none",
              isActive 
                ? (theme === "dark"
                    ? "bg-[var(--e3-white)] text-[var(--e3-midnight)] shadow-lg"
                    : "bg-gradient-to-r from-[var(--e3-royal-blue)] to-[var(--e3-purple)] text-[var(--e3-white)] shadow-[0_4px_12px_rgba(26,31,214,0.2)]")
                : (theme === "dark"
                    ? "text-[var(--e3-soft-white)] hover:bg-[rgba(255,255,255,0.05)]"
                    : "text-[var(--e3-blue-text)] hover:bg-zinc-200/50")
            )}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

export function B2CInput({
  label,
  error,
  className,
  textarea = false,
  ...props
}: {
  label?: string;
  error?: string;
  className?: string;
  textarea?: boolean;
  [key: string]: any;
}) {
  const { theme } = useB2CTheme();
  const Tag = textarea ? "textarea" : "input";

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {label && (
        <label className="text-xs font-bold tracking-wider uppercase text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <Tag
        className={cn(
          "w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 outline-none",
          theme === "dark"
            ? "bg-[rgba(8,10,42,0.8)] border-[rgba(75,0,143,0.3)] text-[var(--e3-white)] focus:border-[var(--e3-royal-blue)] focus:ring-2 focus:ring-[var(--e3-royal-blue)]/30 placeholder-zinc-500"
            : "bg-[var(--e3-card-white)] border-[var(--e3-soft-border)] text-[var(--e3-ink)] focus:border-[var(--e3-royal-blue)] focus:ring-2 focus:ring-[var(--e3-royal-blue)]/20 placeholder-zinc-400",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          textarea && "min-h-[120px] resize-y"
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 font-medium flex items-center gap-1.5">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
    </div>
  );
}

export function B2CModal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { theme, isAr } = useB2CTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={cn(
              "relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden z-10 p-6 md:p-8 text-start",
              theme === "dark"
                ? "bg-[rgba(8,10,42,0.95)] border-[rgba(75,0,143,0.4)] text-[var(--e3-white)]"
                : "bg-[var(--e3-card-white)] border-[var(--e3-soft-border)] text-[var(--e3-ink)]",
              className
            )}
          >
            <div className="flex items-center justify-between mb-6">
              {title && (
                <h3 className="text-2xl font-black tracking-tight font-display uppercase">
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300 hover:bg-zinc-500/10",
                  theme === "dark" ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// 5. Zero-Result & Custom Cards
// ==========================================

export function B2CEmptyState({
  title = "No experiences found",
  description = "Try adjusting your search query or filters to explore other options.",
  icon: Icon = HelpCircle,
  action,
}: {
  title?: string;
  description?: string;
  icon?: any;
  action?: React.ReactNode;
}) {
  const { theme } = useB2CTheme();

  return (
    <div className={cn(
      "w-full py-16 px-6 flex flex-col items-center justify-center text-center rounded-3xl border border-dashed",
      theme === "dark" 
        ? "bg-[rgba(8,10,42,0.4)] border-[rgba(75,0,143,0.25)]" 
        : "bg-zinc-50/50 border-[var(--e3-soft-border)]"
    )}>
      <div className="w-16 h-16 rounded-2xl bg-[var(--e3-royal-blue)]/10 flex items-center justify-center text-[var(--e3-royal-blue)] mb-6 animate-pulse">
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-md mb-8">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

export function B2CMediaCard({
  mediaUrl,
  mediaType = "IMAGE",
  title,
  subtitle,
  aspectRatio = "aspect-video",
  onClick,
}: {
  mediaUrl: string;
  mediaType?: "IMAGE" | "VIDEO";
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  aspectRatio?: string;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <B2CCard 
      onClick={onClick} 
      hoverable
      className={cn("group flex flex-col relative w-full h-full overflow-hidden", aspectRatio)}
    >
      <div 
        className="relative w-full h-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Media */}
        {mediaType === "VIDEO" ? (
          <video src={mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
        ) : (
          <img 
            src={mediaUrl} 
            alt="Media Card Asset" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        )}

        {/* Ambient E3 brand tint overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--e3-midnight)]/90 via-[var(--e3-midnight)]/30 to-transparent opacity-80" />
        
        {/* Text Details overlay */}
        {(title || subtitle) && (
          <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end text-[var(--e3-white)]">
            {subtitle && (
              <span className="text-xs font-bold text-[var(--e3-magenta)] tracking-wider uppercase mb-1.5">
                {subtitle}
              </span>
            )}
            {title && (
              <h4 className="text-xl font-bold tracking-tight leading-snug font-display uppercase">
                {title}
              </h4>
            )}
          </div>
        )}
      </div>
    </B2CCard>
  );
}

// ==========================================
// 6. Attraction & Event Specific Cards
// ==========================================

export function B2CAttractionCard({
  attraction,
  locale = "en",
}: {
  attraction: any;
  locale?: string;
}) {
  const { isAr } = useB2CTheme();
  
  const name = isAr ? attraction.nameAr || attraction.nameEn : attraction.nameEn || attraction.nameAr;
  const tagline = isAr ? attraction.taglineAr || attraction.taglineEn : attraction.taglineEn || attraction.taglineAr;
  const address = isAr ? attraction.locationAddressAr || attraction.locationAddressEn : attraction.locationAddressEn || attraction.locationAddressAr;
  
  const price = attraction.pricing?.[0] ? `${attraction.pricing[0].price} QAR` : null;
  const imageUrl = attraction.gallery?.[0]?.mediaUrl || attraction.thumbnailUrl || "";
  const currentOccupancy = attraction.operations?.currentOccupancy || 0;
  const maxCapacity = attraction.operations?.maxCapacity || 1000;
  const occupancyPercentage = Math.round((currentOccupancy / maxCapacity) * 100);

  return (
    <B2CCard className="flex flex-col h-full group" hoverable>
      {/* Visual Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--e3-royal-blue)]/20 to-[var(--e3-purple)]/20 flex items-center justify-center text-zinc-800">
            No Image
          </div>
        )}

        {/* Dynamic Status Tag */}
        <div className="absolute top-4 start-4">
          <B2CStatusBadge status={attraction.computedStatus || attraction.status} />
        </div>

        {/* Price Tag Overlay */}
        {price && (
          <div className="absolute bottom-4 end-4 bg-[var(--e3-magenta)] text-[var(--e3-white)] px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase shadow-[0_4px_10px_rgba(176,19,184,0.3)]">
            {price}
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight mb-2 text-[var(--text-primary)] font-display uppercase group-hover:text-[var(--e3-royal-blue)] transition-colors duration-300">
            {name}
          </h3>
          
          {tagline && (
            <p className="text-sm text-[var(--text-secondary)] font-medium mb-4 line-clamp-2">
              {tagline}
            </p>
          )}

          {/* Location and Info block */}
          {address && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-4 font-semibold">
              <MapPin size={14} className="text-[var(--e3-royal-blue)]" />
              <span className="line-clamp-1">{address}</span>
            </div>
          )}
        </div>

        {/* Live capacity indicator */}
        <div className="mt-4 pt-4 border-t border-[var(--border-level-1)]">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)] uppercase tracking-wider">
              <Users size={12} className="text-[var(--e3-royal-blue)] animate-pulse" />
              Live Capacity
            </span>
            <span className="text-[var(--e3-royal-blue)] font-bold">{occupancyPercentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div 
              style={{ width: `${Math.min(occupancyPercentage, 100)}%` }} 
              className={cn("h-full rounded-full transition-all duration-1000", 
                occupancyPercentage > 85 ? "bg-red-500" : 
                occupancyPercentage > 60 ? "bg-amber-500" : "bg-emerald-500")} 
            />
          </div>
        </div>

        {/* Action Link */}
        <div className="mt-6">
          <B2CButton 
            href={`/b2c/attractions/${attraction.slug}`} 
            variant="outline" 
            className="w-full text-xs font-black uppercase flex items-center justify-center gap-2 group/btn border-[rgba(75,0,143,0.3)]"
          >
            Explore Experience
            <ArrowRight size={14} className={cn("transition-transform", isAr ? "rotate-180 group-hover/btn:-translate-x-1" : "group-hover/btn:translate-x-1")} />
          </B2CButton>
        </div>
      </div>
    </B2CCard>
  );
}

export function B2CEventCard({
  event,
  locale = "en",
}: {
  event: any;
  locale?: string;
}) {
  const { isAr } = useB2CTheme();
  
  const title = isAr ? event.titleAr || event.titleEn : event.titleEn || event.titleAr;
  const description = isAr ? event.descriptionAr || event.descriptionEn : event.descriptionEn || event.descriptionAr;
  const venue = isAr ? event.venueAr || event.venueEn : event.venueEn || event.venueAr;
  
  const startDateStr = new Date(event.startDate).toLocaleDateString(locale, {
    day: 'numeric', month: 'short', year: 'numeric'
  });
  
  const startTimeStr = new Date(event.startDate).toLocaleTimeString(locale, {
    hour: '2-digit', minute: '2-digit'
  });

  const durationMin = event.durationMinutes ? `${event.durationMinutes} min` : null;

  return (
    <B2CCard className="p-6 hover:shadow-[0_0_20px_rgba(26,31,214,0.15)] flex flex-col md:flex-row gap-6 items-start md:items-center">
      {/* Date badge */}
      <div className="bg-[var(--e3-royal-blue)]/10 border border-[var(--e3-royal-blue)]/20 px-5 py-4 rounded-2xl flex flex-col items-center justify-center text-center shrink-0 w-24">
        <span className="text-3xl font-black text-[var(--e3-royal-blue)] leading-none font-display">
          {new Date(event.startDate).getDate()}
        </span>
        <span className="text-xs font-bold text-[var(--e3-royal-blue)] uppercase tracking-wider mt-1">
          {new Date(event.startDate).toLocaleDateString(locale, { month: 'short' })}
        </span>
      </div>

      {/* Event Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-2 mb-2">
          <B2CBadge variant="secondary">
            {event.eventType || "Event"}
          </B2CBadge>
          {event.isFeatured && (
            <B2CBadge variant="accent">
              Featured
            </B2CBadge>
          )}
        </div>
        
        <h4 className="text-xl font-bold tracking-tight mb-2 text-[var(--text-primary)] font-display uppercase">
          {title}
        </h4>
        
        {description && (
          <p className="text-sm text-[var(--text-secondary)] font-medium mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Metadata info */}
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-[var(--text-tertiary)]">
          {venue && (
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[var(--e3-royal-blue)]" />
              {venue}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-[var(--e3-royal-blue)]" />
            {startTimeStr} {durationMin && `(${durationMin})`}
          </span>
        </div>
      </div>

      {/* CTA ticket Button */}
      {event.ticketUrl ? (
        <div className="shrink-0 w-full md:w-auto">
          <B2CButton href={event.ticketUrl} variant="primary" size="sm" className="w-full flex items-center gap-2">
            <Ticket size={14} />
            Get Tickets
          </B2CButton>
        </div>
      ) : (
        <div className="shrink-0 w-full md:w-auto">
          <B2CButton href={`/b2c/calendar/${event.id}`} variant="outline" size="sm" className="w-full">
            Details
          </B2CButton>
        </div>
      )}
    </B2CCard>
  );
}
