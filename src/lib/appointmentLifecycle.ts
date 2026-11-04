/**
 * Appointment Lifecycle State Machine & Transition Rules.
 * Enforces allowed transitions, actor auditing, and reminder cancellation.
 */

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'reschedule_requested'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export type LifecycleActor = 'patient' | 'admin' | 'system' | 'bot';

export interface StatusTransitionRequest {
  appointmentId: string;
  fromStatus: AppointmentStatus;
  toStatus: AppointmentStatus;
  actor: LifecycleActor;
  actorId?: string;
  reason?: string;
}

export interface TransitionValidationResult {
  allowed: boolean;
  error?: string;
}

/**
 * State machine transition map:
 * pending -> confirmed | reschedule_requested | cancelled
 * confirmed -> reschedule_requested | cancelled | completed | no_show
 * reschedule_requested -> confirmed | cancelled
 * no_show -> confirmed | cancelled (e.g. patient called back or apologized)
 * cancelled -> terminal (cannot transition)
 * completed -> terminal (cannot transition)
 */
export const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ['confirmed', 'reschedule_requested', 'cancelled'],
  confirmed: ['reschedule_requested', 'cancelled', 'completed', 'no_show'],
  reschedule_requested: ['confirmed', 'cancelled'],
  cancelled: [],
  completed: [],
  no_show: ['confirmed', 'cancelled'],
};

/**
 * Human-readable labels in 3 languages
 */
export const STATUS_LABELS: Record<
  AppointmentStatus,
  { ru: string; uz: string; en: string; badgeColor: string }
> = {
  pending: {
    ru: 'Ожидает подтверждения',
    uz: 'Tasdiqlash kutilmoqda',
    en: 'Pending confirmation',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  confirmed: {
    ru: 'Подтверждён',
    uz: 'Tasdiqlangan',
    en: 'Confirmed',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  reschedule_requested: {
    ru: 'Запрос переноса',
    uz: 'Ko‘chirish so‘ralgan',
    en: 'Reschedule requested',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  cancelled: {
    ru: 'Отменён',
    uz: 'Bekor qilingan',
    en: 'Cancelled',
    badgeColor: 'bg-slate-100 text-slate-600 border-slate-200 line-through',
  },
  completed: {
    ru: 'Завершён (пришёл)',
    uz: 'Bajarildi (keldi)',
    en: 'Completed',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  no_show: {
    ru: 'Не явился (no-show)',
    uz: 'Kelmadi (no-show)',
    en: 'No-show',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
  },
};

/**
 * Validate whether a transition is allowed according to the state machine
 */
export function validateTransition(
  currentStatus: AppointmentStatus,
  targetStatus: AppointmentStatus
): TransitionValidationResult {
  if (currentStatus === targetStatus) {
    return { allowed: true };
  }

  const allowedTargets = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedTargets.includes(targetStatus)) {
    return {
      allowed: false,
      error: `Transition from "${currentStatus}" to "${targetStatus}" is not permitted. Allowed transitions: ${allowedTargets.join(', ') || 'None (terminal state)'}`,
    };
  }

  return { allowed: true };
}

/**
 * Helper to determine which reminders should be generated for a new appointment
 * @param appointmentDateTimeUTC Appointment timestamp in UTC
 * @param createdDateUTC Creation timestamp in UTC
 */
export function calculateRequiredReminders(
  appointmentDateTimeUTC: Date,
  createdDateUTC: Date = new Date()
): { type: 'reminder_24h' | 'reminder_2h'; dueAt: Date }[] {
  const appointmentTime = appointmentDateTimeUTC.getTime();
  const createdTime = createdDateUTC.getTime();

  const results: { type: 'reminder_24h' | 'reminder_2h'; dueAt: Date }[] = [];

  // 24 hours before visit
  const due24h = appointmentTime - 24 * 60 * 60 * 1000;
  // If appointment was booked at least 24 hours in advance, schedule 24h reminder
  if (due24h > createdTime) {
    results.push({
      type: 'reminder_24h',
      dueAt: new Date(due24h),
    });
  }

  // 2 hours before visit
  const due2h = appointmentTime - 2 * 60 * 60 * 1000;
  // If appointment was booked at least 2 hours in advance, schedule 2h reminder
  if (due2h > createdTime) {
    results.push({
      type: 'reminder_2h',
      dueAt: new Date(due2h),
    });
  }

  return results;
}
