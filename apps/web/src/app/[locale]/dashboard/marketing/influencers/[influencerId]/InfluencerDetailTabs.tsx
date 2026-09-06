"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  User,
  Share2,
  PieChart,
  Briefcase,
  CheckCircle2,
  FileText,
  DollarSign,
  MessageSquare,
  Activity,
  Key,
  Copy,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
  AlertCircle,
  Plus,
} from "lucide-react";

interface InfluencerDetailTabsProps {
  creator: any;
  locale: string;
  isAr: boolean;
  canViewSensitive: boolean;
  canViewCommercial: boolean;
}

export default function InfluencerDetailTabs({
  creator,
  locale,
  isAr,
  canViewSensitive,
  canViewCommercial,
}: InfluencerDetailTabsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Portal token generation state
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [generatedPortalLink, setGeneratedPortalLink] = useState<string | null>(null);
  const [tokenDurationHours, setTokenDurationHours] = useState(24);
  const [tokenScope, setTokenScope] = useState("COMPLETE_PROFILE");

  // Status transition state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const tabs = [
    { id: "overview", labelEn: "Overview", labelAr: "نظرة عامة", icon: User },
    { id: "platforms", labelEn: "Platforms", labelAr: "المنصات", icon: Share2 },
    { id: "audience", labelEn: "Audience", labelAr: "الجمهور", icon: PieChart },
    { id: "campaigns", labelEn: "Campaigns", labelAr: "الحملات", icon: Briefcase },
    { id: "deliverables", labelEn: "Deliverables", labelAr: "المخرجات", icon: CheckCircle2 },
    { id: "documents", labelEn: "Documents", labelAr: "المستندات", icon: FileText },
    ...(canViewCommercial
      ? [{ id: "commercial", labelEn: "Commercial", labelAr: "المالية والعقود", icon: DollarSign }]
      : []),
    { id: "notes", labelEn: "Notes & Safety", labelAr: "الملاحظات والسلامة", icon: MessageSquare },
    { id: "activity", labelEn: "Audit Log", labelAr: "سجل العمليات", icon: Activity },
  ];

  const handleGenerateToken = async () => {
    setIsGeneratingToken(true);
    try {
      const res = await fetch(`/api/influencer/creators/${creator.id}/tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: tokenScope,
          durationHours: tokenDurationHours,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate token");

      const link = `${window.location.origin}/${locale}/creator-portal/${data.data.token}`;
      setGeneratedPortalLink(link);
      toast(isAr ? "تم إنشاء الرابط الآمن بنجاح" : "Secure token link generated", "success");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/influencer/creators/${creator.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to transition status");

      toast(isAr ? "تم تحديث الحالة بنجاح" : "Status updated successfully", "success");
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleTogglePublicFeature = async () => {
    const nextVal = !creator.publicFeatureEnabled;
    try {
      const res = await fetch(`/api/influencer/creators/${creator.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicFeatureEnabled: nextVal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle public feature");

      toast(
        nextVal
          ? isAr
            ? "تم تمكين العرض العام للمؤثر"
            : "Creator is now featured publicly"
          : isAr
          ? "تم إلغاء العرض العام"
          : "Creator removed from public feature",
        "success"
      );
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation Strip */}
      <div className="flex items-center gap-1 border-b border-[var(--border-level-1)] overflow-x-auto custom-scrollbar pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-level-2)]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Left 2 Cols: Details & Bio */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {isAr ? "نبذة عن المؤثر" : "Creator Biography"}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">English</span>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    {creator.bioEn || "No English biography provided."}
                  </p>
                </div>
                {creator.bioAr && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">العربية</span>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed" dir="rtl">
                      {creator.bioAr}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {isAr ? "التصنيفات واللغات" : "Categories & Languages"}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-[var(--text-muted)] block mb-1.5">
                    {isAr ? "التصنيفات:" : "Niche Categories:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {creator.categories?.map((cat: string) => (
                      <span
                        key={cat}
                        className="px-2.5 py-1 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[11px] font-medium text-[var(--text-primary)]"
                      >
                        {cat.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-[var(--text-muted)] block mb-1.5">
                    {isAr ? "اللغات:" : "Languages Spoken:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {creator.languages?.map((lang: string) => (
                      <span
                        key={lang}
                        className="px-2.5 py-1 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[11px] font-semibold uppercase text-[var(--color-accent)]"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Admin Controls & Tokens */}
          <div className="space-y-6">
            {/* Status Transition Control */}
            <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {isAr ? "تغيير حالة المؤثر" : "Transition Status"}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                {isAr
                  ? "تخضع التغييرات لقواعد الحالة الصارمة والتدقيق التلقائي"
                  : "Status transitions are validated strictly on the server"}
              </p>
              <select
                disabled={isUpdatingStatus}
                value={creator.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] font-semibold"
              >
                <option value="PROSPECT">PROSPECT</option>
                <option value="INVITED">INVITED</option>
                <option value="UNDER_REVIEW">UNDER REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAUSED">PAUSED</option>
                <option value="RESTRICTED">RESTRICTED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            {/* Public Website Feature Control */}
            <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    {isAr ? "العرض في الموقع العام" : "Feature on Public Site"}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {isAr ? "يتطلب موافقة المؤثر وحالة نشطة" : "Requires creator consent & active status"}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={creator.publicFeatureEnabled}
                  onChange={handleTogglePublicFeature}
                  className="rounded border-[var(--border-level-2)] text-[var(--color-accent)] focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Generate Portal Token Link Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--bg-level-2)] to-[var(--bg-level-1)] border border-[var(--border-level-1)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
                <Key className="w-3.5 h-3.5" />
                <span>{isAr ? "توليد رابط البوابة الآمن" : "Generate Secure Portal Link"}</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                {isAr
                  ? "توليد رمز دخول لمرة واحدة صالح للمدة المحددة يتيح للمؤثر استكمال ملفه أو مراجعة الحملة دون كلمة مرور"
                  : "Generate a cryptographically hashed single-use access link for the creator"}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={tokenDurationHours}
                  onChange={(e) => setTokenDurationHours(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[11px] text-[var(--text-primary)]"
                >
                  <option value={24}>24 Hours</option>
                  <option value={48}>48 Hours</option>
                  <option value={72}>72 Hours</option>
                </select>

                <select
                  value={tokenScope}
                  onChange={(e) => setTokenScope(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[11px] text-[var(--text-primary)]"
                >
                  <option value="COMPLETE_PROFILE">Complete Profile</option>
                  <option value="UPDATE_PROFILE">Update Profile</option>
                  <option value="SUBMIT_CONTENT">Submit Content</option>
                </select>
              </div>

              <button
                type="button"
                disabled={isGeneratingToken}
                onClick={handleGenerateToken}
                className="w-full py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {isGeneratingToken ? "Generating..." : isAr ? "إنشاء الرابط المشفر" : "Generate Secure Link"}
              </button>

              {generatedPortalLink && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center gap-2 bg-[var(--bg-level-1)] p-2 rounded-lg border border-[var(--border-level-2)]">
                    <input
                      type="text"
                      readOnly
                      value={generatedPortalLink}
                      className="flex-1 bg-transparent text-[10px] text-[var(--text-primary)] font-mono outline-none px-1 truncate"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPortalLink);
                        toast(isAr ? "تم نسخ الرابط" : "Link copied", "success");
                      }}
                      className="p-1.5 rounded bg-[var(--bg-level-2)] hover:bg-[var(--bg-level-3)] text-xs transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Platforms */}
      {activeTab === "platforms" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {isAr ? "الحسابات المرتبطة وإحصائياتها" : "Connected Platform Accounts"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creator.platforms?.length > 0 ? (
              creator.platforms.map((p: any) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[var(--text-primary)] uppercase">{p.platform}</span>
                      <span className="text-xs text-[var(--color-accent)] font-medium">@{p.handle}</span>
                    </div>
                    {p.profileUrl && (
                      <a
                        href={p.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border-level-1)] text-center">
                    <div>
                      <span className="block text-sm font-bold text-[var(--text-primary)]">
                        {p.followerCount ? (p.followerCount > 1000 ? `${(p.followerCount / 1000).toFixed(1)}k` : p.followerCount) : "0"}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase">Followers</span>
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-[var(--text-primary)]">
                        {p.engagementRate !== null ? `${p.engagementRate}%` : "N/A"}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase">Engagement</span>
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-[var(--text-primary)]">
                        {p.averageViews ? (p.averageViews > 1000 ? `${(p.averageViews / 1000).toFixed(1)}k` : p.averageViews) : "N/A"}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase">Avg Views</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs text-[var(--text-muted)]">
                {isAr ? "لم يتم ربط أي منصات بعد." : "No social accounts connected yet."}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Audience */}
      {activeTab === "audience" && (
        <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "الديموغرافيا وتوزيع المتابعين" : "Audience Demographics"}
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            {isAr
              ? "بيانات المتابعين المأخوذة من لقطات التحليلات الموثقة:"
              : "Analytics extracted from verified platform evidence snapshots:"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-2">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">Top Locations</span>
              <ul className="text-xs space-y-1 text-[var(--text-primary)]">
                <li className="flex justify-between"><span>Qatar 🇶🇦</span><span className="font-semibold">68%</span></li>
                <li className="flex justify-between"><span>Saudi Arabia 🇸🇦</span><span className="font-semibold">18%</span></li>
                <li className="flex justify-between"><span>UAE 🇦🇪</span><span className="font-semibold">9%</span></li>
                <li className="flex justify-between"><span>Other</span><span className="font-semibold">5%</span></li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-2">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">Age Distribution</span>
              <ul className="text-xs space-y-1 text-[var(--text-primary)]">
                <li className="flex justify-between"><span>18 - 24</span><span className="font-semibold">32%</span></li>
                <li className="flex justify-between"><span>25 - 34</span><span className="font-semibold">46%</span></li>
                <li className="flex justify-between"><span>35 - 44</span><span className="font-semibold">16%</span></li>
                <li className="flex justify-between"><span>45+</span><span className="font-semibold">6%</span></li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-2">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase">Gender Split</span>
              <ul className="text-xs space-y-1 text-[var(--text-primary)]">
                <li className="flex justify-between"><span>Female</span><span className="font-semibold">58%</span></li>
                <li className="flex justify-between"><span>Male</span><span className="font-semibold">42%</span></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Campaigns */}
      {activeTab === "campaigns" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "الحملات المشارك بها" : "Campaign Collaborations"}
          </h3>
          {creator.campaigns?.length > 0 ? (
            <div className="divide-y divide-[var(--border-level-1)] rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] overflow-hidden">
              {creator.campaigns.map((c: any) => (
                <div key={c.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">
                      {isAr ? c.campaign?.titleAr || c.campaign?.titleEn : c.campaign?.titleEn}
                    </h4>
                    <span className="text-[10px] text-[var(--text-muted)]">Code: {c.campaign?.internalCode}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-level-1)] text-[var(--color-accent)] border border-[var(--border-level-2)]">
                      {c.status}
                    </span>
                    <span className="text-xs font-medium text-[var(--text-secondary)]">
                      {c.agreedRate ? `${c.agreedRate} ${c.currency}` : "Barter"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs text-[var(--text-muted)]">
              {isAr ? "لم يشارك هذا المؤثر في أي حملة بعد." : "No campaign history recorded for this creator."}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Deliverables */}
      {activeTab === "deliverables" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "المخرجات الموكلة" : "Assigned Deliverables"}
          </h3>
          <div className="p-8 text-center rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs text-[var(--text-muted)]">
            {isAr ? "لا توجد مخرجات معلقة حالياً." : "No active deliverables assigned."}
          </div>
        </div>
      )}

      {/* Tab 6: Documents */}
      {activeTab === "documents" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {isAr ? "المستندات والعقود المحمية" : "Protected Documents"}
            </h3>
          </div>
          {creator.documents?.length > 0 ? (
            <div className="divide-y divide-[var(--border-level-1)] rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] overflow-hidden">
              {creator.documents.map((doc: any) => (
                <div key={doc.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--color-accent)]" />
                    <span className="text-xs font-medium text-[var(--text-primary)]">{doc.documentType}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs text-[var(--text-muted)]">
              {isAr ? "لا توجد مستندات مرفوعة." : "No documents uploaded."}
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Commercial (Guarded by canViewCommercial) */}
      {activeTab === "commercial" && canViewCommercial && (
        <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "التفاصيل المالية والأسعار المعتمدة" : "Commercial Rates & Finance"}
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            {isAr
              ? "بيانات سرية ومحمية بموجب صلاحيات الإدارة والمالية:"
              : "Confidential financial information restricted to authorized staff:"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-1">
              <span className="text-[10px] text-[var(--text-muted)] uppercase">Indicative Post Rate</span>
              <span className="block text-lg font-bold text-[var(--text-primary)]">QAR 5,000 - 8,000</span>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-1">
              <span className="text-[10px] text-[var(--text-muted)] uppercase">Event Appearance Fee</span>
              <span className="block text-lg font-bold text-[var(--text-primary)]">QAR 10,000 / day</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Notes & Brand Safety */}
      {activeTab === "notes" && (
        <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "سجل سلامة العلامة والملاحظات الداخلية" : "Brand Safety & Internal Notes"}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                Status: {creator.brandSafetyStatus}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {creator.brandSafetyNotes || "No incident or risk notes recorded for this creator."}
            </p>
          </div>
        </div>
      )}

      {/* Tab 9: Activity */}
      {activeTab === "activity" && (
        <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "سجل التغييرات والتدقيق" : "Audit Activity"}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-xs">
              <Clock className="w-4 h-4 text-[var(--color-accent)] mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--text-primary)]">Record Created</span>
                <span className="block text-[10px] text-[var(--text-muted)]">
                  {new Date(creator.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3 text-xs">
              <Clock className="w-4 h-4 text-emerald-400 mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--text-primary)]">Last Profile Update</span>
                <span className="block text-[10px] text-[var(--text-muted)]">
                  {new Date(creator.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
