"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus,
  Trash2,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Lock,
  Filter,
  PartyPopper,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  MapPin,
  ExternalLink,
  X,
  CheckCircle2,
} from "lucide-react";
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
  title?: string | null;
  description?: string | null;
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
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [selectedScheduleForDetails, setSelectedScheduleForDetails] = useState<EventSchedule | null>(null);

  // Filters state
  const [selectedAttractionFilter, setSelectedAttractionFilter] = useState("ALL");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");

  // Form state
  const [attractionId, setAttractionId] = useState(attractions[0]?.id || "");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [eventType, setEventType] = useState("CONFIRMED_PACKAGE");
  const [title, setTitle] = useState("");
  const [capacity, setCapacity] = useState(30);

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
          title: title.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error();

      setIsAdding(false);
      setTitle("");
      router.refresh();
    } catch {
      alert(isAr ? "فشل إنشاء جدول المواعيد. يرجى المحاولة مرة أخرى." : "Failed to create schedule. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmMessage = isAr
      ? "هل أنت متأكد من رغبتك في حذف هذا الجدول الزمني؟ سيتم إلغاء قفل الفترة."
      : "Are you sure you want to delete this schedule? This will unlock the slot.";
    if (!confirm(confirmMessage)) return;

    try {
      const res = await fetch(`/api/operations/schedules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();

      setSchedules((prev) => prev.filter((s) => s.id !== id));
      if (selectedScheduleForDetails?.id === id) {
        setSelectedScheduleForDetails(null);
      }
      router.refresh();
    } catch {
      alert(isAr ? "فشل حذف الجدول الزمني. يرجى المحاولة مرة أخرى." : "Failed to delete schedule. Please try again.");
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "CONFIRMED_PACKAGE":
        return isAr ? "🔒 باقة مؤكدة (مقفل)" : "🔒 Confirmed Package (Locked)";
      case "REGULAR":
        return isAr ? "ساعات تشغيل اعتيادية" : "Regular Opening";
      case "SPECIAL":
        return isAr ? "فعالية خاصة" : "Special Event";
      case "FESTIVAL":
        return isAr ? "مهرجان موسمي" : "Festival";
      case "PRIVATE":
        return isAr ? "حجز خاص (مقفل)" : "Private Booking (Locked)";
      default:
        return type;
    }
  };

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (selectedAttractionFilter !== "ALL" && s.attractionId !== selectedAttractionFilter) {
        return false;
      }
      if (selectedTypeFilter !== "ALL" && s.eventType !== selectedTypeFilter) {
        return false;
      }
      return true;
    });
  }, [schedules, selectedAttractionFilter, selectedTypeFilter]);

  // Calendar Grid Math (Month View)
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; dateString: string }[] = [];

    // Preceding month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, totalDaysInPrevMonth - i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dateString: prevDate.toISOString().slice(0, 10),
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const curDate = new Date(year, month, d);
      days.push({
        date: curDate,
        isCurrentMonth: true,
        dateString: curDate.toISOString().slice(0, 10),
      });
    }

    // Following month padding to complete standard 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remainingCells; n++) {
      const nextDate = new Date(year, month + 1, n);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dateString: nextDate.toISOString().slice(0, 10),
      });
    }

    return days;
  }, [currentMonthDate]);

  const monthTitle = useMemo(() => {
    return currentMonthDate.toLocaleDateString(isAr ? "ar-QA" : "en-US", {
      month: "long",
      year: "numeric",
    });
  }, [currentMonthDate, isAr]);

  const weekDayHeaders = isAr
    ? ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentMonthDate(new Date());
  };

  const handleQuickAddForDate = (dateString: string) => {
    setDate(dateString);
    setIsAdding(true);
  };

  return (
    <DashboardPageShell variant="wide">
      {/* Header */}
      <DashboardPageHeader
        title={isAr ? "جدول الفعاليات وحجوزات الباقات" : "Event Calendar & Confirmed Bookings"}
        description={
          isAr
            ? "استعراض ومتابعة حجوزات باقات أعياد الميلاد والاحتفالات المؤكدة على التقويم، مع قفل التوقيت والموقع لكل مناسبة."
            : "Live interactive calendar showing confirmed celebration packages and locked venue slots by date, time, and location."
        }
        breadcrumbs={[
          { label: isAr ? "الفعاليات والباقات" : "Events & Packages", href: `/${locale}/dashboard/b2c/packages` },
          { label: isAr ? "جدول المواعيد والسعة" : "Event Calendar" },
        ]}
        badge={{
          label: isAr ? `${filteredSchedules.length} فترات محجوزة` : `${filteredSchedules.length} Booked Slots`,
          variant: "cyan",
        }}
        primaryAction={{
          label: isAdding
            ? isAr
              ? "إلغاء"
              : "Cancel"
            : isAr
            ? "حجز / قفل فترة لمناسبة"
            : "Reserve / Lock Slot",
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
              {isAr ? "نظام القفل التلقائي لحجوزات الباقات (CRM Sync)" : "Automatic Package Confirmation Sync"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isAr
                ? "عند تأكيد أي طلب في سجل الباقات (Package Leads CRM) كـ 'مؤكد' أو 'فوز'، يظهر تلقائياً على التقويم بهذا اليوم والموقع دون تعارض."
                : "When any celebration lead is set to 'Confirmed' in the Package CRM, it immediately locks and appears on this calendar at its venue & time."}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/dashboard/leads/packages`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-bold text-purple-700 dark:text-purple-200 transition-all shrink-0 cursor-pointer"
        >
          <span>{isAr ? "فتح إدارة طلبات الباقات" : "Open Package CRM"}</span>
          <ArrowRight className={cn("w-3.5 h-3.5", isAr && "rotate-180")} />
        </Link>
      </div>

      {/* Add Schedule Block Form Drawer */}
      {isAdding && (
        <form
          onSubmit={handleAddSchedule}
          className="rounded-3xl p-6 relative overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 mb-6 border border-purple-500/40 bg-[var(--surface-default)]"
        >
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <span>{isAr ? "حجز وقفل فترة زمنية جديدة لمناسبة" : "Reserve & Lock Celebration Slot"}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  {isAr ? "الموقع / الوجهة الترفيهية" : "Venue / Attraction Location"}
                </label>
                <select
                  value={attractionId}
                  onChange={(e) => setAttractionId(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]"
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
                  {isAr ? "تاريخ المناسبة" : "Event Date"}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <PartyPopper className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isAr ? "اسم المناسبة / المحتفل (اختياري)" : "Celebration / Customer Name"}</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isAr ? "مثال: حفل عيد ميلاد راشد" : "e.g. Rashid's 10th Birthday"}
                  className="w-full px-3 py-2 bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-[var(--text-primary)] rounded-lg text-sm placeholder:text-[var(--text-disabled)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  {isAr ? "وقت البدء" : "Start Time"}
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]"
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
                  className="w-full px-3 py-2 bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  {isAr ? "عدد الضيوف المقفل (السعة)" : "Locked Guest Count (Capacity)"}
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-[var(--text-primary)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
              <p className="text-[11px] text-[var(--text-tertiary)]">
                {isAr
                  ? "💡 يتم قفل الموقع والتوقيت المحدد فقط، مما يسمح بتنظيم مناسبات أخرى في نفس اليوم بأوقات أو وجهات مختلفة."
                  : "💡 Locks this specific venue and time window. Other times on the same date remain available for other celebrations."}
              </p>
              <Button type="submit">
                {isAr ? "تأكيد وقفل الفترة على التقويم" : "Confirm & Lock Slot"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Top Controls: View Mode Switcher, Month Navigation & Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] mb-6 shadow-sm">
        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer shadow-xs"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>

          <span className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] px-2 min-w-[150px] text-center font-display">
            {monthTitle}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer shadow-xs"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors ms-1 cursor-pointer shadow-xs"
          >
            {isAr ? "اليوم" : "Today"}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-bold">
            <Filter className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
            <span className="hidden sm:inline">{isAr ? "الموقع:" : "Venue:"}</span>
          </div>

          <select
            value={selectedAttractionFilter}
            onChange={(e) => setSelectedAttractionFilter(e.target.value)}
            className="px-3 py-1.5 bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] shadow-xs"
          >
            <option value="ALL">{isAr ? "جميع الوجهات والمواقع" : "All Venues & Attractions"}</option>
            {attractions.map((a) => (
              <option key={a.id} value={a.id}>
                {isAr ? a.nameAr || a.nameEn : a.nameEn}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[var(--bg-level-2)] border border-[var(--border-level-1)] rounded-xl p-1 ms-auto sm:ms-0 shadow-xs">
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                viewMode === "calendar"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{isAr ? "تقويم شهري" : "Calendar Grid"}</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                viewMode === "list"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>{isAr ? "قائمة" : "List"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE MONTH CALENDAR GRID */}
      {viewMode === "calendar" && (
        <div className="rounded-3xl border border-[var(--border-level-1)] overflow-hidden shadow-md bg-[var(--surface-default)]">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 border-b border-[var(--border-level-1)] bg-[var(--bg-level-2)] text-center text-xs font-bold text-[var(--text-secondary)] tracking-wider py-3">
            {weekDayHeaders.map((dayName, idx) => (
              <div key={idx} className="truncate px-1">
                {dayName}
              </div>
            ))}
          </div>

          {/* Month Grid Matrix */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[var(--border-level-1)] auto-rows-fr rtl:divide-x-reverse">
            {calendarDays.map((cell, idx) => {
              const dateStr = cell.dateString;
              const isToday = new Date().toISOString().slice(0, 10) === dateStr;

              // Find schedules on this day
              const daySchedules = filteredSchedules.filter((s) => {
                const sDate = new Date(s.startTime).toISOString().slice(0, 10);
                return sDate === dateStr;
              });

              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[120px] p-2 flex flex-col justify-between transition-colors relative group",
                    cell.isCurrentMonth
                      ? "bg-[var(--surface-default)] hover:bg-[var(--surface-hover)]"
                      : "bg-[var(--bg-level-1)]/60 opacity-60 hover:opacity-85",
                    isToday && "ring-1 ring-inset ring-purple-500 bg-purple-500/5 dark:bg-purple-950/15"
                  )}
                >
                  {/* Top Bar of Cell */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={cn(
                        "text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center font-mono",
                        isToday
                          ? "bg-purple-600 text-white shadow-xs"
                          : cell.isCurrentMonth
                          ? "text-[var(--text-primary)]"
                          : "text-[var(--text-disabled)]"
                      )}
                    >
                      {cell.date.getDate()}
                    </span>

                    {/* Quick Add Button on Hover */}
                    <button
                      onClick={() => handleQuickAddForDate(dateStr)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-white hover:bg-purple-600 transition-all cursor-pointer"
                      title={isAr ? "حجز فترة في هذا اليوم" : "Lock slot on this date"}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Celebration / Schedule Badges on this Day */}
                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[140px] custom-scrollbar">
                    {daySchedules.map((sched) => {
                      const startTimeFormatted = new Date(sched.startTime).toLocaleTimeString(isAr ? "ar-QA" : "en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      });
                      const isLocked = sched.eventType === "CONFIRMED_PACKAGE" || sched.eventType === "PRIVATE";

                      return (
                        <div
                          key={sched.id}
                          onClick={() => setSelectedScheduleForDetails(sched)}
                          className={cn(
                            "p-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer border flex flex-col gap-0.5",
                            isLocked
                              ? "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-900 dark:text-purple-100 shadow-xs"
                              : "bg-[var(--bg-level-2)] hover:bg-[var(--surface-hover)] border-[var(--border-level-1)] text-[var(--text-secondary)]"
                          )}
                        >
                          <div className="flex items-center justify-between gap-1 font-semibold">
                            <span className="flex items-center gap-1">
                              {isLocked && <Lock className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />}
                              <span className="font-mono text-[10px] text-amber-600 dark:text-amber-300 font-bold">{startTimeFormatted}</span>
                            </span>
                            <span className="text-[9px] px-1 rounded bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-[var(--text-secondary)] truncate max-w-[70px]">
                              {isAr ? sched.attraction.nameAr || sched.attraction.nameEn : sched.attraction.nameEn}
                            </span>
                          </div>

                          <div className="truncate text-xs font-bold text-[var(--text-primary)]">
                            {sched.title?.replace(/🔒 Confirmed:?\s*/i, "") || (isAr ? "حجز فعالية" : "Celebration Booking")}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {daySchedules.length > 0 && (
                    <div className="mt-1 text-[9px] text-[var(--text-tertiary)] font-medium">
                      {isAr
                        ? `${daySchedules.length} مناسبات محجوزة`
                        : `${daySchedules.length} booked celebration${daySchedules.length > 1 ? "s" : ""}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: TRADITIONAL LIST VIEW */}
      {viewMode === "list" && (
        <div className="rounded-3xl border border-[var(--border-level-1)] bg-[var(--surface-default)] relative overflow-hidden shadow-sm">
          <div className="relative z-10 overflow-x-auto custom-scrollbar">
            <table className="w-full text-start text-sm whitespace-nowrap border-collapse">
              <thead className="bg-[var(--bg-level-2)] border-b border-[var(--border-level-1)] text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 font-medium text-start">
                    {isAr ? "الوجهة / المناسبة" : "Venue / Celebration"}
                  </th>
                  <th className="px-6 py-4 font-medium text-start">
                    {isAr ? "التاريخ والوقت" : "Date & Time"}
                  </th>
                  <th className="px-6 py-4 font-medium text-start">
                    {isAr ? "حالة القفل والنوع" : "Lock Status & Type"}
                  </th>
                  <th className="px-6 py-4 font-medium text-start">
                    {isAr ? "السعة والضيوف" : "Capacity / Guests"}
                  </th>
                  <th className="px-6 py-4 font-medium text-end">
                    {isAr ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-level-1)]">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-tertiary)]">
                      <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      {isAr ? "لا توجد جداول زمنية مطابقة للشروط المحددة." : "No schedules match the selected filters."}
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((s) => {
                    const start = new Date(s.startTime);
                    const end = new Date(s.endTime);
                    const fillPercentage = (s.currentCount / s.capacityGate) * 100;
                    const isLockedPackage = s.eventType === "CONFIRMED_PACKAGE" || s.eventType === "PRIVATE";

                    return (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedScheduleForDetails(s)}
                        className={cn(
                          "transition-colors group cursor-pointer border-b border-[var(--border-level-1)]",
                          isLockedPackage
                            ? "bg-purple-500/5 hover:bg-purple-500/10 border-purple-500/20"
                            : "hover:bg-[var(--surface-hover)]"
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                            {isLockedPackage && (
                              <div className="p-1 rounded-md bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30" title="Exclusively Locked Slot">
                                <Lock className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <span>{isAr ? s.attraction.nameAr || s.attraction.nameEn : s.attraction.nameEn}</span>
                          </div>
                          {s.title && (
                            <div className="text-xs text-purple-600 dark:text-purple-300 font-semibold mt-0.5 truncate max-w-xs">
                              {s.title}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-[var(--text-primary)] mb-1">
                            <CalendarIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
                            <span className="font-semibold">{start.toLocaleDateString(isAr ? "ar-QA" : "en-QA")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                            <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                            <span>
                              {start.toLocaleTimeString(isAr ? "ar-QA" : "en-QA", { hour: "2-digit", minute: "2-digit" })} -{" "}
                              {end.toLocaleTimeString(isAr ? "ar-QA" : "en-QA", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="default"
                            className={cn(
                              "border text-xs",
                              isLockedPackage
                                ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40"
                                : "bg-transparent border-[var(--border-level-1)] text-[var(--text-secondary)]"
                            )}
                          >
                            {getEventTypeLabel(s.eventType)}
                          </Badge>
                          {isLockedPackage && (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                              {isAr ? "مقفل للوجهة بهذا التوقيت" : "Venue Locked for this Time"}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5 w-32">
                            <div className="flex justify-between text-xs">
                              <span className="text-[var(--text-secondary)] flex items-center gap-1">
                                <Users className="w-3 h-3" /> {s.currentCount}
                              </span>
                              <span className="text-[var(--text-tertiary)]">/ {s.capacityGate}</span>
                            </div>
                            <div className="h-1.5 w-full bg-[var(--surface-hover)] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isLockedPackage
                                    ? "bg-purple-500"
                                    : fillPercentage >= 100
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
                        <td className="px-6 py-4 text-end" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-2 text-[var(--color-error)] hover:bg-[#EF444415] rounded-md transition-colors cursor-pointer"
                            title={isAr ? "حذف الفترة الزمنية وإلغاء القفل" : "Delete Schedule & Unlock Slot"}
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
      )}

      {/* QUICK CELEBRATION DETAILS MODAL */}
      {selectedScheduleForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[var(--surface-default)] border border-[var(--border-level-1)] text-[var(--text-primary)] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-display">
                    {selectedScheduleForDetails.title || (isAr ? "حجز فعالية مؤكدة" : "Confirmed Celebration Booking")}
                  </h3>
                  <div className="text-xs text-purple-600 dark:text-purple-300 flex items-center gap-1.5 mt-0.5 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {isAr
                        ? selectedScheduleForDetails.attraction.nameAr || selectedScheduleForDetails.attraction.nameEn
                        : selectedScheduleForDetails.attraction.nameEn}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedScheduleForDetails(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs">
              <div>
                <span className="text-[var(--text-secondary)] block mb-1">{isAr ? "التاريخ:" : "Date:"}</span>
                <span className="font-bold text-[var(--text-primary)] font-mono">
                  {new Date(selectedScheduleForDetails.startTime).toLocaleDateString(isAr ? "ar-QA" : "en-QA")}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block mb-1">{isAr ? "الوقت المحجوز:" : "Locked Time Slot:"}</span>
                <span className="font-bold text-amber-600 dark:text-amber-300 font-mono">
                  {new Date(selectedScheduleForDetails.startTime).toLocaleTimeString(isAr ? "ar-QA" : "en-QA", { hour: "2-digit", minute: "2-digit" })} -{" "}
                  {new Date(selectedScheduleForDetails.endTime).toLocaleTimeString(isAr ? "ar-QA" : "en-QA", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block mb-1">{isAr ? "السعة والضيوف:" : "Capacity / Guests:"}</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {selectedScheduleForDetails.capacityGate} {isAr ? "ضيفاً" : "Guests"}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block mb-1">{isAr ? "حالة الحجز:" : "Status:"}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isAr ? "مؤكد ومقفل للوجهة" : "Confirmed & Locked"}</span>
                </span>
              </div>
            </div>

            {selectedScheduleForDetails.description && (
              <div className="text-xs text-[var(--text-secondary)] bg-[var(--bg-level-2)] p-3 rounded-xl border border-[var(--border-level-1)] leading-relaxed">
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block mb-1">
                  {isAr ? "تفاصيل الطلب وملاحظات الحجز:" : "Booking Notes / Reference:"}
                </span>
                {selectedScheduleForDetails.description.replace(/\[PACKAGE_LEAD_ID:[^\]]+\]\s*/, "")}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-level-1)]">
              <button
                onClick={() => handleDelete(selectedScheduleForDetails.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? "إلغاء قفل الفترة" : "Unlock / Delete Slot"}</span>
              </button>

              <Link
                href={`/${locale}/dashboard/leads/packages`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <span>{isAr ? "فتح في سجل الباقات (CRM)" : "Open in Package CRM"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardPageShell>
  );
}
