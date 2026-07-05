"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

function Instagram({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function Facebook({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function Linkedin({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

export function B2BFooter({ settings = {} }: { settings?: Record<string, string> }) {
  const siteName = settings.siteNameEn || "E3 Corporate";
  const address = settings.addressEn || "";
  const phone = settings.contactPhone || "";
  const emailAddr = settings.contactEmail || "";
  const desc = settings.gatewayB2BDesc || "E3 turns ideas into landmark experiences — through creative design, fabrication, ticketing, staffing, operations, and measurable delivery across Qatar and the region.";
  
  const lightLogoUrl = settings.lightLogoUrl;
  const darkLogoUrl = settings.darkLogoUrl;

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Connect / Inquiry Strip (Usually would be a separate component just above footer) */}
        <div className="mb-20 p-10 md:p-16 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
          
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4 tracking-tight">Have a project in mind?</h2>
            <p className="text-lg text-zinc-400">Share your brief and our team will connect with you to shape the right concept and delivery plan.</p>
          </div>
          
          <div className="relative z-10 shrink-0">
            <Link 
              href="/b2b/contact" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-zinc-950 font-bold text-lg rounded-sm hover:bg-emerald-400 transition-colors"
            >
              Start Inquiry <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/b2b" className="flex items-center gap-2">
              {(lightLogoUrl || darkLogoUrl) ? (
                <img 
                  src={(darkLogoUrl || lightLogoUrl)} 
                  alt={`${siteName} Logo`}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-emerald-500 rounded-sm flex items-center justify-center font-bold text-white tracking-tighter">
                  E3
                </div>
              )}
              <span className="font-bold text-xl tracking-tight text-zinc-100">
                {!(lightLogoUrl || darkLogoUrl) ? "Corporate" : ""}
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              {desc}
            </p>
          </div>

          <div>
            <h4 className="text-zinc-100 font-bold mb-6 tracking-wide uppercase text-sm">Services</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/b2b/services/mega-events" className="hover:text-emerald-400 transition-colors">Mega Events</Link></li>
              <li><Link href="/b2b/services/family-entertainment-centers" className="hover:text-emerald-400 transition-colors">Family Entertainment Centers</Link></li>
              <li><Link href="/b2b/services/experiential-activations" className="hover:text-emerald-400 transition-colors">Experiential Activations</Link></li>
              <li><Link href="/b2b/services/shows-performances" className="hover:text-emerald-400 transition-colors">Shows & Performances</Link></li>
              <li><Link href="/b2b/services" className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium">View All Services &rarr;</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-zinc-100 font-bold mb-6 tracking-wide uppercase text-sm">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/b2b/case-studies" className="hover:text-emerald-400 transition-colors">Case Studies</Link></li>
              <li><Link href="/b2b/clients" className="hover:text-emerald-400 transition-colors">Clients & Partners</Link></li>
              <li><Link href="/b2b/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
              <li><Link href="/b2b/contact" className="hover:text-emerald-400 transition-colors">Contact / RFP</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-zinc-100 font-bold mb-6 tracking-wide uppercase text-sm">Connect</h4>
            <ul className="space-y-4 text-sm">
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                  <span>{address}</span>
                </li>
              )}
              {emailAddr && (
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                  <a href={`mailto:${emailAddr}`} className="hover:text-emerald-400 transition-colors">{emailAddr}</a>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-zinc-500 shrink-0" />
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-emerald-400 transition-colors">{phone}</a>
                </li>
              )}
            </ul>
            
            <div className="flex items-center gap-4 mt-6">
              {settings.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 hover:text-emerald-400 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 hover:text-emerald-400 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinkedin && (
                <a href={settings.socialLinkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 hover:text-emerald-400 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
