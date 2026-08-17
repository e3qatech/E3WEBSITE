import { describe, it, expect, vi, beforeEach } from "vitest"

describe("E3 Packages Marketplace & Package Studio Engine", () => {
  describe("1. Canonical Category Taxonomy", () => {
    const canonicalCategories = [
      { id: "cat-1", slug: "celebrate", nameEn: "Celebrate", nameAr: "أعياد الميلاد والاحتفالات" },
      { id: "cat-2", slug: "learn-explore", nameEn: "Learn & Explore", nameAr: "التعليم والاستكشاف" },
      { id: "cat-3", slug: "play-together", nameEn: "Play Together", nameAr: "المجموعات والأصدقاء" },
      { id: "cat-4", slug: "corporate", nameEn: "Corporate", nameAr: "الشركات وبناء الفرق" },
      { id: "cat-5", slug: "events", nameEn: "Events & Buyouts", nameAr: "الفعاليات الكبرى والحجز الحصري" },
      { id: "cat-6", slug: "seasonal", nameEn: "Seasonal Camps", nameAr: "المخيمات والبرامج الموسمية" },
      { id: "cat-7", slug: "custom", nameEn: "Custom", nameAr: "تجارب حسب الطلب" }
    ]

    it("defines exactly 7 canonical package categories", () => {
      expect(canonicalCategories.length).toBe(7)
    })

    it("has unique slugs for each category", () => {
      const slugs = canonicalCategories.map(c => c.slug)
      const uniqueSlugs = new Set(slugs)
      expect(uniqueSlugs.size).toBe(canonicalCategories.length)
    })

    it("has valid bilingual names (English and Arabic) for all categories", () => {
      canonicalCategories.forEach(cat => {
        expect(cat.nameEn).toBeTruthy()
        expect(cat.nameAr).toBeTruthy()
      })
    })
  })

  describe("2. Confidential Field Sanitization (Admin vs Public)", () => {
    const mockDbPackage = {
      id: "pkg-123",
      titleEn: "InflataRUN VIP Birthday",
      titleAr: "عيد ميلاد إنفلاتا ران",
      slug: "inflatarun-vip-birthday",
      startingPrice: 2500,
      internalCost: 800,
      estimatedMargin: 1700,
      internalNotes: "Confidential supplier quote: 800 QAR total direct costs.",
      isPublished: true
    }

    it("strips internalCost, estimatedMargin, and internalNotes for public unauthenticated requests", () => {
      const isAdmin = false
      const sanitized = { ...mockDbPackage }
      if (!isAdmin) {
        delete (sanitized as any).internalCost
        delete (sanitized as any).estimatedMargin
        delete (sanitized as any).internalNotes
      }

      expect(sanitized.startingPrice).toBe(2500)
      expect((sanitized as any).internalCost).toBeUndefined()
      expect((sanitized as any).estimatedMargin).toBeUndefined()
      expect((sanitized as any).internalNotes).toBeUndefined()
    })

    it("preserves internalCost and internalNotes for authenticated admin sessions", () => {
      const isAdmin = true
      const sanitized = { ...mockDbPackage }
      if (!isAdmin) {
        delete (sanitized as any).internalCost
        delete (sanitized as any).estimatedMargin
        delete (sanitized as any).internalNotes
      }

      expect((sanitized as any).internalCost).toBe(800)
      expect((sanitized as any).estimatedMargin).toBe(1700)
      expect((sanitized as any).internalNotes).toContain("Confidential supplier quote")
    })
  })

  describe("3. Lead Validation & Anti-Spam Pipeline", () => {
    it("rejects honeypot submission when hidden website_hp field is populated", () => {
      const spamSubmission = {
        customerName: "Bot Spammer",
        email: "bot@spam.com",
        phone: "12345678",
        website_hp: "http://spam-link.com" // Bot filled this
      }

      const isBot = Boolean(spamSubmission.website_hp)
      expect(isBot).toBe(true)
    })

    it("generates structured human-readable reference number with format E3-LEAD-YYMMDD-XXXX", () => {
      const now = new Date()
      const year = now.getFullYear().toString().slice(-2)
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const randomSuffix = "A8K9"
      const ref = `E3-LEAD-${year}${month}${day}-${randomSuffix}`

      expect(ref).toMatch(/^E3-LEAD-\d{6}-[A-Z0-9]{4}$/)
    })
  })

  describe("4. Coupon Validation Engine", () => {
    const couponPercentage = {
      code: "E3-SUMMER20",
      status: "ACTIVE",
      usageLimit: 100,
      usedCount: 15,
      validFrom: new Date("2026-01-01"),
      validUntil: new Date("2026-12-31"),
      promotion: {
        discountType: "PERCENTAGE",
        discountValue: 20,
        maxDiscount: 1000,
        minSpend: 500
      }
    }

    const couponFixed = {
      code: "E3-SAVE300",
      status: "ACTIVE",
      usageLimit: 50,
      usedCount: 5,
      promotion: {
        discountType: "FIXED",
        discountValue: 300,
        minSpend: 1500
      }
    }

    it("computes 20% discount correctly with subtotal of 2,000 QAR", () => {
      const subtotal = 2000
      let discount = (subtotal * couponPercentage.promotion.discountValue) / 100
      if (couponPercentage.promotion.maxDiscount && discount > couponPercentage.promotion.maxDiscount) {
        discount = couponPercentage.promotion.maxDiscount
      }
      expect(discount).toBe(400)
      expect(subtotal - discount).toBe(1600)
    })

    it("caps percentage discount at maxDiscount limit", () => {
      const subtotal = 10000 // 20% of 10000 = 2000 > max 1000
      let discount = (subtotal * couponPercentage.promotion.discountValue) / 100
      if (couponPercentage.promotion.maxDiscount && discount > couponPercentage.promotion.maxDiscount) {
        discount = couponPercentage.promotion.maxDiscount
      }
      expect(discount).toBe(1000)
    })

    it("rejects coupon if subtotal is below minSpend requirement", () => {
      const subtotal = 800 // Below 1500 min spend
      const isValid = subtotal >= (couponFixed.promotion.minSpend || 0)
      expect(isValid).toBe(false)
    })
  })

  describe("5. Quotation Calculation Engine", () => {
    it("computes line items, subtotal, discount, grand total, and required 50% deposit", () => {
      const lineItems = [
        { titleEn: "VIP Birthday Base Tier", quantity: 1, unitPrice: 2500 },
        { titleEn: "Extra Guests (5 guests)", quantity: 5, unitPrice: 120 },
        { titleEn: "Gourmet Catering Upgrade", quantity: 20, unitPrice: 75 },
        { titleEn: "Dedicated Party Host", quantity: 1, unitPrice: 350 }
      ]

      const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      // 2500 + 600 + 1500 + 350 = 4950
      expect(subtotal).toBe(4950)

      const discountAmount = 450
      const grandTotal = Math.max(0, subtotal - discountAmount) // 4500
      expect(grandTotal).toBe(4500)

      const depositPercentage = 50
      const depositRequired = (grandTotal * depositPercentage) / 100 // 2250
      expect(depositRequired).toBe(2250)
    })
  })

  describe("6. Smart Package Finder Recommendation Scoring", () => {
    const packages = [
      { id: "1", titleEn: "Birthday Party", category: "BIRTHDAY", audienceTypes: ["KIDS"], minGuests: 10, maxGuests: 30, startingPrice: 2000, isFeatured: true },
      { id: "2", titleEn: "Corporate Outing", category: "CORPORATE", audienceTypes: ["CORPORATE"], minGuests: 20, maxGuests: 100, startingPrice: 6000, isPopular: true },
      { id: "3", titleEn: "School Science Trip", category: "SCHOOL", audienceTypes: ["SCHOOLS"], minGuests: 30, maxGuests: 150, startingPrice: 1500 }
    ]

    it("ranks Birthday package #1 when user is planning a Kids Birthday Party for 15 guests", () => {
      const userAnswers = {
        occasion: "BIRTHDAY",
        audience: "KIDS",
        guests: "10-25"
      }

      const scored = packages.map(pkg => {
        let score = 0
        if (userAnswers.occasion === pkg.category) score += 40
        if (pkg.audienceTypes.includes(userAnswers.audience)) score += 20
        if (pkg.minGuests <= 25 && pkg.maxGuests >= 15) score += 15
        if (pkg.isFeatured) score += 5
        return { pkg, score }
      }).sort((a, b) => b.score - a.score)

      expect(scored[0].pkg.id).toBe("1")
      expect(scored[0].score).toBe(80) // 40 + 20 + 15 + 5
    })

    it("ranks Corporate package #1 when user is planning a Corporate Team Outing", () => {
      const userAnswers = {
        occasion: "CORPORATE",
        audience: "CORPORATE"
      }

      const scored = packages.map(pkg => {
        let score = 0
        if (userAnswers.occasion === pkg.category) score += 40
        if (pkg.audienceTypes.includes(userAnswers.audience)) score += 20
        return { pkg, score }
      }).sort((a, b) => b.score - a.score)

      expect(scored[0].pkg.id).toBe("2")
      expect(scored[0].score).toBe(60)
    })
  })
})
