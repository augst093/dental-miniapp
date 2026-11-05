import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeAdminRequest } from '@/lib/telegramAuth';
import { writeAdminAudit } from '@/lib/doctorsApi';

// Staff: send a failed message again (for example, after the patient unblocked the bot)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = authorizeAdminRequest(request);
  if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });

  const { id } = await params;
  const row = await prisma.outbox.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ success: false, error: 'Сообщение не найдено' }, { status: 404 });
  if (row.status !== 'failed') {
    return NextResponse.json({ success: false, error: 'Повторить можно только неотправленное сообщение' }, { status: 409 });
  }

  await prisma.outbox.update({
    where: { id },
    data: { status: 'pending', attempts: 0, nextAttemptAt: new Date(), lastError: null },
  });
  await writeAdminAudit(gate.user.id, 'outbox_retry', id, row.kind);
  return NextResponse.json({ success: true, status: 'pending' });
}
