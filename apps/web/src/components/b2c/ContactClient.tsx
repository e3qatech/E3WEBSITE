"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, HeadphonesIcon, HelpCircle, Phone, Mail, Clock, Search, ChevronDown, ChevronUp, FileUp, Quote, CheckCircle2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { 
  useB2CTheme, 
  B2CInput, 
  B2CBadge 
} from "@/components/ui/B2CThemeComponents";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { InteractiveCard } from "@/components/ui/InteractiveCard";
import { MagneticButton } from "@/components/ui/MagneticButton";

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
  const { theme, isAr } = useB2CTheme();

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
        .font-righteous { font-family: var(--font-display), 'Righteous', sans-serif; }
        .font-poppins { font-family: var(--font-sans), 'Poppins', sans-serif; }
      `}} />
      <div className="w-full relative text-[var(--text-primary)] font-poppins selection:bg-[rgba(26,31,214,0.3)]">
        
        {/* HERO SECTION */}
        <div className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden border-b border-[var(--border-level-2)] z-10">
          <div className="absolute inset-0 z-0">
            {pageSettings.heroMediaType === "VIDEO" && pageSettings.heroMediaUrl && (
              <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-30 dark:opacity-40">
                <source src={pageSettings.heroMediaUrl} type="video/mp4" />
              </video>
            )}
            {pageSettings.heroMediaType === "IMAGE" && pageSettings.heroMediaUrl && (
              <img src={pageSettings.heroMediaUrl} alt="Background" className="w-full h-full object-cover opacity-30 dark:opacity-40" />
            )}
            {pageSettings.heroMediaType === "IFRAME" && pageSettings.heroMediaUrl && (
              <iframe src={pageSettings.heroMediaUrl} className="w-full h-full object-cover opacity-30 dark:opacity-40 pointer-events-none" />
            )}
            {(!pageSettings.heroMediaType || !pageSettings.heroMediaUrl) && (
               <div className="w-full h-full bg-gradient-to-br from-[var(--e3-deep-blue)]/10 via-[var(--e3-midnight)] to-[var(--e3-purple)]/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-level-1)] via-transparent to-[var(--bg-level-1)]" />
          </div>
          
          <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 text-center flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgba(26,31,214,0.1)] text-[var(--e3-royal-blue)] mb-6 border border-[var(--e3-royal-blue)]/30 shadow-[0_4px_15px_rgba(26,31,214,0.06)]"
            >
              <HeadphonesIcon className="w-8 h-8" />
            </motion.div>
            <AnimatedText 
              as="h1" 
              text={pageSettings?.title || "Contact Us"}
              className="text-4xl md:text-6xl font-black mb-6 tracking-tight font-display uppercase leading-tight justify-center"
            />
            <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl font-medium leading-relaxed">
              {pageSettings?.tagline || ""}
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* MAIN FORM/TAB AREA */}
            <div className="lg:col-span-8">
              <Tabs defaultValue="support" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 bg-[var(--bg-level-1)] p-1.5 rounded-2xl mb-8 border border-[var(--border-level-2)]">
                  <TabsTrigger 
                    value="support" 
                    className="rounded-xl font-bold text-sm py-3 data-[state=active]:bg-[var(--surface-default)] data-[state=active]:text-[var(--e3-royal-blue)] data-[state=active]:shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <HeadphonesIcon className="w-4 h-4" /> Support
                  </TabsTrigger>
                  <TabsTrigger 
                    value="feedback" 
                    className="rounded-xl font-bold text-sm py-3 data-[state=active]:bg-[var(--surface-default)] data-[state=active]:text-[var(--e3-magenta)] data-[state=active]:shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Feedback
                  </TabsTrigger>
                  <TabsTrigger 
                    value="faq" 
                    className="rounded-xl font-bold text-sm py-3 data-[state=active]:bg-[var(--surface-default)] data-[state=active]:text-[var(--e3-purple-accent)] data-[state=active]:shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <HelpCircle className="w-4 h-4" /> FAQ
                  </TabsTrigger>
                </TabsList>
              
                <InteractiveCard className="p-6 md:p-8 border-[rgba(75,0,143,0.3)] shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
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
                </InteractiveCard>
              </Tabs>
            </div>

            {/* SIDEBAR DETAILS */}
            <div className="lg:col-span-4 space-y-6">
              {/* Contact Info Card */}
              <InteractiveCard className="p-6 border-[rgba(75,0,143,0.3)]">
                <h3 className="text-xl font-bold mb-6 font-display uppercase tracking-wide">Contact Details</h3>
                <div className="space-y-6 text-start">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(26,31,214,0.1)] text-[var(--e3-royal-blue)] flex items-center justify-center shrink-0 border border-[var(--e3-royal-blue)]/20">
                      <Phone size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-[var(--text-tertiary)] tracking-wider">Phone</h4>
                      <p className="text-sm font-bold text-[var(--text-primary)] mt-1">+974 4400 0000</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(26,31,214,0.1)] text-[var(--e3-royal-blue)] flex items-center justify-center shrink-0 border border-[var(--e3-royal-blue)]/20">
                      <Mail size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-[var(--text-tertiary)] tracking-wider">Email</h4>
                      <p className="text-sm font-bold text-[var(--text-primary)] mt-1">support@e3.qa</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(26,31,214,0.1)] text-[var(--e3-royal-blue)] flex items-center justify-center shrink-0 border border-[var(--e3-royal-blue)]/20">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-[var(--text-tertiary)] tracking-wider">Hours</h4>
                      <p className="text-sm font-medium text-[var(--text-primary)] mt-1">Daily: 10:00 AM – 10:00 PM</p>
                    </div>
                  </div>
                </div>
              </InteractiveCard>

              {/* Featured Testimonials */}
              {featuredFeedbacks && featuredFeedbacks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-[var(--text-tertiary)] tracking-widest text-start px-2">Visitor Stories</h3>
                  {featuredFeedbacks.map((f: any, idx: number) => (
                    <InteractiveCard key={idx} className="p-6 border-[rgba(75,0,143,0.3)]">
                      <Quote className="w-8 h-8 text-[var(--e3-purple)] opacity-35 mb-2" />
                      <p className="text-xs italic text-[var(--text-secondary)] font-medium mb-4 line-clamp-3">"{f.comment}"</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-primary)]">{f.visitorName || "Verified Guest"}</span>
                        <div className="flex items-center gap-0.5 text-[var(--e3-magenta)]">
                          {Array.from({ length: f.rating || 5 }).map((_, i) => (
                            <Star key={i} size={12} className="fill-current" />
                          ))}
                        </div>
                      </div>
                    </InteractiveCard>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}

function SupportForm({ attractions }: { attractions: any[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { theme } = useB2CTheme();

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
          actionType: "SUPPORT",
          name: data.name,
          email: data.email,
          phone: data.phone,
          category: data.category,
          attractionId: data.attractionId || null,
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
      <div className="text-center py-12 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-[rgba(26,31,214,0.1)] text-[var(--e3-royal-blue)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--e3-royal-blue)]/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-display uppercase">Request Submitted</h3>
        <p className="text-sm text-[var(--text-secondary)] font-medium mb-8">Your ticket number is <strong>#E3-{Math.floor(Math.random() * 10000)}</strong>. We will get back to you shortly.</p>
        <MagneticButton onClick={() => setSuccess(false)} variant="primary" size="sm">
          Submit Another Request
        </MagneticButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-start">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <B2CInput name="name" required label="Full Name *" placeholder="John Doe" />
        <B2CInput name="email" type="email" required label="Email Address *" placeholder="john@example.com" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <B2CInput name="phone" type="tel" label="Phone Number" placeholder="+974 5555 5555" />
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs font-bold tracking-wider uppercase text-[var(--text-secondary)]">Category</label>
          <div className="relative flex items-center">
            <select name="category" className="w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 outline-none bg-[var(--surface-default)] border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--e3-royal-blue)] appearance-none cursor-pointer">
              <option value="ticket_issue">Ticket Issue</option>
              <option value="venue_question">Venue Question</option>
              <option value="complaint">Complaint</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown className="absolute end-3 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs font-bold tracking-wider uppercase text-[var(--text-secondary)]">Related Attraction (Optional)</label>
        <div className="relative flex items-center">
          <select name="attractionId" className="w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 outline-none bg-[var(--surface-default)] border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--e3-royal-blue)] appearance-none cursor-pointer">
            <option value="">General / Not specified</option>
            {attractions.map((a: any) => <option key={a.id || a.attractionId} value={a.id || a.attractionId}>{a.nameEn || a.attractionNameEn}</option>)}
          </select>
          <ChevronDown className="absolute end-3 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
        </div>
      </div>

      <B2CInput 
        name="message" 
        required 
        textarea 
        label="Message *" 
        placeholder="How can we help you?"
      />

      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs font-bold tracking-wider uppercase text-[var(--text-secondary)]">Attachment (Optional)</label>
        <label className={`flex items-center justify-center w-full h-32 border-2 border-dashed border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] rounded-xl cursor-pointer hover:bg-[var(--surface-hover)] transition-all duration-300`}>
          <div className="flex flex-col items-center">
            <FileUp className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{file ? file.name : "Click to upload (Max 5MB)"}</span>
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

      <div className="pt-4">
        <MagneticButton type="submit" variant="primary" size="md" className="w-full uppercase font-black py-4" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Support Request"}
        </MagneticButton>
      </div>
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
      <div className="text-center py-12 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-[var(--e3-magenta)]/10 text-[var(--e3-magenta)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--e3-magenta)]/20 shadow-[0_4px_15px_rgba(176,19,184,0.06)]">
          <Star className="w-8 h-8 fill-current" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-display uppercase">Thank You!</h3>
        <p className="text-sm text-[var(--text-secondary)] font-medium mb-8">Your feedback helps us improve our experiences.</p>
        <MagneticButton onClick={() => { setSuccess(false); setRating(0); }} variant="primary" size="sm">
          Submit More Feedback
        </MagneticButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-start">
      <div className="text-center mb-8">
        <label className="block text-base font-black uppercase tracking-wider text-[var(--text-secondary)] mb-4">How was your experience?</label>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
            >
              <Star 
                className={`w-10 h-10 transition-colors ${(hoverRating || rating) >= star ? "fill-[var(--e3-magenta)] text-[var(--e3-magenta)]" : "text-zinc-500"}`} 
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs font-bold tracking-wider uppercase text-[var(--text-secondary)]">Attraction</label>
        <div className="relative flex items-center">
          <select name="attractionId" className="w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 outline-none bg-[var(--surface-default)] border-[var(--border-level-2)] text-[var(--text-primary)] focus:border-[var(--e3-royal-blue)] appearance-none cursor-pointer">
            <option value="">General Feedback</option>
            {attractions.map((a: any) => <option key={a.id || a.attractionId} value={a.id || a.attractionId}>{a.nameEn || a.attractionNameEn}</option>)}
          </select>
          <ChevronDown className="absolute end-3 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
        </div>
      </div>

      <B2CInput 
        name="message" 
        required 
        textarea 
        label="Tell us more *" 
        placeholder="What did you love? What could be better?"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <B2CInput name="name" label="Name (Optional)" placeholder="John Doe" />
        <B2CInput name="email" type="email" label="Email (Optional)" placeholder="john@example.com" />
      </div>

      <div className="pt-4">
        <MagneticButton type="submit" variant="primary" size="md" className="w-full uppercase font-black py-4" disabled={isSubmitting || rating === 0}>
          Submit Feedback
        </MagneticButton>
      </div>
    </form>
  );
}

function FaqSection({ faqs, attractions, search, setSearch, filter, setFilter, activeFaq, toggleFaq, switchToSupport }: any) {
  return (
    <div className="space-y-8 text-start">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl py-3 ps-10 pr-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--e3-royal-blue)] focus:ring-2 focus:ring-[var(--e3-royal-blue)]/20 transition-all text-sm"
          />
        </div>
        <div className="w-full md:w-64">
          <div className="relative flex items-center">
            <select 
              value={filter} 
              onChange={(e: any) => setFilter(e.target.value)}
              className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--e3-royal-blue)] appearance-none cursor-pointer text-sm"
            >
              <option value="all">All Topics</option>
              <option value="general">General</option>
              {attractions.map((a: any) => <option key={a.id || a.attractionId} value={a.id || a.attractionId}>{a.nameEn || a.attractionNameEn}</option>)}
            </select>
            <ChevronDown className="absolute end-3 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {faqs.length === 0 ? (
          <p className="text-center py-8 text-[var(--text-secondary)] font-medium text-sm">No FAQs found matching your search.</p>
        ) : (
          faqs.map((faq: any) => {
            const isActive = activeFaq === faq.id;
            return (
              <div key={faq.id} className="border border-[var(--border-level-2)] rounded-2xl overflow-hidden bg-[var(--surface-default)] transition-colors hover:border-[var(--e3-royal-blue)]">
                <button 
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-start hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                >
                  <span className="font-bold text-[var(--text-primary)] pr-8">{faq.questionEn}</span>
                  {isActive ? <ChevronUp className="w-5 h-5 text-[var(--e3-royal-blue)] shrink-0" /> : <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)] shrink-0" />}
                </button>
                {isActive && (
                  <div className="p-5 pt-0 text-[var(--text-secondary)] border-t border-[var(--border-level-1)] leading-relaxed font-medium">
                    <div className="pt-4">{faq.answerEn}</div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="text-center pt-8 border-t border-[var(--border-level-2)]">
        <p className="text-[var(--text-secondary)] font-medium mb-4">Still need help?</p>
        <MagneticButton onClick={switchToSupport} variant="outline" size="sm">
          Contact Support
        </MagneticButton>
      </div>
    </div>
  );
}
