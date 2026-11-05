import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyTelegramUser, TG_INIT_DATA_HEADER } from '@/lib/telegramAuth';
import { isRateLimited, clientIp } from '@/lib/rateLimit';
import { validateInboxText } from '@/lib/inbox';
import { escapeHtml, notifyAdminGroup } from '@/lib/adminNotify';

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5; // questions per patient per 10 minutes

// Patient: hand a question over to the clinic's administrators from the chat
export async function POST(request: NextRequest) {
  const user = verifyTelegramUser(request.headers.get(TG_INIT_DATA_HEADER) || '');
  if (!user) return NextResponse.json({ success: false, error: 'Нужен вход через Telegram' }, { status: 401 });

  if (isRateLimited(`inbox:${user.id}`, LIMIT, WINDOW_MS) || isRateLimited(`inbox-ip:${clientIp(request)}`, 30, WINDOW_MS)) {
    return NextResponse.json({ success: false, error: 'Слишком много сообщений. Попробуйте чуть позже.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = validateInboxText(body?.text);
  if (!parsed.ok) return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });

  const patientName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Пациент';
  const telegramId = BigInt(user.id);

  try {
    // Continue the open conversation, or start a new one
    const open = await prisma.inboxThread.findFirst({
      where: { telegramId, status: { not: 'resolved' } },
      orderBy: { lastMessageAt: 'desc' },
    });

    const thread = open
      ? await prisma.inboxThread.update({
          where: { id: open.id },
          data: { status: 'new', lastMessageAt: new Date(), patientName, messages: { create: { direction: 'in', text: parsed.value } } },
        })
      : await prisma.inboxThread.create({
          data: { telegramId, patientName, status: 'new', messages: { create: { direction: 'in', text: parsed.value } } },
        });

    await notifyAdminGroup(
      `💬 <b>Вопрос пациента</b> (${escapeHtml(patientName)})\n${escapeHtml(parsed.value.slice(0, 300))}\n\nОтветьте в админ-панели: раздел «Инбокс».`
    );

    return NextResponse.json({ success: true, threadId: thread.id }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Не удалось отправить. Попробуйте позже или позвоните в клинику.' }, { status: 500 });
  }
}
