// Inbox rules shared by the patient endpoint and the staff endpoints. Pure functions, unit-tested.

export const INBOX_STATUSES = ['new', 'answered', 'resolved'] as const;
export type InboxStatusValue = (typeof INBOX_STATUSES)[number];

export const MAX_INBOX_TEXT = 1000;

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** Message text from a patient or a staff member: trimmed, not empty, not too long */
export function validateInboxText(raw: unknown): ValidationResult<string> {
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (text.length === 0) return { ok: false, error: 'Напишите сообщение' };
  if (text.length > MAX_INBOX_TEXT) return { ok: false, error: `Сообщение: не больше ${MAX_INBOX_TEXT} символов` };
  return { ok: true, value: text };
}

export function isInboxStatus(value: unknown): value is InboxStatusValue {
  return typeof value === 'string' && (INBOX_STATUSES as readonly string[]).includes(value);
}

/** Replies are allowed unless the patient cannot be reached in Telegram */
export function canReply(thread: { patientUnreachable: boolean }): boolean {
  return !thread.patientUnreachable;
}
