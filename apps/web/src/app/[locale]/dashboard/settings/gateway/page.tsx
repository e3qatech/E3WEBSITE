/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import {
  GatewayCustomizationPayload,
  DEFAULT_GATEWAY_CMS_PAYLOAD,
  GatewayPreviewSimulationState,
  GatewayLogoConfig,
  MediaHolderConfig,
} from '@/types/gateway-cms';
import { PortalGateway } from '@/components/home/PortalGateway';
import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker';
import {
  Save,
  Globe,
  Smartphone,
  Eye,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Layers,
  History,
  Activity,
  Play,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardLoadingState,
  DashboardStickyActions,
  DashboardSectionNavigator,
  EditorSectionItem,
} from '@/components/dashboard/ui';

type TabKey =
  | 'english'
  | 'arabic'
  | 'logo'
  | 'b2c_media'
  | 'b2b_media'
  | 'visual'
  | 'seo'
  | 'preview'
  | 'versions';

import { useLocale } from '@/components/layout/LocaleProvider';

const SECTIONS: EditorSectionItem[] = [
  { id: 'english', label: '1. English Content', labelAr: '1. المحتوى الإنجليزي' },
  { id: 'arabic', label: '2. Arabic Content', labelAr: '2. المحتوى العربي' },
  { id: 'logo', label: '3. Logo & Branding', labelAr: '3. الشعار والهوية البصرية' },
  { id: 'b2c_media', label: '4. B2C Media Assets', labelAr: '4. وسائط بوابة الأفراد (B2C)' },
  { id: 'b2b_media', label: '5. B2B Media Assets', labelAr: '5. وسائط بوابة الأعمال (B2B)' },
  { id: 'visual', label: '6. Visual & Behaviour', labelAr: '6. المظهر والتفاعل البصري' },
  { id: 'seo', label: '7. SEO & Accessibility', labelAr: '7. محركات البحث وإمكانية الوصول' },
  { id: 'preview', label: '8. Live Preview Simulator', labelAr: '8. محاكي المعاينة المباشرة' },
  { id: 'versions', label: '9. Version History', labelAr: '9. سجل الإصدارات والاسترجاع' },
];

const DEFAULT_SIMULATION_STATE: GatewayPreviewSimulationState = {
  locale: 'en',
  theme: 'dark',
  viewport: 'desktop-1440',
  portalFocus: 'none',
  reducedMotion: false,
  useFallbackMedia: false,
};

export default function GatewayCustomizationPage() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const [activeTab, setActiveTab] = useState<TabKey>('english');
  const [formData, setFormData] = useState<GatewayCustomizationPayload>(DEFAULT_GATEWAY_CMS_PAYLOAD);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // TYPED PREVIEW SIMULATION STATE
  const [simState, setSimState] = useState<GatewayPreviewSimulationState>(DEFAULT_SIMULATION_STATE);

  const showToast = React.useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch('/api/settings/gateway?mode=draft');
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setFormData(json.data);
        }

        const verRes = await fetch('/api/settings/gateway?mode=versions');
        const verJson = await verRes.json();
        if (isMounted && verJson.success && verJson.versions) {
          setVersions(verJson.versions);
        }
      } catch (e) {
        console.error('Failed to load gateway settings:', e);
        if (isMounted) showToast('Failed to load settings', 'error');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

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

      if (!res.ok || json.error) {
        throw new Error(json.error || 'Failed to update settings');
      }

      showToast(
        action === 'publish' ? 'Gateway settings published successfully!' : 'Draft saved successfully!',
        'success'
      );

      setFormData((prev) => ({
        ...prev,
        status: action === 'publish' ? 'PUBLISHED' : 'DRAFT',
      }));

      const verRes = await fetch('/api/settings/gateway?mode=versions');
      const verJson = await verRes.json();
      if (verJson.success && verJson.versions) {
        setVersions(verJson.versions);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      showToast(error.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const handleRollback = async (versionNum: number) => {
    try {
      setPublishing(true);
      const res = await fetch('/api/settings/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rollback', targetVersion: versionNum }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Rollback failed');
      }

      if (json.data) {
        setFormData({
          ...DEFAULT_GATEWAY_CMS_PAYLOAD,
          ...json.data,
          english: { ...DEFAULT_GATEWAY_CMS_PAYLOAD.english, ...(json.data.english || {}) },
          arabic: { ...DEFAULT_GATEWAY_CMS_PAYLOAD.arabic, ...(json.data.arabic || {}) },
          logo: { ...DEFAULT_GATEWAY_CMS_PAYLOAD.logo, ...(json.data.logo || {}) },
          visual: { ...DEFAULT_GATEWAY_CMS_PAYLOAD.visual, ...(json.data.visual || {}) },
          seoAccess: { ...DEFAULT_GATEWAY_CMS_PAYLOAD.seoAccess, ...(json.data.seoAccess || {}) },
        });
      }
      showToast(`Successfully rolled back to version #${versionNum}`, 'success');

      const verRes = await fetch('/api/settings/gateway?mode=versions');
      const verJson = await verRes.json();
      if (verJson.success && verJson.versions) {
        setVersions(verJson.versions);
      }
    } catch (error: any) {
      showToast(error.message || 'Rollback failed', 'error');
    } finally {
      setPublishing(false);
    }
  };

  // Helper for updating nested state
  const updateEnglish = (key: keyof typeof formData.english, value: any) => {
    setFormData((prev) => ({
      ...prev,
      english: { ...prev.english, [key]: value },
    }));
  };

  const updateArabic = (key: keyof typeof formData.arabic, value: any) => {
    setFormData((prev) => ({
      ...prev,
      arabic: { ...prev.arabic, [key]: value },
    }));
  };

  const updateLogo = (key: keyof GatewayLogoConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      logo: { ...(prev.logo || DEFAULT_GATEWAY_CMS_PAYLOAD.logo), [key]: value },
    }));
  };

  const updateVisual = (key: keyof typeof formData.visual, value: any) => {
    setFormData((prev) => ({
      ...prev,
      visual: { ...prev.visual, [key]: value },
    }));
  };

  const updateSeo = (key: keyof typeof formData.seoAccess, value: any) => {
    setFormData((prev) => ({
      ...prev,
      seoAccess: { ...prev.seoAccess, [key]: value },
    }));
  };

  const updateMedia = (
    mediaKey: 'b2cDesktopMedia' | 'b2cMobileMedia' | 'b2bDesktopMedia' | 'b2bMobileMedia',
    field: keyof MediaHolderConfig,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [mediaKey]: { ...prev[mediaKey], [field]: value },
    }));
  };

  if (loading) {
    return <DashboardLoadingState title="Loading Gateway Customization CMS..." type="skeleton" />;
  }

  return (
    <DashboardPageShell variant="wide">
      {/* Toast Notification */}
      {toast && (
        <div
          className={cn(
            'fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-md text-sm font-semibold transition-all border',
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
              : 'bg-rose-950/90 text-rose-200 border-rose-500/50'
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Standard Page Header */}
      <DashboardPageHeader
        title={isAr ? "إدارة وتخصيص بوابة الدخول" : "Gateway Customization CMS"}
        description={
          isAr
            ? "تهيئة تجربة بوابة الدخول الثنائية 50/50 للأفراد والأعمال، والوسائط، والهوية البصرية، والتعريب."
            : "Configure the original E3 50/50 B2C & B2B gateway experience, media, branding, and localization."
        }
        breadcrumbs={[
          { label: isAr ? "الإعدادات" : "Settings", href: "/dashboard/settings/general" },
          { label: isAr ? "تخصيص بوابة الدخول" : "Gateway Customization" },
        ]}
        badge={{
          label: formData.status === "PUBLISHED" ? (isAr ? "منشور" : "PUBLISHED") : (isAr ? "مسودة" : "DRAFT"),
          variant: formData.status === "PUBLISHED" ? "success" : "warning",
        }}
        previewUrl="/"
        primaryAction={{
          label: publishing ? (isAr ? "جاري النشر..." : "Publishing...") : (isAr ? "نشر البوابة" : "Publish Gateway"),
          onClick: () => handleSave("publish"),
          isLoading: publishing,
          icon: <CheckCircle2 className="h-4 w-4" />,
        }}
        secondaryAction={
          <button
            onClick={() => handleSave("save_draft")}
            disabled={saving || publishing}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--surface-default)] px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] shadow-sm transition-all hover:text-[var(--text-primary)] border border-[var(--border-level-1)] disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? (isAr ? "جاري حفظ المسودة..." : "Saving Draft...") : (isAr ? "حفظ مسودة" : "Save Draft")}</span>
          </button>
        }
      />

      {/* Standard Section Navigator */}
      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeTab}
        onSelectSection={(id: string) => setActiveTab(id as TabKey)}
      />

      {/* TAB CONTENT PANELS */}
      <div className="mt-4">
        {/* 1. ENGLISH CONTENT TAB */}
        {activeTab === 'english' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-purple-300 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Main Gateway Introduction (English)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Gateway Eyebrow</label>
                  <input
                    type="text"
                    value={formData.english.eyebrowEn || ''}
                    onChange={(e) => updateEnglish('eyebrowEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="WELCOME TO E3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Main Headline</label>
                  <input
                    type="text"
                    value={formData.english.headlineEn || ''}
                    onChange={(e) => updateEnglish('headlineEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="TWO WORLDS. ONE E3."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Supporting Text</label>
                  <textarea
                    rows={2}
                    value={formData.english.supportingTextEn || ''}
                    onChange={(e) => updateEnglish('supportingTextEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Whether you’re looking for your next unforgettable experience or a trusted partner..."
                  />
                </div>
              </div>
            </div>

            {/* B2C Portal Content */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-sky-400 flex items-center gap-2">
                <Layers className="h-4 w-4" /> B2C Experiences Portal (English)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Eyebrow Label</label>
                  <input
                    type="text"
                    value={formData.english.b2cLabelEn || ''}
                    onChange={(e) => updateEnglish('b2cLabelEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="EXPERIENCES & ATTRACTIONS"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Main Title</label>
                  <input
                    type="text"
                    value={formData.english.b2cTitleEn || ''}
                    onChange={(e) => updateEnglish('b2cTitleEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="EXPERIENCE WHAT’S NEXT"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.english.b2cDescEn || ''}
                    onChange={(e) => updateEnglish('b2cDescEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Discover live events, family attractions and unforgettable entertainment..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">CTA Text</label>
                  <input
                    type="text"
                    value={formData.english.b2cCtaLabelEn || ''}
                    onChange={(e) => updateEnglish('b2cCtaLabelEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Explore Experiences"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Destination URL</label>
                  <input
                    type="text"
                    value={formData.english.b2cDestinationUrl || ''}
                    onChange={(e) => updateEnglish('b2cDestinationUrl', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="/b2c"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Statistic Badge (Optional)</label>
                  <input
                    type="text"
                    value={formData.english.b2cStatLabelEn || ''}
                    onChange={(e) => updateEnglish('b2cStatLabelEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="1.2M+ Annual Visitors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">CTA Accessibility Label</label>
                  <input
                    type="text"
                    value={formData.english.b2cAriaLabelEn || ''}
                    onChange={(e) => updateEnglish('b2cAriaLabelEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Navigate to E3 Experiences & Attractions"
                  />
                </div>
              </div>
            </div>

            {/* B2B Portal Content */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-indigo-400 flex items-center gap-2">
                <Layers className="h-4 w-4" /> B2B Enterprise Solutions Portal (English)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Eyebrow Label</label>
                  <input
                    type="text"
                    value={formData.english.b2bLabelEn || ''}
                    onChange={(e) => updateEnglish('b2bLabelEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="FOR BRANDS & ORGANIZATIONS"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Main Title</label>
                  <input
                    type="text"
                    value={formData.english.b2bTitleEn || ''}
                    onChange={(e) => updateEnglish('b2bTitleEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="BUILD WHAT’S NEXT"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.english.b2bDescEn || ''}
                    onChange={(e) => updateEnglish('b2bDescEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Partner with E3 to design, produce and operate remarkable events..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">CTA Text</label>
                  <input
                    type="text"
                    value={formData.english.b2bCtaLabelEn || ''}
                    onChange={(e) => updateEnglish('b2bCtaLabelEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Work With E3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Destination URL</label>
                  <input
                    type="text"
                    value={formData.english.b2bDestinationUrl || ''}
                    onChange={(e) => updateEnglish('b2bDestinationUrl', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="/b2b"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Statistic Badge (Optional)</label>
                  <input
                    type="text"
                    value={formData.english.b2bStatLabelEn || ''}
                    onChange={(e) => updateEnglish('b2bStatLabelEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="450+ Corporate Activations"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">CTA Accessibility Label</label>
                  <input
                    type="text"
                    value={formData.english.b2bAriaLabelEn || ''}
                    onChange={(e) => updateEnglish('b2bAriaLabelEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Navigate to E3 Enterprise Solutions"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ARABIC CONTENT TAB */}
        {activeTab === 'arabic' && (
          <div className="space-y-6" dir="rtl">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-purple-300 flex items-center gap-2">
                <Globe className="h-4 w-4" /> مقدمة البوابة الرئيسية (العربية)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">العنوان التمهيدي</label>
                  <input
                    type="text"
                    value={formData.arabic.eyebrowAr || ''}
                    onChange={(e) => updateArabic('eyebrowAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="مرحباً بكم في E3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">العنوان الرئيسي</label>
                  <input
                    type="text"
                    value={formData.arabic.headlineAr || ''}
                    onChange={(e) => updateArabic('headlineAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="عالمان. وجهة واحدة: E3"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">النص الداعم</label>
                  <textarea
                    rows={2}
                    value={formData.arabic.supportingTextAr || ''}
                    onChange={(e) => updateArabic('supportingTextAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="سواء كنت تبحث عن تجربتك القادمة أو عن شريك موثوق لصناعتها..."
                  />
                </div>
              </div>
            </div>

            {/* B2C Portal Arabic Content */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-sky-400 flex items-center gap-2">
                <Layers className="h-4 w-4" /> بوابة تجارب الأفراد والجمهور (العربية)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">التصنيف</label>
                  <input
                    type="text"
                    value={formData.arabic.b2cLabelAr || ''}
                    onChange={(e) => updateArabic('b2cLabelAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="التجارب والوجهات"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">العنوان</label>
                  <input
                    type="text"
                    value={formData.arabic.b2cTitleAr || ''}
                    onChange={(e) => updateArabic('b2cTitleAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="عِش التجربة القادمة"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">الوصف</label>
                  <textarea
                    rows={2}
                    value={formData.arabic.b2cDescAr || ''}
                    onChange={(e) => updateArabic('b2cDescAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="اكتشف الفعاليات الحية والوجهات العائلية وتجارب الترفيه الاستثنائية..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نص الزر</label>
                  <input
                    type="text"
                    value={formData.arabic.b2cCtaLabelAr || ''}
                    onChange={(e) => updateArabic('b2cCtaLabelAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="استكشف التجارب"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رابط الوجهة</label>
                  <input
                    type="text"
                    value={formData.arabic.b2cDestinationUrl || ''}
                    onChange={(e) => updateArabic('b2cDestinationUrl', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="/ar/b2c"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">شارة الإحصائيات (اختياري)</label>
                  <input
                    type="text"
                    value={formData.arabic.b2cStatLabelAr || ''}
                    onChange={(e) => updateArabic('b2cStatLabelAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="+١.٢ مليون زائر سنوياً"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نص إمكانية الوصول للزر</label>
                  <input
                    type="text"
                    value={formData.arabic.b2cAriaLabelAr || ''}
                    onChange={(e) => updateArabic('b2cAriaLabelAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="الانتقال إلى تجارب ووجهات إي ثري"
                  />
                </div>
              </div>
            </div>

            {/* B2B Portal Arabic Content */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-indigo-400 flex items-center gap-2">
                <Layers className="h-4 w-4" /> بوابة حلول الشركات والمؤسسات (العربية)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">التصنيف</label>
                  <input
                    type="text"
                    value={formData.arabic.b2bLabelAr || ''}
                    onChange={(e) => updateArabic('b2bLabelAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="للعلامات التجارية والمؤسسات"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">العنوان</label>
                  <input
                    type="text"
                    value={formData.arabic.b2bTitleAr || ''}
                    onChange={(e) => updateArabic('b2bTitleAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="لنصنع القادم"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">الوصف</label>
                  <textarea
                    rows={2}
                    value={formData.arabic.b2bDescAr || ''}
                    onChange={(e) => updateArabic('b2bDescAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="تعاون مع E3 لتصميم وإنتاج وتشغيل فعاليات ووجهات وتجارب غامرة..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نص الزر</label>
                  <input
                    type="text"
                    value={formData.arabic.b2bCtaLabelAr || ''}
                    onChange={(e) => updateArabic('b2bCtaLabelAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="تعاون مع E3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رابط الوجهة</label>
                  <input
                    type="text"
                    value={formData.arabic.b2bDestinationUrl || ''}
                    onChange={(e) => updateArabic('b2bDestinationUrl', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="/ar/b2b"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">شارة الإحصائيات (اختياري)</label>
                  <input
                    type="text"
                    value={formData.arabic.b2bStatLabelAr || ''}
                    onChange={(e) => updateArabic('b2bStatLabelAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="+٤٥٠ مشروع مؤسسي"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نص إمكانية الوصول للزر</label>
                  <input
                    type="text"
                    value={formData.arabic.b2bAriaLabelAr || ''}
                    onChange={(e) => updateArabic('b2bAriaLabelAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="الانتقال إلى حلول إي ثري للشركات"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. LOGO & BRANDING TAB */}
        {activeTab === 'logo' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-purple-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Official E3 Logo & Branding Assets
              </h2>
              <p className="text-xs text-slate-400">
                Configure official E3 logos for light/dark themes and mobile devices. If no custom image is uploaded, the official vector E3 logo is automatically used as the verified fallback.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Default Logo Asset (File / Library / URL)</label>
                  <AdminMediaPicker
                    value={formData.logo?.defaultLogoUrl || ''}
                    onChange={(url) => updateLogo('defaultLogoUrl', url)}
                    label="Default Logo Asset"
                    accept="image/*"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Light Theme Logo Asset</label>
                  <AdminMediaPicker
                    value={formData.logo?.lightLogoUrl || ''}
                    onChange={(url) => updateLogo('lightLogoUrl', url)}
                    label="Light Theme Logo"
                    accept="image/*"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Dark Theme Logo Asset</label>
                  <AdminMediaPicker
                    value={formData.logo?.darkLogoUrl || ''}
                    onChange={(url) => updateLogo('darkLogoUrl', url)}
                    label="Dark Theme Logo"
                    accept="image/*"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Devices Logo Asset</label>
                  <AdminMediaPicker
                    value={formData.logo?.mobileLogoUrl || ''}
                    onChange={(url) => updateLogo('mobileLogoUrl', url)}
                    label="Mobile Logo"
                    accept="image/*"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Logo Destination Link</label>
                  <input
                    type="text"
                    value={formData.logo?.destinationUrl || '/'}
                    onChange={(e) => updateLogo('destinationUrl', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="/"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">English Alternative Text</label>
                  <input
                    type="text"
                    value={formData.logo?.altEn || ''}
                    onChange={(e) => updateLogo('altEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Official E3 Qatar Logo"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. B2C MEDIA TAB */}
        {activeTab === 'b2c_media' && (
          <div className="space-y-6">
            {/* Desktop Media */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-sky-400 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> B2C Desktop Media Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Media Type</label>
                  <select
                    value={formData.b2cDesktopMedia.mediaType}
                    onChange={(e) => updateMedia('b2cDesktopMedia', 'mediaType', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="IFRAME">Approved Iframe</option>
                    <option value="MODEL_3D">3D Model</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Desktop Media Asset (File / Library / URL)</label>
                  <AdminMediaPicker
                    value={formData.b2cDesktopMedia.mediaUrl}
                    onChange={(url) => updateMedia('b2cDesktopMedia', 'mediaUrl', url)}
                    label="B2C Desktop Media"
                    accept="image/*,video/*"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mandatory Fallback Image Asset</label>
                  <AdminMediaPicker
                    value={formData.b2cDesktopMedia.fallbackImageUrl}
                    onChange={(url) => updateMedia('b2cDesktopMedia', 'fallbackImageUrl', url)}
                    label="B2C Desktop Fallback Image"
                    accept="image/*"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Poster Image Asset (Video)</label>
                  <AdminMediaPicker
                    value={formData.b2cDesktopMedia.posterImageUrl || ''}
                    onChange={(url) => updateMedia('b2cDesktopMedia', 'posterImageUrl', url)}
                    label="B2C Poster Image"
                    accept="image/*"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Focal Point X (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.b2cDesktopMedia.focalPointX}
                    onChange={(e) => updateMedia('b2cDesktopMedia', 'focalPointX', Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Focal Point Y (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.b2cDesktopMedia.focalPointY}
                    onChange={(e) => updateMedia('b2cDesktopMedia', 'focalPointY', Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Media */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-sky-400 flex items-center gap-2">
                <Smartphone className="h-4 w-4" /> B2C Mobile Media Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Media Type</label>
                  <select
                    value={formData.b2cMobileMedia.mediaType}
                    onChange={(e) => updateMedia('b2cMobileMedia', 'mediaType', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="IFRAME">Approved Iframe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Media Asset</label>
                  <AdminMediaPicker
                    value={formData.b2cMobileMedia.mediaUrl}
                    onChange={(url) => updateMedia('b2cMobileMedia', 'mediaUrl', url)}
                    label="B2C Mobile Media"
                    accept="image/*,video/*"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Fallback Image Asset</label>
                  <AdminMediaPicker
                    value={formData.b2cMobileMedia.fallbackImageUrl}
                    onChange={(url) => updateMedia('b2cMobileMedia', 'fallbackImageUrl', url)}
                    label="B2C Mobile Fallback Image"
                    accept="image/*"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. B2B MEDIA TAB */}
        {activeTab === 'b2b_media' && (
          <div className="space-y-6">
            {/* Desktop Media */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-indigo-400 flex items-center gap-2">
                <Layers className="h-4 w-4" /> B2B Desktop Media Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Media Type</label>
                  <select
                    value={formData.b2bDesktopMedia.mediaType}
                    onChange={(e) => updateMedia('b2bDesktopMedia', 'mediaType', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="IFRAME">Approved Iframe</option>
                    <option value="MODEL_3D">3D Model</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Desktop Media Asset</label>
                  <AdminMediaPicker
                    value={formData.b2bDesktopMedia.mediaUrl}
                    onChange={(url) => updateMedia('b2bDesktopMedia', 'mediaUrl', url)}
                    label="B2B Desktop Media"
                    accept="image/*,video/*"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mandatory Fallback Image Asset</label>
                  <AdminMediaPicker
                    value={formData.b2bDesktopMedia.fallbackImageUrl}
                    onChange={(url) => updateMedia('b2bDesktopMedia', 'fallbackImageUrl', url)}
                    label="B2B Fallback Image"
                    accept="image/*"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Poster Image Asset (Video)</label>
                  <AdminMediaPicker
                    value={formData.b2bDesktopMedia.posterImageUrl || ''}
                    onChange={(url) => updateMedia('b2bDesktopMedia', 'posterImageUrl', url)}
                    label="B2B Poster Image"
                    accept="image/*"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Focal Point X (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.b2bDesktopMedia.focalPointX}
                    onChange={(e) => updateMedia('b2bDesktopMedia', 'focalPointX', Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Focal Point Y (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.b2bDesktopMedia.focalPointY}
                    onChange={(e) => updateMedia('b2bDesktopMedia', 'focalPointY', Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Media */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-indigo-400 flex items-center gap-2">
                <Smartphone className="h-4 w-4" /> B2B Mobile Media Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Media Type</label>
                  <select
                    value={formData.b2bMobileMedia.mediaType}
                    onChange={(e) => updateMedia('b2bMobileMedia', 'mediaType', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="IFRAME">Approved Iframe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Media Asset</label>
                  <AdminMediaPicker
                    value={formData.b2bMobileMedia.mediaUrl}
                    onChange={(url) => updateMedia('b2bMobileMedia', 'mediaUrl', url)}
                    label="B2B Mobile Media"
                    accept="image/*,video/*"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Fallback Image Asset</label>
                  <AdminMediaPicker
                    value={formData.b2bMobileMedia.fallbackImageUrl}
                    onChange={(url) => updateMedia('b2bMobileMedia', 'fallbackImageUrl', url)}
                    label="B2B Mobile Fallback Image"
                    accept="image/*"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. VISUAL & BEHAVIOUR TAB */}
        {activeTab === 'visual' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-purple-300 flex items-center gap-2">
                <Sliders className="h-4 w-4" /> Gateway Visual & Interaction Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Initial Split Ratio (%)</label>
                  <input
                    type="number"
                    min={30}
                    max={70}
                    value={formData.visual.initialSplitRatio || 50}
                    onChange={(e) => updateVisual('initialSplitRatio', Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Selected Portal Width (%)</label>
                  <input
                    type="number"
                    min={50}
                    max={80}
                    value={formData.visual.selectedPortalWidth || 63}
                    onChange={(e) => updateVisual('selectedPortalWidth', Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Default Theme Mode</label>
                  <select
                    value={formData.visual.themeMode}
                    onChange={(e) => updateVisual('themeMode', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="dark">Dark Theme</option>
                    <option value="light">Light Theme</option>
                    <option value="auto">Auto / System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Portal Order</label>
                  <select
                    value={formData.visual.mobilePortalOrder || 'b2c_first'}
                    onChange={(e) => updateVisual('mobilePortalOrder', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="b2c_first">B2C First, then B2B</option>
                    <option value="b2b_first">B2B First, then B2C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Media Overlay Strength (0 to 1)</label>
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    max={1}
                    value={formData.visual.overlayStrength ?? 0.6}
                    onChange={(e) => updateVisual('overlayStrength', Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Background Style</label>
                  <select
                    value={formData.visual.backgroundStyle}
                    onChange={(e) => updateVisual('backgroundStyle', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="wireframe">3D Wireframe Grid</option>
                    <option value="glass">Glassmorphic Blur</option>
                    <option value="gradient">Deep Ambient Gradient</option>
                    <option value="custom_media">Custom Media</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.visual.languageSwitcherVisible !== false}
                    onChange={(e) => updateVisual('languageSwitcherVisible', e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Show Language Switcher</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.visual.themeSwitcherVisible !== false}
                    onChange={(e) => updateVisual('themeSwitcherVisible', e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Show Theme Switcher</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.visual.statisticsVisible !== false}
                    onChange={(e) => updateVisual('statisticsVisible', e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Show Statistic Badges</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.visual.reducedMotionDefault || false}
                    onChange={(e) => updateVisual('reducedMotionDefault', e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Default Reduced Motion</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 7. SEO & ACCESSIBILITY TAB */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-purple-300 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> SEO Metadata & Accessibility Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">SEO Title (English)</label>
                  <input
                    type="text"
                    value={formData.seoAccess.seoTitleEn || ''}
                    onChange={(e) => updateSeo('seoTitleEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="E3 Qatar | Experiences, Attractions & Event Solutions"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">SEO Title (Arabic)</label>
                  <input
                    type="text"
                    value={formData.seoAccess.seoTitleAr || ''}
                    onChange={(e) => updateSeo('seoTitleAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="إي ثري قطر | التجارب والوجهات وحلول الفعاليات"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Meta Description (English)</label>
                  <textarea
                    rows={2}
                    value={formData.seoAccess.seoDescEn || ''}
                    onChange={(e) => updateSeo('seoDescEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Meta Description (Arabic)</label>
                  <textarea
                    rows={2}
                    value={formData.seoAccess.seoDescAr || ''}
                    onChange={(e) => updateSeo('seoDescAr', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">OpenGraph Social Image Asset</label>
                  <AdminMediaPicker
                    value={formData.seoAccess.ogImage || ''}
                    onChange={(url) => updateSeo('ogImage', url)}
                    label="OpenGraph Social Image"
                    accept="image/*"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Gateway ARIA Region Label (English)</label>
                  <input
                    type="text"
                    value={formData.seoAccess.ariaGatewayLabelEn || ''}
                    onChange={(e) => updateSeo('ariaGatewayLabelEn', e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. LIVE PREVIEW TAB */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            {/* Simulation Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
              <div className="flex flex-wrap items-center gap-3">
                {/* Viewport controls */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setSimState((s) => ({ ...s, viewport: 'desktop-1440' }))}
                    className={cn(
                      'px-2.5 py-1 text-xs font-bold rounded-lg transition-all',
                      simState.viewport === 'desktop-1440'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Desktop (1440)
                  </button>
                  <button
                    onClick={() => setSimState((s) => ({ ...s, viewport: 'laptop-1280' }))}
                    className={cn(
                      'px-2.5 py-1 text-xs font-bold rounded-lg transition-all',
                      simState.viewport === 'laptop-1280'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Laptop (1280)
                  </button>
                  <button
                    onClick={() => setSimState((s) => ({ ...s, viewport: 'tablet-768' }))}
                    className={cn(
                      'px-2.5 py-1 text-xs font-bold rounded-lg transition-all',
                      simState.viewport === 'tablet-768'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Tablet (768)
                  </button>
                  <button
                    onClick={() => setSimState((s) => ({ ...s, viewport: 'mobile-390' }))}
                    className={cn(
                      'px-2.5 py-1 text-xs font-bold rounded-lg transition-all',
                      simState.viewport === 'mobile-390'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Mobile (390)
                  </button>
                </div>

                {/* Locale simulator */}
                <button
                  onClick={() =>
                    setSimState((s) => ({ ...s, locale: s.locale === 'en' ? 'ar' : 'en' }))
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700"
                >
                  <Globe className="h-3.5 w-3.5 text-purple-400" />
                  <span>{simState.locale === 'en' ? 'Simulate Arabic (RTL)' : 'Simulate English (LTR)'}</span>
                </button>

                {/* Theme simulator */}
                <button
                  onClick={() =>
                    setSimState((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700"
                >
                  <span>{simState.theme === 'dark' ? 'Simulate Light Theme' : 'Simulate Dark Theme'}</span>
                </button>

                {/* Portal focus simulator */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <span className="px-2 text-slate-400 font-bold">Focus:</span>
                  <button
                    onClick={() => setSimState((s) => ({ ...s, portalFocus: 'none' }))}
                    className={cn(
                      'px-2 py-1 font-bold rounded-md',
                      simState.portalFocus === 'none' ? 'bg-purple-600 text-white' : 'text-slate-400'
                    )}
                  >
                    Default (50/50)
                  </button>
                  <button
                    onClick={() => setSimState((s) => ({ ...s, portalFocus: 'b2c' }))}
                    className={cn(
                      'px-2 py-1 font-bold rounded-md',
                      simState.portalFocus === 'b2c' ? 'bg-purple-600 text-white' : 'text-slate-400'
                    )}
                  >
                    B2C (63%)
                  </button>
                  <button
                    onClick={() => setSimState((s) => ({ ...s, portalFocus: 'b2b' }))}
                    className={cn(
                      'px-2 py-1 font-bold rounded-md',
                      simState.portalFocus === 'b2b' ? 'bg-purple-600 text-white' : 'text-slate-400'
                    )}
                  >
                    B2B (63%)
                  </button>
                </div>
              </div>

              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Live Preview Mode Active
              </div>
            </div>

            {/* LIVE PREVIEW CANVAS */}
            <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-4 overflow-hidden shadow-2xl min-h-[650px] flex items-center justify-center">
              <div
                className={cn(
                  'relative transition-all duration-500 overflow-hidden rounded-2xl border border-slate-800 shadow-2xl bg-black h-[720px]',
                  simState.viewport === 'mobile-390' && 'w-[390px]',
                  simState.viewport === 'tablet-768' && 'w-[768px]',
                  simState.viewport === 'laptop-1280' && 'w-[1280px] max-w-full',
                  simState.viewport === 'desktop-1440' && 'w-full'
                )}
              >
                <PortalGateway previewMode={true} previewConfig={formData} simulation={simState} />
              </div>
            </div>
          </div>
        )}

        {/* VERSIONS & ROLLBACK TAB */}
        {activeTab === 'versions' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h2 className="text-base font-extrabold text-purple-300 flex items-center gap-2">
                <History className="h-4 w-4" /> Version History & Monotonic Rollback
              </h2>
              <p className="text-xs text-slate-400">
                View previous published versions of the gateway configuration and restore snapshot states.
              </p>

              <div className="space-y-3 pt-2">
                {versions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No published version snapshots recorded yet.</p>
                ) : (
                  versions.map((ver) => (
                    <div
                      key={ver.version}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/80"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-purple-300">Version #{ver.version}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(ver.publishedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{ver.releaseNotes}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">By: {ver.publishedBy}</p>
                      </div>

                      <button
                        onClick={() => handleRollback(ver.version)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-purple-300 hover:bg-purple-900/30 hover:border-purple-500 transition-all self-start sm:self-center"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Rollback to #{ver.version}</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardPageShell>
  );
}
