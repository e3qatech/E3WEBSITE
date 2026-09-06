import { describe, it, expect } from "vitest";

describe("Influencer & BookingQube Ticket Attribution & Webhook Logic", () => {
  interface ConversionStore {
    [externalEventId: string]: {
      campaignId: string;
      creatorId: string;
      promoCode: string;
      ticketCount: number;
      grossRevenue: number;
      discountAmount: number;
      refundAmount: number;
      netRevenue: number;
      currency: string;
    };
  }

  function processBookingWebhook(
    store: ConversionStore,
    event: {
      eventId: string;
      orderId: string;
      promoCode?: string;
      trackingCode?: string;
      ticketCount: number;
      grossAmount: number;
      discountAmount: number;
      currency: string;
      isRefund?: boolean;
    },
    promoMap: Record<string, { campaignId: string; creatorId: string }>
  ) {
    // 1. Idempotency Check
    if (store[event.eventId]) {
      return { status: "IDEMPOTENT_IGNORED", data: store[event.eventId] };
    }

    // 2. Normalization & Matching
    const normalizedCode = event.promoCode?.trim().toUpperCase();
    const match = normalizedCode ? promoMap[normalizedCode] : null;

    if (!match) {
      return { status: "UNMATCHED_RECONCILIATION_QUEUE" };
    }

    const netAmount = event.grossAmount - event.discountAmount;

    // 3. Atomically Record
    store[event.eventId] = {
      campaignId: match.campaignId,
      creatorId: match.creatorId,
      promoCode: normalizedCode!,
      ticketCount: event.ticketCount,
      grossRevenue: event.grossAmount,
      discountAmount: event.discountAmount,
      refundAmount: event.isRefund ? netAmount : 0,
      netRevenue: event.isRefund ? 0 : netAmount,
      currency: event.currency,
    };

    return { status: "ATTRIBUTED_SUCCESS", data: store[event.eventId] };
  }

  it("normalizes promo codes case-insensitively and attributes order revenue correctly", () => {
    const store: ConversionStore = {};
    const promoMap = {
      "WINTER20": { campaignId: "camp_winter", creatorId: "inf_tariq" },
    };

    const webhookPayload = {
      eventId: "bq_evt_1001",
      orderId: "bq_ord_501",
      promoCode: "  winter20  ", // Lowercase with whitespace
      ticketCount: 4,
      grossAmount: 800,
      discountAmount: 160,
      currency: "QAR",
    };

    const result = processBookingWebhook(store, webhookPayload, promoMap);

    expect(result.status).toBe("ATTRIBUTED_SUCCESS");
    expect(result.data?.campaignId).toBe("camp_winter");
    expect(result.data?.creatorId).toBe("inf_tariq");
    expect(result.data?.promoCode).toBe("WINTER20");
    expect(result.data?.netRevenue).toBe(640);
  });

  it("enforces idempotency on duplicate retried webhook events", () => {
    const store: ConversionStore = {};
    const promoMap = {
      "SUMMER15": { campaignId: "camp_summer", creatorId: "inf_dana" },
    };

    const payload = {
      eventId: "bq_evt_duplicate_test",
      orderId: "bq_ord_999",
      promoCode: "SUMMER15",
      ticketCount: 2,
      grossAmount: 300,
      discountAmount: 45,
      currency: "QAR",
    };

    // First arrival
    const res1 = processBookingWebhook(store, payload, promoMap);
    expect(res1.status).toBe("ATTRIBUTED_SUCCESS");

    // Second arrival (retry)
    const res2 = processBookingWebhook(store, payload, promoMap);
    expect(res2.status).toBe("IDEMPOTENT_IGNORED");

    // Total stored conversions must still be 1, not duplicated
    expect(Object.keys(store)).toHaveLength(1);
    expect(store["bq_evt_duplicate_test"].grossRevenue).toBe(300);
  });

  it("places unmatched promo codes into the reconciliation queue without failing", () => {
    const store: ConversionStore = {};
    const promoMap = {
      "VALID_CODE": { campaignId: "camp_1", creatorId: "inf_1" },
    };

    const payload = {
      eventId: "bq_evt_unknown",
      orderId: "bq_ord_888",
      promoCode: "EXPIRED_OR_UNKNOWN",
      ticketCount: 1,
      grossAmount: 150,
      discountAmount: 0,
      currency: "QAR",
    };

    const res = processBookingWebhook(store, payload, promoMap);
    expect(res.status).toBe("UNMATCHED_RECONCILIATION_QUEUE");
    expect(store["bq_evt_unknown"]).toBeUndefined();
  });
});
