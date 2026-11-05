import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeAdminRequest } from '@/lib/telegramAuth';
import { validateServiceInput } from '@/lib/servicesAdmin';
import { writeAdminAudit } from '@/lib/doctorsApi';

// Staff: list services (including inactive) and add a service
export async function GET(request: NextRequest) {
  const gate = authorizeAdminRequest(request);
  if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });
  try {
    const services = await prisma.service.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
    return NextResponse.json({ success: true, services });
  } catch {
    return NextResponse.json({ success: false, error: 'База недоступна, попробуйте позже' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const gate = authorizeAdminRequest(request);
  if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });

  const parsed = validateServiceInput(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });

  try {
    const v = parsed.value;
    const created = await prisma.service.create({
      data: {
        title: v.title!,
        category: v.category!,
        priceUzs: v.priceUzs!,
        durationMinutes: v.durationMinutes!,
        description: v.description ?? null,
        sortOrder: v.sortOrder ?? 0,
        isActive: v.isActive ?? true,
      },
    });
    await writeAdminAudit(gate.user.id, 'service_created', created.id, `${created.title} ${created.priceUzs} UZS`);
    return NextResponse.json({ success: true, service: created }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Не удалось сохранить услугу' }, { status: 500 });
  }
}
