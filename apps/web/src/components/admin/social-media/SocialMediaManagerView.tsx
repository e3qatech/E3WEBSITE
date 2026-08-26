/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Key,
  Users,
  Layers,
  FileText,
  Link as LinkIcon,
  MapPin,
  Clock,
  ShieldAlert,
  Sliders,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  EditorSectionItem,
} from "@/components/dashboard/ui";
import { useLocale } from "@/components/layout/LocaleProvider";
import { DashboardAccessDenied } from "@/components/dashboard/ui/DashboardAccessDenied";
import { OverviewTab } from "./tabs/OverviewTab";
import { PlatformsTab } from "./tabs/PlatformsTab";
import { AccountsTab } from "./tabs/AccountsTab";
import { FeedsTab } from "./tabs/FeedsTab";
import { ContentLibraryTab } from "./tabs/ContentLibraryTab";
import { ManualPostsTab } from "./tabs/ManualPostsTab";
import { PlacementsTab } from "./tabs/PlacementsTab";
import { SyncAutomationTab } from "./tabs/SyncAutomationTab";
import { HealthDiagnosticsTab } from "./tabs/HealthDiagnosticsTab";
import { GlobalSettingsTab } from "./tabs/GlobalSettingsTab";

export function SocialMediaManagerView() {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [placements, setPlacements] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [syncJobs, setSyncJobs] = useState<any[]>([]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [accRes, provRes, feedRes, placeRes, postRes, jobRes] = await Promise.all([
        fetch("/api/admin/social-media/accounts").then(async (r) => {
          if (r.status === 403 || r.status === 401) setAccessDenied(true);
          return r.json();
        }),
        fetch("/api/admin/social-media/providers").then((r) => r.json()),
        fetch("/api/admin/social-media/feeds").then((r) => r.json()),
        fetch("/api/admin/social-media/placements").then((r) => r.json()),
        fetch("/api/admin/social-media/posts?limit=50").then((r) => r.json()),
        fetch("/api/admin/social-media/diagnostics").then((r) => r.json()),
      ]);

      if (accRes.success) setAccounts(accRes.data || []);
      if (provRes.success) setProviders(provRes.data || []);
      if (feedRes.success) setFeeds(feedRes.data || []);
      if (placeRes.success) setPlacements(placeRes.data || []);
      if (postRes.success) setPosts(postRes.data || []);
      if (jobRes.success) setSyncJobs(jobRes.data?.recentSyncJobs || []);
    } catch (err: any) {
      console.error("[SOCIAL_MANAGER_FETCH_ERROR]", err);
      toast(isAr ? "تعذر تحميل بيانات التواصل الاجتماعي" : "Failed to load social media data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  if (accessDenied) {
    return (
      <DashboardPageShell variant="wide">
        <DashboardAccessDenied
          title={isAr ? "الوصول مقيّد" : "Access Restricted"}
          message={
            isAr
              ? "حسابك الحالي لا يمتلك الصلاحيات الإدارية الكافية للوصول إلى إدارة منصات التواصل الاجتماعي وموجز الأخبار."
              : "Your current account does not have sufficient permissions to view or manage the Social Media Hub."
          }
          requiredPermission="VIEW_SOCIAL_MANAGER"
        />
      </DashboardPageShell>
    );
  }

  const handleRunSync = async (accountId?: string) => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/social-media/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast(isAr ? "تمت المزامنة بنجاح!" : "Synchronization completed successfully!", "success");
        fetchAllData();
      } else {
        throw new Error(json.error || (isAr ? "فشلت المزامنة" : "Sync failed."));
      }
    } catch (err: any) {
      toast(err.message || (isAr ? "خطأ في تشغيل المزامنة" : "Error running synchronization"), "error");
    } finally {
      setSyncing(false);
    }
  };

  const SECTIONS: EditorSectionItem[] = [
    { id: "overview", label: "Overview", labelAr: "نظرة عامة", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: "platforms", label: "Platforms & API", labelAr: "المنصات والاعتمادات", icon: <Key className="w-3.5 h-3.5" /> },
    { id: "accounts", label: "Connected Accounts", labelAr: "الحسابات المتصلة", icon: <Users className="w-3.5 h-3.5" />, count: accounts.length },
    { id: "feeds", label: "Feed Manager", labelAr: "إدارة الخلاصات", icon: <Layers className="w-3.5 h-3.5" />, count: feeds.length },
    { id: "library", label: "Content Library", labelAr: "مكتبة المحتوى", icon: <FileText className="w-3.5 h-3.5" />, count: posts.length },
    { id: "manual", label: "Manual & Fetch Link", labelAr: "إضافة يدوية ورابط", icon: <LinkIcon className="w-3.5 h-3.5" /> },
    { id: "placements", label: "Website Placement", labelAr: "مواضع العرض", icon: <MapPin className="w-3.5 h-3.5" />, count: placements.length },
    { id: "sync", label: "Sync & Automation", labelAr: "المزامنة والأتمتة", icon: <Clock className="w-3.5 h-3.5" /> },
    { id: "health", label: "Health & Logs", labelAr: "حالة النظام والسجلات", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: "settings", label: "Global Settings", labelAr: "الإعدادات العامة", icon: <Sliders className="w-3.5 h-3.5" /> },
  ];

  return (
    <DashboardPageShell variant="wide">
      {/* Header Bar */}
      <DashboardPageHeader
        title={isAr ? "إدارة التواصل الاجتماعي وموجز الأخبار" : "Social Media & Feed Hub"}
        description={
          isAr
            ? "إدارة بيانات الاعتماد الرسمية، والحسابات المتصلة، وتنسيق المحتوى والموجز، ومواضع العرض على الموقع."
            : "Manage official API credentials, account connections, native feeds, content moderation, and website placement."
        }
        breadcrumbs={[
          { label: isAr ? "الوسائط العالمية" : "Global Media", href: "/dashboard/cms/media" },
          { label: isAr ? "إدارة التواصل الاجتماعي" : "Social Media Manager" },
        ]}
        badge={{
          label: `${accounts.length} ${isAr ? "حسابات متصلة" : "Accounts"}`,
          variant: "purple",
        }}
        primaryAction={{
          label: isAr ? "تحديث البيانات" : "Refresh Workspace",
          onClick: fetchAllData,
          isLoading: loading,
          icon: <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />,
        }}
      />

      {/* Modern Dashboard Section Navigator with left/right scroll controls & dropdown */}
      <DashboardSectionNavigator
        sections={SECTIONS}
        activeSectionId={activeTab}
        onSectionChange={setActiveTab}
      />

      {/* Tab Content Area */}
      <div className="pt-4">
        {activeTab === "overview" && (
          <OverviewTab
            accounts={accounts}
            providers={providers}
            feeds={feeds}
            postsCount={posts.length}
            syncJobs={syncJobs}
            onNavigateTab={setActiveTab}
            onRunSync={() => handleRunSync()}
            syncing={syncing}
          />
        )}

        {activeTab === "platforms" && (
          <PlatformsTab providers={providers} onRefresh={fetchAllData} />
        )}

        {activeTab === "accounts" && (
          <AccountsTab
            accounts={accounts}
            providers={providers}
            onRefresh={fetchAllData}
            onRunSync={handleRunSync}
            syncing={syncing}
          />
        )}

        {activeTab === "feeds" && (
          <FeedsTab feeds={feeds} accounts={accounts} onRefresh={fetchAllData} />
        )}

        {activeTab === "library" && (
          <ContentLibraryTab posts={posts} onRefresh={fetchAllData} />
        )}

        {activeTab === "manual" && (
          <ManualPostsTab onRefresh={fetchAllData} />
        )}

        {activeTab === "placements" && (
          <PlacementsTab placements={placements} feeds={feeds} onRefresh={fetchAllData} />
        )}

        {activeTab === "sync" && (
          <SyncAutomationTab
            syncJobs={syncJobs}
            accounts={accounts}
            onRunSync={handleRunSync}
            syncing={syncing}
          />
        )}

        {activeTab === "health" && (
          <HealthDiagnosticsTab accounts={accounts} providers={providers} syncJobs={syncJobs} />
        )}

        {activeTab === "settings" && <GlobalSettingsTab />}
      </div>
    </DashboardPageShell>
  );
}
