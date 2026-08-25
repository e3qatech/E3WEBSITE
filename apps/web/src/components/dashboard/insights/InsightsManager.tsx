"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  User,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MediaUploader } from "@/components/ui/MediaUploader";
import { cn } from "@/lib/utils";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui";

export function InsightsManager() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/insights");
      const json = await res.json();
      setInsights(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      console.error("Failed to fetch insights:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const filtered = insights.filter((item) => {
    const matchesSearch =
      (item.titleEn || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.titleAr || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.slugEn || "").toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "ALL" || item.contentType === typeFilter;
    const matchesStatus = statusFilter === "ALL" || item.publishStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Insight/Article record?")) return;
    try {
      const res = await fetch(`/api/insights/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchInsights();
    } catch (_e) {
      alert("Failed to delete record");
    }
  };

  const handleTogglePublish = async (item: any) => {
    const nextStatus = item.publishStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/insights/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publishStatus: nextStatus,
          publishedAt: nextStatus === "PUBLISHED" ? new Date().toISOString() : item.publishedAt,
        }),
      });
      if (res.ok) {
        fetchInsights();
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  if (editingItem || isCreating) {
    return (
      <InsightEditor
        initialData={editingItem}
        onClose={() => {
          setEditingItem(null);
          setIsCreating(false);
        }}
        onSave={() => {
          setEditingItem(null);
          setIsCreating(false);
          fetchInsights();
        }}
      />
    );
  }

  const publishedCount = insights.filter((i) => i.publishStatus === "PUBLISHED").length;
  const draftCount = insights.filter((i) => i.publishStatus === "DRAFT").length;

  return (
    <DashboardPageShell variant="wide">
      {/* Header */}
      <DashboardPageHeader
        title="Insights, News & Blog Manager"
        description="Create, edit, and publish articles, news, press releases, technical insights, and event recaps for the public E3 website."
        breadcrumbs={[
          { label: "Content", href: "/dashboard/b2c/discover" },
          { label: "Insights & Press Articles" },
        ]}
        badge={{ label: `${insights.length} Total Records`, variant: "purple" }}
        primaryAction={{
          label: "Write New Article",
          onClick: () => setIsCreating(true),
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-default)] flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider block">Total Records</span>
            <span className="text-2xl font-black text-[var(--text-primary)] font-mono">{insights.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-default)] flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider block">Live Published</span>
            <span className="text-2xl font-black text-emerald-600 font-mono">{publishedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-default)] flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider block">Drafts / In Review</span>
            <span className="text-2xl font-black text-amber-600 font-mono">{draftCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-default)] overflow-x-auto">
          {["ALL", "ARTICLE", "NEWS", "PRESS_RELEASE", "EVENT_RECAP", "TECHNICAL_INSIGHT", "ANNOUNCEMENT"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer",
                typeFilter === t
                  ? "bg-[var(--surface-default)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {t.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search titles, slugs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] text-[var(--text-primary)]"
            />
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] text-[var(--text-tertiary)] animate-pulse">
          Loading Insights, Articles & News Records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] space-y-3">
          <Sparkles className="w-10 h-10 mx-auto text-[var(--text-tertiary)] opacity-40" />
          <p className="text-base font-bold text-[var(--text-primary)]">No insights found</p>
          <p className="text-xs text-[var(--text-secondary)]">Create a new article or adjust your search filters above.</p>
          <Button size="sm" onClick={() => setIsCreating(true)} className="gap-1.5 mt-2">
            <Plus className="w-3.5 h-3.5" /> Write First Article
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const liveUrl = `/en/b2c/insights/${item.slugEn || item.id}`;
            const isPublished = item.publishStatus === "PUBLISHED";

            return (
              <div
                key={item.id}
                className="bg-[var(--surface-default)] rounded-2xl border border-[var(--border-default)] p-5 hover:border-[var(--color-primary)] transition-all shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      {item.contentType}
                    </span>
                    <button
                      onClick={() => handleTogglePublish(item)}
                      className={cn(
                        "px-2.5 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1",
                        isPublished
                          ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                          : "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25"
                      )}
                      title="Click to toggle publish status"
                    >
                      {isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{item.publishStatus}</span>
                    </button>
                  </div>

                  <h3 className="font-extrabold text-base text-[var(--text-primary)] line-clamp-2 leading-snug">
                    {item.titleEn}
                  </h3>
                  {item.titleAr && (
                    <p className="text-xs text-[var(--text-secondary)] font-arabic text-right mt-0.5 line-clamp-1">
                      {item.titleAr}
                    </p>
                  )}

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-2 leading-relaxed">
                    {item.excerptEn || item.bodyEn?.slice(0, 100) || "No excerpt provided..."}
                  </p>

                  {item.author && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-default)]/60 text-xs text-[var(--text-secondary)]">
                      <User className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
                      <span className="truncate">
                        {item.author.firstName} {item.author.lastName} ({item.author.designation || "Team"})
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)] text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingItem(item)}
                      className="gap-1.5 rounded-xl text-xs h-8"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </Button>
                    {isPublished && (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 p-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors text-xs"
                        title="View live article on public website"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardPageShell>
  );
}

function InsightEditor({
  initialData,
  onClose,
  onSave,
}: {
  initialData?: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEditing = !!initialData?.id;
  const [isSaving, setIsSaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [activeLangTab, setActiveLangTab] = useState<"EN" | "AR">("EN");

  const [titleEn, setTitleEn] = useState(initialData?.titleEn || "");
  const [titleAr, setTitleAr] = useState(initialData?.titleAr || "");
  const [slugEn, setSlugEn] = useState(initialData?.slugEn || "");
  const [slugAr, setSlugAr] = useState(initialData?.slugAr || "");
  const [contentType, setContentType] = useState(initialData?.contentType || "ARTICLE");
  const [publishStatus, setPublishStatus] = useState(initialData?.publishStatus || "DRAFT");
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [excerptEn, setExcerptEn] = useState(initialData?.excerptEn || "");
  const [excerptAr, setExcerptAr] = useState(initialData?.excerptAr || "");
  const [bodyEn, setBodyEn] = useState(initialData?.bodyEn || "");
  const [bodyAr, setBodyAr] = useState(initialData?.bodyAr || "");
  const [featuredMediaId, setFeaturedMediaId] = useState(initialData?.featuredMediaId || initialData?.featuredMediaUrl || "");
  const [authorEmployeeProfileId, setAuthorEmployeeProfileId] = useState(initialData?.authorEmployeeProfileId || "");

  // SEO Fields
  const [metaTitleEn, setMetaTitleEn] = useState(initialData?.metaTitleEn || "");
  const [metaDescriptionEn, setMetaDescriptionEn] = useState(initialData?.metaDescriptionEn || "");
  const [metaTitleAr, setMetaTitleAr] = useState(initialData?.metaTitleAr || "");
  const [metaDescriptionAr, setMetaDescriptionAr] = useState(initialData?.metaDescriptionAr || "");

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => setTeamMembers(Array.isArray(data) ? data : data.team || []))
      .catch(console.error);
  }, []);

  const handleGenerateSlug = () => {
    if (titleEn) {
      setSlugEn(titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSave = async () => {
    if (!titleEn.trim()) {
      alert("English Title is required");
      return;
    }

    const generatedSlug = slugEn.trim() || titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    setIsSaving(true);
    try {
      const payload = {
        titleEn,
        titleAr: titleAr || titleEn,
        slugEn: generatedSlug,
        slugAr: slugAr || generatedSlug,
        contentType,
        publishStatus,
        featured,
        excerptEn,
        excerptAr,
        bodyEn,
        bodyAr,
        featuredMediaId,
        authorEmployeeProfileId: authorEmployeeProfileId || null,
        metaTitleEn: metaTitleEn || titleEn,
        metaTitleAr: metaTitleAr || titleAr,
        metaDescriptionEn: metaDescriptionEn || excerptEn,
        metaDescriptionAr: metaDescriptionAr || excerptAr,
      };

      const url = isEditing ? `/api/insights/${initialData.id}` : "/api/insights";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save record");
      }

      onSave();
    } catch (err: any) {
      alert(err.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardPageShell variant="focused">
      <DashboardPageHeader
        title={isEditing ? `Edit Record: ${titleEn || "Untitled"}` : "Create New Insight / Article"}
        description="Configure rich text content, bilingual Arabic & English translations, media assets, and SEO metadata."
        breadcrumbs={[
          { label: "Insights Portal", href: "/dashboard/insights" },
          { label: isEditing ? titleEn || "Edit Record" : "New Record" },
        ]}
        badge={{
          label: publishStatus,
          variant: publishStatus === "PUBLISHED" ? "success" : "warning",
        }}
        primaryAction={{
          label: isSaving ? "Saving..." : "Save Record",
          onClick: handleSave,
          isLoading: isSaving,
        }}
        secondaryAction={
          <Button variant="outline" size="sm" onClick={onClose} className="gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Cancel
          </Button>
        }
      />

      {/* Language Switcher Tab Bar */}
      <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveLangTab("EN")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              activeLangTab === "EN"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Globe className="w-3.5 h-3.5" /> English Content
          </button>
          <button
            type="button"
            onClick={() => setActiveLangTab("AR")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              activeLangTab === "AR"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Globe className="w-3.5 h-3.5" /> المحتوى العربي (Arabic)
          </button>
        </div>

        {isEditing && slugEn && (
          <a
            href={`/en/b2c/insights/${slugEn}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
          >
            <span>Live Article Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left Column (2 Cols) — Content Fields */}
        <div className="lg:col-span-2 space-y-5">
          {activeLangTab === "EN" ? (
            <div className="space-y-4 bg-[var(--surface-default)] p-6 rounded-2xl border border-[var(--border-default)] shadow-sm">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--color-primary)]" /> English Article Content
              </h4>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  Article Title (English) *
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. The Future of Immersive Entertainment in Qatar"
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[var(--text-secondary)]">
                    URL Slug (English)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    className="text-[10px] text-[var(--color-primary)] hover:underline font-bold"
                  >
                    Auto-generate from Title
                  </button>
                </div>
                <input
                  type="text"
                  value={slugEn}
                  onChange={(e) => setSlugEn(e.target.value)}
                  placeholder="future-of-immersive-entertainment-qatar"
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  Excerpt Summary (English)
                </label>
                <textarea
                  rows={3}
                  value={excerptEn}
                  onChange={(e) => setExcerptEn(e.target.value)}
                  placeholder="Brief 2-3 sentence overview for search previews and social cards..."
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  Full Article Body (English HTML / Markdown)
                </label>
                <textarea
                  rows={14}
                  value={bodyEn}
                  onChange={(e) => setBodyEn(e.target.value)}
                  placeholder="Write full article body paragraphs, headings (<h2>, <h3>), blockquotes (<blockquote>), and bullet lists (<ul><li>)..."
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono leading-relaxed"
                />
                <span className="text-[10px] text-[var(--text-tertiary)] mt-1 block">
                  Tip: Supports standard HTML tags (&lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;blockquote&gt;) or plain text.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 bg-[var(--surface-default)] p-6 rounded-2xl border border-[var(--border-default)] shadow-sm" dir="rtl">
              <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--color-primary)]" /> المحتوى العربي للمقال
              </h4>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  عنوان المقال (بالعربية)
                </label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="عنوان المقال أو البيان الصحفي بالعربية..."
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-right font-arabic"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  ملخص المقال / المقتطف (بالعربية)
                </label>
                <textarea
                  rows={3}
                  value={excerptAr}
                  onChange={(e) => setExcerptAr(e.target.value)}
                  placeholder="موجز أو ملخص يظهر في بطاقة الخبر ومعاينات وسائل التواصل..."
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] resize-none text-right font-arabic"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  نص المقال الكامل (بالعربية)
                </label>
                <textarea
                  rows={14}
                  value={bodyAr}
                  onChange={(e) => setBodyAr(e.target.value)}
                  placeholder="نص المقال الكامل، الفقرات، العناوين الفرعية، وقوائم النقاط..."
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] text-right font-arabic leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* SEO & Social Metadata Box */}
          <div className="bg-[var(--surface-default)] p-6 rounded-2xl border border-[var(--border-default)] space-y-4 shadow-sm">
            <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--color-primary)]" /> Search Engine Optimization (SEO) & Social Meta
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Meta Title (English)</label>
                <input
                  type="text"
                  value={metaTitleEn}
                  onChange={(e) => setMetaTitleEn(e.target.value)}
                  placeholder={titleEn || "Custom SEO Title"}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Meta Title (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={metaTitleAr}
                  onChange={(e) => setMetaTitleAr(e.target.value)}
                  placeholder={titleAr || "عنوان الميتا بالعربية"}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none text-right font-arabic"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Meta Description (English)</label>
                <input
                  type="text"
                  value={metaDescriptionEn}
                  onChange={(e) => setMetaDescriptionEn(e.target.value)}
                  placeholder={excerptEn || "150-160 character description for Google search snippets"}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) — Settings & Publishing Sidebar */}
        <div className="space-y-5">
          <div className="bg-[var(--surface-default)] p-6 rounded-2xl border border-[var(--border-default)] space-y-4 shadow-sm">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Publishing Controls</h4>

            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="ARTICLE">Article / Thought Leadership</option>
                <option value="NEWS">News Release</option>
                <option value="PRESS_RELEASE">Official Press Release</option>
                <option value="EVENT_RECAP">Event Recap & Highlight</option>
                <option value="TECHNICAL_INSIGHT">Technical & Safety Insight</option>
                <option value="ANNOUNCEMENT">Company Announcement</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Publish Status</label>
              <select
                value={publishStatus}
                onChange={(e) => setPublishStatus(e.target.value)}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="DRAFT">Draft (Unpublished)</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published (Live on Website)</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="pt-2 border-t border-[var(--border-default)]">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-[var(--color-primary)] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  Feature as Spotlight Hero Story
                </span>
              </label>
              <span className="text-[10px] text-[var(--text-tertiary)] block mt-1 ps-6">
                Featured stories appear in the spotlight banner on the B2C Insights page.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                Author Attribution
              </label>
              <select
                value={authorEmployeeProfileId}
                onChange={(e) => setAuthorEmployeeProfileId(e.target.value)}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="">-- E3 Editorial Team (Default) --</option>
                {teamMembers.map((tm) => (
                  <option key={tm.id} value={tm.id}>
                    {tm.firstName} {tm.lastName} ({tm.designation || "Team"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured Image Media Uploader */}
          <div className="bg-[var(--surface-default)] p-6 rounded-2xl border border-[var(--border-default)] space-y-3 shadow-sm">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Featured Cover Image</h4>
            <MediaUploader
              value={featuredMediaId}
              onChange={setFeaturedMediaId}
              accept="image/*"
              placeholder="Upload or enter cover image URL..."
            />
            {featuredMediaId && (
              <div className="rounded-xl overflow-hidden aspect-video border border-[var(--border-default)] bg-black mt-2">
                <img src={featuredMediaId} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardPageShell>
  );
}
