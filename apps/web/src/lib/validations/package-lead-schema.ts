import { z } from 'zod'

/**
 * Strips HTML tags and excessive whitespace to prevent XSS and script injection.
 */
export function sanitizeInputString(val?: string | null): string {
  if (!val || typeof val !== 'string') return ''
  return val
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // strip control chars
    .trim()
}

export const PackageLeadTypeEnum = z.enum([
  'BIRTHDAY',
  'CORPORATE',
  'SCHOOL_TRIP',
  'VIP_EXPERIENCE',
  'CUSTOM_EVENT',
  'SEASONAL_PASS',
  'GENERAL'
])

export const PackageLeadSubmissionSchema = z.object({
  customerName: z
    .string()
    .min(2, { message: 'Customer name must be at least 2 characters' })
    .max(100, { message: 'Customer name cannot exceed 100 characters' })
    .transform(sanitizeInputString),

  email: z
    .string()
    .email({ message: 'Please provide a valid email address' })
    .max(150, { message: 'Email address cannot exceed 150 characters' })
    .toLowerCase()
    .trim(),

  phone: z
    .string()
    .max(25, { message: 'Phone number cannot exceed 25 characters' })
    .optional()
    .nullable()
    .transform(val => (val ? sanitizeInputString(val).replace(/[^\d+\s()-]/g, '').slice(0, 25) : null)),

  whatsApp: z
    .string()
    .max(30)
    .optional()
    .nullable()
    .transform(val => (val ? sanitizeInputString(val).slice(0, 30) : null)),

  companyOrOrg: z
    .string()
    .max(150)
    .optional()
    .nullable()
    .transform(val => (val ? sanitizeInputString(val).slice(0, 150) : null)),

  celebrationName: z
    .string()
    .max(150)
    .optional()
    .nullable()
    .transform(val => (val ? sanitizeInputString(val).slice(0, 150) : null)),

  contactMethod: z.enum(['EMAIL', 'PHONE', 'WHATSAPP', 'MEETING']).default('WHATSAPP'),

  leadType: PackageLeadTypeEnum.default('BIRTHDAY'),

  packageId: z.string().max(100).optional().nullable(),
  selectedTierId: z.string().max(50).optional().nullable(),
  selectedTierName: z.string().max(100).optional().nullable(),
  selectedAddOns: z.array(z.any()).optional().default([]),
  customSelections: z.any().optional().nullable(),
  themePreference: z.string().max(100).optional().nullable(),

  expectedGuests: z
    .union([z.number(), z.string()])
    .transform(val => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val
      return Number.isNaN(num) ? 10 : Math.min(Math.max(1, num), 1000)
    })
    .default(10),

  expectedChildren: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform(val => (val !== undefined && val !== null ? Math.max(0, parseInt(String(val), 10) || 0) : null)),

  expectedAdults: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform(val => (val !== undefined && val !== null ? Math.max(0, parseInt(String(val), 10) || 0) : null)),

  budgetRange: z.string().max(50).optional().nullable(),
  estimatedValue: z.number().optional().nullable(),

  preferredDate: z.string().max(50).optional().nullable(),
  alternativeDate: z.string().max(50).optional().nullable(),
  preferredTimeSlot: z.string().max(50).optional().nullable(),

  cateringRequirements: z
    .string()
    .max(300)
    .optional()
    .nullable()
    .transform(val => (val ? sanitizeInputString(val).slice(0, 300) : null)),

  accessibilityReqs: z
    .string()
    .max(300)
    .optional()
    .nullable()
    .transform(val => (val ? sanitizeInputString(val).slice(0, 300) : null)),

  specialRequests: z
    .string()
    .max(1000)
    .optional()
    .nullable()
    .transform(val => (val ? sanitizeInputString(val).slice(0, 1000) : null)),

  attachments: z.array(z.any()).optional().default([]),

  sourcePage: z.string().max(200).optional().default('/b2c/packages'),
  utmSource: z.string().max(100).optional().nullable(),
  utmMedium: z.string().max(100).optional().nullable(),
  utmCampaign: z.string().max(100).optional().nullable(),

  couponCode: z.string().max(50).optional().nullable(),
  referralCode: z.string().max(50).optional().nullable(),

  locale: z.enum(['en', 'ar']).default('en'),
  marketingConsent: z.boolean().default(false),
  termsAccepted: z.boolean().default(true),

  // Bot honeypots
  website_hp: z.string().optional(),
  honeypot: z.string().optional()
})

export type PackageLeadSubmissionInput = z.infer<typeof PackageLeadSubmissionSchema>
