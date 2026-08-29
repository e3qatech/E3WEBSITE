"use client";

import React, { useState } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

interface TestimonialItem {
  quoteEn?: string;
  quoteAr?: string;
  quote?: string;
  authorName?: string;
  authorNameEn?: string;
  authorNameAr?: string;
  authorEn?: string;
  authorAr?: string;
  authorRole?: string;
  authorRoleEn?: string;
  authorRoleAr?: string;
  roleEn?: string;
  roleAr?: string;
  authorCompany?: string;
  authorCompanyAr?: string;
  companyEn?: string;
  companyAr?: string;
  company?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  isVisible?: boolean;
}

interface CaseTestimonialsSectionProps {
  locale?: string;
  testimonials?: TestimonialItem[] | null;
}

export function CaseTestimonialsSection({
  locale = "en",
  testimonials = [],
}: CaseTestimonialsSectionProps) {
  const isAr = locale === "ar";

  const visibleTestimonials = (testimonials || []).filter(
    (t) => t.isVisible !== false && (Boolean(t.quoteEn) || Boolean(t.quoteAr))
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  if (visibleTestimonials.length === 0) {
    return null;
  }

  const isCarousel = visibleTestimonials.length > 1;
  const current = visibleTestimonials[currentIndex];
  const quoteText = isAr
    ? current.quoteAr || current.quoteEn
    : current.quoteEn || current.quoteAr;

  const authorName = isAr
    ? current.authorNameAr || current.authorName || current.authorNameEn || "ممثل الجهة"
    : current.authorNameEn || current.authorName || current.authorNameAr || "Client Representative";

  const authorRole = isAr
    ? current.authorRoleAr || current.authorRole || current.authorRoleEn
    : current.authorRoleEn || current.authorRole || current.authorRoleAr;

  const authorCompany = isAr
    ? current.authorCompanyAr || current.authorCompany
    : current.authorCompany || current.authorCompanyAr;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % visibleTestimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + visibleTestimonials.length) % visibleTestimonials.length);
  };

  return (
    <section
      id="testimonials"
      data-testid="case-testimonials-section"
      aria-label={isAr ? "شهادات وآراء العملاء" : "Client Testimonials"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0c1222] via-[#090d18] to-[#0c1222] border border-white/10 p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden">
        {/* Background Quote Icon Accent */}
        <Quote
          className="absolute -top-6 -end-6 w-36 h-36 text-white/[0.03] pointer-events-none -rotate-12"
          aria-hidden="true"
        />

        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider border border-cyan-500/20">
            <Quote className="w-3.5 h-3.5" />
            <span>{isAr ? "شهادة العميل والشريك" : "CLIENT & PARTNER ENDORSEMENT"}</span>
          </div>

          {/* Quote Body */}
          <blockquote className="text-lg sm:text-2xl md:text-3xl font-serif italic text-slate-100 leading-relaxed max-w-3xl">
            &ldquo;{quoteText}&rdquo;
          </blockquote>

          {/* Author & Designation + Carousel Controls */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-base sm:text-lg font-bold text-white font-syne">
                {authorName}
              </div>
              {(authorRole || authorCompany) && (
                <div className="text-xs sm:text-sm font-mono text-cyan-400 font-medium">
                  {[authorRole, authorCompany].filter(Boolean).join(" • ")}
                </div>
              )}
            </div>

            {isCarousel && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 me-2">
                  {currentIndex + 1} / {visibleTestimonials.length}
                </span>
                <button
                  type="button"
                  onClick={isAr ? handleNext : handlePrev}
                  aria-label={isAr ? "الشهادة التالية" : "Previous Testimonial"}
                  data-testid="testimonial-prev-btn"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={isAr ? handlePrev : handleNext}
                  aria-label={isAr ? "الشهادة السابقة" : "Next Testimonial"}
                  data-testid="testimonial-next-btn"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
