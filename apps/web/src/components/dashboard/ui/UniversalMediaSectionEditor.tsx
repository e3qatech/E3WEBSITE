"use client"

import { Box, Eye, Frame, Image as ImageIcon, Sparkles, Video } from 'lucide-react'
import { AdminMediaPicker } from './AdminMediaPicker'

export interface UniversalMediaConfig {
  mediaType: 'IMAGE' | 'VIDEO' | 'MODEL_3D' | 'IFRAME'
  mediaUrl: string
  fallbackImage: string
  posterUrl?: string
  altTextEn?: string
  altTextAr?: string
  aspectRatio?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  iframeHeight?: number
  threeDScale?: number
  threeDRotation?: boolean
}

export const DEFAULT_UNIVERSAL_MEDIA: UniversalMediaConfig = {
  mediaType: 'IMAGE',
  mediaUrl: '',
  fallbackImage: '',
  posterUrl: '',
  altTextEn: 'Section Media',
  altTextAr: 'وسائط القسم',
  aspectRatio: '16/9',
  autoPlay: true,
  loop: true,
  muted: true,
  iframeHeight: 450,
  threeDScale: 1,
  threeDRotation: true
}

interface UniversalMediaSectionEditorProps {
  title: string
  subtitle?: string
  value: Partial<UniversalMediaConfig>
  onChange: (updated: UniversalMediaConfig) => void
  accentColor?: string
  onUploadStatusChange?: (uploading: boolean) => void
}

import { resolveMediaType } from '@/lib/media-resolver'

export function UniversalMediaSectionEditor({
  title,
  subtitle = "Configure Hero or Footer media supporting Image, Video, 3D GLB Models, Embed IFrames, and Fallback Images.",
  value,
  onChange,
  accentColor: _accentColor = "purple",
  onUploadStatusChange
}: UniversalMediaSectionEditorProps) {
  const mediaConfig: UniversalMediaConfig = {
    ...DEFAULT_UNIVERSAL_MEDIA,
    ...(value || {})
  }

  const updateField = (field: keyof UniversalMediaConfig, val: any) => {
    if (field === 'mediaUrl' && typeof val === 'string') {
      const autoType = resolveMediaType({ url: val, explicitType: mediaConfig.mediaType })
      onChange({
        ...mediaConfig,
        mediaUrl: val,
        mediaType: autoType,
      })
    } else {
      onChange({
        ...mediaConfig,
        [field]: val
      })
    }
  }

  return (
    <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-2xl p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-3">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
        </div>

        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-[var(--bg-level-1)] border border-[var(--border-level-1)] text-[var(--text-secondary)]">
          Media Mode: {mediaConfig.mediaType}
        </span>
      </div>

      {/* 1. Media Type Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => updateField('mediaType', 'IMAGE')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            mediaConfig.mediaType === 'IMAGE'
              ? 'bg-[var(--surface-selected)] text-[var(--color-primary)] border-[var(--color-primary)] shadow-sm'
              : 'bg-[var(--bg-level-1)] text-[var(--text-secondary)] border-[var(--border-level-1)] hover:text-[var(--text-primary)]'
          }`}
        >
          <ImageIcon className="w-5 h-5 mb-1 text-blue-500" />
          <span>Image</span>
        </button>

        <button
          type="button"
          onClick={() => updateField('mediaType', 'VIDEO')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            mediaConfig.mediaType === 'VIDEO'
              ? 'bg-[var(--surface-selected)] text-[var(--color-primary)] border-[var(--color-primary)] shadow-sm'
              : 'bg-[var(--bg-level-1)] text-[var(--text-secondary)] border-[var(--border-level-1)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Video className="w-5 h-5 mb-1 text-purple-500" />
          <span>Video Loop (.mp4)</span>
        </button>

        <button
          type="button"
          onClick={() => updateField('mediaType', 'MODEL_3D')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            mediaConfig.mediaType === 'MODEL_3D'
              ? 'bg-[var(--surface-selected)] text-[var(--color-primary)] border-[var(--color-primary)] shadow-sm'
              : 'bg-[var(--bg-level-1)] text-[var(--text-secondary)] border-[var(--border-level-1)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Box className="w-5 h-5 mb-1 text-amber-500" />
          <span>3D Model (.glb)</span>
        </button>

        <button
          type="button"
          onClick={() => updateField('mediaType', 'IFRAME')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            mediaConfig.mediaType === 'IFRAME'
              ? 'bg-[var(--surface-selected)] text-[var(--color-primary)] border-[var(--color-primary)] shadow-sm'
              : 'bg-[var(--bg-level-1)] text-[var(--text-secondary)] border-[var(--border-level-1)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Frame className="w-5 h-5 mb-1 text-emerald-500" />
          <span>IFrame Embed</span>
        </button>
      </div>

      {/* 2. Main Media Asset Input with Library & Local Upload */}
      <div className="space-y-4 pt-2 border-t border-[var(--border-level-1)]">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
            Main Media Asset URL ({mediaConfig.mediaType})
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mediaConfig.mediaUrl || ''}
              onChange={(e) => updateField('mediaUrl', e.target.value)}
              className="flex-1 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--text-tertiary)]"
              placeholder={
                mediaConfig.mediaType === 'IMAGE' ? 'https://images.unsplash.com/...' :
                mediaConfig.mediaType === 'VIDEO' ? 'https://assets.mixkit.co/...' :
                mediaConfig.mediaType === 'MODEL_3D' ? 'https://cdn.example.com/model.glb' :
                'https://www.youtube.com/embed/...'
              }
            />
            <AdminMediaPicker
              value={mediaConfig.mediaUrl || ''}
              onChange={(url: string) => updateField('mediaUrl', url)}
              label="Choose / Upload"
              accept="*"
              onUploadStatusChange={onUploadStatusChange}
            />
          </div>
        </div>

        {/* Live Media Preview Box */}
        {mediaConfig.mediaUrl && (
          <div className="p-3 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>Active Live Media Preview:</span>
              </span>
              <span className="uppercase text-[10px] text-[var(--color-primary)] bg-[var(--surface-selected)] px-2 py-0.5 rounded font-extrabold">
                {mediaConfig.mediaType}
              </span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-[var(--border-level-1)] max-h-48 flex items-center justify-center bg-black/40">
              {mediaConfig.mediaType === 'VIDEO' ? (
                <video
                  src={mediaConfig.mediaUrl}
                  poster={mediaConfig.fallbackImage || mediaConfig.posterUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="max-h-48 w-full object-cover"
                />
              ) : mediaConfig.mediaType === 'IFRAME' ? (
                <iframe src={mediaConfig.mediaUrl} className="w-full h-36 border-none" allow="autoplay; fullscreen" />
              ) : (
                <img
                  src={mediaConfig.mediaUrl}
                  alt="Media Preview"
                  className="max-h-48 w-full object-cover"
                />
              )}
            </div>
          </div>
        )}

        {/* 3. Fallback Image for 3D / Video / IFrame & Low Power Devices */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 flex items-center justify-between">
            <span>Fallback Poster & Image URL</span>
            <span className="text-[10px] text-[var(--text-tertiary)] font-normal">Displayed while loading or on mobile devices</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mediaConfig.fallbackImage || ''}
              onChange={(e) => updateField('fallbackImage', e.target.value)}
              className="flex-1 bg-[var(--bg-level-1)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--text-tertiary)]"
              placeholder="https://images.unsplash.com/..."
            />
            <AdminMediaPicker
              value={mediaConfig.fallbackImage || ''}
              onChange={(url: string) => updateField('fallbackImage', url)}
              label="Fallback Image"
              accept="image/*"
              onUploadStatusChange={onUploadStatusChange}
            />
          </div>
        </div>

        {/* 4. Type Specific Settings */}
        {mediaConfig.mediaType === 'VIDEO' && (
          <div className="grid grid-cols-3 gap-3 p-3 bg-[var(--bg-level-1)] rounded-xl border border-[var(--border-level-1)] text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={mediaConfig.autoPlay !== false}
                onChange={(e) => updateField('autoPlay', e.target.checked)}
                className="rounded accent-[var(--color-primary)]"
              />
              <span>Auto Play</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={mediaConfig.loop !== false}
                onChange={(e) => updateField('loop', e.target.checked)}
                className="rounded accent-[var(--color-primary)]"
              />
              <span>Loop Video</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={mediaConfig.muted !== false}
                onChange={(e) => updateField('muted', e.target.checked)}
                className="rounded accent-[var(--color-primary)]"
              />
              <span>Muted Audio</span>
            </label>
          </div>
        )}

        {mediaConfig.mediaType === 'MODEL_3D' && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-[var(--bg-level-1)] rounded-xl border border-[var(--border-level-1)] text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">3D Model Scale</label>
              <input
                type="number"
                step="0.1"
                value={mediaConfig.threeDScale || 1}
                onChange={(e) => updateField('threeDScale', parseFloat(e.target.value))}
                className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-primary)]"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-[var(--text-primary)] mt-5">
              <input
                type="checkbox"
                checked={mediaConfig.threeDRotation !== false}
                onChange={(e) => updateField('threeDRotation', e.target.checked)}
                className="rounded accent-[var(--color-primary)]"
              />
              <span>Auto 360° Rotation</span>
            </label>
          </div>
        )}

        {mediaConfig.mediaType === 'IFRAME' && (
          <div className="p-3 bg-[var(--bg-level-1)] rounded-xl border border-[var(--border-level-1)] text-xs">
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">IFrame Embed Height (px)</label>
            <input
              type="number"
              value={mediaConfig.iframeHeight || 450}
              onChange={(e) => updateField('iframeHeight', parseInt(e.target.value))}
              className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-primary)]"
            />
          </div>
        )}
      </div>
    </div>
  )
}
