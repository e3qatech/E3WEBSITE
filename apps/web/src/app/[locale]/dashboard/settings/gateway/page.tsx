"use client";

import React, { useState, useEffect } from 'react';
import {
  GatewayCustomizationPayload,
  DEFAULT_GATEWAY_CMS_PAYLOAD,
  GatewayContentEn,
  GatewayContentAr,
  PreviewSimulationState,
  GatewayGlobalMode,
  GatewayCampaignItem,
} from '@/types/gateway-cms';
import { PortalGateway } from '@/components/home/PortalGateway';
import {
  Save,
  Globe,
  Smartphone,
  Sliders,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Box,
  Sun,
  Megaphone,
  History,
  Play,
  RotateCcw,
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Video,
  FileCode,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type WorkAreaKey =
  | 'content_branding'
  | 'live_weather'
  | 'custom_campaigns'
  | 'preview'
  | 'mobile_accessibility'
  | 'publish_versions';

const WORK_AREAS: { key: WorkAreaKey; label: string; icon: any }[] = [
  { key: 'content_branding', label: '1. Content & Branding', icon: FileText },
  { key: 'live_weather', label: '2. Live Weather', icon: Sun },
  { key: 'custom_campaigns', label: '3. Custom Campaigns', icon: Megaphone },
  { key: 'preview', label: '4. Preview', icon: Play },
  { key: 'mobile_accessibility', label: '5. Mobile & Accessibility', icon: Smartphone },
  { key: 'publish_versions', label: '6. Publish & Versions', icon: History },
];

const DEFAULT_SIMULATION_STATE: PreviewSimulationState = {
  temperature: 34,
  apparentTemperature: 38,
  precipitation: 0,
  rain: 0,
  windSpeed: 18,
  windGusts: 24,
  windDirection: 45,
  visibility: 10,
  pm10: 45,
  pm25: 20,
  cloudCover: 10,
  isDay: true,
  weatherCode: 0,
  heavyRainOverride: false,
  selectedCampaignId: 'c-1',
  selectedAnnouncementId: 'a-1',
  locale: 'en',
  theme: 'dark',
  viewport: 'desktop-1440',
  capabilityTier: 'cinematic',
  reducedMotion: false,
  webglAvailable: true,
  weatherApiAvailable: true,
  emergencyDisable: false,
};

export default function GatewayCustomizationPage() {
  const [activeArea, setActiveArea] = useState<WorkAreaKey>('content_branding');
  const [formData, setFormData] = useState<GatewayCustomizationPayload>(DEFAULT_GATEWAY_CMS_PAYLOAD);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [fetchingLiveWeather, setFetchingLiveWeather] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Language & Theme Toggle State for Work Area 1
  const [contentLang, setContentLang] = useState<'en' | 'ar'>('en');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  // Collapsed Sections Accordion State
  const [showAdvancedRules, setShowAdvancedRules] = useState(false);
  const [showAdvancedSimulation, setShowAdvancedSimulation] = useState(false);
  const [showAdvancedPerformance, setShowAdvancedPerformance] = useState(false);

  // Selected Campaign Editor Index
  const [selectedCampaignIdx, setSelectedCampaignIdx] = useState<number>(0);

  // Typed Preview Simulation State
  const [simState, setSimState] = useState<PreviewSimulationState>(DEFAULT_SIMULATION_STATE);

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
      if (!res.ok || json.error) throw new Error(json.error || 'Rollback failed');

      if (json.data) setFormData(json.data);
      showToast(`Rolled back to version #${versionNum}!`, 'success');

      const verRes = await fetch('/api/settings/gateway?mode=versions');
      const verJson = await verRes.json();
      if (verJson.success && verJson.versions) setVersions(verJson.versions);
    } catch (err: any) {
      showToast(err.message || 'Rollback error', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleFetchCurrentLiveWeather = async () => {
    try {
      setFetchingLiveWeather(true);
      const res = await fetch('/api/weather');
      const json = await res.json();
      if (json && json.temperature !== undefined) {
        setSimState((prev) => ({
          ...prev,
          temperature: json.temperature || 32,
          apparentTemperature: (json.temperature || 32) + 4,
          rain: json.precipitation || 0,
          isDay: json.isDay ?? true,
          weatherApiAvailable: true,
        }));
        showToast('Fetched real live Doha weather data!', 'success');
      }
    } catch (_e) {
      showToast('Failed to fetch live weather, falling back to simulated values.', 'error');
    } finally {
      setFetchingLiveWeather(false);
    }
  };

  const updateEnglishState = (field: keyof GatewayContentEn, value: any) => {
    setFormData((prev) => ({
      ...prev,
      english: { ...prev.english, [field]: value },
    }));
  };

  const updateArabicState = (field: keyof GatewayContentAr, value: any) => {
    setFormData((prev) => ({
      ...prev,
      arabic: { ...prev.arabic, [field]: value },
    }));
  };

  const updateExperienceConfig = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      experienceConfig: {
        ...DEFAULT_GATEWAY_CMS_PAYLOAD.experienceConfig,
        ...(prev.experienceConfig || {}),
        [field]: value,
      } as any,
    }));
  };

  const updateFocusProtection = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      focusProtection: {
        ...DEFAULT_GATEWAY_CMS_PAYLOAD.focusProtection!,
        ...(prev.focusProtection || {}),
        [field]: value,
      } as any,
    }));
  };

  const updateGlobalMode = (mode: GatewayGlobalMode) => {
    setFormData((prev) => ({ ...prev, globalMode: mode }));
  };

  const updateSimState = (field: keyof PreviewSimulationState, value: any) => {
    setSimState((prev) => ({ ...prev, [field]: value }));
  };

  // Quick preset loader function for simulator scenarios
  const applyPreset = (name: string) => {
    switch (name) {
      case 'clear-day':
        setSimState((prev) => ({ ...prev, temperature: 28, apparentTemperature: 30, rain: 0, pm10: 20, isDay: true, heavyRainOverride: false, webglAvailable: true }));
        break;
      case 'extreme-heat':
        setSimState((prev) => ({ ...prev, temperature: 45, apparentTemperature: 49, rain: 0, pm10: 40, isDay: true, heavyRainOverride: false }));
        break;
      case 'rain':
        setSimState((prev) => ({ ...prev, temperature: 22, apparentTemperature: 22, rain: 2.5, pm10: 15, isDay: true, heavyRainOverride: false }));
        break;
      case 'heavy-rain':
        setSimState((prev) => ({ ...prev, temperature: 20, apparentTemperature: 20, rain: 8.0, pm10: 10, isDay: false, heavyRainOverride: true }));
        break;
      case 'wind':
        setSimState((prev) => ({ ...prev, windSpeed: 40, windGusts: 55 }));
        break;
      case 'dust-storm':
        setSimState((prev) => ({ ...prev, temperature: 32, apparentTemperature: 34, rain: 0, pm10: 120, windSpeed: 30, isDay: true }));
        break;
      case 'sandstorm':
        setSimState((prev) => ({ ...prev, temperature: 36, apparentTemperature: 38, rain: 0, pm10: 210, windGusts: 52, windSpeed: 38, isDay: true }));
        break;
      case 'fog':
        setSimState((prev) => ({ ...prev, visibility: 0.8, temperature: 18, rain: 0 }));
        break;
      case 'snow':
        setSimState((prev) => ({ ...prev, temperature: -2, apparentTemperature: -5, rain: 0, isDay: true }));
        break;
      case 'night':
        setSimState((prev) => ({ ...prev, isDay: false, temperature: 24, apparentTemperature: 25 }));
        break;
      case 'campaign':
        setSimState((prev) => ({ ...prev, selectedCampaignId: 'c-1' }));
        break;
      case 'campaign-weather':
        setSimState((prev) => ({ ...prev, selectedCampaignId: 'c-1', rain: 6.0 }));
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="font-mono text-sm tracking-wider uppercase">Loading E3 Experience Composer...</span>
        </div>
      </div>
    );
  }

  const currentMode = formData.globalMode || 'LIVE_DOHA';
  const activeCampaignItem = formData.campaigns?.[selectedCampaignIdx] || formData.campaigns?.[0];

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      {/* Toast Notification */}
      {toast && (
        <div
          className={cn(
            'fixed top-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-xl backdrop-blur-md transition-all',
            toast.type === 'success'
              ? 'border border-emerald-500/30 bg-emerald-950/80 text-emerald-200'
              : 'border border-rose-500/30 bg-rose-950/80 text-rose-200'
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <ShieldAlert className="h-5 w-5 text-rose-400" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
            <Sparkles className="h-4 w-4" /> E3 Living Threshold Engine
          </div>
          <h1 className="text-2xl font-bold text-white">Gateway Experience Composer</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave('save_draft')}
            disabled={saving || publishing}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-50"
          >
            <Save className="h-4 w-4 text-emerald-400" />
            {saving ? 'Saving Draft...' : 'Save Draft'}
          </button>

          <button
            onClick={() => handleSave('publish')}
            disabled={saving || publishing}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 disabled:opacity-50"
          >
            <Globe className="h-4 w-4" />
            {publishing ? 'Publishing...' : 'Publish Gateway'}
          </button>
        </div>
      </div>

      {/* GLOBAL GATEWAY MODE SEGMENTED SELECTOR */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/90 p-3 backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Global Gateway Mode:</span>
          <span className="text-xs font-mono text-emerald-400">Selected: {currentMode}</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { mode: 'LIVE_DOHA' as GatewayGlobalMode, label: 'LIVE DOHA WEATHER', desc: 'Auto-resolves live weather & time of day', icon: Sun },
            { mode: 'MANUAL_OVERRIDE' as GatewayGlobalMode, label: 'MANUAL OVERRIDE', desc: 'Temporary scene override with expiry', icon: Sliders },
            { mode: 'CUSTOM_CAMPAIGN' as GatewayGlobalMode, label: 'CUSTOM CAMPAIGN', desc: 'Active world takeover activation', icon: Megaphone },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = currentMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => updateGlobalMode(item.mode)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3 text-left transition-all',
                  isSelected
                    ? 'border-emerald-500/60 bg-emerald-950/40 text-white shadow-lg shadow-emerald-950/50'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0', isSelected ? 'text-emerald-400' : 'text-slate-500')} />
                <div>
                  <div className="text-xs font-bold tracking-wider">{item.label}</div>
                  <div className="text-[11px] text-slate-400">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SIX PRIMARY WORK AREAS NAVIGATION GRID */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
        {WORK_AREAS.map((area) => {
          const Icon = area.icon;
          const isActive = activeArea === area.key;
          return (
            <button
              key={area.key}
              onClick={() => setActiveArea(area.key)}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-4 py-3 text-left text-xs font-bold transition-all',
                isActive
                  ? 'border border-emerald-500/60 bg-emerald-950/50 text-emerald-300 shadow-lg shadow-emerald-950/50'
                  : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-emerald-400' : 'text-slate-500')} />
              <span className="truncate">{area.label}</span>
            </button>
          );
        })}
      </div>

      {/* WORK AREA CONTENT CONTAINER */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        {/* WORK AREA 1: CONTENT & BRANDING */}
        {activeArea === 'content_branding' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Content & Branding Studio</h2>
                <p className="text-xs text-slate-400">Manage bilingual copy, brand logos, portal titles, and universal media holders.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
                  <button
                    onClick={() => setContentLang('en')}
                    className={cn('rounded px-3 py-1 font-bold', contentLang === 'en' ? 'bg-sky-600 text-white' : 'text-slate-400')}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setContentLang('ar')}
                    className={cn('rounded px-3 py-1 font-bold', contentLang === 'ar' ? 'bg-sky-600 text-white' : 'text-slate-400')}
                  >
                    العربية
                  </button>
                </div>

                <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
                  <button
                    onClick={() => setThemeMode('dark')}
                    className={cn('rounded px-3 py-1 font-bold', themeMode === 'dark' ? 'bg-purple-600 text-white' : 'text-slate-400')}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setThemeMode('light')}
                    className={cn('rounded px-3 py-1 font-bold', themeMode === 'light' ? 'bg-purple-600 text-white' : 'text-slate-400')}
                  >
                    Light
                  </button>
                </div>
              </div>
            </div>

            {/* GLOBAL BRANDING COPY */}
            <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
              <h3 className="font-semibold text-sky-400">Global Branding ({contentLang.toUpperCase()})</h3>
              {contentLang === 'en' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-slate-400">Gateway Eyebrow (EN)</label>
                    <input
                      type="text"
                      value={formData.english.eyebrowEn}
                      onChange={(e) => updateEnglishState('eyebrowEn', e.target.value)}
                      className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Gateway Headline (EN)</label>
                    <input
                      type="text"
                      value={formData.english.headlineEn}
                      onChange={(e) => updateEnglishState('headlineEn', e.target.value)}
                      className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-400">Gateway Supporting Text (EN)</label>
                    <textarea
                      value={formData.english.supportingTextEn}
                      onChange={(e) => updateEnglishState('supportingTextEn', e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 dir-rtl">
                  <div>
                    <label className="text-xs text-slate-400">العنوان العلوي (AR)</label>
                    <input
                      type="text"
                      value={formData.arabic.eyebrowAr}
                      onChange={(e) => updateArabicState('eyebrowAr', e.target.value)}
                      className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">العنوان الرئيسي (AR)</label>
                    <input
                      type="text"
                      value={formData.arabic.headlineAr}
                      onChange={(e) => updateArabicState('headlineAr', e.target.value)}
                      className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-400">النص التوضيحي (AR)</label>
                    <textarea
                      value={formData.arabic.supportingTextAr}
                      onChange={(e) => updateArabicState('supportingTextAr', e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* LOGOS MANAGEMENT */}
            <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
              <h3 className="font-semibold text-emerald-400">Logos & Identity Media</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                {[
                  { key: 'mainLogo', label: 'Main Logo' },
                  { key: 'lightLogo', label: 'Light-Theme Logo' },
                  { key: 'darkLogo', label: 'Dark-Theme Logo' },
                  { key: 'mobileLogo', label: 'Mobile Logo' },
                ].map((logoItem) => (
                  <div key={logoItem.key} className="rounded-lg border border-slate-800 bg-slate-900 p-3 space-y-2">
                    <div className="font-bold text-slate-200">{logoItem.label}</div>
                    <div className="flex h-16 w-full items-center justify-center rounded bg-slate-950 border border-slate-800 p-2">
                      <span className="font-mono text-[11px] text-emerald-400">SVG / PNG Active</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 rounded bg-slate-800 py-1 text-[10px] font-semibold text-slate-300 hover:bg-slate-700">Upload</button>
                      <button className="flex-1 rounded bg-slate-800 py-1 text-[10px] font-semibold text-slate-300 hover:bg-slate-700">Select</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* B2B AND B2C PORTAL CONTENT */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* B2C CONTENT */}
              <div className="space-y-3 rounded-lg border border-sky-800/40 bg-sky-950/20 p-4 text-xs">
                <h3 className="font-semibold text-sky-300">B2C Public Portal Content</h3>
                <div>
                  <label className="text-slate-400">B2C Title</label>
                  <input
                    type="text"
                    value={formData.english.b2cTitleEn}
                    onChange={(e) => updateEnglishState('b2cTitleEn', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400">B2C Description</label>
                  <textarea
                    value={formData.english.b2cDescEn}
                    onChange={(e) => updateEnglishState('b2cDescEn', e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">B2C CTA Label</label>
                  <input
                    type="text"
                    value={formData.english.b2cCtaLabelEn}
                    onChange={(e) => updateEnglishState('b2cCtaLabelEn', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-white font-semibold"
                  />
                </div>
              </div>

              {/* B2B CONTENT */}
              <div className="space-y-3 rounded-lg border border-purple-800/40 bg-purple-950/20 p-4 text-xs">
                <h3 className="font-semibold text-purple-300">B2B Enterprise Portal Content</h3>
                <div>
                  <label className="text-slate-400">B2B Title</label>
                  <input
                    type="text"
                    value={formData.english.b2bTitleEn}
                    onChange={(e) => updateEnglishState('b2bTitleEn', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400">B2B Description</label>
                  <textarea
                    value={formData.english.b2bDescEn}
                    onChange={(e) => updateEnglishState('b2bDescEn', e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">B2B CTA Label</label>
                  <input
                    type="text"
                    value={formData.english.b2bCtaLabelEn}
                    onChange={(e) => updateEnglishState('b2bCtaLabelEn', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-white font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WORK AREA 2: LIVE WEATHER */}
        {activeArea === 'live_weather' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Live Weather Engine & Scene Mapping</h2>
                <p className="text-xs text-slate-400">Manage real-time weather integration and scene preset mappings.</p>
              </div>

              <button
                onClick={handleFetchCurrentLiveWeather}
                disabled={fetchingLiveWeather}
                className="flex items-center gap-1.5 rounded border border-sky-700/60 bg-sky-950/40 px-3.5 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-900/60 disabled:opacity-50"
              >
                <RefreshCw className={cn("h-4 w-4 text-sky-400", fetchingLiveWeather && "animate-spin")} />
                {fetchingLiveWeather ? 'Fetching...' : 'Use Live Doha Weather'}
              </button>
            </div>

            {/* Weather Status Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs">
                <span className="text-slate-400">Live Doha Weather</span>
                <div className="mt-1 text-lg font-bold text-emerald-400">CONNECTED (25.2854° N, 51.5310° E)</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs">
                <span className="text-slate-400">Current Resolved Scene</span>
                <div className="mt-1 text-lg font-bold text-sky-400">{formData.experienceConfig?.defaultScenePreset || 'clear-day'}</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs">
                <span className="text-slate-400">Refresh Interval</span>
                <input
                  type="number"
                  value={formData.experienceConfig?.weatherRefreshIntervalMin || 30}
                  onChange={(e) => updateExperienceConfig('weatherRefreshIntervalMin', parseInt(e.target.value))}
                  className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-purple-400 font-bold"
                />
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs">
                <span className="text-slate-400">Cache / Fallback Status</span>
                <div className="mt-1 text-lg font-bold text-amber-400">Cache Active (TTL 1800s)</div>
              </div>
            </div>

            {/* Simple Scene Mapping Cards Grid */}
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-200 text-sm">Scene Mapping Presets</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {[
                  { preset: 'clear-day', label: 'Clear Day', color: 'border-sky-800/50 bg-sky-950/20 text-sky-300' },
                  { preset: 'heat', label: 'Extreme Heat', color: 'border-amber-800/50 bg-amber-950/20 text-amber-300' },
                  { preset: 'rain', label: 'Rain', color: 'border-blue-800/50 bg-blue-950/20 text-blue-300' },
                  { preset: 'heavy-rain', label: 'Heavy Rain', color: 'border-indigo-800/50 bg-indigo-950/20 text-indigo-300' },
                  { preset: 'wind', label: 'Wind', color: 'border-teal-800/50 bg-teal-950/20 text-teal-300' },
                  { preset: 'dust', label: 'Dust Storm', color: 'border-yellow-800/50 bg-yellow-950/20 text-yellow-300' },
                  { preset: 'sandstorm', label: 'Sandstorm', color: 'border-orange-800/50 bg-orange-950/20 text-orange-300' },
                  { preset: 'fog', label: 'Fog', color: 'border-slate-700 bg-slate-900 text-slate-200' },
                  { preset: 'snow', label: 'Snow', color: 'border-cyan-800/50 bg-cyan-950/20 text-cyan-200' },
                  { preset: 'night', label: 'Night Sky', color: 'border-purple-800/50 bg-purple-950/20 text-purple-300' },
                ].map((item) => (
                  <div key={item.preset} className={cn('rounded-lg border p-3 text-xs space-y-2', item.color)}>
                    <div className="font-bold">{item.label}</div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="rounded bg-slate-900 px-1.5 py-0.5">Medium</span>
                      <button onClick={() => applyPreset(item.preset)} className="text-emerald-400 underline font-semibold">Preview</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collapsed Advanced Weather Rules Accordion */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <button
                onClick={() => setShowAdvancedRules(!showAdvancedRules)}
                className="flex w-full items-center justify-between text-sm font-semibold text-slate-300"
              >
                <span>Advanced Weather Rules & Thresholds ({formData.weatherRules?.length || 0} Rules)</span>
                {showAdvancedRules ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showAdvancedRules && (
                <div className="mt-4 space-y-3 pt-3 border-t border-slate-800">
                  {formData.weatherRules?.map((rule) => (
                    <div key={rule.id} className="flex flex-wrap items-center justify-between gap-4 rounded border border-slate-800 bg-slate-900 p-3 text-xs">
                      <span className="font-bold text-slate-200">#{rule.priority} {rule.name}</span>
                      <span className="font-mono text-emerald-400">Preset: {rule.presetId} | Blend: {rule.blendIntensity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* WORK AREA 3: CUSTOM CAMPAIGNS */}
        {activeArea === 'custom_campaigns' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Custom Campaign & Asset Composer</h2>
                <p className="text-xs text-slate-400">Compose modular world activations with custom media holders and reusable animation behaviors.</p>
              </div>

              <button
                onClick={() => {
                  const newCamp: GatewayCampaignItem = {
                    id: `c-${Date.now()}`,
                    internalName: 'New Custom World Campaign',
                    titleEn: 'New World Experience',
                    titleAr: 'عالم تجريبي جديد',
                    descriptionEn: 'Interactive modular activation.',
                    descriptionAr: 'تجربة تفاعلية جديدة.',
                    portalScope: 'SHARED',
                    priority: 'CAMPAIGN',
                    status: 'PUBLISHED',
                    scenePreset: 'clear-day',
                    weatherBlendMode: 'BLEND',
                    animationIntensity: 0.8,
                    emergencyDisable: false,
                    elements: [
                      {
                        id: `elem-1`,
                        name: 'Modular Falling Particle',
                        assetUrl: '/images/particle.png',
                        assetType: 'image',
                        animationBehavior: 'fall_like_rain',
                        density: 'medium',
                        speed: 5,
                        scale: 1.0,
                        rotation: 0,
                        opacity: 0.8,
                        depthLayer: 'behind_content',
                        mobileMultiplier: 0.5,
                        accumulationEnabled: true,
                        maxAccumulation: 20,
                        interactionEnabled: true,
                        weatherResponse: 'blend',
                        startDelay: 0,
                        loop: true,
                      },
                    ],
                  };
                  setFormData((prev) => ({ ...prev, campaigns: [...(prev.campaigns || []), newCamp] }));
                }}
                className="flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <Plus className="h-4 w-4" /> Add Campaign
              </button>
            </div>

            {/* Campaign Selection List */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {formData.campaigns?.map((camp, idx) => (
                <button
                  key={camp.id}
                  onClick={() => setSelectedCampaignIdx(idx)}
                  className={cn(
                    'rounded-lg border p-4 text-left transition-all space-y-2',
                    selectedCampaignIdx === idx
                      ? 'border-amber-500/60 bg-amber-950/30 text-white shadow-lg'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">{camp.titleEn}</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">{camp.portalScope}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{camp.descriptionEn}</p>
                </button>
              ))}
            </div>

            {/* Selected Campaign Editor Details */}
            {activeCampaignItem && (
              <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
                <h3 className="font-semibold text-amber-400 text-sm">Editing Campaign: {activeCampaignItem.titleEn}</h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="text-slate-400">Internal Name</label>
                    <input
                      type="text"
                      value={activeCampaignItem.internalName}
                      onChange={(e) => {
                        const updated = [...(formData.campaigns || [])];
                        updated[selectedCampaignIdx].internalName = e.target.value;
                        setFormData((prev) => ({ ...prev, campaigns: updated }));
                      }}
                      className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400">Weather Blend Choice</label>
                    <select
                      value={activeCampaignItem.weatherBlendChoice || 'blend_with_weather'}
                      onChange={(e) => {
                        const updated = [...(formData.campaigns || [])];
                        updated[selectedCampaignIdx].weatherBlendChoice = e.target.value as any;
                        setFormData((prev) => ({ ...prev, campaigns: updated }));
                      }}
                      className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-white"
                    >
                      <option value="blend_with_weather">Blend With Weather</option>
                      <option value="campaign_only">Campaign Only</option>
                      <option value="weather_only">Weather Only</option>
                      <option value="replace_weather_particles">Replace Weather Particles</option>
                    </select>
                  </div>
                </div>

                {/* Campaign Asset Placeholders Grid */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <h4 className="font-semibold text-slate-200 text-xs">Campaign Media & 3D Asset Holders</h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 text-xs">
                    {[
                      { name: 'Campaign Logo', icon: ImageIcon },
                      { name: 'Background Image', icon: ImageIcon },
                      { name: 'Background Video', icon: Video },
                      { name: 'Foreground PNG', icon: ImageIcon },
                      { name: 'SVG Element', icon: FileCode },
                      { name: '3D GLB Object', icon: Box },
                      { name: 'Spline Scene', icon: Box },
                      { name: 'Particle Asset', icon: Sparkles },
                    ].map((placeholder) => {
                      const Icon = placeholder.icon;
                      return (
                        <div key={placeholder.name} className="rounded border border-slate-800 bg-slate-900 p-3 space-y-2 text-center">
                          <Icon className="h-5 w-5 mx-auto text-amber-400" />
                          <div className="font-bold text-[11px] text-slate-300">{placeholder.name}</div>
                          <span className="block text-[9px] text-slate-500">Upload or Select Media</span>
                          <button className="w-full rounded bg-slate-800 py-1 text-[10px] font-semibold text-slate-300 hover:bg-slate-700">Choose</button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Campaign Reusable Elements */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <h4 className="font-semibold text-slate-200 text-xs">Reusable Element Animations ({activeCampaignItem.elements?.length || 0} Elements)</h4>
                  {activeCampaignItem.elements?.map((elem) => (
                    <div key={elem.id} className="flex flex-wrap items-center justify-between gap-4 rounded border border-slate-800 bg-slate-900 p-3 text-xs">
                      <span className="font-bold text-slate-200">{elem.name}</span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-emerald-400 font-mono">Animation: {elem.animationBehavior}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* WORK AREA 4: PREVIEW */}
        {activeArea === 'preview' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Preview Simulator</h2>
                <p className="text-xs text-slate-400">Live isolated environment rendering draft CMS state without publishing.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSimState(DEFAULT_SIMULATION_STATE)}
                  className="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-amber-400" /> Reset Defaults
                </button>

                <button
                  onClick={handleFetchCurrentLiveWeather}
                  disabled={fetchingLiveWeather}
                  className="flex items-center gap-1.5 rounded border border-sky-700/60 bg-sky-950/40 px-3 py-1.5 text-xs text-sky-300 hover:bg-sky-900/60 disabled:opacity-50"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5 text-sky-400", fetchingLiveWeather && "animate-spin")} />
                  {fetchingLiveWeather ? 'Fetching...' : 'Use Live Doha Weather'}
                </button>
              </div>
            </div>

            {/* Scenario Quick Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Simulation Scenarios:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Clear Day', key: 'clear-day', color: 'bg-sky-950/60 text-sky-300 border-sky-800/50' },
                  { label: 'Extreme Heat', key: 'extreme-heat', color: 'bg-amber-950/60 text-amber-300 border-amber-800/50' },
                  { label: 'Rain', key: 'rain', color: 'bg-blue-950/60 text-blue-300 border-blue-800/50' },
                  { label: 'Heavy Rain', key: 'heavy-rain', color: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50' },
                  { label: 'Wind', key: 'wind', color: 'bg-teal-950/60 text-teal-300 border-teal-800/50' },
                  { label: 'Dust Storm', key: 'dust-storm', color: 'bg-yellow-950/60 text-yellow-300 border-yellow-800/50' },
                  { label: 'Sandstorm', key: 'sandstorm', color: 'bg-orange-950/60 text-orange-300 border-orange-800/50' },
                  { label: 'Fog', key: 'fog', color: 'bg-slate-800 text-slate-200 border-slate-700' },
                  { label: 'Snow', key: 'snow', color: 'bg-cyan-950/60 text-cyan-200 border-cyan-800/50' },
                  { label: 'Night Sky', key: 'night', color: 'bg-purple-950/60 text-purple-300 border-purple-800/50' },
                  { label: 'Campaign World', key: 'campaign', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50' },
                  { label: 'Campaign + Rain', key: 'campaign-weather', color: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50' },
                ].map((scenario) => (
                  <button
                    key={scenario.key}
                    onClick={() => applyPreset(scenario.key)}
                    className={cn('rounded border px-2.5 py-1 text-xs font-medium transition-all hover:scale-105', scenario.color)}
                  >
                    {scenario.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Embedded Live Gateway Target */}
            <div className="relative min-h-[520px] w-full overflow-hidden rounded-xl border border-slate-800 shadow-2xl bg-black">
              <PortalGateway
                cmsData={formData}
                previewMode={true}
                previewConfig={formData}
                simulation={simState}
              />
            </div>

            {/* Collapsed Advanced Simulation Accordion */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <button
                onClick={() => setShowAdvancedSimulation(!showAdvancedSimulation)}
                className="flex w-full items-center justify-between text-sm font-semibold text-slate-300"
              >
                <span>Advanced Simulation Sliders</span>
                {showAdvancedSimulation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showAdvancedSimulation && (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <label className="text-slate-400">Temperature ({simState.temperature}°C)</label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={simState.temperature}
                      onChange={(e) => updateSimState('temperature', parseInt(e.target.value))}
                      className="mt-1 w-full accent-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400">Rainfall ({simState.rain} mm)</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="0.5"
                      value={simState.rain}
                      onChange={(e) => updateSimState('rain', parseFloat(e.target.value))}
                      className="mt-1 w-full accent-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400">PM10 Dust ({simState.pm10} µg/m³)</label>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      value={simState.pm10}
                      onChange={(e) => updateSimState('pm10', parseInt(e.target.value))}
                      className="mt-1 w-full accent-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WORK AREA 5: MOBILE & ACCESSIBILITY */}
        {activeArea === 'mobile_accessibility' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Mobile, Reduced Motion & Focus Protection</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-xs">
              <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
                <h3 className="font-semibold text-emerald-400">Mobile & Lightweight Rules</h3>
                <div>
                  <label className="text-slate-400">Mobile Particle Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1.0"
                    value={formData.atmospherePresets?.[0]?.mobileParticleMultiplier || 0.4}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Mobile DPR Limit</label>
                  <input
                    type="number"
                    step="0.1"
                    value={1.5}
                    disabled
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
                <h3 className="font-semibold text-sky-400">Focus Protection & Contrast Controls</h3>
                <div>
                  <label className="text-slate-400">Atmosphere Near Cards</label>
                  <select
                    value={formData.focusProtection?.atmosphereAroundCards || 'low'}
                    onChange={(e) => updateFocusProtection('atmosphereAroundCards', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-white"
                  >
                    <option value="off">Off</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400">Content Reaction Mode</label>
                  <select
                    value={formData.focusProtection?.contentReaction || 'ambient'}
                    onChange={(e) => updateFocusProtection('contentReaction', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-white"
                  >
                    <option value="off">Off</option>
                    <option value="ambient">Ambient</option>
                    <option value="expressive">Expressive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Collapsed Advanced Performance Settings Accordion */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <button
                onClick={() => setShowAdvancedPerformance(!showAdvancedPerformance)}
                className="flex w-full items-center justify-between text-sm font-semibold text-slate-300"
              >
                <span>Advanced Performance & Degradation Limits</span>
                {showAdvancedPerformance ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showAdvancedPerformance && (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <label className="text-slate-400">Target Frame Rate (FPS)</label>
                    <input
                      type="number"
                      value={60}
                      disabled
                      className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400">Background Tab RAF Throttle</label>
                    <span className="mt-1 block rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-emerald-400 font-mono">ENABLED (Automatic RAF Pause)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WORK AREA 6: PUBLISH & VERSIONS */}
        {activeArea === 'publish_versions' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Publishing & Version Rollback System</h2>

            <div className="space-y-3">
              {versions.map((ver) => (
                <div key={ver.version} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400">Version #{ver.version}</span>
                      <span className="text-xs text-slate-500">{new Date(ver.publishedAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{ver.releaseNotes}</p>
                    <span className="font-mono text-[10px] text-slate-600">{ver.checksum}</span>
                  </div>

                  <button
                    onClick={() => handleRollback(ver.version)}
                    className="flex items-center gap-1.5 rounded border border-amber-700/50 bg-amber-950/40 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-900/60"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Rollback to #{ver.version}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
