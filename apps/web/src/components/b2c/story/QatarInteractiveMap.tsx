"use client"

import { useState, useEffect, useMemo } from 'react'
import { MapPin, Locate, ShieldCheck, Sparkles, Calendar, CheckCircle2 } from 'lucide-react'
import { AttractionMapCanvas } from '@/components/map/AttractionMapCanvas'
import { AttractionLocationCard } from '@/components/map/AttractionLocationCard'
import { useNearestLocations } from '@/hooks/useNearestLocations'
import { MapGeoJSONCollection, MapGeoJSONFeature, MapLocationProperties } from '@/components/map/map-types'
import { FALLBACK_ATTRACTIONS } from '@/lib/fallback-attractions'

interface QatarInteractiveMapProps {
  content?: any
  locale: string
}

import { isAttractionActiveByDate } from '@/lib/cms-attractions'

export { isAttractionActiveByDate }

export function QatarInteractiveMap({ content, locale }: QatarInteractiveMapProps) {
  const isAr = locale === 'ar'
  const mapData = content?.qatarMap || {}

  const { userCoords, loading: locating, requestLocation, calculateDistance } = useNearestLocations()

  const [geoJson, setGeoJson] = useState<MapGeoJSONCollection>({ type: 'FeatureCollection', features: [] })
  const [selectedLocationId, setSelectedLocationId] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  // Fetch or construct map GeoJSON features, strictly filtered to active attractions by date
  useEffect(() => {
    async function loadActiveMapData() {
      setLoading(true)
      let activeFeatures: MapGeoJSONFeature[] = []

      try {
        const res = await fetch(`/api/public/locations/map?locale=${locale}&activeOnly=true`)
        if (res.ok) {
          const json = await res.json()
          if (json?.features && Array.isArray(json.features)) {
            // Filter API GeoJSON features by date
            activeFeatures = json.features.filter((feat: MapGeoJSONFeature) => {
              const props = feat.properties
              return isAttractionActiveByDate(props)
            })
          }
        }
      } catch (e) {
        console.error('Failed to load active public map locations', e)
      }

      // If API returns no items or errors out, construct from fallback attractions list filtered by date
      if (activeFeatures.length === 0) {
        const activeFallbackAttractions = FALLBACK_ATTRACTIONS.filter(isAttractionActiveByDate)

        activeFeatures = activeFallbackAttractions.map((attr, idx) => ({
          type: 'Feature',
          id: attr.id || `loc-active-${idx}`,
          geometry: {
            type: 'Point',
            coordinates: [
              attr.operations?.lng || attr.coordinates?.lng || (51.5270 + idx * 0.012),
              attr.operations?.lat || attr.coordinates?.lat || (25.3250 + idx * 0.008)
            ]
          },
          properties: {
            locationId: attr.id || `loc-active-${idx}`,
            slug: attr.slug || 'attraction',
            name: (isAr ? attr.nameAr : attr.nameEn) || attr.nameEn || 'Attraction',
            nameEn: attr.nameEn || 'Attraction',
            nameAr: attr.nameAr || 'وجهة ترفيهية',
            venue: (isAr ? attr.operations?.locationNameAr : attr.operations?.locationNameEn) || attr.operations?.locationNameEn || 'Qatar',
            address: (isAr ? attr.operations?.locationNameAr : attr.operations?.locationNameEn) || 'Qatar',
            shortDescription: isAr ? attr.taglineAr : attr.taglineEn,
            locationType: 'PERMANENT_ATTRACTION',
            operationalStatus: 'OPEN',
            thumbnailUrl: attr.heroMediaUrl || 'https://images.unsplash.com/photo-1513151233558-d860c5398176',
            pinColorToken: idx === 0 ? 'CYAN' : idx === 1 ? 'GOLD' : idx === 2 ? 'PURPLE' : 'AMBER',
            featured: true,
            attractionCount: 1,
            latitude: attr.operations?.lat || attr.coordinates?.lat || 25.3250,
            longitude: attr.operations?.lng || attr.coordinates?.lng || 51.5270,
            ticketingUrl: attr.ticketingUrl || `/${locale}/b2c/calendar`,
            directionsUrl: `https://maps.google.com/?q=${attr.operations?.lat || 25.3250},${attr.operations?.lng || 51.5270}`
          }
        }))
      }

      setGeoJson({ type: 'FeatureCollection', features: activeFeatures })
      if (activeFeatures.length > 0) {
        setSelectedLocationId(activeFeatures[0].properties.locationId)
      }
      setLoading(false)
    }

    loadActiveMapData()
  }, [locale, isAr])

  // Enrich features with user distance calculation when Geolocation is active
  const filteredFeatures = useMemo(() => {
    if (!geoJson?.features) return []
    return geoJson.features.map((feat) => {
      if (userCoords) {
        const dist = calculateDistance(feat.geometry.coordinates[1], feat.geometry.coordinates[0])
        return {
          ...feat,
          properties: {
            ...feat.properties,
            distanceKm: dist ?? undefined
          }
        }
      }
      return feat
    })
  }, [geoJson, userCoords, calculateDistance])

  const filteredGeoJson: MapGeoJSONCollection = useMemo(() => ({
    type: 'FeatureCollection',
    features: filteredFeatures
  }), [filteredFeatures])

  const selectedLocation: MapLocationProperties | undefined = useMemo(() => {
    const feat = filteredFeatures.find((f) => f.properties.locationId === selectedLocationId || f.id === selectedLocationId)
    return feat ? feat.properties : filteredFeatures[0]?.properties
  }, [filteredFeatures, selectedLocationId])

  return (
    <section id="qatar-map" className="relative py-24 bg-[#050110] text-white border-b border-purple-950/40 overflow-hidden">
      {/* Background Radial Shading */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.12),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-sky-500/30 bg-sky-950/40 text-sky-400 text-xs font-bold uppercase tracking-widest">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>{isAr ? "الخريطة الحية — LIVE QATAR MAP" : "EXPLORE E3 ACROSS QATAR"}</span>
              </div>

              {/* Active Attractions Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>{isAr ? `${filteredFeatures.length} ` + "وجهة نشطة (حسب التاريخ)" : `${filteredFeatures.length} Active Attractions (By Date)`}</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {isAr ? (mapData.headlineAr || "رحلة عبر أنحاء قطر") : (mapData.headlineEn || "A Journey Across Qatar")}
            </h2>
            <p className="text-sm text-slate-300 font-light max-w-xl mt-2">
              {isAr
                ? (mapData.subtextAr || "استكشف وجهات إي ثري الترفيهية النشطة حالياً في كافة مناطق الدوحة عبر الخريطة التفاعلية.")
                : (mapData.subtextEn || "Discover E3's active attraction worlds across Doha using interactive vector cartography.")}
            </p>
          </div>

          {/* Privacy-First Near Me Geolocation Action */}
          <button
            onClick={requestLocation}
            disabled={locating}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg cursor-pointer disabled:opacity-50"
          >
            <Locate className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? (isAr ? "جاري التحديد..." : "Locating...") : (isAr ? "بالقرب مني — Near Me" : "Near Me / بالقرب مني")}</span>
          </button>
        </div>

        {/* Near Me Active Alert Box */}
        {userCoords && (
          <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 flex items-center justify-between text-xs backdrop-blur-md">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? "تم حساب المسافات لأقرب الوجهات النشطة في قطر بأمان." : "Distances to nearest active Qatar attractions calculated privately."}</span>
            </div>
            <span className="font-mono font-bold">LAT: {userCoords.lat.toFixed(2)} | LNG: {userCoords.lng.toFixed(2)}</span>
          </div>
        )}

        {/* Interactive Map System Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Active Attraction Location Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 max-h-[600px] overflow-y-auto pe-2 no-scrollbar">
            {loading ? (
              <div className="p-8 text-center rounded-3xl border border-slate-800 bg-slate-950 text-slate-400 font-medium">
                {isAr ? "جاري تحميل الخريطة التفاعلية والوجهات النشطة..." : "Loading active map system & destinations..."}
              </div>
            ) : filteredFeatures.length === 0 ? (
              <div className="p-8 text-center rounded-3xl border border-slate-800 bg-slate-950 text-slate-400 font-medium">
                {isAr ? "لا توجد وجهات نشطة بتاريخ اليوم." : "No active attractions currently available by date."}
              </div>
            ) : (
              filteredFeatures.map((feat) => (
                <AttractionLocationCard
                  key={feat.properties.locationId}
                  location={feat.properties}
                  isSelected={feat.properties.locationId === selectedLocation?.locationId}
                  onSelect={() => setSelectedLocationId(feat.properties.locationId)}
                  locale={locale}
                />
              ))
            )}
          </div>

          {/* MapLibre GL Vector Cartography Canvas (7 Cols) */}
          <div className="lg:col-span-7 h-[600px] sticky top-24">
            <AttractionMapCanvas
              geoJson={filteredGeoJson}
              selectedLocationId={selectedLocation?.locationId}
              onSelectLocation={(locProps) => setSelectedLocationId(locProps.locationId)}
              locale={locale}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
