"use client";

import { useState } from "react";
import { AdminFormLayout } from "../ui/AdminFormLayout";
import { AdminPageHeader } from "../ui/AdminPageHeader";
import { AdminMediaPicker } from "../ui/AdminMediaPicker";
import { AdminButton } from "../ui/AdminButton";
import { Plus, Trash2, Video, Eye, Sparkles, Layers, Shield, ChevronDown, ChevronUp, Layout, HelpCircle, Mail, Type, CheckCircle, Play } from "lucide-react";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { MaskedMediaEngine } from "@/components/b2c/hero/MaskedMediaEngine";
import { MaskPresetType } from "@/components/b2c/hero/MaskPresets";
import { validateAndSanitizeSvg } from "@/lib/svgSanitizer";
import { getMergedCMSPageContent } from "@/lib/cms-default-pages";

export function B2CLandingCMSView({ initialData }: { initialData: any }) {
  const merged = getMergedCMSPageContent("b2c-landing", initialData);
  const [data, setData] = useState(merged);
  const [activeTab, setActiveTab] = useState<"hero" | "sections" | "cta" | "faqs">("hero");

  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showAdvancedMasking, setShowAdvancedMasking] = useState(false);
  const [previewPortal, setPreviewPortal] = useState<"customer" | "organizer">("customer");
  const [previewLocale, setPreviewLocale] = useState<"en" | "ar">("en");
  const [svgValidationError, setSvgValidationError] = useState<string | null>(null);

  const handleCustomSvgChange = (svgString: string) => {
    if (!svgString.trim()) {
      setSvgValidationError(null);
      handleChange("maskedVideo", "customSvgMask", "");
      return;
    }

    const valResult = validateAndSanitizeSvg(svgString);
    if (!valResult.isValid) {
      setSvgValidationError(valResult.error || "Invalid SVG mask");
      toast(valResult.error || "Unsafe or invalid SVG mask detected", "error");
    } else {
      setSvgValidationError(null);
      handleChange("maskedVideo", "customSvgMask", valResult.sanitizedSvg);
      toast("Custom SVG mask sanitized & validated successfully", "success");
    }
  };

  const sanitizeCMSData = (raw: any) => {
    const clone = JSON.parse(JSON.stringify(raw));
    let dataUrlStripped = false;

    const checkAndClean = (obj: any, key: string, fallbackUrl: string) => {
      if (obj && typeof obj[key] === 'string' && obj[key].startsWith('data:') && obj[key].length > 500000) {
        obj[key] = fallbackUrl;
        dataUrlStripped = true;
      }
    };

    if (clone.hero) checkAndClean(clone.hero, 'mediaUrl', 'https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4');
    if (clone.hero) checkAndClean(clone.hero, 'streamMediaUrl', 'https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4');
    if (clone.maskedVideo) {
      checkAndClean(clone.maskedVideo, 'customerDesktopVideo', 'https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4');
      checkAndClean(clone.maskedVideo, 'customerPoster', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop');
      checkAndClean(clone.maskedVideo, 'organizerDesktopVideo', 'https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4');
      checkAndClean(clone.maskedVideo, 'organizerPoster', 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop');
    }

    return { cleaned: clone, dataUrlStripped };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { cleaned, dataUrlStripped } = sanitizeCMSData(data);

      if (dataUrlStripped) {
        toast("Raw base64 video data URL stripped to prevent server payload error. Please enter a direct Video URL (e.g. https://.../video.mp4).", "info");
      }

      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: cleaned })
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned HTTP ${res.status}`);
      }
      const resJson = await res.json();
      if (resJson.data?.content) {
        setData(resJson.data.content);
      }
      toast("B2C Landing Page & Hero Media updated successfully.", "success");
    } catch (e: any) {
      console.error(e);
      toast(e?.message || "Failed to save B2C Landing Page.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: keyof typeof data, field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  // Unified Media Picker Handler: Syncs hero.mediaUrl across all portal views automatically!
  const handleHeroMediaChange = (url: string) => {
    const isVideo = !url ? false : (
      /\.(mp4|webm|mov|m4v|mkv)$/i.test(url) ||
      url.includes('video') ||
      url.includes('/api/media/') ||
      url.includes('/api/upload/') ||
      url.startsWith('blob:')
    );

    setData((prev: any) => ({
      ...prev,
      hero: {
        ...prev.hero,
        mediaUrl: url,
        mediaType: isVideo ? 'VIDEO' : 'IMAGE'
      },
      maskedVideo: {
        ...prev.maskedVideo,
        customerDesktopVideo: url,
        organizerDesktopVideo: prev.maskedVideo?.organizerDesktopVideo || url
      }
    }));
    toast("Hero background media updated successfully.", "success");
  };

  const handleSimpleChange = (field: keyof typeof data, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFaqChange = (index: number, field: string, value: string) => {
    setData((prev: any) => {
      const newFaqs = [...prev.faqs];
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      return { ...prev, faqs: newFaqs };
    });
  };

  const addFaq = () => {
    setData((prev: any) => ({
      ...prev,
      faqs: [...prev.faqs, { questionEn: "", questionAr: "", answerEn: "", answerAr: "" }]
    }));
  };

  const removeFaq = (index: number) => {
    setData((prev: any) => {
      const newFaqs = [...prev.faqs];
      newFaqs.splice(index, 1);
      return { ...prev, faqs: newFaqs };
    });
  };

  const currentMaskedMedia = previewPortal === "customer"
    ? {
        videoUrl: data.hero.mediaUrl || data.maskedVideo.customerDesktopVideo,
        posterUrl: data.maskedVideo.customerPoster,
        preset: data.maskedVideo.customerMaskPreset as MaskPresetType,
        accent: data.maskedVideo.customerAccent,
        altEn: data.maskedVideo.customerAltEn,
        altAr: data.maskedVideo.customerAltAr,
      }
    : {
        videoUrl: data.hero.mediaUrl || data.maskedVideo.organizerDesktopVideo,
        posterUrl: data.maskedVideo.organizerPoster,
        preset: data.maskedVideo.organizerMaskPreset as MaskPresetType,
        accent: data.maskedVideo.organizerAccent,
        altEn: data.maskedVideo.organizerAltEn,
        altAr: data.maskedVideo.organizerAltAr,
      };

  return (
    <div className="flex flex-col gap-6 h-full p-4 md:p-8 max-w-6xl mx-auto pb-24">
      {/* Page Header */}
      <AdminPageHeader
        title="B2C Landing Page CMS"
        description="Easily customize titles, background videos, section headers, and FAQs for /en/b2c."
        action={
          <AdminButton variant="primary" onClick={handleSave} disabled={saving} className="px-6 py-2.5 shadow-lg shadow-emerald-500/20">
            {saving ? "Saving Changes..." : "Save Configuration"}
          </AdminButton>
        }
      />

      {/* Simplified Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border-default pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "hero"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          }`}
        >
          <Video className="w-4 h-4" /> 1. Hero & Video Banner
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sections")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "sections"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          }`}
        >
          <Type className="w-4 h-4" /> 2. Section Titles
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cta")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "cta"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          }`}
        >
          <Mail className="w-4 h-4" /> 3. Newsletter & Footer
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("faqs")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "faqs"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          }`}
        >
          <HelpCircle className="w-4 h-4" /> 4. FAQs ({data.faqs?.length || 0})
        </button>
      </div>

      <AdminFormLayout>
        {/* TAB 1: HERO & VIDEO BANNER */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            {/* Main Hero Header & Subheader Content */}
            <div className="bg-surface-default border border-border-default rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border-default pb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Hero Titles & Headline</h2>
                  <p className="text-xs text-text-secondary">Customize the main hero title and tagline visible at the top of /en/b2c.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Header Title (English)</label>
                  <input
                    type="text"
                    value={data.hero.headerEn}
                    onChange={e => handleChange("hero", "headerEn", e.target.value)}
                    placeholder="E3 PULSE MASKED WORLDS"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Header Title (Arabic)</label>
                  <input
                    type="text"
                    value={data.hero.headerAr}
                    onChange={e => handleChange("hero", "headerAr", e.target.value)}
                    placeholder="استكشف عالم إي ثري الترفيهي"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Subheader / Tagline (English)</label>
                  <textarea
                    value={data.hero.subHeaderEn}
                    onChange={e => handleChange("hero", "subHeaderEn", e.target.value)}
                    rows={3}
                    placeholder="Qatar premier immersive attractions and kinetic entertainment."
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Subheader / Tagline (Arabic)</label>
                  <textarea
                    value={data.hero.subHeaderAr}
                    onChange={e => handleChange("hero", "subHeaderAr", e.target.value)}
                    rows={3}
                    placeholder="تجارب ترفيهية غامرة ومدن ألعاب فضائية في قطر"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                  />
                </div>
              </div>
            </div>

            {/* Simple Hero Video / Image Uploader Card */}
            <div className="bg-surface-default border border-border-default rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border-default pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-primary">Hero Background Video / Media</h2>
                    <p className="text-xs text-text-secondary">Upload a video or image file from your computer, or pick from media library.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <AdminMediaPicker
                  label="Upload Hero Background Video / Image File"
                  value={data.hero.mediaUrl || data.maskedVideo.customerDesktopVideo}
                  onChange={handleHeroMediaChange}
                  accept="video/*,image/*"
                />

                <div className="pt-2">
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Direct Media URL (Optional External Link)</label>
                  <input
                    type="text"
                    value={data.hero.mediaUrl || ''}
                    onChange={e => handleHeroMediaChange(e.target.value)}
                    placeholder="Paste direct video URL (e.g. https://.../video.mp4) or leave empty if uploaded above..."
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-xs font-mono text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Live Stream Card Content Manager */}
            <div className="bg-surface-default border border-border-default rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border-default pb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Play className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Featured Live Stream Card</h2>
                  <p className="text-xs text-text-secondary">Configure the interactive right-side Live Stream card media, badge, titles, and target CTA link.</p>
                </div>
              </div>

              <div className="space-y-4">
                <AdminMediaPicker
                  label="Live Stream Media File (Video / Image)"
                  value={data.hero.streamMediaUrl || data.hero.mediaUrl}
                  onChange={(url) => handleChange("hero", "streamMediaUrl", url)}
                  accept="video/*,image/*"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Badge Label (English)</label>
                    <input
                      type="text"
                      value={data.hero.streamBadgeEn || "LIVE STREAM"}
                      onChange={e => handleChange("hero", "streamBadgeEn", e.target.value)}
                      placeholder="LIVE STREAM"
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Badge Label (Arabic)</label>
                    <input
                      type="text"
                      value={data.hero.streamBadgeAr || "مباشر الآن"}
                      onChange={e => handleChange("hero", "streamBadgeAr", e.target.value)}
                      placeholder="مباشر الآن"
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Card Title (English)</label>
                    <input
                      type="text"
                      value={data.hero.streamTitleEn || "E3 KINETIC EXPERIENCE"}
                      onChange={e => handleChange("hero", "streamTitleEn", e.target.value)}
                      placeholder="E3 KINETIC EXPERIENCE"
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Card Title (Arabic)</label>
                    <input
                      type="text"
                      value={data.hero.streamTitleAr || "عالم إي ثري الترفيهي"}
                      onChange={e => handleChange("hero", "streamTitleAr", e.target.value)}
                      placeholder="عالم إي ثري الترفيهي"
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Subtitle / Location (English)</label>
                    <input
                      type="text"
                      value={data.hero.streamSubtitleEn || "Doha Flagship Attractions & Events"}
                      onChange={e => handleChange("hero", "streamSubtitleEn", e.target.value)}
                      placeholder="Doha Flagship Attractions & Events"
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Subtitle / Location (Arabic)</label>
                    <input
                      type="text"
                      value={data.hero.streamSubtitleAr || "تجارب تفاعلية فريدة في الدوحة"}
                      onChange={e => handleChange("hero", "streamSubtitleAr", e.target.value)}
                      placeholder="تجارب تفاعلية فريدة في الدوحة"
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Play Button Target Route URL</label>
                  <input
                    type="text"
                    value={data.hero.streamButtonUrl || "/b2c/attractions"}
                    onChange={e => handleChange("hero", "streamButtonUrl", e.target.value)}
                    placeholder="/b2c/attractions"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-xs font-mono text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

            {/* Collapsible Advanced Masking & Shader Settings (Hidden by default to avoid clutter) */}
            <div className="bg-surface-default border border-border-default rounded-2xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setShowAdvancedMasking(!showAdvancedMasking)}
                className="w-full flex items-center justify-between p-5 bg-surface-hover/30 hover:bg-surface-hover transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-text-primary block">⚙️ Advanced Animated Video Masking Settings</span>
                    <span className="text-xs text-text-tertiary">Shapes, custom SVG masks, portal modes, and 3D shader controls</span>
                  </div>
                </div>
                {showAdvancedMasking ? <ChevronUp className="w-5 h-5 text-text-secondary" /> : <ChevronDown className="w-5 h-5 text-text-secondary" />}
              </button>

              {showAdvancedMasking && (
                <div className="p-6 border-t border-border-default space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={data.maskedVideo.enabled}
                        onChange={e => handleChange("maskedVideo", "enabled", e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      Enable Masked Video Hero Animation
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Renderer Engine Mode</label>
                      <select
                        value={data.maskedVideo.rendererMode}
                        onChange={e => handleChange("maskedVideo", "rendererMode", e.target.value)}
                        className="w-full bg-surface-hover border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="STANDARD">Standard (CSS / SVG Mask + GSAP)</option>
                        <option value="CINEMATIC">Cinematic 3D (R3F / Three.js Shader)</option>
                        <option value="LIGHTWEIGHT">Lightweight (Static Mobile Fallback)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Default Mask Shape</label>
                      <select
                        value={data.maskedVideo.preset}
                        onChange={e => handleChange("maskedVideo", "preset", e.target.value)}
                        className="w-full bg-surface-hover border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="ORGANIC_WINDOW">Organic Window</option>
                        <option value="E3_MONOGRAM">E3 Monogram Silhouette</option>
                        <option value="PORTAL_ARCH">Portal Arch</option>
                        <option value="FLUID_RIBBON">Fluid Ribbon</option>
                        <option value="CIRCULAR_LENS">Circular Lens</option>
                        <option value="SPLIT_WORLDS">Split Worlds</option>
                        <option value="ARCHITECTURAL_FRAME">Architectural Frame</option>
                        <option value="CUSTOM_SVG_MASK">Custom SVG Mask</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Default Portal Scope</label>
                      <select
                        value={data.maskedVideo.defaultPortal}
                        onChange={e => handleChange("maskedVideo", "defaultPortal", e.target.value)}
                        className="w-full bg-surface-hover border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="customer">Customer B2C</option>
                        <option value="organizer">Organizer B2B</option>
                      </select>
                    </div>
                  </div>

                  {data.maskedVideo.preset === "CUSTOM_SVG_MASK" && (
                    <div className="border border-amber-500/30 rounded-xl p-4 bg-amber-500/5 space-y-2">
                      <label className="block text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Shield className="w-4 h-4" /> Custom SVG Mask String (Sanitized)
                      </label>
                      <textarea
                        value={data.maskedVideo.customSvgMask}
                        onChange={e => handleCustomSvgChange(e.target.value)}
                        placeholder='<svg viewBox="0 0 100 100"><path d="..."/></svg>'
                        rows={3}
                        className="w-full bg-surface-default border border-border-default rounded-xl p-3 text-xs font-mono text-text-primary focus:outline-none"
                      />
                      {svgValidationError && (
                        <p className="text-xs text-rose-400 font-semibold">{svgValidationError}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Live Hero Preview Card */}
            <div className="border border-emerald-500/30 rounded-2xl p-6 bg-slate-950 text-white space-y-4 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold tracking-wide uppercase text-slate-200">Interactive Hero Live Preview</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewPortal("customer")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      previewPortal === "customer" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    Customer View
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPortal("organizer")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      previewPortal === "organizer" ? "bg-sky-500 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    Organizer View
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewLocale(previewLocale === "en" ? "ar" : "en")}
                    className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-extrabold"
                  >
                    {previewLocale.toUpperCase()}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center p-6 bg-slate-900/60 rounded-xl min-h-[300px]">
                <MaskedMediaEngine
                  portalMode={previewPortal}
                  videoUrl={currentMaskedMedia.videoUrl}
                  posterUrl={currentMaskedMedia.posterUrl}
                  preset={data.maskedVideo.preset as MaskPresetType}
                  customSvgMask={data.maskedVideo.customSvgMask}
                  scale={data.maskedVideo.scale}
                  positionX={data.maskedVideo.positionX}
                  positionY={data.maskedVideo.positionY}
                  edgeSoftness={data.maskedVideo.edgeSoftness}
                  distortionAmount={data.maskedVideo.distortionAmount}
                  idleBreathe={data.maskedVideo.idleBreathe}
                  cursorResponse={data.maskedVideo.cursorResponse}
                  rendererMode={data.maskedVideo.rendererMode as any}
                  accentColor={currentMaskedMedia.accent}
                  altTextEn={currentMaskedMedia.altEn}
                  altTextAr={currentMaskedMedia.altAr}
                />
              </div>
            </div>
          </div>
        </div>
      )}

        {/* TAB 2: SECTION TITLES */}
        {activeTab === "sections" && (
          <div className="bg-surface-default border border-border-default rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border-default pb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary">Section Titles</h2>
                <p className="text-xs text-text-secondary">Customize section titles displayed above attractions and grid sections.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Featured Section Title (English)</label>
                <input
                  type="text"
                  value={data.featuredTitleEn}
                  onChange={e => handleSimpleChange("featuredTitleEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Featured Section Title (Arabic)</label>
                <input
                  type="text"
                  value={data.featuredTitleAr}
                  onChange={e => handleSimpleChange("featuredTitleAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">All Experiences Title (English)</label>
                <input
                  type="text"
                  value={data.gridTitleEn}
                  onChange={e => handleSimpleChange("gridTitleEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">All Experiences Title (Arabic)</label>
                <input
                  type="text"
                  value={data.gridTitleAr}
                  onChange={e => handleSimpleChange("gridTitleAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NEWSLETTER & CTAs & FOOTER MEDIA */}
        {activeTab === "cta" && (
          <div className="space-y-6">
            {/* Newsletter Subscription Banner */}
            <div className="bg-surface-default border border-border-default rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border-default pb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Newsletter Subscription Banner</h2>
                  <p className="text-xs text-text-secondary">Customize the newsletter opt-in banner titles and description.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Subscribe Title (English)</label>
                  <input
                    type="text"
                    value={data.subscribe?.titleEn || ''}
                    onChange={e => handleChange("subscribe", "titleEn", e.target.value)}
                    placeholder="JOIN THE E3 PULSE INSIDERS"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Subscribe Title (Arabic)</label>
                  <input
                    type="text"
                    value={data.subscribe?.titleAr || ''}
                    onChange={e => handleChange("subscribe", "titleAr", e.target.value)}
                    placeholder="انضم إلى النشرة البريدية لـ إي ثري"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Subscribe Subtitle (English)</label>
                  <input
                    type="text"
                    value={data.subscribe?.subtitleEn || ''}
                    onChange={e => handleChange("subscribe", "subtitleEn", e.target.value)}
                    placeholder="Get exclusive access to VIP attraction launches, secret pop-ups, and early ticket drops."
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Subscribe Subtitle (Arabic)</label>
                  <input
                    type="text"
                    value={data.subscribe?.subtitleAr || ''}
                    onChange={e => handleChange("subscribe", "subtitleAr", e.target.value)}
                    placeholder="احصل على وصول حصري لإطلاق الوجهات الجديدة وتذاكر الفعاليات القادمة."
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                  />
                </div>
              </div>
            </div>

            {/* Birthday Party & Corporate Packages Banner */}
            <div className="bg-surface-default border border-border-default rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border-default pb-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Birthday & Corporate Packages Banner</h2>
                  <p className="text-xs text-text-secondary">Customize the packages banner callout visible above the footer.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Banner Headline (English)</label>
                  <input
                    type="text"
                    value={data.careersCta?.titleEn || ''}
                    onChange={e => handleChange("careersCta", "titleEn", e.target.value)}
                    placeholder="HOST YOUR BIRTHDAY PARTY OR CORPORATE EVENT"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Banner Headline (Arabic)</label>
                  <input
                    type="text"
                    value={data.careersCta?.titleAr || ''}
                    onChange={e => handleChange("careersCta", "titleAr", e.target.value)}
                    placeholder="احجز حفل عيد ميلادك أو فعاليتك الخاصة"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Banner Description (English)</label>
                  <textarea
                    value={data.careersCta?.subtitleEn || ''}
                    onChange={e => handleChange("careersCta", "subtitleEn", e.target.value)}
                    rows={2}
                    placeholder="Discover all-inclusive VIP birthday packages, corporate team-building outings, and exclusive venue buyouts across Qatar."
                    className="w-full bg-surface-hover border border-border-default rounded-xl p-3 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Banner Description (Arabic)</label>
                  <textarea
                    value={data.careersCta?.subtitleAr || ''}
                    onChange={e => handleChange("careersCta", "subtitleAr", e.target.value)}
                    rows={2}
                    placeholder="وفرنا لك أفضل الباقات الشاملة للأطفال والشركات مع غرف حفلات خاصة، صالات VIP، وتجارب استثنائية."
                    className="w-full bg-surface-hover border border-border-default rounded-xl p-3 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Button Text (English)</label>
                  <input
                    type="text"
                    value={data.careersCta?.buttonTextEn || ''}
                    onChange={e => handleChange("careersCta", "buttonTextEn", e.target.value)}
                    placeholder="EXPLORE PACKAGES & PRICING"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Button Text (Arabic)</label>
                  <input
                    type="text"
                    value={data.careersCta?.buttonTextAr || ''}
                    onChange={e => handleChange("careersCta", "buttonTextAr", e.target.value)}
                    placeholder="استكشف الباقات والحجوزات"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Target Route URL</label>
                  <input
                    type="text"
                    value={data.careersCta?.buttonUrl || '/b2c/packages'}
                    onChange={e => handleChange("careersCta", "buttonUrl", e.target.value)}
                    placeholder="/b2c/packages"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-xs font-mono text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Main Bottom Call To Action (CTA) Section */}
            <div className="bg-surface-default border border-border-default rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border-default pb-4">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                  <Layout className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Main Bottom Call To Action (CTA)</h2>
                  <p className="text-xs text-text-secondary">Customize headline and main navigation CTA button.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">CTA Title (English)</label>
                  <input
                    type="text"
                    value={data.cta?.titleEn || ''}
                    onChange={e => handleChange("cta", "titleEn", e.target.value)}
                    placeholder="READY TO EXPERIENCE E3 QATAR?"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">CTA Title (Arabic)</label>
                  <input
                    type="text"
                    value={data.cta?.titleAr || ''}
                    onChange={e => handleChange("cta", "titleAr", e.target.value)}
                    placeholder="هل أنت مستعد لخوض تجربة إي ثري؟"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Button Label (English)</label>
                  <input
                    type="text"
                    value={data.cta?.buttonTextEn || ''}
                    onChange={e => handleChange("cta", "buttonTextEn", e.target.value)}
                    placeholder="EXPLORE ALL ATTRACTIONS"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Button Label (Arabic)</label>
                  <input
                    type="text"
                    value={data.cta?.buttonTextAr || ''}
                    onChange={e => handleChange("cta", "buttonTextAr", e.target.value)}
                    placeholder="استكشف كافة الوجهات"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Button Target Route</label>
                  <input
                    type="text"
                    value={data.cta?.buttonUrl || '/b2c/attractions'}
                    onChange={e => handleChange("cta", "buttonUrl", e.target.value)}
                    placeholder="/b2c/attractions"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-xs font-mono text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Cinematic Footer Background Media */}
            <div className="bg-surface-default border border-border-default rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border-default pb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Cinematic Footer Media & Tagline</h2>
                  <p className="text-xs text-text-secondary">Configure background media (video, image, 3D model, iframe) and tagline at the very bottom of the page.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Footer Tagline (English)</label>
                  <input
                    type="text"
                    value={data.footer?.titleEn || ''}
                    onChange={e => handleChange("footer", "titleEn", e.target.value)}
                    placeholder="Live the Moment."
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Footer Tagline (Arabic)</label>
                  <input
                    type="text"
                    value={data.footer?.titleAr || ''}
                    onChange={e => handleChange("footer", "titleAr", e.target.value)}
                    placeholder="عش اللحظة."
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Footer Subtitle (English)</label>
                  <input
                    type="text"
                    value={data.footer?.subtitleEn || ''}
                    onChange={e => handleChange("footer", "subtitleEn", e.target.value)}
                    placeholder="Creating unforgettable memories in Qatar."
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Footer Subtitle (Arabic)</label>
                  <input
                    type="text"
                    value={data.footer?.subtitleAr || ''}
                    onChange={e => handleChange("footer", "subtitleAr", e.target.value)}
                    placeholder="نصنع ذكريات لا تُنسى في قطر"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                  />
                </div>
              </div>

              <AdminMediaPicker
                label="Footer Background Media (Video, Image, 3D Model, iframe)"
                value={data.footer?.mediaUrl || ''}
                onChange={(url) => {
                  const isVid = /\.(mp4|webm|mov|m4v|mkv)$/i.test(url) || url.includes('video') || url.includes('/api/media/');
                  const is3D = url.includes('.glb') || url.includes('.gltf') || url.includes('spline') || url.includes('3d');
                  const isIframe = url.includes('<iframe') || url.includes('http');
                  const type = isVid ? 'VIDEO' : is3D ? 'MODEL_3D' : isIframe ? 'IFRAME' : 'IMAGE';
                  handleChange("footer", "mediaUrl", url);
                  handleChange("footer", "mediaType", type);
                }}
                accept="video/*,image/*"
              />
            </div>
          </div>
        )}

        {/* TAB 4: FAQS */}
        {activeTab === "faqs" && (
          <div className="bg-surface-default border border-border-default rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Frequently Asked Questions</h2>
                  <p className="text-xs text-text-secondary">Add and edit question-and-answer pairs displayed on the page.</p>
                </div>
              </div>
              <AdminButton variant="secondary" onClick={addFaq} className="gap-2 text-xs">
                <Plus className="w-4 h-4" /> Add FAQ
              </AdminButton>
            </div>

            <div className="space-y-6">
              {data.faqs.map((faq: any, index: number) => (
                <div key={index} className="border border-border-default rounded-2xl p-5 relative space-y-4 bg-surface-hover/20">
                  <button
                    type="button"
                    onClick={() => removeFaq(index)}
                    className="absolute top-5 end-5 text-text-tertiary hover:text-rose-500 transition-colors p-1"
                    title="Remove FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Question #{index + 1} (English)</label>
                      <input
                        type="text"
                        value={faq.questionEn}
                        onChange={e => handleFaqChange(index, "questionEn", e.target.value)}
                        className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Question #{index + 1} (Arabic)</label>
                      <input
                        type="text"
                        value={faq.questionAr}
                        onChange={e => handleFaqChange(index, "questionAr", e.target.value)}
                        className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Answer (English)</label>
                      <textarea
                        value={faq.answerEn}
                        onChange={e => handleFaqChange(index, "answerEn", e.target.value)}
                        rows={2}
                        className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Answer (Arabic)</label>
                      <textarea
                        value={faq.answerAr}
                        onChange={e => handleFaqChange(index, "answerAr", e.target.value)}
                        rows={2}
                        className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-emerald-500 focus:outline-none dir-rtl"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </AdminFormLayout>

      {/* Floating Bottom Save Action Bar */}
      <div className="fixed bottom-6 end-8 z-40 bg-zinc-950/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 shadow-2xl flex items-center gap-4">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold px-2">
          <CheckCircle className="w-4 h-4" /> Ready to publish changes
        </div>
        <AdminButton variant="primary" onClick={handleSave} disabled={saving} className="px-6 py-2 shadow-md">
          {saving ? "Saving..." : "Save Configuration"}
        </AdminButton>
      </div>
    </div>
  );
}
