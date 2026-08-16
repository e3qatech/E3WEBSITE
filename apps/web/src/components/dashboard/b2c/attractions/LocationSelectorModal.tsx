"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  Search,
  Plus,
  X,
  Check,
  Building,
  ExternalLink,
  DollarSign,
  Clock,
  Sparkles,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LocationSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  availableLocations: any[]
  currentlyLinkedIds: string[]
  onLinkLocation: (location: any) => void
  onRefreshLocations: () => Promise<void>
}

export function LocationSelectorModal({
  isOpen,
  onClose,
  availableLocations,
  currentlyLinkedIds,
  onLinkLocation,
  onRefreshLocations
}: LocationSelectorModalProps) {
  const [search, setSearch] = useState("")
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [isSavingNew, setIsSavingNew] = useState(false)

  // New Location Form
  const [newNameEn, setNewNameEn] = useState("")
  const [newNameAr, setNewNameAr] = useState("")
  const [newVenueEn, setNewVenueEn] = useState("")
  const [newVenueAr, setNewVenueAr] = useState("")
  const [newAddressEn, setNewAddressEn] = useState("")
  const [newAddressAr, setNewAddressAr] = useState("")
  const [newLat, setNewLat] = useState<number | string>(25.2854)
  const [newLng, setNewLng] = useState<number | string>(51.5310)

  const filteredLocations = availableLocations.filter(loc => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      (loc.nameEn || '').toLowerCase().includes(q) ||
      (loc.nameAr || '').includes(q) ||
      (loc.venueEn || '').toLowerCase().includes(q) ||
      (loc.addressEn || '').toLowerCase().includes(q)
    )
  })

  const handleCreateNewLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNameEn.trim()) return

    setIsSavingNew(true)
    try {
      const res = await fetch('/api/b2c/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameEn: newNameEn.trim(),
          nameAr: newNameAr.trim() || newNameEn.trim(),
          venueEn: newVenueEn.trim() || 'Qatar',
          venueAr: newVenueAr.trim() || 'قطر',
          addressEn: newAddressEn.trim() || newVenueEn.trim(),
          addressAr: newAddressAr.trim() || newVenueAr.trim(),
          latitude: parseFloat(String(newLat)) || 25.2854,
          longitude: parseFloat(String(newLng)) || 51.5310,
          operationalStatus: 'OPEN',
          publicationStatus: 'PUBLISHED',
          mapVisible: true
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to create GIS location')
      }

      const json = await res.json()
      const created = json.data || json
      await onRefreshLocations()
      onLinkLocation(created)
      setIsCreatingNew(false)
      onClose()
    } catch (err: any) {
      alert(err.message || 'Error creating location')
    } finally {
      setIsSavingNew(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-[var(--surface-default)] border border-[var(--border-default)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--surface-subtle)]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-[var(--text-primary)]">
                {isCreatingNew ? 'Create New GIS Location' : 'Link Canonical GIS Location'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {isCreatingNew
                  ? 'Register a new venue coordinate pin for Qatar maps'
                  : 'Select an existing Qatar venue, mall, or coordinate hub'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-default)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {!isCreatingNew ? (
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            {/* Search & New button */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder="Search by venue (e.g. Doha Mall, Place Vendôme, City Center)..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl ps-10 pe-4 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>New Location</span>
              </button>
            </div>

            {/* Location Cards */}
            <div className="space-y-3 pt-2">
              {filteredLocations.map(loc => {
                const isLinked = currentlyLinkedIds.includes(loc.id)
                return (
                  <div
                    key={loc.id}
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex items-center justify-between gap-4",
                      isLinked
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : "bg-[var(--surface-subtle)] border-[var(--border-default)] hover:border-[var(--border-hover)]"
                    )}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                        <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{loc.nameEn}</h4>
                        {loc.nameAr && (
                          <span className="text-xs text-[var(--text-secondary)] truncate" dir="rtl">
                            • {loc.nameAr}
                          </span>
                        )}
                      </div>

                      {loc.venueEn && (
                        <p className="text-xs text-[var(--text-secondary)] truncate ps-6">{loc.venueEn}</p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-tertiary)] ps-6">
                        <span>Lat: {loc.latitude ?? 'N/A'}</span>
                        <span>Lng: {loc.longitude ?? 'N/A'}</span>
                        {loc.operationalStatus && (
                          <span className="px-1.5 py-0.2 rounded bg-[var(--surface-default)] text-emerald-500 font-bold uppercase">
                            {loc.operationalStatus}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {isLinked ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Linked</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onLinkLocation(loc)
                            onClose()
                          }}
                          className="px-4 py-2 rounded-xl bg-[var(--surface-default)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] transition-all shadow-sm"
                        >
                          Select Location
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {filteredLocations.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-[var(--border-default)] rounded-2xl space-y-2">
                  <p className="text-xs text-[var(--text-tertiary)]">No matching GIS location found.</p>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(true)}
                    className="text-xs font-bold text-emerald-500 hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create &quot;{search}&quot; as new location</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Inline New Location Creator Form */
          <form onSubmit={handleCreateNewLocation} className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Location Name (EN)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urban Arena – Doha Mall"
                  value={newNameEn}
                  onChange={e => setNewNameEn(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Location Name (AR)</label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: أوربان أرينا – دوحة مول"
                  value={newNameAr}
                  onChange={e => setNewNameAr(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Venue / Mall Context (EN)</label>
                <input
                  type="text"
                  placeholder="e.g. Doha Mall, P Floor, Abu Hamour"
                  value={newVenueEn}
                  onChange={e => setNewVenueEn(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Venue Context (AR)</label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: دوحة مول، الطابق P، أبو هامور"
                  value={newVenueAr}
                  onChange={e => setNewVenueAr(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Latitude (GIS)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="25.233187"
                  value={newLat}
                  onChange={e => setNewLat(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Longitude (GIS)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="51.506754"
                  value={newLng}
                  onChange={e => setNewLng(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>This location will be saved to the canonical GIS location registry and linked to this attraction.</span>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
              >
                Back to List
              </button>

              <button
                type="submit"
                disabled={isSavingNew}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg disabled:opacity-50"
              >
                {isSavingNew ? 'Creating Location...' : 'Save & Link Location'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
