"use client";

import React from 'react';
import { 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  ShieldCheck, 
  Layers
} from 'lucide-react';

interface SyncAutomationTabProps {
  syncJobs: any[];
  accounts: any[];
  onRunSync: (accountId?: string) => void;
  syncing: boolean;
}

export function SyncAutomationTab({
  syncJobs,
  accounts,
  onRunSync,
  syncing,
}: SyncAutomationTabProps) {
  return (
    <div className="space-y-6">
      {/* Sync Control Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-pink-950/40 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Automated Vercel Cron Synchronization</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Background sync runs every 30 minutes via <code>/api/cron/social-sync</code>. Account-level locking prevents job collisions.
          </p>
        </div>

        <button
          onClick={() => onRunSync()}
          disabled={syncing}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing All Accounts...' : 'Run Global Sync Now'}</span>
        </button>
      </div>

      {/* Sync History Table */}
      <div className="rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] overflow-x-auto">
        <div className="p-4 border-b border-[var(--border-level-1)] font-bold text-xs text-white">
          Recent Synchronization Execution History
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 border-b border-[var(--border-level-1)] text-slate-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3">Job ID</th>
              <th className="p-3">Provider</th>
              <th className="p-3">Trigger Type</th>
              <th className="p-3">Records Created / Updated</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Status</th>
              <th className="p-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-level-1)]">
            {syncJobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No sync job executions recorded yet.
                </td>
              </tr>
            ) : (
              syncJobs.map(job => (
                <tr key={job.id} className="hover:bg-slate-950/30 font-mono text-[11px]">
                  <td className="p-3 font-bold text-purple-300">{job.id.substring(0, 12)}...</td>
                  <td className="p-3 font-bold text-white">{job.provider}</td>
                  <td className="p-3 text-slate-400">{job.triggerType}</td>
                  <td className="p-3 text-emerald-400">+{job.recordsCreated || 0} new, {job.recordsUpdated || 0} updated</td>
                  <td className="p-3 text-slate-400">{job.durationMs ? `${job.durationMs}ms` : 'In progress'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      job.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{new Date(job.startTime).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
