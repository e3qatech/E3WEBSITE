'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Calendar as CalendarIcon, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface BulkBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  attractions: { id: string; nameEn: string; nameAr: string }[];
  prefilledAttraction?: string;
  prefilledDate?: Date;
}

export function BulkBookingModal({ isOpen, onClose, attractions, prefilledAttraction, prefilledDate }: BulkBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    attractionName: '',
    date: '',
    time: '10:00',
    quantity: 10,
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        attractionName: prefilledAttraction || (attractions[0]?.nameEn || ''),
        date: prefilledDate ? format(prefilledDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      }));
      setSuccess(false);
      setError('');
    }
  }, [isOpen, prefilledAttraction, prefilledDate, attractions]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/inquiries/bulk-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          eventDetails: {
            attractionName: formData.attractionName,
            date: formData.date,
            time: formData.time,
            quantity: Number(formData.quantity),
            notes: formData.notes
          }
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit request');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0F0F23] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-[#1A1A2E]/80 backdrop-blur-md/50">
            <div>
              <h2 className="text-xl font-black text-white mb-1 font-satoshi uppercase tracking-wide flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Group & Bulk Booking
              </h2>
              <p className="text-zinc-400 text-sm font-medium">Request a quote for groups of 10 or more guests.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-[#1A1A2E]/80 backdrop-blur-md hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 font-satoshi uppercase tracking-wider">Request Received!</h3>
                <p className="text-zinc-400 max-w-md mx-auto mb-8">
                  Thank you for your interest. Our sales team has received your group booking request and will contact you shortly with a customized quote.
                </p>
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  Close Window
                </button>
              </motion.div>
            ) : (
              <form id="bulk-booking-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Event Details Section */}
                <div className="bg-[#1A1A2E]/80 backdrop-blur-md/50 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-purple-500 uppercase tracking-widest">Event Details</h3>
                  
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Attraction / Event</label>
                    <select 
                      required
                      value={formData.attractionName}
                      onChange={e => setFormData({...formData, attractionName: e.target.value})}
                      className="w-full bg-[#0F0F23] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    >
                      <option value="" disabled>Select an attraction</option>
                      {attractions.map(a => (
                        <option key={a.id} value={a.nameEn}>{a.nameEn}</option>
                      ))}
                      {/* Allow custom entry if prefilled isn't in list */}
                      {prefilledAttraction && !attractions.find(a => a.nameEn === prefilledAttraction) && (
                        <option value={prefilledAttraction}>{prefilledAttraction}</option>
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> Date</label>
                      <input 
                        type="date"
                        required
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-[#0F0F23] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3"/> Time</label>
                      <input 
                        type="time"
                        required
                        value={formData.time}
                        onChange={e => setFormData({...formData, time: e.target.value})}
                        className="w-full bg-[#0F0F23] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Users className="w-3 h-3"/> Guests</label>
                      <input 
                        type="number"
                        min="10"
                        required
                        value={formData.quantity}
                        onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                        className="w-full bg-[#0F0F23] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="bg-[#1A1A2E]/80 backdrop-blur-md/50 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-purple-500 uppercase tracking-widest">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-[#0F0F23] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Company / School (Optional)</label>
                      <input 
                        type="text"
                        placeholder="Company XYZ"
                        value={formData.company}
                        onChange={e => setFormData({...formData, company: e.target.value})}
                        className="w-full bg-[#0F0F23] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-[#0F0F23] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="tel"
                        required
                        placeholder="+974 1234 5678"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-[#0F0F23] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Special Requests / Notes</label>
                    <textarea 
                      rows={3}
                      placeholder="Any specific requirements (e.g. F&B, VIP access, private guide)..."
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      className="w-full bg-[#0F0F23] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                    {error}
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <div className="p-6 border-t border-zinc-800 bg-[#0F0F23] flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-[#1A1A2E]/80 backdrop-blur-md text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                form="bulk-booking-form"
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-purple-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-purple-400 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[200px]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Quote'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
