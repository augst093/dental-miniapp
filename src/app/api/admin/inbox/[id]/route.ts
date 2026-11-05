import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeAdminRequest } from '@/lib/telegramAuth';
import { isInboxStatus } from '@/lib/inbox';
import { writeAdminAudit } from '@/lib/doctorsApi';

// Staff: read one conversation, or change its status (new / answered / resolved)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = authorizeAdminRequest(request);
  if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });
  const { id } = await params;
  const thread = await prisma.inboxThread.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: 'asc' } } } });
  if (!thread) return NextResponse.json({ success: false, error: 'Диалог не найден' }, { status: 404 });
  return NextResponse.json({
    success: true,
    thread: {
      id: thread.id,
      patientName: thread.patientName,
      status: thread.status,
      patientUnreachable: thread.patientUnreachable,
      telegramId: Number(thread.telegramId),
      messages: thread.messages.map((m) => ({
        id: m.id,
        direction: m.direction,
        text: m.text,
        deliveryStatus: m.deliveryStatus,
        createdAt: m.createdAt,
      })),
    },
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = authorizeAdminRequest(request);
  if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!isInboxStatus(body?.status)) {
    return NextResponse.json({ success: false, error: 'Статус: new, answered или resolved' }, { status: 400 });
  }
  const thread = await prisma.inboxThread.findUnique({ where: { id } });
  if (!thread) return NextResponse.json({ success: false, error: 'Диалог не найден' }, { status: 404 });
  const updated = await prisma.inboxThread.update({ where: { id }, data: { status: body.status } });
  await writeAdminAudit(gate.user.id, 'inbox_status', id, `${thread.status} -> ${updated.status}`);
  return NextResponse.json({ success: true, status: updated.status });
}
