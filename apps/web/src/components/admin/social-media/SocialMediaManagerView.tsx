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
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/components/dashboard/ui/ToastProvider';
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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

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
        fetch('/api/admin/social-media/accounts').then(r => r.json()),
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
      toast('Failed to load social media data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

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
        toast('Synchronization completed successfully!', 'success');
        fetchAllData();
      } else {
        throw new Error(json.error || 'Sync failed.');
      }
    } catch (err: any) {
      toast(err.message || 'Error running synchronization', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'platforms', label: 'Platforms & Credentials', icon: Key },
    { id: 'accounts', label: 'Connected Accounts', icon: Users },
    { id: 'feeds', label: 'Feed Manager', icon: Layers },
    { id: 'library', label: 'Content Library', icon: FileText },
    { id: 'manual', label: 'Manual & Fetch Link', icon: LinkIcon },
    { id: 'placements', label: 'Website Placement', icon: MapPin },
    { id: 'sync', label: 'Sync & Automation', icon: Clock },
    { id: 'health', label: 'Health & Logs', icon: ShieldAlert },
    { id: 'settings', label: 'Global Settings', icon: Sliders },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Social Media Manager</h1>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Manage official API credentials, account connections, native feeds, content moderation, and website placement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Workspace</span>
          </button>
        </div>
      </div>

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
    </div>
  );
}
