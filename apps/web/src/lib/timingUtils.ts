export interface TimingStatus {
  status: 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'UNKNOWN';
  label: string;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Basic string parser for "10:00 AM - 10:00 PM"
function parseTimeSlot(timeSlot: string, referenceDate: Date): { start: Date, end: Date } | null {
  try {
    const parts = timeSlot.split('-').map(s => s.trim());
    if (parts.length !== 2) return null;

    const parseTime = (timeStr: string) => {
      const match = timeStr.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
      if (!match) return null;
      let hours = parseInt(match[1]);
      const mins = parseInt(match[2] || '0');
      const period = match[3].toUpperCase();

      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      const d = new Date(referenceDate);
      d.setHours(hours, mins, 0, 0);
      return d;
    };

    const start = parseTime(parts[0]);
    const end = parseTime(parts[1]);

    if (!start || !end) return null;
    
    // Handle overnight spans (e.g. 10 PM to 2 AM)
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    
    return { start, end };
  } catch (e) {
    return null;
  }
}

export function getLiveTimingStatus(schedules: any[]): TimingStatus {
  if (!schedules || schedules.length === 0) {
    return { status: 'UNKNOWN', label: '' };
  }

  const now = new Date();
  const currentDayName = dayNames[now.getDay()];

  // Find today's schedule
  const todaySchedule = schedules.find((s: any) => 
    s.daysOfWeek && s.daysOfWeek.includes(currentDayName)
  );

  if (!todaySchedule || !todaySchedule.timeSlots) {
    return { status: 'CLOSED', label: 'Closed Today' };
  }

  const times = parseTimeSlot(todaySchedule.timeSlots, now);
  if (!times) {
    return { status: 'OPEN', label: 'Open Today' };
  }

  const { start, end } = times;

  if (now >= start && now <= end) {
    const msTillClose = end.getTime() - now.getTime();
    const hoursTillClose = msTillClose / (1000 * 60 * 60);

    if (hoursTillClose <= 1) {
      return { status: 'CLOSING_SOON', label: 'Closing Soon' };
    }
    return { status: 'OPEN', label: 'Open Now' };
  }

  if (now < start) {
    const formatTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { status: 'CLOSED', label: `Opens at ${formatTime}` };
  }

  return { status: 'CLOSED', label: 'Closed' };
}
