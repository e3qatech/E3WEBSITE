"use client";

import React from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  PlusCircle, 
  RefreshCw, 
  ShieldAlert, 
  Zap, 
  Share2,
  FilePlus,
  ExternalLink
} from 'lucide-react';

interface OverviewTabProps {
  accounts: any[];
  providers: any[];
  feeds: any[];
  postsCount: number;
  syncJobs: any[];
  onNavigateTab: (tab: string) => void;
  onRunSync: () => void;
  syncing: boolean;
}

export function OverviewTab({
  accounts,
  providers,
  feeds,
  postsCount,
  syncJobs,
  onNavigateTab,
  onRunSync,
  syncing,
}: OverviewTabProps) {
  const healthyCount = accounts.filter(a => a.status === 'HEALTHY' || a.status === 'CONNECTED').length;
  const errorCount = accounts.filter(a => a.status === 'ERROR' || a.status === 'ACTION_REQUIRED').length;
  const activeFeedsCount = feeds.filter(f => f.isActive).length;
  const lastSync = syncJobs[0];

  return (
    <div className="space-y-8">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">
            <span>Connected Platforms</span>
            <Share2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)]">{providers.filter(p => p.enabled).length} / {providers.length}</div>
          <p className="text-xs text-emerald-400 font-medium">All active platform APIs active</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">
            <span>Connected Accounts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)]">{accounts.length}</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400 font-semibold">{healthyCount} Healthy</span>
            {errorCount > 0 && <span className="text-rose-400 font-semibold">• {errorCount} Action Required</span>}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">
            <span>Active Feeds</span>
            <Layers className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)]">{activeFeedsCount}</div>
          <p className="text-xs text-[var(--text-secondary)]">Serving website placements</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">
            <span>Normalized Posts</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-[var(--text-primary)]">{postsCount}</div>
          <p className="text-xs text-[var(--text-secondary)]">Stored in PostgreSQL cache</p>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-pink-950/40 border border-purple-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />
            <span>Quick Operations & Actions</span>
          </div>
          {lastSync && (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Last Sync: {new Date(lastSync.startTime).toLocaleTimeString()} ({lastSync.status})</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('accounts')}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Connect Account</span>
          </button>

          <button
            onClick={() => onNavigateTab('feeds')}
            className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Create Feed</span>
          </button>

          <button
            onClick={() => onNavigateTab('manual')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Add Post by URL</span>
          </button>

          <button
            onClick={onRunSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing Now...' : 'Run Sync Now'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('health')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-purple-500/40 text-purple-300 hover:bg-purple-950/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Open Connection Health</span>
          </button>
        </div>
      </div>

      {/* Account Status Matrix & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Connected Accounts Overview</h3>
            <button
              onClick={() => onNavigateTab('accounts')}
              className="text-xs text-purple-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Manage Accounts</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-10 space-y-3 border border-dashed border-[var(--border-level-1)] rounded-xl">
              <Share2 className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-xs text-[var(--text-secondary)]">No social accounts connected yet.</p>
              <button
                onClick={() => onNavigateTab('accounts')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold"
              >
                Connect Your First Account
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border-level-1)] bg-slate-950/30">
                  <div className="flex items-center gap-3">
                    <img
                      src={acc.profileImageUrl || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=200&auto=format&fit=crop'}
                      alt={acc.internalName}
                      className="w-9 h-9 rounded-full object-cover border border-purple-500/30"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{acc.internalName}</div>
                      <div className="text-[11px] text-slate-400">@{acc.username} • {acc.provider}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      acc.status === 'HEALTHY' || acc.status === 'CONNECTED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                    }`}>
                      {acc.status}
                    </span>
                    <span className="text-[11px] text-slate-400">{acc._count?.posts || 0} posts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sync Jobs Feed */}
        <div className="p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Recent Sync Activity</h3>
          
          {syncJobs.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] py-6 text-center">No recent sync history.</p>
          ) : (
            <div className="space-y-3">
              {syncJobs.slice(0, 5).map(job => (
                <div key={job.id} className="p-3 rounded-xl border border-[var(--border-level-1)] bg-slate-950/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{job.provider} ({job.triggerType})</span>
                    <span className={`font-bold ${job.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>+{job.recordsCreated || 0} new, {job.recordsUpdated || 0} updated</span>
                    <span>{new Date(job.startTime).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
