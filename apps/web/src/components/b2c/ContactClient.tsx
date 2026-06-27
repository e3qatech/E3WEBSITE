"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, HeadphonesIcon, HelpCircle, Phone, Mail, Clock, Search, ChevronDown, ChevronUp, FileUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function ContactClient({ attractions, faqs }: { attractions: any[], faqs: any[] }) {
  const [activeTab, setActiveTab] = useState("support");
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState("");
  const [faqFilter, setFaqFilter] = useState("all");

  const toggleFaq = (id: string) => {
    setActiveFaq(prev => (prev === id ? null : id));
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.questionEn.toLowerCase().includes(faqSearch.toLowerCase()) || faq.answerEn.toLowerCase().includes(faqSearch.toLowerCase());
    const matchesFilter = faqFilter === "all" || faq.attractionId === faqFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8">
      {/* HERO SECTION */}
      <div className="text-center py-16 md:py-24">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-6"
        >
          <HeadphonesIcon className="w-10 h-10" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-4">
          How Can We Help?
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
          Need support with a ticket, want to leave feedback, or just have a general question? We're here for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="support" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="support" className="gap-2"><HeadphonesIcon className="w-4 h-4" /> Support</TabsTrigger>
              <TabsTrigger value="feedback" className="gap-2"><MessageSquare className="w-4 h-4" /> Feedback</TabsTrigger>
              <TabsTrigger value="faq" className="gap-2"><HelpCircle className="w-4 h-4" /> FAQ</TabsTrigger>
            </TabsList>
          
            <div className="mt-8 bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-3xl p-6 md:p-8 shadow-sm">
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
          <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-3xl p-8">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Quick Contact</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)]">WhatsApp Support</h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">+974 4400 0000</p>
                  <a href="#" className="text-sm text-[var(--color-primary)] font-medium hover:underline">Message us on WhatsApp</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)]">Email Us</h4>
                  <p className="text-sm text-[var(--text-secondary)]">support@e3.qa</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)]">Operating Hours</h4>
                  <p className="text-sm text-[var(--text-secondary)]">Sun - Thu: 9:00 AM - 6:00 PM</p>
                  <p className="text-sm text-[var(--text-secondary)]">Fri - Sat: 1:00 PM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
