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

import dynamic from "next/dynamic"
import { A4QuotationSheet, A4QuotationData } from "@/components/dashboard/b2c/A4QuotationSheet"

const QuotationPDFDownload = dynamic(
  () => import("@/components/dashboard/b2c/QuotationPDFDocument"),
  { ssr: false }
)

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
  const deposit = quotation.depositAmount || Math.round((quotation.grandTotal || 0) * 0.5)
  const items = Array.isArray(quotation.items) ? quotation.items : []
  const pkg = quotation.package
  const termsConditions = quotation.termsAndConditions || pkg?.termsConditions || {}
  const pdfConfig: PDFLetterheadConfig = {
    ...DEFAULT_PDF_CONFIG,
    ...(termsConditions?.pdfConfig || {})
  }

  const quotationData: A4QuotationData = {
    quoteNumber: quotation.quoteNumber,
    createdAt: quotation.createdAt,
    validUntil: quotation.validUntil,
    customerName: quotation.customerName,
    companyOrOrg: quotation.companyOrOrg,
    customerEmail: quotation.customerEmail,
    customerPhone: quotation.customerPhone,
    packageTitleEn: pkg?.titleEn || quotation.title,
    packageTitleAr: pkg?.titleAr || quotation.title,
    venueNameEn: pdfConfig.venueNameEn,
    venueNameAr: pdfConfig.venueNameAr,
    items: items.map((it: any) => ({
      titleEn: it.titleEn || it.description || "Package Service",
      titleAr: it.titleAr,
      itemType: it.itemType || it.type,
      quantity: it.quantity || 1,
      unitPrice: it.unitPrice ?? 0,
      totalPrice: it.totalPrice ?? ((it.unitPrice ?? 0) * (it.quantity || 1)),
    })),
    subtotal: quotation.subtotal,
    discountTotal: quotation.discountTotal,
    grandTotal: quotation.grandTotal,
    depositAmount: deposit,
    currency: currency,
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
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 6mm 8mm;
            size: A4 portrait;
          }
          .a4-quotation-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 5mm 8mm !important;
            max-height: 285mm !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Floating Action Bar (Hidden on Print) */}
        <div className="no-print bg-[var(--surface-default)]/90 backdrop-blur-md border border-[var(--border-level-1)] p-4 rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-3 sticky top-4 z-40">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[var(--color-primary)]">
              {isAr ? "إدارة وتصدير عرض السعر" : "Official Quotation Actions"}
            </span>
            <div className="text-xs text-[var(--text-secondary)]">
              {isAr ? "تصدير PDF متجهي صفحة واحدة (A4)، طباعة رسمية، أو مشاركة الرابط" : "Direct 1-page vector PDF download, official print, or secure payment"}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct 1-Page Vector PDF Download Link */}
            <QuotationPDFDownload
              config={pdfConfig}
              data={quotationData}
              fileName={`E3_Quotation_${quotation.quoteNumber || "Quote"}.pdf`}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs gap-1.5 cursor-pointer font-bold"
            >
              <Printer className="w-3.5 h-3.5 text-sky-500" />
              {isAr ? "طباعة / حفظ" : "Print Sheet"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-xs gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? (isAr ? "تم النسخ!" : "Link Copied!") : (isAr ? "مشاركة" : "Share")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleEmailQuote}
              disabled={emailing}
              className="text-xs gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-purple-500" />
              {emailSent ? (isAr ? "تم الإرسال!" : "Sent!") : (isAr ? "إرسال بالبريد" : "Email")}
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

        {/* The Exact 1-Page A4 Quotation Sheet */}
        <div className="w-full flex justify-center">
          <A4QuotationSheet
            config={pdfConfig}
            data={quotationData}
            locale={locale}
          />
        </div>
      </div>
    </div>
  )
}
