"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  MapPin,
  Ticket,
  Image as ImageIcon,
  HelpCircle,
  Share2,
  FileCheck,
  Eye,
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Clock,
  CalendarRange,
  Globe,
  Sliders,
  Languages,
  ArrowRight,
  ShieldCheck,
  Building,
  Wand2
} from "lucide-react"

import { Button } from "@/components/ui/Button"
import { MediaUploader } from "@/components/ui/MediaUploader"
import { cn } from "@/lib/utils"
import {
  DashboardPageShell,
  DashboardPageHeader
} from "@/components/dashboard/ui"
import { CompactActivityCard, ActivityItem } from "./CompactActivityCard"
import { CompactRepeaterList } from "./CompactRepeaterList"
import { LocationSelectorModal } from "./LocationSelectorModal"

export type StudioStage = 'identity' | 'experiences' | 'visit' | 'media' | 'review'

const STUDIO_STAGES: Array<{ id: StudioStage; labelEn: string; labelAr: string; icon: any; description: string }> = [
  { id: 'identity', labelEn: '1. Identity & Brand', labelAr: '١. الهوية والعلامة', icon: Layers, description: 'Core names, slug, brand IP, format & hero media' },
  { id: 'experiences', labelEn: '2. What\'s Inside', labelAr: '٢. التجارب والأنشطة', icon: Sparkles, description: 'Activities, story tracks, intensity & age guidelines' },
  { id: 'visit', labelEn: '3. Visit & Booking', labelAr: '٣. المواقع والأسعار', icon: MapPin, description: 'Canonical Qatar venues, operating timetable & ticket tiers' },
  { id: 'media', labelEn: '4. Media & Trust', labelAr: '٤. الوسائط والشركاء', icon: ImageIcon, description: 'Gallery photos, partner badges, reviews, news & FAQs' },
  { id: 'review', labelEn: '5. Review & Publish', labelAr: '٥. المراجعة والنشر', icon: FileCheck, description: 'SEO metadata, translation health & live publishing' },
]

export function AttractionContentStudio({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const isEditing = Boolean(initialData?.id)

  // Top Level Studio Mode & Navigation
  const [activeStage, setActiveStage] = useState<StudioStage>('identity')
  const [isQuickSetup, setIsQuickSetup] = useState(false)
  const [bilingualView, setBilingualView] = useState<'BOTH' | 'EN' | 'AR'>('BOTH')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Stage 1: Identity & Brand
  const [nameEn, setNameEn] = useState(initialData?.nameEn || "")
  const [nameAr, setNameAr] = useState(initialData?.nameAr || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [taglineEn, setTaglineEn] = useState(initialData?.taglineEn || "")
  const [taglineAr, setTaglineAr] = useState(initialData?.taglineAr || "")
  const [descriptionEn, setDescriptionEn] = useState(initialData?.descriptionEn || "")
  const [descriptionAr, setDescriptionAr] = useState(initialData?.descriptionAr || "")
  const [formatCategory, setFormatCategory] = useState(initialData?.formatCategory || "FEC")
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false)
  const [isB2bVisible, setIsB2bVisible] = useState(initialData?.isB2bVisible !== false)

  // Hero Media & Logos
  const [heroMediaType, setHeroMediaType] = useState(initialData?.heroMediaType || "IMAGE")
  const [heroMediaUrl, setHeroMediaUrl] = useState(initialData?.heroMediaUrl || "")
  const [heroFallbackUrl, setHeroFallbackUrl] = useState(initialData?.heroFallbackUrl || "")
  const [heroThumbnailUrl, setHeroThumbnailUrl] = useState(initialData?.heroThumbnailUrl || "")
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "")

  // Advanced WebGL & Motion Presets (Collapsible)
  const [showAdvancedMotion, setShowAdvancedMotion] = useState(false)
  const [motionPreset, setMotionPreset] = useState(initialData?.motionPreset || "MEDIA_CINEMATIC")
  const [motionIntensity, setMotionIntensity] = useState(initialData?.motionIntensity || "MEDIUM")
  const [heroSceneType, setHeroSceneType] = useState(initialData?.heroSceneType || "CINEMATIC_MEDIA")
  const [particleDensity, setParticleDensity] = useState(initialData?.particleDensity || 50)

  // Stage 2: What's Inside (Activities)
  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    if (Array.isArray(initialData?.featuresList) && initialData.featuresList.length > 0) {
      return initialData.featuresList.map((f: any) => ({
        id: f.id,
        titleEn: f.titleEn || '',
        titleAr: f.titleAr || '',
        descriptionEn: f.descriptionEn || '',
        descriptionAr: f.descriptionAr || '',
        imageUrl: f.imageUrl || '',
        iconUrl: f.iconUrl || '',
        contentType: f.highlightType || 'ACTIVITY',
        highlightType: f.highlightType || 'ACTIVITY',
        primaryStoryTypeId: f.storyTypes?.[0]?.id || f.primaryStoryTypeId,
        secondaryStoryTypeIds: f.storyTypes?.slice(1).map((st: any) => st.id) || [],
        storyTypeIds: f.storyTypes?.map((st: any) => st.id) || [],
        durationMinutes: f.durationMinutes,
        intensityLevel: f.intensityLevel || 'MEDIUM',
        minAge: f.minAge,
        minHeightCm: f.minHeightCm,
        linkedBrandId: f.linkedBrandId,
        showBrandLogo: f.showBrandLogo,
        orderIndex: f.orderIndex
      }))
    }
    if (Array.isArray(initialData?.features) && initialData.features.length > 0) {
      return initialData.features
    }
    return []
  })

  // Stage 3: Visit & Booking (Canonical Locations + Schedule + Pricing)
  const [linkedLocations, setLinkedLocations] = useState<any[]>(() => {
    if (Array.isArray(initialData?.attractionLocations) && initialData.attractionLocations.length > 0) {
      return initialData.attractionLocations.map((al: any) => ({
        locationId: al.locationId,
        location: al.location,
        isPrimary: Boolean(al.isPrimary),
        mapVisible: al.mapVisible !== false,
        shortLabelEn: al.shortLabelEn || '',
        shortLabelAr: al.shortLabelAr || '',
        bookingUrlOverride: al.bookingUrlOverride || '',
        startingPriceOverride: al.startingPriceOverride,
        operationalStatusOverride: al.operationalStatusOverride,
        sortOrder: al.sortOrder || 0
      }))
    }
    return []
  })

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [availableLocations, setAvailableLocations] = useState<any[]>([])
  const [availableStoryTypes, setAvailableStoryTypes] = useState<any[]>([])
  const [availableBrands, setAvailableBrands] = useState<any[]>([])

  // Qatar Operating Schedule & Timings
  const [temporalStatus, setTemporalStatus] = useState<any>(() => {
    const existing = initialData?.temporalStatus || {}
    return {
      isPermanent: existing.isPermanent !== undefined ? Boolean(existing.isPermanent) : true,
      isSpecialEvent: Boolean(existing.isSpecialEvent),
      isComingSoon: Boolean(existing.isComingSoon),
      startDate: existing.startDate || "",
      endDate: existing.endDate || "",
      bookingStartDate: existing.bookingStartDate || "",
      openTime: existing.openTime || "10:00",
      closeTime: existing.closeTime || "22:00",
      operatingHoursEn: existing.operatingHoursEn || "",
      operatingHoursAr: existing.operatingHoursAr || "",
      hasWeekendHours: Boolean(existing.hasWeekendHours),
      weekendOpenTime: existing.weekendOpenTime || "10:00",
      weekendCloseTime: existing.weekendCloseTime || "00:00",
      hasFridayBreak: Boolean(existing.hasFridayBreak),
      fridayOpenTime: existing.fridayOpenTime || "13:30",
      seasonalNotesEn: existing.seasonalNotesEn || "",
      seasonalNotesAr: existing.seasonalNotesAr || ""
    }
  })

  // Pricing Tiers
  const [pricingTiers, setPricingTiers] = useState<any[]>(initialData?.pricing || [])

  // Stage 4: Media & Trust
  const [galleryItems, setGalleryItems] = useState<any[]>(initialData?.gallery || [])
  const [faqs, setFaqs] = useState<any[]>(initialData?.faqs || [])
  const [partners, setPartners] = useState<any[]>(Array.isArray(initialData?.partners) ? initialData.partners : [])
  const [socialLinks, setSocialLinks] = useState<any[]>(initialData?.socialLinks || [])
  const [newsCoverage, setNewsCoverage] = useState<any[]>(Array.isArray(initialData?.newsCoverage) ? initialData.newsCoverage : [])
  const [testimonials, setTestimonials] = useState<any[]>(Array.isArray(initialData?.testimonials) ? initialData.testimonials : [])

  // Stage 5: Review & SEO
  const [seo, setSeo] = useState<any>(() => ({
    metaTitleEn: initialData?.seo?.metaTitleEn || initialData?.nameEn || "",
    metaTitleAr: initialData?.seo?.metaTitleAr || initialData?.nameAr || "",
    metaDescriptionEn: initialData?.seo?.metaDescriptionEn || initialData?.taglineEn || "",
    metaDescriptionAr: initialData?.seo?.metaDescriptionAr || initialData?.taglineAr || "",
    keywordsEn: initialData?.seo?.keywordsEn || "",
    keywordsAr: initialData?.seo?.keywordsAr || "",
    ogImageUrl: initialData?.seo?.ogImageUrl || initialData?.heroMediaUrl || ""
  }))

  // Load auxiliary data
  const loadData = async () => {
    try {
      const [locRes, storyRes, brandRes] = await Promise.all([
        fetch('/api/b2c/locations'),
        fetch('/api/b2c/story-types?active=true'),
        fetch('/api/b2c/brands')
      ])
      if (locRes.ok) {
        const json = await locRes.json()
        setAvailableLocations(json.data || json || [])
      }
      if (storyRes.ok) {
        const data = await storyRes.json()
        setAvailableStoryTypes(Array.isArray(data) ? data : [])
      }
      if (brandRes.ok) {
        const data = await brandRes.json()
        setAvailableBrands(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Error loading auxiliary data", err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Health Completion Score Calculator
  const healthAudit = useMemo(() => {
    const scores: Record<StudioStage, number> = {
      identity: 0,
      experiences: 0,
      visit: 0,
      media: 0,
      review: 0
    }
    const missing: string[] = []

    // 1. Identity checks
    const idChecks = [
      Boolean(nameEn.trim()),
      Boolean(nameAr.trim()),
      Boolean(slug.trim()),
      Boolean(taglineEn.trim() || descriptionEn.trim()),
      Boolean(heroMediaUrl.trim())
    ]
    scores.identity = Math.round((idChecks.filter(Boolean).length / idChecks.length) * 100)
    if (!nameEn.trim()) missing.push("Attraction Name (EN)")
    if (!nameAr.trim()) missing.push("Attraction Name (AR)")
    if (!slug.trim()) missing.push("Unique URL Slug")
    if (!heroMediaUrl.trim()) missing.push("Hero Media Poster/Video")

    // 2. Experiences checks
    if (activities.length > 0) {
      const validActivities = activities.filter(a => 
        a.titleEn?.trim() && 
        a.titleAr?.trim() && 
        a.descriptionEn?.trim() && 
        a.descriptionAr?.trim() && 
        a.imageUrl?.trim() && 
        (a.primaryStoryTypeId || (a.storyTypeIds && a.storyTypeIds.length > 0))
      )
      scores.experiences = Math.min(100, Math.round((validActivities.length / Math.max(1, activities.length)) * 100))

      const incomplete = activities.filter(a => 
        !(a.titleEn?.trim() && a.titleAr?.trim() && a.descriptionEn?.trim() && a.descriptionAr?.trim() && a.imageUrl?.trim() && (a.primaryStoryTypeId || (a.storyTypeIds && a.storyTypeIds.length > 0)))
      )
      incomplete.forEach(ia => {
        const itemMissing: string[] = []
        if (!ia.titleEn?.trim()) itemMissing.push("EN Title")
        if (!ia.titleAr?.trim()) itemMissing.push("AR Title")
        if (!ia.descriptionEn?.trim()) itemMissing.push("EN Description")
        if (!ia.descriptionAr?.trim()) itemMissing.push("AR Description")
        if (!ia.imageUrl?.trim()) itemMissing.push("Image")
        if (!ia.primaryStoryTypeId && (!ia.storyTypeIds || ia.storyTypeIds.length === 0)) itemMissing.push("Story Track")
        missing.push(`${ia.titleEn || 'Activity'}: missing ${itemMissing.join(', ')}`)
      })
    } else {
      missing.push("At least 1 What's Inside activity")
    }

    // 3. Visit checks
    const visitChecks = [
      linkedLocations.length > 0,
      pricingTiers.length > 0,
      Boolean(temporalStatus.openTime && temporalStatus.closeTime)
    ]
    scores.visit = Math.round((visitChecks.filter(Boolean).length / visitChecks.length) * 100)
    if (linkedLocations.length === 0) missing.push("Linked Canonical GIS Location")
    if (pricingTiers.length === 0) missing.push("At least 1 Pricing Pass / Ticket Tier")

    // 4. Media checks (strictly exclude demo / placeholder URLs)
    const validGallery = galleryItems.filter(g => g && g.url && !g.url.includes('example.com') && !g.url.includes('placeholder'))
    const validFaqs = faqs.filter(f => f && f.questionEn?.trim() && f.answerEn?.trim())
    const validPartners = partners.filter(p => {
      const name = p.name || p.partnerName
      const logo = p.logoUrl || p.logo || p.image
      return name && logo && !logo.includes('example.com') && !logo.includes('placeholder')
    })

    const mediaChecks = [
      validGallery.length >= 2,
      validFaqs.length >= 2,
      validPartners.length >= 1
    ]
    scores.media = Math.round((mediaChecks.filter(Boolean).length / mediaChecks.length) * 100)
    if (validGallery.length < 2) missing.push("At least 2 authentic gallery photos")
    if (validFaqs.length < 2) missing.push("At least 2 FAQs")

    // 5. Review checks
    const reviewChecks = [
      Boolean(seo.metaTitleEn?.trim()),
      Boolean(seo.metaDescriptionEn?.trim()),
      isPublished
    ]
    scores.review = Math.round((reviewChecks.filter(Boolean).length / reviewChecks.length) * 100)
    if (!seo.metaTitleEn?.trim()) missing.push("SEO Meta Title (EN)")
    if (!seo.metaDescriptionEn?.trim()) missing.push("SEO Meta Description (EN)")

    const overall = Math.round(
      (scores.identity * 0.3) +
      (scores.experiences * 0.25) +
      (scores.visit * 0.25) +
      (scores.media * 0.1) +
      (scores.review * 0.1)
    )

    return { scores, missing, overall }
  }, [nameEn, nameAr, slug, taglineEn, descriptionEn, heroMediaUrl, activities, linkedLocations, pricingTiers, temporalStatus, galleryItems, faqs, partners, seo, isPublished])

  // Save Handler with Safe Deep Merge & Idempotent Linking
  const handleSave = async (publishOverride?: boolean) => {
    if (!nameEn.trim()) {
      setActiveStage('identity')
      setErrorMessage("English attraction name is required.")
      return
    }
    if (!slug.trim()) {
      setActiveStage('identity')
      setErrorMessage("URL slug is required.")
      return
    }

    setIsSaving(true)
    setErrorMessage(null)
    try {
      const nextIsPublished = publishOverride !== undefined ? publishOverride : isPublished

      // Format payload with full backward-compatibility and relations
      const payload = {
        nameEn: nameEn.trim(),
        nameAr: nameAr.trim() || nameEn.trim(),
        slug: slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        taglineEn: taglineEn.trim(),
        taglineAr: taglineAr.trim(),
        descriptionEn: descriptionEn.trim(),
        descriptionAr: descriptionAr.trim(),
        formatCategory,
        isPublished: nextIsPublished,
        isFeatured,
        isB2bVisible,
        heroMediaType,
        heroMediaUrl,
        heroFallbackUrl,
        heroThumbnailUrl,
        logoUrl,
        motionPreset,
        motionIntensity,
        heroSceneType,
        particleDensity,
        features: activities,
        locations: linkedLocations.map((ll, idx) => ({
          locationId: ll.locationId,
          nameEn: ll.location?.nameEn || ll.nameEn || 'Venue',
          nameAr: ll.location?.nameAr || ll.nameAr || 'الوجهة',
          venueEn: ll.location?.venueEn || ll.venueEn || '',
          isPrimary: Boolean(ll.isPrimary || idx === 0),
          isPublished: true,
          mapVisible: ll.mapVisible !== false,
          shortLabelEn: ll.shortLabelEn || '',
          shortLabelAr: ll.shortLabelAr || '',
          bookingUrlOverride: ll.bookingUrlOverride || '',
          startingPriceOverride: ll.startingPriceOverride
        })),
        temporalStatus,
        pricing: pricingTiers.filter(p => p && (p.titleEn || p.titleAr)),
        gallery: galleryItems.filter(g => g && g.url),
        faqs: faqs.filter(f => f && (f.questionEn || f.questionAr)),
        partners: partners.filter(p => p && (p.name || p.logoUrl)),
        socialLinks: socialLinks.filter(s => s && s.url),
        newsCoverage: newsCoverage.filter(n => n && (n.title || n.url)),
        testimonials: testimonials.filter(t => t && (t.quote || t.author)),
        seo
      }

      const url = isEditing
        ? `/api/b2c/attractions/${initialData.id}/full`
        : `/api/b2c/attractions`

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || `Server responded with status ${res.status}`)
      }

      setSaveSuccessNotice(true)
      setTimeout(() => setSaveSuccessNotice(false), 3000)

      if (!isEditing) {
        router.push("/dashboard/b2c/attractions")
      }
      router.refresh()
    } catch (err: any) {
      console.error("[STUDIO_SAVE_ERROR]", err)
      setErrorMessage(err.message || "Failed to save attraction. Please check required fields.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardPageShell>
      {/* Top Floating App Bar */}
      <div className="sticky top-0 z-40 bg-[var(--surface-default)]/95 backdrop-blur-xl border-b border-[var(--border-default)] px-4 py-3 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Attraction Title & Back */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/b2c/attractions")}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-[var(--text-primary)] truncate max-w-[280px] sm:max-w-md">
                  {nameEn || "New Attraction"}
                </h1>
                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                  isPublished ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                )}>
                  {isPublished ? "Published" : "Draft"}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] truncate">
                {slug ? `e3.qa/b2c/attractions/${slug}` : "Configure attraction profile"}
              </p>
            </div>
          </div>

          {/* Controls Cluster */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Bilingual Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => setBilingualView('BOTH')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                  bilingualView === 'BOTH' ? "bg-[var(--surface-default)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                EN + AR
              </button>
              <button
                type="button"
                onClick={() => setBilingualView('EN')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                  bilingualView === 'EN' ? "bg-[var(--surface-default)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setBilingualView('AR')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                  bilingualView === 'AR' ? "bg-[var(--surface-default)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                العربية
              </button>
            </div>

            {/* Quick Setup Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsQuickSetup(!isQuickSetup)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5",
                isQuickSetup
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400"
                  : "bg-[var(--surface-subtle)] border-[var(--border-default)] text-[var(--text-secondary)]"
              )}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isQuickSetup ? "Quick Mode (Active)" : "Full Studio"}</span>
            </button>

            {/* Public Page Preview */}
            {slug && (
              <a
                href={`/en/b2c/attractions/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-subtle)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                <span className="hidden sm:inline">Preview</span>
              </a>
            )}

            {/* Save Button */}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave()}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Bar */}
      <AnimatePresence>
        {saveSuccessNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2.5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>All attraction changes saved and live caches revalidated successfully!</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border-b border-red-500/20 px-6 py-2.5 text-center text-xs font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Studio Body: Sticky Left Rail + Content Stage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 1. Sticky Left Stage Navigator (Desktop) */}
          <div className="lg:col-span-3 sticky top-24 space-y-4">
            <div className="p-4 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] shadow-sm space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-tertiary)] px-2">
                Workflow Stages
              </span>

              <nav className="space-y-1">
                {STUDIO_STAGES.map(st => {
                  const Icon = st.icon
                  const isActive = activeStage === st.id
                  const score = healthAudit.scores[st.id]

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setActiveStage(st.id)}
                      className={cn(
                        "w-full text-start p-3 rounded-2xl transition-all flex items-center justify-between gap-3 group select-none",
                        isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 shadow-sm"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={cn(
                          "p-2 rounded-xl transition-colors",
                          isActive ? "bg-emerald-500 text-white" : "bg-[var(--surface-subtle)] text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]"
                        )}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs truncate">{st.labelEn}</div>
                          <div className="text-[10px] text-[var(--text-tertiary)] truncate">{st.description}</div>
                        </div>
                      </div>

                      <span className={cn(
                        "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0",
                        score === 100 ? "text-emerald-500 bg-emerald-500/10" : "text-[var(--text-tertiary)] bg-[var(--surface-subtle)]"
                      )}>
                        {score}%
                      </span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Health Meter Widget */}
            <div className="p-4 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Content Health</span>
                </span>
                <span className="font-mono font-black text-emerald-500 text-sm">
                  {healthAudit.overall}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[var(--surface-subtle)] overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${healthAudit.overall}%` }}
                />
              </div>

              {healthAudit.missing.length > 0 ? (
                <div className="text-[11px] text-amber-500 space-y-1">
                  <span className="font-bold">Missing for 100%:</span>
                  <ul className="list-disc ps-4 space-y-0.5 text-[10px] text-[var(--text-secondary)]">
                    {healthAudit.missing.slice(0, 3).map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-[11px] text-emerald-500 font-bold">All mandatory requirements complete!</p>
              )}
            </div>
          </div>

          {/* 2. Main Stage Content Panel */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* ========================================================================= */}
            {/* STAGE 1: IDENTITY & BRAND */}
            {/* ========================================================================= */}
            {activeStage === 'identity' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-6">
                  <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
                    <div>
                      <h2 className="text-lg font-black text-[var(--text-primary)]">1. Attraction Identity & Brand</h2>
                      <p className="text-xs text-[var(--text-secondary)]">Canonical branding, naming, slug and format definition</p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] text-xs font-mono font-bold">
                      STAGE 1 / 5
                    </span>
                  </div>

                  {/* Bilingual Names */}
                  <div className={cn(
                    "grid gap-6",
                    bilingualView === 'BOTH' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                  )}>
                    {(bilingualView === 'BOTH' || bilingualView === 'EN') && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                          Attraction Name (EN) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Urban Arena"
                          value={nameEn}
                          onChange={e => {
                            setNameEn(e.target.value)
                            if (!isEditing && !slug) {
                              setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                            }
                          }}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none font-bold"
                        />
                      </div>
                    )}

                    {(bilingualView === 'BOTH' || bilingualView === 'AR') && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                          اسم الوجهة (العربية) *
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="مثال: أوربان أرينا"
                          value={nameAr}
                          onChange={e => setNameAr(e.target.value)}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none font-bold text-right"
                        />
                      </div>
                    )}
                  </div>

                  {/* Slug & Format */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        Public URL Slug *
                      </label>
                      <div className="flex items-center">
                        <span className="px-3 py-3 rounded-s-xl bg-[var(--surface-default)] border border-e-0 border-[var(--border-default)] text-xs font-mono text-[var(--text-tertiary)]">
                          e3.qa/b2c/attractions/
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="urban-arena-doha-mall"
                          value={slug}
                          onChange={e => setSlug(e.target.value)}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-e-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        Attraction Format
                      </label>
                      <select
                        value={formatCategory}
                        onChange={e => setFormatCategory(e.target.value)}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none font-bold"
                      >
                        <option value="FEC">Permanent FEC / Center</option>
                        <option value="MALL_ATTRACTION">Mall Anchor Attraction</option>
                        <option value="SEASONAL_ACTIVATION">Seasonal Activation</option>
                        <option value="TOURING_EXPERIENCE">Touring Pop-Up</option>
                        <option value="FREE_EVENT">Free Public Event</option>
                      </select>
                    </div>
                  </div>

                  {/* Taglines */}
                  <div className={cn(
                    "grid gap-6",
                    bilingualView === 'BOTH' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                  )}>
                    {(bilingualView === 'BOTH' || bilingualView === 'EN') && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                          Tagline / Punchline (EN)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Next-Gen Mixed Reality Action Arena"
                          value={taglineEn}
                          onChange={e => setTaglineEn(e.target.value)}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                        />
                      </div>
                    )}

                    {(bilingualView === 'BOTH' || bilingualView === 'AR') && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                          الشعار التسويقي (العربية)
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="مثال: ساحة التحديات الرقمية والواقع المعزز"
                          value={taglineAr}
                          onChange={e => setTaglineAr(e.target.value)}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right"
                        />
                      </div>
                    )}
                  </div>

                  {/* Descriptions */}
                  <div className={cn(
                    "grid gap-6",
                    bilingualView === 'BOTH' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                  )}>
                    {(bilingualView === 'BOTH' || bilingualView === 'EN') && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                          Comprehensive Overview (EN)
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Full narrative description of the attraction..."
                          value={descriptionEn}
                          onChange={e => setDescriptionEn(e.target.value)}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl p-4 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                        />
                      </div>
                    )}

                    {(bilingualView === 'BOTH' || bilingualView === 'AR') && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                          الوصف الشامل (العربية)
                        </label>
                        <textarea
                          rows={4}
                          dir="rtl"
                          placeholder="وصف تفصيلي شامل للوجهة وتجاربها..."
                          value={descriptionAr}
                          onChange={e => setDescriptionAr(e.target.value)}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl p-4 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right"
                        />
                      </div>
                    )}
                  </div>

                  {/* Hero Media & Logo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-default)]">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-500" />
                        <span>Hero Media (Image or Video)</span>
                      </label>
                      <MediaUploader
                        value={heroMediaUrl}
                        onChange={setHeroMediaUrl}
                        placeholder="Upload or enter hero image/video URL"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span>Attraction Brand Logo</span>
                      </label>
                      <MediaUploader
                        value={logoUrl}
                        onChange={setLogoUrl}
                        placeholder="Upload or enter logo URL"
                      />
                    </div>
                  </div>

                  {/* Advanced Motion Accordion */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedMotion(!showAdvancedMotion)}
                      className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{showAdvancedMotion ? "Hide" : "Show"} Advanced WebGL & Motion Presets</span>
                    </button>

                    {showAdvancedMotion && (
                      <div className="mt-4 p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Motion Preset</label>
                          <select
                            value={motionPreset}
                            onChange={e => setMotionPreset(e.target.value)}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs"
                          >
                            <option value="MEDIA_CINEMATIC">Cinematic Video Glow</option>
                            <option value="PARTICLE_ORBIT">Particle Orbit Network</option>
                            <option value="GRADIENT_MESH">Dynamic Gradient Mesh</option>
                            <option value="MINIMAL_STATIC">Minimal Static</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Motion Intensity</label>
                          <select
                            value={motionIntensity}
                            onChange={e => setMotionIntensity(e.target.value)}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs"
                          >
                            <option value="LOW">Subtle / Ambient</option>
                            <option value="MEDIUM">Balanced</option>
                            <option value="HIGH">High Energy</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Particle Density</label>
                          <input
                            type="number"
                            min="10"
                            max="100"
                            value={particleDensity}
                            onChange={e => setParticleDensity(parseInt(e.target.value) || 50)}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stage 1 Footer Navigator */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveStage('experiences')}
                    className="px-6 py-3 rounded-2xl bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 transition-all shadow-sm"
                  >
                    <span>Proceed to Experiences (&quot;What&apos;s Inside&quot;)</span>
                    <ArrowRight className="w-4 h-4 text-emerald-500" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STAGE 2: EXPERIENCES ("WHAT'S INSIDE") */}
            {/* ========================================================================= */}
            {activeStage === 'experiences' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-6">
                  <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
                    <div>
                      <h2 className="text-lg font-black text-[var(--text-primary)]">2. What&apos;s Inside Classification</h2>
                      <p className="text-xs text-[var(--text-secondary)]">Activities, zones, games, duration and story tracks</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivities([
                        ...activities,
                        {
                          titleEn: "New Activity",
                          titleAr: "",
                          contentType: "ACTIVITY",
                          intensityLevel: "MEDIUM"
                        }
                      ])}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Activity</span>
                    </button>
                  </div>

                  {/* Compact Activity Cards */}
                  <div className="space-y-4">
                    {activities.map((act, index) => (
                      <CompactActivityCard
                        key={act.id || index}
                        activity={act}
                        index={index}
                        availableStoryTypes={availableStoryTypes}
                        availableBrands={availableBrands}
                        availableLocations={availableLocations}
                        bilingualView={bilingualView}
                        onUpdate={updated => {
                          const next = [...activities]
                          next[index] = updated
                          setActivities(next)
                        }}
                        onDuplicate={() => {
                          const copy = { ...act, id: undefined, titleEn: `${act.titleEn} (Copy)` }
                          setActivities([...activities, copy])
                        }}
                        onDelete={() => {
                          setActivities(activities.filter((_, i) => i !== index))
                        }}
                      />
                    ))}

                    {activities.length === 0 && (
                      <div className="p-12 text-center border-2 border-dashed border-[var(--border-default)] rounded-3xl space-y-3">
                        <Sparkles className="w-8 h-8 text-[var(--color-primary)] mx-auto opacity-50" />
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">No Activities Defined Yet</h4>
                        <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                          Add the core interactive games, zones, laser tag, and simulators that make up this attraction.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActivities([
                            {
                              titleEn: "Main Arena Experience",
                              titleAr: "تجربة الساحة الرئيسية",
                              contentType: "ACTIVITY",
                              intensityLevel: "MEDIUM"
                            }
                          ])}
                          className="px-4 py-2 rounded-xl bg-[var(--surface-default)] border border-[var(--border-default)] text-xs font-bold text-emerald-500 hover:border-emerald-500 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add First Activity</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stage 2 Footer Navigator */}
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setActiveStage('identity')}
                    className="px-5 py-2.5 rounded-2xl border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
                  >
                    Back to Identity
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStage('visit')}
                    className="px-6 py-3 rounded-2xl bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 transition-all shadow-sm"
                  >
                    <span>Proceed to Visit & Booking</span>
                    <ArrowRight className="w-4 h-4 text-emerald-500" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STAGE 3: VISIT & BOOKING */}
            {/* ========================================================================= */}
            {activeStage === 'visit' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-6">
                  
                  {/* Linked Canonical GIS Locations */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
                      <div>
                        <h2 className="text-lg font-black text-[var(--text-primary)]">3. Linked Canonical Qatar Locations</h2>
                        <p className="text-xs text-[var(--text-secondary)]">Direct coordinates, venue address, and location overrides</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsLocationModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Link GIS Location</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {linkedLocations.map((link, idx) => (
                        <div
                          key={link.locationId || idx}
                          className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-default)] flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-[var(--color-primary)]" />
                              <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                                {link.location?.nameEn || link.nameEn || "Qatar Venue"}
                              </h4>
                              {link.isPrimary && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  Primary Location
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] truncate">
                              {link.location?.venueEn || link.venueEn || "Doha, Qatar"}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-tertiary)]">
                              <span>Lat: {link.location?.latitude ?? 'N/A'}</span>
                              <span>Lng: {link.location?.longitude ?? 'N/A'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                              <input
                                type="radio"
                                name="primaryLocationRadio"
                                checked={link.isPrimary}
                                onChange={() => {
                                  setLinkedLocations(linkedLocations.map((l, i) => ({
                                    ...l,
                                    isPrimary: i === idx
                                  })))
                                }}
                                className="text-emerald-500 focus:ring-emerald-500"
                              />
                              <span>Set Primary</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => setLinkedLocations(linkedLocations.filter((_, i) => i !== idx))}
                              className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {linkedLocations.length === 0 && (
                        <div className="p-8 text-center border-2 border-dashed border-[var(--border-default)] rounded-2xl space-y-2">
                          <MapPin className="w-6 h-6 text-amber-500 mx-auto" />
                          <p className="text-xs text-[var(--text-tertiary)]">No canonical GIS venue linked yet.</p>
                          <button
                            type="button"
                            onClick={() => setIsLocationModalOpen(true)}
                            className="text-xs font-bold text-emerald-500 hover:underline inline-flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Link a Qatar Venue</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Qatar Operating Timings & Lifecycle */}
                  <div className="pt-6 border-t border-[var(--border-default)] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-base font-bold text-[var(--text-primary)]">Operating Timings & Rules</h3>
                      </div>
                      <span className="text-xs font-mono font-bold text-[var(--text-tertiary)]">Qatar Time (GMT+3)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Daily Opening Time</label>
                        <input
                          type="time"
                          value={temporalStatus.openTime}
                          onChange={e => setTemporalStatus({ ...temporalStatus, openTime: e.target.value })}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Daily Closing Time</label>
                        <input
                          type="time"
                          value={temporalStatus.closeTime}
                          onChange={e => setTemporalStatus({ ...temporalStatus, closeTime: e.target.value })}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-sm font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Display Hours (EN)</label>
                        <input
                          type="text"
                          placeholder="e.g. Daily: 10:00 AM - 10:00 PM"
                          value={temporalStatus.operatingHoursEn}
                          onChange={e => setTemporalStatus({ ...temporalStatus, operatingHoursEn: e.target.value })}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">أوقات العمل (العربية)</label>
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="مثال: يومياً: ١٠:٠٠ ص - ١٠:٠٠ م"
                          value={temporalStatus.operatingHoursAr}
                          onChange={e => setTemporalStatus({ ...temporalStatus, operatingHoursAr: e.target.value })}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-xs text-right"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing Tiers Repeater */}
                  <div className="pt-6 border-t border-[var(--border-default)]">
                    <CompactRepeaterList
                      title="Pricing Passes & Ticket Tiers"
                      subtitle="General passes, VIP packages, and add-on activities"
                      items={pricingTiers}
                      itemType="PRICING"
                      bilingualView={bilingualView}
                      onAdd={() => setPricingTiers([
                        ...pricingTiers,
                        { titleEn: "General Pass", titleAr: "تذكرة عامة", price: 50, currency: "QAR", type: "GENERAL" }
                      ])}
                      onUpdate={(idx, updated) => {
                        const next = [...pricingTiers]
                        next[idx] = updated
                        setPricingTiers(next)
                      }}
                      onDelete={idx => setPricingTiers(pricingTiers.filter((_, i) => i !== idx))}
                      onDuplicate={idx => {
                        const copy = { ...pricingTiers[idx], id: undefined, titleEn: `${pricingTiers[idx].titleEn} (Copy)` }
                        setPricingTiers([...pricingTiers, copy])
                      }}
                    />
                  </div>
                </div>

                {/* Stage 3 Footer Navigator */}
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setActiveStage('experiences')}
                    className="px-5 py-2.5 rounded-2xl border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
                  >
                    Back to Experiences
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStage('media')}
                    className="px-6 py-3 rounded-2xl bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 transition-all shadow-sm"
                  >
                    <span>Proceed to Media & Trust</span>
                    <ArrowRight className="w-4 h-4 text-emerald-500" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STAGE 4: MEDIA & TRUST */}
            {/* ========================================================================= */}
            {activeStage === 'media' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-8">
                  
                  {/* Gallery */}
                  <CompactRepeaterList
                    title="Photo Gallery Lightbox"
                    subtitle="High-resolution photos showcasing attractions and guest moments"
                    items={galleryItems}
                    itemType="GALLERY"
                    onAdd={() => setGalleryItems([
                      ...galleryItems,
                      { url: "", captionEn: "", captionAr: "" }
                    ])}
                    onUpdate={(idx, updated) => {
                      const next = [...galleryItems]
                      next[idx] = updated
                      setGalleryItems(next)
                    }}
                    onDelete={idx => setGalleryItems(galleryItems.filter((_, i) => i !== idx))}
                  />

                  <div className="h-px bg-[var(--border-default)] w-full" />

                  {/* FAQs */}
                  <CompactRepeaterList
                    title="Frequently Asked Questions (FAQs)"
                    subtitle="Answers regarding dress codes, ticketing, age limits, and bookings"
                    items={faqs}
                    itemType="FAQ"
                    onAdd={() => setFaqs([
                      ...faqs,
                      { questionEn: "What are the age guidelines?", questionAr: "ما هي الفئات العمرية المسموح بها؟", answerEn: "", answerAr: "" }
                    ])}
                    onUpdate={(idx, updated) => {
                      const next = [...faqs]
                      next[idx] = updated
                      setFaqs(next)
                    }}
                    onDelete={idx => setFaqs(faqs.filter((_, i) => i !== idx))}
                  />

                  <div className="h-px bg-[var(--border-default)] w-full" />

                  {/* Verified Partners */}
                  <CompactRepeaterList
                    title="Official Partners & Brand Sponsors"
                    subtitle="Partnership logos displayed in marquee banner"
                    items={partners}
                    itemType="PARTNER"
                    onAdd={() => setPartners([
                      ...partners,
                      { name: "", tagline: "", logoUrl: "" }
                    ])}
                    onUpdate={(idx, updated) => {
                      const next = [...partners]
                      next[idx] = updated
                      setPartners(next)
                    }}
                    onDelete={idx => setPartners(partners.filter((_, i) => i !== idx))}
                  />

                  <div className="h-px bg-[var(--border-default)] w-full" />

                  {/* Social Links */}
                  <CompactRepeaterList
                    title="Official Social Profiles"
                    subtitle="Instagram, TikTok, X, and YouTube profile channels"
                    items={socialLinks}
                    itemType="SOCIAL_LINK"
                    onAdd={() => setSocialLinks([
                      ...socialLinks,
                      { platform: "Instagram", url: "" }
                    ])}
                    onUpdate={(idx, updated) => {
                      const next = [...socialLinks]
                      next[idx] = updated
                      setSocialLinks(next)
                    }}
                    onDelete={idx => setSocialLinks(socialLinks.filter((_, i) => i !== idx))}
                  />
                </div>

                {/* Stage 4 Footer Navigator */}
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setActiveStage('visit')}
                    className="px-5 py-2.5 rounded-2xl border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
                  >
                    Back to Visit & Booking
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveStage('review')}
                    className="px-6 py-3 rounded-2xl bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 transition-all shadow-sm"
                  >
                    <span>Proceed to Review & Publish</span>
                    <ArrowRight className="w-4 h-4 text-emerald-500" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STAGE 5: REVIEW & PUBLISH */}
            {/* ========================================================================= */}
            {activeStage === 'review' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-default)] space-y-6">
                  <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
                    <div>
                      <h2 className="text-lg font-black text-[var(--text-primary)]">5. Review, SEO & Publication</h2>
                      <p className="text-xs text-[var(--text-secondary)]">Search optimization, health validation, and launch</p>
                    </div>
                  </div>

                  {/* SEO Metadata */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase text-[var(--text-primary)] flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-500" />
                      <span>Search Engine Optimization (SEO)</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Meta Title (EN)</label>
                        <input
                          type="text"
                          value={seo.metaTitleEn}
                          onChange={e => setSeo({ ...seo, metaTitleEn: e.target.value })}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">عنوان الميتا (العربية)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={seo.metaTitleAr}
                          onChange={e => setSeo({ ...seo, metaTitleAr: e.target.value })}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-3.5 py-2.5 text-sm text-right"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Meta Description (EN)</label>
                        <textarea
                          rows={2}
                          value={seo.metaDescriptionEn}
                          onChange={e => setSeo({ ...seo, metaDescriptionEn: e.target.value })}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl p-3 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">وصف الميتا (العربية)</label>
                        <textarea
                          rows={2}
                          dir="rtl"
                          value={seo.metaDescriptionAr}
                          onChange={e => setSeo({ ...seo, metaDescriptionAr: e.target.value })}
                          className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl p-3 text-xs text-right"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Publication Toggles */}
                  <div className="pt-6 border-t border-[var(--border-default)] space-y-4">
                    <h3 className="text-sm font-bold uppercase text-[var(--text-primary)]">Publication Visibility</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <label className={cn(
                        "p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3",
                        isPublished ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold" : "bg-[var(--surface-subtle)] border-[var(--border-default)]"
                      )}>
                        <input
                          type="checkbox"
                          checked={isPublished}
                          onChange={e => setIsPublished(e.target.checked)}
                          className="w-4 h-4 text-emerald-500 rounded"
                        />
                        <div>
                          <div className="text-sm font-bold">Publicly Published</div>
                          <div className="text-[11px] opacity-75">Visible to all Qatar visitors</div>
                        </div>
                      </label>

                      <label className={cn(
                        "p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3",
                        isFeatured ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold" : "bg-[var(--surface-subtle)] border-[var(--border-default)]"
                      )}>
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={e => setIsFeatured(e.target.checked)}
                          className="w-4 h-4 text-amber-500 rounded"
                        />
                        <div>
                          <div className="text-sm font-bold">★ Featured on Hero</div>
                          <div className="text-[11px] opacity-75">Highlighted on B2C home carousel</div>
                        </div>
                      </label>

                      <label className={cn(
                        "p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3",
                        isB2bVisible ? "bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400 font-bold" : "bg-[var(--surface-subtle)] border-[var(--border-default)]"
                      )}>
                        <input
                          type="checkbox"
                          checked={isB2bVisible}
                          onChange={e => setIsB2bVisible(e.target.checked)}
                          className="w-4 h-4 text-blue-500 rounded"
                        />
                        <div>
                          <div className="text-sm font-bold">Canonical B2C Attraction</div>
                          <div className="text-[11px] opacity-75">Included in standard 34 roster</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Final Save & Launch Button */}
                  <div className="pt-6 border-t border-[var(--border-default)] flex items-center justify-end gap-4">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSave(false)}
                      className="px-6 py-3 rounded-2xl border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
                    >
                      Save as Draft
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSave(true)}
                      className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isSaving ? "Publishing..." : "Save & Publish Attraction"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        availableLocations={availableLocations}
        currentlyLinkedIds={linkedLocations.map(l => l.locationId)}
        onLinkLocation={loc => {
          setLinkedLocations([
            ...linkedLocations,
            {
              locationId: loc.id,
              location: loc,
              isPrimary: linkedLocations.length === 0,
              mapVisible: true
            }
          ])
        }}
        onRefreshLocations={loadData}
      />
    </DashboardPageShell>
  )
}
