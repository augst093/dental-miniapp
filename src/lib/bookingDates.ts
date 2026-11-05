// Date helpers for the booking calendar. All dates are plain "YYYY-MM-DD" strings in Tashkent time.
import { DEFAULT_DOCTOR_SCHEDULE } from './slots';
import { formatTashkentISODate, getNowUTC } from './timezone';
import type { Language } from '../data/clinicData';

/** How far ahead patients can book */
export const BOOKING_HORIZON_DAYS = 60;

export function todayIso(): string {
  return formatTashkentISODate(getNowUTC());
}

/** Adds days to a "YYYY-MM-DD" string without any timezone surprises */
export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

/** 0 = Sunday ... 6 = Saturday */
export function weekdayOf(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
}

/** The clinic is open on these weekdays (same rule the slot generator uses) */
export function isWorkingDay(iso: string): boolean {
  return DEFAULT_DOCTOR_SCHEDULE.workingDays.includes(weekdayOf(iso));
}

export function lastBookableIso(): string {
  return addDaysIso(todayIso(), BOOKING_HORIZON_DAYS);
}

/** Monday-first grid for one month. null marks empty cells before the 1st and after the last day. */
export function monthGrid(year: number, month0: number): (string | null)[] {
  const first = new Date(Date.UTC(year, month0, 1, 12));
  const daysInMonth = new Date(Date.UTC(year, month0 + 1, 0, 12)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7; // shift so Monday is column 0
  const cells: (string | null)[] = Array(leading).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const mm = String(month0 + 1).padStart(2, '0');
    cells.push(`${year}-${mm}-${String(day).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const LOCALE: Record<Language, string> = { ru: 'ru-RU', uz: 'uz-Latn-UZ', en: 'en-GB' };

export function formatMonthTitle(year: number, month0: number, lang: Language): string {
  const text = new Date(Date.UTC(year, month0, 15, 12)).toLocaleDateString(LOCALE[lang], {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatWeekday(iso: string, lang: Language, style: 'short' | 'long' = 'long'): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString(LOCALE[lang], {
    weekday: style,
    timeZone: 'UTC',
  });
}

export function formatDayLong(iso: string, lang: Language): string {
  const [y, m, d] = iso.split('-').map(Number);
  const text = new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString(LOCALE[lang], {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
    timeZone: 'UTC',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const BOOKING_COPY: Record<
  Language,
  {
    pickDate: string;
    pickTime: string;
    noTimes: string;
    noTimesHint: string;
    closed: string;
    today: string;
    past: string;
    busy: string;
    tooSoon: string;
    morning: string;
    afternoon: string;
    evening: string;
    loadError: string;
    retry: string;
    prev: string;
    next: string;
    free: string;
    chooseDayFirst: string;
  }
> = {
  ru: {
    pickDate: 'Выберите дату',
    pickTime: 'Свободное время',
    noTimes: 'На этот день свободного времени нет',
    noTimesHint: 'Выберите другой день: мы работаем с понедельника по субботу',
    closed: 'Выходной',
    today: 'Сегодня',
    past: 'Прошло',
    busy: 'Занято',
    tooSoon: 'Поздно',
    morning: 'Утро',
    afternoon: 'День',
    evening: 'Вечер',
    loadError: 'Не удалось загрузить время',
    retry: 'Повторить',
    prev: 'Предыдущий месяц',
    next: 'Следующий месяц',
    free: 'свободно',
    chooseDayFirst: 'Сначала выберите день',
  },
  uz: {
    pickDate: 'Sanani tanlang',
    pickTime: 'Bo‘sh vaqt',
    noTimes: 'Bu kunga bo‘sh vaqt yo‘q',
    noTimesHint: 'Boshqa kunni tanlang: dushanbadan shanbagacha ishlaymiz',
    closed: 'Dam olish kuni',
    today: 'Bugun',
    past: 'O‘tgan',
    busy: 'Band',
    tooSoon: 'Kech',
    morning: 'Ertalab',
    afternoon: 'Kunduzi',
    evening: 'Kechqurun',
    loadError: 'Vaqtni yuklab bo‘lmadi',
    retry: 'Qayta urinish',
    prev: 'Oldingi oy',
    next: 'Keyingi oy',
    free: 'bo‘sh',
    chooseDayFirst: 'Avval kunni tanlang',
  },
  en: {
    pickDate: 'Choose a date',
    pickTime: 'Available times',
    noTimes: 'No free times on this day',
    noTimesHint: 'Please choose another day: we are open Monday to Saturday',
    closed: 'Closed',
    today: 'Today',
    past: 'Past',
    busy: 'Booked',
    tooSoon: 'Too late',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    loadError: 'Could not load times',
    retry: 'Try again',
    prev: 'Previous month',
    next: 'Next month',
    free: 'free',
    chooseDayFirst: 'Choose a day first',
  },
};
