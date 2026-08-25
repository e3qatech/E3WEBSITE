export interface DayScheduleSlot {
  id: string;
  openTime: string;  // "HH:MM" e.g. "10:00"
  closeTime: string; // "HH:MM" e.g. "22:00"
  labelEn?: string;  // e.g. "Morning Shift"
  labelAr?: string;  // e.g. "الفترة الصباحية"
}

export type DayKey = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface DayOfWeekSchedule {
  day: DayKey;
  isOpen: boolean;
  slots: DayScheduleSlot[];
}

export interface SpecialDateOverride {
  id: string;
  date: string; // "YYYY-MM-DD"
  reasonEn: string;
  reasonAr: string;
  isClosed: boolean;
  slots?: DayScheduleSlot[];
}

export interface AdvancedTemporalStatus {
  lifespanType: 'PERMANENT' | 'SEASONAL' | 'SINGLE_DAY' | 'POPUP';
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string;   // "YYYY-MM-DD"
  isOngoing?: boolean;
  weeklySchedule: Record<DayKey, DayOfWeekSchedule>;
  specialDates: SpecialDateOverride[];
  openTime: string;
  closeTime: string;
  operatingHoursEn: string;
  operatingHoursAr: string;
  timezone?: string; // "Asia/Qatar"
}

export const DAYS_ORDER: DayKey[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
];

export const DAY_LABELS: Record<DayKey, { en: string; ar: string; shortEn: string; shortAr: string }> = {
  sunday: { en: 'Sunday', ar: 'الأحد', shortEn: 'Sun', shortAr: 'أحد' },
  monday: { en: 'Monday', ar: 'الاثنين', shortEn: 'Mon', shortAr: 'إثنين' },
  tuesday: { en: 'Tuesday', ar: 'Tuesday', shortEn: 'Tue', shortAr: 'ثلاثاء' },
  wednesday: { en: 'Wednesday', ar: 'الأربعاء', shortEn: 'Wed', shortAr: 'أربعاء' },
  thursday: { en: 'Thursday', ar: 'الخميس', shortEn: 'Thu', shortAr: 'خميس' },
  friday: { en: 'Friday', ar: 'الجمعة', shortEn: 'Fri', shortAr: 'جمعة' },
  saturday: { en: 'Saturday', ar: 'السبت', shortEn: 'Sat', shortAr: 'سبت' },
};

export const SCHEDULE_PRESETS = [
  {
    id: 'qatar_mall_standard',
    nameEn: 'Qatar Mall Standard (Sun–Wed 12–10PM, Thu 12–11PM, Fri 1–11PM, Sat 10AM–10PM)',
    nameAr: 'مواعيد مجمعات قطر (أحد–أربعاء ١٢–١٠م، خميس ١٢–١١م، جمعة ١–١١م، سبت ١٠ص–١٠م)',
    schedule: {
      sunday: { day: 'sunday', isOpen: true, slots: [{ id: 's1', openTime: '12:00', closeTime: '22:00' }] },
      monday: { day: 'monday', isOpen: true, slots: [{ id: 's1', openTime: '12:00', closeTime: '22:00' }] },
      tuesday: { day: 'tuesday', isOpen: true, slots: [{ id: 's1', openTime: '12:00', closeTime: '22:00' }] },
      wednesday: { day: 'wednesday', isOpen: true, slots: [{ id: 's1', openTime: '12:00', closeTime: '22:00' }] },
      thursday: { day: 'thursday', isOpen: true, slots: [{ id: 's1', openTime: '12:00', closeTime: '23:00' }] },
      friday: { day: 'friday', isOpen: true, slots: [{ id: 's1', openTime: '13:00', closeTime: '23:00' }] },
      saturday: { day: 'saturday', isOpen: true, slots: [{ id: 's1', openTime: '10:00', closeTime: '22:00' }] },
    } as Record<DayKey, DayOfWeekSchedule>
  },
  {
    id: 'daily_standard_10_10',
    nameEn: 'Daily Standard 10:00 AM – 10:00 PM',
    nameAr: 'يومياً من ١٠:٠٠ صباحاً حتى ١٠:٠٠ مساءً',
    schedule: {
      sunday: { day: 'sunday', isOpen: true, slots: [{ id: 's1', openTime: '10:00', closeTime: '22:00' }] },
      monday: { day: 'monday', isOpen: true, slots: [{ id: 's1', openTime: '10:00', closeTime: '22:00' }] },
      tuesday: { day: 'tuesday', isOpen: true, slots: [{ id: 's1', openTime: '10:00', closeTime: '22:00' }] },
      wednesday: { day: 'wednesday', isOpen: true, slots: [{ id: 's1', openTime: '10:00', closeTime: '22:00' }] },
      thursday: { day: 'thursday', isOpen: true, slots: [{ id: 's1', openTime: '10:00', closeTime: '22:00' }] },
      friday: { day: 'friday', isOpen: true, slots: [{ id: 's1', openTime: '13:00', closeTime: '22:00' }] },
      saturday: { day: 'saturday', isOpen: true, slots: [{ id: 's1', openTime: '10:00', closeTime: '22:00' }] },
    } as Record<DayKey, DayOfWeekSchedule>
  },
  {
    id: 'double_shift',
    nameEn: 'Split Shifts (Morning 10:00–13:00 & Evening 16:00–23:00)',
    nameAr: 'فترتان يومياً (صباحية ١٠–١ ظهراً ومسائية ٤–١١ مساءً)',
    schedule: {
      sunday: { day: 'sunday', isOpen: true, slots: [{ id: 's1', openTime: '10:00', closeTime: '13:00', labelEn: 'Morning', labelAr: 'صباحية' }, { id: 's2', openTime: '16:00', closeTime: '23:00', labelEn: 'Evening', labelAr: 'مسائية' }] },
      monday: { day: 'monday', isOpen: true, slots: [{ id: 's1', openTime: '10:00', closeTime: '13:00', labelEn: 'Morning', labelAr: 'صباحية' }, { id: 's2', openTime: '16:00', closeTime: '23:00', labelEn: 'Evening', labelAr: 'مسائية' }] },
      tuesday: { day: 'tuesday', isOpen: true, slots: [{ id: 's1', openTime: '10:00', closeTime: '13:00', labelEn: 'Morning', labelAr: 'صباحية' }, { id: 's2', openTime: '16:00', closeTime: '23:00', labelEn: 'Evening', labelAr: 'مسائية' }] },
      wednesday: { day: 'wednesday', isOpen: true, slots: [{ id: 's1', openTime: '10:00', closeTime: '13:00', labelEn: 'Morning', labelAr: 'صباحية' }, { id: 's2', openTime: '16:00', closeTime: '23:00', labelEn: 'Evening', labelAr: 'مسائية' }] },
      thursday: { day: 'thursday', isOpen: true, slots: [{ id: 's1', openTime: '10:00', closeTime: '13:00', labelEn: 'Morning', labelAr: 'صباحية' }, { id: 's2', openTime: '16:00', closeTime: '23:59', labelEn: 'Evening', labelAr: 'مسائية' }] },
      friday: { day: 'friday', isOpen: true, slots: [{ id: 's2', openTime: '14:00', closeTime: '23:59', labelEn: 'Evening', labelAr: 'مسائية' }] },
      saturday: { day: 'saturday', isOpen: true, slots: [{ id: 's1', openTime: '10:00', closeTime: '13:00', labelEn: 'Morning', labelAr: 'صباحية' }, { id: 's2', openTime: '16:00', closeTime: '23:00', labelEn: 'Evening', labelAr: 'مسائية' }] },
    } as Record<DayKey, DayOfWeekSchedule>
  }
];

export function getDefaultTemporalStatus(): AdvancedTemporalStatus {
  return {
    lifespanType: 'PERMANENT',
    isOngoing: true,
    weeklySchedule: {
      sunday: { day: 'sunday', isOpen: true, slots: [{ id: 's1', openTime: '12:00', closeTime: '22:00' }] },
      monday: { day: 'monday', isOpen: true, slots: [{ id: 's1', openTime: '12:00', closeTime: '22:00' }] },
      tuesday: { day: 'tuesday', isOpen: true, slots: [{ id: 's1', openTime: '12:00', closeTime: '22:00' }] },
      wednesday: { day: 'wednesday', isOpen: true, slots: [{ id: 's1', openTime: '12:00', closeTime: '22:00' }] },
      thursday: { day: 'thursday', isOpen: true, slots: [{ id: 's1', openTime: '12:00', closeTime: '23:00' }] },
      friday: { day: 'friday', isOpen: true, slots: [{ id: 's1', openTime: '13:00', closeTime: '23:00' }] },
      saturday: { day: 'saturday', isOpen: true, slots: [{ id: 's1', openTime: '10:00', closeTime: '22:00' }] },
    },
    specialDates: [],
    openTime: '10:00',
    closeTime: '22:00',
    operatingHoursEn: 'Sun–Wed: 12:00 PM – 10:00 PM | Thu: 12:00 PM – 11:00 PM | Fri: 1:00 PM – 11:00 PM | Sat: 10:00 AM – 10:00 PM',
    operatingHoursAr: 'الأحد–الأربعاء: ١٢:٠٠ م – ١٠:٠٠ م | الخميس: ١٢:٠٠ م – ١١:٠٠ م | الجمعة: ١:٠٠ م – ١١:٠٠ م | السبت: ١٠:٠٠ ص – ١٠:٠٠ م',
    timezone: 'Asia/Qatar'
  };
}

export function formatTime12h(time24: string, isAr = false): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let hour = parseInt(hStr, 10);
  const min = mStr || '00';
  if (isNaN(hour)) return time24;

  const isPM = hour >= 12;
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;

  if (isAr) {
    const period = isPM ? 'م' : 'ص';
    const arabicHour = hour.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
    const arabicMin = min.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
    return `${arabicHour}:${arabicMin} ${period}`;
  }

  const period = isPM ? 'PM' : 'AM';
  return `${hour}:${min} ${period}`;
}

export function generateBilingualScheduleSummary(schedule: Record<DayKey, DayOfWeekSchedule>): { en: string; ar: string } {
  if (!schedule) {
    return {
      en: 'Daily: 10:00 AM – 10:00 PM',
      ar: 'يومياً: ١٠:٠٠ ص – ١٠:٠٠ م'
    };
  }

  // Format slots per day
  const formattedDays: Record<DayKey, { strEn: string; strAr: string }> = {} as any;

  DAYS_ORDER.forEach(day => {
    const d = schedule[day];
    if (!d || !d.isOpen || !d.slots || d.slots.length === 0) {
      formattedDays[day] = { strEn: 'Closed', strAr: 'مغلق' };
    } else {
      const slotsEn = d.slots.map(s => `${formatTime12h(s.openTime, false)} – ${formatTime12h(s.closeTime, false)}`).join(' & ');
      const slotsAr = d.slots.map(s => `${formatTime12h(s.openTime, true)} – ${formatTime12h(s.closeTime, true)}`).join(' و ');
      formattedDays[day] = { strEn: slotsEn, strAr: slotsAr };
    }
  });

  // Group consecutive days with same timings
  const groups: Array<{ startDay: DayKey; endDay: DayKey; strEn: string; strAr: string }> = [];

  DAYS_ORDER.forEach((day, index) => {
    const current = formattedDays[day];
    if (groups.length === 0) {
      groups.push({ startDay: day, endDay: day, strEn: current.strEn, strAr: current.strAr });
    } else {
      const last = groups[groups.length - 1];
      if (last.strEn === current.strEn) {
        last.endDay = day;
      } else {
        groups.push({ startDay: day, endDay: day, strEn: current.strEn, strAr: current.strAr });
      }
    }
  });

  const enParts = groups.map(g => {
    const dayLabel = g.startDay === g.endDay
      ? DAY_LABELS[g.startDay].shortEn
      : `${DAY_LABELS[g.startDay].shortEn}–${DAY_LABELS[g.endDay].shortEn}`;
    return `${dayLabel}: ${g.strEn}`;
  });

  const arParts = groups.map(g => {
    const dayLabel = g.startDay === g.endDay
      ? DAY_LABELS[g.startDay].shortAr
      : `${DAY_LABELS[g.startDay].shortAr}–${DAY_LABELS[g.endDay].shortAr}`;
    return `${dayLabel}: ${g.strAr}`;
  });

  return {
    en: enParts.join(' | '),
    ar: arParts.join(' | ')
  };
}

export function calculateQatarOperatingStatus(
  temporalStatus?: AdvancedTemporalStatus | null,
  dateOverride?: Date
): {
  isOpen: boolean;
  statusTextEn: string;
  statusTextAr: string;
  nextEventTextEn: string;
  nextEventTextAr: string;
} {
  const now = dateOverride || new Date();
  
  // Calculate Qatar Time (GMT+3)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const qatarTime = new Date(utc + (3600000 * 3));
  
  const currentHour = qatarTime.getHours();
  const currentMin = qatarTime.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMin;

  const dayOfWeekIndex = qatarTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayKey = DAYS_ORDER[dayOfWeekIndex];

  const year = qatarTime.getFullYear();
  const month = String(qatarTime.getMonth() + 1).padStart(2, '0');
  const dateStr = `${year}-${month}-${String(qatarTime.getDate()).padStart(2, '0')}`;

  // 1. Check Lifespan (Seasonal Date Range)
  if (temporalStatus?.lifespanType === 'SEASONAL' || temporalStatus?.lifespanType === 'POPUP') {
    if (temporalStatus.startDate && dateStr < temporalStatus.startDate) {
      return {
        isOpen: false,
        statusTextEn: 'SEASONAL - COMING SOON',
        statusTextAr: 'موسمي - قريباً',
        nextEventTextEn: `Opens on ${temporalStatus.startDate}`,
        nextEventTextAr: `يفتح بتاريخ ${temporalStatus.startDate}`,
      };
    }
    if (temporalStatus.endDate && dateStr > temporalStatus.endDate) {
      return {
        isOpen: false,
        statusTextEn: 'SEASON CONCLUDED',
        statusTextAr: 'انتهى الموسم',
        nextEventTextEn: `Concluded on ${temporalStatus.endDate}`,
        nextEventTextAr: `انتهى بتاريخ ${temporalStatus.endDate}`,
      };
    }
  }

  // 2. Check Special Holiday / Date Exception
  const specialOverride = temporalStatus?.specialDates?.find(s => s.date === dateStr);
  if (specialOverride) {
    if (specialOverride.isClosed) {
      return {
        isOpen: false,
        statusTextEn: 'CLOSED (SPECIAL DATE)',
        statusTextAr: 'مغلق (مناسبة خاصة)',
        nextEventTextEn: specialOverride.reasonEn || 'Special closure',
        nextEventTextAr: specialOverride.reasonAr || 'إغلاق خاص',
      };
    }
  }

  // 3. Check Day of Week Schedule
  const daySchedule = temporalStatus?.weeklySchedule?.[dayKey];
  if (!daySchedule || !daySchedule.isOpen || !daySchedule.slots || daySchedule.slots.length === 0) {
    return {
      isOpen: false,
      statusTextEn: 'CLOSED TODAY',
      statusTextAr: 'مغلق اليوم',
      nextEventTextEn: 'Closed all day',
      nextEventTextAr: 'مغلق طوال اليوم',
    };
  }

  // Check matching slots
  for (const slot of daySchedule.slots) {
    const [openH, openM] = (slot.openTime || '10:00').split(':').map(Number);
    const [closeH, closeM] = (slot.closeTime || '22:00').split(':').map(Number);
    const openMinutes = openH * 60 + (openM || 0);
    const closeMinutes = closeH * 60 + (closeM || 0);

    if (currentTimeMinutes >= openMinutes && currentTimeMinutes < closeMinutes) {
      const closesInMins = closeMinutes - currentTimeMinutes;
      return {
        isOpen: true,
        statusTextEn: closesInMins <= 60 ? 'CLOSING SOON' : 'OPEN NOW',
        statusTextAr: closesInMins <= 60 ? 'يغلق قريباً' : 'مفتوح الآن',
        nextEventTextEn: `Open until ${formatTime12h(slot.closeTime, false)}`,
        nextEventTextAr: `مفتوح حتى ${formatTime12h(slot.closeTime, true)}`,
      };
    }
  }

  // Find next opening slot
  const nextSlot = daySchedule.slots.find(s => {
    const [openH, openM] = (s.openTime || '10:00').split(':').map(Number);
    return (openH * 60 + (openM || 0)) > currentTimeMinutes;
  });

  if (nextSlot) {
    return {
      isOpen: false,
      statusTextEn: 'CLOSED - OPENS LATER TODAY',
      statusTextAr: 'مغلق - يفتح لاحقاً اليوم',
      nextEventTextEn: `Opens at ${formatTime12h(nextSlot.openTime, false)}`,
      nextEventTextAr: `يفتح في ${formatTime12h(nextSlot.openTime, true)}`,
    };
  }

  return {
    isOpen: false,
    statusTextEn: 'CLOSED NOW',
    statusTextAr: 'مغلق الآن',
    nextEventTextEn: 'Closed for the night',
    nextEventTextAr: 'مغلق للفترة الليلية',
  };
}

/**
 * Returns clean, un-cluttered single-day operating hours for the current day in Qatar (GMT+3).
 */
export function getTodayTimingDisplay(
  temporalStatus?: AdvancedTemporalStatus | any | null,
  locale: string = 'en',
  dateOverride?: Date
): {
  timingsEn: string;
  timingsAr: string;
  todayLabelEn: string;
  todayLabelAr: string;
  isClosed: boolean;
} {
  const isAr = locale === 'ar';
  const now = dateOverride || new Date();
  
  // Calculate Qatar Time (GMT+3)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const qatarTime = new Date(utc + (3600000 * 3));
  const dayOfWeekIndex = qatarTime.getDay();
  const dayKey = DAYS_ORDER[dayOfWeekIndex];

  const year = qatarTime.getFullYear();
  const month = String(qatarTime.getMonth() + 1).padStart(2, '0');
  const dateStr = `${year}-${month}-${String(qatarTime.getDate()).padStart(2, '0')}`;

  const dayLabel = DAY_LABELS[dayKey] || { shortEn: 'Today', shortAr: 'اليوم' };

  // 1. Check special date override
  if (Array.isArray(temporalStatus?.specialDates)) {
    const specialOverride = temporalStatus.specialDates.find((s: any) => s.date === dateStr);
    if (specialOverride) {
      if (specialOverride.isClosed) {
        return {
          timingsEn: `Closed (${specialOverride.reasonEn || 'Holiday'})`,
          timingsAr: `مغلق (${specialOverride.reasonAr || 'عطلة'})`,
          todayLabelEn: `Today (${dayLabel.shortEn})`,
          todayLabelAr: `اليوم (${dayLabel.shortAr})`,
          isClosed: true
        };
      }
      if (specialOverride.slots && specialOverride.slots.length > 0) {
        const slotsEn = specialOverride.slots.map((s: any) => `${formatTime12h(s.openTime, false)} – ${formatTime12h(s.closeTime, false)}`).join(' & ');
        const slotsAr = specialOverride.slots.map((s: any) => `${formatTime12h(s.openTime, true)} – ${formatTime12h(s.closeTime, true)}`).join(' و ');
        return {
          timingsEn: slotsEn,
          timingsAr: slotsAr,
          todayLabelEn: `Today (${dayLabel.shortEn})`,
          todayLabelAr: `اليوم (${dayLabel.shortAr})`,
          isClosed: false
        };
      }
    }
  }

  // 2. Check weekly schedule
  const daySchedule = temporalStatus?.weeklySchedule?.[dayKey];
  if (daySchedule) {
    if (!daySchedule.isOpen || !daySchedule.slots || daySchedule.slots.length === 0) {
      return {
        timingsEn: 'Closed Today',
        timingsAr: 'مغلق اليوم',
        todayLabelEn: `Today (${dayLabel.shortEn})`,
        todayLabelAr: `اليوم (${dayLabel.shortAr})`,
        isClosed: true
      };
    }

    const slotsEn = daySchedule.slots.map((s: any) => `${formatTime12h(s.openTime, false)} – ${formatTime12h(s.closeTime, false)}`).join(' & ');
    const slotsAr = daySchedule.slots.map((s: any) => `${formatTime12h(s.openTime, true)} – ${formatTime12h(s.closeTime, true)}`).join(' و ');

    return {
      timingsEn: slotsEn,
      timingsAr: slotsAr,
      todayLabelEn: `Today (${dayLabel.shortEn})`,
      todayLabelAr: `اليوم (${dayLabel.shortAr})`,
      isClosed: false
    };
  }

  // 3. Fallback to openTime / closeTime if specified
  if (temporalStatus?.openTime && temporalStatus?.closeTime) {
    const sEn = `${formatTime12h(temporalStatus.openTime, false)} – ${formatTime12h(temporalStatus.closeTime, false)}`;
    const sAr = `${formatTime12h(temporalStatus.openTime, true)} – ${formatTime12h(temporalStatus.closeTime, true)}`;
    return {
      timingsEn: sEn,
      timingsAr: sAr,
      todayLabelEn: `Today (${dayLabel.shortEn})`,
      todayLabelAr: `اليوم (${dayLabel.shortAr})`,
      isClosed: false
    };
  }

  // 4. Fallback to operatingHours string if it's already a single short time (e.g. 10:00 AM - 10:00 PM)
  if (typeof temporalStatus?.operatingHoursEn === 'string' && !temporalStatus.operatingHoursEn.includes('|')) {
    return {
      timingsEn: temporalStatus.operatingHoursEn,
      timingsAr: temporalStatus.operatingHoursAr || temporalStatus.operatingHoursEn,
      todayLabelEn: `Today (${dayLabel.shortEn})`,
      todayLabelAr: `اليوم (${dayLabel.shortAr})`,
      isClosed: false
    };
  }

  // 5. Default standard fallback
  return {
    timingsEn: '10:00 AM – 10:00 PM',
    timingsAr: '١٠:٠٠ ص – ١٠:٠٠ م',
    todayLabelEn: `Today (${dayLabel.shortEn})`,
    todayLabelAr: `اليوم (${dayLabel.shortAr})`,
    isClosed: false
  };
}

/**
 * Identifies whether a pricing tier is an Add-on / Auxiliary item
 * (such as grip socks, lockers, wristbands, tokens, or merchandise)
 * rather than a primary admission / entry ticket.
 */
export function isAddonPricingTier(tier: any): boolean {
  if (!tier) return false;
  
  const type = String(tier.type || '').toUpperCase().trim();
  if (
    type === 'ADD_ON' || 
    type === 'ADDON' || 
    type === 'ADD-ON' || 
    type === 'MERCHANDISE' || 
    type === 'EXTRA' || 
    type === 'EXTRAS' ||
    type === 'AUXILIARY' ||
    type === 'EQUIPMENT'
  ) {
    return true;
  }

  const title = `${tier.titleEn || ''} ${tier.titleAr || ''} ${tier.descriptionEn || ''} ${tier.descriptionAr || ''}`.toLowerCase();
  
  const addonKeywords = [
    'sock',
    'grip sock',
    'locker',
    'wristband',
    'addon',
    'add-on',
    'add on',
    'token',
    'merchandise',
    'rental',
    'shoe rental',
    'جوارب',
    'خزانة',
    'إضافة',
    'اضافة',
    'سوار',
    'رمز'
  ];

  return addonKeywords.some(kw => title.includes(kw));
}

/**
 * Calculates the legitimate starting ticket price for an attraction,
 * strictly filtering out add-on items (e.g. 5 QAR socks) and zero-priced inquiry packages.
 */
export function calculateAttractionStartingPrice(attr: any, fallbackPrice = 35): number {
  if (!attr) return fallbackPrice;
  if (attr.accessModel === 'FREE') return 0;

  const rawPricing = Array.isArray(attr.pricing) ? attr.pricing : [];
  
  // Filter for valid admission passes: not an add-on and price > 0
  const validAdmissionTiers = rawPricing.filter((p: any) => {
    const priceNum = typeof p?.price === 'number' ? p.price : parseFloat(p?.price);
    return !isNaN(priceNum) && priceNum > 0 && !isAddonPricingTier(p);
  });

  if (validAdmissionTiers.length > 0) {
    const prices = validAdmissionTiers.map((p: any) => typeof p.price === 'number' ? p.price : parseFloat(p.price));
    return Math.min(...prices);
  }

  // If there are only non-addon passes with price 0 (e.g. free sessions)
  const zeroAdmissionTiers = rawPricing.filter((p: any) => {
    const priceNum = typeof p?.price === 'number' ? p.price : parseFloat(p?.price);
    return priceNum === 0 && !isAddonPricingTier(p);
  });

  if (zeroAdmissionTiers.length > 0 && attr.accessModel !== 'PAID') {
    return 0;
  }

  // Fallback to explicit attraction price if available and positive, or default
  if (typeof attr.price === 'number' && attr.price > 0) {
    return attr.price;
  }

  return fallbackPrice;
}

