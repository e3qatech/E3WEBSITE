"use client";

import React, { useState } from "react";
import { Sparkles, Save, ShieldAlert, CheckCircle2, AlertTriangle, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ExperienceCampaignPayload, DEFAULT_EXPERIENCE_CAMPAIGN } from "@/types/experience-composer";

export function ExperienceComposerView({ initialCampaign }: { initialCampaign?: ExperienceCampaignPayload }) {
  const [campaign, setCampaign] = useState<ExperienceCampaignPayload>(initialCampaign || DEFAULT_EXPERIENCE_CAMPAIGN);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings/experience-composer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...campaign, updatedAt: new Date().toISOString() }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save campaign");

      setMessage({ type: "success", text: "Campaign takeover & experience settings published!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save campaign settings." });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEmergency = async () => {
    const nextState = !campaign.emergencyDisable;
    if (nextState && !confirm("Emergency Disable All Campaign Takeovers? This will instantly revert all public pages to default time/weather mode.")) return;

    const updated = { ...campaign, emergencyDisable: nextState };
    setCampaign(updated);

    try {
      await fetch("/api/settings/experience-composer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      alert(nextState ? "EMERGENCY KILL-SWITCH ACTIVATED: Takeovers Disabled" : "Campaign Takeovers Restored");
    } catch (_e) {}
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-surface-default border border-border-default shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Experience Composer CMS</h2>
            <p className="text-xs text-text-secondary">
              Manage live campaign takeovers, atmospheric overrides, 3D scene presets, and emergency controls.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleToggleEmergency}
          className={campaign.emergencyDisable ? "bg-red-500/20 text-red-400 border-red-500/30" : "text-amber-400 border-amber-500/30"}
        >
          <ShieldAlert className="w-4 h-4 me-2" />
          {campaign.emergencyDisable ? "Kill-Switch Active (Disabled)" : "Emergency Disable All"}
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          {message.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-default border border-border-default rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary">Internal Campaign Name *</label>
            <input
              required
              type="text"
              value={campaign.internalName}
              onChange={(e) => setCampaign({ ...campaign, internalName: e.target.value })}
              className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary">Priority Level *</label>
            <select
              value={campaign.priority}
              onChange={(e) => setCampaign({ ...campaign, priority: e.target.value as any })}
              className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm"
            >
              <option value="EMERGENCY">EMERGENCY (highest)</option>
              <option value="CAMPAIGN">CAMPAIGN (featured)</option>
              <option value="SCHEDULED">SCHEDULED (timed)</option>
              <option value="WEATHER">WEATHER (atmospheric override)</option>
              <option value="TIME">TIME (time-of-day)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary">English Campaign Title</label>
            <input
              type="text"
              value={campaign.titleEn}
              onChange={(e) => setCampaign({ ...campaign, titleEn: e.target.value })}
              className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary">Arabic Campaign Title</label>
            <input
              type="text"
              value={campaign.titleAr}
              onChange={(e) => setCampaign({ ...campaign, titleAr: e.target.value })}
              className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary">3D Scene Preset</label>
            <select
              value={campaign.scenePreset}
              onChange={(e) => setCampaign({ ...campaign, scenePreset: e.target.value as any })}
              className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm"
            >
              <option value="LEGO_MODULAR">LEGO® Modular Bricks</option>
              <option value="CYBER_GRID">Cyber Grid Architecture</option>
              <option value="KINETIC_LIGHTS">Kinetic Stage Lighting</option>
              <option value="DEFAULT">Default Atmospheric World</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary">Weather Blend Mode</label>
            <select
              value={campaign.weatherBlendMode}
              onChange={(e) => setCampaign({ ...campaign, weatherBlendMode: e.target.value as any })}
              className="w-full px-3 py-2 bg-surface-hover border border-border-default rounded-lg text-sm"
            >
              <option value="BLEND">Blend with Live Doha Weather</option>
              <option value="OVERRIDE">Override Doha Weather</option>
              <option value="DISABLE_WEATHER">Disable Weather Particles</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-border-default flex justify-end gap-3">
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="w-4 h-4" />
            {loading ? "Publishing..." : "Publish Campaign Takeover"}
          </Button>
        </div>
      </form>
    </div>
  );
}
