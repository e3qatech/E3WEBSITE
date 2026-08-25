"use client";

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  CalendarRange,
  Layers,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import {
  AdvancedTemporalStatus,
  DayKey,
  DayScheduleSlot,
  SpecialDateOverride,
  DAYS_ORDER,
  DAY_LABELS,
  SCHEDULE_PRESETS,
  getDefaultTemporalStatus,
  generateBilingualScheduleSummary,
  calculateQatarOperatingStatus,
  formatTime12h,
} from '@/lib/operating-schedule-helper';

interface OperatingScheduleStudioProps {
  temporalStatus: any;
  onChange: (updated: AdvancedTemporalStatus) => void;
  markDirty?: () => void;
}

export function OperatingScheduleStudio({
  temporalStatus: initialRaw,
  onChange,
  markDirty,
}: OperatingScheduleStudioProps) {
  // Normalize incoming temporalStatus
  const [data, setData] = useState<AdvancedTemporalStatus>(() => {
    const defaults = getDefaultTemporalStatus();
    if (!initialRaw) return defaults;

    const weekly = initialRaw.weeklySchedule || defaults.weeklySchedule;
    return {
      ...defaults,
      ...initialRaw,
      weeklySchedule: {
        ...defaults.weeklySchedule,
        ...weekly,
      },
      specialDates: Array.isArray(initialRaw.specialDates) ? initialRaw.specialDates : [],
    };
  });

  const [activeTab, setActiveTab] = useState<'weekly' | 'lifespan' | 'exceptions'>('weekly');
  const [newExceptionDate, setNewExceptionDate] = useState('');
  const [newExceptionReasonEn, setNewExceptionReasonEn] = useState('');
  const [newExceptionReasonAr, setNewExceptionReasonAr] = useState('');
  const [newExceptionIsClosed, setNewExceptionIsClosed] = useState(true);

  // Sync state upward
  const updateData = (next: AdvancedTemporalStatus) => {
    setData(next);
    onChange(next);
    if (markDirty) markDirty();
  };

  // Preset Applicator
  const applyPreset = (presetId: string) => {
    const preset = SCHEDULE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const summary = generateBilingualScheduleSummary(preset.schedule);
    const next: AdvancedTemporalStatus = {
      ...data,
      weeklySchedule: preset.schedule,
      operatingHoursEn: summary.en,
      operatingHoursAr: summary.ar,
      openTime: preset.schedule.sunday.slots[0]?.openTime || '10:00',
      closeTime: preset.schedule.sunday.slots[0]?.closeTime || '22:00',
    };
    updateData(next);
  };

  // Toggle Day Open / Closed
  const handleToggleDay = (day: DayKey) => {
    const daySchedule = data.weeklySchedule[day] || { day, isOpen: false, slots: [] };
    const isOpen = !daySchedule.isOpen;
    const slots = isOpen && (!daySchedule.slots || daySchedule.slots.length === 0)
      ? [{ id: `s-${Date.now()}`, openTime: '10:00', closeTime: '22:00' }]
      : daySchedule.slots;

    const nextWeekly = {
      ...data.weeklySchedule,
      [day]: {
        ...daySchedule,
        isOpen,
        slots,
      },
    };

    const summary = generateBilingualScheduleSummary(nextWeekly);
    updateData({
      ...data,
      weeklySchedule: nextWeekly,
      operatingHoursEn: summary.en,
      operatingHoursAr: summary.ar,
    });
  };

  // Update a specific shift slot
  const handleUpdateSlot = (day: DayKey, slotIdx: number, field: 'openTime' | 'closeTime', val: string) => {
    const daySchedule = data.weeklySchedule[day];
    if (!daySchedule) return;

    const nextSlots = [...daySchedule.slots];
    nextSlots[slotIdx] = {
      ...nextSlots[slotIdx],
      [field]: val,
    };

    const nextWeekly = {
      ...data.weeklySchedule,
      [day]: {
        ...daySchedule,
        slots: nextSlots,
      },
    };

    const summary = generateBilingualScheduleSummary(nextWeekly);
    updateData({
      ...data,
      weeklySchedule: nextWeekly,
      operatingHoursEn: summary.en,
      operatingHoursAr: summary.ar,
    });
  };

  // Add a shift slot
  const handleAddSlot = (day: DayKey) => {
    const daySchedule = data.weeklySchedule[day];
    if (!daySchedule) return;

    const lastSlot = daySchedule.slots[daySchedule.slots.length - 1];
    const newSlot: DayScheduleSlot = {
      id: `slot-${Date.now()}`,
      openTime: lastSlot ? '16:00' : '10:00',
      closeTime: lastSlot ? '23:00' : '14:00',
      labelEn: 'Evening Shift',
      labelAr: 'فترة مسائية',
    };

    const nextWeekly = {
      ...data.weeklySchedule,
      [day]: {
        ...daySchedule,
        isOpen: true,
        slots: [...daySchedule.slots, newSlot],
      },
    };

    const summary = generateBilingualScheduleSummary(nextWeekly);
    updateData({
      ...data,
      weeklySchedule: nextWeekly,
      operatingHoursEn: summary.en,
      operatingHoursAr: summary.ar,
    });
  };

  // Delete a shift slot
  const handleDeleteSlot = (day: DayKey, slotIdx: number) => {
    const daySchedule = data.weeklySchedule[day];
    if (!daySchedule) return;

    const nextSlots = daySchedule.slots.filter((_, i) => i !== slotIdx);
    const isOpen = nextSlots.length > 0;

    const nextWeekly = {
      ...data.weeklySchedule,
      [day]: {
        ...daySchedule,
        isOpen,
        slots: nextSlots,
      },
    };

    const summary = generateBilingualScheduleSummary(nextWeekly);
    updateData({
      ...data,
      weeklySchedule: nextWeekly,
      operatingHoursEn: summary.en,
      operatingHoursAr: summary.ar,
    });
  };

  // Add Special Date Exception
  const handleAddException = () => {
    if (!newExceptionDate) return;
    const newOverride: SpecialDateOverride = {
      id: `exc-${Date.now()}`,
      date: newExceptionDate,
      reasonEn: newExceptionReasonEn || 'Holiday / Exception',
      reasonAr: newExceptionReasonAr || 'عطلة / استثناء',
      isClosed: newExceptionIsClosed,
    };

    updateData({
      ...data,
      specialDates: [...data.specialDates, newOverride],
    });

    setNewExceptionDate('');
    setNewExceptionReasonEn('');
    setNewExceptionReasonAr('');
  };

  // Delete Exception
  const handleDeleteException = (id: string) => {
    updateData({
      ...data,
      specialDates: data.specialDates.filter(e => e.id !== id),
    });
  };

  // Auto Generate Summary
  const handleRegenerateSummary = () => {
    const summary = generateBilingualScheduleSummary(data.weeklySchedule);
    updateData({
      ...data,
      operatingHoursEn: summary.en,
      operatingHoursAr: summary.ar,
    });
  };

  // Live Qatar Status
  const qatarStatus = calculateQatarOperatingStatus(data);

  return (
    <div className="space-y-6">
      {/* Studio Header & Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-level-1)]">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Operating Schedule & Timing Studio
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Configure permanent setups, seasonal date-ranges, 7-day weekly matrices, and multiple shifts.
          </p>
        </div>

        {/* Live Qatar Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${qatarStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="font-bold text-[var(--text-primary)]">{qatarStatus.statusTextEn}</span>
          <span className="text-[var(--text-tertiary)]">• {qatarStatus.nextEventTextEn}</span>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-level-2)] pb-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('weekly')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'weekly' ? 'bg-purple-600 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>1. Weekly 7-Day Matrix & Shifts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lifespan')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'lifespan' ? 'bg-purple-600 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]'
          }`}
        >
          <CalendarRange className="w-3.5 h-3.5" />
          <span>2. Seasonality & Dates Lifespan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exceptions')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'exceptions' ? 'bg-purple-600 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>3. Holiday & Date Exceptions ({data.specialDates?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: WEEKLY 7-DAY MATRIX & SHIFTS */}
      {activeTab === 'weekly' && (
        <div className="space-y-4">
          {/* Presets Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-[var(--text-primary)]">Quick Qatar Presets:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {SCHEDULE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[var(--surface-default)] hover:bg-purple-600 hover:text-white border border-[var(--border-level-2)] text-[var(--text-secondary)] transition-colors cursor-pointer"
                >
                  {preset.id === 'qatar_mall_standard' ? 'Qatar Mall Standard' :
                   preset.id === 'daily_standard_10_10' ? 'Daily 10–10' : 'Split Shifts'}
                </button>
              ))}
            </div>
          </div>

          {/* 7 Days Table / Cards */}
          <div className="space-y-2.5">
            {DAYS_ORDER.map(dayKey => {
              const daySchedule = data.weeklySchedule[dayKey] || { day: dayKey, isOpen: false, slots: [] };
              const isFriday = dayKey === 'friday';

              return (
                <div
                  key={dayKey}
                  className={`p-3.5 rounded-2xl border transition-colors ${
                    daySchedule.isOpen
                      ? 'bg-[var(--surface-default)] border-[var(--border-level-2)]'
                      : 'bg-[var(--surface-subtle)]/50 border-[var(--border-level-1)] opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Day Title & Toggle */}
                    <div className="flex items-center gap-3 min-w-[160px]">
                      <button
                        type="button"
                        onClick={() => handleToggleDay(dayKey)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          daySchedule.isOpen ? 'bg-emerald-500' : 'bg-zinc-600'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 start-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                            daySchedule.isOpen ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-[var(--text-primary)]">
                            {DAY_LABELS[dayKey].en}
                          </span>
                          <span className="text-[11px] text-[var(--text-tertiary)] font-arabic">
                            ({DAY_LABELS[dayKey].ar})
                          </span>
                        </div>
                        {isFriday && (
                          <span className="text-[10px] text-amber-400 font-semibold block">
                            (Friday Post-Prayer)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Shifts / Slots */}
                    <div className="flex-1">
                      {daySchedule.isOpen ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {daySchedule.slots.map((slot, sIdx) => (
                            <div
                              key={slot.id || sIdx}
                              className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)]"
                            >
                              {sIdx === 0 ? (
                                <Sun className="w-3.5 h-3.5 text-amber-400 ms-1 shrink-0" />
                              ) : (
                                <Moon className="w-3.5 h-3.5 text-purple-400 ms-1 shrink-0" />
                              )}

                              <input
                                type="time"
                                value={slot.openTime || '10:00'}
                                onChange={e => handleUpdateSlot(dayKey, sIdx, 'openTime', e.target.value)}
                                className="bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-lg px-2 py-1 text-xs font-mono text-[var(--text-primary)]"
                              />
                              <span className="text-[11px] text-[var(--text-tertiary)]">to</span>
                              <input
                                type="time"
                                value={slot.closeTime || '22:00'}
                                onChange={e => handleUpdateSlot(dayKey, sIdx, 'closeTime', e.target.value)}
                                className="bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-lg px-2 py-1 text-xs font-mono text-[var(--text-primary)]"
                              />

                              {daySchedule.slots.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSlot(dayKey, sIdx)}
                                  className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                  title="Remove Shift"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => handleAddSlot(dayKey)}
                            className="px-2.5 py-1.5 rounded-xl border border-dashed border-purple-500/40 hover:border-purple-500 text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Shift</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-[var(--text-tertiary)] italic">
                          Closed / يوم راحة
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SEASONALITY & LIFESPAN */}
      {activeTab === 'lifespan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => updateData({ ...data, lifespanType: 'PERMANENT', isOngoing: true })}
              className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
                data.lifespanType === 'PERMANENT'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold shadow-sm'
                  : 'border-[var(--border-level-2)] bg-[var(--surface-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              <div className="text-xs font-black uppercase tracking-wider mb-1">🟢 Permanent Setup</div>
              <div className="text-[11px] font-normal leading-relaxed">
                Ongoing landmark FEC, mall anchor, or continuous physical attraction with no end date.
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateData({ ...data, lifespanType: 'SEASONAL', isOngoing: false })}
              className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
                data.lifespanType === 'SEASONAL'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-bold shadow-sm'
                  : 'border-[var(--border-level-2)] bg-[var(--surface-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              <div className="text-xs font-black uppercase tracking-wider mb-1">🟡 Seasonal Pop-Up / Festival</div>
              <div className="text-[11px] font-normal leading-relaxed">
                Active for a specific season or multi-month window (e.g. Winter Festival, Water Activation).
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateData({ ...data, lifespanType: 'SINGLE_DAY', isOngoing: false })}
              className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
                data.lifespanType === 'SINGLE_DAY'
                  ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-bold shadow-sm'
                  : 'border-[var(--border-level-2)] bg-[var(--surface-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              <div className="text-xs font-black uppercase tracking-wider mb-1">🟣 Single Day / Tournament</div>
              <div className="text-[11px] font-normal leading-relaxed">
                Single-day tournament, esports championship, parade, or private gala.
              </div>
            </button>
          </div>

          {/* Date Range Inputs (For Seasonal / Temporary) */}
          {data.lifespanType !== 'PERMANENT' && (
            <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] space-y-4">
              <h4 className="text-xs font-bold text-[var(--text-primary)]">
                Operational Lifespan Window (From Date $\to$ Till Date)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block mb-1">
                    Valid From (Start Date) *
                  </label>
                  <input
                    type="date"
                    value={data.startDate || ''}
                    onChange={e => updateData({ ...data, startDate: e.target.value })}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block mb-1">
                    Valid Till (End Date) *
                  </label>
                  <input
                    type="date"
                    value={data.endDate || ''}
                    onChange={e => updateData({ ...data, endDate: e.target.value })}
                    className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HOLIDAY & DATE EXCEPTIONS */}
      {activeTab === 'exceptions' && (
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-secondary)]">
            Specify specific holiday dates with custom opening hours or mark whole-day closures (e.g. National Day, Ramadan timings, maintenance days).
          </p>

          {/* New Exception Creator */}
          <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--border-level-2)] grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block mb-1">Date</label>
              <input
                type="date"
                value={newExceptionDate}
                onChange={e => setNewExceptionDate(e.target.value)}
                className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block mb-1">Reason (EN)</label>
              <input
                type="text"
                placeholder="e.g. National Day"
                value={newExceptionReasonEn}
                onChange={e => setNewExceptionReasonEn(e.target.value)}
                className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block mb-1">السبب (AR)</label>
              <input
                type="text"
                dir="rtl"
                placeholder="اليوم الوطني"
                value={newExceptionReasonAr}
                onChange={e => setNewExceptionReasonAr(e.target.value)}
                className="w-full bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] font-arabic"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={handleAddException}
                disabled={!newExceptionDate}
                className="w-full px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Exception</span>
              </button>
            </div>
          </div>

          {/* Exceptions List */}
          {data.specialDates && data.specialDates.length > 0 ? (
            <div className="space-y-2">
              {data.specialDates.map(exc => (
                <div
                  key={exc.id}
                  className="p-3 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                      {exc.date}
                    </span>
                    <span className="font-bold text-[var(--text-primary)]">{exc.reasonEn}</span>
                    <span className="text-[var(--text-tertiary)] font-arabic">({exc.reasonAr})</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      CLOSED
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteException(exc.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[var(--text-tertiary)] italic">
              No special date exceptions configured.
            </div>
          )}
        </div>
      )}

      {/* Bilingual Display Strings Preview */}
      <div className="pt-4 border-t border-[var(--border-level-1)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Auto-Generated Public Display Summary
          </span>
          <button
            type="button"
            onClick={handleRegenerateSummary}
            className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Re-compile Summary</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block mb-1">
              Display Hours (English)
            </label>
            <input
              type="text"
              value={data.operatingHoursEn || ''}
              onChange={e => updateData({ ...data, operatingHoursEn: e.target.value })}
              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block mb-1 text-right" dir="rtl">
              أوقات العمل (العربية)
            </label>
            <input
              type="text"
              dir="rtl"
              value={data.operatingHoursAr || ''}
              onChange={e => updateData({ ...data, operatingHoursAr: e.target.value })}
              className="w-full bg-[var(--surface-subtle)] border border-[var(--border-level-2)] rounded-xl px-3 py-2 text-xs text-right text-[var(--text-primary)] font-arabic"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
