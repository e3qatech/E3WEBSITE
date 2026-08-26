"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Save, Settings, DollarSign, HelpCircle, 
  Plus, Trash2, Image as ImageIcon, MapPin, Share2, 
  Users, List, X, Eye, ExternalLink,
  Clock, Sparkles, AlertCircle, CalendarRange, Sun, Moon,
  FileSpreadsheet, UploadCloud, Download
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { MediaUploader } from "@/components/ui/MediaUploader"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { AdminSeoCustomizer } from "@/components/dashboard/ui/AdminSeoCustomizer"
import { uploadFile } from "@/lib/upload"
import {
  DashboardPageShell,
  DashboardPageHeader,
  DashboardSectionNavigator,
  EditorSectionItem,
} from "@/components/dashboard/ui"
import { AttractionMasterWorkbookModal } from "./attractions/AttractionMasterWorkbookModal"

const ATTRACTION_SECTIONS: EditorSectionItem[] = [
  { id: "general", label: "1. Core Details" },
  { id: "hero", label: "2. Hero Media" },
  { id: "motion", label: "3. Motion & Experience" },
  { id: "features", label: "4. What's Inside" },
  { id: "pricing", label: "5. Pricing & Tickets" },
  { id: "partners", label: "6. Partners" },
  { id: "social", label: "7. Social & News" },
  { id: "ops", label: "8. Locations & Ops" },
  { id: "brands", label: "9. Brands & IP" },
  { id: "visibility", label: "10. Visibility & Timing" },
  { id: "gallery", label: "11. Gallery" },
  { id: "faqs", label: "12. FAQs" },
  { id: "seo", label: "13. SEO Settings" },
];

const DEFAULT_STORY_TYPES = [
  { id: 'st-drive', slug: 'drive', titleEn: 'Drive', titleAr: 'القيادة', accentColor: '#3b82f6' },
  { id: 'st-bounce', slug: 'bounce', titleEn: 'Bounce', titleAr: 'القفز والمرح', accentColor: '#f59e0b' },
  { id: 'st-compete', slug: 'compete', titleEn: 'Compete', titleAr: 'التحدي والمنافسة', accentColor: '#ef4444' },
  { id: 'st-explore', slug: 'explore', titleEn: 'Explore', titleAr: 'الاستكشاف', accentColor: '#10b981' },
  { id: 'st-celebrate', slug: 'celebrate', titleEn: 'Celebrate', titleAr: 'الاحتفال', accentColor: '#8b5cf6' },
  { id: 'st-family-time', slug: 'family-time', titleEn: 'Family Time', titleAr: 'وقت العائلة', accentColor: '#ec4899' },
];

export function AttractionEditor({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const isEditing = !!initialData
  
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showMasterWorkbookModal, setShowMasterWorkbookModal] = useState(false)
  
  // 1. Core Details
  const [nameEn, setNameEn] = useState(initialData?.nameEn || "")
  const [nameAr, setNameAr] = useState(initialData?.nameAr || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [taglineEn, setTaglineEn] = useState(initialData?.taglineEn || "")
  const [taglineAr, setTaglineAr] = useState(initialData?.taglineAr || "")
  const [descriptionEn, setDescriptionEn] = useState(initialData?.descriptionEn || "")
  const [descriptionAr, setDescriptionAr] = useState(initialData?.descriptionAr || "")
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [isFeatured] = useState(initialData?.isFeatured ?? false)
  const [isHidden] = useState(initialData?.isHidden ?? false)

  // 2. Hero Media
  const [heroMediaType, setHeroMediaType] = useState(initialData?.heroMediaType || "IMAGE")
  const [heroMediaUrl, setHeroMediaUrl] = useState(initialData?.heroMediaUrl || "")
  const [heroFallbackUrl, setHeroFallbackUrl] = useState(initialData?.heroFallbackUrl || "")
  const [heroThumbnailUrl, setHeroThumbnailUrl] = useState(initialData?.heroThumbnailUrl || "")
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "")

  // Motion & Experience Settings
  const [motionPreset, setMotionPreset] = useState(initialData?.motionPreset || "MEDIA_CINEMATIC")
  const [motionIntensity, setMotionIntensity] = useState(initialData?.motionIntensity || "MEDIUM")
  const [heroSceneType, setHeroSceneType] = useState(initialData?.heroSceneType || "CINEMATIC_MEDIA")
  const [particleDensity, setParticleDensity] = useState(initialData?.particleDensity || 50)

  // 3. What&apos;s Inside (Features)
  const [features, setFeatures] = useState<any[]>(
    Array.isArray(initialData?.featuresList) && initialData.featuresList.length > 0
      ? initialData.featuresList.map((f: any) => ({ ...f, storyTypeIds: f.storyTypes?.map((st: any) => st.id) || [] }))
      : Array.isArray(initialData?.features) ? initialData.features : []
  )

  const [availableStoryTypes, setAvailableStoryTypes] = useState<any[]>(DEFAULT_STORY_TYPES)
  const [availableBrands, setAvailableBrands] = useState<any[]>([])

  // Quick Create Story Type Modal
  const [showQuickStoryTypeModal, setShowQuickStoryTypeModal] = useState(false)
  const [targetFeatureIndexForStoryType, setTargetFeatureIndexForStoryType] = useState<number | null>(null)
  const [newStoryTitleEn, setNewStoryTitleEn] = useState("")
  const [newStoryTitleAr, setNewStoryTitleAr] = useState("")
  const [newStoryAccentColor, setNewStoryAccentColor] = useState("#3b82f6")
  const [isCreatingStoryType, setIsCreatingStoryType] = useState(false)

  // Quick Create Brand Modal
  const [showQuickBrandModal, setShowQuickBrandModal] = useState(false)
  const [targetFeatureIndexForBrand, setTargetFeatureIndexForBrand] = useState<number | null>(null)
  const [newBrandNameEn, setNewBrandNameEn] = useState("")
  const [newBrandNameAr, setNewBrandNameAr] = useState("")
  const [newBrandLogoUrl, setNewBrandLogoUrl] = useState("")
  const [newBrandType, setNewBrandType] = useState("OWNED")
  const [isCreatingBrand, setIsCreatingBrand] = useState(false)

  useEffect(() => {
    fetch('/api/b2c/story-types?active=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableStoryTypes(data)
        } else {
          setAvailableStoryTypes(DEFAULT_STORY_TYPES)
        }
      })
      .catch(() => setAvailableStoryTypes(DEFAULT_STORY_TYPES))

    fetch('/api/b2c/brands')
      .then(res => res.json())
      .then(data => setAvailableBrands(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [])

  // 4. Pricing & Tickets
  const [pricing, setPricing] = useState<any[]>(initialData?.pricing || [])

  // 5. Partners
  const [partnerOffers, setPartnerOffers] = useState<any[]>(
    Array.isArray(initialData?.partnerOffers) ? initialData.partnerOffers : []
  )
  const [partners, setPartners] = useState<any[]>(
    Array.isArray(initialData?.partners) ? initialData.partners : []
  )

  // 6. Social & News
  const [socialLinks, setSocialLinks] = useState<any[]>(initialData?.socialLinks || [])
  const [socialPreviews, setSocialPreviews] = useState<any[]>(
    Array.isArray(initialData?.socialPreviews) ? initialData.socialPreviews : []
  )
  const [newsCoverage, setNewsCoverage] = useState<any[]>(
    Array.isArray(initialData?.newsCoverage) ? initialData.newsCoverage : []
  )

  // 7. Locations & Operations
  const [locations, setLocations] = useState<any[]>(
    Array.isArray(initialData?.locations) ? initialData.locations : []
  )
  
  // Temporary legacy fields for backward compatibility
  const [mapUrl, _setMapUrl] = useState(initialData?.mapUrl || "")
  const [ticketingUrl, _setTicketingUrl] = useState(initialData?.ticketingUrl || "")
  const [operations, _setOperations] = useState<any>(
    initialData?.operations || { venueName: "", ageGroup: "", hours: "", schedules: [], contactDetails: { phone: "", email: "", whatsapp: "", chatLink: "" } }
  )

  const [temporalStatus, setTemporalStatus] = useState<any>(() => {
    const existing = initialData?.temporalStatus || {}
    const existingRules = Array.isArray(existing?.temporalRules)
      ? existing.temporalRules
      : (Array.isArray(initialData?.temporalRules) ? initialData.temporalRules : [])

    return {
      isPermanent: existing.isPermanent !== undefined ? Boolean(existing.isPermanent) : true,
      isSpecialEvent: Boolean(existing.isSpecialEvent),
      isComingSoon: Boolean(existing.isComingSoon),
      startDate: existing.startDate || "",
      endDate: existing.endDate || "",
      bookingStartDate: existing.bookingStartDate || "",
      statusOverride: existing.statusOverride || "",
      // Daily Operating Hours
      openTime: existing.openTime || "10:00",
      closeTime: existing.closeTime || "22:00",
      lastEntryTime: existing.lastEntryTime || "21:15",
      daysOfWeek: Array.isArray(existing.daysOfWeek) && existing.daysOfWeek.length > 0 
        ? existing.daysOfWeek 
        : [0, 1, 2, 3, 4, 5, 6],
      // Bilingual Display Summaries
      operatingHoursEn: existing.operatingHoursEn || "",
      operatingHoursAr: existing.operatingHoursAr || "",
      // Weekend & Shift Overrides
      hasWeekendHours: Boolean(existing.hasWeekendHours),
      weekendDays: Array.isArray(existing.weekendDays) && existing.weekendDays.length > 0 
        ? existing.weekendDays 
        : [4, 5, 6], // Thu, Fri, Sat
      weekendOpenTime: existing.weekendOpenTime || "10:00",
      weekendCloseTime: existing.weekendCloseTime || "00:00",
      hasFridayBreak: Boolean(existing.hasFridayBreak),
      fridayOpenTime: existing.fridayOpenTime || "13:30",
      // Seasonal & Special Notes
      seasonalNotesEn: existing.seasonalNotesEn || "",
      seasonalNotesAr: existing.seasonalNotesAr || "",
      timezone: existing.timezone || "Asia/Qatar",
      // Custom Exception Rules
      temporalRules: existingRules
    }
  })

  // Helper to toggle a day in standard daysOfWeek
  const toggleDayOfWeek = (dayIndex: number) => {
    setTemporalStatus((prev: any) => {
      const currentDays = Array.isArray(prev.daysOfWeek) ? [...prev.daysOfWeek] : []
      const exists = currentDays.includes(dayIndex)
      const nextDays = exists 
        ? currentDays.filter((d: number) => d !== dayIndex) 
        : [...currentDays, dayIndex].sort((a: number, b: number) => a - b)
      return { ...prev, daysOfWeek: nextDays }
    })
  }

  // Helper to toggle weekend days
  const toggleWeekendDay = (dayIndex: number) => {
    setTemporalStatus((prev: any) => {
      const currentDays = Array.isArray(prev.weekendDays) ? [...prev.weekendDays] : []
      const exists = currentDays.includes(dayIndex)
      const nextDays = exists 
        ? currentDays.filter((d: number) => d !== dayIndex) 
        : [...currentDays, dayIndex].sort((a: number, b: number) => a - b)
      return { ...prev, weekendDays: nextDays }
    })
  }

  // Auto-compose bilingual formatted operating hours from current timings
  const handleAutoGenerateOperatingHours = () => {
    const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const dayNamesAr = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

    const formatTimeEn = (timeStr?: string) => {
      if (!timeStr) return ""
      const [hStr, mStr] = timeStr.split(":")
      const h = parseInt(hStr || "0", 10)
      const m = parseInt(mStr || "0", 10)
      const period = h >= 12 ? "PM" : "AM"
      const hour12 = h % 12 || 12
      return `${hour12}:${String(m).padStart(2, "0")} ${period}`
    }

    const formatTimeAr = (timeStr?: string) => {
      if (!timeStr) return ""
      const [hStr, mStr] = timeStr.split(":")
      const h = parseInt(hStr || "0", 10)
      const m = parseInt(mStr || "0", 10)
      const period = h >= 12 ? "م" : "ص"
      const hour12 = h % 12 || 12
      return `${hour12}:${String(m).padStart(2, "0")} ${period}`
    }

    const stdOpenEn = formatTimeEn(temporalStatus.openTime || "10:00")
    const stdCloseEn = formatTimeEn(temporalStatus.closeTime || "22:00")
    const stdOpenAr = formatTimeAr(temporalStatus.openTime || "10:00")
    const stdCloseAr = formatTimeAr(temporalStatus.closeTime || "22:00")

    let enText = ""
    let arText = ""

    if (temporalStatus.hasWeekendHours) {
      const wkOpenEn = formatTimeEn(temporalStatus.weekendOpenTime || "10:00")
      const wkCloseEn = formatTimeEn(temporalStatus.weekendCloseTime || "00:00")
      const wkOpenAr = formatTimeAr(temporalStatus.weekendOpenTime || "10:00")
      const wkCloseAr = formatTimeAr(temporalStatus.weekendCloseTime || "00:00")

      enText = `Sun – Wed: ${stdOpenEn} – ${stdCloseEn} | Thu – Sat: ${wkOpenEn} – ${wkCloseEn}`
      arText = `الأحد – الأربعاء: ${stdOpenAr} – ${stdCloseAr} | الخميس – السبت: ${wkOpenAr} – ${wkCloseAr}`
    } else if (temporalStatus.daysOfWeek?.length === 7) {
      enText = `Daily: ${stdOpenEn} – ${stdCloseEn}`
      arText = `يومياً: ${stdOpenAr} – ${stdCloseAr}`
    } else {
      const daysEn = (temporalStatus.daysOfWeek || []).map((d: number) => dayNamesEn[d]).join(", ")
      const daysAr = (temporalStatus.daysOfWeek || []).map((d: number) => dayNamesAr[d]).join("، ")
      enText = `${daysEn || "Selected Days"}: ${stdOpenEn} – ${stdCloseEn}`
      arText = `${daysAr || "أيام محددة"}: ${stdOpenAr} – ${stdCloseAr}`
    }

    setTemporalStatus((prev: any) => ({
      ...prev,
      operatingHoursEn: enText,
      operatingHoursAr: arText
    }))
  }

  // Helper to add an exception rule
  const handleAddTemporalRule = () => {
    const newRule = {
      id: `rule-${Date.now()}`,
      ruleType: "OVERRIDE",
      nameEn: "Special Hours Override",
      nameAr: "ساعات عمل خاصة",
      startDate: "",
      endDate: "",
      openTime: "10:00",
      closeTime: "23:00",
      notes: ""
    }
    setTemporalStatus((prev: any) => ({
      ...prev,
      temporalRules: [...(prev.temporalRules || []), newRule]
    }))
  }

  const handleRemoveTemporalRule = (index: number) => {
    setTemporalStatus((prev: any) => ({
      ...prev,
      temporalRules: (prev.temporalRules || []).filter((_: any, i: number) => i !== index)
    }))
  }

  const handleUpdateTemporalRule = (index: number, field: string, value: any) => {
    setTemporalStatus((prev: any) => {
      const updated = [...(prev.temporalRules || [])]
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value }
      }
      return { ...prev, temporalRules: updated }
    })
  }
  const [testimonials, setTestimonials] = useState<any[]>(
    Array.isArray(initialData?.testimonials) ? initialData.testimonials : []
  )

  // 7.5 Brands & Portfolio
  const [brandPlacements, setBrandPlacements] = useState<any[]>(
    Array.isArray(initialData?.brandPlacements) ? initialData.brandPlacements : []
  )

  // 8. FAQs
  const [faqs, setFaqs] = useState<any[]>(initialData?.faqs || [])

  // 9. Gallery
  const [gallery, setGallery] = useState<any[]>(initialData?.gallery || [])

  const [seo, setSeo] = useState<any>(initialData?.seo || {})

  const [errors, setErrors] = useState<string[]>([])

  const currentData = JSON.stringify({
    nameEn, nameAr, slug, taglineEn, taglineAr, descriptionEn, descriptionAr,
    isPublished, isFeatured, isHidden,
    heroMediaType, heroMediaUrl, heroFallbackUrl, heroThumbnailUrl, logoUrl,
    features, pricing, partnerOffers, partners, socialLinks, socialPreviews, newsCoverage,
    locations, mapUrl, ticketingUrl, operations, brandPlacements, temporalStatus, faqs, testimonials, gallery
  })
  const [initialDataStr] = useState(currentData)
  const isDirty = currentData !== initialDataStr

  useEffect(() => {
    if (!isDirty) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const handleQuickCreateStoryType = async () => {
    if (!newStoryTitleEn.trim()) return
    setIsCreatingStoryType(true)
    try {
      const res = await fetch("/api/b2c/story-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: newStoryTitleEn.trim(),
          titleAr: newStoryTitleAr.trim() || newStoryTitleEn.trim(),
          accentColor: newStoryAccentColor,
          isActive: true
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to create Story Type")
      }
      const created = await res.json()
      setAvailableStoryTypes(prev => [...prev, created])
      
      if (targetFeatureIndexForStoryType !== null && features[targetFeatureIndexForStoryType]) {
        const updated = [...features]
        const currentIds = updated[targetFeatureIndexForStoryType].storyTypeIds || []
        updated[targetFeatureIndexForStoryType] = {
          ...updated[targetFeatureIndexForStoryType],
          storyTypeIds: Array.from(new Set([...currentIds, created.id]))
        }
        setFeatures(updated)
      }
      
      setShowQuickStoryTypeModal(false)
      setNewStoryTitleEn("")
      setNewStoryTitleAr("")
      setTargetFeatureIndexForStoryType(null)
    } catch (err: any) {
      alert(err.message || "Failed to create story type")
    } finally {
      setIsCreatingStoryType(false)
    }
  }

  const handleQuickCreateBrand = async () => {
    if (!newBrandNameEn.trim()) return
    setIsCreatingBrand(true)
    try {
      const res = await fetch("/api/b2c/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn: newBrandNameEn.trim(),
          nameAr: newBrandNameAr.trim() || newBrandNameEn.trim(),
          logoUrl: newBrandLogoUrl,
          brandType: newBrandType,
          isActive: true
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to create Brand")
      }
      const created = await res.json()
      setAvailableBrands(prev => [created, ...prev])
      
      if (targetFeatureIndexForBrand !== null && features[targetFeatureIndexForBrand]) {
        const updated = [...features]
        updated[targetFeatureIndexForBrand] = {
          ...updated[targetFeatureIndexForBrand],
          linkedBrandId: created.id,
          showBrandLogo: true
        }
        setFeatures(updated)
      }
      
      setShowQuickBrandModal(false)
      setNewBrandNameEn("")
      setNewBrandNameAr("")
      setNewBrandLogoUrl("")
      setTargetFeatureIndexForBrand(null)
    } catch (err: any) {
      alert(err.message || "Failed to create brand")
    } finally {
      setIsCreatingBrand(false)
    }
  }

  const handleSave = async () => {
    const newErrors = []
    if (!nameEn) newErrors.push("nameEn")
    if (!slug) newErrors.push("slug")
    
    if (newErrors.length > 0) {
      setActiveTab("general")
      setErrors(newErrors)
      setTimeout(() => setErrors([]), 800)
      return
    }
    
    setIsSaving(true)
    try {
      const payload = {
        nameEn, nameAr, slug, taglineEn, taglineAr, descriptionEn, descriptionAr,
        isPublished, isFeatured, isHidden,
        heroMediaType, heroMediaUrl, heroFallbackUrl, heroThumbnailUrl, logoUrl,
        motionPreset, motionIntensity, heroSceneType, particleDensity,
        features,
        pricing,
        partnerOffers, partners,
        socialLinks, socialPreviews, newsCoverage,
        locations, brandPlacements,
        mapUrl, ticketingUrl, operations, temporalStatus,
        faqs, testimonials, gallery, seo
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
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned error ${res.status}`);
      }
      
      router.push("/dashboard/b2c/attractions")
      router.refresh()
    } catch (err: any) {
      console.error("[SAVE_ATTRACTION_ERROR]", err);
      alert(err.message || "Error saving attraction");
    } finally {
      setIsSaving(false);
    }
  }

  const tabs = [
    { id: "general", label: "Core Details", icon: Settings },
    { id: "hero", label: "Hero Media", icon: ImageIcon },
    { id: "motion", label: "Motion & Experience", icon: Settings },
    { id: "features", label: "What's Inside", icon: List },
    { id: "pricing", label: "Pricing & Tickets", icon: DollarSign },
    { id: "partners", label: "Partners", icon: Users },
    { id: "social", label: "Social & News", icon: Share2 },
    { id: "ops", label: "Locations & Ops", icon: MapPin },
    { id: "brands", label: "Brands & IP", icon: Users },
    { id: "visibility", label: "Visibility & Timing", icon: Clock },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    { id: "faqs", label: "FAQs", icon: HelpCircle },
    { id: "seo", label: "SEO Settings", icon: Settings },
  ]

  // Helper for generic array updates
  const updateArrayItem = (setter: any, array: any[], index: number, field: string, value: any) => {
    const newArr = [...array]
    newArr[index][field] = value
    setter(newArr)
  }

  return (
    <DashboardPageShell variant="wide">
      {/* Header */}
      <DashboardPageHeader
        title={isEditing ? `Edit Attraction: ${nameEn || "Untitled"}` : "New Attraction Microsite"}
        description="Configure attraction microsite details, hero assets, motion experience, pricing tiers, and SEO."
        breadcrumbs={[
          { label: "B2C Attractions", href: "/dashboard/b2c/attractions" },
          { label: isEditing ? (nameEn || "Edit Attraction") : "New Attraction" },
        ]}
        badge={{
          label: isPublished ? "PUBLISHED" : "DRAFT",
          variant: isPublished ? "success" : "warning",
        }}
        previewUrl={slug ? `/b2c/attractions/${slug}` : undefined}
        primaryAction={{
          label: isSaving ? "Saving..." : "Save Changes",
          onClick: handleSave,
          isLoading: isSaving,
          icon: <Save className="w-4 h-4" />,
        }}
        secondaryAction={
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/api/b2c/attractions/master-workbook/export${slug || initialData?.slug ? `?slug=${slug || initialData?.slug}` : ""}`}
              download
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--e3-royal-blue)] text-[var(--text-primary)] border border-[var(--border-default)] text-xs font-bold transition-all cursor-pointer"
              title="Download 3-tab Master Workbook (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Download Master Workbook</span>
            </a>

            <button
              type="button"
              onClick={() => setShowMasterWorkbookModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Import or Update via 3-tab Master Workbook (.xlsx / .csv)"
            >
              <UploadCloud className="w-3.5 h-3.5 text-purple-400" />
              <span>Import Master Workbook</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--e3-royal-blue)] text-[var(--text-primary)] border border-[var(--border-default)] text-xs font-bold transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Preview</span>
            </button>
            <label className="flex items-center gap-2 cursor-pointer bg-[var(--surface-subtle)] px-3 py-2 rounded-xl border border-[var(--border-default)]">
              <input 
                type="checkbox" 
                checked={isPublished}
                onChange={e => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-xs font-bold text-[var(--text-primary)]">Published</span>
            </label>
          </div>
        }
      />

      <DashboardSectionNavigator
        sections={ATTRACTION_SECTIONS}
        activeSectionId={activeTab}
        onSelectSection={setActiveTab}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left",
                  activeTab === tab.id 
                    ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20 translate-x-1" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl shadow-sm p-6 md:p-8 min-h-[600px]">
          
          {/* 1. CORE DETAILS */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6">Core Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div animate={{ x: errors.includes("nameEn") ? [0, -10, 10, -10, 10, 0] : 0 }} transition={{ duration: 0.4 }} className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Attraction Name (EN) *</label>
                  <input type="text" value={nameEn}
                    onChange={e => {
                      setNameEn(e.target.value)
                      if (!isEditing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
                    }}
                    className={cn(
                      "w-full bg-[var(--surface-subtle)] border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors",
                      errors.includes("nameEn") ? "border-[var(--color-error)] focus:border-[var(--color-error)]" : "border-[var(--border-default)] focus:border-[var(--color-primary)]"
                    )}
                  />
                </motion.div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Attraction Name (AR)</label>
                  <input type="text" dir="rtl" value={nameAr} onChange={e => setNameAr(e.target.value)}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none transition-colors text-right"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tagline (EN)</label>
                  <input type="text" value={taglineEn} onChange={e => setTaglineEn(e.target.value)}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tagline (AR)</label>
                  <input type="text" dir="rtl" value={taglineAr} onChange={e => setTaglineAr(e.target.value)}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none transition-colors text-right"
                  />
                </div>
                <motion.div animate={{ x: errors.includes("slug") ? [0, -10, 10, -10, 10, 0] : 0 }} transition={{ duration: 0.4 }} className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">URL Slug *</label>
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
                    className={cn(
                      "w-full bg-[var(--surface-subtle)] border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none transition-colors",
                      errors.includes("slug") ? "border-[var(--color-error)] focus:border-[var(--color-error)]" : "border-[var(--border-default)] focus:border-[var(--color-primary)]"
                    )}
                  />
                </motion.div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Description (EN)</label>
                  <textarea value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} rows={5}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none resize-y"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Description (AR)</label>
                  <textarea dir="rtl" value={descriptionAr} onChange={e => setDescriptionAr(e.target.value)} rows={5}
                    className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none resize-y text-right"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. HERO MEDIA */}
          {activeTab === "hero" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6">Hero Media Controller</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 block">Media Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["IMAGE", "VIDEO", "MODEL_3D", "IFRAME"].map(type => (
                      <button key={type} onClick={() => setHeroMediaType(type)}
                        className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                          heroMediaType === type 
                          ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]' 
                          : 'bg-[var(--surface-subtle)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--color-primary)]/50'
                        }`}
                      >
                        {type.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Primary Media Source (Upload or URL)</label>
                  {heroMediaType === 'IFRAME' ? (
                    <input 
                      type="text" 
                      value={heroMediaUrl || ''} 
                      onChange={e => setHeroMediaUrl(e.target.value)} 
                      placeholder="https://my.spline.design/..." 
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                    />
                  ) : (
                    <div className="space-y-4">
                      <MediaUploader 
                        value={heroMediaUrl} 
                        onChange={(url) => {
                          setHeroMediaUrl(url);
                          // Distribute accordingly
                          if (heroMediaType === 'IMAGE') {
                            if (!heroFallbackUrl) setHeroFallbackUrl(url);
                            if (!heroThumbnailUrl) setHeroThumbnailUrl(url);
                            if (!logoUrl) setLogoUrl(url);
                          } else if (heroMediaType === 'VIDEO' || heroMediaType === 'MODEL_3D') {
                            // Even if it's video/3D, they might want the URL for thumbnail or we don't overwrite if it's not an image.
                            // But usually, video is just the primary media.
                          }
                        }}
                        accept={heroMediaType === 'VIDEO' ? "video/*" : heroMediaType === 'MODEL_3D' ? ".glb,.gltf" : "image/*"}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase whitespace-nowrap">OR EXTERNAL URL:</span>
                        <input 
                          type="text" 
                          value={heroMediaUrl || ''} 
                          onChange={e => setHeroMediaUrl(e.target.value)} 
                          onBlur={e => {
                            const url = e.target.value;
                            if (url && heroMediaType === 'IMAGE') {
                              if (!heroFallbackUrl) setHeroFallbackUrl(url);
                              if (!heroThumbnailUrl) setHeroThumbnailUrl(url);
                              if (!logoUrl) setLogoUrl(url);
                            }
                          }}
                          placeholder="https://..." 
                          className="flex-1 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none" 
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Fallback Image URL</label>
                    <MediaUploader value={heroFallbackUrl} onChange={setHeroFallbackUrl} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Thumbnail Image URL</label>
                    <MediaUploader value={heroThumbnailUrl} onChange={setHeroThumbnailUrl} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Attraction Logo URL</label>
                    <MediaUploader value={logoUrl} onChange={setLogoUrl} />
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* 3. MOTION & EXPERIENCE */}
          {activeTab === "motion" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-black mb-6">Motion & Experience Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Motion Preset</label>
                  <select
                    value={motionPreset}
                    onChange={e => setMotionPreset(e.target.value)}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                  >
                    <option value="MEDIA_CINEMATIC">MEDIA_CINEMATIC</option>
                    <option value="SOFT_BODY">SOFT_BODY</option>
                    <option value="KINETIC_GRID">KINETIC_GRID</option>
                    <option value="ROAD_NETWORK">ROAD_NETWORK</option>
                    <option value="SPATIAL_PORTAL">SPATIAL_PORTAL</option>
                    <option value="PARTICLE_WORLD">PARTICLE_WORLD</option>
                    <option value="LIGHT_TRAILS">LIGHT_TRAILS</option>
                    <option value="STATIC_PREMIUM">STATIC_PREMIUM</option>
                    <option value="OBJECT_REVEAL">OBJECT_REVEAL</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Motion Intensity</label>
                  <select
                    value={motionIntensity}
                    onChange={e => setMotionIntensity(e.target.value)}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Hero Scene Type</label>
                  <select
                    value={heroSceneType}
                    onChange={e => setHeroSceneType(e.target.value)}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                  >
                    <option value="CINEMATIC_MEDIA">CINEMATIC_MEDIA</option>
                    <option value="DEPTH_WORLD">DEPTH_WORLD</option>
                    <option value="PARTICLE_WORLD">PARTICLE_WORLD</option>
                    <option value="OBJECT_REVEAL">OBJECT_REVEAL</option>
                    <option value="SPATIAL_PORTAL">SPATIAL_PORTAL</option>
                    <option value="STATIC_PREMIUM">STATIC_PREMIUM</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Particle Density ({particleDensity})</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={particleDensity}
                    onChange={e => setParticleDensity(Number(e.target.value))}
                    className="w-full h-2 bg-[var(--surface-active)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. WHAT'S INSIDE */}
          {activeTab === "features" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-[var(--text-primary)]">What&apos;s Inside (Experience &amp; Highlights)</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Configure bilingual titles, Arabic descriptions, and media covers for attraction highlights.</p>
                </div>
                <Button
                  type="button"
                  onClick={() => setFeatures([...features, { id: Date.now(), titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "", imageUrl: "" }])}
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl"
                >
                  <Plus className="w-4 h-4" /> Add Highlight Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {features.map((item, index) => (
                  <div key={item.id || index} className="p-5 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative space-y-4">
                    <button
                      type="button"
                      onClick={() => setFeatures(features.filter((_, i) => i !== index))}
                      className="absolute top-4 end-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pe-10">
                      {/* English Title */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Highlight Title (English)</label>
                        <input
                          type="text"
                          value={item.titleEn ?? item.title ?? ""}
                          onChange={e => {
                            const updated = [...features];
                            updated[index] = { ...updated[index], titleEn: e.target.value, title: e.target.value };
                            setFeatures(updated);
                          }}
                          placeholder="e.g. 360-Degree Dome Theater"
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                        />
                      </div>

                      {/* Arabic Title */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">العنوان (بالعربية)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={item.titleAr ?? ""}
                          onChange={e => {
                            const updated = [...features];
                            updated[index] = { ...updated[index], titleAr: e.target.value };
                            setFeatures(updated);
                          }}
                          placeholder="مثال: مسرح القبة التفاعلية 360 درجة"
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none text-right"
                        />
                      </div>

                      {/* Media URL */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Highlight Cover Media (Image / Video URL)</label>
                        <MediaUploader
                          value={item.imageUrl}
                          onChange={val => {
                            const updated = [...features];
                            updated[index] = { ...updated[index], imageUrl: val };
                            setFeatures(updated);
                          }}
                        />
                      </div>

                      {/* English Description */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Short Description (English)</label>
                        <textarea
                          rows={2}
                          value={item.descriptionEn ?? item.description ?? ""}
                          onChange={e => {
                            const updated = [...features];
                            updated[index] = { ...updated[index], descriptionEn: e.target.value, description: e.target.value };
                            setFeatures(updated);
                          }}
                          placeholder="Describe what visitors experience..."
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none resize-none"
                        />
                      </div>

                      {/* Arabic Description */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">الوصف (بالعربية)</label>
                        <textarea
                          rows={2}
                          dir="rtl"
                          value={item.descriptionAr ?? ""}
                          onChange={e => {
                            const updated = [...features];
                            updated[index] = { ...updated[index], descriptionAr: e.target.value };
                            setFeatures(updated);
                          }}
                          placeholder="صف تجربة الزوار وتفاصيل الجذب..."
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none resize-none text-right"
                        />
                      </div>

                      {/* Story Discovery Classification */}
                      <div className="space-y-1.5 md:col-span-2 mt-2 pt-2 border-t border-[var(--border-default)]/50">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                            Story Type / Activity Classification (Story Discovery)
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setTargetFeatureIndexForStoryType(index)
                              setShowQuickStoryTypeModal(true)
                            }}
                            className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> + Quick Create Type
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(item.storyTypeIds || []).map((stId: string) => {
                            const st = availableStoryTypes.find(t => t.id === stId || t.slug === stId)
                            return (
                              <span key={stId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm" style={{ backgroundColor: `${st?.accentColor || '#3b82f6'}20`, color: st?.accentColor || '#3b82f6', border: `1px solid ${st?.accentColor || '#3b82f6'}40` }}>
                                {st?.titleEn || stId}
                                <button type="button" onClick={() => {
                                  const updated = [...features];
                                  updated[index] = { ...updated[index], storyTypeIds: (item.storyTypeIds || []).filter((id: string) => id !== stId) };
                                  setFeatures(updated);
                                }} className="hover:opacity-70 ml-1 font-bold">×</button>
                              </span>
                            )
                          })}
                        </div>
                        <select
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none cursor-pointer"
                          value=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            const currentIds = item.storyTypeIds || [];
                            if (!currentIds.includes(val)) {
                              const updated = [...features];
                              updated[index] = { ...updated[index], storyTypeIds: [...currentIds, val] };
                              setFeatures(updated);
                            }
                          }}
                        >
                          <option value="">+ Assign Story Type...</option>
                          {availableStoryTypes.filter(st => !(item.storyTypeIds || []).includes(st.id) && !(item.storyTypeIds || []).includes(st.slug)).map(st => (
                            <option key={st.id || st.slug} value={st.id || st.slug}>{st.titleEn} / {st.titleAr}</option>
                          ))}
                        </select>
                      </div>

                      {/* Highlight Type & Icon Upload */}
                      <div className="space-y-1.5 md:col-span-2 mt-2 pt-2 border-t border-[var(--border-default)]/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Highlight Type</label>
                          <select
                            value={item.highlightType || "ACTIVITY"}
                            onChange={e => {
                              const updated = [...features];
                              updated[index] = { ...updated[index], highlightType: e.target.value };
                              setFeatures(updated);
                            }}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                          >
                            <option value="ACTIVITY">Activity</option>
                            <option value="DINING">Dining / F&B</option>
                            <option value="RETAIL">Retail</option>
                            <option value="SERVICE">Service</option>
                            <option value="SHOW">Show / Entertainment</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                            Icon (Local Upload, SVG Code or URL)
                          </label>
                          <div className="space-y-2">
                            <MediaUploader
                              value={item.iconUrl || ""}
                              onChange={val => {
                                const updated = [...features];
                                updated[index] = { ...updated[index], iconUrl: val };
                                setFeatures(updated);
                              }}
                              accept="image/*,.svg"
                              placeholder="Upload local SVG / Icon file"
                            />
                            <input
                              type="text"
                              value={item.iconUrl || ""}
                              onChange={e => {
                                const updated = [...features];
                                updated[index] = { ...updated[index], iconUrl: e.target.value };
                                setFeatures(updated);
                              }}
                              placeholder="Or enter URL / SVG path (e.g. /icons/ride.svg)"
                              className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Brand Linking & Quick Create */}
                      <div className="space-y-1.5 md:col-span-2 mt-2 pt-2 border-t border-[var(--border-default)]/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                              Linked Brand / IP
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetFeatureIndexForBrand(index)
                                  setShowQuickBrandModal(true)
                                }}
                                className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" /> + Quick Create Brand
                              </button>
                              <a
                                href="/dashboard/b2c/brands"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
                              >
                                Manage Portfolio ↗
                              </a>
                            </div>
                          </div>
                          <select
                            value={item.linkedBrandId || ""}
                            onChange={e => {
                              const updated = [...features];
                              updated[index] = { ...updated[index], linkedBrandId: e.target.value };
                              setFeatures(updated);
                            }}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none cursor-pointer"
                          >
                            <option value="">-- No Linked Brand --</option>
                            {availableBrands.map(b => (
                              <option key={b.id} value={b.id}>{b.nameEn} ({b.brandType || "BRAND"})</option>
                            ))}
                          </select>
                        </div>
                        
                        {item.linkedBrandId && (
                          <div className="space-y-2 flex flex-col justify-end">
                            <label className="flex items-center gap-2 cursor-pointer pt-2">
                              <input
                                type="checkbox"
                                checked={item.showBrandLogo ?? false}
                                onChange={e => {
                                  const updated = [...features];
                                  updated[index] = { ...updated[index], showBrandLogo: e.target.checked };
                                  setFeatures(updated);
                                }}
                                className="rounded border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                              />
                              <span className="text-sm font-bold text-[var(--text-primary)]">Display Brand Logo in UI</span>
                            </label>
                            
                            {item.showBrandLogo && (
                              <select
                                value={item.logoVariant || "AUTO"}
                                onChange={e => {
                                  const updated = [...features];
                                  updated[index] = { ...updated[index], logoVariant: e.target.value };
                                  setFeatures(updated);
                                }}
                                className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                              >
                                <option value="AUTO">Auto (Logo or Name)</option>
                                <option value="PRIMARY">Primary Logo</option>
                                <option value="LIGHT">Light Logo</option>
                                <option value="DARK">Dark Logo</option>
                                <option value="COMPACT">Compact / Icon</option>
                                <option value="TEXT">Text Only</option>
                              </select>
                            )}
                          </div>
                        )}

                        {locations.length > 0 && (
                          <div className="space-y-1.5 md:col-span-2 pt-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Available At Locations</label>
                            <div className="flex flex-wrap gap-2">
                              {locations.map((loc: any, locIndex: number) => {
                                const isSelected = item.locationIndexes?.includes(locIndex);
                                return (
                                  <label key={locIndex} className="flex items-center gap-2 cursor-pointer bg-[var(--surface-subtle)] border border-[var(--border-default)] px-3 py-1.5 rounded-lg">
                                    <input
                                      type="checkbox"
                                      checked={isSelected || false}
                                      onChange={e => {
                                        const updated = [...features];
                                        const currentLocs = updated[index].locationIndexes || [];
                                        if (e.target.checked) {
                                          updated[index].locationIndexes = [...currentLocs, locIndex];
                                        } else {
                                          updated[index].locationIndexes = currentLocs.filter((i: number) => i !== locIndex);
                                        }
                                        setFeatures(updated);
                                      }}
                                      className="rounded"
                                    />
                                    <span className="text-xs font-bold">{loc.nameEn || `Location ${locIndex + 1}`}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {features.length === 0 && <div className="text-center py-12 border-2 border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-tertiary)] font-medium">No highlight items added yet. Click &quot;Add Highlight Item&quot; to begin.</div>}
              </div>
            </div>
          )}

          {/* 4. PRICING */}
          {activeTab === "pricing" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black">Pricing & Tickets</h2>
                <Button type="button" onClick={() => setPricing([...pricing, { id: Date.now().toString(), titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "", price: 0, discount: 0, currency: "QAR", type: "GENERAL" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Add Tier
                </Button>
              </div>

              <div className="space-y-4">
                {pricing.map((tier, index) => (
                  <div key={tier.id || index} className="p-5 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative">
                    <button type="button" onClick={() => setPricing(pricing.filter((_, i) => i !== index))} className="absolute top-4 end-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pe-10">
                      <div className="md:col-span-4 space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Tier Title (EN)</label>
                          <input type="text" value={tier.titleEn} onChange={e => updateArrayItem(setPricing, pricing, index, "titleEn", e.target.value)}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Tier Title (AR)</label>
                          <input type="text" dir="rtl" value={tier.titleAr} onChange={e => updateArrayItem(setPricing, pricing, index, "titleAr", e.target.value)}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-4 space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Base Price</label>
                          <input type="number" value={tier.price} onChange={e => updateArrayItem(setPricing, pricing, index, "price", parseFloat(e.target.value))}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Discount %</label>
                          <input type="number" value={tier.discount || ''} onChange={e => updateArrayItem(setPricing, pricing, index, "discount", parseFloat(e.target.value))}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-4 space-y-3">
                         <div>
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1 block">Ticket Type</label>
                          <input type="text" placeholder="e.g. VIP, General, Family" value={tier.type} onChange={e => updateArrayItem(setPricing, pricing, index, "type", e.target.value)}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-12 space-y-3 mt-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Short Description (EN & AR)</label>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="EN Description" value={tier.descriptionEn || ''} onChange={e => updateArrayItem(setPricing, pricing, index, "descriptionEn", e.target.value)}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
                          />
                           <input type="text" placeholder="AR Description" dir="rtl" value={tier.descriptionAr || ''} onChange={e => updateArrayItem(setPricing, pricing, index, "descriptionAr", e.target.value)}
                            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {pricing.length === 0 && <div className="text-center py-12 border-2 border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-tertiary)] font-medium">No pricing tiers defined.</div>}
              </div>
            </div>
          )}

          {/* 5. PARTNERS */}
          {activeTab === "partners" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Partner Offers */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black">Partner Offers</h2>
                  <Button type="button" onClick={() => setPartnerOffers([...partnerOffers, { id: Date.now(), name: "", discount: "", description: "", image: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Offer
                  </Button>
                </div>
                <div className="space-y-4">
                  {partnerOffers.map((offer, index) => (
                    <div key={offer.id || index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative">
                      <button type="button" onClick={() => setPartnerOffers(partnerOffers.filter((_, i) => i !== index))} className="absolute top-4 end-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pe-10">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Partner Name</label>
                          <input type="text" value={offer.name} onChange={e => updateArrayItem(setPartnerOffers, partnerOffers, index, "name", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Discount Detail</label>
                          <input type="text" value={offer.discount} onChange={e => updateArrayItem(setPartnerOffers, partnerOffers, index, "discount", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Image/Logo URL</label>
                          <MediaUploader value={offer.image} onChange={val => updateArrayItem(setPartnerOffers, partnerOffers, index, "image", val)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Short Description</label>
                          <input type="text" value={offer.description} onChange={e => updateArrayItem(setPartnerOffers, partnerOffers, index, "description", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[var(--border-default)] w-full" />

              {/* General Partners */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black">General Partners</h2>
                  <Button type="button" onClick={() => setPartners([...partners, { id: Date.now(), name: "", tagline: "", logo: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Partner
                  </Button>
                </div>
                <div className="space-y-4">
                  {partners.map((partner, index) => (
                    <div key={partner.id || index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative flex gap-4 pe-10">
                      <button type="button" onClick={() => setPartners(partners.filter((_, i) => i !== index))} className="absolute top-4 end-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <input type="text" placeholder="Name (e.g. Visit Qatar)" value={partner.name} onChange={e => updateArrayItem(setPartners, partners, index, "name", e.target.value)} className="w-1/3 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      <input type="text" placeholder="Tagline (e.g. Official Tourism Partner)" value={partner.tagline} onChange={e => updateArrayItem(setPartners, partners, index, "tagline", e.target.value)} className="w-1/3 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      <div className="w-1/3">
                        <MediaUploader value={partner.logo} onChange={val => updateArrayItem(setPartners, partners, index, "logo", val)} placeholder="Logo URL" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 6. SOCIAL & NEWS */}
          {activeTab === "social" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Official Social Links */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black">Official Social Links</h2>
                  <Button type="button" onClick={() => setSocialLinks([...socialLinks, { id: Date.now(), platform: "Instagram", url: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Link
                  </Button>
                </div>
                <div className="space-y-3">
                  {socialLinks.map((link, index) => (
                    <div key={link.id || index} className="flex gap-4 relative pe-10">
                      <select value={link.platform} onChange={e => updateArrayItem(setSocialLinks, socialLinks, index, "platform", e.target.value)} className="w-40 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm">
                        <option>Instagram</option><option>TikTok</option><option>Facebook</option><option>X / Twitter</option><option>LinkedIn</option>
                      </select>
                      <input type="text" placeholder="Profile URL" value={link.url} onChange={e => updateArrayItem(setSocialLinks, socialLinks, index, "url", e.target.value)} className="flex-1 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      <button type="button" onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== index))} className="absolute top-1.5 end-0 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Previews */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black">Social Previews</h2>
                  <Button type="button" onClick={() => setSocialPreviews([...socialPreviews, { id: Date.now(), platform: "Instagram", url: "", previewUrl: "", fetchSource: "LINK", tagToFetch: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Post
                  </Button>
                </div>
                <div className="space-y-4">
                  {socialPreviews.map((post, index) => (
                    <div key={post.id || index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative flex flex-col gap-4 pe-10">
                      <button type="button" onClick={() => setSocialPreviews(socialPreviews.filter((_, i) => i !== index))} className="absolute top-4 end-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex gap-4">
                        <select value={post.platform} onChange={e => updateArrayItem(setSocialPreviews, socialPreviews, index, "platform", e.target.value)} className="w-32 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm">
                          <option>Instagram</option><option>TikTok</option>
                        </select>
                        <select value={post.fetchSource || "LINK"} onChange={e => updateArrayItem(setSocialPreviews, socialPreviews, index, "fetchSource", e.target.value)} className="w-40 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm">
                          <option value="LINK">Fetch by Link</option>
                          <option value="TAG">Fetch by Tag</option>
                        </select>
                        {post.fetchSource === "TAG" ? (
                          <input type="text" placeholder="#TagToFetch" value={post.tagToFetch} onChange={e => updateArrayItem(setSocialPreviews, socialPreviews, index, "tagToFetch", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        ) : (
                          <input type="text" placeholder="Post URL" value={post.url} onChange={e => updateArrayItem(setSocialPreviews, socialPreviews, index, "url", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        )}
                      </div>
                      <div className="w-full">
                        <MediaUploader value={post.previewUrl} onChange={val => updateArrayItem(setSocialPreviews, socialPreviews, index, "previewUrl", val)} placeholder="Preview Image/Video URL" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* News & Coverage */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black">News & Coverage</h2>
                  <Button type="button" onClick={() => setNewsCoverage([...newsCoverage, { id: Date.now(), publisher: "", date: "", title: "", url: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Link
                  </Button>
                </div>
                <div className="space-y-4">
                  {newsCoverage.map((news, index) => (
                    <div key={news.id || index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative grid grid-cols-2 gap-4 pe-10">
                      <button type="button" onClick={() => setNewsCoverage(newsCoverage.filter((_, i) => i !== index))} className="absolute top-4 end-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <input type="text" placeholder="Publisher (e.g. Forbes)" value={news.publisher} onChange={e => updateArrayItem(setNewsCoverage, newsCoverage, index, "publisher", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      <input type="date" placeholder="Date" value={news.date} onChange={e => updateArrayItem(setNewsCoverage, newsCoverage, index, "date", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      <input type="text" placeholder="Article Title" value={news.title} onChange={e => updateArrayItem(setNewsCoverage, newsCoverage, index, "title", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      <input type="text" placeholder="Article URL" value={news.url} onChange={e => updateArrayItem(setNewsCoverage, newsCoverage, index, "url", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* What People Say (Testimonials) */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black">What People Say (Feedback)</h2>
                  <Button type="button" onClick={() => setTestimonials([...testimonials, { id: Date.now(), author: "", quote: "", mediaUrl: "", rating: 5, link: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Feedback
                  </Button>
                </div>
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={testimonial.id || index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative flex flex-col gap-4 pe-10">
                      <button type="button" onClick={() => setTestimonials(testimonials.filter((_, i) => i !== index))} className="absolute top-4 end-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Author / Name" value={testimonial.author} onChange={e => updateArrayItem(setTestimonials, testimonials, index, "author", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Rating:</span>
                          <input type="number" min="1" max="5" value={testimonial.rating} onChange={e => updateArrayItem(setTestimonials, testimonials, index, "rating", parseInt(e.target.value) || 5)} className="w-20 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        </div>
                      </div>
                      
                      <textarea placeholder="Quote / Feedback" value={testimonial.quote} onChange={e => updateArrayItem(setTestimonials, testimonials, index, "quote", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm min-h-[80px]" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Source Link (Optional)" value={testimonial.link} onChange={e => updateArrayItem(setTestimonials, testimonials, index, "link", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                        <MediaUploader value={testimonial.mediaUrl} onChange={val => updateArrayItem(setTestimonials, testimonials, index, "mediaUrl", val)} placeholder="Media URL (Image/Video)" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 7. LOCATIONS & OPS */}
          {activeTab === "ops" && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black">Locations & Operations</h2>
                <Button type="button" onClick={() => setLocations([...locations, { id: Date.now().toString(), nameEn: "New Location", nameAr: "", isPrimary: false, isPublished: true }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Add Location
                </Button>
              </div>

              <div className="space-y-4">
                {locations.map((loc, index) => (
                  <div key={loc.id || index} className="p-5 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative">
                    <button type="button" onClick={() => setLocations(locations.filter((_, i) => i !== index))} className="absolute top-4 end-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pe-10">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Location Name (EN)</label>
                        <input type="text" value={loc.nameEn || ''} onChange={e => updateArrayItem(setLocations, locations, index, "nameEn", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Location Name (AR)</label>
                        <input type="text" dir="rtl" value={loc.nameAr || ''} onChange={e => updateArrayItem(setLocations, locations, index, "nameAr", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-right" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Venue Context (EN)</label>
                        <input type="text" value={loc.venueEn || ''} onChange={e => updateArrayItem(setLocations, locations, index, "venueEn", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Ticketing URL</label>
                        <input type="text" value={loc.ticketingUrl || ''} onChange={e => updateArrayItem(setLocations, locations, index, "ticketingUrl", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="space-y-2 md:col-span-2 flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={loc.isPrimary} onChange={e => updateArrayItem(setLocations, locations, index, "isPrimary", e.target.checked)} className="rounded" />
                          <span className="text-sm font-bold">Primary Location</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={loc.isPublished} onChange={e => updateArrayItem(setLocations, locations, index, "isPublished", e.target.checked)} className="rounded" />
                          <span className="text-sm font-bold">Published</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                {locations.length === 0 && <div className="text-center py-12 border-2 border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-tertiary)] font-medium">No locations defined.</div>}
              </div>
            </div>
          )}

          {/* 7.5 BRANDS & PORTFOLIO */}
          {activeTab === "brands" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-[var(--text-primary)]">Brands & Portfolio</h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Connect this attraction to canonical Brands/IP.</p>
                </div>
                <Button type="button" onClick={() => setBrandPlacements([...brandPlacements, { id: Date.now().toString(), brandId: "", role: "HOSTED_EXPERIENCE", isVisible: true }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Link Brand
                </Button>
              </div>

              <div className="space-y-4">
                {brandPlacements.map((placement, index) => (
                  <div key={placement.id || index} className="p-5 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative flex gap-4 pe-10">
                    <button type="button" onClick={() => setBrandPlacements(brandPlacements.filter((_, i) => i !== index))} className="absolute top-4 end-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-1/2 space-y-2">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Brand ID (Slug or ID)</label>
                      <input type="text" value={placement.brandId} onChange={e => updateArrayItem(setBrandPlacements, brandPlacements, index, "brandId", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="w-1/2 space-y-2">
                      <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Role</label>
                      <select value={placement.role} onChange={e => updateArrayItem(setBrandPlacements, brandPlacements, index, "role", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm">
                        <option value="PRIMARY_BRAND">Primary Brand</option>
                        <option value="SUB_BRAND">Sub-Brand</option>
                        <option value="HOSTED_EXPERIENCE">Hosted Experience</option>
                        <option value="FB_CONCEPT">F&B Concept</option>
                        <option value="RETAIL_CONCEPT">Retail Concept</option>
                      </select>
                    </div>
                  </div>
                ))}
                {brandPlacements.length === 0 && <div className="text-center py-12 border-2 border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-tertiary)] font-medium">No brands linked.</div>}
              </div>
            </div>
          )}

          {/* 10. VISIBILITY & TIMING TAB */}
          {activeTab === "visibility" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Header & Live Qatar Status Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--surface-subtle)] p-6 rounded-2xl border border-[var(--border-default)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Clock className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-black text-[var(--text-primary)]">Visibility, Timings & Dates</h2>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Configure attraction lifecycle dates, weekly opening hours, weekend shifts, and Qatar real-time schedule rules.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-default)] text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[var(--text-secondary)] font-bold">QATAR TIME (GMT+3)</span>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {temporalStatus.statusOverride
                        ? `OVERRIDE: ${temporalStatus.statusOverride}`
                        : temporalStatus.isPermanent
                        ? "PERMANENT VENUE"
                        : temporalStatus.isComingSoon
                        ? "COMING SOON"
                        : "SEASONAL RUN"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. ATTRACTION LIFECYCLE & CALENDAR DATES */}
              <div className="bg-[var(--surface-default)] p-6 md:p-8 rounded-2xl border border-[var(--border-default)] space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
                  <div className="flex items-center gap-2">
                    <CalendarRange className="w-5 h-5 text-[var(--color-primary)]" />
                    <h3 className="text-base font-black text-[var(--text-primary)]">1. Attraction Lifecycle & Calendar Dates</h3>
                  </div>
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Run & Season Window</span>
                </div>

                {/* Primary Mode Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    temporalStatus.isPermanent 
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold" 
                      : "bg-[var(--surface-subtle)] border-[var(--border-default)] text-[var(--text-secondary)]"
                  )}>
                    <input 
                      type="checkbox" 
                      checked={temporalStatus.isPermanent} 
                      onChange={e => setTemporalStatus({...temporalStatus, isPermanent: e.target.checked})} 
                      className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" 
                    />
                    <div>
                      <div className="text-sm font-bold">Permanent Attraction</div>
                      <div className="text-[11px] opacity-75">Open year-round with regular schedule</div>
                    </div>
                  </label>

                  <label className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    temporalStatus.isSpecialEvent 
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold" 
                      : "bg-[var(--surface-subtle)] border-[var(--border-default)] text-[var(--text-secondary)]"
                  )}>
                    <input 
                      type="checkbox" 
                      checked={temporalStatus.isSpecialEvent} 
                      onChange={e => setTemporalStatus({...temporalStatus, isSpecialEvent: e.target.checked})} 
                      className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500" 
                    />
                    <div>
                      <div className="text-sm font-bold">★ Special Event / Activation</div>
                      <div className="text-[11px] opacity-75">Highlighted with gold event badge</div>
                    </div>
                  </label>

                  <label className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    temporalStatus.isComingSoon 
                      ? "bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400 font-bold" 
                      : "bg-[var(--surface-subtle)] border-[var(--border-default)] text-[var(--text-secondary)]"
                  )}>
                    <input 
                      type="checkbox" 
                      checked={temporalStatus.isComingSoon} 
                      onChange={e => setTemporalStatus({...temporalStatus, isComingSoon: e.target.checked})} 
                      className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500" 
                    />
                    <div>
                      <div className="text-sm font-bold">Coming Soon / Pre-Launch</div>
                      <div className="text-[11px] opacity-75">Show teaser and countdown banner</div>
                    </div>
                  </label>
                </div>

                {/* Date Ranges (Shown if not permanent or when custom seasonal dates are configured) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
                      <span>Season / Event Start Date</span>
                      <span className="text-[10px] text-emerald-500 font-bold">Opens</span>
                    </label>
                    <input 
                      type="datetime-local" 
                      value={temporalStatus.startDate ? String(temporalStatus.startDate).substring(0, 16) : ""} 
                      onChange={e => setTemporalStatus({...temporalStatus, startDate: e.target.value})} 
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
                      <span>Season / Event End Date</span>
                      <span className="text-[10px] text-red-500 font-bold">Closes</span>
                    </label>
                    <input 
                      type="datetime-local" 
                      value={temporalStatus.endDate ? String(temporalStatus.endDate).substring(0, 16) : ""} 
                      onChange={e => setTemporalStatus({...temporalStatus, endDate: e.target.value})} 
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
                      <span>Ticket Booking Launch Date</span>
                      <span className="text-[10px] text-amber-500 font-bold">Pre-Sale</span>
                    </label>
                    <input 
                      type="datetime-local" 
                      value={temporalStatus.bookingStartDate ? String(temporalStatus.bookingStartDate).substring(0, 16) : ""} 
                      onChange={e => setTemporalStatus({...temporalStatus, bookingStartDate: e.target.value})} 
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" 
                    />
                  </div>
                </div>

                {/* Quick Date Range Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--border-default)]">
                  <span className="text-xs font-bold text-[var(--text-secondary)] me-2">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => setTemporalStatus({ ...temporalStatus, isPermanent: true, startDate: "", endDate: "" })}
                    className="px-3 py-1 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-medium text-[var(--text-primary)] transition-colors"
                  >
                    Annual All-Year
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date()
                      const start = new Date(now.getFullYear(), now.getMonth(), 1, 10, 0)
                      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59)
                      setTemporalStatus({
                        ...temporalStatus,
                        isPermanent: false,
                        startDate: start.toISOString().substring(0, 16),
                        endDate: end.toISOString().substring(0, 16)
                      })
                    }}
                    className="px-3 py-1 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-medium text-[var(--text-primary)] transition-colors"
                  >
                    Current Month
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const year = new Date().getFullYear()
                      setTemporalStatus({
                        ...temporalStatus,
                        isPermanent: false,
                        isSpecialEvent: true,
                        startDate: `${year}-12-01T10:00`,
                        endDate: `${year}-12-20T23:59`
                      })
                    }}
                    className="px-3 py-1 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-medium text-[var(--text-primary)] transition-colors"
                  >
                    Qatar National Day Season (Dec 1–20)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const year = new Date().getFullYear()
                      setTemporalStatus({
                        ...temporalStatus,
                        isPermanent: false,
                        startDate: `${year}-11-15T10:00`,
                        endDate: `${year + 1}-03-01T23:59`
                      })
                    }}
                    className="px-3 py-1 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border-default)] text-xs font-medium text-[var(--text-primary)] transition-colors"
                  >
                    Winter Peak Season (Nov 15 – Mar 1)
                  </button>
                </div>

                {/* Admin Status Override */}
                <div className="space-y-2 pt-2 border-t border-[var(--border-default)]">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
                    <span>Admin Status Override</span>
                    <span className="text-[11px] text-[var(--text-secondary)]">Force attraction status regardless of dates</span>
                  </label>
                  <select 
                    value={temporalStatus.statusOverride || ""} 
                    onChange={e => setTemporalStatus({...temporalStatus, statusOverride: e.target.value})} 
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none font-medium"
                  >
                    <option value="">None (Auto-Calculate based on Qatar local time & dates)</option>
                    <option value="FORCE_ACTIVE">🟢 FORCE ACTIVE (Always show as Open & Bookable)</option>
                    <option value="FORCE_INCOMING">🟡 FORCE INCOMING (Show as Coming Soon / Booking Open)</option>
                    <option value="FORCE_PAST">⚪ FORCE PAST (Show as Past Event / Archived)</option>
                    <option value="FORCE_CLOSED">🔴 FORCE CLOSED (Show as Temporarily Closed / Maintenance)</option>
                  </select>
                </div>
              </div>

              {/* 2. DAILY OPERATING HOURS & WEEKLY SCHEDULE */}
              <div className="bg-[var(--surface-default)] p-6 md:p-8 rounded-2xl border border-[var(--border-default)] space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-base font-black text-[var(--text-primary)]">2. Daily Operating Hours & Weekly Schedule</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 uppercase">Standard Timings</span>
                </div>

                {/* Core Daily Timing Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Standard Opening Time</span>
                    </label>
                    <input 
                      type="time" 
                      value={temporalStatus.openTime || "10:00"} 
                      onChange={e => setTemporalStatus({...temporalStatus, openTime: e.target.value})} 
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm font-mono focus:border-[var(--color-primary)] focus:outline-none" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Standard Closing Time</span>
                    </label>
                    <input 
                      type="time" 
                      value={temporalStatus.closeTime || "22:00"} 
                      onChange={e => setTemporalStatus({...temporalStatus, closeTime: e.target.value})} 
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm font-mono focus:border-[var(--color-primary)] focus:outline-none" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Last Entry / Gate Cutoff</span>
                    </label>
                    <input 
                      type="time" 
                      value={temporalStatus.lastEntryTime || "21:15"} 
                      onChange={e => setTemporalStatus({...temporalStatus, lastEntryTime: e.target.value})} 
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm font-mono focus:border-[var(--color-primary)] focus:outline-none" 
                    />
                  </div>
                </div>

                {/* 7 Days of the Week Selector */}
                <div className="space-y-3 pt-2 border-t border-[var(--border-default)]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Weekly Operating Days ({temporalStatus.daysOfWeek?.length || 0}/7 Days Active)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTemporalStatus({ ...temporalStatus, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] })}
                        className="text-[11px] font-bold text-emerald-500 hover:underline cursor-pointer"
                      >
                        All 7 Days
                      </button>
                      <span className="text-[var(--border-default)]">|</span>
                      <button
                        type="button"
                        onClick={() => setTemporalStatus({ ...temporalStatus, daysOfWeek: [0, 1, 2, 3, 4] })}
                        className="text-[11px] font-bold text-blue-500 hover:underline cursor-pointer"
                      >
                        Sun–Thu (Weekdays)
                      </button>
                      <span className="text-[var(--border-default)]">|</span>
                      <button
                        type="button"
                        onClick={() => setTemporalStatus({ ...temporalStatus, daysOfWeek: [4, 5, 6] })}
                        className="text-[11px] font-bold text-amber-500 hover:underline cursor-pointer"
                      >
                        Thu–Sat (Weekends)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {[
                      { index: 0, labelEn: "Sunday", labelAr: "الأحد", shortEn: "Sun" },
                      { index: 1, labelEn: "Monday", labelAr: "الإثنين", shortEn: "Mon" },
                      { index: 2, labelEn: "Tuesday", labelAr: "الثلاثاء", shortEn: "Tue" },
                      { index: 3, labelEn: "Wednesday", labelAr: "الأربعاء", shortEn: "Wed" },
                      { index: 4, labelEn: "Thursday", labelAr: "الخميس", shortEn: "Thu" },
                      { index: 5, labelEn: "Friday", labelAr: "الجمعة", shortEn: "Fri" },
                      { index: 6, labelEn: "Saturday", labelAr: "السبت", shortEn: "Sat" },
                    ].map(day => {
                      const isActive = (temporalStatus.daysOfWeek || []).includes(day.index)
                      return (
                        <button
                          key={day.index}
                          type="button"
                          onClick={() => toggleDayOfWeek(day.index)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer",
                            isActive
                              ? "bg-emerald-500 text-slate-950 border-emerald-500 font-black shadow-sm"
                              : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--surface-hover)] opacity-60"
                          )}
                        >
                          <span className="text-xs uppercase tracking-wider">{day.shortEn}</span>
                          <span className="text-[10px] mt-0.5 opacity-90">{day.labelAr}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Formatted Bilingual Operating Hours Display */}
                <div className="space-y-4 pt-2 border-t border-[var(--border-default)]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                      Formatted Schedule Description (Shown to Visitors)
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateOperatingHours}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Generate from Timings</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">English Schedule Text</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Sun – Wed: 10:00 AM – 10:00 PM | Thu – Sat: 10:00 AM – 12:00 AM" 
                        value={temporalStatus.operatingHoursEn || ""} 
                        onChange={e => setTemporalStatus({...temporalStatus, operatingHoursEn: e.target.value})} 
                        className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase text-right block">النص باللغة العربية</label>
                      <input 
                        type="text" 
                        dir="rtl"
                        placeholder="مثال: الأحد – الأربعاء: ١٠:٠٠ ص – ١٠:٠٠ م | الخميس – السبت: ١٠:٠٠ ص – ١٢:٠٠ منتصف الليل" 
                        value={temporalStatus.operatingHoursAr || ""} 
                        onChange={e => setTemporalStatus({...temporalStatus, operatingHoursAr: e.target.value})} 
                        className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. WEEKEND & SHIFT OVERRIDES */}
              <div className="bg-[var(--surface-default)] p-6 md:p-8 rounded-2xl border border-[var(--border-default)] space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-black text-[var(--text-primary)]">3. Weekend Shifts & Friday Prayer Schedule</h3>
                  </div>
                  <span className="text-xs font-bold text-amber-500 uppercase">Extended Shifts</span>
                </div>

                {/* Weekend Shift Toggle */}
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={temporalStatus.hasWeekendHours} 
                      onChange={e => setTemporalStatus({...temporalStatus, hasWeekendHours: e.target.checked})} 
                      className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500" 
                    />
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      Enable Separate Weekend / Peak Operating Hours
                    </span>
                  </label>

                  {temporalStatus.hasWeekendHours && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] animate-in fade-in duration-200">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Weekend Opening Time</label>
                        <input 
                          type="time" 
                          value={temporalStatus.weekendOpenTime || "10:00"} 
                          onChange={e => setTemporalStatus({...temporalStatus, weekendOpenTime: e.target.value})} 
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[var(--color-primary)] focus:outline-none" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Weekend Closing Time</label>
                        <input 
                          type="time" 
                          value={temporalStatus.weekendCloseTime || "00:00"} 
                          onChange={e => setTemporalStatus({...temporalStatus, weekendCloseTime: e.target.value})} 
                          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[var(--color-primary)] focus:outline-none" 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Weekend Days</label>
                        <div className="flex items-center gap-2 pt-1">
                          {[
                            { index: 4, short: "Thu" },
                            { index: 5, short: "Fri" },
                            { index: 6, short: "Sat" }
                          ].map(d => {
                            const isWk = (temporalStatus.weekendDays || []).includes(d.index)
                            return (
                              <button
                                key={d.index}
                                type="button"
                                onClick={() => toggleWeekendDay(d.index)}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer",
                                  isWk 
                                    ? "bg-amber-500 text-slate-950 border-amber-500" 
                                    : "bg-[var(--surface-default)] text-[var(--text-secondary)] border-[var(--border-default)]"
                                )}
                              >
                                {d.short}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Friday Prayer Break */}
                <div className="space-y-4 pt-2 border-t border-[var(--border-default)]">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={temporalStatus.hasFridayBreak} 
                      onChange={e => setTemporalStatus({...temporalStatus, hasFridayBreak: e.target.checked})} 
                      className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500" 
                    />
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      Friday Midday Prayer Pause (Re-opens after Jummah Prayer)
                    </span>
                  </label>

                  {temporalStatus.hasFridayBreak && (
                    <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-2 max-w-sm animate-in fade-in duration-200">
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Friday Re-Opening Time</label>
                      <input 
                        type="time" 
                        value={temporalStatus.fridayOpenTime || "13:30"} 
                        onChange={e => setTemporalStatus({...temporalStatus, fridayOpenTime: e.target.value})} 
                        className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm font-mono focus:border-[var(--color-primary)] focus:outline-none" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 4. SEASONAL NOTES & HOLIDAY EXCEPTION RULES */}
              <div className="bg-[var(--surface-default)] p-6 md:p-8 rounded-2xl border border-[var(--border-default)] space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-base font-black text-[var(--text-primary)]">4. Seasonal Notes & Holiday Exception Rules</h3>
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleAddTemporalRule}
                    variant="outline" 
                    size="sm" 
                    className="gap-2 rounded-xl"
                  >
                    <Plus className="w-4 h-4" /> Add Exception Rule
                  </Button>
                </div>

                {/* Seasonal Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Seasonal & Special Notice (EN)</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g. Ramadan Schedule: 8:00 PM – 2:00 AM daily. Prior booking is mandatory." 
                      value={temporalStatus.seasonalNotesEn || ""} 
                      onChange={e => setTemporalStatus({...temporalStatus, seasonalNotesEn: e.target.value})} 
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase text-right block">ملاحظات الموسم والعطلات (AR)</label>
                    <textarea 
                      rows={2}
                      dir="rtl"
                      placeholder="مثال: أوقات شهر رمضان المبارك: ٨:٠٠ م – ٢:٠٠ ص يومياً. الحجز المسبق إلزامي." 
                      value={temporalStatus.seasonalNotesAr || ""} 
                      onChange={e => setTemporalStatus({...temporalStatus, seasonalNotesAr: e.target.value})} 
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:outline-none text-right" 
                    />
                  </div>
                </div>

                {/* Exception Rules List */}
                <div className="space-y-4 pt-2 border-t border-[var(--border-default)]">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Custom Date Rules & Closures ({(temporalStatus.temporalRules || []).length} Rules Configured)
                  </label>

                  {(!temporalStatus.temporalRules || temporalStatus.temporalRules.length === 0) ? (
                    <div className="p-6 rounded-xl border border-dashed border-[var(--border-default)] text-center text-[var(--text-secondary)] text-sm">
                      No custom holiday or closure rules defined. Click <strong>Add Exception Rule</strong> above to add National Day, Eid, or Maintenance timings.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {temporalStatus.temporalRules.map((rule: any, rIdx: number) => (
                        <div key={rule.id || rIdx} className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-default)] space-y-4 relative group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-[var(--surface-default)] border border-[var(--border-default)] flex items-center justify-center text-xs font-bold">
                                {rIdx + 1}
                              </span>
                              <span className="text-xs font-black uppercase text-[var(--text-primary)]">
                                {rule.nameEn || `Exception Rule #${rIdx + 1}`}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveTemporalRule(rIdx)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete rule"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Rule Type</label>
                              <select 
                                value={rule.ruleType || "OVERRIDE"} 
                                onChange={e => handleUpdateTemporalRule(rIdx, "ruleType", e.target.value)}
                                className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-xs font-bold focus:border-[var(--color-primary)] focus:outline-none"
                              >
                                <option value="OVERRIDE">OVERRIDE (Special Hours)</option>
                                <option value="CLOSURE">CLOSURE (Full Day Closed)</option>
                                <option value="SEASONAL">SEASONAL (Special Shift)</option>
                                <option value="RECURRING">RECURRING</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Rule Name (EN)</label>
                              <input 
                                type="text"
                                placeholder="e.g. National Day Extended"
                                value={rule.nameEn || ""}
                                onChange={e => handleUpdateTemporalRule(rIdx, "nameEn", e.target.value)}
                                className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Start Date & Time</label>
                              <input 
                                type="datetime-local"
                                value={rule.startDate ? String(rule.startDate).substring(0, 16) : ""}
                                onChange={e => handleUpdateTemporalRule(rIdx, "startDate", e.target.value)}
                                className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-xs font-mono focus:border-[var(--color-primary)] focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">End Date & Time</label>
                              <input 
                                type="datetime-local"
                                value={rule.endDate ? String(rule.endDate).substring(0, 16) : ""}
                                onChange={e => handleUpdateTemporalRule(rIdx, "endDate", e.target.value)}
                                className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-xs font-mono focus:border-[var(--color-primary)] focus:outline-none"
                              />
                            </div>
                          </div>

                          {rule.ruleType !== "CLOSURE" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Special Open Time</label>
                                <input 
                                  type="time"
                                  value={rule.openTime || "10:00"}
                                  onChange={e => handleUpdateTemporalRule(rIdx, "openTime", e.target.value)}
                                  className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-xs font-mono focus:border-[var(--color-primary)] focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Special Close Time</label>
                                <input 
                                  type="time"
                                  value={rule.closeTime || "23:00"}
                                  onChange={e => handleUpdateTemporalRule(rIdx, "closeTime", e.target.value)}
                                  className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-xs font-mono focus:border-[var(--color-primary)] focus:outline-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* 8. FAQs TAB */}
          {activeTab === "faqs" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black">Frequently Asked Questions</h2>
                <Button type="button" onClick={() => setFaqs([...faqs, { id: Date.now().toString(), questionEn: "", questionAr: "", answerEn: "", answerAr: "" }])} variant="outline" size="sm" className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Add FAQ
                </Button>
              </div>

              {faqs.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-tertiary)] font-medium">
                  No FAQs added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={faq.id || index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] space-y-4 relative">
                      <button type="button" onClick={() => setFaqs(faqs.filter((_, i) => i !== index))} className="absolute top-4 end-4 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3 pe-8 md:pe-0">
                          <input type="text" placeholder="Question (EN)" value={faq.questionEn} onChange={e => updateArrayItem(setFaqs, faqs, index, "questionEn", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm font-bold" />
                          <textarea placeholder="Answer (EN)" value={faq.answerEn} rows={3} onChange={e => updateArrayItem(setFaqs, faqs, index, "answerEn", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm resize-none" />
                        </div>
                        <div className="space-y-3">
                          <input type="text" placeholder="السؤال (AR)" dir="rtl" value={faq.questionAr} onChange={e => updateArrayItem(setFaqs, faqs, index, "questionAr", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm font-bold font-arabic text-right" />
                          <textarea placeholder="الجواب (AR)" dir="rtl" value={faq.answerAr} rows={3} onChange={e => updateArrayItem(setFaqs, faqs, index, "answerAr", e.target.value)} className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm resize-none font-arabic text-right" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 9. GALLERY */}
          {activeTab === "gallery" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Media Gallery</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Upload images and videos for the attraction&apos;s lightbox gallery. Supports .jpg, .png, .mp4, .mov, etc.
                  </p>
                </div>
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      accept="image/*,video/*"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        
                        setIsSaving(true);
                        try {
                          const newItems: any[] = [];
                          for (let i = 0; i < files.length; i++) {
                            const res = await uploadFile(files[i]);
                            newItems.push({ url: res.url, captionEn: "", captionAr: "" });
                          }
                          setGallery(prev => [...prev, ...newItems]);
                        } catch (error) {
                          console.error("Bulk upload error:", error);
                          alert("Failed to upload some files.");
                        } finally {
                          setIsSaving(false);
                          e.target.value = "";
                        }
                      }}
                    />
                    <div className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                      <ImageIcon className="w-4 h-4" /> Bulk Upload
                    </div>
                  </label>
                  <Button 
                    onClick={() => setGallery([...gallery, { url: "", captionEn: "", captionAr: "" }])}
                    className="gap-2 rounded-xl"
                  >
                    <Plus className="w-4 h-4" /> Add Media
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {gallery.map((item, index) => (
                  <div key={index} className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--surface-subtle)] relative group">
                    <button
                      onClick={() => setGallery(gallery.filter((_, i) => i !== index))}
                      className="absolute top-4 end-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-4">
                        <label className="block text-sm font-semibold mb-2">Media File/URL</label>
                        <MediaUploader
                          value={item.url}
                          onChange={(url) => updateArrayItem(setGallery, gallery, index, "url", url)}
                        />
                      </div>
                      <div className="md:col-span-8 space-y-4 pt-2">
                        <div>
                          <label className="block text-sm font-semibold mb-1">Caption (English)</label>
                          <input
                            type="text"
                            value={item.captionEn || ""}
                            onChange={(e) => updateArrayItem(setGallery, gallery, index, "captionEn", e.target.value)}
                            className="w-full px-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none"
                            placeholder="e.g. Inside the trampoline park"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1">Caption (Arabic)</label>
                          <input
                            type="text"
                            value={item.captionAr || ""}
                            onChange={(e) => updateArrayItem(setGallery, gallery, index, "captionAr", e.target.value)}
                            className="w-full px-4 py-2 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-right"
                            dir="rtl"
                            placeholder="وصف الصورة"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {gallery.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-secondary)]">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No gallery items yet</p>
                    <p className="text-sm mt-1">Click &quot;Add Media&quot; to upload images or videos</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SEO */}
          {activeTab === "seo" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <AdminSeoCustomizer seo={seo} setSeo={setSeo} formData={null} setFormData={() => {}} />
            </div>
          )}

        </div>
      </div>

      {/* QUICK CREATE STORY TYPE MODAL */}
      {showQuickStoryTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Quick Create Story Type</h3>
              <button
                type="button"
                onClick={() => setShowQuickStoryTypeModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Title (English) *</label>
                <input
                  type="text"
                  value={newStoryTitleEn}
                  onChange={e => setNewStoryTitleEn(e.target.value)}
                  placeholder="e.g. Drive, Bounce, Compete"
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Title (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={newStoryTitleAr}
                  onChange={e => setNewStoryTitleAr(e.target.value)}
                  placeholder="مثال: القيادة، القفز والمرح"
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none text-right"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newStoryAccentColor}
                    onChange={e => setNewStoryAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-[var(--border-default)] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newStoryAccentColor}
                    onChange={e => setNewStoryAccentColor(e.target.value)}
                    className="bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-default)]">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowQuickStoryTypeModal(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" disabled={!newStoryTitleEn.trim() || isCreatingStoryType} onClick={handleQuickCreateStoryType}>
                {isCreatingStoryType ? "Creating..." : "Create & Assign"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK CREATE BRAND MODAL */}
      {showQuickBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--surface-default)] border border-[var(--border-default)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Quick Create Brand / IP</h3>
              <button
                type="button"
                onClick={() => setShowQuickBrandModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Brand Name (English) *</label>
                <input
                  type="text"
                  value={newBrandNameEn}
                  onChange={e => setNewBrandNameEn(e.target.value)}
                  placeholder="e.g. InflataRUN, Space Tribe"
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Brand Name (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={newBrandNameAr}
                  onChange={e => setNewBrandNameAr(e.target.value)}
                  placeholder="اسم العلامة التجارية بالعربية"
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none text-right"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Brand Type</label>
                <select
                  value={newBrandType}
                  onChange={e => setNewBrandType(e.target.value)}
                  className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none cursor-pointer"
                >
                  <option value="OWNED">E3 Owned Brand / IP</option>
                  <option value="HOSTED">Hosted Attraction Concept</option>
                  <option value="FNB">Food & Beverage Brand</option>
                  <option value="SEASONAL">Seasonal Brand</option>
                  <option value="DIGITAL">Digital Platform</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Brand Logo (Local Upload)</label>
                <MediaUploader
                  value={newBrandLogoUrl}
                  onChange={setNewBrandLogoUrl}
                  accept="image/*"
                  placeholder="Upload Brand Logo from local disk"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-default)]">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowQuickBrandModal(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" disabled={!newBrandNameEn.trim() || isCreatingBrand} onClick={handleQuickCreateBrand}>
                {isCreatingBrand ? "Creating..." : "Create & Link Brand"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Live Attraction Microsite Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#080314] border border-purple-900/60 rounded-3xl w-full max-w-6xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    Microsite Live Preview: {nameEn || "Attraction"}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Previewing live routing: /en/b2c/attractions/{slug || initialData?.slug || 'preview'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`/en/b2c/attractions/${slug || initialData?.slug || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold uppercase tracking-wider hover:bg-emerald-500/30 transition-all shadow-md"
                >
                  <span>Open Full Window</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Live iFrame Preview Window */}
            <div className="flex-1 bg-black overflow-hidden relative">
              <iframe
                src={`/en/b2c/attractions/${slug || initialData?.slug || ''}`}
                className="w-full h-full border-0"
                title="Attraction Microsite Preview"
              />
            </div>
          </div>
        </div>
      )}
      {/* Master Workbook Import & Validation Modal */}
      <AttractionMasterWorkbookModal
        isOpen={showMasterWorkbookModal}
        onClose={() => setShowMasterWorkbookModal(false)}
        attractionSlug={slug || initialData?.slug}
        attractionName={nameEn}
        onImportComplete={() => {
          router.refresh()
        }}
      />
    </DashboardPageShell>
  )
}
