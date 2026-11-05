// Outbox rules for outgoing Telegram messages. The pure functions here are unit-tested; the sending
// itself is done by the bot's outbox worker, which implements the same policy (see dental_ai_bot/services/outbox_policy.py).

export const OUTBOX_MAX_ATTEMPTS = 8;
export const OUTBOX_MAX_TEXT = 4000; // Telegram limit is 4096 characters

/** Seconds to wait before the next attempt: 5 s, 10 s, 20 s ... capped at 30 minutes */
export function nextDelaySeconds(attempts: number): number {
  const base = 5 * Math.pow(2, Math.max(0, attempts - 1));
  return Math.min(base, 1800);
}

export type SendFailure = 'retry_after' | 'blocked' | 'bad_request' | 'transient';

/**
 * Classifies a failed Telegram call:
 * 429 -> wait the time Telegram asked for; 403 -> the patient blocked the bot (stop for good);
 * 400 -> the request itself is wrong (stop for good); anything else -> try again later.
 */
export function classifySendFailure(status: number): SendFailure {
  if (status === 429) return 'retry_after';
  if (status === 403) return 'blocked';
  if (status === 400) return 'bad_request';
  return 'transient';
}

/** Decides what happens to a row after a failed attempt */
export function afterFailure(
  attemptsSoFar: number,
  failure: SendFailure,
  retryAfterSeconds?: number
): { status: 'pending' | 'failed'; delaySeconds: number } {
  const attempts = attemptsSoFar + 1;
  if (failure === 'blocked' || failure === 'bad_request' || attempts >= OUTBOX_MAX_ATTEMPTS) {
    return { status: 'failed', delaySeconds: 0 };
  }
  const delay = failure === 'retry_after' && retryAfterSeconds ? retryAfterSeconds : nextDelaySeconds(attempts);
  return { status: 'pending', delaySeconds: delay };
}

export function validateOutboxText(text: string): boolean {
  return text.trim().length > 0 && text.length <= OUTBOX_MAX_TEXT;
}
