// Sends the signed Telegram initData with admin requests so the server can check who is asking.
export function telegramAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const initData = window.Telegram?.WebApp?.initData;
  return initData ? { 'X-Telegram-Init-Data': initData } : {};
}
