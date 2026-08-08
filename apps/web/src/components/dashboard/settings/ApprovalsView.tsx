"use client";

import { useState } from "react";
import { AdminPageHeader } from "../ui/AdminPageHeader";
import { AdminFormLayout } from "../ui/AdminFormLayout";
import { AdminButton } from "../ui/AdminButton";
import { CheckCircle2, XCircle, Clock, ShieldCheck, Sliders, FileText, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import { useToast } from "@/components/dashboard/ui/ToastProvider";

interface ApprovalItem {
  id: string;
  type: "CMS_PUBLISH" | "PRICE_OVERRIDE" | "TEMPORAL_RULE" | "CONTRACT_SIGN";
  title: string;
  requesterName: string;
  requesterRole: string;
  department: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  details: string;
  createdAt: string;
  approvedBy?: string;
  actionedAt?: string;
  reviewNote?: string;
}

interface ApprovalsViewProps {
  initialRules: any;
  initialItems: ApprovalItem[];
}

export function ApprovalsView({ initialRules, initialItems }: ApprovalsViewProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "rules" | "history">("pending");
  const [rules, setRules] = useState(initialRules);
  const [items, setItems] = useState<ApprovalItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const { toast } = useToast();

  const handleAction = async (itemId: string, action: "APPROVE" | "REJECT") => {
    setActionId(itemId);
    try {
      const res = await fetch("/api/settings/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          itemId,
          reviewNote,
        }),
      });

      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const json = await res.json();
      if (json.items) {
        setItems(json.items);
      }
      toast(
        action === "APPROVE" ? "Approval request granted successfully." : "Approval request rejected.",
        action === "APPROVE" ? "success" : "info"
      );
      setReviewNote("");
    } catch (err: any) {
      console.error(err);
      toast(err?.message || "Failed to process approval action.", "error");
    } finally {
      setActionId(null);
    }
  };

  const handleSaveRules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_RULES",
          rules,
        }),
      });

      if (!res.ok) throw new Error("Failed to save rules");
      toast("Approval policy rules saved successfully.", "success");
    } catch (err: any) {
      console.error(err);
      toast("Failed to save policy rules.", "error");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/approvals");
      const json = await res.json();
      if (json.items) setItems(json.items);
      if (json.rules) setRules(json.rules);
      toast("Refreshed approval queue", "info");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingItems = items.filter((i) => i.status === "PENDING");
  const historyItems = items.filter((i) => i.status !== "PENDING");

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase">URGENT</span>;
      case "HIGH":
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase">HIGH</span>;
      case "MEDIUM":
        return <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-bold uppercase">MEDIUM</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase">LOW</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full p-4 md:p-8 max-w-6xl mx-auto pb-24">
      <AdminPageHeader
        title="Workflow Approvals & Signoffs"
        description="Review pending CMS releases, pricing overrides, and enterprise policy controls."
        action={
          <AdminButton variant="outline" onClick={refreshData} disabled={loading} className="gap-2 text-xs">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Queue
          </AdminButton>
        }
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border-default pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "pending"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          }`}
        >
          <Clock className="w-4 h-4" /> Pending Queue ({pendingItems.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "rules"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          }`}
        >
          <Sliders className="w-4 h-4" /> Policy Rules & Thresholds
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "history"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> History & Audit Log ({historyItems.length})
        </button>
      </div>

      <AdminFormLayout>
        {/* TAB 1: PENDING APPROVALS QUEUE */}
        {activeTab === "pending" && (
          <div className="space-y-6">
            <div className="bg-surface-default border border-border-default rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border-default pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-primary">Pending Approval Requests</h2>
                    <p className="text-xs text-text-secondary">Requests submitted by department staff requiring admin signoff.</p>
                  </div>
                </div>
              </div>

              {pendingItems.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-border-default rounded-2xl space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
                  <h3 className="text-base font-bold text-text-primary">All Caught Up!</h3>
                  <p className="text-xs text-text-secondary">There are currently no pending workflow approval requests in queue.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingItems.map((item) => (
                    <div key={item.id} className="border border-border-default rounded-2xl p-6 space-y-4 bg-surface-hover/30 hover:border-emerald-500/40 transition-all">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full bg-slate-800 text-emerald-400 font-mono text-[10px] font-bold border border-slate-700 uppercase">
                              {item.type}
                            </span>
                            {getPriorityBadge(item.priority)}
                            <span className="text-xs text-text-tertiary">Requested {new Date(item.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <h3 className="text-base font-bold text-text-primary font-display">{item.title}</h3>
                        </div>

                        <div className="text-end text-xs">
                          <span className="font-bold text-text-primary block">{item.requesterName}</span>
                          <span className="text-text-secondary block font-mono">{item.department} • {item.requesterRole}</span>
                        </div>
                      </div>

                      <p className="text-xs text-text-secondary bg-surface-default p-4 rounded-xl border border-border-default font-medium leading-relaxed">
                        {item.details}
                      </p>

                      {/* Approval Action Controls */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                        <input
                          type="text"
                          placeholder="Optional review notes or approval context..."
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          className="flex-1 bg-surface-hover border border-border-default rounded-xl px-4 py-2 text-xs text-text-primary focus:border-emerald-500 focus:outline-none"
                        />

                        <div className="flex items-center gap-2">
                          <AdminButton
                            variant="danger"
                            size="sm"
                            onClick={() => handleAction(item.id, "REJECT")}
                            disabled={actionId === item.id}
                            className="gap-1.5"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </AdminButton>

                          <AdminButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleAction(item.id, "APPROVE")}
                            disabled={actionId === item.id}
                            className="gap-1.5 shadow-md shadow-emerald-500/20"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve Release
                          </AdminButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: POLICY RULES */}
        {activeTab === "rules" && (
          <div className="space-y-6">
            <div className="bg-surface-default border border-border-default rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border-default pb-4">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Approval Policy Rules & Controls</h2>
                  <p className="text-xs text-text-secondary">Set threshold limits and specify mandatory signoff requirements.</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-surface-hover/30 border border-border-default rounded-xl cursor-pointer">
                  <div>
                    <span className="text-sm font-bold text-text-primary block">Require Admin Signoff for CMS Publishing</span>
                    <span className="text-xs text-text-secondary">Draft changes to B2C/B2B landing pages must be reviewed prior to public release.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={rules.requireCmsApproval}
                    onChange={(e) => setRules({ ...rules, requireCmsApproval: e.target.checked })}
                    className="w-5 h-5 text-emerald-500 rounded focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-surface-hover/30 border border-border-default rounded-xl cursor-pointer">
                  <div>
                    <span className="text-sm font-bold text-text-primary block">Require Super Admin Signoff for Price Overrides</span>
                    <span className="text-xs text-text-secondary">Commercial discounts exceeding standard rates require Super Admin authorization.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={rules.requirePriceOverrideApproval}
                    onChange={(e) => setRules({ ...rules, requirePriceOverrideApproval: e.target.checked })}
                    className="w-5 h-5 text-emerald-500 rounded focus:ring-0 cursor-pointer"
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Auto-Approve Staff Threshold (QAR)</label>
                    <input
                      type="number"
                      value={rules.autoApproveStaffUnderQar || 500}
                      onChange={(e) => setRules({ ...rules, autoApproveStaffUnderQar: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">Notification Dispatch Email</label>
                    <input
                      type="email"
                      value={rules.notificationEmail || "approvals@e3.qa"}
                      onChange={(e) => setRules({ ...rules, notificationEmail: e.target.value })}
                      className="w-full bg-surface-hover border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border-default flex justify-end">
                  <AdminButton variant="primary" onClick={handleSaveRules} disabled={loading} className="px-6 shadow-md">
                    {loading ? "Saving Policy..." : "Save Approval Policy"}
                  </AdminButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT LOG HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="bg-surface-default border border-border-default rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border-default pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-primary">Approval History & Audit Trail</h2>
                    <p className="text-xs text-text-secondary">Chronological history of granted and rejected workflow approvals.</p>
                  </div>
                </div>
              </div>

              {historyItems.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border-default rounded-2xl text-xs text-text-secondary">
                  No actioned approval items found in audit trail.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyItems.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-border-default bg-surface-hover/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {item.status === "APPROVED" ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">APPROVED</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold">REJECTED</span>
                          )}
                          <span className="font-bold text-text-primary">{item.title}</span>
                        </div>
                        <p className="text-text-secondary text-[11px] font-medium">{item.details}</p>
                      </div>

                      <div className="text-end text-text-tertiary text-[11px]">
                        <span className="block font-bold text-text-secondary">By {item.approvedBy || "Admin"}</span>
                        <span>{item.actionedAt ? new Date(item.actionedAt).toLocaleDateString() : ""}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </AdminFormLayout>
    </div>
  );
}
