// Rules for a patient changing their own appointment. Pure functions, unit-tested.

export const CHANGE_WINDOW_HOURS = 3; // no changes within 3 hours of the visit
export const CLINIC_PHONE_HINT = 'Позвоните в клинику, и администратор поможет.';

const CHANGEABLE = ['pending', 'confirmed', 'reschedule_requested'] as const;

export type ChangeCheck = { ok: true } | { ok: false; code: string; error: string };

/** Can this patient change this appointment right now? */
export function checkCanChange(
  app: { telegramId: number | null; status: string; dateTime: Date },
  patientTelegramId: number,
  now: Date = new Date()
): ChangeCheck {
  if (app.telegramId !== patientTelegramId) {
    return { ok: false, code: 'NOT_OWNER', error: 'Эта запись не принадлежит вашему аккаунту' };
  }
  if (!(CHANGEABLE as readonly string[]).includes(app.status)) {
    return { ok: false, code: 'NOT_CHANGEABLE', error: 'Эту запись уже нельзя изменить' };
  }
  const hoursLeft = (app.dateTime.getTime() - now.getTime()) / (60 * 60 * 1000);
  if (hoursLeft < CHANGE_WINDOW_HOURS) {
    return {
      ok: false,
      code: 'TOO_LATE',
      error: `Изменить запись можно не позже чем за ${CHANGE_WINDOW_HOURS} часа до визита. ${CLINIC_PHONE_HINT}`,
    };
  }
  return { ok: true };
}

/** Upcoming first, then the past ones, newest first */
export function sortForPatient<T extends { dateTime: Date; status: string }>(items: T[], now: Date = new Date()): T[] {
  const upcoming = items.filter((i) => i.dateTime.getTime() >= now.getTime()).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  const past = items.filter((i) => i.dateTime.getTime() < now.getTime()).sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
  return [...upcoming, ...past];
}
