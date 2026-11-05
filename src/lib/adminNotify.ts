import { prisma } from './db';
// Sends a short message to the clinic's admin group chat through the Telegram Bot API.
// Silently does nothing when BOT_TOKEN or ADMIN_CHAT_ID is not set, so bookings never fail because of it.

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function notifyAdminGroup(html: string): Promise<void> {
  const chatId = process.env.ADMIN_CHAT_ID;
  if (!chatId) return;
  // Queued, not sent directly: the bot's outbox worker delivers it and retries on failure
  try {
    await prisma.outbox.create({
      data: { chatId: BigInt(chatId), kind: 'staff_alert', text: html.slice(0, 4000) },
    });
  } catch (error) {
    console.error('Admin group alert could not be queued', error);
  }
}

export { escapeHtml };
