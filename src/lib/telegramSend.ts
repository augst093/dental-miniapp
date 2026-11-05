// Sends one plain-text message to a Telegram chat through the Bot API.
// Never throws: the caller decides what to store and what to show.

export interface SendResult {
  ok: boolean;
  status: number; // HTTP status from Telegram, 0 when the request itself failed
  description?: string;
}

export async function sendTelegramMessage(chatId: number | string, text: string): Promise<SendResult> {
  const token = process.env.BOT_TOKEN;
  if (!token) return { ok: false, status: 0, description: 'BOT_TOKEN не задан' };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: String(chatId), text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data?.ok !== false, status: res.status, description: data?.description };
  } catch {
    return { ok: false, status: 0, description: 'Telegram недоступен' };
  }
}
