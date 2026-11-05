import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeAdminRequest } from '@/lib/telegramAuth';
import { canReply, deliveryOutcome, validateInboxText } from '@/lib/inbox';
import { sendTelegramMessage } from '@/lib/telegramSend';
import { writeAdminAudit } from '@/lib/doctorsApi';

// Staff: reply to a patient. The reply is stored first, then delivered through the bot.
// A failed delivery stays visible in the thread so staff can resend; a blocked bot is shown clearly.
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
    data: { threadId: id, direction: 'out', text: parsed.value, authorId: String(gate.user.id), deliveryStatus: null },
  });

  const result = await sendTelegramMessage(Number(thread.telegramId), parsed.value);
  const outcome = deliveryOutcome(result);

  if (outcome === 'sent') {
    await prisma.$transaction([
      prisma.inboxMessage.update({ where: { id: message.id }, data: { deliveryStatus: 'sent' } }),
      prisma.inboxThread.update({ where: { id }, data: { status: 'answered', lastMessageAt: new Date() } }),
    ]);
    await writeAdminAudit(gate.user.id, 'inbox_reply', id, 'delivered');
    return NextResponse.json({ success: true, deliveryStatus: 'sent' }, { status: 201 });
  }

  await prisma.inboxMessage.update({
    where: { id: message.id },
    data: { deliveryStatus: 'failed', deliveryError: result.description ?? `HTTP ${result.status}` },
  });

  if (outcome === 'blocked') {
    await prisma.inboxThread.update({ where: { id }, data: { patientUnreachable: true } });
    return NextResponse.json(
      { success: false, error: { code: 'PATIENT_UNREACHABLE', message: `${thread.patientName} заблокировал бота. Позвоните пациенту.` } },
      { status: 409 }
    );
  }

  return NextResponse.json(
    { success: false, error: { code: 'DELIVERY_FAILED', message: 'Не удалось отправить ответ. Текст сохранён: отправьте ещё раз.' } },
    { status: 502 }
  );
}
