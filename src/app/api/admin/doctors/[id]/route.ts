import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeAdminRequest } from '@/lib/telegramAuth';
import { isDeactivation, validateDoctorInput } from '@/lib/doctorsAdmin';
import { serializeDoctor, writeAdminAudit, countFutureActiveAppointments, toDbData } from '@/lib/doctorsApi';

// Staff: edit a doctor. Deactivating a doctor with future bookings needs an explicit force flag,
// so bookings are never silently orphaned.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = authorizeAdminRequest(request);
  if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const force = body?.force === true;
  const parsed = validateDoctorInput(body, true);
  if (!parsed.ok) return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });

  try {
    const current = await prisma.doctor.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ success: false, error: 'Врач не найден' }, { status: 404 });

    if (isDeactivation(current, parsed.value)) {
      const count = await countFutureActiveAppointments(id);
      if (count > 0 && !force) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'HAS_FUTURE_APPOINTMENTS', message: `У врача ${count} будущих записей. Перенесите их или подтвердите отключение.`, count },
          },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.doctor.update({ where: { id }, data: toDbData(parsed.value) });
    await writeAdminAudit(gate.user.id, 'doctor_updated', id, `${updated.name}: ${Object.keys(parsed.value).join(', ')}`);
    return NextResponse.json({ success: true, doctor: serializeDoctor(updated) });
  } catch {
    return NextResponse.json({ success: false, error: 'Не удалось сохранить изменения' }, { status: 500 });
  }
}
