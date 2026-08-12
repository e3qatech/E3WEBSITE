"use client";

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useToast } from '@/components/dashboard/ui/ToastProvider';

interface HealthDiagnosticsTabProps {
  accounts: any[];
  providers: any[];
  syncJobs: any[];
}

export function HealthDiagnosticsTab({ accounts, providers, syncJobs }: HealthDiagnosticsTabProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<string>('');

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/social-media/diagnostics');
      const json = await res.json();
      if (res.ok && json.success) {
        setDiagnosticReport(JSON.stringify(json.data, null, 2));
      }
    } catch (_e) {
      toast('Failed to generate diagnostic report', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyReport = () => {
    if (!diagnosticReport) return;
    navigator.clipboard.writeText(diagnosticReport);
    setCopied(true);
    toast('Sanitized diagnostic report copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Account Connection Status Grid */}
      <div className="p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-purple-400" />
          <span>Integration Connection Health Matrix</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {accounts.map(acc => (
            <div key={acc.id} className="p-4 rounded-xl bg-slate-950/60 border border-[var(--border-level-1)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{acc.internalName}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  acc.status === 'HEALTHY' || acc.status === 'CONNECTED'
                    ? 'bg-emerald-950 text-emerald-400'
                    : 'bg-rose-950 text-rose-400'
                }`}>
                  {acc.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Provider: {acc.provider} • @{acc.username}
              </div>
              <div className="text-[10px] text-slate-500">
                Last Successful Sync: {acc.lastSuccessfulSync ? new Date(acc.lastSuccessfulSync).toLocaleString() : 'Never'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sanitized Diagnostic Report Generator */}
      <div className="p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white">Sanitized Diagnostic Report Generator</h3>
            <p className="text-xs text-slate-400">Generate a safe troubleshooting report (secrets and tokens are masked).</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Generating...' : 'Generate Report'}</span>
            </button>

            {diagnosticReport && (
              <button
                onClick={handleCopyReport}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Sanitized Report'}</span>
              </button>
            )}
          </div>
        </div>

        {diagnosticReport && (
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-purple-300 font-mono overflow-x-auto max-h-96">
            {diagnosticReport}
          </pre>
        )}
      </div>
    </div>
  );
}
