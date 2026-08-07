"use client";

import React, { useState, useEffect } from 'react';
import {
  GatewayCustomizationPayload,
  DEFAULT_GATEWAY_CMS_PAYLOAD,
  AtmosphereRendererType,
  GatewayWeatherRule,
  GatewayContentEn,
  GatewayContentAr,
} from '@/types/gateway-cms';
import { PortalGateway } from '@/components/home/PortalGateway';
import {
  Save,
  Globe,
  Smartphone,
  Eye,
  Sliders,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Box,
  CloudRain,
  Sun,
  Layers,
  Megaphone,
  History,
  Activity,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Wind,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabKey =
  | 'overview'
  | 'content'
  | 'weather'
  | 'atmosphere'
  | 'time_of_day'
  | 'rain_water'
  | 'dust_sand'
  | 'wind'
  | 'fog_haze'
  | 'campaigns'
  | 'announcements'
  | 'navigation'
  | 'assets_3d'
  | 'mobile'
  | 'reduced_motion'
  | 'performance'
  | 'simulator'
  | 'versions';

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'overview', label: '1. Overview', icon: Activity },
  { key: 'content', label: '2. Gateway Content', icon: FileText },
  { key: 'weather', label: '3. Weather & Live Conditions', icon: Sun },
  { key: 'atmosphere', label: '4. Atmosphere Presets', icon: Sparkles },
  { key: 'time_of_day', label: '5. Time of Day', icon: Sliders },
  { key: 'rain_water', label: '6. Rain & Water', icon: CloudRain },
  { key: 'dust_sand', label: '7. Dust & Sand', icon: Wind },
  { key: 'wind', label: '8. Wind', icon: Compass },
  { key: 'fog_haze', label: '9. Fog & Haze', icon: Sliders },
  { key: 'campaigns', label: '10. Campaigns', icon: Megaphone },
  { key: 'announcements', label: '11. Announcements', icon: Layers },
  { key: 'navigation', label: '12. Navigation Effects', icon: Globe },
  { key: 'assets_3d', label: '13. 3D Assets', icon: Box },
  { key: 'mobile', label: '14. Mobile', icon: Smartphone },
  { key: 'reduced_motion', label: '15. Reduced Motion', icon: Eye },
  { key: 'performance', label: '16. Performance', icon: Sliders },
  { key: 'simulator', label: '17. Preview Simulator', icon: Play },
  { key: 'versions', label: '18. Versions & Publishing', icon: History },
];

export default function GatewayCustomizationPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [formData, setFormData] = useState<GatewayCustomizationPayload>(DEFAULT_GATEWAY_CMS_PAYLOAD);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Simulator Controls State
  const [simTemp, setSimTemp] = useState<number>(34);
  const [simApparentTemp, setSimApparentTemp] = useState<number>(38);
  const [simRain, setSimRain] = useState<number>(0);
  const [simHeavyRain, setSimHeavyRain] = useState<boolean>(false);
  const [simWind, setSimWind] = useState<number>(18);
  const [simGust, setSimGust] = useState<number>(24);
  const [simPm10, setSimPm10] = useState<number>(45);
  const [simPm25, setSimPm25] = useState<number>(20);
  const [simVisibility, setSimVisibility] = useState<number>(10);
  const [simIsDay, setSimIsDay] = useState<boolean>(true);
  const [simDevice, setSimDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [simLocale, setSimLocale] = useState<'en' | 'ar'>('en');
  const [simTheme, setSimTheme] = useState<'dark' | 'light'>('dark');
  const [simTier, setSimTier] = useState<'cinematic' | 'balanced' | 'lightweight'>('cinematic');
  const [simReducedMotion, setSimReducedMotion] = useState<boolean>(false);
  const [simWebGlUnavailable, setSimWebGlUnavailable] = useState<boolean>(false);
  const [simApiUnavailable, setSimApiUnavailable] = useState<boolean>(false);
  const [simActiveCampaignId, setSimActiveCampaignId] = useState<string>('c-1');

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

  const updateWaterSandPhysics = (field: string, value: any) => {
    setFormData((prev) => {
      let finalVal = value;
      if (field === 'waterMaxHeightPercent') finalVal = Math.min(Number(value) || 0, 40);
      if (field === 'sandMaxHeightPercent') finalVal = Math.min(Number(value) || 0, 30);
      return {
        ...prev,
        waterAndSandPhysics: {
          ...DEFAULT_GATEWAY_CMS_PAYLOAD.waterAndSandPhysics,
          ...(prev.waterAndSandPhysics || {}),
          [field]: finalVal,
        } as any,
      };
    });
  };

  // Helper for dynamic preset computed in simulator
  const activePresetType: AtmosphereRendererType = React.useMemo(() => {
    if (simWebGlUnavailable || simApiUnavailable || simReducedMotion) return 'static-fallback';
    if (simRain >= 5 || simHeavyRain) return 'heavy-rain';
    if (simRain > 0.5) return 'rain';
    if (simPm10 >= 100 || simGust >= 38) return 'sandstorm';
    if (simApparentTemp >= 38) return 'heat';
    if (!simIsDay) return 'night';
    return 'clear-day';
  }, [simWebGlUnavailable, simApiUnavailable, simReducedMotion, simRain, simHeavyRain, simPm10, simGust, simApparentTemp, simIsDay]);

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
            <Sparkles className="h-4 w-4" /> E3 Living Threshold Gateway Engine
          </div>
          <h1 className="text-2xl font-bold text-white">Experience Composer & CMS Studio</h1>
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

      {/* Tabs Navigation Grid */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-all',
                isActive
                  ? 'border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 shadow-md shadow-emerald-950/50'
                  : 'border border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              )}
            >
              <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-emerald-400' : 'text-slate-500')} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">System Status Overview</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <div className="text-xs font-medium text-slate-400">Weather Engine Status</div>
                <div className="mt-2 text-xl font-bold text-emerald-400">
                  {formData.experienceConfig?.systemEnabled ? 'ACTIVE & LIVE' : 'DISABLED'}
                </div>
                <div className="mt-1 text-xs text-slate-500">Provider: Open-Meteo Commercial</div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <div className="text-xs font-medium text-slate-400">Default Scene Preset</div>
                <div className="mt-2 text-xl font-bold text-sky-400">
                  {formData.experienceConfig?.defaultScenePreset || 'clear-day'}
                </div>
                <div className="mt-1 text-xs text-slate-500">Fallback: {formData.experienceConfig?.fallbackMode || 'STATIC_POSTER'}</div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <div className="text-xs font-medium text-slate-400">Active Weather Rules</div>
                <div className="mt-2 text-xl font-bold text-purple-400">
                  {formData.weatherRules?.filter((r) => r.enabled).length || 0} Rules Active
                </div>
                <div className="mt-1 text-xs text-slate-500">Total presets: {formData.atmospherePresets?.length || 0}</div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <div className="text-xs font-medium text-slate-400">Published Version</div>
                <div className="mt-2 text-xl font-bold text-amber-400">
                  v{versions[0]?.version || 1}
                </div>
                <div className="mt-1 text-xs text-slate-500">Snapshots stored: {versions.length}</div>
              </div>
            </div>

            <div className="rounded-lg border border-rose-900/30 bg-rose-950/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-rose-300">Emergency Override Control</h3>
                  <p className="text-xs text-rose-400/80">Instantly disable all dynamic 3D takeovers, canvas physics, and live weather overlays across all portals.</p>
                </div>
                <button
                  onClick={() => updateExperienceConfig('emergencyDisableAll', !formData.experienceConfig?.emergencyDisableAll)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-xs font-bold uppercase transition-all',
                    formData.experienceConfig?.emergencyDisableAll
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50'
                      : 'border border-rose-700/50 bg-rose-900/40 text-rose-200 hover:bg-rose-800'
                  )}
                >
                  {formData.experienceConfig?.emergencyDisableAll ? 'EMERGENCY DISABLE ACTIVE' : 'ENGAGE EMERGENCY DISABLE'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GATEWAY CONTENT */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Gateway Copy & Media Holders</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
                <h3 className="font-semibold text-sky-400">English Content</h3>
                <div>
                  <label className="text-xs text-slate-400">Eyebrow (EN)</label>
                  <input
                    type="text"
                    value={formData.english.eyebrowEn}
                    onChange={(e) => updateEnglishState('eyebrowEn', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Headline (EN)</label>
                  <input
                    type="text"
                    value={formData.english.headlineEn}
                    onChange={(e) => updateEnglishState('headlineEn', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Supporting Text (EN)</label>
                  <textarea
                    value={formData.english.supportingTextEn}
                    onChange={(e) => updateEnglishState('supportingTextEn', e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-950 p-4 dir-rtl">
                <h3 className="font-semibold text-sky-400">Arabic Content (المحتوى العربي)</h3>
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
                <div>
                  <label className="text-xs text-slate-400">النص التوضيحي (AR)</label>
                  <textarea
                    value={formData.arabic.supportingTextAr}
                    onChange={(e) => updateArabicState('supportingTextAr', e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WEATHER & LIVE CONDITIONS */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Weather Engine & Rule Manager</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs text-slate-400">Doha Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.experienceConfig?.dohaLatitude || 25.2854}
                  onChange={(e) => updateExperienceConfig('dohaLatitude', parseFloat(e.target.value))}
                  className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Doha Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.experienceConfig?.dohaLongitude || 51.5310}
                  onChange={(e) => updateExperienceConfig('dohaLongitude', parseFloat(e.target.value))}
                  className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Refresh Interval (Mins)</label>
                <input
                  type="number"
                  value={formData.experienceConfig?.weatherRefreshIntervalMin || 30}
                  onChange={(e) => updateExperienceConfig('weatherRefreshIntervalMin', parseInt(e.target.value))}
                  className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-200">Weather Rule Trigger Table ({formData.weatherRules?.length || 0} Rules)</h3>
                <button
                  onClick={() => {
                    const newRule: GatewayWeatherRule = {
                      id: `r-${Date.now()}`,
                      name: 'New Custom Weather Rule',
                      enabled: true,
                      priority: (formData.weatherRules?.length || 0) + 1,
                      presetId: 'rain',
                      blendIntensity: 0.8,
                    };
                    setFormData((prev) => ({ ...prev, weatherRules: [...(prev.weatherRules || []), newRule] }));
                  }}
                  className="flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Rule
                </button>
              </div>

              <div className="space-y-3">
                {formData.weatherRules?.map((rule, idx) => (
                  <div key={rule.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950 p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 font-mono text-xs font-bold text-slate-300">
                        #{rule.priority}
                      </span>
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) => {
                          const updated = [...(formData.weatherRules || [])];
                          updated[idx].name = e.target.value;
                          setFormData((prev) => ({ ...prev, weatherRules: updated }));
                        }}
                        className="rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-white font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-slate-500">Preset:</span>{' '}
                        <select
                          value={rule.presetId}
                          onChange={(e) => {
                            const updated = [...(formData.weatherRules || [])];
                            updated[idx].presetId = e.target.value as AtmosphereRendererType;
                            setFormData((prev) => ({ ...prev, weatherRules: updated }));
                          }}
                          className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white"
                        >
                          <option value="clear-day">Clear Day</option>
                          <option value="sunset">Sunset</option>
                          <option value="night">Night Sky</option>
                          <option value="heat">Extreme Heat</option>
                          <option value="rain">Rain</option>
                          <option value="heavy-rain">Heavy Rain</option>
                          <option value="sandstorm">Sandstorm</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-slate-500">Blend:</span>{' '}
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="1.0"
                          value={rule.blendIntensity}
                          onChange={(e) => {
                            const updated = [...(formData.weatherRules || [])];
                            updated[idx].blendIntensity = parseFloat(e.target.value);
                            setFormData((prev) => ({ ...prev, weatherRules: updated }));
                          }}
                          className="w-16 rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white"
                        />
                      </div>

                      <button
                        onClick={() => {
                          const updated = formData.weatherRules?.filter((_, i) => i !== idx) || [];
                          setFormData((prev) => ({ ...prev, weatherRules: updated }));
                        }}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ATMOSPHERE PRESETS */}
        {activeTab === 'atmosphere' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Atmosphere Preset Configurator</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {formData.atmospherePresets?.map((preset, idx) => (
                <div key={preset.id} className="space-y-3 rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-400">{preset.labelEn}</span>
                    <span className="text-xs text-slate-500">[{preset.rendererType}]</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-slate-500">Particle Count</label>
                      <input
                        type="number"
                        value={preset.particleCount}
                        onChange={(e) => {
                          const updated = [...(formData.atmospherePresets || [])];
                          updated[idx].particleCount = parseInt(e.target.value);
                          setFormData((prev) => ({ ...prev, atmospherePresets: updated }));
                        }}
                        className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500">Speed</label>
                      <input
                        type="number"
                        step="0.5"
                        value={preset.particleSpeed}
                        onChange={(e) => {
                          const updated = [...(formData.atmospherePresets || [])];
                          updated[idx].particleSpeed = parseFloat(e.target.value);
                          setFormData((prev) => ({ ...prev, atmospherePresets: updated }));
                        }}
                        className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: RAIN & WATER */}
        {activeTab === 'rain_water' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Rain & Water Accumulation Physics</h2>

            <div className="rounded-lg border border-sky-800/40 bg-sky-950/20 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-sky-300">Water Accumulation Height Ceiling</h3>
                <span className="rounded bg-sky-900/60 px-3 py-1 text-xs font-bold text-sky-200">HARD CEILING &le; 40%</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-400">Water Max Height (% Viewport Height)</label>
                  <input
                    type="number"
                    max={40}
                    value={formData.waterAndSandPhysics?.waterMaxHeightPercent || 15}
                    onChange={(e) => updateWaterSandPhysics('waterMaxHeightPercent', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Fill Speed Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.waterAndSandPhysics?.waterFillRate || 0.05}
                    onChange={(e) => updateWaterSandPhysics('waterFillRate', parseFloat(e.target.value))}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: DUST & SAND */}
        {activeTab === 'dust_sand' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Dust Storm & Sand Dune Accumulation Physics</h2>

            <div className="rounded-lg border border-amber-800/40 bg-amber-950/20 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-amber-300">Sand Dune Accumulation Height Ceiling</h3>
                <span className="rounded bg-amber-900/60 px-3 py-1 text-xs font-bold text-amber-200">HARD CEILING &le; 30%</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-400">Sand Max Height (% Viewport Height)</label>
                  <input
                    type="number"
                    max={30}
                    value={formData.waterAndSandPhysics?.sandMaxHeightPercent || 10}
                    onChange={(e) => updateWaterSandPhysics('sandMaxHeightPercent', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Sand Accumulation Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.waterAndSandPhysics?.sandAccumulationRate || 0.03}
                    onChange={(e) => updateWaterSandPhysics('sandAccumulationRate', parseFloat(e.target.value))}
                    className="mt-1 w-full rounded border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: CAMPAIGNS */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Campaign & World Takeover Manager</h2>

            <div className="space-y-4">
              {formData.campaigns?.map((camp) => (
                <div key={camp.id} className="space-y-3 rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-400">{camp.titleEn}</span>
                    <span className="rounded bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">{camp.priority}</span>
                  </div>

                  <p className="text-xs text-slate-400">{camp.descriptionEn}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 17: PREVIEW SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Interactive Living Threshold Preview Simulator</h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Controls Column */}
              <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs">
                <h3 className="font-semibold text-emerald-400">Weather & Condition Controls</h3>

                <div>
                  <label className="text-slate-400">Temperature ({simTemp}°C) / Apparent ({simApparentTemp}°C)</label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={simTemp}
                    onChange={(e) => {
                      const t = parseInt(e.target.value);
                      setSimTemp(t);
                      setSimApparentTemp(t + 4);
                    }}
                    className="mt-1 w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400">Rainfall ({simRain} mm)</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={simRain}
                    onChange={(e) => setSimRain(parseFloat(e.target.value))}
                    className="mt-1 w-full accent-sky-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Heavy Rain Override</span>
                  <input
                    type="checkbox"
                    checked={simHeavyRain}
                    onChange={(e) => setSimHeavyRain(e.target.checked)}
                    className="h-4 w-4 accent-sky-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400">Wind Speed ({simWind} km/h) / Gusts ({simGust} km/h)</label>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={simWind}
                    onChange={(e) => {
                      const w = parseInt(e.target.value);
                      setSimWind(w);
                      setSimGust(w + 10);
                    }}
                    className="mt-1 w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400">PM10 Dust Level ({simPm10} µg/m³) / PM2.5 ({simPm25} µg/m³)</label>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    value={simPm10}
                    onChange={(e) => {
                      const p = parseInt(e.target.value);
                      setSimPm10(p);
                      setSimPm25(Math.floor(p / 2));
                    }}
                    className="mt-1 w-full accent-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400">Visibility ({simVisibility} km)</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={simVisibility}
                    onChange={(e) => setSimVisibility(parseInt(e.target.value))}
                    className="mt-1 w-full accent-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Time of Day</span>
                  <button
                    onClick={() => setSimIsDay(!simIsDay)}
                    className="rounded bg-slate-800 px-3 py-1 text-slate-200"
                  >
                    {simIsDay ? '☀️ DAYTIME' : '🌙 NIGHTTIME'}
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="font-semibold text-slate-300">Environment & Device Options</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500">Active Campaign</label>
                      <select
                        value={simActiveCampaignId}
                        onChange={(e) => setSimActiveCampaignId(e.target.value)}
                        className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-white"
                      >
                        <option value="none">None (Default)</option>
                        {formData.campaigns?.map((c) => (
                          <option key={c.id} value={c.id}>{c.titleEn}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-500">Device</label>
                      <select
                        value={simDevice}
                        onChange={(e) => setSimDevice(e.target.value as any)}
                        className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-white"
                      >
                        <option value="desktop">Desktop</option>
                        <option value="tablet">Tablet</option>
                        <option value="mobile">Mobile</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-500">Locale</label>
                      <select
                        value={simLocale}
                        onChange={(e) => setSimLocale(e.target.value as any)}
                        className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-white"
                      >
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-500">Theme</label>
                      <select
                        value={simTheme}
                        onChange={(e) => setSimTheme(e.target.value as any)}
                        className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-white"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-500">Tier</label>
                      <select
                        value={simTier}
                        onChange={(e) => setSimTier(e.target.value as any)}
                        className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-white"
                      >
                        <option value="cinematic">Cinematic</option>
                        <option value="balanced">Balanced</option>
                        <option value="lightweight">Lightweight</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Reduced Motion</span>
                    <input
                      type="checkbox"
                      checked={simReducedMotion}
                      onChange={(e) => setSimReducedMotion(e.target.checked)}
                      className="h-4 w-4 accent-emerald-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Simulate WebGL Failure</span>
                    <input
                      type="checkbox"
                      checked={simWebGlUnavailable}
                      onChange={(e) => setSimWebGlUnavailable(e.target.checked)}
                      className="h-4 w-4 accent-rose-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Simulate API Failure</span>
                    <input
                      type="checkbox"
                      checked={simApiUnavailable}
                      onChange={(e) => setSimApiUnavailable(e.target.checked)}
                      className="h-4 w-4 accent-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Gateway Preview Canvas Column */}
              <div className="lg:col-span-2 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Live Rendered Gateway Target ({simDevice.toUpperCase()} View / {simLocale.toUpperCase()} / {simTheme.toUpperCase()})</span>
                  <span className="font-mono text-emerald-400">Active Preset: {activePresetType}</span>
                </div>

                <div className="relative h-[520px] w-full overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
                  <PortalGateway cmsData={formData} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 18: VERSIONS & PUBLISHING */}
        {activeTab === 'versions' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">Version History & Rollback System</h2>

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

        {/* Fallback rendering for additional tabs */}
        {!['overview', 'content', 'weather', 'atmosphere', 'rain_water', 'dust_sand', 'campaigns', 'simulator', 'versions'].includes(activeTab) && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white capitalize">{activeTab.replace('_', ' ')} Settings</h2>
            <p className="text-xs text-slate-400">Manage configuration attributes for {activeTab}.</p>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs font-mono text-emerald-400">Status: Active & Synchronized with Gateway CMS Engine.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
