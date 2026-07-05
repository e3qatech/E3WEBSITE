"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UniversalMediaRenderer as MediaRenderer } from "@/components/shared/UniversalMediaRenderer";

type CaseStudyStub = {
  id: string;
  slug: string;
  titleEn: string;
  clientName: string;
  year: number;
  category: string;
  thumbnailUrl: string | null;
  thumbnailMediaType?: string;
  heroImageUrl: string | null;
  heroMediaType?: string;
  isFeatured: boolean;
  metrics: any;
};

export function CaseStudiesClient({ initialCaseStudies }: { initialCaseStudies: CaseStudyStub[] }) {
  const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Extract unique years and categories for filters
  const years = useMemo(() => Array.from(new Set(initialCaseStudies.map(cs => cs.year))).sort((a, b) => b - a), [initialCaseStudies]);
  const categories = useMemo(() => Array.from(new Set(initialCaseStudies.map(cs => cs.category))).sort(), [initialCaseStudies]);

  // Client-side filtering
  const filteredStudies = useMemo(() => {
    return initialCaseStudies.filter(cs => {
      const matchYear = selectedYear === 'All' || cs.year === selectedYear;
      const matchCategory = selectedCategory === 'All' || cs.category === selectedCategory;
      return matchYear && matchCategory;
    });
  }, [initialCaseStudies, selectedYear, selectedCategory]);

  const featuredStudy = filteredStudies.find(cs => cs.isFeatured);
  // Exclude featured from the main grid if it's currently being shown as featured
  const gridStudies = featuredStudy ? filteredStudies.filter(cs => cs.id !== featuredStudy.id) : filteredStudies;

  // Helper to extract a single metric to highlight
  const getHighlightMetric = (metrics: any) => {
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) return null;
    const m = metrics[0];
    return `${m.prefix || ''}${m.value}${m.suffix || ''} ${m.label || ''}`;
  };

  return (
    <div className="pt-32 pb-32 px-4 md:px-8 max-w-[1400px] mx-auto min-h-screen">
      
      {/* 1. HERO */}
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black mb-6 text-[var(--text-primary)]"
        >
          Our Track Record
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-[var(--text-secondary)]"
        >
          Over {initialCaseStudies.length} successful projects delivered globally across corporate, government, and entertainment sectors.
        </motion.p>
      </div>

      {/* 2. FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--surface-raised)] border border-[var(--border-subtle)] p-4 rounded-2xl mb-16">
        <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
          <Filter size={20} />
          <span>Filters:</span>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[var(--surface-sunken)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none cursor-pointer hover:border-[var(--color-primary)] transition-colors"
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value === 'All' ? 'All' : parseInt(e.target.value))}
            className="bg-[var(--surface-sunken)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none cursor-pointer hover:border-[var(--color-primary)] transition-colors"
          >
            <option value="All">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          
          {(selectedYear !== 'All' || selectedCategory !== 'All') && (
            <button 
              onClick={() => { setSelectedYear('All'); setSelectedCategory('All'); }}
              className="text-sm flex items-center gap-1 text-[var(--color-danger)] hover:underline"
            >
              <X size={16} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. FEATURED CASE STUDY (Full width hero card) */}
      {featuredStudy && (
        <motion.div 
          layout
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-3xl overflow-hidden mb-16 group cursor-pointer block h-[60vh] min-h-[400px]"
        >
          <Link href={`/b2b/case-studies/${featuredStudy.slug}`} className="absolute inset-0 z-20">
            <span className="sr-only">View Case Study</span>
          </Link>
          <MediaRenderer 
            src={featuredStudy.heroImageUrl || featuredStudy.thumbnailUrl || ""} 
            type={(featuredStudy.heroMediaType || featuredStudy.thumbnailMediaType || "IMAGE") as any}
            alt={featuredStudy.titleEn}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
          
          <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end text-white z-10 pointer-events-none">
             <div className="flex items-center gap-3 mb-4">
               <span className="px-3 py-1 text-sm font-bold bg-[var(--color-primary)] rounded-full">{featuredStudy.category}</span>
               <span className="text-white/80 font-medium">{featuredStudy.year}</span>
             </div>
             <h2 className="text-4xl md:text-6xl font-black mb-4">{featuredStudy.titleEn}</h2>
             <div className="flex items-center justify-between w-full">
               <p className="text-xl md:text-2xl font-light text-white/90">Client: {featuredStudy.clientName}</p>
               
               {getHighlightMetric(featuredStudy.metrics) && (
                 <div className="hidden md:block text-right">
                   <p className="text-sm text-[var(--color-primary)] font-bold tracking-widest uppercase mb-1">Key Result</p>
                   <p className="text-3xl font-black">{getHighlightMetric(featuredStudy.metrics)}</p>
                 </div>
               )}
             </div>
          </div>
        </motion.div>
      )}

      {/* 4. GRID */}
      {gridStudies.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {gridStudies.map((cs) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={cs.id}
                className="group cursor-pointer flex flex-col h-full bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden hover:border-[var(--color-primary)] transition-colors"
              >
                <Link href={`/b2b/case-studies/${cs.slug}`} className="relative h-64 md:h-80 overflow-hidden block">
                  <MediaRenderer
            src={cs.thumbnailUrl || cs.heroImageUrl || ""} 
            type={(cs.thumbnailMediaType || cs.heroMediaType || "IMAGE") as any}
            alt={cs.titleEn}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
                  <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/40 transition-colors duration-300 flex items-center justify-center">
                    <Button variant="primary" className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 rounded-full h-12 px-6 shadow-xl">
                      View Case Study
                    </Button>
                  </div>
                  <div className="absolute top-4 start-4 flex gap-2">
                    <span className="px-3 py-1 text-xs font-bold bg-zinc-950/60 backdrop-blur-md text-white rounded-full uppercase tracking-wider">{cs.category}</span>
                  </div>
                </Link>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">{cs.titleEn}</h3>
                    <p className="text-[var(--text-secondary)] mb-6">{cs.clientName} &bull; {cs.year}</p>
                  </div>
                  
                  {getHighlightMetric(cs.metrics) && (
                    <div className="pt-6 border-t border-[var(--border-subtle)] mt-auto">
                      <p className="text-3xl font-black text-[var(--text-primary)] mb-1">
                        {getHighlightMetric(cs.metrics)}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-32 text-[var(--text-secondary)]">
          <p className="text-2xl font-medium mb-4">No case studies found.</p>
          <p>Try adjusting your filters to see more results.</p>
        </div>
      )}
    </div>
  );
}
