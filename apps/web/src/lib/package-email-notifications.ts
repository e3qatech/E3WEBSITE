import { sendEmail, getNotificationTargetEmail } from "./email"

export interface PackageLeadNotificationPayload {
  leadId: string
  customerName: string
  email: string
  phone?: string | null
  packageTitle?: string | null
  leadType: string
  expectedGuests?: number | null
  preferredDate?: Date | string | null
  budgetRange?: string | null
  specialRequests?: string | null
  sourcePage?: string | null
  locale?: string
}

export interface PackageQuotationEmailPayload {
  quoteNumber: string
  customerName: string
  customerEmail: string
  packageTitle?: string | null
  grandTotal: number
  depositAmount?: number
  currency?: string
  validUntil?: Date | string | null
  viewUrl?: string
  paymentUrl?: string
  items?: Array<{ titleEn: string; titleAr?: string; quantity: number; unitPrice: number; totalPrice: number }>
  locale?: string
}

/**
 * Dispatches an internal notification to the E3 Qatar sales & events team
 * when a new package inquiry is submitted.
 */
export async function sendInternalPackageLeadAlert(payload: PackageLeadNotificationPayload): Promise<void> {
  try {
    const targetEmail = await getNotificationTargetEmail("PROJECT")

    const subject = `[New Package Lead] ${payload.customerName} - ${payload.packageTitle || payload.leadType} (${payload.leadId})`

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px;">
        <div style="border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #a855f7; margin: 0; font-size: 20px;">E3 Qatar — New Package Inquiry</h2>
          <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Reference: <strong>${payload.leadId}</strong></p>
        </div>

        <div style="background: #1e293b; padding: 16px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #334155;">
          <h3 style="color: #38bdf8; font-size: 15px; margin: 0 0 12px 0;">Customer & Event Details</h3>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Customer:</strong> ${payload.customerName}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${payload.email}" style="color: #38bdf8;">${payload.email}</a></p>
          ${payload.phone ? `<p style="margin: 6px 0; font-size: 14px;"><strong>Phone:</strong> ${payload.phone}</p>` : ""}
          <p style="margin: 6px 0; font-size: 14px;"><strong>Package:</strong> ${payload.packageTitle || payload.leadType}</p>
          ${payload.expectedGuests ? `<p style="margin: 6px 0; font-size: 14px;"><strong>Guests:</strong> ${payload.expectedGuests}</p>` : ""}
          ${payload.preferredDate ? `<p style="margin: 6px 0; font-size: 14px;"><strong>Preferred Date:</strong> ${new Date(payload.preferredDate).toLocaleDateString()}</p>` : ""}
          ${payload.budgetRange ? `<p style="margin: 6px 0; font-size: 14px;"><strong>Budget:</strong> ${payload.budgetRange}</p>` : ""}
          ${payload.specialRequests ? `<p style="margin: 6px 0; font-size: 14px;"><strong>Special Requests:</strong> ${payload.specialRequests}</p>` : ""}
        </div>

        <div style="font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #334155; padding-top: 16px;">
          Submitted via ${payload.sourcePage || "/b2c/packages"} • E3 Qatar Entertainment Hub
        </div>
      </div>
    `

    await sendEmail({
      to: targetEmail,
      subject,
      html,
      category: "PROJECT"
    })
  } catch (err: any) {
    // Non-blocking: log safely without leaking credentials or failing customer flow
    console.error("[Email Notification Failure] Internal package lead alert failed:", err?.message || err)
  }
}

/**
 * Sends a customer-facing confirmation email in English or Arabic upon inquiry submission.
 */
export async function sendCustomerLeadAcknowledgement(payload: PackageLeadNotificationPayload): Promise<void> {
  try {
    const isAr = payload.locale === "ar"
    const subject = isAr
      ? `شكراً لتواصلك مع E3 قطر — تم استلام طلب باقة ${payload.packageTitle || "الفعاليات"} (${payload.leadId})`
      : `Thank you for choosing E3 Qatar — Package Inquiry Received (${payload.leadId})`

    const html = isAr ? `
      <div dir="rtl" style="font-family: 'Cairo', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1e293b; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #6d28d9; margin: 0; font-size: 22px;">مؤسسة إي ثري للترفيه — E3 Qatar</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 6px;">تجارب استثنائية واحتفالات لا تُنسى</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6;">مرحباً <strong>${payload.customerName}</strong>،</p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          نشكرك على اهتمامك بباقات E3 الترفيهية. لقد تم استلام طلبك بنجاح وسيقوم فريق تنظيم الفعاليات بالتواصل معك خلال ٢٤ ساعة لمناقشة التفاصيل وتأكيد الحجز.
        </p>

        <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px;"><strong>رقم الطلب المرجعي:</strong> ${payload.leadId}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>الباقة المختارة:</strong> ${payload.packageTitle || "باقة مخصصة"}</p>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          إذا كان لديك أي استفسار عاجل، يمكنك الرد على هذه الرسالة أو التواصل معنا مباشرة عبر واتساب.
        </p>
      </div>
    ` : `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1e293b; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #6d28d9; margin: 0; font-size: 22px;">E3 Qatar Entertainment</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Extraordinary Events & Celebrations</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6;">Dear <strong>${payload.customerName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          Thank you for your interest in E3 Entertainment packages. We have received your inquiry for <strong>${payload.packageTitle || "Custom Event Experience"}</strong>. Our events team will review your requirements and reach out within 24 hours.
        </p>

        <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px;"><strong>Reference Number:</strong> ${payload.leadId}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Package:</strong> ${payload.packageTitle || "Custom Experience"}</p>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          If you have urgent questions, feel free to reply directly to this email or connect with us on WhatsApp.
        </p>
      </div>
    `

    await sendEmail({
      to: payload.email,
      subject,
      html,
      category: "CONTACT"
    })
  } catch (err: any) {
    console.error("[Email Notification Failure] Customer acknowledgement failed:", err?.message || err)
  }
}

/**
 * Dispatches a formal package quotation email to the customer with interactive breakdown,
 * printable view link, and direct payment link.
 */
export async function sendCustomerQuotationEmail(payload: PackageQuotationEmailPayload): Promise<void> {
  try {
    const isAr = payload.locale === "ar"
    const currency = payload.currency || "QAR"
    const deposit = payload.depositAmount || Math.round(payload.grandTotal * 0.5)
    const validDateStr = payload.validUntil ? new Date(payload.validUntil).toLocaleDateString(isAr ? "ar-QA" : "en-US") : "14 days"

    const subject = isAr
      ? `عرض سعر باقة فعاليات إي ثري — رقم ${payload.quoteNumber}`
      : `E3 Qatar Official Experience Quotation — ${payload.quoteNumber}`

    const itemsHtml = Array.isArray(payload.items) && payload.items.length > 0 ? `
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
        <thead>
          <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: ${isAr ? 'right' : 'left'};">
            <th style="padding: 8px 12px;">${isAr ? 'البند' : 'Item'}</th>
            <th style="padding: 8px 12px; text-align: center;">${isAr ? 'الكمية' : 'Qty'}</th>
            <th style="padding: 8px 12px; text-align: ${isAr ? 'left' : 'right'};">${isAr ? 'المجموع' : 'Total'}</th>
          </tr>
        </thead>
        <tbody>
          ${payload.items.map(it => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 12px;">${isAr ? (it.titleAr || it.titleEn) : it.titleEn}</td>
              <td style="padding: 8px 12px; text-align: center; font-family: monospace;">${it.quantity}</td>
              <td style="padding: 8px 12px; text-align: ${isAr ? 'left' : 'right'}; font-weight: bold;">${(it.totalPrice || it.unitPrice * it.quantity).toLocaleString()} ${currency}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : ''

    const html = isAr ? `
      <div dir="rtl" style="font-family: 'Cairo', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1e293b; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #6d28d9; margin: 0; font-size: 22px;">مؤسسة إي ثري للترفيه — E3 Qatar</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 6px;">عرض سعر رسمي ومقترح الفعالية</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6;">مرحباً <strong>${payload.customerName}</strong>،</p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          يسرنا تزويدكم بعرض السعر الرسمي لباقة <strong>${payload.packageTitle || "الفعالية الترفيهية"}</strong>. يرجى مراجعة تفاصيل العرض أدناه:
        </p>

        <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span><strong>رقم عرض السعر:</strong></span>
            <span style="font-family: monospace; font-weight: bold; color: #6d28d9;">${payload.quoteNumber}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span><strong>تاريخ الصلاحية:</strong></span>
            <span>${validDateStr}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span><strong>الدفعة المقدمة المطلوبة (٥٠٪):</strong></span>
            <span style="font-weight: bold; color: #d97706;">${deposit.toLocaleString()} ${currency}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 16px;">
            <span><strong>المجموع الكلي:</strong></span>
            <span style="font-weight: 900; color: #059669;">${payload.grandTotal.toLocaleString()} ${currency}</span>
          </div>
        </div>

        ${itemsHtml}

        <div style="text-align: center; margin: 30px 0;">
          ${payload.viewUrl ? `
            <a href="${payload.viewUrl}" style="display: inline-block; background: #6d28d9; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 6px;">
              عرض وتحميل عرض السعر (PDF)
            </a>
          ` : ''}
          ${payload.paymentUrl ? `
            <a href="${payload.paymentUrl}" style="display: inline-block; background: #059669; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 6px;">
              سداد الدفعة المقدمة أونلاين
            </a>
          ` : ''}
        </div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          تطبق شروط وأحكام الوجهة المحددة وسياسة الإلغاء وحماية البيانات الشخصية (PDPL) في قطر.
        </p>
      </div>
    ` : `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; color: #1e293b; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #6d28d9; margin: 0; font-size: 22px;">E3 Qatar Entertainment</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Official Event Proposal & Quotation</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6;">Dear <strong>${payload.customerName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          We are pleased to provide your official experience quotation for <strong>${payload.packageTitle || "E3 Entertainment Package"}</strong>. Please review your proposal details below:
        </p>

        <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px;"><strong>Quotation Reference:</strong> <span style="font-family: monospace; font-weight: bold; color: #6d28d9;">${payload.quoteNumber}</span></p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Valid Until:</strong> ${validDateStr}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Required Deposit (50%):</strong> <span style="font-weight: bold; color: #d97706;">${deposit.toLocaleString()} ${currency}</span></p>
          <p style="margin: 8px 0 0 0; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 16px;"><strong>Grand Total:</strong> <span style="font-weight: 900; color: #059669;">${payload.grandTotal.toLocaleString()} ${currency}</span></p>
        </div>

        ${itemsHtml}

        <div style="text-align: center; margin: 30px 0;">
          ${payload.viewUrl ? `
            <a href="${payload.viewUrl}" style="display: inline-block; background: #6d28d9; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 6px;">
              View & Download Quote (PDF)
            </a>
          ` : ''}
          ${payload.paymentUrl ? `
            <a href="${payload.paymentUrl}" style="display: inline-block; background: #059669; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 6px;">
              Pay Deposit Online
            </a>
          ` : ''}
        </div>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          Subject to venue-specific conditions, event terms, and State of Qatar Personal Data Privacy Law (PDPL).
        </p>
      </div>
    `

    await sendEmail({
      to: payload.customerEmail,
      subject,
      html,
      category: "CONTACT"
    })
  } catch (err: any) {
    console.error("[Email Notification Failure] Customer quotation email failed:", err?.message || err)
  }
}

