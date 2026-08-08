"use client";

import React, { useState, useEffect } from 'react';
import {
  GatewayCustomizationPayload,
  DEFAULT_GATEWAY_CMS_PAYLOAD,
  MediaHolderConfig,
  MediaType,
} from '@/types/gateway-cms';
import { PortalGateway } from '@/components/home/PortalGateway';
import {
  Save,
  Globe,
  Monitor,
  Smartphone,
  Eye,
  Sliders,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Box,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabKey =
  | 'english'
  | 'arabic'
  | 'b2cMedia'
  | 'b2bMedia'
  | 'visual'
  | 'seo'
  | 'preview';

export default function GatewayCustomizationPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('english');
  const [formData, setFormData] =
    useState<GatewayCustomizationPayload>(DEFAULT_GATEWAY_CMS_PAYLOAD);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Preview Controls State
  const [previewLocale, setPreviewLocale] = useState<'en' | 'ar'>('en');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [forceFallbackPreview, setForceFallbackPreview] = useState(false);
  const [forceReducedMotion, setForceReducedMotion] = useState(false);

  const showToast = React.useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchSettings = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings/gateway?mode=draft');
      const json = await res.json();
      if (json.success && json.data) {
        setFormData(json.data);
      }
    } catch (e) {
      console.error('Failed to load gateway settings:', e);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Expected pattern for initial setting fetch on mount
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (action: 'save_draft' | 'publish') => {
    try {
      if (action === 'publish') setPublishing(true);
      else setSaving(true);

      const res = await fetch('/api/settings/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload: formData }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setFormData(json.data);
        showToast(
          action === 'publish'
            ? 'Gateway published successfully to live platform!'
            : 'Gateway draft saved successfully!',
          'success'
        );
      } else {
        showToast(json.error || 'Failed to save gateway customization', 'error');
      }
    } catch (e) {
      console.error('Error saving gateway:', e);
      showToast('Internal Server Error', 'error');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const updateNested = (section: keyof GatewayCustomizationPayload, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm font-medium">Loading Gateway Customization CMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={cn(
            'fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 border text-sm font-semibold transition-all duration-300',
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">
              Gateway Customization CMS
            </h1>
            <span
              className={cn(
                'px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full border',
                formData.status === 'PUBLISHED'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              )}
            >
              {formData.status}
            </span>
          </div>
          <p className="text-zinc-400 text-sm">
            Manage bilingual English/Arabic gateway content, universal media holders, visual settings, and accessibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave('save_draft')}
            disabled={saving || publishing}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold border border-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Draft...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={() => handleSave('publish')}
            disabled={saving || publishing}
            className="px-5 py-2 bg-[var(--color-primary)] hover:brightness-110 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-[var(--color-primary)]/25 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{publishing ? 'Publishing...' : 'Publish Gateway'}</span>
          </button>
        </div>
      </div>

      {/* CMS TABS NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-white/10 scrollbar-none">
        {[
          { key: 'english', label: '1. English Content', icon: FileText },
          { key: 'arabic', label: '2. Arabic Content', icon: Globe },
          { key: 'b2cMedia', label: '3. B2C Media', icon: ImageIcon },
          { key: 'b2bMedia', label: '4. B2B Media', icon: Box },
          { key: 'visual', label: '5. Visual & Behaviour', icon: Sliders },
          { key: 'seo', label: '6. SEO & Accessibility', icon: ShieldAlert },
          { key: 'preview', label: '7. Live Preview', icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={cn(
                'px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 border',
                isActive
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md shadow-[var(--color-primary)]/20'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white border-white/5 hover:bg-zinc-900'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6 md:p-8">
        {/* 1. ENGLISH CONTENT */}
        {activeTab === 'english' && (
          <div className="space-y-6 max-w-4xl">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--color-primary)]" />
              <span>English Gateway Content (LTR)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Gateway Eyebrow (EN)
                </label>
                <input
                  type="text"
                  value={formData.english.eyebrowEn}
                  onChange={(e) => updateNested('english', 'eyebrowEn', e.target.value)}
                  className="w-full bg-zinc-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Main Headline (EN)
                </label>
                <input
                  type="text"
                  value={formData.english.headlineEn}
                  onChange={(e) => updateNested('english', 'headlineEn', e.target.value)}
                  className="w-full bg-zinc-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Supporting Text (EN)
              </label>
              <textarea
                rows={2}
                value={formData.english.supportingTextEn}
                onChange={(e) => updateNested('english', 'supportingTextEn', e.target.value)}
                className="w-full bg-zinc-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* B2C English Fields */}
              <div className="space-y-4 bg-zinc-950/60 p-5 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  B2C Public Card (EN)
                </h3>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Card Eyebrow Label</label>
                  <input
                    type="text"
                    value={formData.english.b2cLabelEn}
                    onChange={(e) => updateNested('english', 'b2cLabelEn', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Card Main Title</label>
                  <input
                    type="text"
                    value={formData.english.b2cTitleEn}
                    onChange={(e) => updateNested('english', 'b2cTitleEn', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.english.b2cDescEn}
                    onChange={(e) => updateNested('english', 'b2cDescEn', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={formData.english.b2cCtaLabelEn}
                    onChange={(e) => updateNested('english', 'b2cCtaLabelEn', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Dynamic Statistic Badge</label>
                  <input
                    type="text"
                    value={formData.english.b2cStatLabelEn}
                    onChange={(e) => updateNested('english', 'b2cStatLabelEn', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* B2B English Fields */}
              <div className="space-y-4 bg-zinc-950/60 p-5 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  B2B Enterprise Card (EN)
                </h3>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Card Eyebrow Label</label>
                  <input
                    type="text"
                    value={formData.english.b2bLabelEn}
                    onChange={(e) => updateNested('english', 'b2bLabelEn', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Card Main Title</label>
                  <input
                    type="text"
                    value={formData.english.b2bTitleEn}
                    onChange={(e) => updateNested('english', 'b2bTitleEn', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.english.b2bDescEn}
                    onChange={(e) => updateNested('english', 'b2bDescEn', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={formData.english.b2bCtaLabelEn}
                    onChange={(e) => updateNested('english', 'b2bCtaLabelEn', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Dynamic Statistic Badge</label>
                  <input
                    type="text"
                    value={formData.english.b2bStatLabelEn}
                    onChange={(e) => updateNested('english', 'b2bStatLabelEn', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ARABIC CONTENT */}
        {activeTab === 'arabic' && (
          <div className="space-y-6 max-w-4xl" dir="rtl">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2 text-right">
              <Globe className="w-5 h-5 text-[var(--color-primary)]" />
              <span>المحتوى العربي (RTL)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  شعار البوابة (العربية)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={formData.arabic.eyebrowAr}
                  onChange={(e) => updateNested('arabic', 'eyebrowAr', e.target.value)}
                  className="w-full bg-zinc-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  العنوان الرئيسي (العربية)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={formData.arabic.headlineAr}
                  onChange={(e) => updateNested('arabic', 'headlineAr', e.target.value)}
                  className="w-full bg-zinc-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] text-right"
                />
              </div>
            </div>

            <div className="text-right">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                النص الداعم والتوضيحي (العربية)
              </label>
              <textarea
                rows={2}
                dir="rtl"
                value={formData.arabic.supportingTextAr}
                onChange={(e) => updateNested('arabic', 'supportingTextAr', e.target.value)}
                className="w-full bg-zinc-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] text-right"
              />
            </div>

            <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
              {/* B2C Arabic Fields */}
              <div className="space-y-4 bg-zinc-950/60 p-5 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  بطاقة بوابة الأفراد (العربية)
                </h3>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">الشعار العلوي للبطاقة</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.arabic.b2cLabelAr}
                    onChange={(e) => updateNested('arabic', 'b2cLabelAr', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">العنوان الرئيسي</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.arabic.b2cTitleAr}
                    onChange={(e) => updateNested('arabic', 'b2cTitleAr', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">الوصف التفصيلي</label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={formData.arabic.b2cDescAr}
                    onChange={(e) => updateNested('arabic', 'b2cDescAr', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">نص زر الدخول</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.arabic.b2cCtaLabelAr}
                    onChange={(e) => updateNested('arabic', 'b2cCtaLabelAr', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">شارة الإحصائيات</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.arabic.b2cStatLabelAr}
                    onChange={(e) => updateNested('arabic', 'b2cStatLabelAr', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-right"
                  />
                </div>
              </div>

              {/* B2B Arabic Fields */}
              <div className="space-y-4 bg-zinc-950/60 p-5 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  بطاقة بوابة الشركات (العربية)
                </h3>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">الشعار العلوي للبطاقة</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.arabic.b2bLabelAr}
                    onChange={(e) => updateNested('arabic', 'b2bLabelAr', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">العنوان الرئيسي</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.arabic.b2bTitleAr}
                    onChange={(e) => updateNested('arabic', 'b2bTitleAr', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">الوصف التفصيلي</label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={formData.arabic.b2bDescAr}
                    onChange={(e) => updateNested('arabic', 'b2bDescAr', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">نص زر الدخول</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.arabic.b2bCtaLabelAr}
                    onChange={(e) => updateNested('arabic', 'b2bCtaLabelAr', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">شارة الإحصائيات</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.arabic.b2bStatLabelAr}
                    onChange={(e) => updateNested('arabic', 'b2bStatLabelAr', e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-right"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. B2C MEDIA & 4. B2B MEDIA FORM COMPONENT */}
        {(activeTab === 'b2cMedia' || activeTab === 'b2bMedia') && (
          <div className="space-y-8 max-w-4xl">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[var(--color-primary)]" />
              <span>
                {activeTab === 'b2cMedia'
                  ? 'B2C Universal Media Holders (Desktop & Mobile)'
                  : 'B2B Universal Media Holders (Desktop & Mobile)'}
              </span>
            </h2>

            {[
              {
                key: activeTab === 'b2cMedia' ? 'b2cDesktopMedia' : 'b2bDesktopMedia',
                title: 'Desktop Viewport Media Holder',
              },
              {
                key: activeTab === 'b2cMedia' ? 'b2cMobileMedia' : 'b2bMobileMedia',
                title: 'Mobile Viewport Media Holder',
              },
            ].map(({ key, title }) => {
              const media = formData[key as keyof GatewayCustomizationPayload] as MediaHolderConfig;
              return (
                <div key={key} className="bg-zinc-950 p-6 rounded-2xl border border-white/10 space-y-5">
                  <h3 className="text-base font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{title}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
                      {media.mediaType}
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Media Type Selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Media Type
                      </label>
                      <select
                        value={media.mediaType}
                        onChange={(e) =>
                          updateNested(
                            key as keyof GatewayCustomizationPayload,
                            'mediaType',
                            e.target.value as MediaType
                          )
                        }
                        className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-white"
                      >
                        <option value="IMAGE">Image</option>
                        <option value="VIDEO">Video</option>
                        <option value="MODEL_3D">3D Model / Scene</option>
                        <option value="IFRAME">Iframe / Embed</option>
                      </select>
                    </div>

                    {/* Media URL */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Media URL / Asset Source
                      </label>
                      <input
                        type="text"
                        value={media.mediaUrl}
                        onChange={(e) =>
                          updateNested(key as keyof GatewayCustomizationPayload, 'mediaUrl', e.target.value)
                        }
                        className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Mandatory Fallback Image URL */}
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-300">
                      Mandatory Fallback Image URL (Required for Video, 3D, Iframe fallback)
                    </label>
                    <input
                      type="text"
                      value={media.fallbackImageUrl}
                      onChange={(e) =>
                        updateNested(key as keyof GatewayCustomizationPayload, 'fallbackImageUrl', e.target.value)
                      }
                      className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    />
                  </div>

                  {/* Alt Text Pairing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Alt Text (English)</label>
                      <input
                        type="text"
                        value={media.altEn}
                        onChange={(e) =>
                          updateNested(key as keyof GatewayCustomizationPayload, 'altEn', e.target.value)
                        }
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Alt Text (Arabic)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={media.altAr}
                        onChange={(e) =>
                          updateNested(key as keyof GatewayCustomizationPayload, 'altAr', e.target.value)
                        }
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-right"
                      />
                    </div>
                  </div>

                  {/* Sliders & Controls */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-white/10 text-xs">
                    <div>
                      <label className="block text-zinc-400 mb-1">Focal Point X ({media.focalPointX}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={media.focalPointX}
                        onChange={(e) =>
                          updateNested(
                            key as keyof GatewayCustomizationPayload,
                            'focalPointX',
                            Number(e.target.value)
                          )
                        }
                        className="w-full accent-[var(--color-primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1">Focal Point Y ({media.focalPointY}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={media.focalPointY}
                        onChange={(e) =>
                          updateNested(
                            key as keyof GatewayCustomizationPayload,
                            'focalPointY',
                            Number(e.target.value)
                          )
                        }
                        className="w-full accent-[var(--color-primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1">Object Fit</label>
                      <select
                        value={media.objectFit}
                        onChange={(e) =>
                          updateNested(
                            key as keyof GatewayCustomizationPayload,
                            'objectFit',
                            e.target.value
                          )
                        }
                        className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1 text-white"
                      >
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="fill">Fill</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={media.autoplay}
                          onChange={(e) =>
                            updateNested(
                              key as keyof GatewayCustomizationPayload,
                              'autoplay',
                              e.target.checked
                            )
                          }
                          className="accent-[var(--color-primary)]"
                        />
                        <span>Autoplay</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={media.muted}
                          onChange={(e) =>
                            updateNested(
                              key as keyof GatewayCustomizationPayload,
                              'muted',
                              e.target.checked
                            )
                          }
                          className="accent-[var(--color-primary)]"
                        />
                        <span>Muted</span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. VISUAL & BEHAVIOUR */}
        {activeTab === 'visual' && (
          <div className="space-y-6 max-w-4xl">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[var(--color-primary)]" />
              <span>Visual & Behaviour Settings</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Background Style Mode
                </label>
                <select
                  value={formData.visual.backgroundStyle}
                  onChange={(e) => updateNested('visual', 'backgroundStyle', e.target.value)}
                  className="w-full bg-zinc-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white"
                >
                  <option value="wireframe">Interactive 3D Grid Wireframe</option>
                  <option value="glass">Glassmorphism Dynamic Theme</option>
                  <option value="gradient">Deep Space Gradient</option>
                  <option value="custom_media">Custom Universal Media Holders</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Default Theme Preference
                </label>
                <select
                  value={formData.visual.themeMode}
                  onChange={(e) => updateNested('visual', 'themeMode', e.target.value)}
                  className="w-full bg-zinc-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white"
                >
                  <option value="dark">Dark Theme (Default)</option>
                  <option value="light">Light Theme</option>
                  <option value="auto">System Preference</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-zinc-950 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  checked={formData.visual.fastRoutingEnabled}
                  onChange={(e) => updateNested('visual', 'fastRoutingEnabled', e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-primary)]"
                />
                <div>
                  <div className="text-sm font-bold text-white">Enable Fast Routing Memory</div>
                  <div className="text-xs text-zinc-400">
                    Automatically route returning visitors based on their saved portal preference.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 bg-zinc-950 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  checked={formData.visual.reducedMotionDefault}
                  onChange={(e) => updateNested('visual', 'reducedMotionDefault', e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-primary)]"
                />
                <div>
                  <div className="text-sm font-bold text-white">Default Reduced Motion Fallback</div>
                  <div className="text-xs text-zinc-400">
                    Automatically serve static fallback images for visitors with reduced motion preferences.
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* 6. SEO & ACCESSIBILITY */}
        {activeTab === 'seo' && (
          <div className="space-y-6 max-w-4xl">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[var(--color-primary)]" />
              <span>SEO & Accessibility Customization</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  SEO Title (English)
                </label>
                <input
                  type="text"
                  value={formData.seoAccess.seoTitleEn}
                  onChange={(e) => updateNested('seoAccess', 'seoTitleEn', e.target.value)}
                  className="w-full bg-zinc-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 text-right">
                  عنوان نتائج البحث (العربية)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={formData.seoAccess.seoTitleAr}
                  onChange={(e) => updateNested('seoAccess', 'seoTitleAr', e.target.value)}
                  className="w-full bg-zinc-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Meta Description (English)
                </label>
                <textarea
                  rows={2}
                  value={formData.seoAccess.seoDescEn}
                  onChange={(e) => updateNested('seoAccess', 'seoDescEn', e.target.value)}
                  className="w-full bg-zinc-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 text-right">
                  وصف محركات البحث (العربية)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={formData.seoAccess.seoDescAr}
                  onChange={(e) => updateNested('seoAccess', 'seoDescAr', e.target.value)}
                  className="w-full bg-zinc-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white text-right"
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. LIVE INTERACTIVE PREVIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-zinc-950 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase text-zinc-400">Preview Controls:</span>

                {/* EN / AR Language Switcher */}
                <button
                  onClick={() => setPreviewLocale((prev) => (prev === 'en' ? 'ar' : 'en'))}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>{previewLocale === 'en' ? 'Arabic (RTL)' : 'English (LTR)'}</span>
                </button>

                {/* Device Frame Selector */}
                <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-white/10">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={cn(
                      'p-1.5 rounded text-xs',
                      previewDevice === 'desktop' ? 'bg-[var(--color-primary)] text-white' : 'text-zinc-400'
                    )}
                    title="Desktop View"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={cn(
                      'p-1.5 rounded text-xs',
                      previewDevice === 'mobile' ? 'bg-[var(--color-primary)] text-white' : 'text-zinc-400'
                    )}
                    title="Mobile View"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceFallbackPreview}
                    onChange={(e) => setForceFallbackPreview(e.target.checked)}
                    className="accent-[var(--color-primary)]"
                  />
                  <span>Fallback Media Preview</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceReducedMotion}
                    onChange={(e) => setForceReducedMotion(e.target.checked)}
                    className="accent-[var(--color-primary)]"
                  />
                  <span>Reduced Motion</span>
                </label>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div
              className={cn(
                'mx-auto border border-white/20 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300',
                previewDevice === 'desktop' ? 'w-full min-h-[600px]' : 'max-w-sm min-h-[600px]'
              )}
            >
              <PortalGateway cmsData={formData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
