"use client";

import * as React from "react";
import Link from "next/link";
import { useLocale } from "./LocaleProvider";
import { Send, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  portal: "b2c" | "b2b";
}

const contactInfo = {
  address: "Building 123, E3 Zone, Doha, Qatar",
  phone: "+974 4444 5555",
  email: "info@eeeqa.com"
};

const quickLinks = {
  b2c: [
    { label: "nav.events", href: "/b2c/calendar" },
    { label: "nav.tickets", href: "/b2c/tickets" },
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

const partners = ["Qatar Airways", "Ooredoo", "Qatar Tourism", "United Development Co (UDC)", "Qatar Calendar"];

export function Footer({ portal }: FooterProps) {
  const { t, dir } = useLocale();
  const links = quickLinks[portal] || quickLinks.b2c;

  return (
    <footer className="bg-[var(--surface-default)] border-t border-[var(--border-level-2)] pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand & Social */}
          <div className="flex flex-col gap-6">
            <Link href={`/${portal}`} className="flex items-center gap-2 w-fit">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="var(--color-primary)"/>
                <path d="M12 20H28M12 14H28M12 26H20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <span className="font-bold text-xl tracking-tight">E3 Qatar</span>
            </Link>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-xs">
              Pioneering the future of events and entertainment in Qatar. Creating unforgettable moments through innovation.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Twitter" className="text-[var(--text-tertiary)] hover:text-[var(--color-primary)] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-[var(--text-tertiary)] hover:text-[var(--color-primary)] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="text-[var(--text-tertiary)] hover:text-[var(--color-primary)] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-sm">
              {t("footer.quickLinks")}
            </h3>
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.href}>
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
              <li>{contactInfo.address}</li>
              <li>
                <a href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`} className="hover:text-[var(--color-primary)] transition-colors">
                  {contactInfo.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contactInfo.email}`} className="hover:text-[var(--color-primary)] transition-colors">
                  {contactInfo.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Marquee */}
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-sm">
              {t("footer.newsletter")}
            </h3>
            <form className="relative flex items-center" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-[var(--surface-active)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-sm rounded-sg ps-4 pe-12 py-3 outline-none focus:border-[var(--color-primary)] transition-colors"
                required
              />
              <button 
                type="submit"
                aria-label="Subscribe"
                className="absolute end-2 rtl:start-2 rtl:end-auto p-1.5 text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)] hover:text-white rounded-md transition-all"
              >
                <Send size={16} className={cn(dir === 'rtl' ? "rotate-180" : "")} />
              </button>
            </form>
            
            <div className="mt-4 overflow-hidden relative w-full h-8">
              <div className="absolute top-0 flex animate-marquee whitespace-nowrap gap-8 items-center text-[var(--text-tertiary)] text-xs font-semibold uppercase tracking-wider">
                {partners.map((p, i) => <span key={i}>{p}</span>)}
                {/* Duplicate for infinite effect */}
                {partners.map((p, i) => <span key={`dup-${i}`}>{p}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border-level-1)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--text-tertiary)]">
          <p>© {new Date().getFullYear()} E3 Qatar. All rights reserved.</p>
          
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
