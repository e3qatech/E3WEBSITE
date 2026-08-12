"use client";

import React, { useState } from 'react';
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  Pin, 
  Star, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { useToast } from '@/components/dashboard/ui/ToastProvider';

interface ContentLibraryTabProps {
  posts: any[];
  onRefresh: () => void;
}

export function ContentLibraryTab({ posts, onRefresh }: ContentLibraryTabProps) {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [search, setSearch] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('ALL');
  const [filterModeration, setFilterModeration] = useState<string>('ALL');
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [editingPost, setEditingPost] = useState<any | null>(null);

  const filteredPosts = posts.filter(post => {
    if (search) {
      const q = search.toLowerCase();
      const matchText = (post.captionEn || '') + (post.captionAr || '') + (post.authorName || '');
      if (!matchText.toLowerCase().includes(q)) return false;
    }
    if (filterProvider !== 'ALL' && post.provider !== filterProvider) return false;
    if (filterModeration !== 'ALL' && post.moderationStatus !== filterModeration) return false;
    return true;
  });

  const handleTogglePin = async (post: any) => {
    try {
      const res = await fetch('/api/admin/social-media/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id, isPinned: !post.isPinned }),
      });
      if (res.ok) {
        toast(`Updated pin status for post ${post.id}`, 'success');
        onRefresh();
      }
    } catch (_e) {
      toast('Failed to update pin status', 'error');
    }
  };

  const handleToggleFeature = async (post: any) => {
    try {
      const res = await fetch('/api/admin/social-media/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id, isFeatured: !post.isFeatured }),
      });
      if (res.ok) {
        toast(`Updated feature status for post ${post.id}`, 'success');
        onRefresh();
      }
    } catch (_e) {
      toast('Failed to update feature status', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, status: string, moderationStatus: string) => {
    try {
      const res = await fetch('/api/admin/social-media/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, moderationStatus }),
      });
      if (res.ok) {
        toast('Post moderation status updated', 'success');
        onRefresh();
      }
    } catch (_e) {
      toast('Failed to update post moderation', 'error');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPostIds.length === 0) return;
    try {
      const res = await fetch('/api/admin/social-media/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedPostIds, moderationStatus: 'APPROVED', status: 'PUBLISHED' }),
      });
      if (res.ok) {
        toast(`Approved ${selectedPostIds.length} posts`, 'success');
        setSelectedPostIds([]);
        onRefresh();
      }
    } catch (_e) {
      toast('Bulk approval failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter & View Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)]">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search captions, authors..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
          </div>

          <select
            value={filterProvider}
            onChange={e => setFilterProvider(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
          >
            <option value="ALL">All Platforms</option>
            <option value="META_INSTAGRAM">Instagram</option>
            <option value="META_FACEBOOK">Facebook</option>
            <option value="TIKTOK">TikTok</option>
            <option value="YOUTUBE">YouTube</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="MANUAL">Manual</option>
          </select>

          <select
            value={filterModeration}
            onChange={e => setFilterModeration(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
          >
            <option value="ALL">All Moderation</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending Review</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {selectedPostIds.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all"
            >
              Approve ({selectedPostIds.length})
            </button>
          )}

          <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer ${viewMode === 'GRID' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer ${viewMode === 'TABLE' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPosts.map(post => (
            <div key={post.id} className="rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] overflow-hidden shadow-sm flex flex-col justify-between group">
              <div className="relative aspect-[4/5] bg-slate-950 overflow-hidden">
                <img
                  src={post.mediaUrl || post.thumbnailUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop'}
                  alt={post.captionEn || 'Social post'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40 p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-purple-300 border border-purple-500/30">
                      {post.provider}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePin(post)}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-all ${post.isPinned ? 'bg-amber-500 text-slate-950' : 'bg-slate-950/60 text-slate-300'}`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleFeature(post)}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-all ${post.isFeatured ? 'bg-pink-500 text-white' : 'bg-slate-950/60 text-slate-300'}`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <img
                        src={post.authorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                        alt={post.authorName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="line-clamp-1">{post.authorName}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">{post.captionEn || post.rawCaption || 'No caption'}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 border-t border-[var(--border-level-1)] flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  post.moderationStatus === 'APPROVED' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                }`}>
                  {post.moderationStatus}
                </span>

                <div className="flex items-center gap-1">
                  {post.moderationStatus !== 'APPROVED' && (
                    <button
                      onClick={() => handleUpdateStatus(post.id, 'PUBLISHED', 'APPROVED')}
                      className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded-lg"
                      title="Approve"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {post.moderationStatus !== 'REJECTED' && (
                    <button
                      onClick={() => handleUpdateStatus(post.id, 'HIDDEN', 'REJECTED')}
                      className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg"
                      title="Reject"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <a
                    href={post.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-[var(--border-level-1)] bg-[var(--surface-default)] overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-[var(--border-level-1)] text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Post</th>
                <th className="p-3">Provider</th>
                <th className="p-3">Author</th>
                <th className="p-3">Engagement</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-level-1)]">
              {filteredPosts.map(post => (
                <tr key={post.id} className="hover:bg-slate-950/30">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={post.mediaUrl || post.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-10 h-10 rounded-lg object-cover border border-purple-500/30"
                    />
                    <div className="max-w-xs">
                      <div className="font-bold text-white line-clamp-1">{post.captionEn || 'No caption'}</div>
                      <div className="text-[10px] text-slate-400">{new Date(post.publishedAt).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-purple-300">{post.provider}</td>
                  <td className="p-3">{post.authorName} (@{post.authorUsername})</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span>❤️ {post.likeCount}</span>
                      <span>💬 {post.commentCount}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      post.moderationStatus === 'APPROVED' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                    }`}>
                      {post.moderationStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleTogglePin(post)}
                        className={`p-1 rounded ${post.isPinned ? 'text-amber-400' : 'text-slate-500'}`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <a href={post.originalUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
