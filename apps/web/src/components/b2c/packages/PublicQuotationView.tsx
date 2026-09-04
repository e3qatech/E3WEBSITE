"use client"

import { useState } from "react"
import { 
  Download, 
  Share2, 
  Mail, 
  CreditCard, 
  Check, 
  Calendar, 
  User, 
  Building, 
  ShieldCheck, 
  FileText,
  AlertCircle,
  Clock,
  Printer,
  Building2,
  PhoneCall,
  Stamp
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { PDFLetterheadConfig, DEFAULT_PDF_CONFIG } from "@/components/dashboard/b2c/PDFLetterheadManagerModal"

export interface PublicQuotationViewProps {
  quotation: any
  locale: string
}

export function PublicQuotationView({ quotation, locale }: PublicQuotationViewProps) {
  const isAr = locale === "ar"
  const dir = isAr ? "rtl" : "ltr"
  const [copied, setCopied] = useState(false)
  const [emailing, setEmailing] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const currency = quotation.currency || "QAR"
  const deposit = quotation.depositAmount || Math.round(quotation.grandTotal * 0.5)
  const items = Array.isArray(quotation.items) ? quotation.items : []
  const pkg = quotation.package
  const termsConditions = quotation.termsAndConditions || pkg?.termsConditions || {}
  const pdfConfig: PDFLetterheadConfig = {
    ...DEFAULT_PDF_CONFIG,
    ...(termsConditions?.pdfConfig || {})
  }

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      const url = window.location.href
      if (navigator.share) {
        try {
          await navigator.share({
            title: isAr ? `عرض سعر إي ثري - ${quotation.quoteNumber}` : `E3 Qatar Quotation - ${quotation.quoteNumber}`,
            text: isAr ? `عرض سعر رسمي لباقة الفعاليات ${pkg?.titleAr || pkg?.titleEn || ""}` : `Official experience quotation for ${pkg?.titleEn || ""}`,
            url
          })
          return
        } catch {
          // fallback to clipboard
        }
      }
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleEmailQuote = async () => {
    setEmailing(true)
    setEmailError(null)
    try {
      const res = await fetch(`/api/b2c/quotations/${quotation.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: quotation.customerEmail,
          locale
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send email")
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 4000)
    } catch (err: any) {
      setEmailError(err?.message || (isAr ? "فشل إرسال البريد الإلكتروني" : "Failed to dispatch email"))
    } finally {
      setEmailing(false)
    }
  }

  const handlePayDeposit = () => {
    setPaying(true)
    // Simulate payment gateway redirect / checkout invocation
    setTimeout(() => {
      setPaying(false)
      setPaymentSuccess(true)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-level-0)] text-[var(--text-primary)] font-poppins py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white print:text-slate-900" dir={dir}>
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: #0f172a !important;
          }
          .no-print {
            display: none !important;
          }
          .print-border {
            border: 1px solid #cbd5e1 !important;
          }
          .print-shadow-none {
            box-shadow: none !important;
          }
          @page {
            margin: 1.5cm;
            size: A4 portrait;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Floating Action Bar (Hidden on Print) */}
        <div className="no-print bg-[var(--surface-default)]/90 backdrop-blur-md border border-[var(--border-level-1)] p-4 rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-3 sticky top-4 z-40">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[var(--color-primary)]">
              {isAr ? "إدارة ومشاركة عرض السعر" : "Quotation Actions"}
            </span>
            <div className="text-xs text-[var(--text-secondary)]">
              {isAr ? "تحميل فوري بصيغة PDF، مشاركة الرابط، إرسال بالبريد، أو سداد الدفعة المقدمة" : "Download PDF, copy shareable link, email customer, or settle deposit"}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs gap-1.5 cursor-pointer font-bold"
            >
              <Printer className="w-3.5 h-3.5 text-sky-500" />
              {isAr ? "تحميل PDF / طباعة" : "Download PDF / Print"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-xs gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? (isAr ? "تم نسخ الرابط!" : "Link Copied!") : (isAr ? "مشاركة الرابط" : "Share Link")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleEmailQuote}
              disabled={emailing}
              className="text-xs gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-purple-500" />
              {emailSent ? (isAr ? "تم الإرسال بالبريد!" : "Email Dispatched!") : (isAr ? "إرسال إلى بريدي" : "Email Quote")}
            </Button>

            <Button
              size="sm"
              onClick={handlePayDeposit}
              disabled={paying || paymentSuccess}
              className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md"
            >
              <CreditCard className="w-3.5 h-3.5" />
              {paymentSuccess
                ? (isAr ? "تم تسجيل الدفعة!" : "Deposit Recorded!")
                : (isAr ? `سداد الدفعة (${deposit.toLocaleString()} ${currency})` : `Pay Deposit (${deposit.toLocaleString()} ${currency})`)
              }
            </Button>
          </div>
        </div>

        {emailError && (
          <div className="no-print p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{emailError}</span>
          </div>
        )}

        {paymentSuccess && (
          <div className="no-print p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 shrink-0" />
              <span>
                {isAr
                  ? "شكراً لك! تم استلام طلب سداد الدفعة المقدمة بنجاح وسيتم إشعار مسؤول الفعاليات فوراً."
                  : "Thank you! Deposit payment request confirmed. Our event director has been notified."}
              </span>
            </div>
          </div>
        )}

        {/* The Printable Quotation Document Paper */}
        <div className="bg-[var(--surface-default)] print:bg-white border border-[var(--border-level-1)] rounded-3xl p-6 sm:p-10 shadow-xl print:shadow-none print:border-none space-y-8 overflow-hidden relative">
          {/* Top Letterhead Color Accent Bar */}
          {pdfConfig.showLetterheadBar && (
            <div 
              className="absolute top-0 start-0 end-0 h-2.5 print:h-2"
              style={{ backgroundColor: pdfConfig.headerBannerColor || "#002B49" }}
            />
          )}

          {/* Header Banner & Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[var(--border-level-1)] pb-6 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {pdfConfig.showCompanyLogo && (
                  pdfConfig.companyLogoUrl ? (
                    <img 
                      src={pdfConfig.companyLogoUrl} 
                      alt={pdfConfig.companyNameEn} 
                      className="h-10 w-auto object-contain rounded-lg"
                      onError={e => {
                        (e.target as HTMLElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-[var(--e3-royal-blue)] text-white flex items-center justify-center font-black text-base shadow-md">
                      E3
                    </div>
                  )
                )}
                <div>
                  <div className="font-black text-lg sm:text-xl tracking-tight text-[var(--text-primary)]">
                    {isAr ? (pdfConfig.companyNameAr || pdfConfig.companyNameEn) : pdfConfig.companyNameEn}
                  </div>
                  <div className="text-[11px] font-mono text-[var(--text-secondary)]">
                    {pdfConfig.crNumber && <span>{pdfConfig.crNumber}</span>}
                    {pdfConfig.crNumber && pdfConfig.taxRegistrationNumber && <span> • </span>}
                    {pdfConfig.taxRegistrationNumber && <span>{pdfConfig.taxRegistrationNumber}</span>}
                  </div>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] pt-1">
                {quotation.title || (isAr ? "عرض سعر ومقترح باقة الفعاليات" : "Official Experience Quotation")}
              </h1>

              <div className="text-xs text-[var(--text-secondary)] font-medium space-y-0.5">
                <div>{isAr ? pdfConfig.addressAr : pdfConfig.addressEn}</div>
                <div className="font-mono text-[11px] flex flex-wrap items-center gap-3">
                  <span>Tel: {pdfConfig.phone}</span>
                  <span>•</span>
                  <span>Email: {pdfConfig.email}</span>
                  <span>•</span>
                  <span>{pdfConfig.website}</span>
                </div>
              </div>
            </div>

            <div className="text-start sm:text-end space-y-1 shrink-0">
              <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)] block">
                {isAr ? "رقم عرض السعر" : "Quotation Ref"}
              </span>
              <div className="text-base sm:text-lg font-mono font-black text-[var(--color-primary)]">
                {quotation.quoteNumber}
              </div>
              <div className="text-xs text-[var(--text-secondary)] font-mono">
                {isAr ? "تاريخ الإصدار:" : "Date:"} {new Date(quotation.createdAt).toLocaleDateString(isAr ? "ar-QA" : "en-US")}
              </div>
              <div className="text-xs text-amber-500 font-mono font-bold">
                {isAr ? "صالح حتى:" : "Valid Until:"} {new Date(quotation.validUntil).toLocaleDateString(isAr ? "ar-QA" : "en-US")}
              </div>
            </div>
          </div>

          {/* Recipient & Event Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[var(--bg-level-1)] print:bg-slate-50 border border-[var(--border-level-1)]">
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)] block font-bold">
                {isAr ? "العميل / الجهة المستفيدة" : "Prepared For"}
              </span>
              <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                {quotation.customerName}
              </div>
              {quotation.companyOrOrg && (
                <div className="text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  {quotation.companyOrOrg}
                </div>
              )}
              <div className="text-[var(--text-secondary)] font-mono">{quotation.customerEmail}</div>
              {quotation.customerPhone && (
                <div className="text-[var(--text-secondary)] font-mono">{quotation.customerPhone}</div>
              )}
            </div>

            <div className="space-y-1 text-xs sm:text-end">
              <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)] block font-bold">
                {isAr ? "تفاصيل الباقة والوجهة" : "Package & Venue"}
              </span>
              <div className="text-sm font-bold text-[var(--text-primary)]">
                {pkg ? (isAr ? (pkg.titleAr || pkg.titleEn) : pkg.titleEn) : (isAr ? "باقة احتفال مخصصة" : "Custom Experience")}
              </div>
              {pkg?.attraction && (
                <div className="text-[var(--text-secondary)]">
                  {isAr ? (pkg.attraction.nameAr || pkg.attraction.nameEn) : pkg.attraction.nameEn}
                </div>
              )}
              {quotation.eventDate && (
                <div className="text-[var(--color-primary)] font-mono font-bold flex items-center sm:justify-end gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(quotation.eventDate).toLocaleDateString(isAr ? "ar-QA" : "en-US")}
                </div>
              )}
              <div className="text-[var(--text-tertiary)] text-[11px]">
                {isAr ? "حالة العرض:" : "Status:"} <span className="font-bold uppercase text-emerald-500">{quotation.status}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden rounded-2xl border border-[var(--border-level-1)]">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-level-1)] bg-[var(--surface-hover)]/60 print:bg-slate-100 text-[10px] font-mono uppercase text-[var(--text-secondary)]">
                  <th className="p-3.5 text-start">{isAr ? "البند / الخدمة المشمولة" : "Item Description"}</th>
                  <th className="p-3.5 text-center">{isAr ? "النوع" : "Type"}</th>
                  <th className="p-3.5 text-center">{isAr ? "الكمية" : "Qty"}</th>
                  <th className="p-3.5 text-end">{isAr ? "سعر الوحدة" : "Unit Price"}</th>
                  <th className="p-3.5 text-end">{isAr ? "الإجمالي" : "Line Total"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-level-1)]">
                {items.length > 0 ? (
                  items.map((it: any, idx: number) => (
                    <tr key={it.id || idx} className="hover:bg-[var(--surface-hover)]/30 print:hover:bg-transparent transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-[var(--text-primary)]">
                          {isAr ? (it.titleAr || it.titleEn) : it.titleEn}
                        </div>
                        {(it.descriptionEn || it.descriptionAr) && (
                          <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                            {isAr ? (it.descriptionAr || it.descriptionEn) : it.descriptionEn}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[var(--surface-hover)] text-[var(--text-secondary)]">
                          {it.itemType || "ITEM"}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-semibold">{it.quantity}</td>
                      <td className="p-3.5 text-end font-mono text-[var(--text-secondary)]">
                        {it.unitPrice.toLocaleString()} {currency}
                      </td>
                      <td className="p-3.5 text-end font-mono font-bold text-[var(--text-primary)]">
                        {(it.totalPrice || it.unitPrice * it.quantity).toLocaleString()} {currency}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-xs text-[var(--text-tertiary)]">
                      {isAr ? "لا توجد بنود مفصلة" : "No itemized rows found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals & Deposit Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center p-6 rounded-2xl bg-[var(--bg-level-1)] print:bg-slate-50 border border-[var(--border-level-1)]">
            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center justify-between">
                <span>{isAr ? "المجموع الفرعي:" : "Subtotal:"}</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {quotation.subtotal.toLocaleString()} {currency}
                </span>
              </div>
              {quotation.discountTotal > 0 && (
                <div className="flex items-center justify-between text-rose-500">
                  <span>{isAr ? "الخصم المطبق:" : "Discount Applied:"}</span>
                  <span className="font-mono font-bold">
                    -{quotation.discountTotal.toLocaleString()} {currency}
                  </span>
                </div>
              )}
              {quotation.taxTotal > 0 && (
                <div className="flex items-center justify-between">
                  <span>{isAr ? "الضرائب / الرسوم:" : "Taxes / Fees:"}</span>
                  <span className="font-mono font-bold">
                    +{quotation.taxTotal.toLocaleString()} {currency}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-[var(--border-level-1)] flex items-center justify-between text-amber-500 font-bold">
                <span>{isAr ? "الدفعة المقدمة المطلوبة (٥٠٪):" : "Deposit Required (50%):"}</span>
                <span className="font-mono font-black text-sm">
                  {deposit.toLocaleString()} {currency}
                </span>
              </div>
            </div>

            <div className="sm:border-s sm:border-[var(--border-level-1)] sm:ps-6 text-start sm:text-end space-y-1">
              <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)] block font-bold">
                {isAr ? "المبلغ الإجمالي النهائي" : "Total Proposal Value"}
              </span>
              <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {quotation.grandTotal.toLocaleString()} {currency}
              </div>
              <p className="text-[10px] text-[var(--text-tertiary)]">
                {isAr ? "يشمل جميع البنود والتجهيزات المحددة أعلاه" : "Includes all line items and specified entertainment deliverables"}
              </p>
            </div>
          </div>

          {/* Venue Specific Terms & Conditions */}
          <div className="space-y-3 pt-4 border-t border-[var(--border-level-1)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {isAr ? "شروط وقواعد الوجهة وسياسة الإلغاء" : "Venue-Specific Conditions & Cancellation Terms"}
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-hover)]/40 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2 font-medium">
              <div>
                <strong>{isAr ? "قواعد الوجهة والسلامة:" : "Venue & Safety Rules:"}</strong>{" "}
                {termsConditions.venueRulesEn || quotation.termsEn || (isAr 
                  ? "يلتزم الحضور بتعليمات المشرفين، وارتداء الجوارب المانعة للانزلاق في مناطق اللعب الحركي. يُمنع إدخال الأطعمة الخارجية دون موافقة مسبقة."
                  : "All guests must follow on-site staff instructions and wear anti-slip socks in active play arenas. Outside catering requires prior management clearance.")
                }
              </div>

              <div>
                <strong>{isAr ? "سياسة الإلغاء والتعديل:" : "Cancellation Policy:"}</strong>{" "}
                {termsConditions.cancellationPolicyEn || (isAr
                  ? "يُسترد مبلغ الدفعة المقدمة بالكامل عند الإلغاء قبل ٧ أيام من موعد الفعالية. في حال الإلغاء خلال ٤٨ ساعة يُتاح إعادة الجدولة دون استرداد نقدي."
                  : "100% deposit refund for cancellations made 7+ days prior to event. Rescheduling permitted with 48 hours notice.")
                }
              </div>

              <div className="text-[11px] text-[var(--text-tertiary)] pt-1">
                {isAr
                  ? "تخضع كافة البيانات المسجلة لقانون حماية خصوصية البيانات الشخصية (PDPL) لدولة قطر."
                  : "All processing complies with the State of Qatar Personal Data Privacy Law (PDPL)."}
              </div>
            </div>
          </div>

          {/* Banking & Wire Transfer Instructions (If Enabled) */}
          {pdfConfig.showBankDetails && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[var(--surface-hover)]/40 border border-[var(--border-level-1)] text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? "تعليمات سداد الدفعة المقدمة والتحويل البنكي (QNB IBAN)" : "Official Banking & Wire Transfer Details (QNB Qatar)"}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[11px] pt-1">
                <div>
                  <span className="text-[10px] text-[var(--text-tertiary)] block uppercase">Bank Name</span>
                  <span className="font-bold text-[var(--text-primary)]">{pdfConfig.bankName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-tertiary)] block uppercase">Account Title</span>
                  <span className="font-bold text-[var(--text-primary)]">{pdfConfig.accountTitle}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-tertiary)] block uppercase">Qatar IBAN</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{pdfConfig.iban}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-tertiary)] block uppercase">SWIFT / BIC</span>
                  <span className="font-bold text-[var(--text-primary)]">{pdfConfig.swiftBic}</span>
                </div>
              </div>
            </div>
          )}

          {/* Signatures, Stamp & Approvals Block */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[var(--border-level-1)] text-xs text-[var(--text-secondary)]">
            <div className="space-y-3">
              <span className="font-bold block text-[var(--text-primary)]">
                {isAr ? "اعتماد مؤسسة إي ثري للترفيه:" : "Issued by E3 Qatar Events:"}
              </span>
              <div className="flex items-end gap-3 h-16 border-b border-dashed border-[var(--border-level-1)] pb-1">
                {pdfConfig.showStamp && (
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-[var(--e3-royal-blue)]/50 flex items-center justify-center text-[9px] font-mono text-[var(--e3-royal-blue)] font-bold text-center leading-tight uppercase">
                    E3 SEAL<br />QATAR
                  </div>
                )}
                <div>
                  <div className="font-bold text-xs text-[var(--text-primary)]">
                    {pdfConfig.authorizedSignatoryName}
                  </div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">
                    {pdfConfig.authorizedSignatoryTitle}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="font-bold block text-[var(--text-primary)]">
                {isAr ? "موافقة وتأكيد العميل:" : "Client Acceptance Signature:"}
              </span>
              <div className="h-16 border-b border-dashed border-[var(--border-level-1)] flex items-end font-mono text-[11px] text-[var(--text-tertiary)] pb-1">
                Customer Signature / Date
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="pt-2 text-[10px] text-[var(--text-tertiary)] text-center leading-relaxed font-mono">
            {isAr ? pdfConfig.footerNotesAr : pdfConfig.footerNotesEn}
          </div>
        </div>
      </div>
    </div>
  )
}
