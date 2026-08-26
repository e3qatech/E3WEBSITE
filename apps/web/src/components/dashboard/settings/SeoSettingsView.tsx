"use client";

import { useState } from "react";
import { Save, Globe, FileJson, Search, ExternalLink, RefreshCw } from "lucide-react";
import { AdminButton } from "../ui/AdminButton";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  DashboardSectionCard,
  DashboardStickyActions,
  DashboardUnsavedChangesGuard,
  EditorSectionItem,
} from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

const SECTIONS: EditorSectionItem[] = [
  { id: "meta", label: "1. Global Meta Tags", labelAr: "١. بيانات الميتا العامة" },
  { id: "analytics", label: "2. Google Tracking & GTM", labelAr: "٢. أدوات التتبع والتحليلات" },
  { id: "robots", label: "3. Robots & Sitemap", labelAr: "٣. ملف Robots وخريطة الموقع" },
  { id: "llm", label: "4. LLMs.txt AI Context", labelAr: "٤. ملف الذكاء الاصطناعي LLMs" },
  { id: "jsonld", label: "5. JSON-LD Schema", labelAr: "٥. البيانات المنظمة JSON-LD" },
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

      {/* 1. GLOBAL META TAGS */}
      <div id="meta" className={cn("space-y-6", activeSectionId === "meta" ? "block" : "hidden")}>
        <DashboardSectionCard
          title="1. Global Meta Titles & Descriptions"
          description="Default metadata rendered across search engine results and social preview cards."
          icon={<Globe className="w-5 h-5 text-blue-500" />}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">
                  Meta Title (English)
                </label>
                <input
                  type="text"
                  value={data.metaTitleEn}
                  onChange={(e) => handleChange("metaTitleEn", e.target.value)}
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">
                  Meta Title (Arabic)
                </label>
                <input
                  type="text"
                  value={data.metaTitleAr}
                  onChange={(e) => handleChange("metaTitleAr", e.target.value)}
                  dir="rtl"
                  className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary focus:border-emerald-500 focus:outline-none text-right font-arabic"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">
                  Meta Description (English)
                </label>
                <textarea
                  value={data.metaDescriptionEn}
                  onChange={(e) => handleChange("metaDescriptionEn", e.target.value)}
                  rows={3}
                  className="w-full bg-surface-hover border border-border-default rounded-xl p-4 text-sm text-text-primary focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">
                  Meta Description (Arabic)
                </label>
                <textarea
                  value={data.metaDescriptionAr}
                  onChange={(e) => handleChange("metaDescriptionAr", e.target.value)}
                  dir="rtl"
                  rows={3}
                  className="w-full bg-surface-hover border border-border-default rounded-xl p-4 text-sm text-text-primary focus:border-emerald-500 focus:outline-none resize-none text-right font-arabic leading-relaxed"
                />
              </div>
            </div>
          </div>
        </DashboardSectionCard>
      </div>

      {/* 2. GOOGLE TRACKING & GTM */}
      <div id="analytics" className={cn("space-y-6", activeSectionId === "analytics" ? "block" : "hidden")}>
        <DashboardSectionCard
          title="2. Analytics & Telemetry Tracking"
          description="Google Analytics 4 & Google Tag Manager measurement IDs injected across public routes."
          icon={<Search className="w-5 h-5 text-amber-500" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">
                GA4 Measurement ID
              </label>
              <input
                type="text"
                value={data.googleAnalyticsId}
                onChange={(e) => handleChange("googleAnalyticsId", e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary font-mono focus:border-emerald-500 focus:outline-none"
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">
                Google Tag Manager ID
              </label>
              <input
                type="text"
                value={data.tagManagerId}
                onChange={(e) => handleChange("tagManagerId", e.target.value)}
                className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary font-mono focus:border-emerald-500 focus:outline-none"
                placeholder="GTM-XXXXXXX"
              />
            </div>
          </div>
        </DashboardSectionCard>
      </div>

      {/* 3. ROBOTS & SITEMAP */}
      <div id="robots" className={cn("space-y-6", activeSectionId === "robots" ? "block" : "hidden")}>
        <DashboardSectionCard
          title="3. Robots.txt Rules & Search Engine Sitemap"
          description="Manage crawler directives, disallowed subtrees, and trigger on-demand dynamic XML sitemap generation."
          icon={<FileJson className="w-5 h-5 text-emerald-500" />}
        >
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Robots.txt Content
                </label>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>View Live File</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <textarea
                value={data.robotsTxt}
                onChange={(e) => handleChange("robotsTxt", e.target.value)}
                rows={6}
                className="w-full bg-zinc-950 text-emerald-400 border border-border-default rounded-xl p-4 text-xs font-mono resize-none focus:border-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-border-default flex items-center justify-between">
              <div className="text-xs text-text-secondary">
                <p className="font-bold text-text-primary">Dynamic XML Sitemap</p>
                <p>Generates real-time indexing records for all live B2C and B2B pages.</p>
              </div>
              <AdminButton
                variant="outline"
                onClick={handleGenerateSitemap}
                disabled={generatingSitemap}
                className="justify-center text-xs font-bold gap-2 px-5 py-2.5"
              >
                <RefreshCw className={`w-4 h-4 ${generatingSitemap ? "animate-spin" : ""}`} />
                <span>{generatingSitemap ? "Generating..." : "Generate & Test Sitemap"}</span>
              </AdminButton>
            </div>
          </div>
        </DashboardSectionCard>
      </div>

      {/* 4. LLMs.txt AI CONTEXT */}
      <div id="llm" className={cn("space-y-6", activeSectionId === "llm" ? "block" : "hidden")}>
        <DashboardSectionCard
          title="4. LLMs.txt (AI Crawlers & Knowledge Index)"
          description="Structured markdown knowledge context provided to modern AI search agents and LLM crawlers."
          icon={<FileJson className="w-5 h-5 text-sky-500" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                LLMs.txt Markdown Body
              </label>
              <a
                href="/llms.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1"
              >
                <span>View Live /llms.txt</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <textarea
              value={data.llmsTxt}
              onChange={(e) => handleChange("llmsTxt", e.target.value)}
              rows={10}
              className="w-full bg-zinc-950 text-sky-400 border border-border-default rounded-xl p-4 text-xs font-mono resize-none focus:border-sky-500 focus:outline-none leading-relaxed"
            />
          </div>
        </DashboardSectionCard>
      </div>

      {/* 5. JSON-LD SCHEMA */}
      <div id="jsonld" className={cn("space-y-6", activeSectionId === "jsonld" ? "block" : "hidden")}>
        <DashboardSectionCard
          title="5. JSON-LD Organization Schema"
          description="Structured Schema.org Organization payload injected into root HTML head for rich Google search snippets."
          icon={<FileJson className="w-5 h-5 text-amber-500" />}
        >
          <div className="space-y-4">
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
              JSON-LD Payload (Schema.org / Organization)
            </label>
            <textarea
              value={data.jsonLdOrganization}
              onChange={(e) => handleChange("jsonLdOrganization", e.target.value)}
              rows={10}
              className="w-full bg-zinc-950 text-amber-400 border border-border-default rounded-xl p-4 text-xs font-mono resize-none focus:border-amber-500 focus:outline-none leading-relaxed"
            />
          </div>
        </DashboardSectionCard>
      </div>

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
