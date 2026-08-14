"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Search, 
  Plus, 
  Save, 
  Trash2, 
  Edit3, 
  X, 
  Compass, 
  Upload,
  Loader2,
  AlertCircle
} from 'lucide-react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { DARK_MAP_STYLE } from '@/components/map/map-config';
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardLoadingState,
} from '@/components/dashboard/ui';

export function LocationManager() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPubStatus, setSelectedPubStatus] = useState('ALL');

  // Edit Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Map Picker State
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/b2c/locations');
      if (res.ok) {
        const json = await res.json();
        setLocations(json.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch locations", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openCreateDrawer = () => {
    setEditingLocation({
      nameEn: '',
      nameAr: '',
      venueEn: 'Qatar',
      venueAr: 'قطر',
      addressEn: 'Lusail Boulevard, Qatar',
      addressAr: 'شارع لوسيل التجاري، قطر',
      shortDescriptionEn: '',
      shortDescriptionAr: '',
      latitude: 25.418,
      longitude: 51.530,
      locationType: 'PERMANENT_ATTRACTION',
      operationalStatus: 'OPEN',
      publicationStatus: 'PUBLISHED',
      pinColorToken: 'CYAN',
      featured: false,
      mapVisible: true,
      googleMapsUrl: '',
      directionsUrl: '',
      ticketingUrl: '',
      coverMediaUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop'
    });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (loc: any) => {
    setEditingLocation({
      ...loc,
      latitude: loc.latitude ?? 25.418,
      longitude: loc.longitude ?? 51.530
    });
    setIsDrawerOpen(true);
  };

  // Initialize MapLibre Interactive Picker in Drawer with Resize Fix
  useEffect(() => {
    if (!isDrawerOpen || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialLat = editingLocation?.latitude || 25.418;
    const initialLng = editingLocation?.longitude || 51.530;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: DARK_MAP_STYLE,
      center: [initialLng, initialLat],
      zoom: 12
    });

    const el = document.createElement('div');
    el.className = 'group relative cursor-grab z-30 transition-transform hover:scale-125';
    el.innerHTML = `
      <div class="flex flex-col items-center">
        <div class="px-2.5 py-1 rounded-full bg-slate-900 text-amber-300 border border-amber-400 text-[11px] font-bold shadow-2xl backdrop-blur-md mb-1 whitespace-nowrap">
          📍 Drag or Click Location Pin
        </div>
        <div class="relative w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl shadow-blue-500/50 flex items-center justify-center text-white">
          <div class="w-2.5 h-2.5 rounded-full bg-white animate-ping"></div>
        </div>
      </div>
    `;

    const marker = new maplibregl.Marker({ element: el, draggable: true, anchor: 'bottom' })
      .setLngLat([initialLng, initialLat])
      .addTo(map);

    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      setEditingLocation((prev: any) => ({
        ...prev,
        latitude: Math.round(lngLat.lat * 100000) / 100000,
        longitude: Math.round(lngLat.lng * 100000) / 100000
      }));
    });

    map.on('click', (e: any) => {
      const { lng, lat } = e.lngLat;
      marker.setLngLat([lng, lat]);
      setEditingLocation((prev: any) => ({
        ...prev,
        latitude: Math.round(lat * 100000) / 100000,
        longitude: Math.round(lng * 100000) / 100000
      }));
    });

    map.on('load', () => {
      map.resize();
    });

    // Trigger map.resize after drawer animation finishes
    const timer = setTimeout(() => {
      map.resize();
    }, 350);

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          if (typeof mapInstanceRef.current.remove === 'function') {
            mapInstanceRef.current.remove();
          }
        } catch (_e) {
          // Ignore cleanup errors on unmounted drawer
        }
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
    };
  }, [isDrawerOpen]);

  // Keep Map Marker Position Sync'd with State
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current && editingLocation) {
      const lat = parseFloat(editingLocation.latitude);
      const lng = parseFloat(editingLocation.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        markerRef.current.setLngLat([lng, lat]);
        mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 13, duration: 800 });
      }
    }
  }, [editingLocation?.latitude, editingLocation?.longitude]);

  // Local Media File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      if (res.ok && json.url) {
        setEditingLocation((prev: any) => ({ ...prev, coverMediaUrl: json.url }));
        setMessage({ type: 'success', text: 'Cover photo uploaded successfully!' });
      } else {
        throw new Error(json.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setMessage({ type: 'error', text: err.message || 'File upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation?.nameEn || !editingLocation?.nameAr) {
      setMessage({ type: 'error', text: 'English and Arabic Names are required.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const isEdit = Boolean(editingLocation.id);
      const url = isEdit ? `/api/b2c/locations/${editingLocation.id}` : '/api/b2c/locations';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLocation)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save location');

      setMessage({ type: 'success', text: isEdit ? 'Location updated successfully!' : 'Location created successfully!' });
      fetchLocations();
      setTimeout(() => setIsDrawerOpen(false), 1200);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving location' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    try {
      const res = await fetch(`/api/b2c/locations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLocations();
      }
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      (loc.nameEn || '').toLowerCase().includes(q) ||
      (loc.nameAr || '').toLowerCase().includes(q) ||
      (loc.venueEn || '').toLowerCase().includes(q) ||
      (loc.addressEn || '').toLowerCase().includes(q);

    const matchType = selectedType === 'ALL' || loc.locationType === selectedType;
    const matchStatus = selectedStatus === 'ALL' || loc.operationalStatus === selectedStatus;
    const matchPub = selectedPubStatus === 'ALL' || loc.publicationStatus === selectedPubStatus;

    return matchSearch && matchType && matchStatus && matchPub;
  });

  return (
    <DashboardPageShell variant="wide">
      {/* Header Bar */}
      <DashboardPageHeader
        title="Attractions & Venues Location Manager"
        description="Manage canonical GIS coordinates, bilingual venue details, map pin styles, and operational visibility across Qatar."
        breadcrumbs={[
          { label: "B2C Content", href: "/dashboard/b2c/attractions" },
          { label: "Locations & Map GIS" },
        ]}
        badge={{ label: "GIS Engine", variant: "cyan" }}
        primaryAction={{
          label: "Add New Location",
          onClick: openCreateDrawer,
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[var(--surface-default)] p-4 rounded-2xl border border-[var(--border-level-2)]">
        <div className="relative">
          <Search className="w-4 h-4 absolute top-3 start-3 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search venue or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-9 pe-3 py-2 bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--e3-royal-blue)]"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
        >
          <option value="ALL">All Location Types</option>
          <option value="PERMANENT_ATTRACTION">Permanent Attraction</option>
          <option value="MALL_ACTIVATION">Mall Activation</option>
          <option value="SEASONAL_ATTRACTION">Seasonal Attraction</option>
          <option value="EVENT">Event</option>
          <option value="ACTIVE_PROJECT">Active Project</option>
          <option value="OFFICE">Office</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
        >
          <option value="ALL">All Operational Statuses</option>
          <option value="OPEN">Open</option>
          <option value="COMING_SOON">Coming Soon</option>
          <option value="TEMPORARILY_CLOSED">Temporarily Closed</option>
          <option value="SEASONAL">Seasonal</option>
        </select>

        <select
          value={selectedPubStatus}
          onChange={(e) => setSelectedPubStatus(e.target.value)}
          className="bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
        >
          <option value="ALL">All Publication Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Locations Table List */}
      <div className="rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-default)] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[var(--surface-hover)] text-[var(--text-tertiary)] uppercase font-mono border-b border-[var(--border-level-2)]">
              <tr>
                <th className="px-6 py-4 text-start font-bold">Venue & Name</th>
                <th className="px-6 py-4 text-start font-bold">Type</th>
                <th className="px-6 py-4 text-start font-bold">GPS Coordinates</th>
                <th className="px-6 py-4 text-start font-bold">Status</th>
                <th className="px-6 py-4 text-start font-bold">Visibility</th>
                <th className="px-6 py-4 text-end font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-level-2)] font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-tertiary)] font-mono animate-pulse">
                    Loading location points...
                  </td>
                </tr>
              ) : filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-tertiary)] font-medium">
                    No matching location records found.
                  </td>
                </tr>
              ) : (
                filteredLocations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-[var(--surface-hover)]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {loc.coverMediaUrl && (
                          <img src={loc.coverMediaUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-[var(--border-level-2)] shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-[var(--text-primary)] font-display uppercase">{loc.nameEn}</div>
                          <div className="text-[11px] text-[var(--text-secondary)] font-mono">{loc.venueEn || loc.addressEn || 'Qatar'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-[var(--text-secondary)] uppercase">
                      {loc.locationType}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-[var(--e3-royal-blue)] font-bold">
                      {loc.latitude && loc.longitude ? `${loc.latitude}, ${loc.longitude}` : <span className="text-rose-400">Missing Lat/Lng</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                        loc.operationalStatus === 'OPEN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {loc.operationalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                        loc.publicationStatus === 'PUBLISHED' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-zinc-700 text-zinc-300'
                      }`}>
                        {loc.publicationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-end space-x-2">
                      <button
                        onClick={() => openEditDrawer(loc)}
                        className="p-2 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--e3-royal-blue)] text-white transition-all inline-flex items-center justify-center cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc.id)}
                        className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-all inline-flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Drawer Modal */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl bg-[var(--bg-level-1)] border-s border-[var(--border-level-2)] h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border-level-2)] pb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[var(--e3-royal-blue)]" />
                    <h2 className="text-xl font-bold font-display uppercase text-[var(--text-primary)]">
                      {editingLocation?.id ? 'Edit Location' : 'Create Location'}
                    </h2>
                  </div>
                  <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-zinc-400 hover:text-white cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {message && (
                  <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                    <span>{message.text}</span>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                  {/* Bilingual Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-[var(--text-tertiary)] uppercase mb-1">Name (English) *</label>
                      <input
                        type="text"
                        required
                        value={editingLocation?.nameEn || ''}
                        onChange={(e) => setEditingLocation({ ...editingLocation, nameEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs text-[var(--text-primary)] focus:border-[var(--e3-royal-blue)]"
                        placeholder="e.g. InflataRUN Lusail"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-[var(--text-tertiary)] uppercase mb-1">Name (Arabic) *</label>
                      <input
                        type="text"
                        required
                        dir="rtl"
                        value={editingLocation?.nameAr || ''}
                        onChange={(e) => setEditingLocation({ ...editingLocation, nameAr: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs text-[var(--text-primary)] focus:border-[var(--e3-royal-blue)] text-right"
                        placeholder="مثال: إنفلاتا ران لوسيل"
                      />
                    </div>
                  </div>

                  {/* Bilingual Venue & Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-[var(--text-tertiary)] uppercase mb-1">Venue / Mall (EN)</label>
                      <input
                        type="text"
                        value={editingLocation?.venueEn || ''}
                        onChange={(e) => setEditingLocation({ ...editingLocation, venueEn: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs text-[var(--text-primary)]"
                        placeholder="e.g. Lusail Boulevard"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold text-[var(--text-tertiary)] uppercase mb-1">Venue / Mall (AR)</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={editingLocation?.venueAr || ''}
                        onChange={(e) => setEditingLocation({ ...editingLocation, venueAr: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs text-[var(--text-primary)] text-right"
                        placeholder="مثال: شارع لوسيل التجاري"
                      />
                    </div>
                  </div>

                  {/* MapLibre Pin Picker Canvas with Dark Container */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold text-[var(--text-tertiary)] uppercase">
                      Map Placement (Click or Drag Marker)
                    </label>
                    <div ref={mapContainerRef} className="w-full h-64 rounded-2xl border border-[var(--border-level-2)] overflow-hidden shadow-inner relative bg-[#090314]" />
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Latitude (-90 to 90)</label>
                        <input
                          type="number"
                          step="any"
                          value={editingLocation?.latitude ?? 25.418}
                          onChange={(e) => setEditingLocation({ ...editingLocation, latitude: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs font-mono text-[var(--e3-royal-blue)] font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">Longitude (-180 to 180)</label>
                        <input
                          type="number"
                          step="any"
                          value={editingLocation?.longitude ?? 51.530}
                          onChange={(e) => setEditingLocation({ ...editingLocation, longitude: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs font-mono text-[var(--e3-royal-blue)] font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status & Type Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-[var(--text-tertiary)] uppercase mb-1">Location Type</label>
                      <select
                        value={editingLocation?.locationType || 'PERMANENT_ATTRACTION'}
                        onChange={(e) => setEditingLocation({ ...editingLocation, locationType: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs text-[var(--text-primary)]"
                      >
                        <option value="PERMANENT_ATTRACTION">Permanent Attraction</option>
                        <option value="MALL_ACTIVATION">Mall Activation</option>
                        <option value="SEASONAL_ATTRACTION">Seasonal Attraction</option>
                        <option value="EVENT">Event</option>
                        <option value="ACTIVE_PROJECT">Active Project</option>
                        <option value="OFFICE">Office</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-[var(--text-tertiary)] uppercase mb-1">Operational Status</label>
                      <select
                        value={editingLocation?.operationalStatus || 'OPEN'}
                        onChange={(e) => setEditingLocation({ ...editingLocation, operationalStatus: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs text-[var(--text-primary)]"
                      >
                        <option value="OPEN">Open</option>
                        <option value="COMING_SOON">Coming Soon</option>
                        <option value="TEMPORARILY_CLOSED">Temporarily Closed</option>
                        <option value="SEASONAL">Seasonal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-[var(--text-tertiary)] uppercase mb-1">Publication Status</label>
                      <select
                        value={editingLocation?.publicationStatus || 'PUBLISHED'}
                        onChange={(e) => setEditingLocation({ ...editingLocation, publicationStatus: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs text-[var(--text-primary)]"
                      >
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                  </div>

                  {/* Cover Photo Media URL with Local Upload Button */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-[var(--text-tertiary)] uppercase mb-1">Cover Photo Media URL (Direct Link or Local Upload)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingLocation?.coverMediaUrl || ''}
                          onChange={(e) => setEditingLocation({ ...editingLocation, coverMediaUrl: e.target.value })}
                          className="flex-1 px-3 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs text-[var(--text-primary)] font-mono"
                          placeholder="https://images.unsplash.com/..."
                        />
                        <label className="px-4 py-2 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--e3-royal-blue)] border border-[var(--border-level-2)] text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md">
                          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--e3-royal-blue)]" /> : <Upload className="w-3.5 h-3.5 text-[var(--e3-royal-blue)]" />}
                          <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                      </div>
                      {editingLocation?.coverMediaUrl && (
                        <div className="mt-2 flex items-center gap-3 p-2 bg-[var(--surface-default)] rounded-xl border border-[var(--border-level-2)]">
                          <img src={editingLocation.coverMediaUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border" />
                          <span className="text-[11px] text-[var(--text-secondary)] font-mono truncate">{editingLocation.coverMediaUrl}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-[var(--text-tertiary)] uppercase mb-1">Google Maps / Directions URL</label>
                      <input
                        type="text"
                        value={editingLocation?.googleMapsUrl || ''}
                        onChange={(e) => setEditingLocation({ ...editingLocation, googleMapsUrl: e.target.value, directionsUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl text-xs text-[var(--text-primary)] font-mono"
                        placeholder="https://maps.google.com/?q=..."
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-level-2)] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="px-4 py-2 rounded-xl bg-[var(--surface-hover)] text-zinc-300 text-xs font-bold uppercase hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 rounded-xl bg-[var(--e3-royal-blue)] text-white text-xs font-extrabold uppercase hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Location'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardPageShell>
  );
}
