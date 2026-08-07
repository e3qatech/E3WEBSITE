"use client";

import React, { useState, useEffect } from 'react';
import {
  GatewayCustomizationPayload,
  DEFAULT_GATEWAY_CMS_PAYLOAD,
  GatewayContentEn,
  GatewayContentAr,
  PreviewSimulationState,
  GatewayGlobalMode,
} from '@/types/gateway-cms';
import { PortalGateway } from '@/components/home/PortalGateway';
import {
  Save,
  Globe,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Sun,
  Megaphone,
  History,
  Play,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_SIMULATION_STATE: PreviewSimulationState = {
  temperature: 32,
  apparentTemperature: 36,
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
  const [formData, setFormData] = useState<GatewayCustomizationPayload>(DEFAULT_GATEWAY_CMS_PAYLOAD);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [fetchingLiveWeather, setFetchingLiveWeather] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Active language & preview theme
  const [contentLang, setContentLang] = useState<'en' | 'ar'>('en');

  // Accordion for Advanced Technical Settings
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Preview simulation state
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
        action === 'publish' ? 'Gateway published successfully!' : 'Draft saved successfully!',
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
        showToast('Fetched live Doha weather!', 'success');
      }
    } catch (_e) {
      showToast('Failed to fetch live weather.', 'error');
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

  const updateGlobalMode = (mode: GatewayGlobalMode) => {
    setFormData((prev) => ({ ...prev, globalMode: mode }));
  };

  const applyPreset = (name: string) => {
    switch (name) {
      case 'clear-day':
        setSimState((prev) => ({ ...prev, temperature: 28, apparentTemperature: 30, rain: 0, pm10: 20, isDay: true, heavyRainOverride: false, windSpeed: 12 }));
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
        setSimState((prev) => ({ ...prev, windSpeed: 45, windGusts: 60 }));
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
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="font-mono text-xs tracking-wider uppercase text-slate-400">Loading E3 Gateway Manager...</span>
        </div>
      </div>
    );
  }

  const currentMode = formData.globalMode || 'LIVE_DOHA';

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 text-slate-100 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={cn(
            'fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl backdrop-blur-md transition-all border',
            toast.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200'
              : 'border-rose-500/40 bg-rose-950/90 text-rose-200'
          )}
        >
          {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <ShieldAlert className="h-5 w-5 text-rose-400" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* HEADER HERO BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Doha Weather Active
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">E3 Gateway Manager</h1>
          <p className="text-xs text-slate-400">Manage branding, mode, and atmosphere for the E3 Qatar portal gateway.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave('save_draft')}
            disabled={saving || publishing}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-50 transition-all"
          >
            <Save className="h-4 w-4 text-emerald-400" />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={() => handleSave('publish')}
            disabled={saving || publishing}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-950 hover:bg-emerald-500 disabled:opacity-50 transition-all"
          >
            <Globe className="h-4 w-4" />
            {publishing ? 'Publishing...' : 'Publish Live'}
          </button>
        </div>
      </div>

      {/* MAIN 2-COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: SIMPLE EDITING CARDS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* CARD 1: GATEWAY MODE SELECTOR */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Gateway Mode</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { mode: 'LIVE_DOHA' as GatewayGlobalMode, title: 'Live Doha Weather', subtitle: 'Automatic live weather & sky resolution', icon: Sun },
                { mode: 'MANUAL_OVERRIDE' as GatewayGlobalMode, title: 'Manual Scene Override', subtitle: 'Select a fixed scene preset (Rain, Heat, etc.)', icon: Sliders },
                { mode: 'CUSTOM_CAMPAIGN' as GatewayGlobalMode, title: 'Custom Campaign World', subtitle: 'Activate seasonal campaign world', icon: Megaphone },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = currentMode === item.mode;
                return (
                  <button
                    key={item.mode}
                    onClick={() => updateGlobalMode(item.mode)}
                    className={cn(
                      'flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all',
                      isSelected
                        ? 'border-emerald-500/80 bg-emerald-950/40 text-white shadow-md shadow-emerald-950'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", isSelected ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-900 text-slate-500")}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold">{item.title}</div>
                      <div className="text-[11px] text-slate-400">{item.subtitle}</div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARD 2: BRANDING & HEADLINES */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-sky-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Branding & Copy</h2>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1 text-[11px]">
                <button
                  onClick={() => setContentLang('en')}
                  className={cn('rounded px-2.5 py-0.5 font-bold transition-all', contentLang === 'en' ? 'bg-sky-600 text-white' : 'text-slate-400')}
                >
                  English
                </button>
                <button
                  onClick={() => setContentLang('ar')}
                  className={cn('rounded px-2.5 py-0.5 font-bold transition-all', contentLang === 'ar' ? 'bg-sky-600 text-white' : 'text-slate-400')}
                >
                  العربية
                </button>
              </div>
            </div>

            {contentLang === 'en' ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold">Gateway Headline</label>
                  <input
                    type="text"
                    value={formData.english.headlineEn}
                    onChange={(e) => updateEnglishState('headlineEn', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-semibold focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Supporting Description</label>
                  <textarea
                    value={formData.english.supportingTextEn}
                    onChange={(e) => updateEnglishState('supportingTextEn', e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-sky-400 font-semibold">B2C Public Title</label>
                    <input
                      type="text"
                      value={formData.english.b2cTitleEn}
                      onChange={(e) => updateEnglishState('b2cTitleEn', e.target.value)}
                      className="w-full rounded border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-purple-400 font-semibold">B2B Enterprise Title</label>
                    <input
                      type="text"
                      value={formData.english.b2bTitleEn}
                      onChange={(e) => updateEnglishState('b2bTitleEn', e.target.value)}
                      className="w-full rounded border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs dir-rtl">
                <div>
                  <label className="text-slate-400 font-semibold">العنوان الرئيسي (AR)</label>
                  <input
                    type="text"
                    value={formData.arabic.headlineAr}
                    onChange={(e) => updateArabicState('headlineAr', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-semibold focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">الوصف التوضيحي (AR)</label>
                  <textarea
                    value={formData.arabic.supportingTextAr}
                    onChange={(e) => updateArabicState('supportingTextAr', e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* CARD 3: PUBLISHING & REVISIONS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Revisions & Rollback</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{versions.length} Versions</span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {versions.slice(0, 3).map((ver) => (
                <div key={ver.version} className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950 p-2.5 text-xs">
                  <div>
                    <span className="font-bold text-amber-400">Version #{ver.version}</span>
                    <span className="ml-2 text-[10px] text-slate-500">{new Date(ver.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => handleRollback(ver.version)}
                    className="rounded bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW STUDIO (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-2xl backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Live Preview Simulator</h2>
              </div>

              <button
                onClick={handleFetchCurrentLiveWeather}
                disabled={fetchingLiveWeather}
                className="flex items-center gap-1.5 rounded-lg border border-sky-800/60 bg-sky-950/40 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-900/60 disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3.5 w-3.5 text-sky-400", fetchingLiveWeather && "animate-spin")} />
                {fetchingLiveWeather ? 'Fetching...' : 'Fetch Live Weather'}
              </button>
            </div>

            {/* Quick 1-Click Atmosphere Testing Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Test Atmosphere Effects:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Clear Day', key: 'clear-day', cls: 'bg-sky-950/60 text-sky-300 border-sky-800/50' },
                  { label: 'Heat Haze', key: 'extreme-heat', cls: 'bg-amber-950/60 text-amber-300 border-amber-800/50' },
                  { label: 'Rain', key: 'rain', cls: 'bg-blue-950/60 text-blue-300 border-blue-800/50' },
                  { label: 'Heavy Rain', key: 'heavy-rain', cls: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50' },
                  { label: 'Wind Ribbons', key: 'wind', cls: 'bg-teal-950/60 text-teal-300 border-teal-800/50' },
                  { label: 'Dust', key: 'dust-storm', cls: 'bg-yellow-950/60 text-yellow-300 border-yellow-800/50' },
                  { label: 'Sandstorm', key: 'sandstorm', cls: 'bg-orange-950/60 text-orange-300 border-orange-800/50' },
                  { label: 'Fog', key: 'fog', cls: 'bg-slate-800 text-slate-200 border-slate-700' },
                  { label: 'Snow Flakes', key: 'snow', cls: 'bg-cyan-950/60 text-cyan-200 border-cyan-800/50' },
                  { label: 'Night Stars', key: 'night', cls: 'bg-purple-950/60 text-purple-300 border-purple-800/50' },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => applyPreset(p.key)}
                    className={cn('rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all hover:scale-105', p.cls)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Embedded Live Gateway Render Frame */}
            <div className="relative min-h-[480px] w-full overflow-hidden rounded-xl border border-slate-800 shadow-2xl bg-black">
              <PortalGateway
                cmsData={formData}
                previewMode={true}
                previewConfig={formData}
                simulation={simState}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM COLLAPSED ACCORDION: ADVANCED TECHNICAL SETTINGS */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
        <button
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Advanced System Settings & Fine-Tuning (Particle Counts, Physics, Thresholds)</span>
          </div>
          {showAdvancedSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showAdvancedSettings && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 pt-4 border-t border-slate-800/80 text-xs">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2">
              <span className="font-bold text-slate-300">Weather Refresh Interval</span>
              <input
                type="number"
                value={formData.experienceConfig?.weatherRefreshIntervalMin || 30}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    experienceConfig: { ...prev.experienceConfig!, weatherRefreshIntervalMin: parseInt(e.target.value) },
                  }))
                }
                className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-white font-mono"
              />
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2">
              <span className="font-bold text-slate-300">Mobile Particle Multiplier</span>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="1.0"
                value={0.4}
                disabled
                className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-400 font-mono"
              />
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2">
              <span className="font-bold text-slate-300">Atmosphere Around Cards</span>
              <select
                value={formData.focusProtection?.atmosphereAroundCards || 'low'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    focusProtection: { ...prev.focusProtection!, atmosphereAroundCards: e.target.value as any },
                  }))
                }
                className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-white"
              >
                <option value="off">Off</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
