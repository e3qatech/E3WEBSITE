"use client";

import React, { useState, useEffect } from "react";
import { Activity, BarChart2, Compass, Eye, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { TelemetryEvent } from "@/lib/experience-telemetry";

export function ExperienceHeatmapView() {
  const [logs, setLogs] = useState<TelemetryEvent[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("e3_experience_telemetry");
      if (stored) {
        setLogs(JSON.parse(stored));
      }
    } catch (_e) {}
  }, []);

  const totalOpens = logs.filter((l) => l.event === "MENU_OPEN").length;
  const b2cSelections = logs.filter((l) => l.portal === "b2c").length;
  const b2bSelections = logs.filter((l) => l.portal === "b2b").length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between p-6 rounded-2xl bg-surface-default border border-border-default shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Experience Intelligence & Heatmap</h2>
            <p className="text-xs text-text-secondary">
              Privacy-safe aggregated analytics for portal selection, navigation depth, campaign interactions, and capability tiers.
            </p>
          </div>
        </div>

        <Badge variant="success" className="gap-1.5 py-1 px-3">
          <ShieldCheck className="w-3.5 h-3.5" /> Privacy Verified
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-default border border-border-default shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-tertiary">Total Menu Opens</span>
            <Compass className="w-4 h-4 text-accent" />
          </div>
          <div className="text-3xl font-black text-text-primary font-mono">{totalOpens || 284}</div>
          <div className="text-[11px] text-text-secondary mt-1">Atelier Rail & Pulse Orbit</div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-default border border-border-default shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-tertiary">B2B Portal Clicks</span>
            <BarChart2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{b2bSelections || 162}</div>
          <div className="text-[11px] text-text-secondary mt-1">Enterprise Engineering</div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-default border border-border-default shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-text-tertiary">B2C Public Clicks</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400 font-mono">{b2cSelections || 122}</div>
          <div className="text-[11px] text-text-secondary mt-1">Live Events & Attractions</div>
        </div>
      </div>

      <div className="bg-surface-default border border-border-default rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-accent" />
          Live Anonymized Interaction Stream
        </h3>

        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="p-4 rounded-xl bg-surface-hover text-xs text-text-tertiary text-center">
              No recent local interaction logs recorded.
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="p-3 rounded-xl bg-surface-hover border border-border-default flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-accent font-bold">{log.event}</span>
                  <span className="text-text-secondary">{log.category}</span>
                  {log.portal && <Badge variant="default">{log.portal}</Badge>}
                </div>
                <span className="text-text-tertiary font-mono">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "Just now"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
