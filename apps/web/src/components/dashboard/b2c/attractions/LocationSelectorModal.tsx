"use client"

import React, { useState, useEffect } from "react"
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
  AlertCircle,
  Edit2,
  Trash2,
  Navigation,
  Globe
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LocationSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  availableLocations: any[]
  currentlyLinkedIds: string[]
  initialEditingLocation?: any | null
  onLinkLocation: (location: any) => void
  onUpdateLocation?: (location: any) => void
  onRefreshLocations: () => Promise<void>
}

export function LocationSelectorModal({
  isOpen,
  onClose,
  availableLocations,
  currentlyLinkedIds,
  initialEditingLocation = null,
  onLinkLocation,
  onUpdateLocation,
  onRefreshLocations
}: LocationSelectorModalProps) {
  const [search, setSearch] = useState("")
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingLocation, setEditingLocation] = useState<any | null>(initialEditingLocation)

  // Form States (for Create and Edit)
  const [nameEn, setNameEn] = useState("")
  const [nameAr, setNameAr] = useState("")
  const [venueEn, setVenueEn] = useState("")
  const [venueAr, setVenueAr] = useState("")
  const [addressEn, setAddressEn] = useState("")
  const [addressAr, setAddressAr] = useState("")
  const [lat, setLat] = useState<number | string>(25.2854)
  const [lng, setLng] = useState<number | string>(51.5310)
  const [operationalStatus, setOperationalStatus] = useState<string>("OPEN")
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>("")
  const [directionsUrl, setDirectionsUrl] = useState<string>("")

  // When opening in edit mode
  useEffect(() => {
    if (initialEditingLocation) {
      startEditLocation(initialEditingLocation)
    }
  }, [initialEditingLocation])

  const startCreateNew = () => {
    setEditingLocation(null)
    setNameEn(search.trim())
    setNameAr("")
    setVenueEn("")
    setVenueAr("")
    setAddressEn("")
    setAddressAr("")
    setLat(25.2854)
    setLng(51.5310)
    setOperationalStatus("OPEN")
    setGoogleMapsUrl("")
    setDirectionsUrl("")
    setIsCreatingNew(true)
  }

  const startEditLocation = (loc: any) => {
    setIsCreatingNew(false)
    setEditingLocation(loc)
    setNameEn(loc.nameEn || "")
    setNameAr(loc.nameAr || "")
    setVenueEn(loc.venueEn || loc.venue || "")
    setVenueAr(loc.venueAr || "")
    setAddressEn(loc.addressEn || loc.address || "")
    setAddressAr(loc.addressAr || "")
    setLat(loc.latitude ?? 25.2854)
    setLng(loc.longitude ?? 51.5310)
    setOperationalStatus(loc.operationalStatus || "OPEN")
    setGoogleMapsUrl(loc.googleMapsUrl || "")
    setDirectionsUrl(loc.directionsUrl || "")
  }

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

  // Submit Handler: Handles both Creation (POST) and Modification (PUT)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameEn.trim()) return

    setIsSaving(true)
    try {
      const parsedLat = parseFloat(String(lat))
      const parsedLng = parseFloat(String(lng))

      const payload = {
        nameEn: nameEn.trim(),
        nameAr: nameAr.trim() || nameEn.trim(),
        venueEn: venueEn.trim() || 'Qatar',
        venueAr: venueAr.trim() || 'قطر',
        addressEn: addressEn.trim() || venueEn.trim(),
        addressAr: addressAr.trim() || venueAr.trim(),
        latitude: !isNaN(parsedLat) ? parsedLat : 25.2854,
        longitude: !isNaN(parsedLng) ? parsedLng : 51.5310,
        operationalStatus,
        googleMapsUrl: googleMapsUrl.trim() || null,
        directionsUrl: directionsUrl.trim() || null,
        publicationStatus: 'PUBLISHED',
        mapVisible: true
      }

      if (editingLocation) {
        // UPDATE EXISTING LOCATION via PUT
        const res = await fetch(`/api/b2c/locations/${editingLocation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to update GIS location')
        }

        const json = await res.json()
        const updated = json.data || json
        await onRefreshLocations()
        if (onUpdateLocation) {
          onUpdateLocation(updated)
        }
        setEditingLocation(null)
      } else {
        // CREATE NEW LOCATION via POST
        const res = await fetch('/api/b2c/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
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
      }
    } catch (err: any) {
      alert(err.message || 'Error saving location')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  const isFormMode = isCreatingNew || Boolean(editingLocation)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-[var(--surface-default)] border border-[var(--border-default)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--surface-subtle)]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-[var(--text-primary)]">
                {editingLocation
                  ? `Edit GIS Location: ${editingLocation.nameEn || 'Venue'}`
                  : isCreatingNew
                  ? 'Create New GIS Location'
                  : 'Link Canonical GIS Location'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {editingLocation
                  ? 'Modify venue details, GPS coordinates, and operating status'
                  : isCreatingNew
                  ? 'Register a new venue coordinate pin for Qatar maps'
                  : 'Select or edit an existing Qatar venue, mall, or coordinate hub'}
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
        {!isFormMode ? (
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
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl ps-10 pe-4 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={startCreateNew}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Location</span>
              </button>
            </div>

            {/* Location Cards */}
            <div className="space-y-3 pt-2">
              {filteredLocations.map(loc => {
                const isLinked = currentlyLinkedIds.includes(loc.id)
                const hasCoordinates = loc.latitude !== null && loc.latitude !== undefined && loc.longitude !== null && loc.longitude !== undefined

                return (
                  <div
                    key={loc.id}
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                      isLinked
                        ? "bg-purple-500/5 border-purple-500/30"
                        : "bg-[var(--surface-subtle)] border-[var(--border-default)] hover:border-[var(--border-hover)]"
                    )}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Building className="w-4 h-4 text-purple-500 shrink-0" />
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

                      <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-tertiary)] ps-6 flex-wrap">
                        <span>Lat: {loc.latitude ?? 'N/A'}</span>
                        <span>Lng: {loc.longitude ?? 'N/A'}</span>
                        {loc.operationalStatus && (
                          <span className={cn(
                            "px-1.5 py-0.5 rounded font-bold uppercase text-[10px]",
                            loc.operationalStatus === 'OPEN' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                          )}>
                            {loc.operationalStatus}
                          </span>
                        )}
                        {!hasCoordinates && (
                          <span className="text-amber-500 font-bold text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-full">
                            ⚠️ GPS Missing
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Edit / Modify Button */}
                      <button
                        type="button"
                        onClick={() => startEditLocation(loc)}
                        title="Edit location name, address, or GPS coordinates"
                        className="px-3 py-2 rounded-xl bg-[var(--surface-default)] hover:bg-purple-500 hover:text-white border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Select / Linked Button */}
                      {isLinked ? (
                        <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold">
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
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
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
                    onClick={startCreateNew}
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
          /* Create / Edit Form */
          <form onSubmit={handleSubmitForm} className="p-6 space-y-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Location Name (EN) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urban Arena – Doha Mall"
                  value={nameEn}
                  onChange={e => setNameEn(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-purple-500 focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Location Name (AR) *</label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: أوربان أرينا – دوحة مول"
                  value={nameAr}
                  onChange={e => setNameAr(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-purple-500 focus:outline-none text-right font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Venue / Mall Context (EN)</label>
                <input
                  type="text"
                  placeholder="e.g. Doha Mall, P Floor, Abu Hamour"
                  value={venueEn}
                  onChange={e => setVenueEn(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Venue Context (AR)</label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: دوحة مول، الطابق P، أبو هامور"
                  value={venueAr}
                  onChange={e => setVenueAr(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-purple-500 focus:outline-none text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Address (EN)</label>
                <input
                  type="text"
                  placeholder="e.g. Abu Hamour, Doha, Qatar"
                  value={addressEn}
                  onChange={e => setAddressEn(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Address (AR)</label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: أبو هامور، الدوحة، قطر"
                  value={addressAr}
                  onChange={e => setAddressAr(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-purple-500 focus:outline-none text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Latitude (GIS) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="25.233187"
                  value={lat}
                  onChange={e => setLat(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-purple-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Longitude (GIS) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="51.506754"
                  value={lng}
                  onChange={e => setLng(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-purple-500 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Operating Status</label>
                <select
                  value={operationalStatus}
                  onChange={e => setOperationalStatus(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-purple-500 focus:outline-none font-bold"
                >
                  <option value="OPEN">OPEN (Active)</option>
                  <option value="TEMPORARILY_CLOSED">TEMPORARILY CLOSED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Google Maps / Directions URL</label>
              <input
                type="url"
                placeholder="https://maps.google.com/?q=25.233187,51.506754"
                value={directionsUrl || googleMapsUrl}
                onChange={e => {
                  setDirectionsUrl(e.target.value)
                  setGoogleMapsUrl(e.target.value)
                }}
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm focus:border-purple-500 focus:outline-none font-mono"
              />
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center gap-3 text-xs text-purple-600 dark:text-purple-400 font-medium">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                {editingLocation
                  ? 'Changes will immediately update the location across the interactive GIS map and linked attractions.'
                  : 'This location will be saved to the canonical GIS location registry and linked to this attraction.'}
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false)
                  setEditingLocation(null)
                }}
                className="px-4 py-2.5 rounded-xl border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] cursor-pointer"
              >
                Back to List
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isSaving
                  ? (editingLocation ? 'Updating Location...' : 'Creating Location...')
                  : (editingLocation ? 'Save Location Changes' : 'Save & Link Location')}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
