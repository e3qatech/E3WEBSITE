"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, HeadphonesIcon, HelpCircle, Phone, Mail, Clock, Search, ChevronDown, ChevronUp, FileUp, Quote } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function ContactClient({ 
  attractions, 
  attractionFaqs, 
  generalFaqs, 
  pageSettings,
  featuredFeedbacks
}: { 
  attractions: any[], 
  attractionFaqs: any[], 
  generalFaqs: any[],
  pageSettings: any,
  featuredFeedbacks: any[]
}) {
  const [activeTab, setActiveTab] = useState("support");
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState("");
  const [faqFilter, setFaqFilter] = useState("all");

  const toggleFaq = (id: string) => {
    setActiveFaq(prev => (prev === id ? null : id));
  };

  const allFaqs = [
    ...(Array.isArray(generalFaqs) ? generalFaqs : []).map(f => ({ ...f, type: 'general', attractionId: null })),
    ...(Array.isArray(attractionFaqs) ? attractionFaqs : []).map(f => ({ ...f, type: 'attraction' }))
  ];

  const filteredFaqs = allFaqs.filter(faq => {
    const qStr = faq.questionEn || "";
    const aStr = faq.answerEn || "";
    const matchesSearch = qStr.toLowerCase().includes(faqSearch.toLowerCase()) || aStr.toLowerCase().includes(faqSearch.toLowerCase());
    const matchesFilter = faqFilter === "all" || (faqFilter === "general" && faq.type === "general") || faq.attractionId === faqFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Righteous&family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-righteous { font-family: 'Righteous', cursive; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}} />
      <div className="min-h-screen font-poppins text-[#FAFAFA] bg-[#0F0F23] selection:bg-[#F43F5E]/30 relative">
        
        {/* Interactive Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-64 -left-64 w-[800px] h-[800px] bg-[#7C3AED] rounded-full mix-blend-screen filter blur-[128px] opacity-20"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/2 -right-64 w-[600px] h-[600px] bg-[#F43F5E] rounded-full mix-blend-screen filter blur-[128px] opacity-20"
          />
        </div>

        {/* HERO SECTION */}
        <div className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-[#0F0F23] border-b border-[#7C3AED]/20 z-10">
        {pageSettings.heroMediaType === "VIDEO" && pageSettings.heroMediaUrl && (
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-40">
            <source src={pageSettings.heroMediaUrl} type="video/mp4" />
          </video>
        )}
        {pageSettings.heroMediaType === "IMAGE" && pageSettings.heroMediaUrl && (
          <img src={pageSettings.heroMediaUrl} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        )}
        {pageSettings.heroMediaType === "IFRAME" && pageSettings.heroMediaUrl && (
          <iframe src={pageSettings.heroMediaUrl} className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
        )}
        {(!pageSettings.heroMediaType || !pageSettings.heroMediaUrl) && (
           <motion.div 
             animate={{ 
               background: [
                 'radial-gradient(circle at 20% 30%, rgba(124, 58, 237, 0.15) 0%, rgba(15, 15, 35, 1) 50%)',
                 'radial-gradient(circle at 80% 70%, rgba(244, 63, 94, 0.15) 0%, rgba(15, 15, 35, 1) 50%)',
                 'radial-gradient(circle at 20% 30%, rgba(124, 58, 237, 0.15) 0%, rgba(15, 15, 35, 1) 50%)'
               ]
             }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 w-full h-full"
           />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F23] to-transparent" />
        
        <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-[#7C3AED]/10 text-[#F43F5E] mb-8 border border-[#F43F5E]/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]"
          >
            <HeadphonesIcon className="w-8 h-8" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight font-righteous">
            {pageSettings.title || "How Can We Help?"}
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            {pageSettings.tagline || "Need support with a ticket, want to leave feedback, or just have a general question? We're here for you."}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 pt-12 relative z-20">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="support" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="support" className="gap-2"><HeadphonesIcon className="w-4 h-4" /> Support</TabsTrigger>
              <TabsTrigger value="feedback" className="gap-2"><MessageSquare className="w-4 h-4" /> Feedback</TabsTrigger>
              <TabsTrigger value="faq" className="gap-2"><HelpCircle className="w-4 h-4" /> FAQ</TabsTrigger>
            </TabsList>
          
            <div className="mt-8 bg-[#1A1A2E]/60 backdrop-blur-md border border-[#7C3AED]/30 hover:border-[#F43F5E]/50 rounded-xl p-6 md:p-8 shadow-[0_0_20px_rgba(124,58,237,0.1)] transition-colors relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
              <TabsContent value="support"><SupportForm attractions={attractions} /></TabsContent>
              <TabsContent value="feedback"><FeedbackForm attractions={attractions} /></TabsContent>
              <TabsContent value="faq">
                <FaqSection 
                  faqs={filteredFaqs} 
                  attractions={attractions}
                  search={faqSearch}
                  setSearch={setFaqSearch}
                  filter={faqFilter}
                  setFilter={setFaqFilter}
                  activeFaq={activeFaq}
                  toggleFaq={toggleFaq}
                  switchToSupport={() => setActiveTab("support")}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* SIDEBAR AREA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1A1A2E]/60 backdrop-blur-md border border-[#7C3AED]/30 rounded-xl p-8 shadow-[0_0_20px_rgba(124,58,237,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
            <h3 className="text-xl font-black text-white mb-6 tracking-tight relative z-10 font-righteous">Quick Contact</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[#0F0F23]/80 border border-[#7C3AED]/20 transition-colors hover:border-[#F43F5E]/50 group cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-[#7C3AED]/20 text-[#7C3AED] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:text-[#F43F5E] transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white font-mono text-sm uppercase tracking-wider">WhatsApp Support</h4>
                  <p className="text-sm text-zinc-400 mb-1 font-mono">+974 4400 0000</p>
                  <span className="text-sm text-[#7C3AED] font-bold group-hover:underline group-hover:text-[#F43F5E]">Message us &rarr;</span>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[#0F0F23]/80 border border-[#7C3AED]/20 transition-colors hover:border-[#F43F5E]/50 group cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-[#F43F5E]/20 text-[#F43F5E] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:text-[#7C3AED] transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white font-mono text-sm uppercase tracking-wider">Email Us</h4>
                  <p className="text-sm text-zinc-400 mb-1 font-mono">support@e3.qa</p>
                  <span className="text-sm text-[#F43F5E] font-bold group-hover:underline group-hover:text-[#7C3AED]">Send email &rarr;</span>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[#0F0F23]/80 border border-[#7C3AED]/20">
                <div className="w-12 h-12 rounded-lg bg-zinc-800/50 text-zinc-400 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white font-mono text-sm uppercase tracking-wider">Operating Hours</h4>
                  <p className="text-sm text-zinc-400 font-medium mt-1 font-mono">Sun - Thu: <span className="text-white">9:00 AM - 6:00 PM</span></p>
                  <p className="text-sm text-zinc-400 font-medium font-mono">Fri - Sat: <span className="text-white">1:00 PM - 9:00 PM</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL LINKS */}
          <div className="bg-[#1A1A2E]/60 backdrop-blur-md border border-[#7C3AED]/30 rounded-xl p-8 relative overflow-hidden group shadow-[0_0_20px_rgba(124,58,237,0.1)]">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Instagram className="w-32 h-32 text-[#F43F5E]" />
            </div>
            <h3 className="text-xl font-black text-white mb-6 relative z-10 tracking-tight font-righteous">Connect with Us</h3>
            <p className="text-zinc-400 mb-6 relative z-10 font-mono text-sm">Follow us for the latest updates, event announcements, and exclusive offers.</p>
            <div className="flex gap-4 relative z-10">
              <a href="#" className="w-12 h-12 rounded-lg bg-[#0F0F23] border border-[#7C3AED]/30 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#7C3AED] hover:border-[#7C3AED] hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-all hover:-translate-y-1">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-lg bg-[#0F0F23] border border-[#7C3AED]/30 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#F43F5E] hover:border-[#F43F5E] hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all hover:-translate-y-1">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-lg bg-[#0F0F23] border border-[#7C3AED]/30 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#7C3AED] hover:border-[#7C3AED] hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-all hover:-translate-y-1">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-lg bg-[#0F0F23] border border-[#7C3AED]/30 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#F43F5E] hover:border-[#F43F5E] hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all hover:-translate-y-1">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        </div>
      </div>
      </div>
      {/* WHAT PEOPLE ARE SAYING */}
      {featuredFeedbacks && featuredFeedbacks.length > 0 && (
        <div className="max-w-6xl mx-auto p-4 md:p-8 mt-12 mb-24 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight font-righteous">What People Are Saying</h2>
            <p className="text-zinc-400 mt-4 font-mono">Real feedback from our amazing customers and partners.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredFeedbacks.map((fb, idx) => (
              <motion.div 
                key={fb.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#1A1A2E]/60 backdrop-blur-md border border-[#7C3AED]/30 rounded-xl p-8 relative overflow-hidden shadow-[0_0_20px_rgba(124,58,237,0.1)] hover:border-[#F43F5E]/50 transition-colors"
              >
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
                <Quote className="absolute top-6 right-6 w-12 h-12 text-[#7C3AED]/20" />
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < (fb.rating || 5) ? 'fill-[#F43F5E] text-[#F43F5E]' : 'text-zinc-700'}`} />
                  ))}
                </div>
                <p className="text-zinc-200 italic mb-6 relative z-10 leading-relaxed text-lg">&quot;{fb.message}&quot;</p>
                <div>
                  <p className="font-bold text-white">{fb.name || "Anonymous"}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function SupportForm({ attractions }: { attractions: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API Call for support
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch("/api/contact/b2c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "SUPPORT_TICKET",
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
        })
      });
      if (res.ok) setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2 font-righteous">Request Submitted</h3>
        <p className="text-zinc-400 mb-6">Your ticket number is <strong>#E3-{Math.floor(Math.random() * 10000)}</strong>. We will get back to you shortly.</p>
        <button onClick={() => setSuccess(false)} className="bg-[#1A1A2E] text-white border border-[#7C3AED]/50 hover:bg-[#7C3AED]/20 px-6 py-2 rounded-xl font-bold transition-colors">
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name *</label>
          <input name="name" required placeholder="John Doe" className="w-full bg-[#0F0F23] border border-[#7C3AED]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E] transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address *</label>
          <input name="email" type="email" required placeholder="john@example.com" className="w-full bg-[#0F0F23] border border-[#7C3AED]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E] transition-all" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Phone Number</label>
          <input name="phone" type="tel" placeholder="+974 5555 5555" className="w-full bg-[#0F0F23] border border-[#7C3AED]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E] transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Category</label>
          <select name="category" className="w-full bg-[#0F0F23] border border-[#7C3AED]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E] transition-all appearance-none">
            <option value="ticket_issue">Ticket Issue</option>
            <option value="venue_question">Venue Question</option>
            <option value="complaint">Complaint</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Related Attraction (Optional)</label>
        <select name="attractionId" className="w-full bg-[#0F0F23] border border-[#7C3AED]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E] transition-all appearance-none">
          <option value="">General / Not specified</option>
          {attractions.map(a => <option key={a.id} value={a.id}>{a.nameEn}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Message *</label>
        <textarea 
          name="message" 
          required 
          rows={5} 
          className="w-full bg-[#0F0F23] border border-[#7C3AED]/30 rounded-xl p-4 text-white focus:outline-none focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E] transition-all"
          placeholder="How can we help you?"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Attachment (Optional)</label>
        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#7C3AED]/30 rounded-xl cursor-pointer hover:bg-[#7C3AED]/10 hover:border-[#F43F5E]/50 transition-colors">
          <div className="flex flex-col items-center">
            <FileUp className="w-8 h-8 text-zinc-500 mb-2" />
            <span className="text-sm text-zinc-400">{file ? file.name : "Click to upload (Max 5MB)"}</span>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*,.pdf" 
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected && selected.size <= 5 * 1024 * 1024) setFile(selected);
              else alert("File must be smaller than 5MB");
            }}
          />
        </label>
      </div>

      <button type="submit" className="w-full bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] text-white font-bold px-6 py-3 rounded-xl min-h-[48px] hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] active:scale-95 transition-all" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Support Request"}
      </button>
    </form>
  );
}

function FeedbackForm({ attractions }: { attractions: any[] }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch("/api/contact/b2c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "FEEDBACK",
          name: data.name,
          email: data.email,
          message: data.message,
          rating: rating.toString(),
          attractionId: data.attractionId,
        })
      });
      if (res.ok) setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[#F43F5E]/20 text-[#F43F5E] rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 fill-[#F43F5E]" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2 font-righteous">Thank You!</h3>
        <p className="text-zinc-400 mb-6">Your feedback helps us improve our experiences.</p>
        <button onClick={() => { setSuccess(false); setRating(0); }} className="bg-[#1A1A2E] text-white border border-[#7C3AED]/50 hover:bg-[#7C3AED]/20 px-6 py-2 rounded-xl font-bold transition-colors">
          Submit More Feedback
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <label className="block text-lg font-bold text-white mb-4">How was your experience?</label>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star 
                className={`w-10 h-10 ${(hoverRating || rating) >= star ? "fill-[#F43F5E] text-[#F43F5E]" : "text-zinc-700"}`} 
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Attraction</label>
        <select name="attractionId" className="w-full bg-[#0F0F23] border border-[#7C3AED]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E] transition-all appearance-none">
          <option value="">General Feedback</option>
          {attractions.map(a => <option key={a.id} value={a.id}>{a.nameEn}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Tell us more *</label>
        <textarea 
          name="message" 
          required 
          rows={4} 
          className="w-full bg-[#0F0F23] border border-[#7C3AED]/30 rounded-xl p-4 text-white focus:outline-none focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E] transition-all"
          placeholder="What did you love? What could be better?"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Name (Optional)</label>
          <input name="name" placeholder="John Doe" className="w-full bg-[#0F0F23] border border-[#7C3AED]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E] transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Email (Optional)</label>
          <input name="email" type="email" placeholder="john@example.com" className="w-full bg-[#0F0F23] border border-[#7C3AED]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E] transition-all" />
        </div>
      </div>

      <button type="submit" className="w-full bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] text-white font-bold px-6 py-3 rounded-xl min-h-[48px] hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] active:scale-95 transition-all" disabled={isSubmitting || rating === 0}>
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  )
}

function FaqSection({ faqs, attractions, search, setSearch, filter, setFilter, activeFaq, toggleFaq, switchToSupport }: any) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full bg-[#0F0F23] border border-[#7C3AED]/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E] transition-all"
          />
        </div>
        <div className="w-full md:w-64">
          <select 
            value={filter} 
            onChange={(e: any) => setFilter(e.target.value)}
            className="w-full bg-[#0F0F23] border border-[#7C3AED]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E] transition-all appearance-none"
          >
            <option value="all">All Topics</option>
            <option value="general">General</option>
            {attractions.map((a: any) => <option key={a.id} value={a.id}>{a.nameEn}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {faqs.length === 0 ? (
          <p className="text-center py-8 text-zinc-400">No FAQs found matching your search.</p>
        ) : (
          faqs.map((faq: any) => {
            const isActive = activeFaq === faq.id;
            return (
              <div key={faq.id} className="border border-[#7C3AED]/30 rounded-2xl overflow-hidden bg-[#1A1A2E]/50 backdrop-blur-md transition-colors hover:border-[#F43F5E]/50">
                <button 
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#7C3AED]/10 transition-colors"
                >
                  <span className="font-bold text-white pr-8">{faq.questionEn}</span>
                  {isActive ? <ChevronUp className="w-5 h-5 text-[#F43F5E] shrink-0" /> : <ChevronDown className="w-5 h-5 text-zinc-400 shrink-0" />}
                </button>
                {isActive && (
                  <div className="p-5 pt-0 text-zinc-300 border-t border-[#7C3AED]/20">
                    <div className="pt-4">{faq.answerEn}</div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="text-center pt-8 border-t border-[#7C3AED]/20">
        <p className="text-zinc-400 mb-4">Still need help?</p>
        <button onClick={switchToSupport} className="bg-[#1A1A2E] text-white border border-[#7C3AED]/50 hover:bg-[#7C3AED]/20 px-6 py-2 rounded-xl font-bold transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  );
}

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

function Twitter({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
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
