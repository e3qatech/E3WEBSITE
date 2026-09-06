import { describe, it, expect } from "vitest";
import {
  isValidTransition,
  assertTransition,
  INFLUENCER_TRANSITIONS,
  APPLICATION_TRANSITIONS,
  CAMPAIGN_CREATOR_TRANSITIONS,
  DELIVERABLE_TRANSITIONS,
  PAYMENT_TRANSITIONS,
} from "../lib/influencer/transitions";

describe("Influencer & Creator Management - Finite State Machine Transitions", () => {
  describe("Influencer Status Transitions", () => {
    it("allows PROSPECT to transition to INVITED, APPLICATION_SUBMITTED, UNDER_REVIEW, or ARCHIVED", () => {
      expect(isValidTransition(INFLUENCER_TRANSITIONS, "PROSPECT", "INVITED")).toBe(true);
      expect(isValidTransition(INFLUENCER_TRANSITIONS, "PROSPECT", "APPLICATION_SUBMITTED")).toBe(true);
      expect(isValidTransition(INFLUENCER_TRANSITIONS, "PROSPECT", "UNDER_REVIEW")).toBe(true);
      expect(isValidTransition(INFLUENCER_TRANSITIONS, "PROSPECT", "ARCHIVED")).toBe(true);
    });

    it("prevents PROSPECT from jumping directly to ACTIVE without review/approval", () => {
      expect(isValidTransition(INFLUENCER_TRANSITIONS, "PROSPECT", "ACTIVE")).toBe(false);
      expect(() =>
        assertTransition("Influencer", INFLUENCER_TRANSITIONS, "PROSPECT", "ACTIVE")
      ).toThrowError(/Illegal Influencer status transition/);
    });

    it("allows APPROVED to transition to ACTIVE or PAUSED", () => {
      expect(isValidTransition(INFLUENCER_TRANSITIONS, "APPROVED", "ACTIVE")).toBe(true);
      expect(isValidTransition(INFLUENCER_TRANSITIONS, "APPROVED", "PAUSED")).toBe(true);
    });

    it("allows ACTIVE to transition to PAUSED, RESTRICTED, or ARCHIVED", () => {
      expect(isValidTransition(INFLUENCER_TRANSITIONS, "ACTIVE", "PAUSED")).toBe(true);
      expect(isValidTransition(INFLUENCER_TRANSITIONS, "ACTIVE", "RESTRICTED")).toBe(true);
      expect(isValidTransition(INFLUENCER_TRANSITIONS, "ACTIVE", "ARCHIVED")).toBe(true);
    });

    it("allows RESTRICTED creator to be rehabilitated to UNDER_REVIEW or ARCHIVED", () => {
      expect(isValidTransition(INFLUENCER_TRANSITIONS, "RESTRICTED", "UNDER_REVIEW")).toBe(true);
      expect(isValidTransition(INFLUENCER_TRANSITIONS, "RESTRICTED", "ARCHIVED")).toBe(true);
      expect(isValidTransition(INFLUENCER_TRANSITIONS, "RESTRICTED", "ACTIVE")).toBe(false);
    });
  });

  describe("Application Status Transitions", () => {
    it("allows SUBMITTED to move to UNDER_REVIEW or WITHDRAWN", () => {
      expect(isValidTransition(APPLICATION_TRANSITIONS, "SUBMITTED", "UNDER_REVIEW")).toBe(true);
      expect(isValidTransition(APPLICATION_TRANSITIONS, "SUBMITTED", "WITHDRAWN")).toBe(true);
      expect(isValidTransition(APPLICATION_TRANSITIONS, "SUBMITTED", "APPROVED")).toBe(false); // Must go through UNDER_REVIEW
    });

    it("allows UNDER_REVIEW to request MORE_INFORMATION_REQUIRED, APPROVE or DECLINE", () => {
      expect(isValidTransition(APPLICATION_TRANSITIONS, "UNDER_REVIEW", "MORE_INFORMATION_REQUIRED")).toBe(true);
      expect(isValidTransition(APPLICATION_TRANSITIONS, "UNDER_REVIEW", "APPROVED")).toBe(true);
      expect(isValidTransition(APPLICATION_TRANSITIONS, "UNDER_REVIEW", "DECLINED")).toBe(true);
      expect(isValidTransition(APPLICATION_TRANSITIONS, "MORE_INFORMATION_REQUIRED", "UNDER_REVIEW")).toBe(true);
    });

    it("terminal application states (APPROVED, WITHDRAWN) cannot transition", () => {
      expect(isValidTransition(APPLICATION_TRANSITIONS, "APPROVED", "SUBMITTED")).toBe(false);
      expect(isValidTransition(APPLICATION_TRANSITIONS, "WITHDRAWN", "UNDER_REVIEW")).toBe(false);
    });
  });

  describe("Campaign Creator Assignment Transitions", () => {
    it("follows strict lifecycle from SHORTLISTED to CONTRACTED to IN_PROGRESS to COMPLETED", () => {
      expect(isValidTransition(CAMPAIGN_CREATOR_TRANSITIONS, "SHORTLISTED", "APPROVAL_REQUIRED")).toBe(true);
      expect(isValidTransition(CAMPAIGN_CREATOR_TRANSITIONS, "APPROVAL_REQUIRED", "APPROVED")).toBe(true);
      expect(isValidTransition(CAMPAIGN_CREATOR_TRANSITIONS, "APPROVED", "INVITED")).toBe(true);
      expect(isValidTransition(CAMPAIGN_CREATOR_TRANSITIONS, "INVITED", "ACCEPTED")).toBe(true);
      expect(isValidTransition(CAMPAIGN_CREATOR_TRANSITIONS, "ACCEPTED", "CONTRACTED")).toBe(true);
      expect(isValidTransition(CAMPAIGN_CREATOR_TRANSITIONS, "CONTRACTED", "BRIEFED")).toBe(true);
      expect(isValidTransition(CAMPAIGN_CREATOR_TRANSITIONS, "BRIEFED", "IN_PROGRESS")).toBe(true);
      expect(isValidTransition(CAMPAIGN_CREATOR_TRANSITIONS, "IN_PROGRESS", "COMPLETED")).toBe(true);
    });

    it("allows negotiation loop between ACCEPTED, NEGOTIATING, and CONTRACTED", () => {
      expect(isValidTransition(CAMPAIGN_CREATOR_TRANSITIONS, "ACCEPTED", "NEGOTIATING")).toBe(true);
      expect(isValidTransition(CAMPAIGN_CREATOR_TRANSITIONS, "NEGOTIATING", "CONTRACTED")).toBe(true);
      expect(isValidTransition(CAMPAIGN_CREATOR_TRANSITIONS, "NEGOTIATING", "DECLINED")).toBe(true);
    });

    it("allows cancellation at non-terminal stages", () => {
      expect(isValidTransition(CAMPAIGN_CREATOR_TRANSITIONS, "SHORTLISTED", "CANCELLED")).toBe(true);
      expect(isValidTransition(CAMPAIGN_CREATOR_TRANSITIONS, "INVITED", "CANCELLED")).toBe(true);
      expect(isValidTransition(CAMPAIGN_CREATOR_TRANSITIONS, "IN_PROGRESS", "CANCELLED")).toBe(true);
      expect(isValidTransition(CAMPAIGN_CREATOR_TRANSITIONS, "COMPLETED", "CANCELLED")).toBe(false);
    });
  });

  describe("Deliverable Lifecycle Transitions", () => {
    it("progresses from PLANNED through DRAFT_DUE, SUBMITTED, APPROVED, PUBLISHED, VERIFIED to COMPLETED", () => {
      expect(isValidTransition(DELIVERABLE_TRANSITIONS, "PLANNED", "BRIEFED")).toBe(true);
      expect(isValidTransition(DELIVERABLE_TRANSITIONS, "BRIEFED", "DRAFT_DUE")).toBe(true);
      expect(isValidTransition(DELIVERABLE_TRANSITIONS, "DRAFT_DUE", "SUBMITTED")).toBe(true);
      expect(isValidTransition(DELIVERABLE_TRANSITIONS, "SUBMITTED", "APPROVED")).toBe(true);
      expect(isValidTransition(DELIVERABLE_TRANSITIONS, "APPROVED", "SCHEDULED")).toBe(true);
      expect(isValidTransition(DELIVERABLE_TRANSITIONS, "APPROVED", "PUBLISHED")).toBe(true);
      expect(isValidTransition(DELIVERABLE_TRANSITIONS, "PUBLISHED", "VERIFIED")).toBe(true);
      expect(isValidTransition(DELIVERABLE_TRANSITIONS, "VERIFIED", "METRICS_COLLECTED")).toBe(true);
      expect(isValidTransition(DELIVERABLE_TRANSITIONS, "METRICS_COLLECTED", "COMPLETED")).toBe(true);
    });

    it("handles revision request loop", () => {
      expect(isValidTransition(DELIVERABLE_TRANSITIONS, "SUBMITTED", "REVISION_REQUESTED")).toBe(true);
      expect(isValidTransition(DELIVERABLE_TRANSITIONS, "REVISION_REQUESTED", "SUBMITTED")).toBe(true);
    });

    it("prevents unverified published posts from becoming COMPLETED directly", () => {
      expect(isValidTransition(DELIVERABLE_TRANSITIONS, "PUBLISHED", "COMPLETED")).toBe(false);
    });
  });

  describe("Commercial Payment Transitions", () => {
    it("follows procurement flow from RATE_PROPOSED through INVOICE_RECEIVED to PAID", () => {
      expect(isValidTransition(PAYMENT_TRANSITIONS, "RATE_PROPOSED", "RATE_APPROVED")).toBe(true);
      expect(isValidTransition(PAYMENT_TRANSITIONS, "RATE_APPROVED", "INVOICE_REQUIRED")).toBe(true);
      expect(isValidTransition(PAYMENT_TRANSITIONS, "INVOICE_REQUIRED", "INVOICE_RECEIVED")).toBe(true);
      expect(isValidTransition(PAYMENT_TRANSITIONS, "INVOICE_RECEIVED", "PAYMENT_SUBMITTED")).toBe(true);
      expect(isValidTransition(PAYMENT_TRANSITIONS, "PAYMENT_SUBMITTED", "PAID")).toBe(true);
    });

    it("prevents paying before invoice is received or payment submitted", () => {
      expect(isValidTransition(PAYMENT_TRANSITIONS, "RATE_PROPOSED", "PAID")).toBe(false);
      expect(isValidTransition(PAYMENT_TRANSITIONS, "INVOICE_REQUIRED", "PAID")).toBe(false);
    });
  });
});
