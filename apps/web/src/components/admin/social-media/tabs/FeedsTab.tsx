"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2
} from 'lucide-react';
import { useToast } from '@/components/dashboard/ui/ToastProvider';

interface FeedsTabProps {
  feeds: any[];
  accounts: any[];
  onRefresh: () => void;
}

export function FeedsTab({ feeds, accounts: _accounts, onRefresh }: FeedsTabProps) {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingFeed, setEditingFeed] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const defaultForm = {
    name: '',
    description: '',
    mode: 'HYBRID',
    portal: 'SHARED',
    layout: 'GRID',
    theme: 'SYSTEM',
    maxPosts: 12,
    columnsDesktop: 3,
    columnsTablet: 2,
    columnsMobile: 1,
    enableFollowCta: true,
    followCtaTextEn: 'Follow E3 Qatar',
    followCtaTextAr: 'تابع إي ثري قطر',
    accountIds: [] as string[],
  };

  const [formData, setFormData] = useState(defaultForm);

  const handleOpenCreate = () => {
    setEditingFeed(null);
    setFormData(defaultForm);
    setShowModal(true);
  };

  const handleOpenEdit = (feed: any) => {
    setEditingFeed(feed);
    setFormData({
      name: feed.name,
      description: feed.description || '',
      mode: feed.mode || 'HYBRID',
      portal: feed.portal || 'SHARED',
      layout: feed.layout || 'GRID',
      theme: feed.theme || 'SYSTEM',
      maxPosts: feed.maxPosts || 12,
      columnsDesktop: feed.columnsDesktop || 3,
      columnsTablet: feed.columnsTablet || 2,
      columnsMobile: feed.columnsMobile || 1,
      enableFollowCta: feed.enableFollowCta !== false,
      followCtaTextEn: feed.followCtaTextEn || 'Follow E3 Qatar',
      followCtaTextAr: feed.followCtaTextAr || 'تابع إي ثري قطر',
      accountIds: feed.sources ? feed.sources.map((s: any) => s.accountId).filter(Boolean) : [],
    });
    setShowModal(true);
  };

  const handleSaveFeed = async () => {
    if (!formData.name) {
      toast('Feed name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const url = '/api/admin/social-media/feeds';
      const method = editingFeed ? 'PUT' : 'POST';
      const body = editingFeed ? { id: editingFeed.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save feed.');
      }

      toast(`Saved feed "${formData.name}" successfully`, 'success');
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      toast(err.message || 'Error saving feed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFeed = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete feed "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/social-media/feeds?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast(`Deleted feed "${name}"`, 'success');
        onRefresh();
      }
    } catch (_e) {
      toast('Failed to delete feed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)]">
        <div>
          <h3 className="text-sm font-black text-[var(--text-primary)]">Reusable Social Feeds</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Configure feed curation modes, responsive column grids, and source account filters.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Feed</span>
        </button>
      </div>

      {/* Feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feeds.map(feed => (
          <div key={feed.id} className="p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-950 text-pink-300 border border-pink-500/30">
                  {feed.mode} MODE
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {feed.layout} ({feed.columnsDesktop} Col)
                </span>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-white">{feed.name}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{feed.description || 'No description set.'}</p>
              </div>

              <div className="space-y-1.5 pt-2 text-[11px] text-slate-400 border-t border-[var(--border-level-1)]">
                <div className="flex justify-between">
                  <span>Max Posts:</span>
                  <span className="font-bold text-white">{feed.maxPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span>Placements:</span>
                  <span className="font-bold text-pink-400">{feed._count?.placements || 0} Pages</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-level-1)]">
              <button
                onClick={() => handleOpenEdit(feed)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                Edit Feed
              </button>

              <button
                onClick={() => handleDeleteFeed(feed.id, feed.name)}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Feed Config Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-pink-500/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-8">
            <h3 className="text-base font-black text-white">{editingFeed ? 'Edit Social Feed' : 'Create New Social Feed'}</h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Feed Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. B2C Homepage Live Social Feed"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Feed Curation Mode</label>
                  <select
                    value={formData.mode}
                    onChange={e => setFormData({ ...formData, mode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="HYBRID">HYBRID (Auto + Pinned)</option>
                    <option value="AUTOMATIC">AUTOMATIC (Latest Only)</option>
                    <option value="CURATED">CURATED (Selected Only)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Layout</label>
                  <select
                    value={formData.layout}
                    onChange={e => setFormData({ ...formData, layout: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="GRID">Standard Grid</option>
                    <option value="MASONRY">Pinterest Masonry</option>
                    <option value="CAROUSEL">Cinematic Carousel</option>
                    <option value="FEATURED_HERO">Featured Hero Card</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Max Posts</label>
                  <input
                    type="number"
                    value={formData.maxPosts}
                    onChange={e => setFormData({ ...formData, maxPosts: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Desktop Columns</label>
                  <input
                    type="number"
                    value={formData.columnsDesktop}
                    onChange={e => setFormData({ ...formData, columnsDesktop: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Follow CTA Label (EN)</label>
                  <input
                    type="text"
                    value={formData.followCtaTextEn}
                    onChange={e => setFormData({ ...formData, followCtaTextEn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Follow CTA Label (AR)</label>
                  <input
                    type="text"
                    value={formData.followCtaTextAr}
                    onChange={e => setFormData({ ...formData, followCtaTextAr: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-right"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-950 text-slate-400 hover:text-white text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFeed}
                disabled={saving}
                className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Feed Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
