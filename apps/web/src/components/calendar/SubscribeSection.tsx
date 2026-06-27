'use client';

import React, { useState, FormEvent } from 'react';
import { Mail, MessageCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export function SubscribeSection() {
  const [channel, setChannel] = useState<'EMAIL' | 'WHATSAPP' | 'BOTH'>('EMAIL');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [prefs, setPrefs] = useState({
    specialEvents: true,
    newAttractions: true,
    discounts: false
  });

  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('LOADING');
    setMessage('');

    try {
      const payload = {
        actionType: 'SUBSCRIBE',
        email: (channel === 'EMAIL' || channel === 'BOTH') ? email : undefined,
        phone: (channel === 'WHATSAPP' || channel === 'BOTH') ? phone : undefined,
        preferences: prefs
      };

      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to subscribe');

      setStatus('SUCCESS');
      setMessage(data.message || 'Successfully subscribed! Check your inbox.');
      setEmail('');
      setPhone('');
    } catch (err: any) {
      setStatus('ERROR');
      setMessage(err.message);
    }
  };

  return (
    <div className="relative mt-24 mb-12 rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 p-8 md:p-12 lg:p-16 text-center lg:text-left">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
        
        {/* Left: Copy */}
        <div className="flex-1 max-w-xl">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
            Never Miss an <span className="text-emerald-400">Event</span>
          </h2>
          <p className="text-lg text-zinc-400 mb-8 font-medium">
            Get alerts for ticket launches, special festivals, and real-time queue capacity updates. Stay ahead of the crowd.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
            <button 
              type="button"
              onClick={() => setChannel('EMAIL')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold tracking-widest uppercase transition-colors border ${
                channel === 'EMAIL' ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <Mail className="w-4 h-4" /> Email
            </button>
            <button 
              type="button"
              onClick={() => setChannel('WHATSAPP')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold tracking-widest uppercase transition-colors border ${
                channel === 'WHATSAPP' ? 'bg-[#25D366] text-white border-[#25D366]' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-[#25D366]/50'
              }`}
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
            <button 
              type="button"
              onClick={() => setChannel('BOTH')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold tracking-widest uppercase transition-colors border ${
                channel === 'BOTH' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              Both
            </button>
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-8 rounded-2xl">
          {status === 'SUCCESS' ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">You're on the list!</h3>
              <p className="text-zinc-400 font-medium">{message}</p>
              <button 
                onClick={() => setStatus('IDLE')}
                className="mt-8 text-sm font-bold text-emerald-400 uppercase tracking-widest hover:text-white transition-colors"
              >
                Manage Preferences
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {(channel === 'EMAIL' || channel === 'BOTH') && (
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}

              {(channel === 'WHATSAPP' || channel === 'BOTH') && (
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">WhatsApp Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 bg-zinc-900 border border-r-0 border-zinc-800 rounded-l-xl text-zinc-500 font-bold">
                      +974
                    </span>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="33XX XXXX"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-r-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    prefs.specialEvents ? 'bg-emerald-500 border-emerald-500' : 'bg-zinc-950 border-zinc-700 group-hover:border-zinc-500'
                  }`}>
                    {prefs.specialEvents && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                  </div>
                  <span className={`text-sm ${prefs.specialEvents ? 'text-white' : 'text-zinc-400'}`}>Special Events & Festivals</span>
                  <input type="checkbox" className="hidden" checked={prefs.specialEvents} onChange={e => setPrefs({...prefs, specialEvents: e.target.checked})} />
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    prefs.newAttractions ? 'bg-emerald-500 border-emerald-500' : 'bg-zinc-950 border-zinc-700 group-hover:border-zinc-500'
                  }`}>
                    {prefs.newAttractions && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                  </div>
                  <span className={`text-sm ${prefs.newAttractions ? 'text-white' : 'text-zinc-400'}`}>New Attraction Launches</span>
                  <input type="checkbox" className="hidden" checked={prefs.newAttractions} onChange={e => setPrefs({...prefs, newAttractions: e.target.checked})} />
                </label>
              </div>

              {status === 'ERROR' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                  {message}
                </div>
              )}

              <button 
                type="submit"
                disabled={status === 'LOADING'}
                className="w-full py-4 bg-white hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {status === 'LOADING' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Subscribe Now'}
                {status !== 'LOADING' && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
