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
  currency?: string
  validUntil?: Date | string | null
  viewUrl?: string
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
