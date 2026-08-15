"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Layers
} from 'lucide-react';
import { useToast } from '@/components/dashboard/ui/ToastProvider';

interface PlacementsTabProps {
  placements: any[];
  feeds: any[];
  onRefresh: () => void;
}

export function PlacementsTab({ placements, feeds, onRefresh }: PlacementsTabProps) {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const defaultForm = {
    name: '',
    location: 'B2C_HOME_LIVE_SOCIAL',
    feedId: feeds[0]?.id || '',
    portal: 'SHARED',
    headingEn: 'Live Social Moments',
    headingAr: 'لحظات حية من شبكات التواصل',
    subheadingEn: 'Real-time stories and guest highlights across E3 destinations.',
    subheadingAr: 'تابع تجارب ولحظات زوار وجهات إي ثري الترفيهية.',
    isEnabled: true,
  };

  const [formData, setFormData] = useState(defaultForm);

  const handleOpenCreate = () => {
    setEditingPlacement(null);
    setFormData({ ...defaultForm, feedId: feeds[0]?.id || '' });
    setShowModal(true);
  };

  const handleSavePlacement = async () => {
    if (!formData.name || !formData.feedId) {
      toast('Name and Feed selection are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const url = '/api/admin/social-media/placements';
      const method = editingPlacement ? 'PUT' : 'POST';
      const body = editingPlacement ? { id: editingPlacement.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save placement.');
      }

      toast(`Saved site placement "${formData.name}" successfully`, 'success');
      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      toast(err.message || 'Error saving placement', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlacement = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove site placement "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/social-media/placements?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast(`Deleted placement "${name}"`, 'success');
        onRefresh();
      }
    } catch (_e) {
      toast('Failed to delete placement', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)]">
        <div>
          <h3 className="text-sm font-black text-[var(--text-primary)]">Website Feed Placements</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Assign reusable social feeds to B2C, B2B, Attraction, and Brand microsite locations.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Website Placement</span>
        </button>
      </div>

      {/* Placement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {placements.map(placement => (
          <div key={placement.id} className="p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {placement.location}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${placement.isEnabled ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  {placement.isEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-white">{placement.name}</h4>
                <p className="text-xs text-purple-300 mt-1 flex items-center gap-1 font-medium">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Feed: {placement.feed?.name || 'Unassigned'}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-[var(--border-level-1)] space-y-1 text-xs">
                <div className="font-bold text-slate-200">{placement.headingEn}</div>
                <div className="text-[11px] text-slate-400 text-right">{placement.headingAr}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-level-1)]">
              <span className="text-[11px] text-slate-400 font-mono">{placement.portal} Portal</span>

              <button
                onClick={() => handleDeletePlacement(placement.id, placement.name)}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-base font-black text-white">Create Website Feed Placement</h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Placement Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. B2C Landing Page Live Section"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Target Page Location</label>
                <select
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="B2C_HOME_LIVE_SOCIAL">B2C Homepage Live Social</option>
                  <option value="B2B_HOME_CORPORATE">B2B Homepage Corporate Social</option>
                  <option value="ATTRACTION_PAGE">Attraction Pages</option>
                  <option value="BRAND_PAGE">Brand Pages</option>
                  <option value="CASE_STUDY_PAGE">Case Study Pages</option>
                  <option value="CUSTOM_PAGE">Custom CMS Page</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Select Reusable Feed</label>
                <select
                  value={formData.feedId}
                  onChange={e => setFormData({ ...formData, feedId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {feeds.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.mode})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Heading (English)</label>
                <input
                  type="text"
                  value={formData.headingEn}
                  onChange={e => setFormData({ ...formData, headingEn: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Heading (Arabic)</label>
                <input
                  type="text"
                  value={formData.headingAr}
                  onChange={e => setFormData({ ...formData, headingAr: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-right"
                />
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
                onClick={handleSavePlacement}
                disabled={saving}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Placement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
