import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  POST as postChat,
  resolveGeminiTextModel,
  generateConciergeFallback,
  SYSTEM_GROUNDING_PROMPT,
} from '../app/api/chat/route';

describe('Chatbot Human Intelligence & Concierge Experience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. System Persona & Human Grounding Rules', () => {
    it('establishes Sarah the Senior Guest Concierge persona', () => {
      expect(SYSTEM_GROUNDING_PROMPT).toContain('Sarah (سارة)');
      expect(SYSTEM_GROUNDING_PROMPT).toContain('Senior Guest Concierge');
      expect(SYSTEM_GROUNDING_PROMPT).toContain('E3 Qatar');
    });

    it('strictly forbids robotic tropes and generic AI disclaimers', () => {
      expect(SYSTEM_GROUNDING_PROMPT).toContain('NEVER say "As an AI"');
      expect(SYSTEM_GROUNDING_PROMPT).toContain('give cold bulleted robotic dumps');
      expect(SYSTEM_GROUNDING_PROMPT).toContain('Do NOT sound like a machine');
    });

    it('contains verified facts about Qatar attractions and contact channels', () => {
      expect(SYSTEM_GROUNDING_PROMPT).toContain('1,055-meter');
      expect(SYSTEM_GROUNDING_PROMPT).toContain('Guinness World Record');
      expect(SYSTEM_GROUNDING_PROMPT).toContain('InflataRUN');
      expect(SYSTEM_GROUNDING_PROMPT).toContain('Lusail Marina Promenade');
      expect(SYSTEM_GROUNDING_PROMPT).toContain('+974 3048 9955');
      expect(SYSTEM_GROUNDING_PROMPT).toContain('info@eeeqa.com');
      expect(SYSTEM_GROUNDING_PROMPT).toContain('Qatar Personal Data Protection Law (PDPL)');
    });
  });

  describe('2. Gemini 3.6 Flash & Text Model Resolution', () => {
    it('accepts gemini-3.6-flash as a primary production model', () => {
      expect(resolveGeminiTextModel('gemini-3.6-flash')).toBe('gemini-3.6-flash');
      expect(resolveGeminiTextModel('models/gemini-3.6-flash')).toBe('gemini-3.6-flash');
    });

    it('accepts gemini-3.5-flash and previous production models', () => {
      expect(resolveGeminiTextModel('gemini-3.5-flash')).toBe('gemini-3.5-flash');
      expect(resolveGeminiTextModel('gemini-2.5-flash')).toBe('gemini-2.5-flash');
      expect(resolveGeminiTextModel('gemini-2.0-flash')).toBe('gemini-2.0-flash');
    });

    it('filters out non-text modalities to prevent upstream 400 errors', () => {
      expect(resolveGeminiTextModel('gemini-2.5-flash-preview-tts')).toBe('gemini-2.5-flash');
      expect(resolveGeminiTextModel('gemini-live-audio')).toBe('gemini-2.5-flash');
      expect(resolveGeminiTextModel('imagen-3.0')).toBe('gemini-2.5-flash');
      expect(resolveGeminiTextModel('text-embedding-004')).toBe('gemini-2.5-flash');
    });
  });

  describe('3. Intelligent Concierge Fallback Engine', () => {
    it('answers InflataRUN and family questions with authentic facts in English', () => {
      const reply = generateConciergeFallback('Tell me about InflataRUN and kids activities', false);
      expect(reply).toContain('InflataRUN');
      expect(reply).toContain('Guinness World Record');
      expect(reply).toContain('Grip socks');
      expect(reply).not.toContain('As an AI');
    });

    it('answers InflataRUN questions in natural Arabic', () => {
      const reply = generateConciergeFallback('أخبرني عن إنفلاتارن وهل يناسب الأطفال؟', true);
      expect(reply).toContain('InflataRUN');
      expect(reply).toContain('غينيس للأرقام القياسية');
      expect(reply).toContain('جوارب مانعة للانزلاق');
    });

    it('answers ticket and pricing inquiries with realistic packages in English and Arabic', () => {
      const replyEn = generateConciergeFallback('How much are the tickets and packages?', false);
      expect(replyEn).toContain('Standard Single Pass');
      expect(replyEn).toContain('Family 4-Pack');
      expect(replyEn).toContain('VIP Fast-Track');

      const replyAr = generateConciergeFallback('كم سعر التذاكر وباقة العائلة؟', true);
      expect(replyAr).toContain('التذكرة الفردية');
      expect(replyAr).toContain('الباقة العائلية');
      expect(replyAr).toContain('تذكرة كبار الشخصيات');
    });

    it('answers location and opening hours accurately', () => {
      const reply = generateConciergeFallback('Where are you located and what are your opening hours?', false);
      expect(reply).toContain('Lusail Marina Promenade');
      expect(reply).toContain('4:00 PM');
      expect(reply).toContain('Midnight');
    });

    it('provides warm Sarah concierge welcome for general questions', () => {
      const replyEn = generateConciergeFallback('Hello, I need some help', false);
      expect(replyEn).toContain("Sarah from the Guest Experience team");
      expect(replyEn).toContain('+974 3048 9955');

      const replyAr = generateConciergeFallback('مرحبا أريد مساعدة', true);
      expect(replyAr).toContain('أنا سارة من فريق الضيافة');
      expect(replyAr).toContain('+974 3048 9955');
    });
  });

  describe('4. End-to-End POST /api/chat Human Interaction', () => {
    it('dispatches to Gemini with correct human parameters and returns articulate answer', async () => {
      process.env.VERCEL_ENV = 'preview';
      process.env.GEMINI_API_KEY = 'test_gemini_human_key';
      process.env.GEMINI_MODEL = 'gemini-3.6-flash';

      let capturedPayload: any = null;
      let capturedUrl = '';

      const fetchSpy = vi.fn().mockImplementation((url: string, opts: any) => {
        capturedUrl = url;
        if (opts?.body) {
          try {
            capturedPayload = JSON.parse(opts.body);
          } catch {
            // ignore
          }
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              candidates: [
                {
                  content: {
                    parts: [
                      {
                        text: "Welcome to E3 Qatar! InflataRUN is open today at Lusail Marina Promenade until midnight. Grip socks are provided on site!",
                      },
                    ],
                  },
                },
              ],
            }),
        });
      });

      const originalFetch = globalThis.fetch;
      globalThis.fetch = fetchSpy as any;

      try {
        const req = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': '203.0.113.42',
          },
          body: JSON.stringify({
            messages: [
              { role: 'user', content: 'What time does InflataRUN close tonight?' },
            ],
            locale: 'en',
          }),
        });

        const res = await postChat(req);
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json.available).toBe(true);
        expect(json.reply).toContain('InflataRUN is open today');

        // Check model targeting
        expect(capturedUrl).toContain('models/gemini-3.6-flash:generateContent');

        // Check system instruction presence & generation configuration
        expect(capturedPayload.systemInstruction?.parts?.[0]?.text).toContain('Sarah (سارة)');
        expect(capturedPayload.generationConfig?.temperature).toBe(0.65);
        expect(capturedPayload.generationConfig?.maxOutputTokens).toBe(800);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
