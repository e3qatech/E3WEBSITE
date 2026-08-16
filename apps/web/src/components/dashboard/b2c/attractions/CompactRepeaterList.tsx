"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  Copy,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Tag,
  DollarSign,
  HelpCircle,
  Image as ImageIcon,
  Share2,
  MessageSquare,
  Newspaper,
  ShieldAlert
} from "lucide-react"
import { MediaUploader } from "@/components/ui/MediaUploader"
import { cn } from "@/lib/utils"

interface CompactRepeaterListProps<T> {
  title: string
  subtitle?: string
  items: T[]
  itemType: 'PRICING' | 'GALLERY' | 'FAQ' | 'PARTNER' | 'NEWS' | 'TESTIMONIAL' | 'SOCIAL_LINK'
  bilingualView?: 'BOTH' | 'EN' | 'AR'
  onAdd: () => void
  onUpdate: (index: number, item: T) => void
  onDelete: (index: number) => void
  onDuplicate?: (index: number) => void
  renderCustomHeader?: (item: T, index: number) => React.ReactNode
}

export function CompactRepeaterList<T extends Record<string, any>>({
  title,
  subtitle,
  items,
  itemType,
  bilingualView = 'BOTH',
  onAdd,
  onUpdate,
  onDelete,
  onDuplicate
}: CompactRepeaterListProps<T>) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(items.length === 1 ? 0 : null)
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null)

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx)
  }

  const getItemIcon = () => {
    switch (itemType) {
      case 'PRICING': return <DollarSign className="w-4 h-4 text-emerald-500" />
      case 'GALLERY': return <ImageIcon className="w-4 h-4 text-blue-500" />
      case 'FAQ': return <HelpCircle className="w-4 h-4 text-amber-500" />
      case 'PARTNER': return <Tag className="w-4 h-4 text-purple-500" />
      case 'NEWS': return <Newspaper className="w-4 h-4 text-cyan-500" />
      case 'TESTIMONIAL': return <MessageSquare className="w-4 h-4 text-pink-500" />
      case 'SOCIAL_LINK': return <Share2 className="w-4 h-4 text-indigo-500" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {getItemIcon()}
            <h3 className="text-base font-bold text-[var(--text-primary)]">{title}</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--surface-subtle)] border border-[var(--border-default)] text-[var(--text-secondary)]">
              {items.length}
            </span>
          </div>
          {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] hover:border-[var(--color-primary)] text-[var(--text-primary)] transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--color-primary)]" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const isExp = expandedIndex === index
          return (
            <div
              key={item.id || index}
              className={cn(
                "border rounded-xl transition-all duration-200 overflow-hidden bg-[var(--surface-default)] shadow-sm",
                isExp ? "border-[var(--color-primary)]" : "border-[var(--border-default)] hover:border-[var(--border-hover)]"
              )}
            >
              {/* Card Header Bar */}
              <div
                onClick={() => toggleExpand(index)}
                className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xs font-mono font-bold text-[var(--text-tertiary)] w-5 text-center">
                    {index + 1}
                  </span>

                  {/* Summary preview depending on type */}
                  <div className="min-w-0 flex-1">
                    {itemType === 'PRICING' && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[var(--text-primary)] truncate">
                          {item.titleEn || <span className="text-amber-500 italic">Untitled Pass</span>}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          {item.price ?? 0} {item.currency || 'QAR'}
                        </span>
                        {item.type && (
                          <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold">
                            • {item.type}
                          </span>
                        )}
                      </div>
                    )}

                    {itemType === 'FAQ' && (
                      <div className="text-sm font-bold text-[var(--text-primary)] truncate">
                        {item.questionEn || <span className="text-amber-500 italic">Untitled Question</span>}
                      </div>
                    )}

                    {itemType === 'GALLERY' && (
                      <div className="flex items-center gap-3">
                        {item.url && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-[var(--border-default)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.url} alt="Gallery item" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="text-xs text-[var(--text-secondary)] truncate">
                          {item.captionEn || item.url || <span className="text-amber-500 italic">No URL set</span>}
                        </span>
                      </div>
                    )}

                    {itemType === 'PARTNER' && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--text-primary)] truncate">
                          {item.name || item.titleEn || <span className="text-amber-500 italic">Partner Name</span>}
                        </span>
                        {item.tagline && (
                          <span className="text-xs text-[var(--text-tertiary)] truncate">({item.tagline})</span>
                        )}
                      </div>
                    )}

                    {itemType === 'NEWS' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {item.publisher ? `[${item.publisher}] ` : ''}{item.title || 'News Title'}
                        </span>
                        {item.date && <span className="text-[10px] text-[var(--text-tertiary)]">• {item.date}</span>}
                      </div>
                    )}

                    {itemType === 'TESTIMONIAL' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {item.author || 'Visitor Review'}
                        </span>
                        <span className="text-amber-400 text-xs">{'★'.repeat(item.rating || 5)}</span>
                      </div>
                    )}

                    {itemType === 'SOCIAL_LINK' && (
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="font-bold text-[var(--text-primary)]">{item.platform || 'Platform'}</span>
                        <span className="text-[var(--text-tertiary)] truncate">{item.url || 'No URL'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  {onDuplicate && (
                    <button
                      type="button"
                      onClick={() => onDuplicate(index)}
                      className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-default)] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setConfirmDeleteIndex(index)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleExpand(index)}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Delete confirmation */}
              <AnimatePresence>
                {confirmDeleteIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-red-600 dark:text-red-400">Delete this item?</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteIndex(null)}
                        className="px-2.5 py-1 rounded bg-[var(--surface-default)] border border-[var(--border-default)] font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDeleteIndex(null)
                          onDelete(index)
                        }}
                        className="px-2.5 py-1 rounded bg-red-600 text-white font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expanded Form Fields */}
              <AnimatePresence>
                {isExp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 border-t border-[var(--border-default)] space-y-4"
                  >
                    {/* PRICING FIELDS */}
                    {itemType === 'PRICING' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Pass Title (EN)</label>
                            <input
                              type="text"
                              value={item.titleEn || ''}
                              onChange={e => onUpdate(index, { ...item, titleEn: e.target.value })}
                              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Price (QAR)</label>
                            <input
                              type="number"
                              value={item.price ?? ''}
                              onChange={e => onUpdate(index, { ...item, price: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Pass Title (AR)</label>
                            <input
                              type="text"
                              dir="rtl"
                              value={item.titleAr || ''}
                              onChange={e => onUpdate(index, { ...item, titleAr: e.target.value })}
                              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Pass Category (Controlled Enum)</label>
                            <select
                              value={item.type || 'ACCESS_PASS'}
                              onChange={e => onUpdate(index, { ...item, type: e.target.value })}
                              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                            >
                              <option value="ACCESS_PASS">ACCESS_PASS (Rookie, Pro, All-Day, Single Game Entry)</option>
                              <option value="PREMIUM_ACTIVITY">PREMIUM_ACTIVITY (Laser Tag, Paintless Paintball, Archery)</option>
                              <option value="HOURLY_ACTIVITY">HOURLY_ACTIVITY (Billiards, AR Billiards, Hourly Rentals)</option>
                              <option value="ADD_ON">ADD_ON (Socks, Tokens, Lockers, Merchandise)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Description (EN)</label>
                            <input
                              type="text"
                              value={item.descriptionEn || ''}
                              onChange={e => onUpdate(index, { ...item, descriptionEn: e.target.value })}
                              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Description (AR)</label>
                            <input
                              type="text"
                              dir="rtl"
                              value={item.descriptionAr || ''}
                              onChange={e => onUpdate(index, { ...item, descriptionAr: e.target.value })}
                              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs focus:border-[var(--color-primary)] focus:outline-none text-right"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FAQ FIELDS */}
                    {itemType === 'FAQ' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Question (EN)</label>
                            <input
                              type="text"
                              value={item.questionEn || ''}
                              onChange={e => onUpdate(index, { ...item, questionEn: e.target.value })}
                              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Question (AR)</label>
                            <input
                              type="text"
                              dir="rtl"
                              value={item.questionAr || ''}
                              onChange={e => onUpdate(index, { ...item, questionAr: e.target.value })}
                              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Answer (EN)</label>
                            <textarea
                              rows={2}
                              value={item.answerEn || ''}
                              onChange={e => onUpdate(index, { ...item, answerEn: e.target.value })}
                              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl p-3 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Answer (AR)</label>
                            <textarea
                              rows={2}
                              dir="rtl"
                              value={item.answerAr || ''}
                              onChange={e => onUpdate(index, { ...item, answerAr: e.target.value })}
                              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl p-3 text-xs focus:border-[var(--color-primary)] focus:outline-none text-right"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* GALLERY FIELDS */}
                    {itemType === 'GALLERY' && (
                      <div className="space-y-3">
                        <MediaUploader
                          value={item.url || ''}
                          onChange={url => onUpdate(index, { ...item, url })}
                          placeholder="Upload or enter gallery media URL"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Caption (EN)"
                            value={item.captionEn || ''}
                            onChange={e => onUpdate(index, { ...item, captionEn: e.target.value })}
                            className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                          />
                          <input
                            type="text"
                            dir="rtl"
                            placeholder="تعليق الصورة (AR)"
                            value={item.captionAr || ''}
                            onChange={e => onUpdate(index, { ...item, captionAr: e.target.value })}
                            className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs focus:border-[var(--color-primary)] focus:outline-none text-right"
                          />
                        </div>
                      </div>
                    )}

                    {/* PARTNER FIELDS */}
                    {itemType === 'PARTNER' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Partner Name (e.g. Visit Qatar)"
                            value={item.name || ''}
                            onChange={e => onUpdate(index, { ...item, name: e.target.value })}
                            className="sm:col-span-2 w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Discount / Tagline"
                            value={item.tagline || item.discount || ''}
                            onChange={e => onUpdate(index, { ...item, tagline: e.target.value, discount: e.target.value })}
                            className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                          />
                        </div>
                        <MediaUploader
                          value={item.logoUrl || item.logo || item.image || ''}
                          onChange={url => onUpdate(index, { ...item, logoUrl: url, logo: url, image: url })}
                          placeholder="Partner Logo URL"
                        />
                      </div>
                    )}

                    {/* SOCIAL LINK FIELDS */}
                    {itemType === 'SOCIAL_LINK' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select
                          value={item.platform || 'Instagram'}
                          onChange={e => onUpdate(index, { ...item, platform: e.target.value })}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none font-bold"
                        >
                          <option>Instagram</option>
                          <option>TikTok</option>
                          <option>X / Twitter</option>
                          <option>Facebook</option>
                          <option>LinkedIn</option>
                          <option>YouTube</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Profile or Channel URL"
                          value={item.url || ''}
                          onChange={e => onUpdate(index, { ...item, url: e.target.value })}
                          className="sm:col-span-2 w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none font-mono"
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {items.length === 0 && (
          <div className="p-8 border-2 border-dashed border-[var(--border-default)] rounded-2xl text-center space-y-2">
            <p className="text-xs text-[var(--text-tertiary)] font-medium">No items added yet.</p>
            <button
              type="button"
              onClick={onAdd}
              className="text-xs font-bold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add first item</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
