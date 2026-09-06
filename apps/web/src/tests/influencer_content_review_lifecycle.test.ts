import { describe, it, expect } from "vitest";

describe("Influencer Content Submission, Review & UGC Rights Clearance Lifecycle", () => {
  interface Submission {
    version: number;
    captionEn?: string;
    captionAr?: string;
    externalPreviewUrl?: string;
    submittedAt: Date;
  }

  interface Review {
    submissionVersion: number;
    decision: "APPROVED" | "APPROVED_WITH_NOTES" | "REVISION_REQUESTED" | "REJECTED" | "ESCALATED";
    feedback: string;
    createdAt: Date;
  }

  interface DeliverableLifecycleState {
    id: string;
    status: string;
    platform: string;
    submissions: Submission[];
    reviews: Review[];
    publishedUrl?: string;
    verifiedAt?: Date;
    transferredToMediaLibrary: boolean;
  }

  function submitDraft(state: DeliverableLifecycleState, url: string, caption: string): DeliverableLifecycleState {
    const nextVersion = state.submissions.length + 1;
    const newSubmission: Submission = {
      version: nextVersion,
      externalPreviewUrl: url,
      captionEn: caption,
      submittedAt: new Date(),
    };

    return {
      ...state,
      status: "SUBMITTED",
      submissions: [...state.submissions, newSubmission],
    };
  }

  function reviewDraft(
    state: DeliverableLifecycleState,
    decision: "APPROVED" | "REVISION_REQUESTED" | "REJECTED",
    feedback: string
  ): DeliverableLifecycleState {
    const latestSubmission = state.submissions[state.submissions.length - 1];
    if (!latestSubmission) throw new Error("No submission to review");

    const review: Review = {
      submissionVersion: latestSubmission.version,
      decision,
      feedback,
      createdAt: new Date(),
    };

    const nextStatus =
      decision === "APPROVED"
        ? "APPROVED"
        : decision === "REVISION_REQUESTED"
        ? "REVISION_REQUESTED"
        : "REJECTED";

    return {
      ...state,
      status: nextStatus,
      reviews: [...state.reviews, review],
    };
  }

  function submitPublishedPost(state: DeliverableLifecycleState, postUrl: string): DeliverableLifecycleState {
    if (state.status !== "APPROVED") {
      throw new Error("Cannot publish content before draft approval");
    }

    return {
      ...state,
      status: "PUBLISHED",
      publishedUrl: postUrl,
    };
  }

  function verifyPublication(state: DeliverableLifecycleState): DeliverableLifecycleState {
    if (state.status !== "PUBLISHED" || !state.publishedUrl) {
      throw new Error("Deliverable must be in PUBLISHED status with valid URL");
    }

    return {
      ...state,
      status: "VERIFIED",
      verifiedAt: new Date(),
    };
  }

  function transferToMediaLibrary(state: DeliverableLifecycleState): DeliverableLifecycleState {
    if (state.status !== "VERIFIED") {
      throw new Error("Only verified, rights-cleared UGC can be sent to Media Library");
    }

    return {
      ...state,
      transferredToMediaLibrary: true,
    };
  }

  it("handles versioned submission and revision request cycle without losing prior history", () => {
    let deliverable: DeliverableLifecycleState = {
      id: "del_1",
      status: "PLANNED",
      platform: "INSTAGRAM",
      submissions: [],
      reviews: [],
      transferredToMediaLibrary: false,
    };

    // 1. First submission (v1)
    deliverable = submitDraft(deliverable, "https://drive.google.com/v1.mp4", "Initial draft caption");
    expect(deliverable.status).toBe("SUBMITTED");
    expect(deliverable.submissions).toHaveLength(1);
    expect(deliverable.submissions[0].version).toBe(1);

    // 2. Reviewer requests revision
    deliverable = reviewDraft(
      deliverable,
      "REVISION_REQUESTED",
      "Please add mandatory hashtag #E3Qatar and adjust intro pacing."
    );
    expect(deliverable.status).toBe("REVISION_REQUESTED");
    expect(deliverable.reviews).toHaveLength(1);
    expect(deliverable.reviews[0].decision).toBe("REVISION_REQUESTED");

    // 3. Creator uploads revised draft (v2)
    deliverable = submitDraft(deliverable, "https://drive.google.com/v2.mp4", "Revised caption with #E3Qatar");
    expect(deliverable.status).toBe("SUBMITTED");
    expect(deliverable.submissions).toHaveLength(2);
    expect(deliverable.submissions[1].version).toBe(2);
    // Prior v1 must still exist
    expect(deliverable.submissions[0].captionEn).toBe("Initial draft caption");

    // 4. Reviewer approves v2
    deliverable = reviewDraft(deliverable, "APPROVED", "Approved for publishing!");
    expect(deliverable.status).toBe("APPROVED");
    expect(deliverable.reviews).toHaveLength(2);
    expect(deliverable.reviews[1].decision).toBe("APPROVED");
  });

  it("completes publication verification and Media Library transfer", () => {
    let deliverable: DeliverableLifecycleState = {
      id: "del_2",
      status: "APPROVED",
      platform: "INSTAGRAM",
      submissions: [{ version: 1, submittedAt: new Date() }],
      reviews: [{ submissionVersion: 1, decision: "APPROVED", feedback: "LGTM", createdAt: new Date() }],
      transferredToMediaLibrary: false,
    };

    // Publish post
    deliverable = submitPublishedPost(deliverable, "https://instagram.com/p/ABC123xyz");
    expect(deliverable.status).toBe("PUBLISHED");
    expect(deliverable.publishedUrl).toBe("https://instagram.com/p/ABC123xyz");

    // Verify publication
    deliverable = verifyPublication(deliverable);
    expect(deliverable.status).toBe("VERIFIED");
    expect(deliverable.verifiedAt).toBeInstanceOf(Date);

    // Transfer UGC to Media Library
    deliverable = transferToMediaLibrary(deliverable);
    expect(deliverable.transferredToMediaLibrary).toBe(true);
  });

  it("blocks premature publication or media library transfer before approval", () => {
    const unapprovedDeliverable: DeliverableLifecycleState = {
      id: "del_3",
      status: "SUBMITTED",
      platform: "TIKTOK",
      submissions: [{ version: 1, submittedAt: new Date() }],
      reviews: [],
      transferredToMediaLibrary: false,
    };

    expect(() => submitPublishedPost(unapprovedDeliverable, "https://tiktok.com/@e3/video/1")).toThrow(
      /Cannot publish content before draft approval/
    );
    expect(() => transferToMediaLibrary(unapprovedDeliverable)).toThrow(
      /Only verified, rights-cleared UGC can be sent to Media Library/
    );
  });
});
