import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeAdminRequest } from '@/lib/telegramAuth';

// Staff: messages that could not be delivered (and those still waiting), so nothing fails silently
export async function GET(request: NextRequest) {
  const gate = authorizeAdminRequest(request);
  if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });

  const status = request.nextUrl.searchParams.get('status') || 'failed';
  if (status !== 'failed' && status !== 'pending') {
    return NextResponse.json({ success: false, error: 'Статус: failed или pending' }, { status: 400 });
  }

  try {
    const rows = await prisma.outbox.findMany({
      where: { status },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: { id: true, kind: true, text: true, status: true, attempts: true, lastError: true, updatedAt: true },
    });
    const total = await prisma.outbox.count({ where: { status } });
    return NextResponse.json({ success: true, total, items: rows });
  } catch {
    return NextResponse.json({ success: false, error: 'База недоступна, попробуйте позже' }, { status: 503 });
  }
}
