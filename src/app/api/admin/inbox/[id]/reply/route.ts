import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeAdminRequest } from '@/lib/telegramAuth';
import { canReply, validateInboxText } from '@/lib/inbox';
import { writeAdminAudit } from '@/lib/doctorsApi';

// Staff: reply to a patient. The reply is stored and queued in the outbox; the bot's outbox worker delivers it
// and updates the message status (sent / failed). Staff see the status in the thread.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = authorizeAdminRequest(request);
  if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = validateInboxText(body?.text);
  if (!parsed.ok) return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });

  const thread = await prisma.inboxThread.findUnique({ where: { id } });
  if (!thread) return NextResponse.json({ success: false, error: 'Диалог не найден' }, { status: 404 });
  if (!canReply(thread)) {
    return NextResponse.json(
      { success: false, error: { code: 'PATIENT_UNREACHABLE', message: `${thread.patientName} заблокировал бота. Позвоните пациенту: ответ в Telegram не дойдёт.` } },
      { status: 409 }
    );
  }

  const message = await prisma.inboxMessage.create({
    data: { threadId: id, direction: 'out', text: parsed.value, authorId: String(gate.user.id), deliveryStatus: 'queued' },
  });
  await prisma.outbox.create({
    data: { chatId: thread.telegramId, kind: 'inbox_reply', text: parsed.value, refType: 'inbox_message', refId: message.id },
  });
  await prisma.inboxThread.update({ where: { id }, data: { lastMessageAt: new Date() } });
  await writeAdminAudit(gate.user.id, 'inbox_reply_queued', id, 'queued');

  return NextResponse.json({ success: true, deliveryStatus: 'queued', messageId: message.id }, { status: 202 });
}
