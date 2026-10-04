import { DateRangeType } from '../types';

export const TODAY_STR = '2026-10-03';

export function getTodayDateString(): string {
  return TODAY_STR;
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // Noon to prevent timezone offsets
}

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDayOfWeek(dateStr: string): string {
  const d = parseDateString(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatDateNumber(dateStr: string): string {
  const d = parseDateString(dateStr);
  return String(d.getDate()).padStart(2, '0');
}

export function formatDateMonth(dateStr: string): string {
  const d = parseDateString(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short' });
}

export function formatDateShort(dateStr: string): string {
  const d = parseDateString(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });
}

export function formatDateFull(dateStr: string): string {
  const d = parseDateString(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
}

export function isToday(dateStr: string): boolean {
  return dateStr === TODAY_STR;
}

export function isFuture(dateStr: string): boolean {
  return dateStr > TODAY_STR;
}

export function isPast(dateStr: string): boolean {
  return dateStr < TODAY_STR;
}

export function getDateRangeList(rangeType: DateRangeType, refDateStr: string = TODAY_STR): string[] {
  const refDate = parseDateString(refDateStr);
  const dates: string[] = [];

  if (rangeType === '1') {
    dates.push(toDateString(refDate));
  } else if (rangeType === '3') {
    for (let i = 2; i >= 0; i--) {
      const d = new Date(refDate);
      d.setDate(refDate.getDate() - i);
      dates.push(toDateString(d));
    }
  } else if (rangeType === '4') {
    for (let i = 3; i >= 0; i--) {
      const d = new Date(refDate);
      d.setDate(refDate.getDate() - i);
      dates.push(toDateString(d));
    }
  } else if (rangeType === '7') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(refDate);
      d.setDate(refDate.getDate() - i);
      dates.push(toDateString(d));
    }
  } else if (rangeType === '14') {
    for (let i = 13; i >= 0; i--) {
      const d = new Date(refDate);
      d.setDate(refDate.getDate() - i);
      dates.push(toDateString(d));
    }
  } else if (rangeType === '30') {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(refDate);
      d.setDate(refDate.getDate() - i);
      dates.push(toDateString(d));
    }
  } else if (rangeType === 'month') {
    // Current month (e.g. October 2026, from Oct 1 to end of Oct or today)
    // For a calendar habit tracker, show Oct 1 through Oct 14 or 31
    const year = refDate.getFullYear();
    const month = refDate.getMonth();
    const dayOfMonth = refDate.getDate(); // 3
    
    // We show at least from the 1st of the month, or up to the 15th/end of month
    // If today is day 3, showing 1st through 3rd is very short (3 days).
    // Let's show from beginning of current month up to today (or 1st through today + next 4 days for planning)
    // Or 1st through last day of current month (31 days)
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= lastDayOfMonth; d++) {
      const current = new Date(year, month, d, 12, 0, 0);
      dates.push(toDateString(current));
    }
  }

  return dates;
}
