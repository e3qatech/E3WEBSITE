"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Link2,
  RefreshCw,
  Ticket,
  DollarSign,
  Calendar,
} from "lucide-react";

interface ReconciliationClientProps {
  initialConversions: any[];
  total: number;
  totalPages: number;
  currentPage: number;
  status: string;
  campaigns: any[];
  locale: string;
  isAr: boolean;
}

export default function ReconciliationClient({
  initialConversions,
  total,
  totalPages,
  currentPage,
  status,
  campaigns,
  locale: _locale,
  isAr,
}: ReconciliationClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState(status);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Match modal state
  const [selectedConversion, setSelectedConversion] = useState<any | null>(null);
  const [matchForm, setMatchForm] = useState({
    targetCampaignId: campaigns[0]?.id || "",
    targetCampaignCreatorId: "",
    notes: "",
  });

  const handleTabChange = (newStatus: string) => {
    setActiveTab(newStatus);
    router.push(`?status=${newStatus}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`?status=${activeTab}&search=${encodeURIComponent(searchQuery)}`);
  };

  const handleOpenMatch = (conv: any) => {
    setSelectedConversion(conv);
    const initialCamp = campaigns[0];
    setMatchForm({
      targetCampaignId: initialCamp?.id || "",
      targetCampaignCreatorId: initialCamp?.creators?.[0]?.id || "",
      notes: `Manual attribution for unmatched code ${conv.unmatchedCode || "N/A"}`,
    });
  };

  const handleMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversion) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/influencer/reconciliation/${selectedConversion.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "MATCH",
          targetCampaignId: matchForm.targetCampaignId,
          targetCampaignCreatorId: matchForm.targetCampaignCreatorId || undefined,
          notes: matchForm.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reconcile conversion");

      toast(
        isAr ? "تمت مطابقة المبيعة مع الحملة بنجاح" : "Conversion successfully reconciled and attributed",
        "success"
      );
      setSelectedConversion(null);
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async (conversionId: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من تجاهل هذه المبيعة؟" : "Are you sure you want to dismiss this conversion?")) {
      return;
    }

    try {
      const res = await fetch(`/api/influencer/reconciliation/${conversionId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DISMISS",
          notes: "Dismissed by finance operator",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dismiss conversion");

      toast(isAr ? "تم تجاهل المبيعة" : "Conversion dismissed", "success");
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const selectedCampaignObj = campaigns.find((c) => c.id === matchForm.targetCampaignId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            {isAr ? "طابور تسوية مبيعات BookingQube" : "BookingQube Conversion Reconciliation Queue"}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {isAr
              ? "مراجعة العمليات التي استخدمت رموز ترويجية أو روابط تتبع غير معروفة وإسنادها للحملات يدوياً."
              : "Audit purchases using unrecognized promo codes or tracking links, and manually assign to campaigns."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] hover:border-[var(--color-accent)] transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>{isAr ? "تحديث" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 border-b border-[var(--border-level-1)] overflow-x-auto pb-px">
          {[
            { id: "UNMATCHED_CODE", labelEn: "Unmatched Queue", labelAr: "قيد التسوية" },
            { id: "MANUALLY_MATCHED", labelEn: "Reconciled", labelAr: "تمت التسوية" },
            { id: "DISMISSED", labelEn: "Dismissed", labelAr: "المتجاهلة" },
            { id: "ALL", labelEn: "All Conversions", labelAr: "الكل" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
          <input
            type="text"
            placeholder={isAr ? "بحث بالرمز أو رقم الطلب..." : "Search code or order ID..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--color-accent)]"
          />
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] overflow-hidden">
        {initialConversions.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--text-muted)] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-semibold text-[var(--text-primary)]">
              {isAr ? "طابور التسوية فارغ حالياً" : "No conversions pending reconciliation"}
            </p>
            <p>
              {isAr
                ? "جميع مبيعات BookingQube منسوبة بشكل صحيح للحملات والمسوقين."
                : "All incoming BookingQube conversions are properly matched or resolved."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-level-2)] text-[10px] text-[var(--text-muted)] uppercase bg-[var(--bg-level-1)]">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Unmatched Code</th>
                  <th className="py-3 px-4">Tickets</th>
                  <th className="py-3 px-4">Gross Revenue</th>
                  <th className="py-3 px-4">Net Revenue</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-level-2)]">
                {initialConversions.map((conv) => (
                  <tr key={conv.id} className="hover:bg-[var(--bg-level-1)] transition">
                    <td className="py-3 px-4 font-mono font-semibold text-[var(--text-primary)]">
                      {conv.externalOrderId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                        <Ticket className="w-3 h-3" />
                        {conv.unmatchedCode || "NONE"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-primary)] font-semibold">{conv.ticketCount}</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      {conv.grossRevenue} {conv.currency}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {conv.netRevenue} {conv.currency}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          conv.reconciliationStatus === "UNMATCHED_CODE"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : conv.reconciliationStatus === "MANUALLY_MATCHED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                        }`}
                      >
                        {conv.reconciliationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)] text-[11px]">
                      {new Date(conv.occurredAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {conv.reconciliationStatus === "UNMATCHED_CODE" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenMatch(conv)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--color-accent)] text-white text-[11px] font-semibold hover:opacity-90 transition"
                          >
                            <Link2 className="w-3 h-3" />
                            <span>Match</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDismiss(conv.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-semibold hover:bg-rose-500/20 transition"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Dismiss</span>
                          </button>
                        </>
                      )}
                      {conv.reconciliationStatus === "MANUALLY_MATCHED" && (
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          {conv.campaign?.internalCode || "Assigned"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Match Assignment Modal */}
      {selectedConversion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleMatchSubmit}
            className="w-full max-w-lg p-6 rounded-3xl bg-[var(--bg-level-1)] border border-[var(--border-level-1)] shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {isAr ? "ربط المبيعة بحملة ومسوق" : "Reconcile Conversion to Campaign"}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedConversion(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-2)] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Order ID:</span>
                <span className="font-mono text-[var(--text-primary)]">{selectedConversion.externalOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Unmatched Code:</span>
                <span className="font-mono font-bold text-amber-400">{selectedConversion.unmatchedCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Net Revenue:</span>
                <span className="font-semibold text-emerald-400">
                  {selectedConversion.netRevenue} {selectedConversion.currency}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                  Target Campaign
                </label>
                <select
                  value={matchForm.targetCampaignId}
                  onChange={(e) => {
                    const newCampId = e.target.value;
                    const camp = campaigns.find((c) => c.id === newCampId);
                    setMatchForm({
                      ...matchForm,
                      targetCampaignId: newCampId,
                      targetCampaignCreatorId: camp?.creators?.[0]?.id || "",
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-2)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                >
                  {campaigns.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      [{camp.internalCode}] {camp.titleEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                  Attributed Creator (Optional)
                </label>
                <select
                  value={matchForm.targetCampaignCreatorId}
                  onChange={(e) => setMatchForm({ ...matchForm, targetCampaignCreatorId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-2)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                >
                  <option value="">— Campaign General (No Specific Creator) —</option>
                  {selectedCampaignObj?.creators?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.influencer?.displayName} (@{c.influencer?.handle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                  Reconciliation Notes
                </label>
                <input
                  type="text"
                  value={matchForm.notes}
                  onChange={(e) => setMatchForm({ ...matchForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-2)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedConversion(null)}
                className="px-4 py-2 rounded-xl bg-[var(--bg-level-2)] text-xs text-[var(--text-muted)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold disabled:opacity-50"
              >
                {isSubmitting ? "Reconciling..." : "Confirm & Reconcile"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
