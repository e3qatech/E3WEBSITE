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
  onOpenBulkBooking?: () => void;
}

export function TicketSelectionModal({ isOpen, onClose, event, onOpenBulkBooking }: TicketSelectionModalProps) {
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

    const baseUrl = 'https://bookingqube.com/checkout';
    const params = new URLSearchParams({
      landmark: event.attractionId,
      slot: event.id,
      partner: 'e3qa',
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
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#0F0F23] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-[#1A1A2E]/80 backdrop-blur-md/50">
            <div>
              <h2 className="text-xl font-black text-white mb-1 font-satoshi uppercase tracking-wide">{event.attractionNameEn}</h2>
              <p className="text-zinc-400 text-sm font-medium flex items-center gap-2 font-mono">
                {format(new Date(event.startTime), 'EEEE, MMMM d, yyyy')} <br className="sm:hidden" />
                <span className="hidden sm:inline">•</span>
                <span className="text-emerald-500">{format(new Date(event.startTime), 'h:mm a')}</span>
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-[#1A1A2E]/80 backdrop-blur-md hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
                <p className="text-sm font-bold font-mono uppercase tracking-widest">Loading Tickets...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pricing.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 font-medium">
                    No tickets configured for this attraction.
                  </div>
                ) : (
                  pricing.map(tier => (
                    <div key={tier.id} className="flex items-center justify-between p-4 bg-[#1A1A2E]/80 backdrop-blur-md border border-zinc-800 rounded-2xl">
                      <div>
                        <h4 className="font-bold font-satoshi text-white text-lg">{tier.titleEn}</h4>
                        <p className="text-emerald-500 font-bold font-mono uppercase tracking-widest text-sm">{tier.currency} {tier.price}</p>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-[#0F0F23] border border-zinc-800 rounded-xl p-1">
                        <button 
                          onClick={() => handleDecrement(tier.id)}
                          className="w-8 h-8 flex items-center justify-center bg-[#1A1A2E]/80 backdrop-blur-md hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                          disabled={(quantities[tier.id] || 0) <= 0}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-white">
                          {quantities[tier.id] || 0}
                        </span>
                        <button 
                          onClick={() => handleIncrement(tier.id)}
                          className="w-8 h-8 flex items-center justify-center bg-[#1A1A2E]/80 backdrop-blur-md hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                          disabled={totalSelected >= remainingCapacity || totalSelected >= 10}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex justify-between items-center text-emerald-500">
                  <span className="text-sm font-bold font-mono uppercase tracking-widest">Remaining Capacity</span>
                  <span className="text-xl font-black font-mono">{remainingCapacity}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-800 bg-[#0F0F23]">
            {onOpenBulkBooking && (
              <button 
                onClick={onOpenBulkBooking}
                className="w-full text-center text-sm text-zinc-500 hover:text-emerald-500 transition-colors mb-4 underline underline-offset-4"
              >
                Need 10 or more tickets? Request a Group Booking
              </button>
            )}
            <div className="flex justify-between items-center mb-4">
              <span className="text-zinc-400 font-bold font-mono uppercase tracking-widest text-sm">Subtotal</span>
              <span className="text-2xl font-black font-mono text-white">QAR {subtotal}</span>
            </div>
            <button
              onClick={handleProceed}
              disabled={totalSelected === 0}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-emerald-500 flex items-center justify-center gap-2 group font-satoshi"
            >
              Proceed to Booking
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rtl:-scale-x-100" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
