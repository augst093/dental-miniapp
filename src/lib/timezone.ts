/**
 * Timezone utilities for Asia/Tashkent (UTC+5).
 * All database timestamps are stored in UTC.
 * All user-facing times, slots, and reminders operate in Asia/Tashkent time.
 */

export const TASHKENT_TZ = 'Asia/Tashkent';
export const TASHKENT_OFFSET_HOURS = 5;
export const TASHKENT_OFFSET_MS = TASHKENT_OFFSET_HOURS * 60 * 60 * 1000;

/**
 * Get current UTC date
 */
export function getNowUTC(): Date {
  return new Date();
}

/**
 * Convert UTC Date into a Date object representing the local clock in Tashkent
 */
export function toTashkentClock(utcDate: Date | string): Date {
  const d = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  // d.getTime() is UTC timestamp. Adding 5 hours gives exact Tashkent wall clock time in UTC methods.
  return new Date(d.getTime() + TASHKENT_OFFSET_MS);
}

/**
 * Create a UTC Date from Tashkent calendar date & time string (e.g., "2026-11-05", "14:30")
 */
export function fromTashkentDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  // Date.UTC creates UTC millisecond timestamp treating inputs as UTC.
  // Since input was Tashkent time (+5h), we subtract 5 hours to get real UTC time.
  const utcMillis = Date.UTC(year, month - 1, day, hour - TASHKENT_OFFSET_HOURS, minute, 0, 0);
  return new Date(utcMillis);
}

/**
 * Format Tashkent Date into "YYYY-MM-DD"
 */
export function formatTashkentISODate(date: Date | string): string {
  const t = toTashkentClock(date);
  const y = t.getUTCFullYear();
  const m = String(t.getUTCMonth() + 1).padStart(2, '0');
  const d = String(t.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format Tashkent Time into "HH:mm"
 */
export function formatTashkentTime(date: Date | string): string {
  const t = toTashkentClock(date);
  const h = String(t.getUTCHours()).padStart(2, '0');
  const m = String(t.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Human readable Tashkent date string (e.g. "4 ноября", "4-noyabr", "November 4")
 */
export function formatTashkentDateReadable(
  date: Date | string,
  lang: 'ru' | 'uz' | 'en' = 'ru'
): string {
  const t = toTashkentClock(date);
  const day = t.getUTCDate();
  const month = t.getUTCMonth();

  const months: Record<'ru' | 'uz' | 'en', string[]> = {
    ru: [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
    ],
    uz: [
      'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
      'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
    ],
    en: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
  };

  const monthName = months[lang]?.[month] || months.ru[month];
  if (lang === 'uz') {
    return `${day}-${monthName}`;
  }
  if (lang === 'en') {
    return `${monthName} ${day}`;
  }
  return `${day} ${monthName}`;
}

/**
 * Format full Tashkent date and time
 */
export function formatTashkentDateTimeReadable(
  date: Date | string,
  lang: 'ru' | 'uz' | 'en' = 'ru'
): string {
  return `${formatTashkentDateReadable(date, lang)}, ${formatTashkentTime(date)}`;
}

/**
 * Check if a prospective appointment time is in the past or violates minimum lead time
 * @param appointmentUTC Date of appointment in UTC
 * @param minLeadMinutes Minimum minutes before appointment (default 120 = 2 hours)
 */
export function isLeadTimeValid(appointmentUTC: Date, minLeadMinutes: number = 120): boolean {
  const now = Date.now();
  const appointmentTime = appointmentUTC.getTime();
  const minRequiredTime = now + minLeadMinutes * 60 * 1000;
  return appointmentTime >= minRequiredTime;
}
