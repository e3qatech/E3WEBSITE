"use client"

import React, { useState } from "react"
import { PDFLetterheadConfig, DEFAULT_PDF_CONFIG } from "./PDFLetterheadManagerModal"
import { User, Building, Calendar, Phone, Mail, MapPin, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react"

export interface A4QuotationData {
  quoteNumber?: string
  createdAt?: string | Date
  validUntil?: string | Date
  customerName?: string
  companyOrOrg?: string
  customerEmail?: string
  customerPhone?: string
  title?: string
  packageTitleEn?: string
  packageTitleAr?: string
  venueNameEn?: string
  venueNameAr?: string
  eventDate?: string | Date
  guestCount?: number
  items?: Array<{
    titleEn: string
    titleAr?: string
    itemType?: string
    quantity?: number
    unitPrice?: number
    totalPrice?: number
  }>
  subtotal?: number
  discountTotal?: number
  grandTotal?: number
  depositAmount?: number
  currency?: string
}

interface A4QuotationSheetProps {
  config?: Partial<PDFLetterheadConfig>
  data?: A4QuotationData
  locale?: string
  isInteractivePreview?: boolean
}

export function A4QuotationSheet({
  config: partialConfig,
  data,
  locale = "en",
  isInteractivePreview = false,
}: A4QuotationSheetProps) {
  const isAr = locale === "ar"
  const config: PDFLetterheadConfig = {
    ...DEFAULT_PDF_CONFIG,
    ...partialConfig,
  }

  const [companyLogoError, setCompanyLogoError] = useState(false)
  const [venueLogoError, setVenueLogoError] = useState(false)
  const [stampError, setStampError] = useState(false)

  // Fallback / mock data if not passed (e.g. inside settings preview)
  const quoteNumber = data?.quoteNumber || "QTE-2026-0842"
  const createdDate = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString(isAr ? "ar-QA" : "en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Sep 04, 2026"
  const validDate = data?.validUntil
    ? new Date(data.validUntil).toLocaleDateString(isAr ? "ar-QA" : "en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Sep 18, 2026"

  const customerName = data?.customerName || "Maryam Al-Kuwari"
  const companyOrOrg = data?.companyOrOrg || "Al-Maha Academy / Private Celebration"
  const customerEmail = data?.customerEmail || "maryam.kuwari@example.qa"
  const customerPhone = data?.customerPhone || "+974 5511 2233"

  const packageTitle = isAr
    ? (data?.packageTitleAr || data?.packageTitleEn || "باقة احتفال عيد الميلاد VIP الشاملة")
    : (data?.packageTitleEn || "VIP Celebration & Birthday Arena Package")

  const venueTitle = isAr
    ? (data?.venueNameAr || config.venueNameAr || config.venueNameEn)
    : (data?.venueNameEn || config.venueNameEn)

  const hallTitle = isAr
    ? (config.hallOrZoneAr || config.hallOrZoneEn)
    : config.hallOrZoneEn

  const currency = data?.currency || "QAR"
  const items = data?.items && data.items.length > 0 ? data.items : [
    { titleEn: "VIP Birthday Celebration Suite (2 Hours Private Access)", titleAr: "جناح أعياد الميلاد VIP (ساعتان حصرية)", itemType: "PACKAGE_TIER", quantity: 1, unitPrice: 2200, totalPrice: 2200 },
    { titleEn: "Guest Pass Package Allocation (20 Participants)", titleAr: "تذاكر الدخول المشمولة (20 مشارك)", itemType: "INCLUSION", quantity: 20, unitPrice: 0, totalPrice: 0 },
    { titleEn: "Custom Themed Cake Ceremony & Dedicated Animator Host", titleAr: "مراسم كعكة الحفل ومضيف ترفيهي معتمد", itemType: "ADDON", quantity: 1, unitPrice: 650, totalPrice: 650 },
    { titleEn: "Grip Socks & Commemorative Birthday Medals (20 Pairs)", titleAr: "جوارب مانعة للانزلاق وميداليات تذكارية", itemType: "ADDON", quantity: 20, unitPrice: 20, totalPrice: 400 },
  ]

  const total = data?.grandTotal ?? items.reduce((sum, it) => sum + (it.totalPrice ?? (it.unitPrice || 0) * (it.quantity || 1)), 0)
  const deposit = data?.depositAmount ?? Math.round(total * 0.5)

  return (
    <div
      className={`a4-quotation-sheet bg-white text-zinc-900 border border-zinc-200 shadow-xl print:shadow-none print:border-none relative flex flex-col justify-between select-none ${
        isInteractivePreview
          ? "rounded-2xl p-5 text-[11px] max-w-full overflow-hidden"
          : "p-8 text-xs min-h-[297mm] max-h-[297mm] w-full max-w-[210mm] mx-auto print:p-6"
      }`}
      style={{
        boxSizing: "border-box",
        pageBreakAfter: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      {/* Top Accent Ribbon Bar */}
      {config.showLetterheadBar && (
        <div
          className="absolute top-0 start-0 end-0 h-2 print:h-2"
          style={{ backgroundColor: config.headerBannerColor || "#002B49" }}
        />
      )}

      {/* 1. Header: Company & Venue Logos, Legal Details, Ref */}
      <div className="border-b border-zinc-200 pb-3 mb-3 pt-1">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Company Logo & Identity */}
          <div className="flex items-center gap-3">
            {config.showCompanyLogo && (
              <div className="shrink-0 flex items-center">
                {config.companyLogoUrl && !companyLogoError ? (
                  <img
                    src={config.companyLogoUrl}
                    alt={config.companyNameEn || "E3"}
                    className="h-10 w-auto max-w-[130px] object-contain"
                    crossOrigin="anonymous"
                    onError={() => setCompanyLogoError(true)}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white font-black text-sm flex items-center justify-center shadow-md">
                    E3
                  </div>
                )}
              </div>
            )}

            <div>
              <h2 className="font-black text-sm leading-tight text-zinc-900 tracking-tight">
                {isAr ? (config.companyNameAr || config.companyNameEn) : config.companyNameEn}
              </h2>
              {config.companyNameAr && !isAr && (
                <p className="text-[9px] text-zinc-500 font-arabic leading-none mt-0.5">{config.companyNameAr}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-[8.5px] font-mono text-zinc-500 mt-0.5">
                {config.crNumber && <span>CR: {config.crNumber}</span>}
                {config.crNumber && config.taxRegistrationNumber && <span>•</span>}
                {config.taxRegistrationNumber && <span>TIN: {config.taxRegistrationNumber}</span>}
              </div>
            </div>
          </div>

          {/* Right: Venue Logo & Quotation Reference */}
          <div className="text-end shrink-0 flex items-center gap-4">
            {config.showVenueDetails && config.venueLogoUrl && !venueLogoError && (
              <div className="shrink-0 hidden sm:block">
                <img
                  src={config.venueLogoUrl}
                  alt={config.venueNameEn || "Venue"}
                  className="h-9 w-auto max-w-[110px] object-contain"
                  crossOrigin="anonymous"
                  onError={() => setVenueLogoError(true)}
                />
              </div>
            )}

            <div className="text-end font-mono">
              <span className="text-[8px] uppercase tracking-wider text-purple-700 font-bold block">
                {isAr ? "رقم عرض السعر الرسمي" : "Official Quotation Ref"}
              </span>
              <div className="text-xs font-black text-zinc-900">{quoteNumber}</div>
              <div className="text-[8.5px] text-zinc-500">
                <span>{isAr ? "تاريخ الإصدار:" : "Date:"} {createdDate}</span>
              </div>
              <div className="text-[8.5px] text-emerald-700 font-bold">
                <span>{isAr ? "صالح حتى:" : "Valid:"} {validDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Contact Bar */}
        <div className="mt-2 pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-[8.5px] font-mono text-zinc-600">
          <div>{isAr ? config.addressAr : config.addressEn}</div>
          <div className="flex items-center gap-3">
            {config.phone && <span>Tel: {config.phone}</span>}
            {config.email && <span>• Email: {config.email}</span>}
            {config.website && <span>• {config.website}</span>}
          </div>
        </div>
      </div>

      {/* 2. Recipient & Event Summary Box */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 mb-3 grid grid-cols-2 gap-3 text-[9.5px]">
        {/* Recipient */}
        <div className="space-y-0.5">
          <span className="text-[8px] font-mono uppercase text-zinc-400 font-bold block">
            {isAr ? "مقدم إلى (العميل):" : "Prepared Exclusively For:"}
          </span>
          <div className="font-bold text-zinc-900 text-[11px] flex items-center gap-1">
            <User className="w-3 h-3 text-purple-600 shrink-0" />
            <span>{customerName}</span>
          </div>
          {companyOrOrg && <div className="text-zinc-600">{companyOrOrg}</div>}
          <div className="text-zinc-500 font-mono text-[8.5px] flex items-center gap-2">
            <span>{customerEmail}</span>
            {customerPhone && <span>• {customerPhone}</span>}
          </div>
        </div>

        {/* Event & Venue */}
        <div className="space-y-0.5 text-end">
          <span className="text-[8px] font-mono uppercase text-zinc-400 font-bold block">
            {isAr ? "الوجهة والتاريخ:" : "Event Venue & Timing:"}
          </span>
          <div className="font-bold text-purple-950 text-[11px]">{packageTitle}</div>
          {config.showVenueDetails && (
            <div className="text-zinc-700 font-medium">
              <span>{venueTitle}</span>
              {hallTitle && <span className="text-zinc-500"> • {hallTitle}</span>}
            </div>
          )}
          <div className="text-[8.5px] font-mono text-zinc-500 flex items-center justify-end gap-2">
            {config.onSiteCoordinator && (
              <span>Coordinator: {config.onSiteCoordinator} ({config.coordinatorPhone})</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Itemized Investment Table */}
      <div className="rounded-xl border border-zinc-200 overflow-hidden mb-3">
        <table className="w-full text-start border-collapse text-[9.5px]">
          <thead>
            <tr className="bg-zinc-100/90 text-zinc-700 border-b border-zinc-200 font-mono uppercase text-[8px]">
              <th className="py-2 px-3 text-start">{isAr ? "البند / الخدمة المشمولة" : "Description of Services & Package Scope"}</th>
              <th className="py-2 px-2 text-center">{isAr ? "الكمية" : "Qty"}</th>
              <th className="py-2 px-3 text-end">{isAr ? "سعر الوحدة" : "Unit Price"}</th>
              <th className="py-2 px-3 text-end">{isAr ? "المجموع" : "Total (QAR)"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {items.map((it, idx) => {
              const rowTotal = it.totalPrice ?? (it.unitPrice || 0) * (it.quantity || 1)
              return (
                <tr key={idx} className="hover:bg-zinc-50/50">
                  <td className="py-2 px-3 font-medium text-zinc-900">
                    <div>{isAr ? (it.titleAr || it.titleEn) : it.titleEn}</div>
                    {it.itemType && (
                      <span className="text-[7.5px] font-mono uppercase text-zinc-400">
                        {it.itemType.replace("_", " ")}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-zinc-600">{it.quantity || 1}</td>
                  <td className="py-2 px-3 text-end font-mono text-zinc-600">
                    {(it.unitPrice || 0) === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase text-[7.5px]">Included</span>
                    ) : (
                      `${(it.unitPrice || 0).toLocaleString()} ${currency}`
                    )}
                  </td>
                  <td className="py-2 px-3 text-end font-mono font-bold text-zinc-900">
                    {rowTotal === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase text-[7.5px]">Included</span>
                    ) : (
                      `${rowTotal.toLocaleString()} ${currency}`
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            {/* Total Row */}
            <tr className="bg-zinc-50 border-t-2 border-zinc-200">
              <td colSpan={2} className="py-2 px-3 text-zinc-500 font-mono text-[8.5px]">
                {isAr ? "* شامل الرسوم وإشراف طاقم التنظيم" : "* Inclusive of operational staffing, insurance & coordination"}
              </td>
              <td className="py-2 px-3 text-end font-mono text-[9px] uppercase font-bold text-zinc-700">
                {isAr ? "المجموع الإجمالي:" : "Grand Total:"}
              </td>
              <td className="py-2 px-3 text-end font-mono font-black text-sm text-purple-900">
                {total.toLocaleString()} {currency}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 4. Deposit & Payment Wire Box */}
      <div className="grid grid-cols-3 gap-3 rounded-xl border border-purple-200 bg-purple-50/40 p-2.5 mb-3 text-[9px]">
        {/* Deposit Required Highlight */}
        <div className="border-e border-purple-100 pe-2 flex flex-col justify-center">
          <span className="text-[8px] font-mono uppercase text-purple-700 font-bold block">
            {isAr ? "الدفعة المقدمة لتأكيد الحجز (50%):" : "Advance Deposit Required (50%):"}
          </span>
          <div className="text-sm font-black font-mono text-emerald-700">
            {deposit.toLocaleString()} {currency}
          </div>
          <span className="text-[7.5px] text-zinc-500 leading-tight mt-0.5">
            {isAr ? "يضمن حجز القاعة والوقت المطلوب" : "Secures hall exclusivity & date"}
          </span>
        </div>

        {/* Banking Transfer Instructions */}
        {config.showBankDetails && (
          <div className="col-span-2 space-y-0.5 font-mono text-[8.5px] ps-1">
            <span className="text-[8px] uppercase text-zinc-500 font-bold block">
              {isAr ? "بيانات التحويل البنكي المعتمد:" : "Wire Payment Details:"}
            </span>
            <div className="text-zinc-800 font-bold">
              {config.bankName} • {config.accountTitle}
            </div>
            <div className="text-purple-900 font-black tracking-wider text-[9px]">
              IBAN: {config.iban}
            </div>
            {config.swiftBic && (
              <div className="text-zinc-500 text-[8px]">
                SWIFT/BIC: {config.swiftBic}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Legal Terms, Signatures & Stamp */}
      <div className="border-t border-zinc-200 pt-2 flex items-end justify-between gap-4 text-[8px] leading-relaxed text-zinc-500">
        {/* Left: Terms & Policies */}
        <div className="max-w-[62%] space-y-1">
          <p className="font-bold text-zinc-700 uppercase tracking-wider text-[7.5px]">
            {isAr ? "الشروط والأحكام وسياسة الفعالية:" : "Terms, Booking Conditions & PDPL Notice:"}
          </p>
          <p className="text-zinc-600 line-clamp-3">
            {isAr ? config.footerNotesAr : config.footerNotesEn}
          </p>
          <p className="text-[7px] text-zinc-400 font-mono">
            E3 Experience Engineering LLC • Licensed by Ministry of Commerce and Industry • State of Qatar
          </p>
        </div>

        {/* Right: Signature & Stamp */}
        {config.showSignatureBlock && (
          <div className="text-center shrink-0 w-36 relative">
            {/* Stamp Overlay */}
            {config.showStamp && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none">
                {config.stampUrl && !stampError ? (
                  <img
                    src={config.stampUrl}
                    alt="Official Stamp"
                    className="w-14 h-14 object-contain rotate-6 opacity-90"
                    crossOrigin="anonymous"
                    onError={() => setStampError(true)}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-red-500/60 flex flex-col items-center justify-center text-red-600 font-bold uppercase rotate-12 bg-white/70 backdrop-blur-xs select-none shadow-xs">
                    <span className="text-[6px] tracking-widest font-black">E3 QATAR</span>
                    <span className="text-[5px] text-red-500">APPROVED</span>
                  </div>
                )}
              </div>
            )}

            {/* Signature Line */}
            <div className="w-full border-b border-zinc-400 pb-1 mb-1 mt-6">
              <span className="text-[7.5px] font-mono text-zinc-400 italic">Digitally Verified Document</span>
            </div>
            <p className="font-bold text-zinc-800 text-[8px] leading-none">{config.authorizedSignatoryName}</p>
            <p className="text-zinc-500 text-[7px] leading-none mt-0.5">{config.authorizedSignatoryTitle}</p>
          </div>
        )}
      </div>
    </div>
  )
}
