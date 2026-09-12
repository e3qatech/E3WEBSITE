"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, AlertCircle, User, ArrowRight, Shield, Sparkles, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/components/layout/LocaleProvider";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function ChatAssistant({ portal = "b2c" }: { portal?: "b2c" | "b2b" }) {
  const { locale, dir } = useLocale();
  const isAr = locale === "ar";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [unavailableMessage, setUnavailableMessage] = useState("");
  const [escalationUrl, setEscalationUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Quick suggestion chips for instant human concierge answers
  const suggestedQueries = isAr
    ? [
        { label: "🏃 ما هو إنفلاتارن؟", query: "أخبرني عن فعالية إنفلاتارن وما يميزها؟" },
        { label: "🎟️ باقات وأسعار التذاكر", query: "ما هي باقات وأسعار التذاكر المتاحة؟" },
        { label: "📍 المواقع وساعات العمل", query: "أين تقع مواقع فعالياتكم وما هي مواعيد العمل؟" },
        { label: "🎉 الفعاليات الخاصة وأعياد الميلاد", query: "كيف يمكنني حجز باقة عيد ميلاد أو فعالية خاصة؟" },
      ]
    : [
        { label: "🏃 Tell me about InflataRUN", query: "Can you tell me all about the InflataRUN attraction?" },
        { label: "🎟️ Ticket Packages & Offers", query: "What ticket packages and prices are available?" },
        { label: "📍 Locations & Opening Hours", query: "Where are your event venues located and what are the opening hours?" },
        { label: "🎉 Birthday Parties & Private Buyouts", query: "How do I book a birthday party or corporate private buyout?" },
      ];

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: isAr
              ? "أهلاً بك في إي ثري قطر! أنا سارة، مستشارة تجارب الضيوف والفعاليات.\n\nيسعدني جداً الإجابة على جميع استفساراتك حول معالمنا الترفيهية وتذاكر الدخول وحجوزات الفعاليات العائلية والشركات. كيف يمكنني خدمتك اليوم؟"
              : "Hello and welcome to E3 Qatar! I'm Sarah, Senior Guest Concierge.\n\nI'm delighted to assist you today with our attractions (like InflataRUN), ticket packages, venue timings, or custom event bookings. How may I help you?",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen, isAr, messages.length]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const userText = (customPrompt !== undefined ? customPrompt : input).trim();
    if (!userText || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (customPrompt === undefined) {
      setInput("");
    }
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== "welcome")
        .concat(userMessage)
        .slice(-8)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          locale: isAr ? "ar" : "en",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (data.available === false) {
        setIsUnavailable(true);
        setUnavailableMessage(
          data.message ||
            (isAr
              ? "المستشار الآلي غير متاح حالياً. يرجى استخدام نموذج الاتصال."
              : "Chat concierge is temporarily unavailable. Please use our contact form.")
        );
        if (data.escalationUrl) {
          setEscalationUrl(data.escalationUrl);
        }
        return;
      }

      if (res.ok && data.reply) {
        const assistantMessage: Message = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to receive response");
      }
    } catch {
      setIsUnavailable(true);
      setUnavailableMessage(
        isAr
          ? "حدث انقطاع مؤقت في خدمة المحادثة. يرجى التواصل مع فريق الضيافة مباشرة."
          : "Chat service is temporarily interrupted. Please contact our guest concierge directly."
      );
      setEscalationUrl(`/${locale}/${portal}/contact`);
    } finally {
      setIsLoading(false);
    }
  };

  const contactLink = `/${locale}/${portal}/contact`;

  return (
    <div className="fixed bottom-4 sm:bottom-6 end-4 sm:end-6 z-50 font-sans" dir={dir}>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={isAr ? "تحدث مع سارة - مستشارة ضيافة E3 قطر" : "Chat with Sarah - E3 Guest Concierge"}
          className="flex items-center gap-2.5 sm:gap-3 px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 font-bold cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/30 group"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-emerald-600 animate-pulse" />
          </div>
          <div className="flex flex-col text-start">
            <span className="text-xs sm:text-sm font-black tracking-wide leading-tight">
              {isAr ? "مستشارة الضيافة (سارة)" : "E3 Concierge (Sarah)"}
            </span>
            <span className="text-[10px] font-semibold text-zinc-900/80 leading-none mt-0.5">
              {isAr ? "إجابة فورية ومعلومات الفعاليات" : "Instant help & event guides"}
            </span>
          </div>
        </button>
      )}

      {/* Chat Window Dialog */}
      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-title"
          className="flex flex-col w-[calc(100vw-2rem)] sm:w-[430px] max-w-[430px] h-[580px] max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
        >
          {/* Header with Human Concierge Persona */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-emerald-400/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-zinc-950 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 id="chat-title" className="text-sm font-black text-zinc-100 tracking-tight">
                    {isAr ? "سارة | مستشارة ضيافة E3 قطر" : "Sarah | E3 Guest Concierge"}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] font-medium text-emerald-400">
                    {isAr ? "متصلة الآن • مساعدة حية وشخصية" : "Online • Live Personalized Assistance"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={isAr ? "إغلاق المحادثة" : "Close chat"}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Privacy Notice Banner */}
          <div className="bg-zinc-900/90 border-b border-zinc-800/80 px-4 py-2 flex items-center gap-2 text-[11px] text-zinc-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              {isAr
                ? "محادثة آمنة ومشفرة ومتوافقة مع قانون حماية البيانات الشخصية القطري (PDPL)."
                : "Encrypted & Qatar Personal Data Protection Law (PDPL) Compliant."}
            </span>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-950/80">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    m.role === "user"
                      ? "bg-zinc-800 text-zinc-300"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {m.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <span className="text-[11px] font-black text-emerald-300">SC</span>
                  )}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                    m.role === "user"
                      ? "bg-emerald-500 text-zinc-950 font-medium rounded-tr-none"
                      : "bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none font-normal"
                  }`}
                >
                  <p>{m.content}</p>
                  <span
                    className={`block text-[10px] mt-1.5 text-end ${
                      m.role === "user" ? "text-zinc-900/70" : "text-zinc-500"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Quick Suggestion Pills (Shown when conversation is beginning) */}
            {messages.length <= 1 && !isLoading && !isUnavailable && (
              <div className="pt-2 pb-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 mb-2 px-1">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? "أسئلة شائعة يمكنني مساعدتك بها:" : "Quick questions I can answer:"}</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {suggestedQueries.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(undefined, item.query)}
                      className="text-start text-xs text-zinc-300 hover:text-emerald-300 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/40 rounded-xl px-3 py-2 transition-all cursor-pointer shadow-sm flex items-center justify-between group"
                    >
                      <span className="font-medium">{item.label}</span>
                      <ArrowRight className={`w-3 h-3 text-zinc-500 group-hover:text-emerald-400 transition-transform ${isAr ? "rotate-180" : ""}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex gap-3 items-center text-zinc-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-black text-emerald-300">SC</span>
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5">
                  <span className="text-xs text-zinc-400 me-2">{isAr ? "سارة تكتب..." : "Sarah is typing..."}</span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            {isUnavailable && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{unavailableMessage}</p>
                </div>
                <Link
                  href={escalationUrl || contactLink}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                >
                  {isAr ? "الانتقال إلى صفحة الاتصال والدعم" : "Go to Contact & Support Page"}
                  <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
                </Link>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Escalation Footer */}
          <div className="p-3 bg-zinc-900 border-t border-zinc-800">
            <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isAr ? "اسأل سارة عن التذاكر، الأوقات، أو الفعاليات..." : "Ask Sarah about tickets, timings, or events..."}
                disabled={isLoading}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label={isAr ? "إرسال" : "Send"}
                className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-bold transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Send className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
              </button>
            </form>

            <div className="mt-2 text-center">
              <Link
                href={contactLink}
                onClick={() => setIsOpen(false)}
                className="text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
              >
                <span>{isAr ? "هل ترغب في التحدث هاتفياً؟ اتصل بنا مباشرة" : "Prefer a phone call? Reach out directly"}</span>
                <ArrowRight className={`w-3 h-3 ${isAr ? "rotate-180" : ""}`} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
