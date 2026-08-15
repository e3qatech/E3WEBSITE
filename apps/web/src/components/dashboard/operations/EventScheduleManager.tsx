"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, Clock, Users, Plus, Trash2, CalendarDays, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLocale } from "@/components/layout/LocaleProvider";
import { cn } from "@/lib/utils";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui";

type Attraction = {
  id: string;
  nameEn: string;
  nameAr?: string;
};

type EventSchedule = {
  id: string;
  attractionId: string;
  startTime: string;
  endTime: string;
  eventType: string;
  capacityGate: number;
  currentCount: number;
  attraction: { nameEn: string; nameAr?: string };
};

export function EventScheduleManager({
  initialSchedules,
  attractions,
}: {
  initialSchedules: EventSchedule[];
  attractions: Attraction[];
}) {
  const router = useRouter();
  const { locale: contextLocale } = useLocale();
  const pathname = usePathname();
  const locale = pathname?.startsWith("/ar") ? "ar" : contextLocale || "en";
  const isAr = locale === "ar";

  const [schedules, setSchedules] = useState(initialSchedules);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [attractionId, setAttractionId] = useState(attractions[0]?.id || "");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [eventType, setEventType] = useState("REGULAR");
  const [capacity, setCapacity] = useState(100);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) return;

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    try {
      const res = await fetch("/api/operations/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attractionId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          eventType,
          capacityGate: capacity,
        }),
      });

      if (!res.ok) throw new Error();

      setIsAdding(false);
      router.refresh();
    } catch {
      alert(isAr ? "فشل إنشاء جدول المواعيد. يرجى المحاولة مرة أخرى." : "Failed to create schedule. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmMessage = isAr
      ? "هل أنت متأكد من رغبتك في حذف هذا الجدول الزمني؟"
      : "Are you sure you want to delete this schedule?";
    if (!confirm(confirmMessage)) return;

    try {
      const res = await fetch(`/api/operations/schedules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();

      setSchedules((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    } catch {
      alert(isAr ? "فشل حذف الجدول الزمني. يرجى المحاولة مرة أخرى." : "Failed to delete schedule. Please try again.");
    }
  };

  const getEventTypeLabel = (type: string) => {
    if (!isAr) return type;
    switch (type) {
      case "REGULAR":
        return "ساعات تشغيل اعتيادية";
      case "SPECIAL":
        return "فعالية خاصة";
      case "FESTIVAL":
        return "مهرجان موسمى";
      case "PRIVATE":
        return "حجز خاص";
      default:
        return type;
    }
  };

  return (
    <DashboardPageShell variant="wide">
      {/* Header */}
      <DashboardPageHeader
        title={isAr ? "جداول الفعاليات وسعة الحضور" : "Event Schedules & Capacity Gates"}
        description={
          isAr
            ? "إدارة أوقات تشغيل التجارب والوجهات، تقويم الفعاليات الخاصة، وتتبع سعة الحضور المباشرة."
            : "Manage attraction opening hours, special events calendar, live headcount, and capacity thresholds."
        }
        breadcrumbs={[
          { label: isAr ? "العمليات" : "Operations", href: `/${locale}/dashboard/operations/events` },
          { label: isAr ? "جداول المواعيد والسعة" : "Event Schedules & Capacity" },
        ]}
        badge={{
          label: isAr ? `${schedules.length} فترات زمنية` : `${schedules.length} Blocks`,
          variant: "cyan",
        }}
        primaryAction={{
          label: isAdding
            ? isAr
              ? "إلغاء"
              : "Cancel"
            : isAr
            ? "إضافة فترة زمنية"
            : "Add Schedule Block",
          onClick: () => setIsAdding(!isAdding),
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      {/* Reciprocal Ownership Handoff Card to B2C Calendar Page Editor */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 backdrop-blur-md mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {isAr ? "محرر صفحة التقويم والفعاليات العامة (B2C)" : "Public Calendar Page & Presentation CMS (B2C)"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isAr
                ? "لتعديل واجهة صفحة الفعاليات العامة، والوسائط الترويجية، والعروض والخصومات، وبيانات محركات البحث، انتقل إلى محرر صفحة التقويم."
                : "To edit the public calendar hero presentation, promotional discounts, and SEO metadata (/b2c/calendar), use the B2C Calendar Page Editor."}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/dashboard/b2c/calendar-page`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-bold text-purple-200 transition-all shrink-0 cursor-pointer"
        >
          <span>{isAr ? "فتح محرر صفحة التقويم" : "Open Calendar Page Editor"}</span>
          <ArrowRight className={cn("w-3.5 h-3.5", isAr && "rotate-180")} />
        </Link>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAddSchedule}
          className="glass rounded-3xl p-6 border-gradient relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 mb-6"
        >
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
          <div className="relative z-10 space-y-4">
            <h2 className="font-bold text-[var(--text-primary)]">
              {isAr ? "إضافة فترة جدول زمني جديدة" : "New Schedule Block"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  {isAr ? "الوجهة الترفيهية" : "Attraction"}
                </label>
                <select
                  value={attractionId}
                  onChange={(e) => setAttractionId(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
                  required
                >
                  {attractions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {isAr ? a.nameAr || a.nameEn : a.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  {isAr ? "التاريخ" : "Date"}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  {isAr ? "نوع الفعالية" : "Type"}
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
                >
                  <option value="REGULAR">{isAr ? "ساعات تشغيل اعتيادية" : "Regular Opening"}</option>
                  <option value="SPECIAL">{isAr ? "فعالية خاصة" : "Special Event"}</option>
                  <option value="FESTIVAL">{isAr ? "مهرجان موسمي" : "Festival"}</option>
                  <option value="PRIVATE">{isAr ? "حجز خاص" : "Private Booking"}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  {isAr ? "وقت البدء" : "Start Time"}
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  {isAr ? "وقت الانتهاء" : "End Time"}
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  {isAr ? "بوابة السعة (الحد الأقصى للتذاكر)" : "Capacity Gate (Max Tickets)"}
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm"
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit">
                {isAr ? "حفظ الفترة الزمنية" : "Create Schedule"}
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="glass rounded-3xl border-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
        <div className="relative z-10 overflow-x-auto custom-scrollbar">
          <table className="w-full text-start text-sm whitespace-nowrap border-collapse">
            <thead className="bg-zinc-950/50 border-b border-zinc-800/50 text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 font-medium text-start">
                  {isAr ? "الوجهة" : "Attraction"}
                </th>
                <th className="px-6 py-4 font-medium text-start">
                  {isAr ? "التاريخ والوقت" : "Date & Time"}
                </th>
                <th className="px-6 py-4 font-medium text-start">
                  {isAr ? "النوع" : "Type"}
                </th>
                <th className="px-6 py-4 font-medium text-start">
                  {isAr ? "السعة" : "Capacity"}
                </th>
                <th className="px-6 py-4 font-medium text-end">
                  {isAr ? "الإجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-tertiary)]">
                    <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    {isAr ? "لا توجد جداول زمنية مضافة حالياً." : "No schedules created yet."}
                  </td>
                </tr>
              ) : (
                schedules.map((s) => {
                  const start = new Date(s.startTime);
                  const end = new Date(s.endTime);
                  const fillPercentage = (s.currentCount / s.capacityGate) * 100;

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-zinc-900/50 transition-colors group cursor-pointer border-b border-zinc-800/30"
                    >
                      <td className="px-6 py-4 font-bold text-[var(--text-primary)]">
                        {isAr ? s.attraction.nameAr || s.attraction.nameEn : s.attraction.nameEn}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[var(--text-primary)] mb-1">
                          <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
                          {start.toLocaleDateString(isAr ? "ar-QA" : "en-QA")}
                        </div>
                        <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                          <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                          {start.toLocaleTimeString(isAr ? "ar-QA" : "en-QA", { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {end.toLocaleTimeString(isAr ? "ar-QA" : "en-QA", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="default" className="bg-transparent border border-[var(--border-default)]">
                          {getEventTypeLabel(s.eventType)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 w-32">
                          <div className="flex justify-between text-xs">
                            <span className="text-[var(--text-secondary)] flex items-center gap-1">
                              <Users className="w-3 h-3" /> {s.currentCount}
                            </span>
                            <span className="text-[var(--text-tertiary)]">/ {s.capacityGate}</span>
                          </div>
                          <div className="h-1.5 w-full bg-[var(--surface-subtle)] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                fillPercentage >= 100
                                  ? "bg-[var(--color-error)]"
                                  : fillPercentage > 80
                                  ? "bg-[var(--color-warning)]"
                                  : "bg-[var(--color-success)]"
                              }`}
                              style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-end">
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 text-[var(--color-error)] hover:bg-[#EF444415] rounded-md transition-colors"
                          title={isAr ? "حذف الفترة الزمنية" : "Delete Schedule"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardPageShell>
  );
}
