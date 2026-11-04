/**
 * Slot logic: slot generation, working hours, lead time check, and double-booking prevention.
 */

import {
  fromTashkentDateTime,
  toTashkentClock,
  isLeadTimeValid,
  TASHKENT_OFFSET_HOURS,
} from './timezone';

export interface TimeSlot {
  time: string; // "09:30"
  dateTimeUTC: string; // ISO string in UTC
  available: boolean;
  reason?: 'booked' | 'past' | 'too_soon' | 'day_off';
}

export interface DoctorSchedule {
  workingDays: number[]; // 0=Sunday, 1=Monday ... 6=Saturday
  startHour: number; // e.g. 9
  startMinute: number; // e.g. 0
  endHour: number; // e.g. 20
  endMinute: number; // e.g. 0
  slotDurationMinutes: number; // e.g. 30
}

export const DEFAULT_DOCTOR_SCHEDULE: DoctorSchedule = {
  workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat (Sunday off or on by default config)
  startHour: 9,
  startMinute: 0,
  endHour: 20,
  endMinute: 0,
  slotDurationMinutes: 30,
};

/**
 * Generate all possible daily time slots for a given Tashkent date ("YYYY-MM-DD")
 */
export function generateDailySlots(
  dateStr: string,
  schedule: DoctorSchedule = DEFAULT_DOCTOR_SCHEDULE,
  bookedUTCTimestamps: Set<number> = new Set(),
  minLeadMinutes: number = 120
): TimeSlot[] {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Calculate day of week in Tashkent
  // Use UTC Date constructor with noon time to safely compute day of week
  const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayOfWeek = dateObj.getUTCDay();

  // If doctor does not work on this day
  if (!schedule.workingDays.includes(dayOfWeek)) {
    return [];
  }

  const slots: TimeSlot[] = [];
  const startTotalMinutes = schedule.startHour * 60 + schedule.startMinute;
  const endTotalMinutes = schedule.endHour * 60 + schedule.endMinute;

  const nowUTC = new Date();

  for (
    let currentMin = startTotalMinutes;
    currentMin + schedule.slotDurationMinutes <= endTotalMinutes;
    currentMin += schedule.slotDurationMinutes
  ) {
    const h = Math.floor(currentMin / 60);
    const m = currentMin % 60;
    const timeFormatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    const slotUTC = fromTashkentDateTime(dateStr, timeFormatted);
    const slotTimestamp = slotUTC.getTime();

    // Check if slot is already taken by an active appointment
    const isBooked = bookedUTCTimestamps.has(slotTimestamp);

    // Check if slot is in the past
    const isPast = slotUTC.getTime() < nowUTC.getTime();

    // Check minimum lead time (2 hours default)
    const isValidLead = isLeadTimeValid(slotUTC, minLeadMinutes);

    let available = true;
    let reason: TimeSlot['reason'] = undefined;

    if (isBooked) {
      available = false;
      reason = 'booked';
    } else if (isPast) {
      available = false;
      reason = 'past';
    } else if (!isValidLead) {
      available = false;
      reason = 'too_soon';
    }

    slots.push({
      time: timeFormatted,
      dateTimeUTC: slotUTC.toISOString(),
      available,
      reason,
    });
  }

  return slots;
}

/**
 * Check if a single target slot is free and valid for booking
 */
export function validateSlotBooking(
  dateTimeUTC: Date,
  bookedTimestamps: Set<number>,
  minLeadMinutes: number = 120
): { valid: boolean; error?: string } {
  const slotTime = dateTimeUTC.getTime();
  const now = Date.now();

  if (slotTime < now) {
    return { valid: false, error: 'Нельзя записаться на прошедшее время' };
  }

  if (!isLeadTimeValid(dateTimeUTC, minLeadMinutes)) {
    return {
      valid: false,
      error: `Минимальное время до приёма: ${minLeadMinutes / 60} ч. Выберите более поздний слот.`,
    };
  }

  if (bookedTimestamps.has(slotTime)) {
    return {
      valid: false,
      error: 'Этот временной слот уже занят другим пациентом. Пожалуйста, выберите другое время.',
    };
  }

  return { valid: true };
}
