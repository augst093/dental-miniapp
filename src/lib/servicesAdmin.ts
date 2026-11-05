// Validation for services edited by staff. Pure functions, unit-tested.

export interface ServiceInput {
  title: string;
  category: string;
  priceUzs: number; // whole sums
  durationMinutes: number;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

export const SERVICE_CATEGORIES = [
  'emergency',
  'diagnostics',
  'therapy',
  'implants',
  'orthodontics',
  'orthopedics',
  'pediatric',
  'hygiene',
  'other',
] as const;

const MAX_PRICE_UZS = 100_000_000;

export function validateServiceInput(raw: unknown, partial = false): ValidationResult<Partial<ServiceInput>> {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'Нужен объект с данными услуги' };
  const body = raw as Record<string, unknown>;
  const has = (key: string) => Object.prototype.hasOwnProperty.call(body, key);
  const out: Partial<ServiceInput> = {};

  if (has('title') || !partial) {
    const title = String(body.title ?? '').trim();
    if (title.length < 3 || title.length > 120) return { ok: false, error: 'Название услуги: от 3 до 120 символов' };
    out.title = title;
  }
  if (has('category') || !partial) {
    const category = String(body.category ?? '');
    if (!(SERVICE_CATEGORIES as readonly string[]).includes(category)) {
      return { ok: false, error: 'Категория услуги не из списка' };
    }
    out.category = category;
  }
  if (has('priceUzs') || !partial) {
    const price = Number(body.priceUzs);
    if (!Number.isInteger(price) || price < 0 || price > MAX_PRICE_UZS) {
      return { ok: false, error: `Цена: целое число сумов от 0 до ${MAX_PRICE_UZS.toLocaleString('ru-RU').replace(/\s/g, ' ')}` };
    }
    out.priceUzs = price;
  }
  if (has('durationMinutes') || !partial) {
    const duration = Number(body.durationMinutes ?? 30);
    if (!Number.isInteger(duration) || duration < 15 || duration > 240 || duration % 5 !== 0) {
      return { ok: false, error: 'Длительность: от 15 до 240 минут, кратно 5' };
    }
    out.durationMinutes = duration;
  }
  if (has('description')) {
    const text = body.description === null || body.description === '' ? null : String(body.description).trim();
    if (text !== null && text.length > 500) return { ok: false, error: 'Описание: не больше 500 символов' };
    out.description = text;
  }
  if (has('sortOrder')) {
    const order = Number(body.sortOrder);
    if (!Number.isInteger(order) || order < 0 || order > 9999) return { ok: false, error: 'Порядок: целое число от 0 до 9999' };
    out.sortOrder = order;
  }
  if (has('isActive')) {
    if (typeof body.isActive !== 'boolean') return { ok: false, error: 'Активность: true или false' };
    out.isActive = body.isActive;
  }
  if (!partial && out.isActive === undefined) out.isActive = true;
  if (!partial && out.sortOrder === undefined) out.sortOrder = 0;
  if (!partial && out.description === undefined) out.description = null;
  return { ok: true, value: out };
}
