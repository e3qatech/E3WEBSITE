"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useLocale } from "./LocaleProvider";
import { useTheme } from "./ThemeProvider";
import { Send, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  portal: "b2c" | "b2b";
  settings?: Record<string, string>;
}

const quickLinks = {
  b2c: [
    { label: "nav.events", href: "/b2c/calendar" },
    { label: "nav.faq", href: "/b2c/contact" },
    { label: "nav.support", href: "/b2c/contact" },
  ],
  b2b: [
    { label: "nav.services", href: "/b2b/services" },
    { label: "nav.partners", href: "/b2b/partners" },
    { label: "nav.corporate", href: "/corporate" },
    { label: "nav.contact", href: "/contact" },
  ],
};

export function Footer({ portal, settings = {} }: FooterProps) {
  const { t, dir, locale } = useLocale();
  const { theme } = useTheme();
  const links = quickLinks[portal] || quickLinks.b2c;

  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const siteName = locale === "ar" ? (settings.siteNameAr || "إي ثري") : (settings.siteNameEn || "E3");
  const address = locale === "ar" ? (settings.addressAr || "") : (settings.addressEn || "");
  const phone = settings.contactPhone || "";
  const emailAddr = settings.contactEmail || "";
  
  const lightLogoUrl = settings.lightLogoUrl;
  const darkLogoUrl = settings.darkLogoUrl;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    setSubscribeStatus('idle');
    try {
      const res = await fetch('/api/crm/subscribers/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setSubscribeStatus('success');
        setEmail("");
      } else {
        setSubscribeStatus('error');
      }
    } catch (err) {
      setSubscribeStatus('error');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-[var(--surface-default)] border-t border-[var(--border-level-2)] pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand & Social */}
          <div className="flex flex-col gap-6">
            <Link href={`/${portal}`} className="flex items-center gap-2 w-fit">
              {(lightLogoUrl || darkLogoUrl) ? (
                <img 
                  src={theme === "dark" ? (darkLogoUrl || lightLogoUrl) : (lightLogoUrl || darkLogoUrl)} 
                  alt={`${siteName} Logo`}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="8" fill="var(--color-primary)"/>
                  <path d="M12 20H28M12 14H28M12 26H20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              )}
            </Link>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-xs">
              Pioneering the future of events and entertainment in Qatar. Creating unforgettable moments through innovation.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {settings.socialTwitter && (
                <a href={settings.socialTwitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-[var(--text-tertiary)] hover:text-[var(--color-primary)] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
              )}
              {settings.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[var(--text-tertiary)] hover:text-[var(--color-primary)] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              )}
              {settings.socialLinkedin && (
                <a href={settings.socialLinkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-[var(--text-tertiary)] hover:text-[var(--color-primary)] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              )}
              {settings.socialYoutube && (
                <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-[var(--text-tertiary)] hover:text-[var(--color-primary)] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                </a>
              )}
              {settings.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-[var(--text-tertiary)] hover:text-[var(--color-primary)] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {settings.socialSnapchat && (
                <a href={settings.socialSnapchat} target="_blank" rel="noopener noreferrer" aria-label="Snapchat" className="text-[var(--text-tertiary)] hover:text-[var(--color-primary)] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>
                </a>
              )}
              {settings.bookingqubeWebsite && (
                <a href={settings.bookingqubeWebsite} target="_blank" rel="noopener noreferrer" aria-label="BookingQube" className="text-[var(--text-tertiary)] hover:text-[var(--color-primary)] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-sm">
              {t("footer.quickLinks")}
            </h3>
            <ul className="flex flex-col gap-3">
              {links.map((link, index) => (
                <li key={`${link.href}-${index}`}>
                  <Link href={link.href} className="text-[var(--text-secondary)] hover:text-[var(--color-primary)] text-sm transition-colors">
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-sm">
              {t("footer.contact")}
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-[var(--text-secondary)]">
              {address && <li>{address}</li>}
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-[var(--color-primary)] transition-colors">
                    {phone}
                  </a>
                </li>
              )}
              {emailAddr && (
                <li>
                  <a href={`mailto:${emailAddr}`} className="hover:text-[var(--color-primary)] transition-colors">
                    {emailAddr}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-sm">
              {t("footer.newsletter")}
            </h3>
            <form className="relative flex flex-col gap-2" onSubmit={handleSubscribe}>
              <div className="relative flex items-center">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[var(--surface-active)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm rounded-lg ps-4 pe-12 py-3 outline-none focus:border-[var(--color-primary)] transition-colors"
                  required
                  disabled={subscribing}
                />
                <button 
                  type="submit"
                  aria-label="Subscribe"
                  disabled={subscribing}
                  className="absolute end-2 rtl:start-2 rtl:end-auto p-1.5 text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)] hover:text-white rounded-md transition-all disabled:opacity-50"
                >
                  {subscribing ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={16} className={cn(dir === 'rtl' ? "rotate-180" : "")} />
                  )}
                </button>
              </div>
              {subscribeStatus === 'success' && (
                <p className="text-xs text-[var(--color-success)] font-medium mt-1">Successfully subscribed! Please check your email.</p>
              )}
              {subscribeStatus === 'error' && (
                <p className="text-xs text-[var(--color-danger)] font-medium mt-1">Failed to subscribe. Please try again.</p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border-level-1)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--text-tertiary)]">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms of Service</Link>
            
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#22C55E10] text-[var(--color-success)] font-medium border border-[#22C55E20]">
              <ShieldCheck size={14} />
              <span>Qatar PDPL Compliant</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
