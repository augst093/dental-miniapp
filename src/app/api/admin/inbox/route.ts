import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeAdminRequest } from '@/lib/telegramAuth';
import { isInboxStatus } from '@/lib/inbox';

// Staff: list conversations, newest first, with counts per status for the tabs and the badge
export async function GET(request: NextRequest) {
  const gate = authorizeAdminRequest(request);
  if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });

  const status = request.nextUrl.searchParams.get('status') || 'all';
  if (status !== 'all' && !isInboxStatus(status)) {
    return NextResponse.json({ success: false, error: 'Неизвестный статус' }, { status: 400 });
  }

  try {
    const [threads, groups] = await Promise.all([
      prisma.inboxThread.findMany({
        where: status === 'all' ? {} : { status },
        orderBy: { lastMessageAt: 'desc' },
        take: 100,
        include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      }),
      prisma.inboxThread.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    const counts: Record<string, number> = { new: 0, answered: 0, resolved: 0 };
    for (const g of groups) counts[g.status] = g._count._all;

    return NextResponse.json({
      success: true,
      counts,
      threads: threads.map((t) => ({
        id: t.id,
        patientName: t.patientName,
        status: t.status,
        patientUnreachable: t.patientUnreachable,
        telegramId: Number(t.telegramId),
        lastMessageAt: t.lastMessageAt,
        lastText: t.messages[0]?.text ?? '',
        lastDirection: t.messages[0]?.direction ?? null,
      })),
    });
  } catch {
    return NextResponse.json({ success: false, error: 'База недоступна, попробуйте позже' }, { status: 503 });
  }
}
