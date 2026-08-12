"use client";

import React, { useState } from 'react';
import { 
  Link, 
  Sparkles, 
  Save, 
  Image as ImageIcon, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  FilePlus
} from 'lucide-react';
import { useToast } from '@/components/dashboard/ui/ToastProvider';
import { AdminMediaPicker } from '@/components/dashboard/ui/AdminMediaPicker';

interface ManualPostsTabProps {
  onRefresh: () => void;
}

export function ManualPostsTab({ onRefresh }: ManualPostsTabProps) {
  const { toast } = useToast();
  const [urlInput, setUrlInput] = useState('');
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);

  const [postForm, setPostForm] = useState({
    provider: 'MANUAL',
    originalUrl: '',
    authorName: 'E3 Qatar',
    authorUsername: 'e3qatar',
    captionEn: '',
    captionAr: '',
    mediaType: 'IMAGE',
    mediaUrl: '',
    thumbnailUrl: '',
  });

  const handleFetchLink = async () => {
    if (!urlInput.trim()) {
      toast('Please enter a valid social post URL.', 'error');
      return;
    }

    setFetching(true);
    try {
      const res = await fetch('/api/admin/social-media/posts/fetch-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch details from link.');
      }

      const d = json.data;
      setPostForm({
        provider: d.provider || 'MANUAL',
        originalUrl: d.originalUrl || urlInput,
        authorName: d.authorName || 'E3 Qatar',
        authorUsername: d.authorUsername || 'e3qatar',
        captionEn: d.captionEn || '',
        captionAr: d.captionAr || '',
        mediaType: d.mediaType || 'IMAGE',
        mediaUrl: d.mediaUrl || '',
        thumbnailUrl: d.thumbnailUrl || d.mediaUrl || '',
      });

      toast('Fetched post metadata successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Error fetching link', 'error');
    } finally {
      setFetching(false);
    }
  };

  const handleSavePost = async () => {
    if (!postForm.mediaUrl) {
      toast('Media URL is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/social-media/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postForm),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save post.');
      }

      toast('Saved manual social post successfully!', 'success');
      setUrlInput('');
      setPostForm({
        provider: 'MANUAL',
        originalUrl: '',
        authorName: 'E3 Qatar',
        authorUsername: 'e3qatar',
        captionEn: '',
        captionAr: '',
        mediaType: 'IMAGE',
        mediaUrl: '',
        thumbnailUrl: '',
      });
      onRefresh();
    } catch (err: any) {
      toast(err.message || 'Error saving post', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Fetch by Link Card */}
      <div className="p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
          <Link className="w-4 h-4 text-purple-400" />
          <span>Fetch Social Post by Link</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          Paste any Instagram, TikTok, YouTube, Facebook, or LinkedIn public post URL to extract metadata automatically.
        </p>

        <div className="flex gap-3">
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://www.instagram.com/p/... or https://youtu.be/..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
          />

          <button
            onClick={handleFetchLink}
            disabled={fetching}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{fetching ? 'Fetching Details...' : 'Fetch Details'}</span>
          </button>
        </div>
      </div>

      {/* Manual Creation & Preview Form */}
      <div className="p-6 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
          <div>
            <h3 className="text-sm font-black text-white">Manual Post Details & Editor</h3>
            <p className="text-xs text-slate-400">Review or customize media, English/Arabic captions, and author parameters before publishing.</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-500/30">
            {postForm.provider}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Author Name</label>
              <input
                type="text"
                value={postForm.authorName}
                onChange={e => setPostForm({ ...postForm, authorName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Author Handle / Username</label>
              <input
                type="text"
                value={postForm.authorUsername}
                onChange={e => setPostForm({ ...postForm, authorUsername: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Original Post URL</label>
              <input
                type="url"
                value={postForm.originalUrl}
                onChange={e => setPostForm({ ...postForm, originalUrl: e.target.value })}
                placeholder="https://instagram.com/p/..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Caption (English)</label>
              <textarea
                rows={3}
                value={postForm.captionEn}
                onChange={e => setPostForm({ ...postForm, captionEn: e.target.value })}
                placeholder="Enter English caption..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Caption (Arabic)</label>
              <textarea
                rows={3}
                value={postForm.captionAr}
                onChange={e => setPostForm({ ...postForm, captionAr: e.target.value })}
                placeholder="أدخل النص العربي..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-right"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Media Type</label>
              <select
                value={postForm.mediaType}
                onChange={e => setPostForm({ ...postForm, mediaType: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
              >
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="REEL">Reel / Short Video</option>
                <option value="CAROUSEL">Carousel</option>
                <option value="TEXT">Text Only</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-300">Media / Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={postForm.mediaUrl}
                  onChange={e => setPostForm({ ...postForm, mediaUrl: e.target.value, thumbnailUrl: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
                <AdminMediaPicker
                  value={postForm.mediaUrl}
                  onChange={url => setPostForm({ ...postForm, mediaUrl: url, thumbnailUrl: url })}
                />
              </div>
            </div>

            {/* Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Card Preview</span>
              {postForm.mediaUrl ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                  <img src={postForm.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-slate-900 border border-dashed border-slate-800 flex items-center justify-center text-slate-600">
                  No Media Selected
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[var(--border-level-1)]">
          <button
            onClick={handleSavePost}
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Post...' : 'Save & Publish Post'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
