"use client";

import { useState } from "react";
import { Save, CheckCircle2, Globe, FileJson, Search, ExternalLink, RefreshCw } from "lucide-react";
import { AdminFormLayout } from "../ui/AdminFormLayout";
import { AdminButton } from "../ui/AdminButton";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardStickyActions,
  DashboardUnsavedChangesGuard,
  EditorSectionItem,
} from "@/components/dashboard/ui";

const SECTIONS: EditorSectionItem[] = [
  { id: "meta", label: "1. Global Meta Tags" },
  { id: "analytics", label: "2. Google Tracking & GTM" },
  { id: "robots", label: "3. Robots & Sitemap" },
  { id: "llm", label: "4. LLMs.txt AI Context" },
  { id: "jsonld", label: "5. JSON-LD Schema" },
];

export function SeoSettingsView({ initialSettings }: { initialSettings: Record<string, any> }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("meta");
  const [generatingSitemap, setGeneratingSitemap] = useState(false);
  const { toast } = useToast();

  const [data, setData] = useState({
    metaTitleEn: initialSettings.metaTitleEn || "E3 - Event Engineering & Immersive Attractions",
    metaTitleAr: initialSettings.metaTitleAr || "إي ثري - خبراء هندسة الفعاليات والترفيه",
    metaDescriptionEn: initialSettings.metaDescriptionEn || "Qatar's premier event engineering, technical production, and kinetic entertainment worlds.",
    metaDescriptionAr: initialSettings.metaDescriptionAr || "تجارب ترفيهية غامرة، هندسة فعاليات، ومدن ألعاب فضائية في قطر.",
    googleAnalyticsId: initialSettings.googleAnalyticsId || "G-E3QATAR2026",
    tagManagerId: initialSettings.tagManagerId || "GTM-E3QATAR",
    robotsTxt: initialSettings.robotsTxt || "User-agent: *\nAllow: /\nDisallow: /dashboard/\nDisallow: /api/\nSitemap: https://e3.qa/api/sitemap/generate",
    llmsTxt: initialSettings.llmsTxt || "# E3 Qatar Documentation\n> Qatar's premier event engineering, spatial production, and kinetic entertainment worlds.\n\n## Public Portals\n- B2C Entertainment Worlds: https://e3.qa/en/b2c\n- Attractions & Theme Parks: https://e3.qa/en/b2c/attractions",
    jsonLdOrganization: initialSettings.jsonLdOrganization || JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "E3 Qatar",
      "url": "https://e3.qa",
      "logo": "https://e3.qa/logo.png",
      "sameAs": ["https://instagram.com/e3qatar", "https://linkedin.com/company/e3qatar"]
    }, null, 2)
  });

  const handleChange = (field: string, value: string) => {
    setIsDirty(true);
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promises = Object.entries(data).map(([key, value]) =>
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value, type: "SEO" })
        })
      );
      await Promise.all(promises);
      setIsDirty(false);
      setLastSaved(new Date());
      toast("SEO & Analytics settings saved successfully.", "success");
    } catch (error) {
      console.error("Failed to save settings", error);
      toast("Failed to save SEO settings.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSitemap = async () => {
    setGeneratingSitemap(true);
    try {
      const res = await fetch("/api/sitemap/generate");
      if (!res.ok) throw new Error("Sitemap generation failed");
      toast("Sitemap re-indexed and generated successfully!", "success");
      window.open("/api/sitemap/generate", "_blank");
    } catch (err: any) {
      toast(err?.message || "Failed to generate sitemap", "error");
    } finally {
      setGeneratingSitemap(false);
    }
  };

  return (
    <DashboardPageShell variant="focused">
      <DashboardUnsavedChangesGuard isDirty={isDirty} />

      <DashboardPageHeader
        title="SEO, Meta Tags & Search Indexing"
        description="Configure search engine visibility, Google Analytics, GTM tracking, robots.txt, and AI crawler documentation (/settings/seo)."
        breadcrumbs={[
          { label: "Settings", href: "/dashboard/settings/general" },
          { label: "SEO & Indexing" },
        ]}
        badge={{ label: "Platform SEO", variant: "cyan" }}
        isUnsaved={isDirty}
        lastSavedAt={lastSaved || undefined}
        primaryAction={{
          label: isSaving ? "Saving..." : "Save SEO Config",
          onClick: handleSave,
          isLoading: isSaving,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeSectionId}
        onSectionChange={setActiveSectionId}
      />

      <AdminFormLayout>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: GLOBAL META & TRACKING */}
          <div className="space-y-6">
            {/* META TAGS */}
            <div className="bg-surface-default border border-border-default rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border-default pb-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Global Meta Titles & Descriptions</h2>
                  <p className="text-xs text-text-secondary">Default metadata rendered across search engine results.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Meta Title (English)</label>
                  <input
                    type="text"
                    value={data.metaTitleEn}
                    onChange={(e) => handleChange("metaTitleEn", e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Meta Title (Arabic)</label>
                  <input
                    type="text"
                    value={data.metaTitleAr}
                    onChange={(e) => handleChange("metaTitleAr", e.target.value)}
                    dir="rtl"
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Meta Description (English)</label>
                  <textarea
                    value={data.metaDescriptionEn}
                    onChange={(e) => handleChange("metaDescriptionEn", e.target.value)}
                    className="w-full h-24 bg-surface-hover border border-border-default rounded-xl p-3 text-sm text-text-primary focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Meta Description (Arabic)</label>
                  <textarea
                    value={data.metaDescriptionAr}
                    onChange={(e) => handleChange("metaDescriptionAr", e.target.value)}
                    dir="rtl"
                    className="w-full h-24 bg-surface-hover border border-border-default rounded-xl p-3 text-sm text-text-primary focus:border-emerald-500 focus:outline-none resize-none text-right"
                  />
                </div>
              </div>
            </div>

            {/* TRACKING IDS */}
            <div className="bg-surface-default border border-border-default rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border-default pb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Analytics & Telemetry Tracking</h2>
                  <p className="text-xs text-text-secondary">Google Analytics 4 & Google Tag Manager measurement IDs.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">GA4 Measurement ID</label>
                  <input
                    type="text"
                    value={data.googleAnalyticsId}
                    onChange={(e) => handleChange("googleAnalyticsId", e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-xs text-text-primary font-mono focus:border-emerald-500 focus:outline-none"
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">Google Tag Manager ID</label>
                  <input
                    type="text"
                    value={data.tagManagerId}
                    onChange={(e) => handleChange("tagManagerId", e.target.value)}
                    className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-xs text-text-primary font-mono focus:border-emerald-500 focus:outline-none"
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ADVANCED SEO & CRAWLER CONFIG */}
          <div className="space-y-6">
            <div className="bg-surface-default border border-border-default rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border-default pb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Crawler Indexing & AI Docs</h2>
                  <p className="text-xs text-text-secondary">Manage robots.txt, llms.txt, and JSON-LD Organization schema.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Robots.txt Rules</label>
                    <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1">
                      View Live <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <textarea
                    value={data.robotsTxt}
                    onChange={(e) => handleChange("robotsTxt", e.target.value)}
                    className="w-full h-28 bg-zinc-950 text-emerald-400 border border-border-default rounded-xl p-3 text-xs font-mono resize-none focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">LLMs.txt (AI Crawlers & Knowledge Index)</label>
                    <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-sky-400 hover:underline flex items-center gap-1">
                      View Live <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <textarea
                    value={data.llmsTxt}
                    onChange={(e) => handleChange("llmsTxt", e.target.value)}
                    className="w-full h-28 bg-zinc-950 text-sky-400 border border-border-default rounded-xl p-3 text-xs font-mono resize-none focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">JSON-LD Organization Schema</label>
                  <textarea
                    value={data.jsonLdOrganization}
                    onChange={(e) => handleChange("jsonLdOrganization", e.target.value)}
                    className="w-full h-28 bg-zinc-950 text-amber-400 border border-border-default rounded-xl p-3 text-xs font-mono resize-none focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 border-t border-border-default">
                  <AdminButton
                    variant="outline"
                    onClick={handleGenerateSitemap}
                    disabled={generatingSitemap}
                    className="w-full justify-center text-xs font-bold gap-2 py-3"
                  >
                    <RefreshCw className={`w-4 h-4 ${generatingSitemap ? "animate-spin" : ""}`} />
                    {generatingSitemap ? "Generating XML Sitemap..." : "Generate XML Sitemap & Re-Index Routes Now"}
                  </AdminButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminFormLayout>

      <DashboardStickyActions
        onSave={handleSave}
        isSaving={isSaving}
        isUnsaved={isDirty}
        onDiscard={() => {
          if (confirm("Discard unsaved changes?")) {
            window.location.reload();
          }
        }}
      />
    </DashboardPageShell>
  );
}
