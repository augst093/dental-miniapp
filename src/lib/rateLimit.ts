// Best-effort fixed-window limiter. Each serverless instance keeps its own counter,
// so the real limit is looser than the number given here. It still stops bursts from one client.
const MAX_KEYS = 5000;
const counters = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (counters.size > MAX_KEYS) {
    for (const [k, v] of counters) {
      if (v.resetAt < now) counters.delete(k);
    }
  }

  const entry = counters.get(key);
  if (!entry || entry.resetAt < now) {
    counters.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}
