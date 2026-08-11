"use client"

import { useState } from 'react'
import { Video, Image as ImageIcon, Box, Frame, Sparkles, Layers, Sliders, ShieldCheck } from 'lucide-react'
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
  altTextAr: 'وسائط القسام',
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
}

export function UniversalMediaSectionEditor({
  title,
  subtitle = "Configure Hero or Footer media supporting Image, Video, 3D GLB Models, Embed IFrames, and Fallback Images.",
  value,
  onChange,
  accentColor = "purple"
}: UniversalMediaSectionEditorProps) {
  const mediaConfig: UniversalMediaConfig = {
    ...DEFAULT_UNIVERSAL_MEDIA,
    ...(value || {})
  }

  const updateField = (field: keyof UniversalMediaConfig, val: any) => {
    onChange({
      ...mediaConfig,
      [field]: val
    })
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className={`text-base font-bold flex items-center gap-2 text-${accentColor}-400`}>
            <Sparkles className="w-5 h-5" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-slate-950 border border-slate-800 text-slate-300">
          Media Mode: {mediaConfig.mediaType}
        </span>
      </div>

      {/* 1. Media Type Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => updateField('mediaType', 'IMAGE')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
            mediaConfig.mediaType === 'IMAGE'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-md'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <ImageIcon className="w-5 h-5 mb-1 text-blue-400" />
          <span>Image</span>
        </button>

        <button
          type="button"
          onClick={() => updateField('mediaType', 'VIDEO')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
            mediaConfig.mediaType === 'VIDEO'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-md'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Video className="w-5 h-5 mb-1 text-purple-400" />
          <span>Video Loop (.mp4)</span>
        </button>

        <button
          type="button"
          onClick={() => updateField('mediaType', 'MODEL_3D')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
            mediaConfig.mediaType === 'MODEL_3D'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Box className="w-5 h-5 mb-1 text-amber-400" />
          <span>3D Model (.glb)</span>
        </button>

        <button
          type="button"
          onClick={() => updateField('mediaType', 'IFRAME')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
            mediaConfig.mediaType === 'IFRAME'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Frame className="w-5 h-5 mb-1 text-emerald-400" />
          <span>IFrame Embed</span>
        </button>
      </div>

      {/* 2. Main Media Asset Input with Library & Local Upload */}
      <div className="space-y-4 pt-2 border-t border-slate-800/80">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Main Media Asset URL ({mediaConfig.mediaType})
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mediaConfig.mediaUrl || ''}
              onChange={(e) => updateField('mediaUrl', e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
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
              accept={
                mediaConfig.mediaType === 'IMAGE' ? 'image/*' :
                mediaConfig.mediaType === 'VIDEO' ? 'video/*' :
                mediaConfig.mediaType === 'MODEL_3D' ? '.glb,.gltf' :
                '*'
              }
            />
          </div>
        </div>

        {/* 3. Fallback Image for 3D / Video / IFrame & Low Power Devices */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
            <span>Fallback Poster & Image URL</span>
            <span className="text-[10px] text-slate-400 font-normal">Displayed while loading or on mobile devices</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mediaConfig.fallbackImage || ''}
              onChange={(e) => updateField('fallbackImage', e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              placeholder="https://images.unsplash.com/..."
            />
            <AdminMediaPicker
              value={mediaConfig.fallbackImage || ''}
              onChange={(url: string) => updateField('fallbackImage', url)}
              label="Fallback Image"
              accept="image/*"
            />
          </div>
        </div>

        {/* 4. Type Specific Settings */}
        {mediaConfig.mediaType === 'VIDEO' && (
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={mediaConfig.autoPlay !== false}
                onChange={(e) => updateField('autoPlay', e.target.checked)}
                className="rounded border-slate-700 accent-purple-500"
              />
              <span>Auto Play</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={mediaConfig.loop !== false}
                onChange={(e) => updateField('loop', e.target.checked)}
                className="rounded border-slate-700 accent-purple-500"
              />
              <span>Loop Video</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={mediaConfig.muted !== false}
                onChange={(e) => updateField('muted', e.target.checked)}
                className="rounded border-slate-700 accent-purple-500"
              />
              <span>Muted Audio</span>
            </label>
          </div>
        )}

        {mediaConfig.mediaType === 'MODEL_3D' && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">3D Model Scale</label>
              <input
                type="number"
                step="0.1"
                value={mediaConfig.threeDScale || 1}
                onChange={(e) => updateField('threeDScale', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 mt-5">
              <input
                type="checkbox"
                checked={mediaConfig.threeDRotation !== false}
                onChange={(e) => updateField('threeDRotation', e.target.checked)}
                className="rounded border-slate-700 accent-amber-500"
              />
              <span>Auto 360° Rotation</span>
            </label>
          </div>
        )}

        {mediaConfig.mediaType === 'IFRAME' && (
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">IFrame Embed Height (px)</label>
            <input
              type="number"
              value={mediaConfig.iframeHeight || 450}
              onChange={(e) => updateField('iframeHeight', parseInt(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
            />
          </div>
        )}
      </div>
    </div>
  )
}
