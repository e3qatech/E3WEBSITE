"use client";

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2,
  Play
} from 'lucide-react';
import { useToast } from '@/components/dashboard/ui/ToastProvider';

interface AccountsTabProps {
  accounts: any[];
  providers: any[];
  onRefresh: () => void;
  onRunSync: (accountId?: string) => void;
  syncing: boolean;
}

export function AccountsTab({
  accounts,
  providers,
  onRefresh,
  onRunSync,
  syncing,
}: AccountsTabProps) {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('META_INSTAGRAM');
  const [internalName, setInternalName] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, _setDisplayName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleOAuthConnect = (providerKey: string) => {
    window.location.href = `/api/admin/social-media/oauth/connect?provider=${providerKey}`;
  };

  const handleCreateManualAccount = async () => {
    if (!username) {
      toast('Username is required.', 'error');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/social-media/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          internalName: internalName || `${selectedProvider}: @${username}`,
          username,
          displayName: displayName || username,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create account.');
      }

      toast(`Connected account @${username} successfully`, 'success');
      setShowAddModal(false);
      setUsername('');
      setInternalName('');
      onRefresh();
    } catch (err: any) {
      toast(err.message || 'Error creating account', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAccount = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to disconnect ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/social-media/accounts?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast(`Disconnected ${name}`, 'success');
        onRefresh();
      }
    } catch (_e) {
      toast('Failed to disconnect account', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)]">
        <div>
          <h3 className="text-sm font-black text-[var(--text-primary)]">Connected Social Accounts</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Manage OAuth connections and account-level feed assignments.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Account</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      {accounts.length === 0 ? (
        <div className="text-center py-12 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-level-1)] space-y-3">
          <Users className="w-10 h-10 mx-auto text-slate-500" />
          <p className="text-sm font-bold text-slate-300">No social accounts connected</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Connect official Instagram, Facebook, TikTok, YouTube or LinkedIn accounts to sync feeds.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
          >
            Connect First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(acc => (
            <div key={acc.id} className="p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/30">
                    {acc.provider}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    acc.status === 'HEALTHY' || acc.status === 'CONNECTED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                  }`}>
                    {acc.status}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={acc.profileImageUrl || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=200&auto=format&fit=crop'}
                    alt={acc.internalName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/40"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{acc.internalName}</h4>
                    <p className="text-[11px] text-slate-400">@{acc.username}</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 text-[11px] text-slate-400 border-t border-[var(--border-level-1)]">
                  <div className="flex justify-between">
                    <span>Imported Posts:</span>
                    <span className="font-bold text-white">{acc._count?.posts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto-Sync:</span>
                    <span className={acc.autoSyncEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {acc.autoSyncEnabled ? 'Enabled' : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-level-1)] gap-2">
                <button
                  onClick={() => onRunSync(acc.id)}
                  disabled={syncing}
                  className="flex-1 py-1.5 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  <span>Sync Now</span>
                </button>

                <button
                  onClick={() => handleDeleteAccount(acc.id, acc.internalName)}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-base font-black text-white">Connect Social Account</h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Select Platform</label>
                <select
                  value={selectedProvider}
                  onChange={e => setSelectedProvider(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="META_INSTAGRAM">Meta Instagram</option>
                  <option value="META_FACEBOOK">Meta Facebook Page</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="MANUAL">Manual / Custom Account</option>
                </select>
                {selectedProvider !== 'MANUAL' && (
                  <p className="text-[11px] mt-1">
                    {providers.find((p: any) => p.provider === selectedProvider)?.appId ? (
                      <span className="text-emerald-400 font-medium">✓ Platform API credentials are configured</span>
                    ) : (
                      <span className="text-amber-400">⚠️ API credentials not set (Configure in Platforms tab for live OAuth)</span>
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Public Username / Handle</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. e3qatar"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Internal Display Name</label>
                <input
                  type="text"
                  value={internalName}
                  onChange={e => setInternalName(e.target.value)}
                  placeholder="e.g. E3 Qatar Official Channel"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {selectedProvider !== 'MANUAL' && (
                <button
                  onClick={() => handleOAuthConnect(selectedProvider)}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Connect via OAuth
                </button>
              )}

              <button
                onClick={handleCreateManualAccount}
                disabled={creating}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {creating ? 'Saving...' : 'Save Record'}
              </button>

              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-2.5 bg-slate-950 text-slate-400 hover:text-white text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
