"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface SocialItem {
  id: "instagram" | "youtube" | "linkedin" | "facebook" | "whatsapp";
  name: string;
  userId: string;
  url: string;
  hoverBg: string;
  glowColor: string;
  icon: React.ReactNode;
}

function formatWhatsappUrl(rawNumberOrUrl?: string): string {
  if (!rawNumberOrUrl) return "https://wa.me/97451138418";
  const trimmed = rawNumberOrUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const cleanDigits = trimmed.replace(/\D/g, "");
  return cleanDigits ? `https://wa.me/${cleanDigits}` : "https://wa.me/97451138418";
}

const DEFAULT_SOCIAL_ITEMS: SocialItem[] = [
  {
    id: "instagram",
    name: "Instagram",
    userId: "@e3qatar",
    url: "https://www.instagram.com/e3qatar",
    hoverBg: "hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600",
    glowColor: "rgba(225, 48, 108, 0.4)",
    icon: (
      <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    id: "youtube",
    name: "YouTube",
    userId: "@e3qatar",
    url: "https://www.youtube.com/@e3qatar",
    hoverBg: "hover:bg-[#FF0000]",
    glowColor: "rgba(255, 0, 0, 0.4)",
    icon: (
      <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    userId: "E3 Qatar",
    url: "https://www.linkedin.com/company/e3qatar",
    hoverBg: "hover:bg-[#0A66C2]",
    glowColor: "rgba(10, 102, 194, 0.4)",
    icon: (
      <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    id: "facebook",
    name: "Facebook",
    userId: "e3qatar",
    url: "https://www.facebook.com/e3qatar",
    hoverBg: "hover:bg-[#1877F2]",
    glowColor: "rgba(24, 119, 242, 0.4)",
    icon: (
      <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    userId: "+974 5113 8418",
    url: "https://wa.me/97451138418",
    hoverBg: "hover:bg-[#25D366]",
    glowColor: "rgba(37, 211, 102, 0.4)",
    icon: (
      <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
];

export function FloatingSocialDock() {
  const pathname = usePathname() || "";
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [socialItems, setSocialItems] = useState<SocialItem[]>(DEFAULT_SOCIAL_ITEMS);

  // Fetch dynamic settings from dashboard
  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const json = await res.json();
        const s = json.data || {};

        if (!isMounted) return;

        setSocialItems([
          {
            id: "instagram",
            name: "Instagram",
            userId: s.socialInstagramHandle || "@e3qatar",
            url: s.socialInstagram || "https://www.instagram.com/e3qatar",
            hoverBg: "hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600",
            glowColor: "rgba(225, 48, 108, 0.4)",
            icon: (
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            ),
          },
          {
            id: "youtube",
            name: "YouTube",
            userId: s.socialYoutubeHandle || "@e3qatar",
            url: s.socialYoutube || "https://www.youtube.com/@e3qatar",
            hoverBg: "hover:bg-[#FF0000]",
            glowColor: "rgba(255, 0, 0, 0.4)",
            icon: (
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            ),
          },
          {
            id: "linkedin",
            name: "LinkedIn",
            userId: s.socialLinkedinHandle || "E3 Qatar",
            url: s.socialLinkedin || "https://www.linkedin.com/company/e3qatar",
            hoverBg: "hover:bg-[#0A66C2]",
            glowColor: "rgba(10, 102, 194, 0.4)",
            icon: (
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            ),
          },
          {
            id: "facebook",
            name: "Facebook",
            userId: s.socialFacebookHandle || "e3qatar",
            url: s.socialFacebook || "https://www.facebook.com/e3qatar",
            hoverBg: "hover:bg-[#1877F2]",
            glowColor: "rgba(24, 119, 242, 0.4)",
            icon: (
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            ),
          },
          {
            id: "whatsapp",
            name: "WhatsApp",
            userId: s.socialWhatsappHandle || s.contactWhatsapp || "+974 5113 8418",
            url: formatWhatsappUrl(s.contactWhatsapp || s.socialWhatsappHandle),
            hoverBg: "hover:bg-[#25D366]",
            glowColor: "rgba(37, 211, 102, 0.4)",
            icon: (
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            ),
          },
        ]);
      } catch {
        // Safe fallback already in place
      }
    }

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Hide on Dashboard and Login portal views
  if (
    pathname.includes("/dashboard") ||
    pathname.includes("/login") ||
    pathname.includes("/candidate")
  ) {
    return null;
  }

  return (
    <aside
      aria-label="Social Media Quick Links"
      className="fixed right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 z-40 select-none pointer-events-auto"
    >
      <div className="flex flex-col items-center gap-2 p-1.5 rounded-2xl bg-neutral-950/70 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {socialItems.map((item) => {
          const isHovered = hoveredId === item.id;

          return (
            <div key={item.id} className="relative flex items-center justify-end group">
              {/* Sliding User ID Tooltip */}
              <div
                className={`absolute right-full mr-2.5 px-3 py-1.5 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-white/15 text-white shadow-xl pointer-events-none transition-all duration-300 ease-out whitespace-nowrap flex items-center gap-1.5 ${
                  isHovered
                    ? "opacity-100 translate-x-0 scale-100"
                    : "opacity-0 translate-x-2 scale-95 pointer-events-none"
                }`}
                style={{
                  boxShadow: isHovered ? `0 4px 20px ${item.glowColor}` : "none",
                }}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                  {item.name}:
                </span>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {item.userId}
                </span>

                {/* Arrow tail pointing to icon */}
                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-l-[6px] border-l-neutral-900/90" />
              </div>

              {/* Social Icon Button */}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${item.name} (${item.userId})`}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-neutral-300 transition-all duration-300 border border-white/5 hover:border-white/20 hover:text-white hover:scale-110 active:scale-95 ${item.hoverBg}`}
                style={{
                  boxShadow: isHovered ? `0 0 16px ${item.glowColor}` : "none",
                }}
              >
                {item.icon}
              </a>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
