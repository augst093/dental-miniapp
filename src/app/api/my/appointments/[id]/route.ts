import { NextRequest, NextResponse } from 'next/server';
import { prisma, dbRepository } from '@/lib/db';
import { verifyTelegramUser, TG_INIT_DATA_HEADER } from '@/lib/telegramAuth';
import { checkCanChange } from '@/lib/patientAppointments';
import { fromTashkentDateTime } from '@/lib/timezone';

// Patient: change my appointment. action = "reschedule" (needs dateStr, timeStr) or "cancel".
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = verifyTelegramUser(request.headers.get(TG_INIT_DATA_HEADER) || '');
  if (!user) return NextResponse.json({ success: false, error: 'Нужен вход через Telegram' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { action?: string; dateStr?: string; timeStr?: string } | null;

  const app = await prisma.appointment.findUnique({
    where: { id },
    select: { id: true, status: true, dateTime: true, patient: { select: { telegramId: true } } },
  });
  if (!app) return NextResponse.json({ success: false, error: 'Запись не найдена' }, { status: 404 });

  const check = checkCanChange(
    { telegramId: app.patient.telegramId === null ? null : Number(app.patient.telegramId), status: app.status, dateTime: app.dateTime },
    user.id
  );
  if (!check.ok) return NextResponse.json({ success: false, error: { code: check.code, message: check.error } }, { status: check.code === 'NOT_OWNER' ? 403 : 409 });

  if (body?.action === 'cancel') {
    const result = await dbRepository.updateStatus(id, 'cancelled', 'patient', String(user.id), 'Отменено пациентом в Mini App');
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    return NextResponse.json({ success: true, status: 'cancelled' });
  }

  if (body?.action === 'reschedule') {
    if (!body.dateStr || !body.timeStr || !/^\d{4}-\d{2}-\d{2}$/.test(body.dateStr) || !/^\d{2}:\d{2}$/.test(body.timeStr)) {
      return NextResponse.json({ success: false, error: 'Выберите дату и время' }, { status: 400 });
    }
    const result = await dbRepository.reschedule(id, fromTashkentDateTime(body.dateStr, body.timeStr), 'patient', String(user.id));
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    return NextResponse.json({ success: true, appointment: result.appointment });
  }

  return NextResponse.json({ success: false, error: 'Неизвестное действие' }, { status: 400 });
}
