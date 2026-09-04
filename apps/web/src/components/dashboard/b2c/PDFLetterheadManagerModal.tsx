"use client"

import { useState } from "react"
import { 
  Building, 
  Image as ImageIcon, 
  FileText, 
  CreditCard, 
  Check, 
  X, 
  Save, 
  RotateCcw, 
  Eye, 
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Palette
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

export interface PDFLetterheadConfig {
  // Company & Letterhead Header
  showCompanyLogo: boolean
  companyLogoUrl: string
  companyNameEn: string
  companyNameAr: string
  crNumber: string
  taxRegistrationNumber: string
  addressEn: string
  addressAr: string
  phone: string
  email: string
  website: string
  headerBannerColor: string
  showLetterheadBar: boolean

  // Venue Details
  showVenueDetails: boolean
  venueNameEn: string
  venueNameAr: string
  venueLogoUrl: string
  hallOrZoneEn: string
  hallOrZoneAr: string
  venueAddressEn: string
  venueAddressAr: string
  onSiteCoordinator: string
  coordinatorPhone: string

  // Banking & Payment Details
  showBankDetails: boolean
  bankName: string
  accountTitle: string
  iban: string
  swiftBic: string

  // Authorization & Footer
  showSignatureBlock: boolean
  authorizedSignatoryName: string
  authorizedSignatoryTitle: string
  showStamp: boolean
  stampUrl: string
  footerNotesEn: string
  footerNotesAr: string
}

export const DEFAULT_PDF_CONFIG: PDFLetterheadConfig = {
  showCompanyLogo: true,
  companyLogoUrl: "/images/e3-logo.png",
  companyNameEn: "E3 Entertainment & Experience LLC",
  companyNameAr: "شركة إي ثري للترفيه والتجارب ذ.م.م",
  crNumber: "CR-182940/QA",
  taxRegistrationNumber: "TIN-009841-QA",
  addressEn: "Doha, State of Qatar • Lusail Marina Tower, Floor 14",
  addressAr: "الدوحة، دولة قطر • برج لوسيل مارينا، الطابق ١٤",
  phone: "+974 4400 1234",
  email: "events@e3.qa",
  website: "www.e3.qa",
  headerBannerColor: "#002B49",
  showLetterheadBar: true,

  showVenueDetails: true,
  venueNameEn: "Bounce Qatar Freestyle Arena",
  venueNameAr: "باونس قطر - ساحة الفري ستايل",
  venueLogoUrl: "",
  hallOrZoneEn: "VIP Celebration Suite & Arena Zone A",
  hallOrZoneAr: "جناح الاحتفالات VIP وساحة الألعاب (أ)",
  venueAddressEn: "Tawar Mall, Ground Floor, Al Markhiya, Doha",
  venueAddressAr: "طوار مول، الطابق الأرضي، المرخية، الدوحة",
  onSiteCoordinator: "Event Operations Lead",
  coordinatorPhone: "+974 5599 8822",

  showBankDetails: true,
  bankName: "Qatar National Bank (QNB)",
  accountTitle: "E3 ENTERTAINMENT AND ATTRACTIONS W.L.L",
  iban: "QA55QNBA0000000012345678901",
  swiftBic: "QNBAQAQA",

  showSignatureBlock: true,
  authorizedSignatoryName: "Commercial Operations Director",
  authorizedSignatoryTitle: "Authorized Signatory — E3 Qatar",
  showStamp: true,
  stampUrl: "",
  footerNotesEn: "This quotation is valid for 14 days. A 50% advance deposit secures date and hall exclusivity. Governed by Qatar PDPL standards.",
  footerNotesAr: "يسري هذا العرض لمدة 14 يوماً. تأكيد الحجز وحصرية القاعة يتطلب سداد 50% كعربون مقدم. خاضع لمعايير حماية البيانات الشخصية في قطر."
}

interface PDFLetterheadManagerModalProps {
  isOpen: boolean
  onClose: () => void
  initialConfig?: Partial<PDFLetterheadConfig>
  onSave: (config: PDFLetterheadConfig) => void
  locale?: string
}

export function PDFLetterheadManagerModal({
  isOpen,
  onClose,
  initialConfig,
  onSave,
  locale = "en"
}: PDFLetterheadManagerModalProps) {
  const isAr = locale === "ar"
  const [activeTab, setActiveTab] = useState<"HEADER" | "VENUE" | "BANKING" | "FOOTER">("HEADER")
  const [config, setConfig] = useState<PDFLetterheadConfig>(() => ({
    ...DEFAULT_PDF_CONFIG,
    ...initialConfig
  }))
  const [savedSuccess, setSavedSuccess] = useState(false)

  if (!isOpen) return null

  const handleSave = () => {
    onSave(config)
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      onClose()
    }, 600)
  }

  const handleResetDefaults = () => {
    if (confirm(isAr ? "هل أنت متأكد من استعادة الإعدادات الافتراضية للترويسة الرسمية؟" : "Reset letterhead settings to official E3 defaults?")) {
      setConfig({ ...DEFAULT_PDF_CONFIG })
    }
  }

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[var(--surface-default)] rounded-3xl border border-[var(--border-level-2)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[var(--text-primary)]"
      >
        {/* Modal Top Header */}
        <div className="p-6 border-b border-[var(--border-level-2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface-hover)]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--e3-royal-blue)] text-white flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">
                  {isAr ? "محرر الترويسة وتفاصيل PDF الرسمية" : "Quotation PDF & Letterhead Manager"}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold uppercase">
                  Branding Engine
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {isAr
                  ? "تخصيص شعار الشركة، ترويسة الخطاب، تفاصيل القاعة والوجهة، بيانات التحويل البنكي، والختم الرسمي."
                  : "Customize company emblem, official letterhead, venue specs, Qatar IBAN banking details, and authorized seal."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="text-xs gap-1.5 cursor-pointer"
              title="Reset to default E3 layout"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isAr ? "استعادة الافتراضي" : "Reset Defaults"}
            </Button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-[var(--border-level-2)] bg-[var(--surface-default)] overflow-x-auto scrollbar-none">
          {[
            { id: "HEADER", labelEn: "1. Company & Letterhead", labelAr: "١. الشركة والترويسة", icon: Building },
            { id: "VENUE", labelEn: "2. Venue & Room Details", labelAr: "٢. الوجهة والقاعة", icon: MapPin },
            { id: "BANKING", labelEn: "3. Banking & IBAN", labelAr: "٣. البيانات البنكية", icon: CreditCard },
            { id: "FOOTER", labelEn: "4. Signatures, Stamp & Footer", labelAr: "٤. التوقيع والختم", icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  isActive
                    ? "border-[var(--e3-royal-blue)] text-[var(--e3-royal-blue)] font-black"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          {/* TAB 1: COMPANY & LETTERHEAD */}
          {activeTab === "HEADER" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "اسم الشركة (الإنجليزية)" : "Company Legal Name (English)"}
                  </label>
                  <input
                    type="text"
                    value={config.companyNameEn}
                    onChange={e => setConfig({ ...config, companyNameEn: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "اسم الشركة (العربية)" : "Company Legal Name (Arabic)"}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={config.companyNameAr}
                    onChange={e => setConfig({ ...config, companyNameAr: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] font-arabic text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "رابط الشعار الرسمي (Logo URL)" : "Company Logo URL"}
                  </label>
                  <input
                    type="text"
                    value={config.companyLogoUrl}
                    onChange={e => setConfig({ ...config, companyLogoUrl: e.target.value })}
                    placeholder="/images/e3-logo.png or https://..."
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "لون شريط الترويسة العلوي (Header Color)" : "Top Letterhead Banner Color"}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.headerBannerColor}
                      onChange={e => setConfig({ ...config, headerBannerColor: e.target.value })}
                      className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={config.headerBannerColor}
                      onChange={e => setConfig({ ...config, headerBannerColor: e.target.value })}
                      className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--text-primary)]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "رقم السجل التجاري في قطر (CR No.)" : "Qatar Commercial Registration (CR No.)"}
                  </label>
                  <input
                    type="text"
                    value={config.crNumber}
                    onChange={e => setConfig({ ...config, crNumber: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "الرقم الضريبي أو ترخيص وزارة التجارة (Tax/TIN No.)" : "Tax Registration / Ministry License"}
                  </label>
                  <input
                    type="text"
                    value={config.taxRegistrationNumber}
                    onChange={e => setConfig({ ...config, taxRegistrationNumber: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "هاتف الفعاليات المباشر" : "Direct Hotline"}
                  </label>
                  <input
                    type="text"
                    value={config.phone}
                    onChange={e => setConfig({ ...config, phone: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "البريد الإلكتروني للفعاليات" : "Events Official Email"}
                  </label>
                  <input
                    type="email"
                    value={config.email}
                    onChange={e => setConfig({ ...config, email: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "الموقع الإلكتروني" : "Official Website"}
                  </label>
                  <input
                    type="text"
                    value={config.website}
                    onChange={e => setConfig({ ...config, website: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "العنوان الرسمي (الإنجليزية)" : "Office Address (English)"}
                  </label>
                  <input
                    type="text"
                    value={config.addressEn}
                    onChange={e => setConfig({ ...config, addressEn: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "العنوان الرسمي (العربية)" : "Office Address (Arabic)"}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={config.addressAr}
                    onChange={e => setConfig({ ...config, addressAr: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] font-arabic text-right"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-3 border-t border-[var(--border-level-2)] flex flex-wrap items-center gap-6 text-xs font-bold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showCompanyLogo}
                    onChange={e => setConfig({ ...config, showCompanyLogo: e.target.checked })}
                    className="w-4 h-4 rounded text-[var(--e3-royal-blue)]"
                  />
                  <span>{isAr ? "إظهار شعار الشركة في الرأس" : "Display Company Logo in Header"}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showLetterheadBar}
                    onChange={e => setConfig({ ...config, showLetterheadBar: e.target.checked })}
                    className="w-4 h-4 rounded text-[var(--e3-royal-blue)]"
                  />
                  <span>{isAr ? "إظهار شريط الترويسة الملون" : "Show Top Accent Stripe"}</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: VENUE & ROOM DETAILS */}
          {activeTab === "VENUE" && (
            <div className="space-y-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold mb-4">
                <input
                  type="checkbox"
                  checked={config.showVenueDetails}
                  onChange={e => setConfig({ ...config, showVenueDetails: e.target.checked })}
                  className="w-4 h-4 rounded text-[var(--e3-royal-blue)]"
                />
                <span>{isAr ? "تضمين بطاقة تفاصيل الوجهة والقاعة في عرض السعر المطبوع" : "Include Venue & Hall Details Card on Quotation PDF"}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "اسم الوجهة المستضيفة (EN)" : "Attraction Venue Name (EN)"}
                  </label>
                  <input
                    type="text"
                    value={config.venueNameEn}
                    onChange={e => setConfig({ ...config, venueNameEn: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "اسم الوجهة المستضيفة (AR)" : "Attraction Venue Name (AR)"}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={config.venueNameAr}
                    onChange={e => setConfig({ ...config, venueNameAr: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] font-arabic text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "القاعة أو الجناح المحجوز (EN)" : "Designated Hall / Arena Suite (EN)"}
                  </label>
                  <input
                    type="text"
                    value={config.hallOrZoneEn}
                    onChange={e => setConfig({ ...config, hallOrZoneEn: e.target.value })}
                    placeholder="e.g. VIP Party Suite 1"
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "القاعة أو الجناح المحجوز (AR)" : "Designated Hall / Arena Suite (AR)"}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={config.hallOrZoneAr}
                    onChange={e => setConfig({ ...config, hallOrZoneAr: e.target.value })}
                    placeholder="مثال: جناح كبار الشخصيات ١"
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] font-arabic text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "عنوان وبوابة الوجهة (EN)" : "Venue Physical Address & Gate (EN)"}
                  </label>
                  <input
                    type="text"
                    value={config.venueAddressEn}
                    onChange={e => setConfig({ ...config, venueAddressEn: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "عنوان وبوابة الوجهة (AR)" : "Venue Physical Address & Gate (AR)"}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={config.venueAddressAr}
                    onChange={e => setConfig({ ...config, venueAddressAr: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] font-arabic text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "منسق الفعالية الميداني" : "On-Site Event Coordinator"}
                  </label>
                  <input
                    type="text"
                    value={config.onSiteCoordinator}
                    onChange={e => setConfig({ ...config, onSiteCoordinator: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "هاتف المنسق للطوارئ والترتيبات" : "Coordinator Contact Phone"}
                  </label>
                  <input
                    type="text"
                    value={config.coordinatorPhone}
                    onChange={e => setConfig({ ...config, coordinatorPhone: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BANKING & IBAN */}
          {activeTab === "BANKING" && (
            <div className="space-y-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold mb-4">
                <input
                  type="checkbox"
                  checked={config.showBankDetails}
                  onChange={e => setConfig({ ...config, showBankDetails: e.target.checked })}
                  className="w-4 h-4 rounded text-[var(--e3-royal-blue)]"
                />
                <span>{isAr ? "إظهار تعليمات التحويل البنكي وحساب IBAN في المستند" : "Show Bank Transfer Instructions & IBAN on Proposal"}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "اسم البنك في قطر" : "Bank Name"}
                  </label>
                  <input
                    type="text"
                    value={config.bankName}
                    onChange={e => setConfig({ ...config, bankName: e.target.value })}
                    placeholder="e.g. Qatar National Bank (QNB)"
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "اسم المستفيد / الحساب" : "Account Beneficiary Title"}
                  </label>
                  <input
                    type="text"
                    value={config.accountTitle}
                    onChange={e => setConfig({ ...config, accountTitle: e.target.value })}
                    placeholder="E3 Entertainment LLC"
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "رقم الآيبان (Qatar IBAN)" : "Qatar IBAN (International Bank Account Number)"}
                  </label>
                  <input
                    type="text"
                    value={config.iban}
                    onChange={e => setConfig({ ...config, iban: e.target.value })}
                    placeholder="QA55 QNBA 0000 0000 1234 5678 901"
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "رمز السويفت (SWIFT / BIC)" : "SWIFT / BIC Code"}
                  </label>
                  <input
                    type="text"
                    value={config.swiftBic}
                    onChange={e => setConfig({ ...config, swiftBic: e.target.value })}
                    placeholder="QNBAQAQA"
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400">
                <strong>{isAr ? "ملاحظة الدفع المقدم:" : "Deposit Policy Note:"}</strong>{" "}
                {isAr
                  ? "يُرجى تزويد العميل برقم عرض السعر كمرجع عند إجراء التحويل البنكي لتسريع مطابقة الدفعة المقدمة (50%)."
                  : "Instruct customers to quote the QT reference number in payment descriptions for automated deposit reconciliation."}
              </div>
            </div>
          )}

          {/* TAB 4: SIGNATURES, STAMP & FOOTER */}
          {activeTab === "FOOTER" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "المفوض بالتوقيع" : "Authorized Signatory Name"}
                  </label>
                  <input
                    type="text"
                    value={config.authorizedSignatoryName}
                    onChange={e => setConfig({ ...config, authorizedSignatoryName: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "المسمى الوظيفي للمفوض" : "Signatory Official Title"}
                  </label>
                  <input
                    type="text"
                    value={config.authorizedSignatoryTitle}
                    onChange={e => setConfig({ ...config, authorizedSignatoryTitle: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                    {isAr ? "رابط الختم الرسمي للشركة (Stamp Image URL)" : "Official Company Stamp URL"}
                  </label>
                  <input
                    type="text"
                    value={config.stampUrl}
                    onChange={e => setConfig({ ...config, stampUrl: e.target.value })}
                    placeholder="/images/e3-official-stamp.png or https://..."
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div className="flex items-center gap-6 pt-6 text-xs font-bold">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showSignatureBlock}
                      onChange={e => setConfig({ ...config, showSignatureBlock: e.target.checked })}
                      className="w-4 h-4 rounded text-[var(--e3-royal-blue)]"
                    />
                    <span>{isAr ? "إظهار مربع التوقيع" : "Show Signature Line"}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showStamp}
                      onChange={e => setConfig({ ...config, showStamp: e.target.checked })}
                      className="w-4 h-4 rounded text-[var(--e3-royal-blue)]"
                    />
                    <span>{isAr ? "إظهار ختم الشركة" : "Show Company Seal"}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "ملاحظة التذييل والشروط (الإنجليزية)" : "Footer Terms & Conditions Notice (English)"}
                </label>
                <textarea
                  rows={2}
                  value={config.footerNotesEn}
                  onChange={e => setConfig({ ...config, footerNotesEn: e.target.value })}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl p-3 text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                  {isAr ? "ملاحظة التذييل والشروط (العربية)" : "Footer Terms & Conditions Notice (Arabic)"}
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={config.footerNotesAr}
                  onChange={e => setConfig({ ...config, footerNotesAr: e.target.value })}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-level-2)] rounded-xl p-3 text-xs text-[var(--text-primary)] font-arabic text-right"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-5 border-t border-[var(--border-level-2)] bg-[var(--surface-hover)]/30 flex items-center justify-between gap-4">
          <span className="text-xs text-[var(--text-tertiary)] font-mono">
            {isAr ? "تنطبق الإعدادات فوراً على تصدير PDF والطباعة" : "Changes apply immediately to PDF prints and client links"}
          </span>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-bold">
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="gap-2 text-xs font-bold bg-[var(--e3-royal-blue)] hover:bg-[var(--e3-royal-blue)]/90 text-white shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              {savedSuccess ? (isAr ? "تم الحفظ بنجاح!" : "Saved!") : (isAr ? "حفظ وتطبيق على العرض" : "Apply to Quotation")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
