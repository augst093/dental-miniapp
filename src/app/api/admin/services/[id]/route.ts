import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeAdminRequest } from '@/lib/telegramAuth';
import { validateServiceInput } from '@/lib/servicesAdmin';
import { writeAdminAudit } from '@/lib/doctorsApi';

// Staff: edit a service or change its order. Existing appointments keep their price snapshot,
// so a price change only affects bookings made after it.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = authorizeAdminRequest(request);
  if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });

  const { id } = await params;
  const parsed = validateServiceInput(await request.json().catch(() => null), true);
  if (!parsed.ok) return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });

  try {
    const current = await prisma.service.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ success: false, error: 'Услуга не найдена' }, { status: 404 });

    const updated = await prisma.service.update({ where: { id }, data: parsed.value });
    const changed = Object.keys(parsed.value).join(', ');
    await writeAdminAudit(gate.user.id, 'service_updated', id, `${updated.title}: ${changed}`);
    return NextResponse.json({ success: true, service: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Не удалось сохранить изменения' }, { status: 500 });
  }
}

// Staff: delete a service. A service that was ever booked is hidden instead of deleted, so history is kept.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = authorizeAdminRequest(request);
  if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });

  const { id } = await params;
  try {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return NextResponse.json({ success: false, error: 'Услуга не найдена' }, { status: 404 });

    const bookings = await prisma.appointment.count({ where: { serviceId: id } });
    if (bookings === 0) {
      await prisma.service.delete({ where: { id } });
      await writeAdminAudit(gate.user.id, 'service_deleted', id, service.title);
      return NextResponse.json({ success: true, mode: 'deleted' });
    }
    await prisma.service.update({ where: { id }, data: { isActive: false } });
    await writeAdminAudit(gate.user.id, 'service_hidden', id, service.title);
    return NextResponse.json({ success: true, mode: 'hidden' });
  } catch {
    return NextResponse.json({ success: false, error: 'Не удалось удалить услугу' }, { status: 500 });
  }
}
