import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyTelegramUser, TG_INIT_DATA_HEADER } from '@/lib/telegramAuth';
import { checkCanChange, sortForPatient } from '@/lib/patientAppointments';
import { formatTashkentISODate } from '@/lib/timezone';

// Patient: my own appointments (signed initData only, never a Telegram id from the client)
export async function GET(request: NextRequest) {
  const user = verifyTelegramUser(request.headers.get(TG_INIT_DATA_HEADER) || '');
  if (!user) return NextResponse.json({ success: false, error: 'Нужен вход через Telegram' }, { status: 401 });

  const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const rows = await prisma.appointment.findMany({
    where: { patient: { telegramId: BigInt(user.id) }, dateTime: { gte: since } },
    select: { id: true, serviceTitle: true, doctorName: true, doctorId: true, dateTime: true, status: true, priceUzs: true },
    take: 100,
  });

  const now = new Date();
  const items = sortForPatient(rows, now).map((r) => {
    const check = checkCanChange({ telegramId: user.id, status: r.status, dateTime: r.dateTime }, user.id, now);
    return {
      id: r.id,
      serviceTitle: r.serviceTitle,
      doctorName: r.doctorName,
      doctorId: r.doctorId,
      dateTime: r.dateTime.toISOString(),
      dateStr: formatTashkentISODate(r.dateTime),
      status: r.status,
      priceUzs: r.priceUzs,
      canChange: check.ok,
      changeBlockedReason: check.ok ? null : check.error,
    };
  });
  return NextResponse.json({ success: true, appointments: items });
}
