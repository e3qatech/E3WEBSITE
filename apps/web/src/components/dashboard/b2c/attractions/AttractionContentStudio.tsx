"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
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
  ChevronLeft,
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
  Wand2,
  Briefcase,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
  Minimize2,
  Tag,
  Trophy,
  Users,
  Activity,
  Compass,
  Flame,
  Search,
  Filter,
  Check,
  AlertTriangle,
  Upload
} from "lucide-react"

import { Button } from "@/components/ui/Button"
import { MediaUploader } from "@/components/ui/MediaUploader"
import { cn } from "@/lib/utils"
import {
  DashboardPageShell,
  EditorHeader
} from "@/components/dashboard/ui"
import { CompactActivityCard, ActivityItem } from "./CompactActivityCard"
import { CompactRepeaterList } from "./CompactRepeaterList"
import { LocationSelectorModal } from "./LocationSelectorModal"
import { CaseStudiesAttractionPanel } from "./CaseStudiesAttractionPanel"
import { ContentIntakeHub } from "./ContentIntakeHub"

export type StudioStage = 'identity' | 'experiences' | 'visit' | 'media' | 'review'

const STUDIO_STAGES: Array<{ id: StudioStage; labelEn: string; labelAr: string; icon: any; description: string }> = [
  { id: 'identity', labelEn: '1. Identity & Classification', labelAr: '١. الهوية والتصنيف', icon: Layers, description: 'Core names, entity type, format, access & hero media' },
  { id: 'experiences', labelEn: '2. What\'s Inside', labelAr: '٢. التجارب والأنشطة', icon: Sparkles, description: 'Activities, primary & secondary story tracks, intensity' },
  { id: 'visit', labelEn: '3. Visit & Booking', labelAr: '٣. المواقع والأسعار', icon: MapPin, description: 'Canonical Qatar venues, operating timetable & ticket tiers' },
  { id: 'media', labelEn: '4. Media, Case Studies & Trust', labelAr: '٤. الوسائط ودراسات الحالة', icon: ImageIcon, description: 'Gallery, linked B2B case studies, partners & FAQs' },
  { id: 'review', labelEn: '5. Review & Publish', labelAr: '٥. المراجعة والنشر', icon: FileCheck, description: 'SEO metadata, translation health & live publishing' },
]

export const ENTITY_TYPES = [
  { value: "ATTRACTION", labelEn: "Attraction (Permanent Destination)", labelAr: "وجهة ترفيهية دائمة" },
  { value: "EVENT", labelEn: "Event (Time-Bounded)", labelAr: "فعالية محددة المدة" },
  { value: "ACTIVATION", labelEn: "Activation (Brand / Pop-up)", labelAr: "تفعيل ترويجي / مؤقت" },
  { value: "PROGRAMME", labelEn: "Programme (Curated Series)", labelAr: "برنامج ترفيهي منظم" },
  { value: "VENUE", labelEn: "Venue / Arena", labelAr: "موقع أو ساحة فعاليات" },
]

export const EXPERIENCE_FORMATS = [
  { value: "PERMANENT_FEC", labelEn: "Permanent FEC / Entertainment Centre", labelAr: "مركز ترفيهي عائلي دائم" },
  { value: "MALL_ANCHOR", labelEn: "Mall Anchor Attraction", labelAr: "وجهة رئيسية في مجمع تجاري" },
  { value: "SEASONAL_EVENT", labelEn: "Seasonal Event", labelAr: "فعالية موسمية" },
  { value: "TOURING_POPUP", labelEn: "Touring Pop-Up", labelAr: "معرض متنقل / بوپ-أب" },
  { value: "SPORTS_ACTIVATION", labelEn: "Sports Activation", labelAr: "تفعيل رياضي وتحدي" },
  { value: "FESTIVAL", labelEn: "Festival / Carnival", labelAr: "مهرجان أو كرنفال" },
  { value: "WORKSHOP_EDU", labelEn: "Workshop / Educational Experience", labelAr: "ورشة عمل / تجربة تعليمية" },
  { value: "CORPORATE_PRIVATE", labelEn: "Corporate / Private Event", labelAr: "فعالية شركات أو خاصة" },
  { value: "COMMUNITY_PUBLIC", labelEn: "Community / Public Event", labelAr: "فعالية مجتمعية عامة" },
  { value: "EXHIBITION_ZONE", labelEn: "Exhibition / Experience Zone", labelAr: "معرض / منطقة تجارب" },
  { value: "CUSTOM", labelEn: "Custom Experience", labelAr: "تجربة مخصصة" },
]

export const ACCESS_MODELS = [
  { value: "PAID", labelEn: "Paid Tickets / Passes", labelAr: "تذاكر مدفوعة" },
  { value: "FREE", labelEn: "Free Access", labelAr: "دخول مجاني" },
  { value: "REGISTRATION_REQUIRED", labelEn: "Registration Required", labelAr: "تسجيل مسبق مطلوب" },
  { value: "INVITE_ONLY", labelEn: "Invite Only", labelAr: "دعوات خاصة فقط" },
  { value: "MIXED", labelEn: "Mixed Free & Paid Activities", labelAr: "مزيج من المجاني والمدفوع" },
]

export const DURATION_MODELS = [
  { value: "PERMANENT", labelEn: "Permanent (Year-Round)", labelAr: "دائم طوال العام" },
  { value: "SINGLE_DAY", labelEn: "Single Day", labelAr: "يوم واحد" },
  { value: "MULTI_DAY", labelEn: "Multi-Day Limited", labelAr: "أيام متعددة محدودة" },
  { value: "RECURRING", labelEn: "Recurring (Weekly / Monthly)", labelAr: "دوري (أسبوعي / شهري)" },
  { value: "SEASONAL", labelEn: "Seasonal (Winter / Summer)", labelAr: "موسمي (شتوي / صيفي)" },
]

export const ENVIRONMENT_MODELS = [
  { value: "INDOOR", labelEn: "Indoor (Climate Controlled)", labelAr: "داخلي (مكيف)" },
  { value: "OUTDOOR", labelEn: "Outdoor", labelAr: "في الهواء الطلق" },
  { value: "HYBRID", labelEn: "Hybrid (Indoor & Outdoor)", labelAr: "مزدوج (داخلي وخارجي)" },
]

export function AttractionContentStudio({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const isEditing = Boolean(initialData?.id)

  // Full-Screen Focus Mode & Panel Collapse States
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)
  const [isDiagnosticsCollapsed, setIsDiagnosticsCollapsed] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isMobileDiagnosticsOpen, setIsMobileDiagnosticsOpen] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')

  // Top Level Navigation & Dirty State
  const [activeStage, setActiveStage] = useState<StudioStage>('identity')
  const [bilingualView, setBilingualView] = useState<'BOTH' | 'EN' | 'AR'>('BOTH')
  const [isIntakeOpen, setIsIntakeOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
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
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false)
  const [isB2bVisible, setIsB2bVisible] = useState(initialData?.isB2bVisible !== false)

  // 5-Dimensional Classification Controlled Fields
  const [entityType, setEntityType] = useState(initialData?.entityType || "ATTRACTION")
  const [experienceFormat, setExperienceFormat] = useState(initialData?.experienceFormat || "PERMANENT_FEC")
  const [accessModel, setAccessModel] = useState(initialData?.accessModel || "PAID")
  const [durationModel, setDurationModel] = useState(initialData?.durationModel || "PERMANENT")
  const [environment, setEnvironment] = useState(initialData?.environment || "INDOOR")

  // Conditional Event & Sports Details
  const [eventDetails, setEventDetails] = useState<any>(() => {
    const existing = initialData?.eventDetails || {}
    return {
      startDate: existing.startDate || "",
      endDate: existing.endDate || "",
      sessionTimes: existing.sessionTimes || "",
      dailyCapacity: existing.dailyCapacity || 500,
      organizer: existing.organizer || "E3 Experiences Qatar",
      registrationUrl: existing.registrationUrl || "",
      sportCategory: existing.sportCategory || "Football / Tactical",
      participantRules: existing.participantRules || "",
      ageLimits: existing.ageLimits || "All Ages",
      equipmentRequirements: existing.equipmentRequirements || "Standard sports gear",
      competitionFormat: existing.competitionFormat || "Casual & Tournament"
    }
  })

  // Hero Media & Logos
  const [heroMediaType, setHeroMediaType] = useState(initialData?.heroMediaType || "IMAGE")
  const [heroMediaUrl, setHeroMediaUrl] = useState(initialData?.heroMediaUrl || "")
  const [heroFallbackUrl, setHeroFallbackUrl] = useState(initialData?.heroFallbackUrl || "")
  const [heroThumbnailUrl, setHeroThumbnailUrl] = useState(initialData?.heroThumbnailUrl || "")
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "")

  // Advanced WebGL & Motion Presets
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
        primaryStoryTypeId: f.primaryStoryTypeId || f.storyTypes?.[0]?.id,
        secondaryStoryTypeIds: Array.isArray(f.secondaryStoryTypeIds) ? f.secondaryStoryTypeIds : (f.storyTypes?.slice(1).map((st: any) => st.id) || []),
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

  // Track user edits to set isDirty
  const markDirty = useCallback(() => {
    setIsDirty(true)
  }, [])

  // Escape key handler for Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFocusMode) {
        setIsFocusMode(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFocusMode])

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

  // Translation Health Audit Calculator
  const translationAudit = useMemo(() => {
    const untranslated: string[] = []
    let totalChecked = 0
    let passed = 0

    const check = (fieldName: string, arVal?: string | null, enVal?: string | null) => {
      totalChecked++
      const ar = (arVal || '').trim()
      const en = (enVal || '').trim()
      const hasArabicLetters = /[\u0600-\u06FF]/.test(ar)
      
      if (!ar) {
        untranslated.push(`${fieldName}: missing Arabic translation`)
        return false
      }
      if (en && ar.toLowerCase() === en.toLowerCase() && !hasArabicLetters) {
        untranslated.push(`${fieldName}: displaying English fallback text ("${ar}")`)
        return false
      }
      passed++
      return true
    }

    // Core Identity
    check("Attraction Name (AR)", nameAr, nameEn)
    if (taglineEn?.trim()) check("Tagline (AR)", taglineAr, taglineEn)
    if (descriptionEn?.trim()) check("Description (AR)", descriptionAr, descriptionEn)

    // Activities
    activities.forEach((act, idx) => {
      const actName = act.titleEn || `Activity #${idx + 1}`
      check(`Activity "${actName}" Title (AR)`, act.titleAr, act.titleEn)
      if (act.descriptionEn?.trim()) {
        check(`Activity "${actName}" Description (AR)`, act.descriptionAr, act.descriptionEn)
      }
    })

    // FAQs
    faqs.forEach((faq, idx) => {
      const faqName = faq.questionEn ? `"${faq.questionEn.substring(0, 25)}..."` : `FAQ #${idx + 1}`
      check(`FAQ ${faqName} Question (AR)`, faq.questionAr, faq.questionEn)
      check(`FAQ ${faqName} Answer (AR)`, faq.answerAr, faq.answerEn)
    })

    // Pricing Tiers
    pricingTiers.forEach((tier, idx) => {
      const tierName = tier.titleEn || `Tier #${idx + 1}`
      check(`Pricing "${tierName}" Title (AR)`, tier.titleAr, tier.titleEn)
    })

    // SEO
    if (seo.metaTitleEn?.trim()) check("SEO Meta Title (AR)", seo.metaTitleAr, seo.metaTitleEn)
    if (seo.metaDescriptionEn?.trim()) check("SEO Meta Description (AR)", seo.metaDescriptionAr, seo.metaDescriptionEn)

    const score = totalChecked > 0 ? Math.round((passed / totalChecked) * 100) : 100

    return {
      score,
      passed,
      totalChecked,
      untranslated,
      isComplete: untranslated.length === 0
    }
  }, [nameAr, nameEn, taglineAr, taglineEn, descriptionAr, descriptionEn, activities, faqs, pricingTiers, seo])

  // Content Health Issues Auditor
  const contentHealthAudit = useMemo(() => {
    const issues: string[] = []
    const validCategories = ['ACCESS_PASS', 'PREMIUM_ACTIVITY', 'HOURLY_ACTIVITY', 'ADD_ON']

    // 1. Missing Activity Media
    activities.forEach((act, idx) => {
      if (!act.imageUrl?.trim()) {
        issues.push(`Activity "${act.titleEn || idx + 1}": missing activity media photo`)
      }
    })

    // 2. Fewer than two FAQs
    if (faqs.length < 2) {
      issues.push(`Attraction has ${faqs.length} FAQs (minimum 2 authentic FAQs required)`)
    }

    // 3. Missing Arabic FAQ fields
    faqs.forEach((faq, idx) => {
      const qAr = (faq.questionAr || '').trim()
      const aAr = (faq.answerAr || '').trim()
      const qEn = (faq.questionEn || '').trim()
      const aEn = (faq.answerEn || '').trim()
      if (!qAr || !/[\u0600-\u06FF]/.test(qAr) || (qEn && qAr.toLowerCase() === qEn.toLowerCase())) {
        issues.push(`FAQ #${idx + 1}: missing Arabic question translation`)
      }
      if (!aAr || !/[\u0600-\u06FF]/.test(aAr) || (aEn && aAr.toLowerCase() === aEn.toLowerCase())) {
        issues.push(`FAQ #${idx + 1}: missing Arabic answer translation`)
      }
    })

    // 4. Validate Partner Logos
    const validPartners = partners.filter(p => {
      const name = p.name || p.partnerName
      const logo = p.logoUrl || p.logo || p.image
      return name && logo && !logo.includes('example.com') && !logo.includes('placeholder')
    })
    if (validPartners.length === 0) {
      issues.push("No authentic partners configured (Partners section hidden on live page)")
    }

    // 5. Pricing categories (only required for PAID access model)
    if (accessModel === 'PAID') {
      pricingTiers.forEach((tier, idx) => {
        const cat = String(tier.type || '').toUpperCase().trim()
        if (!validCategories.includes(cat)) {
          issues.push(`Pricing "${tier.titleEn || idx + 1}": invalid category "${tier.type || 'EMPTY'}"`)
        }
      })
    }

    return {
      issues,
      isValid: issues.length === 0
    }
  }, [activities, faqs, partners, pricingTiers, accessModel])

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
      accessModel === 'FREE' ? true : pricingTiers.length > 0,
      Boolean(temporalStatus.openTime && temporalStatus.closeTime)
    ]
    scores.visit = Math.round((visitChecks.filter(Boolean).length / visitChecks.length) * 100)
    if (linkedLocations.length === 0) missing.push("Linked Canonical GIS Location")
    if (accessModel === 'PAID' && pricingTiers.length === 0) missing.push("At least 1 Pricing Pass / Ticket Tier")

    // 4. Media checks
    const validGallery = galleryItems.filter(g => g && g.url && !g.url.includes('example.com') && !g.url.includes('placeholder'))
    const validFaqs = faqs.filter(f => f && f.questionEn?.trim() && f.answerEn?.trim())

    const mediaChecks = [
      validGallery.length >= 2,
      validFaqs.length >= 2
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
  }, [nameEn, nameAr, slug, taglineEn, descriptionEn, heroMediaUrl, activities, linkedLocations, pricingTiers, temporalStatus, galleryItems, faqs, seo, isPublished, accessModel])

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
        isPublished: nextIsPublished,
        isFeatured,
        isB2bVisible,
        entityType,
        experienceFormat,
        accessModel,
        durationModel,
        environment,
        eventDetails,
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

      setIsDirty(false)
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

  const currentStageIndex = STUDIO_STAGES.findIndex(s => s.id === activeStage)

  return (
    <div className={cn(
      "w-full transition-all duration-300",
      isFocusMode ? "fixed inset-0 z-50 bg-[var(--bg-level-1)] flex flex-col overflow-hidden" : ""
    )}>
      {/* 1. Consistent Top Navigation Header with Focus Mode Control */}
      <EditorHeader
        title={nameEn || "New Attraction / Event"}
        titleAr={nameAr}
        subtitle={slug ? `e3.qa/b2c/attractions/${slug}` : "Configure multi-purpose experience"}
        statusBadge={{
          label: isPublished ? "Published" : "Draft",
          labelAr: isPublished ? "منشور Live" : "مسودة",
          variant: isPublished ? "published" : "draft"
        }}
        backHref="/dashboard/b2c/attractions"
        backLabel="Back to Attractions Roster"
        backLabelAr="العودة إلى قائمة الوجهات"
        breadcrumbs={[
          { label: "B2C Content", labelAr: "محتوى الأفراد", href: "/dashboard/b2c/attractions" },
          { label: "Attraction Studio", labelAr: "استوديو الوجهات والفعاليات" }
        ]}
        stages={STUDIO_STAGES}
        currentStageIndex={currentStageIndex}
        onPrevStage={() => {
          if (currentStageIndex > 0) setActiveStage(STUDIO_STAGES[currentStageIndex - 1].id)
        }}
        onNextStage={() => {
          if (currentStageIndex < STUDIO_STAGES.length - 1) setActiveStage(STUDIO_STAGES[currentStageIndex + 1].id)
        }}
        isDirty={isDirty}
        onSave={() => handleSave()}
        isSaving={isSaving}
        previewUrl={slug ? `/en/b2c/attractions/${slug}` : undefined}
        focusModeToggle={{
          isFocusMode,
          onToggle: () => setIsFocusMode(!isFocusMode),
          label: "Focus Mode",
          labelAr: "وضع التركيز الكامل"
        }}
        extraActions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsIntakeOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-primary)] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Intake Hub</span>
            </button>

            <div className="inline-flex items-center p-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)]">
              <button
                type="button"
                onClick={() => setBilingualView('BOTH')}
                className={cn(
                  "px-2 py-1 rounded-lg text-xs font-bold transition-all",
                  bilingualView === 'BOTH' ? "bg-[var(--surface-default)] text-[var(--text-primary)] shadow-xs" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                EN+AR
              </button>
              <button
                type="button"
                onClick={() => setBilingualView('EN')}
                className={cn(
                  "px-2 py-1 rounded-lg text-xs font-bold transition-all",
                  bilingualView === 'EN' ? "bg-[var(--surface-default)] text-[var(--text-primary)] shadow-xs" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setBilingualView('AR')}
                className={cn(
                  "px-2 py-1 rounded-lg text-xs font-bold transition-all",
                  bilingualView === 'AR' ? "bg-[var(--surface-default)] text-[var(--text-primary)] shadow-xs" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                عربي
              </button>
            </div>
          </div>
        }
      />

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

      {/* 2. Responsive 3-Column Studio Body */}
      <div className={cn(
        "flex-1 flex overflow-hidden",
        isFocusMode ? "h-[calc(100vh-65px)]" : "min-h-[85vh] py-6"
      )}>
        {/* Left Column: Workflow Navigation (Collapsible, 260-280px) */}
        <aside className={cn(
          "bg-[var(--surface-default)] border-r border-[var(--border-level-1)] transition-all duration-300 shrink-0 flex flex-col justify-between hidden md:flex",
          isNavCollapsed ? "w-16 p-2 items-center" : "w-72 p-4"
        )}>
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              {!isNavCollapsed && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Workflow Stages</h3>
                  <p className="text-[11px] text-[var(--text-tertiary)]">5-stage production studio</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                title={isNavCollapsed ? "Expand Navigation" : "Collapse Navigation"}
              >
                {isNavCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            </div>

            <nav className="space-y-1.5">
              {STUDIO_STAGES.map((stage, idx) => {
                const Icon = stage.icon
                const isActive = activeStage === stage.id
                const stageScore = healthAudit.scores[stage.id] || 0

                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setActiveStage(stage.id)}
                    className={cn(
                      "w-full text-left rounded-2xl transition-all flex items-center gap-3 cursor-pointer",
                      isNavCollapsed ? "p-3 justify-center" : "p-3",
                      isActive
                        ? "bg-purple-500/15 border border-purple-500/40 text-purple-400 font-bold shadow-xs"
                        : "hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-transparent"
                    )}
                    title={stage.labelEn}
                  >
                    <div className={cn(
                      "p-2 rounded-xl shrink-0 transition-colors",
                      isActive ? "bg-purple-500 text-white" : "bg-[var(--surface-subtle)] text-[var(--text-secondary)]"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {!isNavCollapsed && (
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold truncate text-[var(--text-primary)]">{stage.labelEn}</span>
                          <span className={cn(
                            "text-[10px] font-mono font-bold",
                            stageScore === 100 ? "text-emerald-500" : "text-[var(--text-tertiary)]"
                          )}>
                            {stageScore}%
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--text-tertiary)] truncate mt-0.5">{stage.description}</p>
                      </div>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Quick Roster Links */}
          {!isNavCollapsed && (
            <div className="p-3 bg-[var(--surface-subtle)] rounded-2xl border border-[var(--border-level-1)] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span className="font-bold">Overall Quality</span>
                <span className="font-mono font-bold text-purple-400">{healthAudit.overall}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${healthAudit.overall}%` }} />
              </div>
            </div>
          )}
        </aside>

        {/* Center Column: Flexible Primary Editor Workspace */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 space-y-8 min-w-0">
          
          {/* ========================================================================= */}
          {/* STAGE 1: IDENTITY & CLASSIFICATION */}
          {/* ========================================================================= */}
          {activeStage === 'identity' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="p-6 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-black text-[var(--text-primary)]">1. Core Identity & Multi-Dimensional Classification</h2>
                  <p className="text-xs text-[var(--text-secondary)]">Controlled taxonomy for permanent attractions, festivals, sports activations, and pop-ups.</p>
                </div>

                {/* Controlled 5-Dimensional Classification Grid */}
                <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-level-1)]">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                      Experience Classification Matrix
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 1. Entity Type */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[var(--text-secondary)]">Entity Type *</label>
                      <select
                        value={entityType}
                        onChange={e => { setEntityType(e.target.value); markDirty(); }}
                        className="w-full h-10 px-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] font-bold focus:border-purple-500"
                      >
                        {ENTITY_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.labelEn}</option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Experience Format */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[var(--text-secondary)]">Experience Format *</label>
                      <select
                        value={experienceFormat}
                        onChange={e => { setExperienceFormat(e.target.value); markDirty(); }}
                        className="w-full h-10 px-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] font-bold focus:border-purple-500"
                      >
                        {EXPERIENCE_FORMATS.map(f => (
                          <option key={f.value} value={f.value}>{f.labelEn}</option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Access Model */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[var(--text-secondary)]">Access Model *</label>
                      <select
                        value={accessModel}
                        onChange={e => { setAccessModel(e.target.value); markDirty(); }}
                        className="w-full h-10 px-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] font-bold focus:border-purple-500"
                      >
                        {ACCESS_MODELS.map(m => (
                          <option key={m.value} value={m.value}>{m.labelEn}</option>
                        ))}
                      </select>
                    </div>

                    {/* 4. Duration Model */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[var(--text-secondary)]">Duration Model *</label>
                      <select
                        value={durationModel}
                        onChange={e => { setDurationModel(e.target.value); markDirty(); }}
                        className="w-full h-10 px-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] font-bold focus:border-purple-500"
                      >
                        {DURATION_MODELS.map(d => (
                          <option key={d.value} value={d.value}>{d.labelEn}</option>
                        ))}
                      </select>
                    </div>

                    {/* 5. Environment */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[var(--text-secondary)]">Environment *</label>
                      <select
                        value={environment}
                        onChange={e => { setEnvironment(e.target.value); markDirty(); }}
                        className="w-full h-10 px-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] font-bold focus:border-purple-500"
                      >
                        {ENVIRONMENT_MODELS.map(env => (
                          <option key={env.value} value={env.value}>{env.labelEn}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Conditional Form: Events & Activations */}
                {(entityType === 'EVENT' || entityType === 'ACTIVATION' || durationModel !== 'PERMANENT') && (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-4">
                    <div className="flex items-center gap-2">
                      <CalendarRange className="w-4 h-4 text-purple-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                        Event Schedule & Session Settings
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="font-bold text-[var(--text-secondary)] block mb-1">Start Date</label>
                        <input
                          type="date"
                          value={eventDetails.startDate || ""}
                          onChange={e => { setEventDetails({ ...eventDetails, startDate: e.target.value }); markDirty(); }}
                          className="w-full h-9 px-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[var(--text-secondary)] block mb-1">End Date</label>
                        <input
                          type="date"
                          value={eventDetails.endDate || ""}
                          onChange={e => { setEventDetails({ ...eventDetails, endDate: e.target.value }); markDirty(); }}
                          className="w-full h-9 px-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[var(--text-secondary)] block mb-1">Daily Capacity Gate</label>
                        <input
                          type="number"
                          value={eventDetails.dailyCapacity || 500}
                          onChange={e => { setEventDetails({ ...eventDetails, dailyCapacity: parseInt(e.target.value) || 500 }); markDirty(); }}
                          className="w-full h-9 px-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-primary)] font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="font-bold text-[var(--text-secondary)] block mb-1">Session Times / Schedule Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Morning: 10:00 - 14:00, Evening: 16:00 - 22:00"
                          value={eventDetails.sessionTimes || ""}
                          onChange={e => { setEventDetails({ ...eventDetails, sessionTimes: e.target.value }); markDirty(); }}
                          className="w-full h-9 px-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[var(--text-secondary)] block mb-1">Registration URL (if applicable)</label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={eventDetails.registrationUrl || ""}
                          onChange={e => { setEventDetails({ ...eventDetails, registrationUrl: e.target.value }); markDirty(); }}
                          className="w-full h-9 px-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Form: Sports Activation */}
                {experienceFormat === 'SPORTS_ACTIVATION' && (
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-blue-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">
                        Sports Activation Guidelines & Rules
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="font-bold text-[var(--text-secondary)] block mb-1">Sport Category</label>
                        <input
                          type="text"
                          placeholder="e.g. Tactical Combat / Obstacle Course / Football"
                          value={eventDetails.sportCategory || ""}
                          onChange={e => { setEventDetails({ ...eventDetails, sportCategory: e.target.value }); markDirty(); }}
                          className="w-full h-9 px-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[var(--text-secondary)] block mb-1">Competition Format</label>
                        <input
                          type="text"
                          placeholder="e.g. Free Play & Timed Leaderboard"
                          value={eventDetails.competitionFormat || ""}
                          onChange={e => { setEventDetails({ ...eventDetails, competitionFormat: e.target.value }); markDirty(); }}
                          className="w-full h-9 px-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[var(--text-secondary)] block mb-1">Equipment Requirements</label>
                        <input
                          type="text"
                          placeholder="e.g. Provided helmets and gear, closed shoes mandatory"
                          value={eventDetails.equipmentRequirements || ""}
                          onChange={e => { setEventDetails({ ...eventDetails, equipmentRequirements: e.target.value }); markDirty(); }}
                          className="w-full h-9 px-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[var(--text-secondary)] block mb-1">Participant Age Limits</label>
                        <input
                          type="text"
                          placeholder="e.g. 8+ with signed waiver"
                          value={eventDetails.ageLimits || ""}
                          onChange={e => { setEventDetails({ ...eventDetails, ageLimits: e.target.value }); markDirty(); }}
                          className="w-full h-9 px-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bilingual Titles & Slug */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(bilingualView === 'BOTH' || bilingualView === 'EN') && (
                    <div>
                      <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                        Attraction Name (English) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Urban Arena"
                        value={nameEn}
                        onChange={e => {
                          setNameEn(e.target.value)
                          if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                          markDirty()
                        }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-sm text-[var(--text-primary)] font-bold focus:border-purple-500"
                      />
                    </div>
                  )}

                  {(bilingualView === 'BOTH' || bilingualView === 'AR') && (
                    <div>
                      <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1" dir="rtl">
                        اسم الوجهة (العربية) *
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="مثال: أوربان أرينا"
                        value={nameAr}
                        onChange={e => { setNameAr(e.target.value); markDirty(); }}
                        className="w-full h-10 px-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-sm text-[var(--text-primary)] font-bold text-right focus:border-purple-500"
                      />
                    </div>
                  )}
                </div>

                {/* URL Slug & Visibility */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                      URL Slug * (Unique Canonical Path)
                    </label>
                    <div className="flex items-center">
                      <span className="h-10 px-3 rounded-l-xl bg-[var(--surface-subtle)] border border-r-0 border-[var(--border-level-2)] text-xs text-[var(--text-tertiary)] flex items-center font-mono">
                        e3.qa/b2c/attractions/
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={e => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); markDirty(); }}
                        className="flex-1 h-10 px-3 rounded-r-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] font-mono font-bold focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-end gap-3 pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={e => { setIsPublished(e.target.checked); markDirty(); }}
                        className="w-4 h-4 rounded-sm border-[var(--border-level-2)] text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-[var(--text-primary)]">Publish Live</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={e => { setIsFeatured(e.target.checked); markDirty(); }}
                        className="w-4 h-4 rounded-sm border-[var(--border-level-2)] text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-[var(--text-primary)]">Featured</span>
                    </label>
                  </div>
                </div>

                {/* Taglines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(bilingualView === 'BOTH' || bilingualView === 'EN') && (
                    <div>
                      <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Tagline (EN)</label>
                      <input
                        type="text"
                        placeholder="e.g. Tactical Laser Tag & AR Entertainment"
                        value={taglineEn}
                        onChange={e => { setTaglineEn(e.target.value); markDirty(); }}
                        className="w-full h-9 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
                      />
                    </div>
                  )}

                  {(bilingualView === 'BOTH' || bilingualView === 'AR') && (
                    <div>
                      <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1" dir="rtl">الشعار الترويجي (العربية)</label>
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="مثال: ليزر تاغ تكتيكي وتجارب واقع معزز"
                        value={taglineAr}
                        onChange={e => { setTaglineAr(e.target.value); markDirty(); }}
                        className="w-full h-9 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] text-right"
                      />
                    </div>
                  )}
                </div>

                {/* Overview Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(bilingualView === 'BOTH' || bilingualView === 'EN') && (
                    <div>
                      <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">Overview Description (EN)</label>
                      <textarea
                        rows={4}
                        placeholder="Full experiential overview in English..."
                        value={descriptionEn}
                        onChange={e => { setDescriptionEn(e.target.value); markDirty(); }}
                        className="w-full p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] resize-y"
                      />
                    </div>
                  )}

                  {(bilingualView === 'BOTH' || bilingualView === 'AR') && (
                    <div>
                      <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1" dir="rtl">الوصف التعريفي (العربية)</label>
                      <textarea
                        rows={4}
                        dir="rtl"
                        placeholder="الوصف التعريفي الكامل باللغة العربية..."
                        value={descriptionAr}
                        onChange={e => { setDescriptionAr(e.target.value); markDirty(); }}
                        className="w-full p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] resize-y text-right"
                      />
                    </div>
                  )}
                </div>

                {/* Hero Media & Logos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-level-1)]">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                      Hero Poster / Video Media
                    </label>
                    <MediaUploader
                      value={heroMediaUrl}
                      onChange={url => { setHeroMediaUrl(url); markDirty(); }}
                      placeholder="Upload or enter hero media URL"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                      Attraction / Brand Logo (SVG or PNG)
                    </label>
                    <MediaUploader
                      value={logoUrl}
                      onChange={url => { setLogoUrl(url); markDirty(); }}
                      placeholder="Upload logo"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: WHAT'S INSIDE (ACTIVITIES & STORY TRACKS) */}
          {/* ========================================================================= */}
          {activeStage === 'experiences' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="p-6 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
                  <div>
                    <h2 className="text-lg font-black text-[var(--text-primary)]">2. What&apos;s Inside (Experiences & Activities)</h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Every activity requires one Primary Story Track and up to two optional Secondary Supporting Tracks.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActivities([
                        ...activities,
                        {
                          titleEn: "New Activity",
                          titleAr: "نشاط جديد",
                          contentType: "ACTIVITY",
                          intensityLevel: "MEDIUM"
                        }
                      ])
                      markDirty()
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Activity</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {activities.map((activity, idx) => (
                    <CompactActivityCard
                      key={activity.id || idx}
                      activity={activity}
                      index={idx}
                      availableStoryTypes={availableStoryTypes}
                      availableBrands={availableBrands}
                      bilingualView={bilingualView}
                      onUpdate={updated => {
                        const next = [...activities]
                        next[idx] = updated
                        setActivities(next)
                        markDirty()
                      }}
                      onDuplicate={() => {
                        const copy = { ...activity, id: undefined, titleEn: `${activity.titleEn} (Copy)` }
                        setActivities([...activities, copy])
                        markDirty()
                      }}
                      onDelete={() => {
                        setActivities(activities.filter((_, i) => i !== idx))
                        markDirty()
                      }}
                      onStoryTypeCreated={newTrack => {
                        setAvailableStoryTypes([...availableStoryTypes, newTrack])
                      }}
                    />
                  ))}

                  {activities.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-[var(--border-level-2)] rounded-3xl space-y-3">
                      <Sparkles className="w-8 h-8 mx-auto text-purple-400" />
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">No activities added yet</h4>
                      <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                        Add interactive games, VR setups, laser tag, and zone highlights.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setActivities([{ titleEn: "Feature Activity", titleAr: "نشاط رئيسي", contentType: "ACTIVITY" }])
                          markDirty()
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Activity</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: VISIT & BOOKING */}
          {/* ========================================================================= */}
          {activeStage === 'visit' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="p-6 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-xs space-y-6">
                {/* Canonical GIS Locations */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
                    <div>
                      <h2 className="text-lg font-black text-[var(--text-primary)]">3. Linked Canonical Qatar Locations</h2>
                      <p className="text-xs text-[var(--text-secondary)]">Resolved GIS coordinates and venue associations (never raw object IDs).</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLocationModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Link GIS Venue</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {linkedLocations.map((link, idx) => (
                      <div
                        key={link.locationId || idx}
                        className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-purple-400" />
                            <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                              {link.location?.nameEn || link.nameEn || "Qatar Venue"}
                            </h4>
                            {link.isPrimary && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                                Primary Venue
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] truncate">
                            {link.location?.venueEn || link.venueEn || "Doha, Qatar"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                            <input
                              type="radio"
                              name="primaryLocationRadio"
                              checked={link.isPrimary}
                              onChange={() => {
                                setLinkedLocations(linkedLocations.map((l, i) => ({ ...l, isPrimary: i === idx })))
                                markDirty()
                              }}
                              className="text-purple-500 focus:ring-purple-500"
                            />
                            <span>Set Primary</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              setLinkedLocations(linkedLocations.filter((_, i) => i !== idx))
                              markDirty()
                            }}
                            className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {linkedLocations.length === 0 && (
                      <div className="p-8 text-center border-2 border-dashed border-[var(--border-level-2)] rounded-2xl space-y-2">
                        <MapPin className="w-6 h-6 text-amber-500 mx-auto" />
                        <p className="text-xs text-[var(--text-secondary)]">No canonical GIS venue linked yet.</p>
                        <button
                          type="button"
                          onClick={() => setIsLocationModalOpen(true)}
                          className="text-xs font-bold text-purple-400 hover:underline inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Link a Qatar Venue</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operating Timings */}
                <div className="pt-6 border-t border-[var(--border-level-1)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">Operating Timings (Qatar Time GMT+3)</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block mb-1">Opening Time</label>
                      <input
                        type="time"
                        value={temporalStatus.openTime}
                        onChange={e => { setTemporalStatus({ ...temporalStatus, openTime: e.target.value }); markDirty(); }}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block mb-1">Closing Time</label>
                      <input
                        type="time"
                        value={temporalStatus.closeTime}
                        onChange={e => { setTemporalStatus({ ...temporalStatus, closeTime: e.target.value }); markDirty(); }}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block mb-1">Display Hours (EN)</label>
                      <input
                        type="text"
                        placeholder="e.g. Daily: 10:00 AM - 10:00 PM"
                        value={temporalStatus.operatingHoursEn}
                        onChange={e => { setTemporalStatus({ ...temporalStatus, operatingHoursEn: e.target.value }); markDirty(); }}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block mb-1" dir="rtl">أوقات العمل (العربية)</label>
                      <input
                        type="text"
                        dir="rtl"
                        placeholder="مثال: يومياً: ١٠:٠٠ ص - ١٠:٠٠ م"
                        value={temporalStatus.operatingHoursAr}
                        onChange={e => { setTemporalStatus({ ...temporalStatus, operatingHoursAr: e.target.value }); markDirty(); }}
                        className="w-full bg-[var(--surface-subtle)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Passes (Hidden if Free Access Model) */}
                {accessModel !== 'FREE' ? (
                  <div className="pt-6 border-t border-[var(--border-level-1)]">
                    <CompactRepeaterList
                      title="Pricing Passes & Ticket Tiers"
                      subtitle="Classify each pass as: ACCESS_PASS, PREMIUM_ACTIVITY, HOURLY_ACTIVITY, or ADD_ON"
                      items={pricingTiers}
                      itemType="PRICING"
                      bilingualView={bilingualView}
                      onAdd={() => {
                        setPricingTiers([
                          ...pricingTiers,
                          { titleEn: "Access Pass", titleAr: "تذكرة دخول", price: 50, currency: "QAR", type: "ACCESS_PASS" }
                        ])
                        markDirty()
                      }}
                      onUpdate={(idx, updated) => {
                        const next = [...pricingTiers]
                        next[idx] = updated
                        setPricingTiers(next)
                        markDirty()
                      }}
                      onDelete={idx => {
                        setPricingTiers(pricingTiers.filter((_, i) => i !== idx))
                        markDirty()
                      }}
                      onDuplicate={idx => {
                        const copy = { ...pricingTiers[idx], id: undefined, titleEn: `${pricingTiers[idx].titleEn} (Copy)` }
                        setPricingTiers([...pricingTiers, copy])
                        markDirty()
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Free Access Model selected. Ticket pricing requirement is optional.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 4: MEDIA, CASE STUDIES & TRUST */}
          {/* ========================================================================= */}
          {activeStage === 'media' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* B2B Case Studies Integration Panel */}
              <CaseStudiesAttractionPanel
                attractionId={initialData?.id}
                attractionNameEn={nameEn}
                attractionNameAr={nameAr}
                attractionSlug={slug}
                heroMediaUrl={heroMediaUrl}
                heroThumbnailUrl={heroThumbnailUrl}
                logoUrl={logoUrl}
                descriptionEn={descriptionEn}
                descriptionAr={descriptionAr}
                linkedLocations={linkedLocations}
                isB2bVisible={isB2bVisible}
                onToggleB2bVisible={val => { setIsB2bVisible(val); markDirty(); }}
              />

              {/* Gallery Photos */}
              <div className="p-6 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-xs">
                <CompactRepeaterList
                  title="Gallery Photos (Minimum 2 authentic images)"
                  subtitle="High-resolution venue photography"
                  items={galleryItems}
                  itemType="GALLERY"
                  bilingualView={bilingualView}
                  onAdd={() => {
                    setGalleryItems([...galleryItems, { url: "", captionEn: "" }])
                    markDirty()
                  }}
                  onUpdate={(idx, updated) => {
                    const next = [...galleryItems]
                    next[idx] = updated
                    setGalleryItems(next)
                    markDirty()
                  }}
                  onDelete={idx => {
                    setGalleryItems(galleryItems.filter((_, i) => i !== idx))
                    markDirty()
                  }}
                />
              </div>

              {/* FAQs */}
              <div className="p-6 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-xs">
                <CompactRepeaterList
                  title="Frequently Asked Questions (Minimum 2 authentic FAQs)"
                  subtitle="Bilingual answers to visitor questions"
                  items={faqs}
                  itemType="FAQ"
                  bilingualView={bilingualView}
                  onAdd={() => {
                    setFaqs([
                      ...faqs,
                      { questionEn: "What are the rules?", questionAr: "ما هي القواعد؟", answerEn: "Safety gear is provided.", answerAr: "يتم توفير معدات السلامة." }
                    ])
                    markDirty()
                  }}
                  onUpdate={(idx, updated) => {
                    const next = [...faqs]
                    next[idx] = updated
                    setFaqs(next)
                    markDirty()
                  }}
                  onDelete={idx => {
                    setFaqs(faqs.filter((_, i) => i !== idx))
                    markDirty()
                  }}
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 5: REVIEW & PUBLISH */}
          {/* ========================================================================= */}
          {activeStage === 'review' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="p-6 bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-black text-[var(--text-primary)]">5. Review & Live Publishing</h2>
                  <p className="text-xs text-[var(--text-secondary)]">SEO metadata, translation health audit, and live publishing controls.</p>
                </div>

                {/* Translation Health Audit Panel */}
                <div className="p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">Arabic Localization Audit</h4>
                    </div>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-mono font-bold",
                      translationAudit.score === 100 ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                    )}>
                      {translationAudit.score}% Complete
                    </span>
                  </div>

                  {translationAudit.untranslated.length > 0 ? (
                    <ul className="text-xs text-amber-400 space-y-1 list-disc list-inside">
                      {translationAudit.untranslated.slice(0, 5).map((u, i) => (
                        <li key={i}>{u}</li>
                      ))}
                      {translationAudit.untranslated.length > 5 && (
                        <li>...and {translationAudit.untranslated.length - 5} more fields</li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>All Arabic fields contain authentic localized copy.</span>
                    </p>
                  )}
                </div>

                {/* SEO Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">SEO Meta Title (EN)</label>
                    <input
                      type="text"
                      value={seo.metaTitleEn || ""}
                      onChange={e => { setSeo({ ...seo, metaTitleEn: e.target.value }); markDirty(); }}
                      className="w-full h-9 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1" dir="rtl">عنوان سيو (العربية)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={seo.metaTitleAr || ""}
                      onChange={e => { setSeo({ ...seo, metaTitleAr: e.target.value }); markDirty(); }}
                      className="w-full h-9 px-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] text-right"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">SEO Meta Description (EN)</label>
                    <textarea
                      rows={2}
                      value={seo.metaDescriptionEn || ""}
                      onChange={e => { setSeo({ ...seo, metaDescriptionEn: e.target.value }); markDirty(); }}
                      className="w-full p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1" dir="rtl">وصف سيو (العربية)</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={seo.metaDescriptionAr || ""}
                      onChange={e => { setSeo({ ...seo, metaDescriptionAr: e.target.value }); markDirty(); }}
                      className="w-full p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] text-right"
                    />
                  </div>
                </div>

                {/* Final Publish Trigger */}
                <div className="p-6 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Ready to Publish Live?</h4>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {isPublished
                        ? "This attraction is currently published on public routes."
                        : "Click below to publish this attraction to the public E3 website."}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSave(!isPublished)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer",
                      isPublished ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"
                    )}
                  >
                    {isPublished ? "Unpublish to Draft" : "Publish to Production"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Column: Diagnostics & Preview Panel (Collapsible, 300-340px) */}
        <aside className={cn(
          "bg-[var(--surface-default)] border-l border-[var(--border-level-1)] transition-all duration-300 shrink-0 flex flex-col justify-between hidden lg:flex",
          isDiagnosticsCollapsed ? "w-12 p-2 items-center" : "w-80 p-4 space-y-4 overflow-y-auto custom-scrollbar"
        )}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {!isDiagnosticsCollapsed && (
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Studio Diagnostics</h3>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsDiagnosticsCollapsed(!isDiagnosticsCollapsed)}
                className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                title={isDiagnosticsCollapsed ? "Expand Diagnostics" : "Collapse Diagnostics"}
              >
                {isDiagnosticsCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
              </button>
            </div>

            {!isDiagnosticsCollapsed && (
              <div className="space-y-4">
                {/* Overall Score */}
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center space-y-1">
                  <span className="text-3xl font-black text-purple-400 font-mono">{healthAudit.overall}%</span>
                  <p className="text-[11px] font-bold text-[var(--text-primary)]">Production Readiness Score</p>
                </div>

                {/* Stage Progress Bars */}
                <div className="space-y-2 text-xs">
                  {STUDIO_STAGES.map(s => (
                    <div key={s.id} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[var(--text-secondary)] font-medium">{s.labelEn}</span>
                        <span className="font-mono font-bold text-[var(--text-primary)]">{healthAudit.scores[s.id]}%</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            healthAudit.scores[s.id] === 100 ? "bg-emerald-500" : "bg-purple-500"
                          )}
                          style={{ width: `${healthAudit.scores[s.id]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Missing Elements */}
                {healthAudit.missing.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Missing Fields ({healthAudit.missing.length})</span>
                    </span>
                    <ul className="text-[11px] text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                      {healthAudit.missing.slice(0, 6).map((m, i) => (
                        <li key={i} className="truncate">{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Public Link */}
                {slug && (
                  <a
                    href={`/en/b2c/attractions/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                    <span>Open Live Attraction</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Location Selector Modal */}
      {isLocationModalOpen && (
        <LocationSelectorModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          availableLocations={availableLocations}
          currentlyLinkedIds={linkedLocations.map(l => l.locationId)}
          onRefreshLocations={loadData}
          onLinkLocation={(loc: any) => {
            const already = linkedLocations.find(l => l.locationId === loc.id)
            if (!already) {
              setLinkedLocations([
                ...linkedLocations,
                {
                  locationId: loc.id,
                  location: loc,
                  isPrimary: linkedLocations.length === 0,
                  mapVisible: true
                }
              ])
              markDirty()
            }
            setIsLocationModalOpen(false)
          }}
        />
      )}

      {/* Content Intake Hub Modal */}
      <ContentIntakeHub
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onSuccess={() => {
          loadData()
        }}
      />
    </div>
  )
}
