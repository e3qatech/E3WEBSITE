"use client"

import React, { useState } from 'react'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { useB2BRFP } from '@/store/b2b-store'

export default function ContactRFPPage() {
  
  const { inquiryType, setInquiryType } = useB2BRFP()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock submission
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 pt-20">
      
      {/* Header */}
      <section className="py-20 border-b border-zinc-900 bg-zinc-900/50">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-5xl md:text-7xl font-black text-zinc-100 tracking-tight mb-6">
            Start a <span className="text-emerald-400">Project.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl font-medium">
            Whether you have a fully drafted RFP or just a preliminary concept, our team is ready to engineer a solution.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-12 gap-16">
            
            {/* Left Column - Contact Info */}
            <div className="md:col-span-5 space-y-12">
              <div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-6 tracking-tight">Direct Inquiries</h3>
                <ul className="space-y-6">
                  <li>
                    <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">Business Development</div>
                    <a href="mailto:business@e3.qa" className="text-xl font-medium text-emerald-400 hover:text-emerald-300 transition-colors">business@e3.qa</a>
                  </li>
                  <li>
                    <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">Careers & Talent</div>
                    <a href="mailto:careers@e3.qa" className="text-xl font-medium text-zinc-300 hover:text-zinc-100 transition-colors">careers@e3.qa</a>
                  </li>
                  <li>
                    <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">Phone</div>
                    <a href="tel:+97444444444" className="text-xl font-medium text-zinc-300 hover:text-zinc-100 transition-colors">+974 4444 4444</a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-6 tracking-tight">Headquarters</h3>
                <div className="text-lg text-zinc-400 leading-relaxed">
                  Palm Tower B, Floor 22<br />
                  West Bay, Doha<br />
                  State of Qatar
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="md:col-span-7">
              {submitted ? (
                <div className="p-12 rounded-xl bg-zinc-900 border border-emerald-500/50 text-center">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-3xl font-black text-zinc-100 tracking-tight mb-4">Request Received</h3>
                  <p className="text-zinc-400 text-lg mb-8">
                    Our team will review your inquiry and connect with you within 24 hours.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-3 rounded-sm border border-zinc-700 text-zinc-300 font-bold hover:bg-zinc-800 transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 p-10 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  
                  {/* Inquiry Type */}
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Inquiry Type</label>
                    <div className="flex flex-wrap gap-4">
                      {['RFP Submission', 'General Business', 'Partnership', 'Other'].map(type => (
                        <label 
                          key={type} 
                          className={`px-5 py-3 rounded-sm border cursor-pointer font-bold text-sm transition-colors ${
                            inquiryType === type 
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                              : 'border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-500'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="type" 
                            value={type}
                            className="hidden"
                            checked={inquiryType === type}
                            onChange={(e) => setInquiryType(e.target.value)}
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400">Full Name</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400">Company</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="Organization Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400">Email Address</label>
                      <input 
                        required
                        type="email" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="jane@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400">Phone Number</label>
                      <input 
                        type="tel" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="+974 XXXX XXXX"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-400">Project Details or Message</label>
                    <textarea 
                      required
                      rows={5}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                      placeholder="Tell us about your requirements, timeline, and scale..."
                    />
                  </div>

                  {/* File Upload (Mock) */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-400">Attachments (Optional)</label>
                    <div className="w-full border-2 border-dashed border-zinc-800 rounded-sm p-8 text-center hover:border-zinc-600 transition-colors cursor-pointer bg-zinc-950">
                      <p className="text-sm text-zinc-500 font-medium">Drag & drop RFP documents here, or click to browse</p>
                      <p className="text-xs text-zinc-600 mt-2">PDF, DOCX, ZIP up to 50MB</p>
                    </div>
                  </div>

                  {/* Submit */}
                  <button 
                    type="submit"
                    className="w-full py-4 bg-emerald-500 text-zinc-950 font-bold text-lg rounded-sm hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                  >
                    Submit Inquiry <ArrowRight className="w-5 h-5" />
                  </button>

                  <p className="text-xs text-zinc-600 text-center max-w-sm mx-auto">
                    By submitting this form, you agree to our Privacy Policy and consent to us storing your data to process this inquiry.
                  </p>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
