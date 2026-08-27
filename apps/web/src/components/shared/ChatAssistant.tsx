"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, AlertCircle, Bot, User, ArrowRight, Shield } from "lucide-react";
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

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: isAr
              ? "مرحباً بك في إي ثري قطر! كيف يمكنني مساعدتك اليوم في استفسارات الفعاليات، التذاكر، أو المشاريع؟"
              : "Welcome to E3 Qatar! How can I assist you today with our attractions, tickets, or corporate project inquiries?",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
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

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userText = input.trim();
    if (!userText || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
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
              ? "المساعد الآلي غير متاح حالياً. يرجى استخدام نموذج الاتصال."
              : "Chat assistant is temporarily unavailable. Please use our contact form.")
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
          ? "حدث انقطاع مؤقت في خدمة المحادثة. يرجى التواصل معنا عبر نموذج الدعم."
          : "Chat service is temporarily interrupted. Please contact our support team directly."
      );
      setEscalationUrl(isAr ? `/${locale}/${portal}/contact` : `/${locale}/${portal}/contact`);
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
          aria-label={isAr ? "فتح المساعد الآلي لـ إي ثري" : "Open E3 Support Assistant"}
          className="flex items-center gap-2.5 sm:gap-3 px-4 py-3 sm:px-5 sm:py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 font-bold cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
        >
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-xs sm:text-sm font-black tracking-wide uppercase">
            {isAr ? "مساعد إي ثري" : "E3 Support"}
          </span>
        </button>
      )}

      {/* Chat Window Dialog */}
      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-title"
          className="flex flex-col w-[calc(100vw-2rem)] sm:w-[420px] max-w-[420px] h-[540px] max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 id="chat-title" className="text-sm font-black text-zinc-100 tracking-tight">
                  {isAr ? "المساعد الافتراضي لـ E3" : "E3 Virtual Assistant"}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-medium text-zinc-400">
                    {isAr ? "متاح للمساعدة" : "Online Support"}
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
                ? "محادثة مشفرة ومتوافقة مع قانون حماية البيانات القطري (PDPL)."
                : "Encrypted & Qatar PDPL Compliant session."}
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
                  {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
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

            {isLoading && (
              <div className="flex gap-3 items-center text-zinc-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5">
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
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isAr ? "اكتب سؤالك هنا..." : "Ask a question..."}
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
                <span>{isAr ? "تحتاج لمساعدة بشرية؟ تواصل معنا مباشرة" : "Need human support? Contact us directly"}</span>
                <ArrowRight className={`w-3 h-3 ${isAr ? "rotate-180" : ""}`} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
