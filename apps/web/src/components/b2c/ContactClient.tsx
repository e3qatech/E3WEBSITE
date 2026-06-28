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
    ...generalFaqs.map(f => ({ ...f, type: 'general', attractionId: null })),
    ...attractionFaqs.map(f => ({ ...f, type: 'attraction' }))
  ];

  const filteredFaqs = allFaqs.filter(faq => {
    const matchesSearch = faq.questionEn?.toLowerCase().includes(faqSearch.toLowerCase()) || faq.answerEn?.toLowerCase().includes(faqSearch.toLowerCase());
    const matchesFilter = faqFilter === "all" || (faqFilter === "general" && faq.type === "general") || faq.attractionId === faqFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <div className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-zinc-900 border-b border-[var(--border-subtle)]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)] to-transparent" />
        
        <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-amber-500/10 text-amber-500 mb-8 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
          >
            <HeadphonesIcon className="w-8 h-8" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
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
          
            <div className="mt-8 bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
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
          <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl p-8 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
            <h3 className="text-xl font-black text-[var(--text-primary)] mb-6 tracking-tight relative z-10">Quick Contact</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] transition-colors hover:border-amber-500/50 group cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] font-mono text-sm uppercase tracking-wider">WhatsApp Support</h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-1 font-mono">+974 4400 0000</p>
                  <span className="text-sm text-green-500 font-bold group-hover:underline">Message us &rarr;</span>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] transition-colors hover:border-amber-500/50 group cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] font-mono text-sm uppercase tracking-wider">Email Us</h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-1 font-mono">support@e3.qa</p>
                  <span className="text-sm text-amber-500 font-bold group-hover:underline">Send email &rarr;</span>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)]">
                <div className="w-12 h-12 rounded-lg bg-zinc-500/10 text-zinc-400 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] font-mono text-sm uppercase tracking-wider">Operating Hours</h4>
                  <p className="text-sm text-[var(--text-secondary)] font-medium mt-1 font-mono">Sun - Thu: <span className="text-[var(--text-primary)]">9:00 AM - 6:00 PM</span></p>
                  <p className="text-sm text-[var(--text-secondary)] font-medium font-mono">Fri - Sat: <span className="text-[var(--text-primary)]">1:00 PM - 9:00 PM</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL LINKS */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Instagram className="w-32 h-32 text-amber-500" />
            </div>
            <h3 className="text-xl font-black text-white mb-6 relative z-10 tracking-tight">Connect with Us</h3>
            <p className="text-zinc-400 mb-6 relative z-10 font-mono text-sm">Follow us for the latest updates, event announcements, and exclusive offers.</p>
            <div className="flex gap-4 relative z-10">
              <a href="#" className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-amber-500 hover:border-amber-500 transition-all hover:-translate-y-1">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-amber-500 hover:border-amber-500 transition-all hover:-translate-y-1">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-amber-500 hover:border-amber-500 transition-all hover:-translate-y-1">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-amber-500 hover:border-amber-500 transition-all hover:-translate-y-1">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* WHAT PEOPLE ARE SAYING */}
      {featuredFeedbacks && featuredFeedbacks.length > 0 && (
        <div className="max-w-6xl mx-auto p-4 md:p-8 mt-12 mb-24 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight">What People Are Saying</h2>
            <p className="text-[var(--text-secondary)] mt-4 font-mono">Real feedback from our amazing customers and partners.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredFeedbacks.map((fb, idx) => (
              <motion.div 
                key={fb.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl p-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
                <Quote className="absolute top-6 right-6 w-12 h-12 text-[var(--border-subtle)] opacity-50" />
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < (fb.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}`} />
                  ))}
                </div>
                <p className="text-[var(--text-primary)] italic mb-6 relative z-10 leading-relaxed text-lg">&quot;{fb.message}&quot;</p>
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{fb.name || "Anonymous"}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
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
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Request Submitted</h3>
        <p className="text-[var(--text-secondary)] mb-6">Your ticket number is <strong>#E3-{Math.floor(Math.random() * 10000)}</strong>. We will get back to you shortly.</p>
        <Button onClick={() => setSuccess(false)}>Submit Another Request</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Full Name *</label>
          <Input name="name" required placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email Address *</label>
          <Input name="email" type="email" required placeholder="john@example.com" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Phone Number</label>
          <Input name="phone" type="tel" placeholder="+974 5555 5555" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Category</label>
          <Select name="category" options={[
            { value: "ticket_issue", label: "Ticket Issue" },
            { value: "venue_question", label: "Venue Question" },
            { value: "complaint", label: "Complaint" },
            { value: "other", label: "Other" }
          ]} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Related Attraction (Optional)</label>
        <Select name="attractionId" options={[
          { value: "", label: "General / Not specified" },
          ...attractions.map(a => ({ value: a.id, label: a.nameEn }))
        ]} />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Message *</label>
        <textarea 
          name="message" 
          required 
          rows={5} 
          className="w-full bg-[var(--surface-sunken)] border border-[var(--border-subtle)] rounded-xl p-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="How can we help you?"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Attachment (Optional)</label>
        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[var(--border-subtle)] rounded-xl cursor-pointer hover:bg-[var(--surface-hover)] transition-colors">
          <div className="flex flex-col items-center">
            <FileUp className="w-8 h-8 text-[var(--text-secondary)] mb-2" />
            <span className="text-sm text-[var(--text-secondary)]">{file ? file.name : "Click to upload (Max 5MB)"}</span>
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Support Request"}
      </Button>
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
        <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 fill-yellow-500" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Thank You!</h3>
        <p className="text-[var(--text-secondary)] mb-6">Your feedback helps us improve our experiences.</p>
        <Button onClick={() => { setSuccess(false); setRating(0); }}>Submit More Feedback</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <label className="block text-lg font-bold text-[var(--text-primary)] mb-4">How was your experience?</label>
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
                className={`w-10 h-10 ${(hoverRating || rating) >= star ? "fill-yellow-500 text-yellow-500" : "text-[var(--border-subtle)]"}`} 
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Attraction</label>
        <Select name="attractionId" options={[
          { value: "", label: "General Feedback" },
          ...attractions.map(a => ({ value: a.id, label: a.nameEn }))
        ]} />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Tell us more *</label>
        <textarea 
          name="message" 
          required 
          rows={4} 
          className="w-full bg-[var(--surface-sunken)] border border-[var(--border-subtle)] rounded-xl p-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="What did you love? What could be better?"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Name (Optional)</label>
          <Input name="name" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email (Optional)</label>
          <Input name="email" type="email" placeholder="john@example.com" />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || rating === 0}>
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full bg-[var(--surface-sunken)] border border-[var(--border-subtle)] rounded-xl py-3 pl-10 pr-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
        <div className="w-full md:w-64">
          <Select 
            value={filter} 
            onChange={(e: any) => setFilter(e.target.value)}
            options={[
              { value: "all", label: "All Topics" },
              { value: "general", label: "General" },
              ...attractions.map((a: any) => ({ value: a.id, label: a.nameEn }))
            ]}
          />
        </div>
      </div>

      <div className="space-y-4">
        {faqs.length === 0 ? (
          <p className="text-center py-8 text-[var(--text-secondary)]">No FAQs found matching your search.</p>
        ) : (
          faqs.map((faq: any) => {
            const isActive = activeFaq === faq.id;
            return (
              <div key={faq.id} className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden bg-[var(--surface-default)]">
                <button 
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <span className="font-bold text-[var(--text-primary)] pr-8">{faq.questionEn}</span>
                  {isActive ? <ChevronUp className="w-5 h-5 text-[var(--text-secondary)] shrink-0" /> : <ChevronDown className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />}
                </button>
                {isActive && (
                  <div className="p-5 pt-0 text-[var(--text-secondary)] border-t border-[var(--border-subtle)]">
                    <div className="pt-4">{faq.answerEn}</div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="text-center pt-8 border-t border-[var(--border-subtle)]">
        <p className="text-[var(--text-secondary)] mb-4">Still need help?</p>
        <Button variant="outline" onClick={switchToSupport}>Contact Support</Button>
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
