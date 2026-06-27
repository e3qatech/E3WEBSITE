'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { CalendarEvent } from './EventCard';

interface PricingTier {
  id: string;
  titleEn: string;
  price: number;
  currency: string;
}

interface TicketSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

export function TicketSelectionModal({ isOpen, onClose, event }: TicketSelectionModalProps) {
  const [pricing, setPricing] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  // Real-time capacity check (simplified for MVP)
  const remainingCapacity = event ? event.capacityGate - event.currentCount : 0;

  useEffect(() => {
    if (isOpen && event) {
      setLoading(true);
      // Reset quantities
      setQuantities({});
      
      // Fetch pricing for this attraction
      fetch(`/api/attractions/${event.attractionId}/pricing`)
        .then(res => res.json())
        .then(data => {
          // data should be { data: PricingTier[] } based on typical pattern, but check both
          setPricing(data.data || data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const handleIncrement = (pricingId: string) => {
    const totalSelected = Object.values(quantities).reduce((a, b) => a + b, 0);
    if (totalSelected >= remainingCapacity) return; // Cannot exceed capacity
    if (totalSelected >= 10) return; // Max 10 per transaction

    setQuantities(prev => ({
      ...prev,
      [pricingId]: (prev[pricingId] || 0) + 1
    }));
  };

  const handleDecrement = (pricingId: string) => {
    setQuantities(prev => {
      const current = prev[pricingId] || 0;
      if (current <= 0) return prev;
      return { ...prev, [pricingId]: current - 1 };
    });
  };

  const totalSelected = Object.values(quantities).reduce((a, b) => a + b, 0);
  
  const subtotal = pricing.reduce((sum, tier) => {
    return sum + (tier.price * (quantities[tier.id] || 0));
  }, 0);

  const handleProceed = () => {
    // Construct BookingQube deep link
    const selectedTickets = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => `${id}:${qty}`)
      .join(',');

    const baseUrl = 'https://booking.e3.qa/checkout';
    const params = new URLSearchParams({
      event: event.id,
      attraction: event.attractionSlug,
      tickets: selectedTickets
    });
    
    window.location.href = `${baseUrl}?${params.toString()}`;
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
          className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-zinc-900/50">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{event.attractionNameEn}</h2>
              <p className="text-zinc-400 text-sm font-medium flex items-center gap-2">
                {format(new Date(event.startTime), 'EEEE, MMMM d, yyyy')} <br className="sm:hidden" />
                <span className="hidden sm:inline">•</span>
                <span className="text-emerald-400">{format(new Date(event.startTime), 'h:mm a')}</span>
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
                <p className="text-sm font-bold uppercase tracking-widest">Loading Tickets...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pricing.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 font-medium">
                    No tickets configured for this attraction.
                  </div>
                ) : (
                  pricing.map(tier => (
                    <div key={tier.id} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                      <div>
                        <h4 className="font-bold text-white text-lg">{tier.titleEn}</h4>
                        <p className="text-emerald-400 font-bold">{tier.currency} {tier.price}</p>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                        <button 
                          onClick={() => handleDecrement(tier.id)}
                          className="w-8 h-8 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                          disabled={(quantities[tier.id] || 0) <= 0}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-white">
                          {quantities[tier.id] || 0}
                        </span>
                        <button 
                          onClick={() => handleIncrement(tier.id)}
                          className="w-8 h-8 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                          disabled={totalSelected >= remainingCapacity || totalSelected >= 10}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex justify-between items-center text-emerald-400">
                  <span className="text-sm font-bold uppercase tracking-widest">Remaining Capacity</span>
                  <span className="text-lg font-black">{remainingCapacity}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-800 bg-zinc-950">
            <div className="flex justify-between items-center mb-4">
              <span className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Subtotal</span>
              <span className="text-2xl font-black text-white">QAR {subtotal}</span>
            </div>
            <button
              onClick={handleProceed}
              disabled={totalSelected === 0}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-emerald-500 flex items-center justify-center gap-2 group"
            >
              Proceed to Booking
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
