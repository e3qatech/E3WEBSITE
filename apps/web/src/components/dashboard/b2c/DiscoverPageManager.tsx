"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, CheckCircle2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";

type DiscoverSettings = {
  hero: {
    titleEn: string;
    titleAr: string;
    subtitleEn: string;
    subtitleAr: string;
    mediaType: string;
    mediaUrl: string;
  };
  heritage: {
    title: string;
    description: string;
    vision: string;
    mission: string;
    values: string;
  };
  team: Array<{
    name: string;
    role: string;
    desc: string;
  }>;
  careers: {
    title: string;
    description: string;
    nlpText: string;
  };
};

export function DiscoverPageManager() {
  const [activeTab, setActiveTab] = useState<"HERO" | "HERITAGE" | "TEAM" | "CAREERS">("HERO");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [settings, setSettings] = useState<DiscoverSettings | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/b2c/discover-settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to load discover settings", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSettings({
          ...settings,
          hero: { ...settings.hero, mediaUrl: data.url }
        });
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/b2c/discover-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving settings", error);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTeamMember = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      team: [...settings.team, { name: "", role: "", desc: "" }]
    });
  };

  const handleRemoveTeamMember = (index: number) => {
    if (!settings) return;
    const newTeam = [...settings.team];
    newTeam.splice(index, 1);
    setSettings({ ...settings, team: newTeam });
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    if (!settings) return;
    const newTeam = [...settings.team];
    newTeam[index] = { ...newTeam[index], [field]: value };
    setSettings({ ...settings, team: newTeam });
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>;
  }

  if (!settings) return <div className="p-8 text-zinc-500">Failed to load settings.</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Discover Page Settings</h1>
          <p className="text-[var(--text-secondary)]">Manage the content, background, and features of the B2C Discover Page.</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving} className="shrink-0 flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-b border-[var(--border-default)]">
        {(["HERO", "HERITAGE", "TEAM", "CAREERS"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${activeTab === tab ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-400 hover:text-white"}`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()} Settings
          </button>
        ))}
      </div>

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Settings saved successfully!
        </div>
      )}

      {/* HERO TAB */}
      {activeTab === "HERO" && (
        <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-primary)]">Title (English)</label>
              <input
                type="text"
                value={settings.hero.titleEn}
                onChange={e => setSettings({ ...settings, hero: { ...settings.hero, titleEn: e.target.value } })}
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-primary)]">Title (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                value={settings.hero.titleAr}
                onChange={e => setSettings({ ...settings, hero: { ...settings.hero, titleAr: e.target.value } })}
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-primary)]">Subtitle (English)</label>
              <textarea
                value={settings.hero.subtitleEn}
                onChange={e => setSettings({ ...settings, hero: { ...settings.hero, subtitleEn: e.target.value } })}
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white resize-none h-24"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-primary)]">Subtitle (Arabic)</label>
              <textarea
                dir="rtl"
                value={settings.hero.subtitleAr}
                onChange={e => setSettings({ ...settings, hero: { ...settings.hero, subtitleAr: e.target.value } })}
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white resize-none h-24"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-primary)]">Background Media Type</label>
              <select
                value={settings.hero.mediaType}
                onChange={e => setSettings({ ...settings, hero: { ...settings.hero, mediaType: e.target.value } })}
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white"
              >
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="ORBS">Cosmic Orbs (Default)</option>
                <option value="IFRAME">External iFrame</option>
                <option value="3D_MODEL">3D Model (.glb / .gltf)</option>
              </select>
            </div>
            {settings.hero.mediaType !== "ORBS" && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-primary)]">
                  {settings.hero.mediaType === "IFRAME" ? "iFrame Code / URL" : "Media URL"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.hero.mediaUrl}
                    onChange={e => setSettings({ ...settings, hero: { ...settings.hero, mediaUrl: e.target.value } })}
                    className="flex-1 px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white"
                    placeholder={settings.hero.mediaType === "IFRAME" ? "<iframe src='...' /> or URL" : "URL"}
                  />
                  {settings.hero.mediaType !== "IFRAME" && (
                    <label className="shrink-0 flex items-center justify-center px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl cursor-pointer transition-colors relative">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span className="ml-2 font-bold text-sm">Upload</span>
                      <input 
                        type="file" 
                        accept={settings.hero.mediaType === "3D_MODEL" ? ".glb,.gltf" : "image/*,video/*"} 
                        className="hidden" 
                        onChange={handleFileUpload} 
                        disabled={uploading} 
                      />
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HERITAGE TAB */}
      {activeTab === "HERITAGE" && (
        <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--text-primary)]">Heritage Title</label>
            <input
              type="text"
              value={settings.heritage.title}
              onChange={e => setSettings({ ...settings, heritage: { ...settings.heritage, title: e.target.value } })}
              className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--text-primary)]">Heritage Description</label>
            <textarea
              value={settings.heritage.description}
              onChange={e => setSettings({ ...settings, heritage: { ...settings.heritage, description: e.target.value } })}
              className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white resize-none h-24"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-primary)]">Vision</label>
              <textarea
                value={settings.heritage.vision}
                onChange={e => setSettings({ ...settings, heritage: { ...settings.heritage, vision: e.target.value } })}
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white resize-none h-24"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-primary)]">Mission</label>
              <textarea
                value={settings.heritage.mission}
                onChange={e => setSettings({ ...settings, heritage: { ...settings.heritage, mission: e.target.value } })}
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white resize-none h-24"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-primary)]">Values</label>
              <textarea
                value={settings.heritage.values}
                onChange={e => setSettings({ ...settings, heritage: { ...settings.heritage, values: e.target.value } })}
                className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white resize-none h-24"
              />
            </div>
          </div>
        </div>
      )}

      {/* TEAM TAB */}
      {activeTab === "TEAM" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-end">
            <Button onClick={handleAddTeamMember}>
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </div>
          {settings.team.map((member, idx) => (
            <div key={idx} className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-6 relative">
              <button 
                onClick={() => handleRemoveTeamMember(idx)}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pr-12">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-primary)]">Name</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={e => updateTeamMember(idx, "name", e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-primary)]">Role</label>
                  <input
                    type="text"
                    value={member.role}
                    onChange={e => updateTeamMember(idx, "role", e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2 md:col-span-1">
                  <label className="text-sm font-bold text-[var(--text-primary)]">Description</label>
                  <input
                    type="text"
                    value={member.desc}
                    onChange={e => updateTeamMember(idx, "desc", e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white"
                  />
                </div>
              </div>
            </div>
          ))}
          {settings.team.length === 0 && (
            <p className="text-center text-zinc-500 py-8">No team members added.</p>
          )}
        </div>
      )}

      {/* CAREERS TAB */}
      {activeTab === "CAREERS" && (
        <div className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--text-primary)]">Careers Section Title</label>
            <input
              type="text"
              value={settings.careers.title}
              onChange={e => setSettings({ ...settings, careers: { ...settings.careers, title: e.target.value } })}
              className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--text-primary)]">Careers Description / Vacancies</label>
            <textarea
              value={settings.careers.description}
              onChange={e => setSettings({ ...settings, careers: { ...settings.careers, description: e.target.value } })}
              className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white resize-none h-24"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--text-primary)]">NLP Extraction Text (Info Box)</label>
            <textarea
              value={settings.careers.nlpText}
              onChange={e => setSettings({ ...settings, careers: { ...settings.careers, nlpText: e.target.value } })}
              className="w-full px-4 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-default)] text-white resize-none h-24"
            />
          </div>
        </div>
      )}
    </div>
  );
}
