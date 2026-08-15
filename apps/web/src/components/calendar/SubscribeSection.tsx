'use client';

import React, { useState, FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/components/layout/LocaleProvider';
import { Mail, MessageCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { safeFetchJson } from '@/lib/utils';

export function SubscribeSection() {
  const pathname = usePathname();
  const { locale: contextLocale } = useLocale();
  const locale = pathname?.startsWith('/ar') ? 'ar' : contextLocale || 'en';
  const isAr = locale === 'ar';

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

      const parsed = await safeFetchJson(res);
      if (!parsed.ok) throw new Error(parsed.error || (isAr ? 'فشل الاشتراك في النشرة' : 'Failed to subscribe'));

      setStatus('SUCCESS');
      setMessage(
        parsed.data?.message ||
          (isAr
            ? 'تم الاشتراك بنجاح! يرجى التحقق من صندوق الوارد الخاص بك.'
            : 'Successfully subscribed! Check your inbox.')
      );
      setEmail('');
      setPhone('');
    } catch (err: any) {
      setStatus('ERROR');
      setMessage(err.message || (isAr ? 'حدث خطأ أثناء الاشتراك.' : 'An error occurred while subscribing.'));
    }
  };

  return (
    <div
      className="relative mt-24 mb-12 rounded-3xl overflow-hidden bg-[var(--surface-default)] border border-[var(--border-level-2)] p-8 md:p-12 lg:p-16 text-center lg:text-start transition-colors duration-300"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Background decoration */}
      <div className="absolute top-0 end-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 start-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
        {/* Left/Start: Copy */}
        <div className="flex-1 max-w-xl">
          <h2 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-6 uppercase tracking-tight">
            {isAr ? (
              <>
                لا تفوّت أي <span className="text-emerald-500">فعالية</span>
              </>
            ) : (
              <>
                Never Miss an <span className="text-emerald-500">Event</span>
              </>
            )}
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-8 font-medium leading-relaxed">
            {isAr
              ? 'احصل على تنبيهات فورية عند طرح التذاكر، والمهرجانات الحصرية، وسعة الحضور المباشرة. كن دائماً في المقدمة.'
              : 'Get alerts for ticket launches, special festivals, and real-time queue capacity updates. Stay ahead of the crowd.'}
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
            <button 
              type="button"
              onClick={() => setChannel('EMAIL')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold tracking-widest uppercase transition-colors border cursor-pointer ${
                channel === 'EMAIL' ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] border-[var(--border-level-2)] hover:border-[var(--border-level-3)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Mail className="w-4 h-4" /> {isAr ? 'البريد الإلكتروني' : 'Email'}
            </button>
            <button 
              type="button"
              onClick={() => setChannel('WHATSAPP')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold tracking-widest uppercase transition-colors border cursor-pointer ${
                channel === 'WHATSAPP' ? 'bg-[#25D366] text-white border-[#25D366] shadow-sm' : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] border-[var(--border-level-2)] hover:border-[#25D366]/50 hover:text-[var(--text-primary)]'
              }`}
            >
              <MessageCircle className="w-4 h-4" /> {isAr ? 'واتساب' : 'WhatsApp'}
            </button>
            <button 
              type="button"
              onClick={() => setChannel('BOTH')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold tracking-widest uppercase transition-colors border cursor-pointer ${
                channel === 'BOTH' ? 'bg-[var(--text-primary)] text-[var(--bg-level-1)] border-[var(--text-primary)] shadow-sm' : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] border-[var(--border-level-2)] hover:border-[var(--border-level-3)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isAr ? 'كلاهما' : 'Both'}
            </button>
          </div>
        </div>

        {/* Right/End: Form */}
        <div className="w-full max-w-md bg-[var(--surface-hover)] backdrop-blur-md border border-[var(--border-level-2)] p-8 rounded-2xl">
          {status === 'SUCCESS' ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                {isAr ? 'تم تسجيلك في القائمة بنجاح!' : "You're on the list!"}
              </h3>
              <p className="text-[var(--text-secondary)] font-medium">{message}</p>
              <button 
                onClick={() => setStatus('IDLE')}
                className="mt-8 text-sm font-bold text-emerald-500 uppercase tracking-widest hover:underline transition-colors cursor-pointer"
              >
                {isAr ? 'إدارة التفضيلات' : 'Manage Preferences'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {(channel === 'EMAIL' || channel === 'BOTH') && (
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">
                    {isAr ? 'عنوان البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500 transition-colors font-mono text-sm"
                  />
                </div>
              )}

              {(channel === 'WHATSAPP' || channel === 'BOTH') && (
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">
                    {isAr ? 'رقم الواتساب' : 'WhatsApp Number'}
                  </label>
                  <div className="flex" dir="ltr">
                    <span className="inline-flex items-center px-4 bg-[var(--surface-hover)] border border-e-0 border-[var(--border-level-2)] rounded-s-xl text-[var(--text-secondary)] font-mono font-bold text-sm">
                      +974
                    </span>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="33XX XXXX"
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-e-xl px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-emerald-500 transition-colors font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    prefs.specialEvents ? 'bg-emerald-500 border-emerald-500' : 'bg-[var(--surface-default)] border-[var(--border-level-2)] group-hover:border-emerald-500'
                  }`}>
                    {prefs.specialEvents && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`text-sm ${prefs.specialEvents ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                    {isAr ? 'الفعاليات الخاصة والمهرجانات' : 'Special Events & Festivals'}
                  </span>
                  <input type="checkbox" className="hidden" checked={prefs.specialEvents} onChange={e => setPrefs({...prefs, specialEvents: e.target.checked})} />
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    prefs.newAttractions ? 'bg-emerald-500 border-emerald-500' : 'bg-[var(--surface-default)] border-[var(--border-level-2)] group-hover:border-emerald-500'
                  }`}>
                    {prefs.newAttractions && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`text-sm ${prefs.newAttractions ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                    {isAr ? 'إطلاق الوجهات والمرافق الجديدة' : 'New Attraction Launches'}
                  </span>
                  <input type="checkbox" className="hidden" checked={prefs.newAttractions} onChange={e => setPrefs({...prefs, newAttractions: e.target.checked})} />
                </label>
              </div>

              {status === 'ERROR' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                  {message}
                </div>
              )}

              <button 
                type="submit"
                disabled={status === 'LOADING'}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer shadow-md"
              >
                {status === 'LOADING' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isAr ? 'جاري الاشتراك...' : 'Subscribing...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isAr ? 'اشترك الآن' : 'Subscribe Now'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
