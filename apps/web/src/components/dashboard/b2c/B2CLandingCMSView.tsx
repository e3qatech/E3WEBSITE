"use client";

import { useState } from "react";
import { AdminFormLayout } from "../ui/AdminFormLayout";
import { AdminPageHeader } from "../ui/AdminPageHeader";
import { AdminMediaPicker } from "../ui/AdminMediaPicker";
import { AdminButton } from "../ui/AdminButton";
import { Plus, Trash2, Video, Eye, Sparkles, Layers, Shield } from "lucide-react";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import { MaskedMediaEngine } from "@/components/b2c/hero/MaskedMediaEngine";
import { MaskPresetType } from "@/components/b2c/hero/MaskPresets";
import { validateAndSanitizeSvg } from "@/lib/svgSanitizer";

export function B2CLandingCMSView({ initialData }: { initialData: any }) {
  const [data, setData] = useState({
    hero: {
      mediaType: initialData?.hero?.mediaType || "IMAGE",
      mediaUrl: initialData?.hero?.mediaUrl || "",
      headerEn: initialData?.hero?.headerEn || "",
      headerAr: initialData?.hero?.headerAr || "",
      subHeaderEn: initialData?.hero?.subHeaderEn || "",
      subHeaderAr: initialData?.hero?.subHeaderAr || "",
      showSearch: initialData?.hero?.showSearch ?? true
    },
    maskedVideo: {
      enabled: initialData?.maskedVideo?.enabled ?? true,
      defaultPortal: initialData?.maskedVideo?.defaultPortal || "customer",
      preset: initialData?.maskedVideo?.preset || "ORGANIC_WINDOW",
      rendererMode: initialData?.maskedVideo?.rendererMode || "STANDARD",
      scale: initialData?.maskedVideo?.scale || 1,
      positionX: initialData?.maskedVideo?.positionX || 0,
      positionY: initialData?.maskedVideo?.positionY || 0,
      edgeSoftness: initialData?.maskedVideo?.edgeSoftness || 12,
      distortionAmount: initialData?.maskedVideo?.distortionAmount || 0,
      idleBreathe: initialData?.maskedVideo?.idleBreathe ?? true,
      cursorResponse: initialData?.maskedVideo?.cursorResponse ?? true,
      customSvgMask: initialData?.maskedVideo?.customSvgMask || "",

      // Customer media
      customerDesktopVideo: initialData?.maskedVideo?.customerDesktopVideo || "https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4",
      customerMobileVideo: initialData?.maskedVideo?.customerMobileVideo || "",
      customerPoster: initialData?.maskedVideo?.customerPoster || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
      customerFallbackImage: initialData?.maskedVideo?.customerFallbackImage || "",
      customerMaskPreset: initialData?.maskedVideo?.customerMaskPreset || "ORGANIC_WINDOW",
      customerAccent: initialData?.maskedVideo?.customerAccent || "#10b981",
      customerAltEn: initialData?.maskedVideo?.customerAltEn || "E3 Pulse Customer Attractions Video",
      customerAltAr: initialData?.maskedVideo?.customerAltAr || "فيديو تجارب زوار إي ثري الترفيهية",

      // Organizer media
      organizerDesktopVideo: initialData?.maskedVideo?.organizerDesktopVideo || "https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4",
      organizerMobileVideo: initialData?.maskedVideo?.organizerMobileVideo || "",
      organizerPoster: initialData?.maskedVideo?.organizerPoster || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop",
      organizerFallbackImage: initialData?.maskedVideo?.organizerFallbackImage || "",
      organizerMaskPreset: initialData?.maskedVideo?.organizerMaskPreset || "PORTAL_ARCH",
      organizerAccent: initialData?.maskedVideo?.organizerAccent || "#3b82f6",
      organizerAltEn: initialData?.maskedVideo?.organizerAltEn || "E3 Atelier Event Engineering Video",
      organizerAltAr: initialData?.maskedVideo?.organizerAltAr || "فيديو هندسة وإنتاج الفعاليات",
    },
    featuredTitleEn: initialData?.featuredTitleEn || "",
    featuredTitleAr: initialData?.featuredTitleAr || "",
    gridTitleEn: initialData?.gridTitleEn || "",
    gridTitleAr: initialData?.gridTitleAr || "",
    subscribe: {
      titleEn: initialData?.subscribe?.titleEn || "",
      titleAr: initialData?.subscribe?.titleAr || "",
      subtitleEn: initialData?.subscribe?.subtitleEn || "",
      subtitleAr: initialData?.subscribe?.subtitleAr || "",
    },
    cta: {
      titleEn: initialData?.cta?.titleEn || "",
      titleAr: initialData?.cta?.titleAr || "",
      buttonTextEn: initialData?.cta?.buttonTextEn || "",
      buttonTextAr: initialData?.cta?.buttonTextAr || "",
      buttonUrl: initialData?.cta?.buttonUrl || ""
    },
    careersCta: {
      titleEn: initialData?.careersCta?.titleEn || "",
      titleAr: initialData?.careersCta?.titleAr || "",
      subtitleEn: initialData?.careersCta?.subtitleEn || "",
      subtitleAr: initialData?.careersCta?.subtitleAr || "",
      buttonTextEn: initialData?.careersCta?.buttonTextEn || "",
      buttonTextAr: initialData?.careersCta?.buttonTextAr || "",
      buttonUrl: initialData?.careersCta?.buttonUrl || ""
    },
    motion: {
      motionEnabled: initialData?.motion?.motionEnabled ?? true,
      motionPreset: initialData?.motion?.motionPreset || "MEDIA_CINEMATIC",
      motionIntensity: initialData?.motion?.motionIntensity || "MEDIUM",
      heroSceneType: initialData?.motion?.heroSceneType || "CINEMATIC_MEDIA",
      particleDensity: initialData?.motion?.particleDensity || 50,
      ctaEmphasisStyle: initialData?.motion?.ctaEmphasisStyle || "SHIMMER",
    },
    portalSwitcher: {
      customerLabelEn: initialData?.portalSwitcher?.customerLabelEn || "Customer",
      customerLabelAr: initialData?.portalSwitcher?.customerLabelAr || "الزائر",
      organizerLabelEn: initialData?.portalSwitcher?.organizerLabelEn || "Organizer",
      organizerLabelAr: initialData?.portalSwitcher?.organizerLabelAr || "المنظّم",
      customerUrl: initialData?.portalSwitcher?.customerUrl || "/b2c",
      organizerUrl: initialData?.portalSwitcher?.organizerUrl || "/b2b",
      organizerLoginLabelEn: initialData?.portalSwitcher?.organizerLoginLabelEn || "Organizer Login",
      organizerLoginLabelAr: initialData?.portalSwitcher?.organizerLoginLabelAr || "تسجيل دخول المنظم",
      organizerLoginUrl: initialData?.portalSwitcher?.organizerLoginUrl || "/login/business",
      switcherVisible: initialData?.portalSwitcher?.switcherVisible ?? true,
      organizerLoginVisible: initialData?.portalSwitcher?.organizerLoginVisible ?? true,
    },
    faqs: initialData?.faqs || [],
    footer: {
      mediaType: initialData?.footer?.mediaType || "IMAGE",
      mediaUrl: initialData?.footer?.mediaUrl || ""
    }
  });

  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/cms/pages/b2c-landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data })
      });
      if (!res.ok) throw new Error("Failed to save");
      toast("B2C Landing Page & Masked Video Experience updated successfully.", "success");
    } catch (e) {
      console.error(e);
      toast("Failed to save B2C Landing Page.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: keyof typeof data, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const handleSimpleChange = (field: keyof typeof data, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleFaqChange = (index: number, field: string, value: string) => {
    setData(prev => {
      const newFaqs = [...prev.faqs];
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      return { ...prev, faqs: newFaqs };
    });
  };

  const addFaq = () => {
    setData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { questionEn: "", questionAr: "", answerEn: "", answerAr: "" }]
    }));
  };

  const removeFaq = (index: number) => {
    setData(prev => {
      const newFaqs = [...prev.faqs];
      newFaqs.splice(index, 1);
      return { ...prev, faqs: newFaqs };
    });
  };

  const currentMaskedMedia = previewPortal === "customer"
    ? {
        videoUrl: data.maskedVideo.customerDesktopVideo,
        posterUrl: data.maskedVideo.customerPoster,
        preset: data.maskedVideo.customerMaskPreset as MaskPresetType,
        accent: data.maskedVideo.customerAccent,
        altEn: data.maskedVideo.customerAltEn,
        altAr: data.maskedVideo.customerAltAr,
      }
    : {
        videoUrl: data.maskedVideo.organizerDesktopVideo,
        posterUrl: data.maskedVideo.organizerPoster,
        preset: data.maskedVideo.organizerMaskPreset as MaskPresetType,
        accent: data.maskedVideo.organizerAccent,
        altEn: data.maskedVideo.organizerAltEn,
        altAr: data.maskedVideo.organizerAltAr,
      };

  return (
    <div className="flex flex-col gap-6 h-full p-6 max-w-6xl mx-auto">
      <AdminPageHeader
        title="B2C Landing Page & Masked Worlds CMS"
        description="Manage video masking presets, Customer/Organizer media, and hero configuration."
        action={
          <AdminButton variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Configuration"}
          </AdminButton>
        }
      />

      <AdminFormLayout>
        {/* MASKED VIDEO EXPERIENCE CMS SECTION */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">E3 Pulse Masked Worlds Experience</h2>
                <p className="text-xs text-text-secondary">Configure animated video mask windows, media loops, and portal mode footage.</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.maskedVideo.enabled}
                onChange={e => handleChange("maskedVideo", "enabled", e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
              />
              Enable Masked Video Hero
            </label>
          </div>

          {/* Controls Grid */}
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
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Default Mask Preset</label>
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
                <option value="TICKET_WINDOW">Ticket Window Notch</option>
                <option value="ATTRACTION_SILHOUETTE">Attraction Silhouette</option>
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

          {/* Customer Media Section */}
          <div className="border border-border-default rounded-xl p-4 bg-surface-hover/30 space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Customer B2C Media Footage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Customer Desktop Video URL</label>
                <input
                  type="text"
                  value={data.maskedVideo.customerDesktopVideo}
                  onChange={e => handleChange("maskedVideo", "customerDesktopVideo", e.target.value)}
                  placeholder="https://.../customer-hero.mp4"
                  className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Customer Poster Image</label>
                <AdminMediaPicker
                  value={data.maskedVideo.customerPoster}
                  onChange={val => handleChange("maskedVideo", "customerPoster", val)}
                />
              </div>
            </div>
          </div>

          {/* Organizer Media Section */}
          <div className="border border-border-default rounded-xl p-4 bg-surface-hover/30 space-y-4">
            <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Organizer B2B Media Footage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Organizer Desktop Video URL</label>
                <input
                  type="text"
                  value={data.maskedVideo.organizerDesktopVideo}
                  onChange={e => handleChange("maskedVideo", "organizerDesktopVideo", e.target.value)}
                  placeholder="https://.../organizer-hero.mp4"
                  className="w-full bg-surface-default border border-border-default rounded-xl px-3 py-2 text-xs font-mono text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Organizer Poster Image</label>
                <AdminMediaPicker
                  value={data.maskedVideo.organizerPoster}
                  onChange={val => handleChange("maskedVideo", "organizerPoster", val)}
                />
              </div>
            </div>
          </div>

          {/* Custom SVG Mask Input & Sanitization */}
          {data.maskedVideo.preset === "CUSTOM_SVG_MASK" && (
            <div className="border border-amber-500/30 rounded-xl p-4 bg-amber-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Custom SVG Mask String (Sanitized)
                </label>
              </div>
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

          {/* Live Draft Preview Card */}
          <div className="border border-emerald-500/30 rounded-2xl p-6 bg-slate-950 text-white space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold tracking-wide uppercase text-slate-200">Interactive Draft Preview</span>
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

            <div className="flex items-center justify-center p-6 bg-slate-900/60 rounded-xl min-h-[360px]">
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
                isRtl={previewLocale === "ar"}
              />
            </div>
          </div>
        </div>

        {/* Standard Hero Settings */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Standard Hero Content & Titles</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Background Media Type</label>
              <select
                value={data.hero.mediaType}
                onChange={e => handleChange('hero', 'mediaType', e.target.value)}
                className="w-1/3 bg-surface-hover border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="IMAGE">Image / Media ID</option>
                <option value="VIDEO">Video</option>
                <option value="IFRAME">External iFrame</option>
                <option value="MODEL_3D">3D Model (.glb / .gltf)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Media</label>
              {(data.hero.mediaType === 'IFRAME' || data.hero.mediaType === 'MODEL_3D') ? (
                <input
                  type="text"
                  value={data.hero.mediaUrl || ''}
                  onChange={e => handleChange("hero", "mediaUrl", e.target.value)}
                  placeholder="https://my.spline.design/..."
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              ) : (
                <AdminMediaPicker
                  value={data.hero.mediaUrl}
                  onChange={url => handleChange("hero", "mediaUrl", url)}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Header (English)</label>
                <input
                  type="text"
                  value={data.hero.headerEn}
                  onChange={e => handleChange("hero", "headerEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Header (Arabic)</label>
                <input
                  type="text"
                  value={data.hero.headerAr}
                  onChange={e => handleChange("hero", "headerAr", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none dir-rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Subheader (English)</label>
                <textarea
                  value={data.hero.subHeaderEn}
                  onChange={e => handleChange("hero", "subHeaderEn", e.target.value)}
                  rows={3}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Subheader (Arabic)</label>
                <textarea
                  value={data.hero.subHeaderAr}
                  onChange={e => handleChange("hero", "subHeaderAr", e.target.value)}
                  rows={3}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none dir-rtl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Titles */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-text-primary">Section Titles</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Featured Section Title (English)</label>
              <input
                type="text"
                value={data.featuredTitleEn}
                onChange={e => handleSimpleChange("featuredTitleEn", e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Featured Section Title (Arabic)</label>
              <input
                type="text"
                value={data.featuredTitleAr}
                onChange={e => handleSimpleChange("featuredTitleAr", e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none dir-rtl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Grid Section Title (English)</label>
              <input
                type="text"
                value={data.gridTitleEn}
                onChange={e => handleSimpleChange("gridTitleEn", e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Grid Section Title (Arabic)</label>
              <input
                type="text"
                value={data.gridTitleAr}
                onChange={e => handleSimpleChange("gridTitleAr", e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none dir-rtl"
              />
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-surface-default border border-border-default rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Frequently Asked Questions</h2>
            <AdminButton variant="secondary" onClick={addFaq} className="gap-2 text-xs">
              <Plus className="w-4 h-4" /> Add FAQ
            </AdminButton>
          </div>

          <div className="space-y-6">
            {data.faqs.map((faq: any, index: number) => (
              <div key={index} className="border border-border-default rounded-xl p-4 relative space-y-4 bg-surface-hover/20">
                <button
                  onClick={() => removeFaq(index)}
                  className="absolute top-4 end-4 text-text-tertiary hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Question (English)</label>
                    <input
                      type="text"
                      value={faq.questionEn}
                      onChange={e => handleFaqChange(index, "questionEn", e.target.value)}
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Question (Arabic)</label>
                    <input
                      type="text"
                      value={faq.questionAr}
                      onChange={e => handleFaqChange(index, "questionAr", e.target.value)}
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none dir-rtl"
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
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Answer (Arabic)</label>
                    <textarea
                      value={faq.answerAr}
                      onChange={e => handleFaqChange(index, "answerAr", e.target.value)}
                      rows={2}
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary focus:outline-none dir-rtl"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminFormLayout>
    </div>
  );
}
