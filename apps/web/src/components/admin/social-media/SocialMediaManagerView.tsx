/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/dashboard/ui/ToastProvider';
import {
  DashboardPageShell,
  DashboardPageHeader,
} from '@/components/dashboard/ui';
import { useLocale } from '@/components/layout/LocaleProvider';
import { DashboardAccessDenied } from '@/components/dashboard/ui/DashboardAccessDenied';
import { OverviewTab } from './tabs/OverviewTab';
import { PlatformsTab } from './tabs/PlatformsTab';
import { AccountsTab } from './tabs/AccountsTab';
import { FeedsTab } from './tabs/FeedsTab';
import { ContentLibraryTab } from './tabs/ContentLibraryTab';
import { ManualPostsTab } from './tabs/ManualPostsTab';
import { PlacementsTab } from './tabs/PlacementsTab';
import { SyncAutomationTab } from './tabs/SyncAutomationTab';
import { HealthDiagnosticsTab } from './tabs/HealthDiagnosticsTab';
import { GlobalSettingsTab } from './tabs/GlobalSettingsTab';

export function SocialMediaManagerView() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
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
        fetch('/api/admin/social-media/accounts').then(async r => {
          if (r.status === 403 || r.status === 401) setAccessDenied(true);
          return r.json();
        }),
        fetch('/api/admin/social-media/providers').then(r => r.json()),
        fetch('/api/admin/social-media/feeds').then(r => r.json()),
        fetch('/api/admin/social-media/placements').then(r => r.json()),
        fetch('/api/admin/social-media/posts?limit=50').then(r => r.json()),
        fetch('/api/admin/social-media/diagnostics').then(r => r.json()),
      ]);

      if (accRes.success) setAccounts(accRes.data || []);
      if (provRes.success) setProviders(provRes.data || []);
      if (feedRes.success) setFeeds(feedRes.data || []);
      if (placeRes.success) setPlacements(placeRes.data || []);
      if (postRes.success) setPosts(postRes.data || []);
      if (jobRes.success) setSyncJobs(jobRes.data?.recentSyncJobs || []);
    } catch (err: any) {
      console.error('[SOCIAL_MANAGER_FETCH_ERROR]', err);
      toast(isAr ? 'تعذر تحميل بيانات التواصل الاجتماعي' : 'Failed to load social media data', 'error');
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
      const res = await fetch('/api/admin/social-media/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast(isAr ? 'تمت المزامنة بنجاح!' : 'Synchronization completed successfully!', 'success');
        fetchAllData();
      } else {
        throw new Error(json.error || (isAr ? 'فشلت المزامنة' : 'Sync failed.'));
      }
    } catch (err: any) {
      toast(err.message || (isAr ? 'خطأ في تشغيل المزامنة' : 'Error running synchronization'), 'error');
    } finally {
      setSyncing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: isAr ? 'نظرة عامة' : 'Overview', icon: LayoutDashboard },
    { id: 'platforms', label: isAr ? 'المنصات والاعتمادات' : 'Platforms & Credentials', icon: Key },
    { id: 'accounts', label: isAr ? 'الحسابات المتصلة' : 'Connected Accounts', icon: Users },
    { id: 'feeds', label: isAr ? 'إدارة الخلاصات' : 'Feed Manager', icon: Layers },
    { id: 'library', label: isAr ? 'مكتبة المحتوى' : 'Content Library', icon: FileText },
    { id: 'manual', label: isAr ? 'إضافة يدوية ورابط' : 'Manual & Fetch Link', icon: LinkIcon },
    { id: 'placements', label: isAr ? 'مواضع العرض' : 'Website Placement', icon: MapPin },
    { id: 'sync', label: isAr ? 'المزامنة والأتمتة' : 'Sync & Automation', icon: Clock },
    { id: 'health', label: isAr ? 'حالة النظام والسجلات' : 'Health & Logs', icon: ShieldAlert },
    { id: 'settings', label: isAr ? 'الإعدادات العامة' : 'Global Settings', icon: Sliders },
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
          label: `${accounts.length} ${isAr ? 'حسابات متصلة' : 'Accounts'}`,
          variant: "purple",
        }}
        primaryAction={{
          label: isAr ? "تحديث البيانات" : "Refresh Workspace",
          onClick: fetchAllData,
          isLoading: loading,
          icon: <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />,
        }}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[var(--border-level-1)] scrollbar-none">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-[var(--surface-default)] text-[var(--text-secondary)] hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'overview' && (
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

        {activeTab === 'platforms' && (
          <PlatformsTab providers={providers} onRefresh={fetchAllData} />
        )}

        {activeTab === 'accounts' && (
          <AccountsTab
            accounts={accounts}
            providers={providers}
            onRefresh={fetchAllData}
            onRunSync={handleRunSync}
            syncing={syncing}
          />
        )}

        {activeTab === 'feeds' && (
          <FeedsTab feeds={feeds} accounts={accounts} onRefresh={fetchAllData} />
        )}

        {activeTab === 'library' && (
          <ContentLibraryTab posts={posts} onRefresh={fetchAllData} />
        )}

        {activeTab === 'manual' && (
          <ManualPostsTab onRefresh={fetchAllData} />
        )}

        {activeTab === 'placements' && (
          <PlacementsTab placements={placements} feeds={feeds} onRefresh={fetchAllData} />
        )}

        {activeTab === 'sync' && (
          <SyncAutomationTab
            syncJobs={syncJobs}
            accounts={accounts}
            onRunSync={handleRunSync}
            syncing={syncing}
          />
        )}

        {activeTab === 'health' && (
          <HealthDiagnosticsTab accounts={accounts} providers={providers} syncJobs={syncJobs} />
        )}

        {activeTab === 'settings' && <GlobalSettingsTab />}
      </div>
    </DashboardPageShell>
  );
}
