"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, 
  ToggleLeft, 
  ToggleRight
} from 'lucide-react';
import { useToast } from '@/components/dashboard/ui/ToastProvider';

export function GlobalSettingsTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    syncIntervalMinutes: 30,
    defaultModeration: 'APPROVED',
    defaultFeedMode: 'HYBRID',
    defaultMaxPosts: 12,
    dataRetentionDays: 365,
    showEngagementMetrics: true,
    publicFeedsEnabled: true,
    enableManualEmbeds: true,
  });

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/social-media/settings');
      const json = await res.json();
      if (res.ok && json.success) {
        setSettings(json.data);
      }
    } catch (_e) {
      toast('Failed to load global settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/social-media/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update settings.');
      }

      toast('Saved global social feed settings successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-xs text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
          <div>
            <h3 className="text-sm font-black text-white">Global Social Feed System Settings</h3>
            <p className="text-xs text-slate-400">System-wide moderation defaults, sync schedules, and master feed toggles.</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-[var(--border-level-1)]">
            <div>
              <div className="font-bold text-white">Public Social Feeds Master Toggle</div>
              <div className="text-slate-400 text-[11px]">Globally enable or disable public-facing social feeds across all portals.</div>
            </div>

            <button
              onClick={() => setSettings({ ...settings, publicFeedsEnabled: !settings.publicFeedsEnabled })}
              className={`p-1.5 rounded-lg cursor-pointer transition-all ${settings.publicFeedsEnabled ? 'text-emerald-400' : 'text-slate-500'}`}
            >
              {settings.publicFeedsEnabled ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-[var(--border-level-1)]">
            <div>
              <div className="font-bold text-white">Display Engagement Figures</div>
              <div className="text-slate-400 text-[11px]">Show like and comment counts on public feed cards when available.</div>
            </div>

            <button
              onClick={() => setSettings({ ...settings, showEngagementMetrics: !settings.showEngagementMetrics })}
              className={`p-1.5 rounded-lg cursor-pointer transition-all ${settings.showEngagementMetrics ? 'text-emerald-400' : 'text-slate-500'}`}
            >
              {settings.showEngagementMetrics ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Background Sync Interval (Minutes)</label>
              <input
                type="number"
                value={settings.syncIntervalMinutes}
                onChange={e => setSettings({ ...settings, syncIntervalMinutes: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Data Retention Period (Days)</label>
              <input
                type="number"
                value={settings.dataRetentionDays}
                onChange={e => setSettings({ ...settings, dataRetentionDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
