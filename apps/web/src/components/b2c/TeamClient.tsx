"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Search, Filter, Briefcase, Award } from "lucide-react";

export function TeamClient({ locale, initialMembers }: { locale: string; initialMembers: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDepartment, setActiveDepartment] = useState("All");

  const departments = ["All", ...Array.from(new Set(initialMembers.map(m => m.department)))];

  const filteredMembers = initialMembers.filter(member => {
    const matchesSearch = member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = activeDepartment === "All" || member.department === activeDepartment;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500/30">
      {/* Noise Texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* HERO */}
        <header className="mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 text-white"
          >
            The Visionaries.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-zinc-400 max-w-3xl leading-relaxed"
          >
            A collective of industrial designers, master fabricators, and event strategists redefining what's possible in the MENA region.
          </motion.p>
        </header>

        {/* FILTERS & SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 border-b border-zinc-900 pb-8">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setActiveDepartment(dept)}
                className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-colors whitespace-nowrap ${
                  activeDepartment === dept 
                    ? "bg-amber-500 text-zinc-950" 
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search visionaries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
        </div>

        {/* LIST / GRID */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredMembers.map((member, i) => (
              <motion.div
                key={member.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link 
                  href={`/en/b2c/team/${member.slug}`}
                  className="group flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 rounded-3xl bg-transparent hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800 transition-all duration-500"
                >
                  <div className="flex items-center gap-8 mb-6 md:mb-0">
                    {/* Image */}
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800 group-hover:border-amber-500/50 transition-colors">
                      {member.profileImage ? (
                        <img src={member.profileImage} alt={member.firstName} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700 font-black text-2xl">
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    {/* Name */}
                    <div>
                      <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-300 group-hover:text-white transition-colors mb-2">
                        {member.firstName} {member.lastName}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-sm font-mono text-zinc-500">
                        <span className="text-amber-500 font-bold uppercase tracking-widest">{member.designation}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                        <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {member.yearsOfExperience} YRS EXP</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side / Tags */}
                  <div className="flex items-center justify-between w-full md:w-auto gap-8">
                    <div className="hidden lg:flex gap-2">
                      {(member.expertiseTags as string[])?.slice(0, 3).map(tag => (
                        <span key={tag} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-400 group-hover:border-zinc-700 transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="w-12 h-12 rounded-full border border-zinc-800 group-hover:border-amber-500 flex items-center justify-center group-hover:bg-amber-500 text-zinc-500 group-hover:text-zinc-950 transition-all duration-300 shrink-0">
                      <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-900 to-transparent my-2" />
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredMembers.length === 0 && (
            <div className="text-center py-32">
              <p className="text-zinc-500 text-xl font-medium">No visionaries found matching your criteria.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
