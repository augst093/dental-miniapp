// Validation for doctor records edited by staff. Pure functions, no I/O, so they are unit-tested.

export interface DoctorInput {
  name: string;
  specialty: string;
  experienceYears: number | null;
  workingDays: number[]; // 0 = Sunday ... 6 = Saturday
  workingHoursStart: string; // "HH:MM"
  workingHoursEnd: string; // "HH:MM"
  slotDurationMinutes: number;
  isActive: boolean;
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function validateDoctorInput(raw: unknown, partial = false): ValidationResult<Partial<DoctorInput>> {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'Нужен объект с данными врача' };
  const body = raw as Record<string, unknown>;
  const out: Partial<DoctorInput> = {};

  const has = (key: string) => Object.prototype.hasOwnProperty.call(body, key);

  if (has('name') || !partial) {
    const name = String(body.name ?? '').trim();
    if (name.length < 3 || name.length > 80) return { ok: false, error: 'Имя врача: от 3 до 80 символов' };
    out.name = name;
  }
  if (has('specialty') || !partial) {
    const specialty = String(body.specialty ?? '').trim();
    if (specialty.length < 3 || specialty.length > 160) return { ok: false, error: 'Специализация: от 3 до 160 символов' };
    out.specialty = specialty;
  }
  if (has('experienceYears')) {
    if (body.experienceYears === null || body.experienceYears === '') {
      out.experienceYears = null;
    } else {
      const years = Number(body.experienceYears);
      if (!Number.isInteger(years) || years < 0 || years > 60) return { ok: false, error: 'Стаж: целое число от 0 до 60' };
      out.experienceYears = years;
    }
  }
  if (has('workingDays') || !partial) {
    const days = Array.isArray(body.workingDays) ? body.workingDays.map(Number) : [];
    const unique = Array.from(new Set(days)).sort((a, b) => a - b);
    if (unique.length === 0 || unique.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) {
      return { ok: false, error: 'Рабочие дни: выберите хотя бы один день' };
    }
    out.workingDays = unique;
  }
  if (has('workingHoursStart') || !partial) {
    const start = String(body.workingHoursStart ?? '');
    if (!TIME.test(start)) return { ok: false, error: 'Начало работы: формат ЧЧ:ММ' };
    out.workingHoursStart = start;
  }
  if (has('workingHoursEnd') || !partial) {
    const end = String(body.workingHoursEnd ?? '');
    if (!TIME.test(end)) return { ok: false, error: 'Конец работы: формат ЧЧ:ММ' };
    out.workingHoursEnd = end;
  }
  if (out.workingHoursStart !== undefined || out.workingHoursEnd !== undefined) {
    if (out.workingHoursStart && out.workingHoursEnd && toMinutes(out.workingHoursEnd) <= toMinutes(out.workingHoursStart)) {
      return { ok: false, error: 'Конец работы должен быть позже начала' };
    }
  }
  if (has('slotDurationMinutes') || !partial) {
    const step = Number(body.slotDurationMinutes ?? 30);
    if (![15, 20, 30, 45, 60].includes(step)) return { ok: false, error: 'Шаг записи: 15, 20, 30, 45 или 60 минут' };
    out.slotDurationMinutes = step;
  }
  if (has('isActive')) {
    if (typeof body.isActive !== 'boolean') return { ok: false, error: 'Активность: true или false' };
    out.isActive = body.isActive;
  }

  if (!partial && out.isActive === undefined) out.isActive = true;
  return { ok: true, value: out };
}

/** Future bookings that a deactivation or a schedule change would affect */
export function isDeactivation(current: { isActive: boolean }, next: Partial<DoctorInput>): boolean {
  return current.isActive && next.isActive === false;
}
