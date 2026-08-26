"use client";

import React from "react";
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Activity,
  History,
} from "lucide-react";
import { DashboardSectionCard } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

interface SyncAutomationTabProps {
  syncJobs: any[];
  accounts: any[];
  onRunSync: (accountId?: string) => void;
  syncing: boolean;
}

export function SyncAutomationTab({
  syncJobs,
  accounts = [],
  onRunSync,
  syncing,
}: SyncAutomationTabProps) {
  const lastJob = syncJobs[0];

  return (
    <div className="space-y-6">
      {/* 1. Sync Control & Architecture Overview */}
      <DashboardSectionCard
        title="Automated Synchronization Engine"
        description="Cron-based automated polling, account-level lock coordination, and on-demand synchronization across all social channels."
        icon={<Clock className="w-5 h-5 text-purple-400" />}
      >
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[var(--surface-subtle)] to-indigo-950/40 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-sm font-black text-[var(--text-primary)]">
                  Vercel Serverless Cron Architecture Active
                </h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Background worker triggers automated refresh sweeps every 30 minutes via{" "}
                <code className="px-1.5 py-0.5 rounded-md bg-neutral-900 text-purple-300 font-mono text-[11px] border border-neutral-800">
                  /api/cron/social-sync
                </code>
                . Distributed Redis locks prevent concurrent account collision.
              </p>
            </div>

            <button
              onClick={() => onRunSync()}
              disabled={syncing}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-purple-900/30 disabled:opacity-50 cursor-pointer shrink-0 transition-all active:scale-[0.98]"
            >
              <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
              <span>{syncing ? "Executing Global Sync..." : "Run Global Sync Now"}</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-tertiary)] flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-400" />
                Interval
              </span>
              <p className="text-sm font-black text-[var(--text-primary)]">Every 30 Mins</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-tertiary)] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Collision Guard
              </span>
              <p className="text-sm font-black text-emerald-400">Locking Active</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-tertiary)] flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Active Accounts
              </span>
              <p className="text-sm font-black text-[var(--text-primary)]">{accounts.length} Channels</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-tertiary)] flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                Last Job Status
              </span>
              <p className="text-sm font-black text-purple-300">
                {lastJob ? lastJob.status : "Ready for Run"}
              </p>
            </div>
          </div>
        </div>
      </DashboardSectionCard>

      {/* 2. Sync Execution History Table */}
      <DashboardSectionCard
        title="Recent Synchronization Execution History"
        description="Comprehensive audit log of automated and manual synchronization triggers, item update deltas, and run durations."
        icon={<History className="w-5 h-5 text-indigo-400" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-hover)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5 font-bold">Job ID</th>
                <th className="px-4 py-3.5 font-bold">Provider / Channel</th>
                <th className="px-4 py-3.5 font-bold">Trigger Type</th>
                <th className="px-4 py-3.5 font-bold">Record Delta</th>
                <th className="px-4 py-3.5 font-bold">Duration</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-4 py-3.5 font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)] font-mono">
              {syncJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--text-tertiary)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Clock className="w-8 h-8 opacity-30 text-purple-400" />
                      <p className="text-xs font-bold text-[var(--text-secondary)]">
                        No synchronization execution runs recorded yet
                      </p>
                      <p className="text-[11px] text-[var(--text-tertiary)]">
                        Click "Run Global Sync Now" above or wait for the next scheduled 30-minute cron cycle.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                syncJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[var(--surface-hover)]/40 transition-colors text-[11px]">
                    <td className="px-4 py-3 font-bold text-purple-400">
                      {job.id.substring(0, 12)}...
                    </td>
                    <td className="px-4 py-3 font-bold text-[var(--text-primary)]">
                      {job.provider || "Global Sweep"}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--surface-subtle)] border border-[var(--border-default)] text-[10px] font-bold">
                        {job.triggerType || "SCHEDULED"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">
                      +{job.recordsCreated || 0} new, {job.recordsUpdated || 0} updated
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {job.durationMs ? `${job.durationMs}ms` : "In progress"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1",
                          job.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        )}
                      >
                        {job.status === "SUCCESS" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : null}
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-tertiary)]">
                      {new Date(job.startTime).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardSectionCard>
    </div>
  );
}
