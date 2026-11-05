// Sends a short message to the clinic's admin group chat through the Telegram Bot API.
// Silently does nothing when BOT_TOKEN or ADMIN_CHAT_ID is not set, so bookings never fail because of it.

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function notifyAdminGroup(html: string): Promise<void> {
  const token = process.env.BOT_TOKEN;
  const chatId = process.env.ADMIN_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: html, parse_mode: 'HTML', disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    console.error('Admin group notification failed', error);
  }
}

export { escapeHtml };
