"use client"

import { useState, useEffect } from "react"
import { 
  Building, 
  Image as ImageIcon, 
  FileText, 
  CreditCard, 
  Check, 
  Save, 
  RotateCcw, 
  Eye, 
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Palette,
  ExternalLink,
  Printer,
  Sparkles
} from "lucide-react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { 
  PDFLetterheadConfig, 
  DEFAULT_PDF_CONFIG 
} from "@/components/dashboard/b2c/PDFLetterheadManagerModal"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { PDFImageUploader } from "@/components/dashboard/b2c/PDFImageUploader"
import { A4QuotationSheet } from "@/components/dashboard/b2c/A4QuotationSheet"

const QuotationPDFDownload = dynamic(
  () => import("@/components/dashboard/b2c/QuotationPDFDocument"),
  { ssr: false }
)

interface PackagePdfSettingsTabProps {
  locale?: string
}

export function PackagePdfSettingsTab({ locale = "en" }: PackagePdfSettingsTabProps) {
  const isAr = locale === "ar"
  const { toast } = useToast()
  const [activeSubTab, setActiveSubTab] = useState<"HEADER" | "VENUE" | "BANKING" | "FOOTER">("HEADER")
  const [config, setConfig] = useState<PDFLetterheadConfig>(DEFAULT_PDF_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/b2c/pdf-settings")
        if (res.ok) {
          const json = await res.json()
          if (json.data) {
            setConfig({ ...DEFAULT_PDF_CONFIG, ...json.data })
          }
        }
      } catch (e) {
        console.warn("Failed to load PDF settings, using defaults", e)
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/b2c/pdf-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast(isAr ? "تم حفظ إعدادات ترويسة عروض الأسعار بنجاح" : "PDF Letterhead settings saved successfully.", "success")
    } catch (e: any) {
      console.error(e)
      toast(e?.message || (isAr ? "فشل حفظ الإعدادات" : "Failed to save settings"), "error")
    } finally {
      setSaving(false)
    }
  }

  const handleResetDefaults = () => {
    if (confirm(isAr ? "هل أنت متأكد من استعادة الإعدادات الافتراضية لترويسة إي ثري؟" : "Reset letterhead settings to official E3 defaults?")) {
      setConfig({ ...DEFAULT_PDF_CONFIG })
      toast(isAr ? "تمت استعادة الإعدادات الافتراضية" : "Reset to default settings.", "info")
    }
  }

  const updateField = (field: keyof PDFLetterheadConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mb-4" />
        <p className="text-xs text-[var(--text-secondary)] font-mono">Loading PDF Letterhead & Quote Editor...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Description */}
      <div className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-mono font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? "نظام ترويسة عروض الأسعار الرسمية" : "Official E3 Quotation PDF Engine"}</span>
          </div>
          <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
            {isAr ? "محرر ترويسة عروض أسعار باقات أعياد الميلاد والفعاليات" : "PDF Quote & Letterhead Branding Manager"}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-2xl mt-1 leading-relaxed">
            {isAr 
              ? "تحكم في تصميم وترويسة عروض الأسعار الصادرة للعملاء: شعار الشركة، بيانات السجل التجاري، تفاصيل الوجهة والمشرف، الحساب البنكي، والختم والتوقيع الرسمي."
              : "Customize the letterhead, venue identity, payment instructions, authorized signatures, and legal terms printed on every customer birthday & group quotation."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={handleResetDefaults}
            variant="outline"
            className="text-xs border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span>{isAr ? "استعادة الافتراضي" : "Reset Defaults"}</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            <span>{saving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ التغييرات" : "Save Settings")}</span>
          </Button>
        </div>
      </div>

      {/* Editor Grid: Controls on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="xl:col-span-6 space-y-6">
          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab("HEADER")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeSubTab === "HEADER"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              )}
            >
              <Building className="w-3.5 h-3.5" />
              <span>{isAr ? "ترويسة الشركة" : "Header & Co."}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("VENUE")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeSubTab === "VENUE"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              )}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isAr ? "بيانات الوجهة" : "Venue Info"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("BANKING")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeSubTab === "BANKING"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              )}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isAr ? "الحساب البنكي" : "Banking & Pay"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("FOOTER")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeSubTab === "FOOTER"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAr ? "التوقيع والشروط" : "Sign & Terms"}</span>
            </button>
          </div>

          {/* SubTab 1: HEADER */}
          {activeSubTab === "HEADER" && (
            <div className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{isAr ? "بيانات وترويسة الشركة الرسمية" : "Company Header & Legal Identity"}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">Company Name (English)</label>
                  <input
                    type="text"
                    value={config.companyNameEn}
                    onChange={(e) => updateField("companyNameEn", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">اسم الشركة (بالعربية)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={config.companyNameAr}
                    onChange={(e) => updateField("companyNameAr", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">Commercial Registration (CR)</label>
                  <input
                    type="text"
                    value={config.crNumber}
                    onChange={(e) => updateField("crNumber", e.target.value)}
                    placeholder="CR-182940/QA"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">Tax Identification Number (TIN)</label>
                  <input
                    type="text"
                    value={config.taxRegistrationNumber}
                    onChange={(e) => updateField("taxRegistrationNumber", e.target.value)}
                    placeholder="TIN-009841-QA"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <PDFImageUploader
                  label={isAr ? "شعار الشركة الرسمي للترويسة" : "Company Official Logo"}
                  value={config.companyLogoUrl}
                  onChange={(url) => updateField("companyLogoUrl", url)}
                  placeholder="/images/e3-logo.png"
                  recommendedSize={isAr ? "صيغة PNG بخلفية شفافة (الارتفاع: ~40px)" : "PNG with transparent background (~40px height)"}
                  isAr={isAr}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">Official Phone</label>
                    <input
                      type="text"
                      value={config.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+974 4400 1234"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">Official Email</label>
                    <input
                      type="email"
                      value={config.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="events@e3.qa"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">Address (English)</label>
                  <input
                    type="text"
                    value={config.addressEn}
                    onChange={(e) => updateField("addressEn", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">العنوان (بالعربية)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={config.addressAr}
                    onChange={(e) => updateField("addressAr", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">Header Bar Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.headerBannerColor}
                      onChange={(e) => updateField("headerBannerColor", e.target.value)}
                      className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={config.headerBannerColor}
                      onChange={(e) => updateField("headerBannerColor", e.target.value)}
                      className="w-28 px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] font-mono text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <input
                    type="checkbox"
                    id="showLetterheadBar"
                    checked={config.showLetterheadBar}
                    onChange={(e) => updateField("showLetterheadBar", e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="showLetterheadBar" className="text-xs text-[var(--text-secondary)] font-semibold cursor-pointer">
                    {isAr ? "عرض شريط الترويسة الملون أعلى المستند" : "Show Top Color Accent Ribbon on PDF"}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 2: VENUE */}
          {activeSubTab === "VENUE" && (
            <div className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{isAr ? "تفاصيل الوجهة والمنسق الميداني" : "Venue Details & On-Site Coordinator"}</span>
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showVenueDetails"
                    checked={config.showVenueDetails}
                    onChange={(e) => updateField("showVenueDetails", e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 cursor-pointer"
                  />
                  <label htmlFor="showVenueDetails" className="text-xs text-[var(--text-secondary)] font-semibold cursor-pointer">
                    {isAr ? "تضمين في العرض" : "Include in Quote"}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">Venue / Attraction Name (EN)</label>
                  <input
                    type="text"
                    value={config.venueNameEn}
                    onChange={(e) => updateField("venueNameEn", e.target.value)}
                    placeholder="Bounce Qatar"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">اسم الوجهة / الفعالية (بالعربية)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={config.venueNameAr}
                    onChange={(e) => updateField("venueNameAr", e.target.value)}
                    placeholder="باونس قطر"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">Hall / Celebration Zone (EN)</label>
                  <input
                    type="text"
                    value={config.hallOrZoneEn}
                    onChange={(e) => updateField("hallOrZoneEn", e.target.value)}
                    placeholder="VIP Celebration Suite & Arena Zone A"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">القاعة / جناح الحفل (بالعربية)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={config.hallOrZoneAr}
                    onChange={(e) => updateField("hallOrZoneAr", e.target.value)}
                    placeholder="جناح الاحتفالات VIP وساحة الألعاب"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <PDFImageUploader
                  label={isAr ? "شعار الوجهة / الفعالية" : "Venue / Attraction Logo"}
                  value={config.venueLogoUrl}
                  onChange={(url) => updateField("venueLogoUrl", url)}
                  placeholder="https://.../venue-logo.png"
                  recommendedSize={isAr ? "صيغة PNG أو SVG بخلفية شفافة" : "PNG or SVG with transparent background"}
                  isAr={isAr}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">On-Site Coordinator Title</label>
                    <input
                      type="text"
                      value={config.onSiteCoordinator}
                      onChange={(e) => updateField("onSiteCoordinator", e.target.value)}
                      placeholder="Event Operations Lead"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">Coordinator Phone</label>
                    <input
                      type="text"
                      value={config.coordinatorPhone}
                      onChange={(e) => updateField("coordinatorPhone", e.target.value)}
                      placeholder="+974 5599 8822"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 3: BANKING */}
          {activeSubTab === "BANKING" && (
            <div className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{isAr ? "تعليمات الحساب البنكي والتحويل الإلكتروني" : "Banking Instructions & Bank Transfer"}</span>
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showBankDetails"
                    checked={config.showBankDetails}
                    onChange={(e) => updateField("showBankDetails", e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 cursor-pointer"
                  />
                  <label htmlFor="showBankDetails" className="text-xs text-[var(--text-secondary)] font-semibold cursor-pointer">
                    {isAr ? "إظهار في عروض الأسعار" : "Show on Quotations"}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={config.bankName}
                    onChange={(e) => updateField("bankName", e.target.value)}
                    placeholder="Qatar National Bank (QNB)"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">Account Title / Beneficiary</label>
                  <input
                    type="text"
                    value={config.accountTitle}
                    onChange={(e) => updateField("accountTitle", e.target.value)}
                    placeholder="E3 ENTERTAINMENT AND ATTRACTIONS W.L.L"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">IBAN Number (Qatar)</label>
                  <input
                    type="text"
                    value={config.iban}
                    onChange={(e) => updateField("iban", e.target.value)}
                    placeholder="QA55QNBA0000000012345678901"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] font-mono placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">SWIFT / BIC Code</label>
                  <input
                    type="text"
                    value={config.swiftBic}
                    onChange={(e) => updateField("swiftBic", e.target.value)}
                    placeholder="QNBAQAQA"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] font-mono placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SubTab 4: FOOTER & SIGNATURE */}
          {activeSubTab === "FOOTER" && (
            <div className="p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{isAr ? "التوقيع والختم والشروط القانونية" : "Signatures, Official Stamp & Legal Terms"}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">Authorized Signatory Name</label>
                  <input
                    type="text"
                    value={config.authorizedSignatoryName}
                    onChange={(e) => updateField("authorizedSignatoryName", e.target.value)}
                    placeholder="Commercial Operations Director"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">Signatory Title</label>
                  <input
                    type="text"
                    value={config.authorizedSignatoryTitle}
                    onChange={(e) => updateField("authorizedSignatoryTitle", e.target.value)}
                    placeholder="Authorized Signatory — E3 Qatar"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <PDFImageUploader
                  label={isAr ? "صورة الختم الرسمي للشركة (PNG دائري مفرغ)" : "Official Company Seal / Stamp (Transparent PNG)"}
                  value={config.stampUrl}
                  onChange={(url) => updateField("stampUrl", url)}
                  placeholder="https://.../e3-official-stamp.png"
                  recommendedSize={isAr ? "صورة دائرية مفرغة بخلفية شفافة" : "Circular transparent PNG stamp"}
                  isAr={isAr}
                />

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showSignatureBlock}
                      onChange={(e) => updateField("showSignatureBlock", e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 cursor-pointer"
                    />
                    <span>{isAr ? "إظهار مربع التوقيع" : "Show Signature Block"}</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showStamp}
                      onChange={(e) => updateField("showStamp", e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 cursor-pointer"
                    />
                    <span>{isAr ? "إظهار الختم" : "Show Stamp"}</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">Standard Terms & Conditions Note (EN)</label>
                  <textarea
                    rows={2}
                    value={config.footerNotesEn}
                    onChange={(e) => updateField("footerNotesEn", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[var(--text-secondary)] font-medium block mb-1">الشروط والأحكام القياسية (بالعربية)</label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={config.footerNotesAr}
                    onChange={(e) => updateField("footerNotesAr", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Column */}
        <div className="xl:col-span-6">
          <div className="sticky top-6 p-6 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-level-2)]">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-primary)]">
                <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="font-bold">{isAr ? "معاينة مباشرة لعرض السعر وPDF" : "Live PDF Quotation Preview"}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                A4 Scaled Document
              </span>
            </div>

            {/* Live 1-Page A4 Quotation Sheet Preview */}
            <div className="space-y-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-[var(--surface-hover)]/40 border border-[var(--border-level-1)] flex justify-center items-center">
                <A4QuotationSheet
                  config={config}
                  isInteractivePreview={true}
                  locale={locale}
                />
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block">
                    {isAr ? "تصدير المستند بصيغة PDF حقيقية (A4)" : "Direct Vector PDF Export"}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                    {isAr ? "ملف PDF متجهي عالي الدقة بقياس A4 قياسي بدون التقاط صور شاشة" : "True vector 1-page A4 document without screen captures"}
                  </span>
                </div>
                <QuotationPDFDownload
                  config={config}
                  data={{
                    quoteNumber: "QTE-2026-0842",
                    packageTitleEn: "VIP Birthday Celebration Package",
                    packageTitleAr: "باقة احتفال عيد الميلاد VIP الشاملة",
                    grandTotal: 3150,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
