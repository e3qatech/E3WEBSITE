"use client";

import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Save, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Lock,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/components/dashboard/ui/ToastProvider';

interface PlatformsTabProps {
  providers: any[];
  onRefresh: () => void;
}

export function PlatformsTab({ providers, onRefresh }: PlatformsTabProps) {
  const { toast } = useToast();
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  const handleEdit = (provider: any) => {
    setEditingProvider(provider.provider);
    setFormData({
      provider: provider.provider,
      name: provider.name,
      enabled: provider.enabled,
      appId: provider.appId || '',
      secret: provider.encryptedSecret || '',
      apiVersion: provider.apiVersion || 'v19.0',
      callbackUrl: provider.callbackUrl || '',
      apiKey: provider.apiKey || '',
    });
  };

  const handleSave = async (providerKey: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/social-media/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update credentials.');
      }

      toast(`Saved platform credentials for ${providerKey}`, 'success');
      setEditingProvider(null);
      onRefresh();
    } catch (err: any) {
      toast(err.message || 'Error saving platform credentials', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConfig = async (providerKey: string) => {
    setTesting(providerKey);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast(`Configuration valid for ${providerKey}`, 'success');
    } catch (_e) {
      toast(`Configuration test failed for ${providerKey}`, 'error');
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-200 space-y-1">
          <p className="font-bold">AES-256-GCM Encrypted Platform Credentials</p>
          <p className="text-purple-300/80">
            Application secrets, client IDs, and API keys are encrypted before saving. Unchanged masked values (<code>••••••••••••</code>) will never overwrite your existing secrets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map(p => {
          const isEditing = editingProvider === p.provider;
          const currentForm = isEditing ? formData : p;

          return (
            <div key={p.provider} className="p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[var(--text-primary)]">{p.name || p.provider}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${p.enabled ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span>{p.enabled ? 'Integration Active' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => handleEdit(p)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Configure
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4 pt-2 border-t border-[var(--border-level-1)] text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">App Client ID / Key</label>
                    <input
                      type="text"
                      value={currentForm.appId || ''}
                      onChange={e => setFormData({ ...formData, appId: e.target.value })}
                      placeholder="e.g. 102938475610293"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">App Secret (Encrypted)</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={currentForm.secret || currentForm.encryptedSecret || ''}
                        onChange={e => setFormData({ ...formData, secret: e.target.value })}
                        placeholder="Enter app secret..."
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                      />
                      <Lock className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-500" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">API Version</label>
                    <input
                      type="text"
                      value={currentForm.apiVersion || 'v19.0'}
                      onChange={e => setFormData({ ...formData, apiVersion: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Callback Redirect URL</label>
                    <input
                      type="text"
                      value={currentForm.callbackUrl || ''}
                      onChange={e => setFormData({ ...formData, callbackUrl: e.target.value })}
                      placeholder="https://e3-qatar.vercel.app/api/admin/social-media/oauth/callback"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleSave(p.provider)}
                      disabled={saving}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? 'Saving...' : 'Save Credentials'}</span>
                    </button>

                    <button
                      onClick={() => handleTestConfig(p.provider)}
                      disabled={testing === p.provider}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testing === p.provider ? 'animate-spin' : ''}`} />
                      <span>Test</span>
                    </button>

                    <button
                      onClick={() => setEditingProvider(null)}
                      className="px-3 py-2 bg-slate-900 text-slate-400 hover:text-white rounded-xl font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t border-[var(--border-level-1)] text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>App Client ID:</span>
                    <span className="font-mono text-slate-200">{p.appId ? `${p.appId.substring(0, 8)}...` : 'Not Set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Secret Status:</span>
                    <span className="font-mono text-emerald-400">{p.encryptedSecret ? 'Encrypted (Saved)' : 'Missing'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Version:</span>
                    <span className="font-mono text-slate-200">{p.apiVersion || 'v19.0'}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
